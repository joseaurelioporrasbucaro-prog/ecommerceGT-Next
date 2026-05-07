import { useQuery } from '@tanstack/react-query';
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
  totalPublications: number;
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

  const totalPublications = Number(row.totalpublis);

  return {
    firstName: row.firstname,
    lastName: row.lastname,
    handle: row.handle,
    imageUrl: row.imagenu,
    totalPublications: Number.isFinite(totalPublications) ? totalPublications : 0,
  };
}

export function usePublications() {
  return useQuery({
    queryKey: PUBLICATIONS_QUERY_KEY,
    queryFn: () => ApiFetch.get<AnyPublicationListItem[]>('/publications'),
    retry: false,
    staleTime: 60_000,
  });
}

export function usePublicationDetail(id: number | string | null | undefined) {
  const publicationId = parseId(id);

  return useQuery({
    queryKey: [...PUBLICATION_DETAIL_QUERY_KEY, publicationId] as const,
    queryFn: () => {
      if (publicationId === null) {
        return Promise.reject(new Error('Publicación inválida'));
      }

      return ApiFetch.get<PublicationDetail>(`/publication/${publicationId}`);
    },
    enabled: publicationId !== null,
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
