import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { Comment, ToggleCommentLikeResponse } from '@/types/api';
import { PUBLICATION_COMMENTS_QUERY_KEY, parsePublicationId } from './usePublicationComments';

/**
 * Toggle like en un comentario. Un solo mutation por página:
 * el commentId viaja como variable, no como argumento del hook.
 *
 * Optimistic update: invierte `isLiked` y ajusta `likesCount` en caché
 * inmediatamente; revierte si el backend falla.
 */
export function useToggleCommentLike(pubId: number | string | null | undefined) {
  const queryClient = useQueryClient();
  const publicationId = parsePublicationId(pubId);
  const queryKey = [...PUBLICATION_COMMENTS_QUERY_KEY, publicationId] as const;

  return useMutation<
    ToggleCommentLikeResponse,
    Error,
    number,
    { previous: Comment[] | undefined }
  >({
    mutationFn: (commentId: number) =>
      ApiFetch.post<ToggleCommentLikeResponse>(`/comments/${commentId}/like`),

    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Comment[]>(queryKey);

      queryClient.setQueryData<Comment[]>(queryKey, (old: Comment[] = []) =>
        old.map((c) =>
          c.comment_id === commentId
            ? {
                ...c,
                isLiked: !c.isLiked,
                likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1,
              }
            : c,
        ),
      );

      return { previous };
    },

    onError: (_err, _commentId, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
