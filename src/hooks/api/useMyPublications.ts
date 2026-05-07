import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { MyPublicationItem } from '@/types/api';

export const MY_PUBLICATIONS_QUERY_KEY = ['myPublications'] as const;

export function useMyPublications(cusId: number | null | undefined) {
  return useQuery({
    queryKey: [...MY_PUBLICATIONS_QUERY_KEY, cusId] as const,
    queryFn: () => {
      if (!cusId) {
        return Promise.reject(new Error('Usuario inválido'));
      }

      return ApiFetch.get<MyPublicationItem[]>(`/my-publications/${cusId}`);
    },
    enabled: Boolean(cusId),
    retry: false,
    staleTime: 60_000,
  });
}
