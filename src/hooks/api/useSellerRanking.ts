import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { SellerRankingItem, SellerRankingResponse } from '@/types/api';

/**
 * Fase 9.1 — ranking público estricto por rating promedio.
 * GET /sellers/ranking (pública, limit fijo 50).
 *
 * Solo vendedores con al menos una review COMPLETED.
 * Orden: AVG(rating) DESC, COUNT(reviews) DESC.
 * Usado SOLO por la página dedicada `/art-ranking`.
 *
 * ⚠️ NO confundir con `useTopSellers()` (Fase 9) que va contra
 * `/top-sellers` y rankea por score compuesto incluyendo vendedores sin
 * reviews. Ese se usa en home/sidebar/`/creators`.
 * Ver tabla comparativa en el backend (connPostgresDB.js, getTopSellers).
 */
export const SELLER_RANKING_QUERY_KEY = ['sellerRanking'] as const;

function normalizeSellerRankingItem(item: SellerRankingItem): SellerRankingItem {
  return {
    ...item,
    cusId: Number(item.cusId),
    averageRating: Number(item.averageRating),
    totalReviews: Number(item.totalReviews),
    followers: Number(item.followers),
    totalpublis: Number(item.totalpublis),
  };
}

export function useSellerRanking() {
  return useQuery({
    queryKey: SELLER_RANKING_QUERY_KEY,
    queryFn: async () => {
      const response = await ApiFetch.get<SellerRankingResponse>('/sellers/ranking');
      return {
        sellers: response.sellers.map(normalizeSellerRankingItem),
      };
    },
    retry: false,
    staleTime: 5 * 60_000,
  });
}
