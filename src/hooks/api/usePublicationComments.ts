import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { AddCommentPayload, AddCommentResponse, Comment } from '@/types/api';

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

export function useAddComment(pubId: number | string | null | undefined) {
  const publicationId = parsePublicationId(pubId);
  const queryClient = useQueryClient();

  return useMutation<AddCommentResponse, Error, Omit<AddCommentPayload, 'pub_id'>>({
    mutationFn: (payload) => {
      if (publicationId === null) {
        return Promise.reject(new Error('Publicación inválida'));
      }

      return ApiFetch.post<AddCommentResponse>('/addcomment', {
        pub_id: publicationId,
        content: payload.content,
        parent_id: payload.parent_id ?? null,
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: [...PUBLICATION_COMMENTS_QUERY_KEY, publicationId] as const,
      });
    },
  });
}
