import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { PublicationListItem } from '@/types/api';

/**
 * Fase 7 — publicaciones públicas de un vendedor para su perfil.
 *
 * GET /seller-publications/:id  (pública). Devuelve el mismo shape que el
 * listado público de /publications, listo para reutilizar PublicationCard.
 */
export function useSellerPublications(sellerId: string | number | undefined) {
  return useQuery({
    queryKey: ['sellerPublications', String(sellerId)] as const,
    queryFn: () =>
      ApiFetch.get<PublicationListItem[]>(`/seller-publications/${sellerId}`),
    enabled: !!sellerId,
    staleTime: 2 * 60_000,
  });
}
