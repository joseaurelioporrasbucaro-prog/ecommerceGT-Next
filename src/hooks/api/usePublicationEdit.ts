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
    // 5 min de stale time + sin refetch en window focus — evita que mientras
    // el usuario edita el form, react-query haga refetch y pise sus cambios
    // a través del enableReinitialize de formik.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
