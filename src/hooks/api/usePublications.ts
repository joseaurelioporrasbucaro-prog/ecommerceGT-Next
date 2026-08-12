import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type {
  AnyPublicationListItem,
  PublicationDetail,
  SellerInfoResponse,
  SellerInfoRow,
} from '@/types/api';

export interface SellerInfo {
  firstName: string;
  lastName: string;
  handle: string | null;
  imageUrl: string | null;
  cover: string | null;
  totalPublications: number;
  // Fase 7.2
  address: string | null;
  joinDate: string | null;
  likes: number;
  totalViews: number;
  followers: number;
  following: number;
  isFollowing: boolean;
  // Fase 7.3
  showLocation: boolean;
  department: string | null;
  municipality: string | null;
  // Fase 8 — empresa del usuario (nombre comercial + check dorado, siempre visible)
  busId: number | null;
  companyName: string | null;
  // Fase 8.1 — verificación de identidad (check azul solo si verified)
  verified: boolean;
}

export const PUBLICATIONS_QUERY_KEY = ['publications'] as const;
export const PUBLICATION_DETAIL_QUERY_KEY = ['publicationDetail'] as const;
export const SELLER_INFO_QUERY_KEY = ['sellerInfo'] as const;

function parseId(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function normalizeSellerInfo(row: SellerInfoRow | undefined): SellerInfo | null {
  if (!row) {
    return null;
  }

  const toInt = (v: string | number | null | undefined): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  return {
    firstName: row.firstname,
    lastName: row.lastname,
    handle: row.handle,
    imageUrl: row.imagenu,
    cover: row.cover ?? null,
    totalPublications: toInt(row.totalpublis),
    address: row.address ?? null,
    joinDate: row.joindate ?? null,
    likes: toInt(row.likes),
    totalViews: toInt(row.totalviews),
    followers: toInt(row.followers),
    following: toInt(row.following),
    isFollowing: Boolean(row.isfollowing),
    showLocation: Boolean(row.showlocation),
    department: row.department ?? null,
    municipality: row.municipality ?? null,
    busId: parseId(row.busid),
    companyName: row.companyname ?? null,
    verified: Boolean(row.verified),
  };
}

/**
 * Filtros que resuelve el BACKEND.
 *
 * La ubicación y la categoría van por ID de catálogo, no por nombre: comparar
 * nombres fue el bug que hacía que el departamento "Guatemala" dejara pasar
 * publicaciones de todo el país (el país se llama igual). Con IDs no hay
 * ambigüedad posible ni problemas de tildes.
 */
export interface PublicationServerFilters {
  /** Departamento (`cat_city`). */
  cityId?: number | null;
  /** Municipio (`cat_town`). */
  townId?: number | null;
  /** Categoría (`cat_publication_gender`). */
  categoryId?: number | null;
  priceMin?: string;
  priceMax?: string;
  roomsMin?: string;
  bathsMin?: string;
  sizeMin?: string;
  /** Búsqueda de texto libre. */
  q?: string;
  /** La publicación debe tener TODAS estas amenidades. */
  amenityIds?: number[];
}

/**
 * Arma el query string, omitiendo lo vacío.
 *
 * Sin filtros devuelve '' y la request queda idéntica a la de siempre — que es
 * justo lo que necesita `HeaderSearch`, que busca sobre el catálogo completo.
 */
function buildPublicationsQuery(filters?: PublicationServerFilters): string {
  if (!filters) return '';

  const params = new URLSearchParams();

  const addNumber = (key: string, value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') return;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) params.set(key, String(parsed));
  };

  addNumber('cityId', filters.cityId);
  addNumber('townId', filters.townId);
  addNumber('categoryId', filters.categoryId);
  addNumber('priceMin', filters.priceMin);
  addNumber('priceMax', filters.priceMax);
  addNumber('roomsMin', filters.roomsMin);
  addNumber('bathsMin', filters.bathsMin);
  addNumber('sizeMin', filters.sizeMin);

  const search = (filters.q ?? '').trim();
  if (search) params.set('q', search);

  if (filters.amenityIds && filters.amenityIds.length > 0) {
    // Ordenadas para que el mismo set de amenidades produzca siempre la misma
    // clave de caché, sin importar en qué orden las marcó el usuario.
    params.set(
      'amenities',
      Array.from(new Set(filters.amenityIds)).sort((a, b) => a - b).join(','),
    );
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/** Sobre paginado. El backend solo lo devuelve si se le manda `limit`. */
interface PublicationsPage {
  items: AnyPublicationListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export type PublicationSort = 'recent' | 'price-asc' | 'price-desc';

export const PUBLICATIONS_MAP_QUERY_KEY = ['publicationsMap'] as const;

/** Una fila del resumen del mapa: un municipio con su conteo. */
export interface PublicationsMapEntry {
  cityId: number;
  townId: number;
  city: string;
  town: string;
  count: number;
  minPrice: string | null;
  maxPrice: string | null;
}

/**
 * Listado con SCROLL INFINITO, paginado por cursor en el servidor.
 *
 * Es el reemplazo de descargar el catálogo entero y revelarlo de a poco: con
 * 6000 publicaciones aquello pesaba 4.5 MB y tardaba ~4 s; esto trae 24 por
 * tanda (~19 KB). El comportamiento visible es el mismo — el usuario scrollea
 * y aparecen más.
 *
 * El cursor va por `pub_id`, no por fecha: ver el comentario de ORDENES en
 * connPostgresDB.js. Sirve para no repetir ni saltear publicaciones cuando
 * alguien publica algo mientras el usuario está scrolleando.
 */
export function useInfinitePublications(
  filters?: PublicationServerFilters,
  sort: PublicationSort = 'recent',
  pageSize = 24,
) {
  const baseQuery = buildPublicationsQuery(filters);

  return useInfiniteQuery({
    // El orden entra en la clave: cambiarlo tiene que empezar de cero, no
    // continuar con el cursor del orden anterior.
    queryKey: [...PUBLICATIONS_QUERY_KEY, 'infinite', baseQuery, sort, pageSize] as const,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams(baseQuery.replace(/^\?/, ''));
      params.set('limit', String(pageSize));
      params.set('sort', sort);
      if (pageParam) params.set('cursor', pageParam);
      return ApiFetch.get<PublicationsPage>(`/publications?${params.toString()}`);
    },
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor : undefined),
    retry: false,
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });
}

/**
 * Resumen por municipio para la vista de mapa.
 *
 * El mapa no puede usar el listado paginado (24 pines de 6000 publicaciones
 * sería un mapa falso) pero tampoco necesita las publicaciones: las coordenadas
 * se derivan del nombre del municipio. Con esto pesa ~800 bytes en vez de 4.5 MB.
 */
export function usePublicationsMap(filters?: PublicationServerFilters, enabled = true) {
  const queryString = buildPublicationsQuery(filters);

  return useQuery({
    queryKey: [...PUBLICATIONS_MAP_QUERY_KEY, queryString] as const,
    queryFn: () => ApiFetch.get<PublicationsMapEntry[]>(`/publications/map${queryString}`),
    enabled,
    retry: false,
    staleTime: 60_000,
  });
}

export function usePublications(filters?: PublicationServerFilters) {
  const queryString = buildPublicationsQuery(filters);

  return useQuery({
    // El query string entra en la clave: hay una entrada de caché por
    // combinación de filtros. Ojo — quien haga updates optimistas sobre el
    // listado tiene que usar `getQueriesData`/`setQueriesData` por prefijo, no
    // `getQueryData(PUBLICATIONS_QUERY_KEY)`, que exige coincidencia exacta
    // (ver useFavorites.ts).
    queryKey: [...PUBLICATIONS_QUERY_KEY, queryString] as const,
    queryFn: () => ApiFetch.get<AnyPublicationListItem[]>(`/publications${queryString}`),
    retry: false,
    staleTime: 60_000,
    // Mantiene en pantalla el resultado anterior mientras llega el nuevo. Sin
    // esto, cada cambio de filtro vaciaría la grilla y haría parpadear la
    // página — antes el filtrado era client-side e instantáneo, y esa fluidez
    // no se debería perder por haberlo movido al servidor.
    placeholderData: (previous) => previous,
  });
}

/**
 * Fase 24 fix (2026-06-10): el detalle se identifica por SLUG o id numérico.
 * Antes usábamos parseId() que coercía a número → con un slug
 * ("edificio-HjIS30") devolvía null → la query quedaba DESHABILITADA y la
 * página no mostraba ni loading ni error ni data (solo breadcrumb + footer
 * flotando). Ahora aceptamos el identificador tal cual (string no vacío);
 * el backend resuelve slug o id indistintamente.
 */
function parsePublicationIdentifier(
  value: number | string | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str === '' ? null : str;
}

export function usePublicationDetail(id: number | string | null | undefined) {
  const identifier = parsePublicationIdentifier(id);

  return useQuery({
    queryKey: [...PUBLICATION_DETAIL_QUERY_KEY, identifier] as const,
    queryFn: () => {
      if (identifier === null) {
        return Promise.reject(new Error('Publicación inválida'));
      }

      return ApiFetch.get<PublicationDetail>(
        `/publication/${encodeURIComponent(identifier)}`,
      );
    },
    enabled: identifier !== null,
    retry: false,
    staleTime: 60_000,
  });
}

export function useSellerInfo(cusId: number | string | null | undefined) {
  const sellerId = parseId(cusId);

  return useQuery({
    queryKey: [...SELLER_INFO_QUERY_KEY, sellerId] as const,
    queryFn: async () => {
      if (sellerId === null) {
        return null;
      }

      const rows = await ApiFetch.get<SellerInfoResponse>(`/infoCustomer/${sellerId}`);
      return normalizeSellerInfo(rows[0]);
    },
    enabled: sellerId !== null,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
