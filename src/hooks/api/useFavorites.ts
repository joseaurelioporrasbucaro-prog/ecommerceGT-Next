import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
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

interface FavoriteMutationContext {
  previousPublications?: AnyPublicationListItem[];
  previousDetails: DetailSnapshot[];
  previousFavorites?: FavoriteItem[];
}

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
  if (detail.pub_id !== pubId) {
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

      const previousPublications =
        queryClient.getQueryData<AnyPublicationListItem[]>(PUBLICATIONS_QUERY_KEY);
      const previousDetails = queryClient
        .getQueriesData<PublicationDetail>({ queryKey: PUBLICATION_DETAIL_QUERY_KEY })
        .flatMap(([queryKey, data]) => (data ? [{ queryKey, data }] : []));
      const previousFavorites =
        queryClient.getQueryData<FavoriteItem[]>(MY_FAVORITES_QUERY_KEY);

      if (user) {
        queryClient.setQueryData<AnyPublicationListItem[]>(
          PUBLICATIONS_QUERY_KEY,
          (currentItems) =>
            currentItems?.map((item) =>
              item.id === pubId ? withToggledFavorite(item, user.id) : item,
            ),
        );

        previousDetails.forEach(({ queryKey }) => {
          queryClient.setQueryData<PublicationDetail>(queryKey, (currentDetail) =>
            currentDetail ? toggleDetailFavorite(currentDetail, pubId) : currentDetail,
          );
        });

        queryClient.setQueryData<FavoriteItem[]>(MY_FAVORITES_QUERY_KEY, (currentFavorites) =>
          currentFavorites?.filter((favorite) => favorite.id !== pubId),
        );
      }

      return { previousPublications, previousDetails, previousFavorites };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(PUBLICATIONS_QUERY_KEY, context.previousPublications);
      queryClient.setQueryData(MY_FAVORITES_QUERY_KEY, context.previousFavorites);
      context.previousDetails.forEach(({ queryKey, data }) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: PUBLICATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PUBLICATION_DETAIL_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: MY_FAVORITES_QUERY_KEY });
    },
  });
}
