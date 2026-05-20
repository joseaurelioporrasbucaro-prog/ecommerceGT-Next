import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { SellerReviewsResponse } from '@/types/api';

/**
 * Fase 7 — obtiene las reseñas completadas de un vendedor.
 *
 * GET /seller-reviews/:sellerId  (pública, no requiere auth)
 */
export function useSellerReviews(sellerId: string | number | undefined) {
  return useQuery({
    queryKey: ['sellerReviews', String(sellerId)] as const,
    queryFn: () =>
      ApiFetch.get<SellerReviewsResponse>(`/seller-reviews/${sellerId}`),
    enabled: !!sellerId,
    staleTime: 5 * 60_000,
  });
}
