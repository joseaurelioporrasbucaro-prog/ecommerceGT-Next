import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { SellerRankingItem, SellerRankingResponse } from '@/types/api';

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
