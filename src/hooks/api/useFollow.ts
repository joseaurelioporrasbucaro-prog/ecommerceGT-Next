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

  // La variable `currentlyFollowing` se pasa explícitamente al llamar a mutate()
  // capturada al hacer clic. NO se lee del cache dentro de mutationFn, porque
  // onMutate corre ANTES y ya habría alternado isFollowing → mutationFn vería el
  // valor invertido y haría la acción contraria (POST vs DELETE).
  return useMutation<{ following: boolean }, Error, boolean, FollowContext>({
    mutationFn: (currentlyFollowing: boolean) => {
      if (!user) {
        const from = pathname || '/';
        router.push(`/login?from=${encodeURIComponent(from)}`);
        return Promise.reject(new Error('Debes iniciar sesión para seguir usuarios'));
      }
      return currentlyFollowing
        ? ApiFetch.delete<{ following: boolean }>(`/follow/${sellerId}`)
        : ApiFetch.post<{ following: boolean }>(`/follow/${sellerId}`, {});
    },
    onMutate: async (currentlyFollowing) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<SellerInfo | null>(queryKey);

      const willFollow = !currentlyFollowing;
      queryClient.setQueryData<SellerInfo | null>(queryKey, (curr: SellerInfo | null | undefined) => {
        if (!curr) return curr;
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
    onSuccess: (data) => {
      // Reconcilia con la verdad del servidor. Si el update optimista ya dejó
      // isFollowing == data.following, no hace nada (evita doble conteo).
      // Si por algún motivo no aplicó, lo corrige aquí.
      queryClient.setQueryData<SellerInfo | null>(queryKey, (curr: SellerInfo | null | undefined) => {
        if (!curr || curr.isFollowing === data.following) return curr;
        return {
          ...curr,
          isFollowing: data.following,
          followers: Math.max(0, curr.followers + (data.following ? 1 : -1)),
        };
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
