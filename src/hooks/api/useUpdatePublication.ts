import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { UpdatePublicationPayload, UpdatePublicationResponse } from '@/types/api';
import { MY_PUBLICATIONS_QUERY_KEY } from './useMyPublications';
import { PUBLICATIONS_QUERY_KEY } from './usePublications';
import { PUBLICATION_EDIT_QUERY_KEY } from './usePublicationEdit';

/**
 * Edita una publicación existente con `PUT /publications/:id`. Backend valida
 * ownership (403 si no es dueño) y rechaza vendidas (409). Las imágenes deben
 * estar ya subidas — aquí se mandan los paths.
 *
 * Al éxito invalida la cache de "Mis publicaciones", catálogo público y la
 * query del propio edit form (por si vuelven al editor).
 */
export function useUpdatePublication(id: number | string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation<UpdatePublicationResponse, Error, UpdatePublicationPayload>({
    mutationFn: (payload) =>
      ApiFetch.put<UpdatePublicationResponse>(`/publications/${id}`, payload),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_PUBLICATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PUBLICATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: [...PUBLICATION_EDIT_QUERY_KEY, id] as const,
      });
    },
  });
}
