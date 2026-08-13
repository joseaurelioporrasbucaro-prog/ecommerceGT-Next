import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { ApiFetch } from '@/utils/Api';
import { useAuth } from '@/utils/AuthContext';
import {
  PUBLICATION_DETAIL_QUERY_KEY,
  PUBLICATIONS_QUERY_KEY,
} from '@/hooks/api/usePublications';
import type {
  AnyPublicationListItem,
  FavoriteItem,
  PublicationDetail,
  PublicationListItemAuth,
  ToggleFavoritePayload,
  ToggleFavoriteResponse,
} from '@/types/api';

export const MY_FAVORITES_QUERY_KEY = ['myFavorites'] as const;

interface DetailSnapshot {
  queryKey: QueryKey;
  data: PublicationDetail;
}

/**
 * Snapshot de UNA entrada de caché del listado. Hay una por combinación de
 * filtros (la clave lleva el query string), así que se guardan todas.
 */
interface PublicationsSnapshot {
  queryKey: QueryKey;
  data: AnyPublicationListItem[];
}

interface FavoriteMutationContext {
  previousPublications: PublicationsSnapshot[];
  previousDetails: DetailSnapshot[];
  previousFavorites?: FavoriteItem[];
  /** Estado ANTES del clic, para que el aviso diga si se guardó o se quitó. */
  eraFavorita: boolean;
}

/**
 * Compara ids de publicación sin depender del tipo.
 *
 * Los tipos de `src/types/api.ts` declaran `pub_id`/`id` como `number`, pero el
 * backend los manda como STRING (`"14"`): `pub_id` es numeric/bigint en
 * Postgres y el driver `pg` devuelve esas columnas como texto para no perder
 * precisión. Hoy funciona de casualidad, porque todos los lados son strings;
 * en cuanto alguien pasa un número —`publication?.pub_id ?? 0` cuando el
 * detalle todavía no cargó, por ejemplo— el `===` falla en silencio y la
 * actualización optimista deja de pintar.
 */
const mismoId = (a: unknown, b: unknown) => Number(a) === Number(b);

function withToggledFavorite(
  item: AnyPublicationListItem,
  userId: number,
): PublicationListItemAuth {
  const currentFavorite = 'isFavorite' in item ? item.isFavorite : false;

  return {
    ...item,
    id_cus: 'id_cus' in item ? item.id_cus : userId,
    isFavorite: !currentFavorite,
  };
}

function toggleDetailFavorite(detail: PublicationDetail, pubId: number): PublicationDetail {
  if (!mismoId(detail.pub_id, pubId)) {
    return detail;
  }

  const nextFavorite = !detail.isFavorite;
  const nextCount = nextFavorite
    ? detail.favoritesCount + 1
    : Math.max(0, detail.favoritesCount - 1);

  return {
    ...detail,
    isFavorite: nextFavorite,
    favoritesCount: nextCount,
  };
}

export function useMyFavorites() {
  return useQuery({
    queryKey: MY_FAVORITES_QUERY_KEY,
    queryFn: () => ApiFetch.get<FavoriteItem[]>('/myfavorites'),
    retry: false,
    staleTime: 60_000,
  });
}

export function useToggleFavorite(pubId: number) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const t = useTranslations('publications');

  return useMutation<ToggleFavoriteResponse, Error, void, FavoriteMutationContext>({
    mutationFn: () => {
      if (!user) {
        const from = pathname || '/';
        router.push(`/login?from=${encodeURIComponent(from)}`);
        return Promise.reject(new Error('Debes iniciar sesión para guardar favoritos'));
      }

      const payload: ToggleFavoritePayload = { idpubli: pubId };
      return ApiFetch.post<ToggleFavoriteResponse>('/addpubl', payload);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: PUBLICATIONS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: PUBLICATION_DETAIL_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: MY_FAVORITES_QUERY_KEY });

      // El listado dejó de vivir en UNA sola entrada de caché: desde que los
      // filtros se resuelven en el backend, la clave lleva el query string
      // (`['publications', '?cityId=1000']`), así que hay una entrada por
      // combinación de filtros. Con `getQueryData(PUBLICATIONS_QUERY_KEY)` —
      // que exige coincidencia EXACTA — no encontraríamos ninguna y el
      // corazón de favoritos dejaría de pintarse al instante, sin error
      // visible. Mismo patrón que ya se usa abajo para los detalles.
      const previousPublications = queryClient
        .getQueriesData<AnyPublicationListItem[]>({ queryKey: PUBLICATIONS_QUERY_KEY })
        .flatMap(([queryKey, data]) => (data ? [{ queryKey, data }] : []));
      const previousDetails = queryClient
        .getQueriesData<PublicationDetail>({ queryKey: PUBLICATION_DETAIL_QUERY_KEY })
        .flatMap(([queryKey, data]) => (data ? [{ queryKey, data }] : []));
      const previousFavorites =
        queryClient.getQueryData<FavoriteItem[]>(MY_FAVORITES_QUERY_KEY);

      // Se lee ANTES de tocar las cachés: después de la actualización optimista
      // el estado ya está invertido y el aviso diría lo contrario de lo que pasó.
      const eraFavorita =
        previousDetails.some(
          ({ data }) => mismoId(data.pub_id, pubId) && data.isFavorite,
        ) ||
        previousPublications.some(({ data }) =>
          data.some(
            (item) => mismoId(item.id, pubId) && 'isFavorite' in item && item.isFavorite,
          ),
        );

      if (user) {
        previousPublications.forEach(({ queryKey }) => {
          queryClient.setQueryData<AnyPublicationListItem[]>(
            queryKey,
            (currentItems: AnyPublicationListItem[] | undefined) =>
              currentItems?.map((item: AnyPublicationListItem) =>
                mismoId(item.id, pubId) ? withToggledFavorite(item, user.id) : item,
              ),
          );
        });

        previousDetails.forEach(({ queryKey }) => {
          queryClient.setQueryData<PublicationDetail>(queryKey, (currentDetail: PublicationDetail | undefined) =>
            currentDetail ? toggleDetailFavorite(currentDetail, pubId) : currentDetail,
          );
        });

        queryClient.setQueryData<FavoriteItem[]>(MY_FAVORITES_QUERY_KEY, (currentFavorites: FavoriteItem[] | undefined) =>
          currentFavorites?.filter((favorite: FavoriteItem) => !mismoId(favorite.id, pubId)),
        );
      }

      return { previousPublications, previousDetails, previousFavorites, eraFavorita };
    },
    // Confirmación explícita. El corazón cambia de relleno a contorno, pero eso
    // solo se nota si uno lo está mirando: en el detalle el botón tiene texto al
    // lado y sin aviso la acción se siente como que no hizo nada.
    onSuccess: (_data, _variables, context) => {
      toast.success(context?.eraFavorita ? t('favorite.removed') : t('favorite.saved'));
    },
    onError: (_error, _variables, context) => {
      // Sin sesión no es un fallo: `mutationFn` ya mandó al login. Un toast de
      // error encima solo confunde.
      if (user) {
        toast.error(t('favorite.failed'));
      }

      if (!context) {
        return;
      }

      context.previousPublications.forEach(({ queryKey, data }) => {
        queryClient.setQueryData(queryKey, data);
      });
      queryClient.setQueryData(MY_FAVORITES_QUERY_KEY, context.previousFavorites);
      context.previousDetails.forEach(({ queryKey, data }) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: PUBLICATIONS_QUERY_KEY });
      // NO invalidamos PUBLICATION_DETAIL_QUERY_KEY: el refetch del detalle
      // disparaba un GET que (antes) incrementaba las vistas en cada like.
      // La actualización optimista ya mantiene isFavorite/favoritesCount.
      void queryClient.invalidateQueries({ queryKey: MY_FAVORITES_QUERY_KEY });
    },
  });
}
