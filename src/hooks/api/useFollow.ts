import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { ApiFetch } from '@/utils/Api';
import { useAuth } from '@/utils/AuthContext';
import { SELLER_INFO_QUERY_KEY, type SellerInfo } from '@/hooks/api/usePublications';

interface FollowContext {
  previous?: SellerInfo | null;
}

/**
 * Fase 7.2 — seguir / dejar de seguir a un vendedor con actualización optimista.
 * POST /follow/:id  |  DELETE /follow/:id  (ambos requieren sesión).
 *
 * Actualiza el cache de `useSellerInfo` (['sellerInfo', sellerId]) al instante:
 * alterna `isFollowing` y ajusta `followers` ±1.
 */
export function useToggleFollow(sellerId: number) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const queryKey = [...SELLER_INFO_QUERY_KEY, sellerId] as const;

  return useMutation<{ following: boolean }, Error, void, FollowContext>({
    mutationFn: () => {
      if (!user) {
        const from = pathname || '/';
        router.push(`/login?from=${encodeURIComponent(from)}`);
        return Promise.reject(new Error('Debes iniciar sesión para seguir usuarios'));
      }
      const current = queryClient.getQueryData<SellerInfo | null>(queryKey);
      const isFollowing = current?.isFollowing ?? false;
      return isFollowing
        ? ApiFetch.delete<{ following: boolean }>(`/follow/${sellerId}`)
        : ApiFetch.post<{ following: boolean }>(`/follow/${sellerId}`, {});
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<SellerInfo | null>(queryKey);

      queryClient.setQueryData<SellerInfo | null>(queryKey, (curr) => {
        if (!curr) return curr;
        const willFollow = !curr.isFollowing;
        return {
          ...curr,
          isFollowing: willFollow,
          followers: Math.max(0, curr.followers + (willFollow ? 1 : -1)),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context && 'previous' in context) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
