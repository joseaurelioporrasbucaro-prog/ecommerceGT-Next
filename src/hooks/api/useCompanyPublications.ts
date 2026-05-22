import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { PublicationListItem } from '@/types/api';

/**
 * Fase 8 — publicaciones públicas de TODOS los empleados de una empresa.
 *
 * GET /company-publications/:id (pública). Devuelve el mismo shape que
 * /seller-publications, listo para reutilizar PublicationCard.
 */
export function useCompanyPublications(id: string | number | undefined) {
  return useQuery({
    queryKey: ['companyPublications', String(id)] as const,
    queryFn: () =>
      ApiFetch.get<PublicationListItem[]>(`/company-publications/${id}`),
    enabled: !!id,
    staleTime: 2 * 60_000,
  });
}
