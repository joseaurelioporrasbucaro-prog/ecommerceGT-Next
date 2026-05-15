import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { CreatePublicationPayload, CreatePublicationResponse } from '@/types/api';
import { MY_PUBLICATIONS_QUERY_KEY } from './useMyPublications';
import { PUBLICATIONS_QUERY_KEY } from './usePublications';

/**
 * Crea una publicación nueva con `POST /savepubl`. Las imágenes deben estar
 * ya subidas vía `POST /upload` (lo hace `DragDropSection` directamente con
 * `ApiFetch.post()` para evitar race conditions con instancias compartidas
 * de `useMutation`). Aquí solo se mandan los paths.
 *
 * Al éxito invalida `useMyPublications` (la lista del seller) y
 * `usePublications` (catálogo público) para que reflejen la nueva.
 */
export function useCreatePublication() {
  const queryClient = useQueryClient();

  return useMutation<CreatePublicationResponse, Error, CreatePublicationPayload>({
    mutationFn: (payload) =>
      ApiFetch.post<CreatePublicationResponse>('/savepubl', payload),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_PUBLICATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PUBLICATIONS_QUERY_KEY });
    },
  });
}
