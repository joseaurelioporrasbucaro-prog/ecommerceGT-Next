import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { PublicationEditData } from '@/types/api';

export const PUBLICATION_EDIT_QUERY_KEY = ['publicationEdit'] as const;

/**
 * Carga los datos para editar una publicación. El backend valida ownership
 * (devuelve 403 si el usuario logueado no es el dueño).
 *
 * Devuelve los campos del form + la lista actual de imágenes para precargar
 * el dropzone.
 */
export function usePublicationEdit(id: number | string | null | undefined) {
  return useQuery({
    queryKey: [...PUBLICATION_EDIT_QUERY_KEY, id] as const,
    queryFn: () => {
      if (!id) return Promise.reject(new Error('ID de publicación inválido'));
      return ApiFetch.get<PublicationEditData>(`/publication/edit/${id}`);
    },
    enabled: Boolean(id),
    retry: false,
    // No cachear mucho — siempre traer la versión más fresca al editar.
    staleTime: 0,
  });
}
