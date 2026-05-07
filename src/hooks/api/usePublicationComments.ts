import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { Comment } from '@/types/api';

export const PUBLICATION_COMMENTS_QUERY_KEY = ['publicationComments'] as const;

function parsePublicationId(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

export function usePublicationComments(pubId: number | string | null | undefined) {
  const publicationId = parsePublicationId(pubId);

  return useQuery({
    queryKey: [...PUBLICATION_COMMENTS_QUERY_KEY, publicationId] as const,
    queryFn: () => {
      if (publicationId === null) {
        return Promise.resolve<Comment[]>([]);
      }

      return ApiFetch.get<Comment[]>(`/comments/${publicationId}`);
    },
    enabled: publicationId !== null,
    retry: false,
    staleTime: 60_000,
  });
}
