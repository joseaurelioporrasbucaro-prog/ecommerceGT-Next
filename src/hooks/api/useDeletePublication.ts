import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { DeletePublicationResponse, MyPublicationItem } from '@/types/api';
import { MY_PUBLICATIONS_QUERY_KEY } from './useMyPublications';

const PUBSTA_VOID = 4;

/**
 * Soft-delete de una publicación propia. Optimistic update sobre la cache
 * de `useMyPublications`: cambia `pubsta_id` a 4 (Anulada) inmediatamente
 * para que el badge "Anulada" y el estado deshabilitado del botón aparezcan
 * sin esperar al backend. Rollback si la mutation falla.
 */
export function useDeletePublication(cusId: number | null | undefined) {
  const queryClient = useQueryClient();
  const queryKey = [...MY_PUBLICATIONS_QUERY_KEY, cusId] as const;

  return useMutation<
    DeletePublicationResponse,
    Error,
    number,
    { previous: MyPublicationItem[] | undefined }
  >({
    mutationFn: (pubId: number) =>
      ApiFetch.delete<DeletePublicationResponse>(`/publications/${pubId}`),

    onMutate: async (pubId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MyPublicationItem[]>(queryKey);

      queryClient.setQueryData<MyPublicationItem[]>(queryKey, (old: MyPublicationItem[] = []) =>
        old.map((p) =>
          p.pub_id === pubId ? { ...p, pubsta_id: PUBSTA_VOID } : p,
        ),
      );

      return { previous };
    },

    onError: (_err, _pubId, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
