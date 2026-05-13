import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { CheckerPublicationsResponse } from '@/types/api';

/**
 * Pregunta al backend (`POST /checkerpub`, auth) si el usuario logueado
 * todavía tiene cuota disponible en su plan para crear una publicación.
 *
 * El backend lee `customer_subscription.cussub_pubcount` vs el límite del
 * plan activo y devuelve `{ create: true | false, message }`.
 *
 * Invalidar manualmente al crear una publicación para que la siguiente
 * vista refresque el contador.
 */
export const CHECKER_PUBLICATIONS_QUERY_KEY = ['checkerPublications'] as const;

export function useCheckerPublications(enabled = true) {
  return useQuery({
    queryKey: CHECKER_PUBLICATIONS_QUERY_KEY,
    queryFn: () => ApiFetch.post<CheckerPublicationsResponse>('/checkerpub', {}),
    enabled,
    retry: false,
    staleTime: 30_000,
  });
}
