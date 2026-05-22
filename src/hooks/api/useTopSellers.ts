import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { TopSellerRow } from '@/types/api';

/**
 * Fase 9 — ranking de vendedores (Top Sellers) por score real.
 * GET /top-sellers?limit=N (pública).
 */
export function useTopSellers(limit = 10) {
  return useQuery({
    queryKey: ['topSellers', limit] as const,
    queryFn: () => ApiFetch.get<TopSellerRow[]>(`/top-sellers?limit=${limit}`),
    staleTime: 2 * 60_000,
  });
}
