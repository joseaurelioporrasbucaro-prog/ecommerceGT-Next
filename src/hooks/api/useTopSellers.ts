import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { TopSellerRow } from '@/types/api';

/**
 * Fase 9 — ranking de vendedores (Top Sellers) por score compuesto.
 * GET /top-sellers?limit=N (pública).
 *
 * Score = followers*2 + reviews*5 + rating*10 + views*0.05.
 * Incluye TODOS los vendedores con publicaciones (aunque tengan 0 reviews).
 * Usado en: home (`TopSellersShowcase`), sidebar, `/creators`.
 *
 * ⚠️ NO confundir con `useSellerRanking()` (Fase 9.1) que va contra
 * `/sellers/ranking` y rankea solo por rating puro entre vendedores con
 * reviews completados. Ese se usa SOLO en la página `/art-ranking`.
 * Ver tabla comparativa en el backend (connPostgresDB.js, getTopSellers).
 */
export function useTopSellers(limit = 10) {
  return useQuery({
    queryKey: ['topSellers', limit] as const,
    queryFn: () => ApiFetch.get<TopSellerRow[]>(`/top-sellers?limit=${limit}`),
    staleTime: 2 * 60_000,
  });
}
