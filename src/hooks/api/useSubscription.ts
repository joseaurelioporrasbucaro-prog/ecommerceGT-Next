import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ApiFetch } from '@/utils/Api';
import { useAuth } from '@/utils/AuthContext';
import type {
  Plan,
  PlanRow,
  MySubscription,
  MySubscriptionRow,
} from '@/types/api';
import { CHECKER_PUBLICATIONS_QUERY_KEY } from './useCheckerPublications';

export const PLANS_QUERY_KEY = ['plans'] as const;
export const MY_SUBSCRIPTION_QUERY_KEY = ['mySubscription'] as const;

const toNum = (v: number | string | null | undefined): number => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n as number) ? (n as number) : 0;
};

function normalizePlan(row: PlanRow): Plan {
  return {
    id: row.id,
    description: row.description,
    msg: row.msg ?? '',
    interval: row.recurrent ?? '',
    price: toNum(row.price),
    userLimit: toNum(row.users),
    pubPerUser: toNum(row.pubperuser),
  };
}

/**
 * Fase 8 — catálogo de planes/suscripciones (público).
 * POST /getplans → todas las suscripciones activas ordenadas por id.
 */
export function usePlans() {
  return useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: async () => {
      const rows = await ApiFetch.post<PlanRow[]>('/getplans', {});
      return rows.map(normalizePlan);
    },
    staleTime: 10 * 60_000,
  });
}

function normalizeMySubscription(row: MySubscriptionRow): MySubscription {
  return {
    subId: row.subid,
    description: row.description,
    interval: row.recurrent ?? '',
    price: toNum(row.price),
    userLimit: toNum(row.users),
    pubPerUser: toNum(row.pubperuser),
    pubCount: toNum(row.pubcount),
  };
}

/**
 * Fase 8 — plan actual del usuario logueado + cuota usada.
 * POST /my-subscription (auth). Solo corre si hay sesión.
 */
export function useMySubscription() {
  const { user } = useAuth();
  return useQuery({
    queryKey: MY_SUBSCRIPTION_QUERY_KEY,
    queryFn: async () => {
      const row = await ApiFetch.post<MySubscriptionRow>('/my-subscription', {});
      return normalizeMySubscription(row);
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/**
 * Fase 8 — cambiar el plan del usuario.
 * POST /change-subscription (auth) { subId }. Invalida la suscripción y el
 * checker de cuota para que la UI refleje el nuevo límite.
 */
export function useChangeSubscription() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string; subId: number }, Error, number>({
    mutationFn: (subId: number) =>
      ApiFetch.post<{ message: string; subId: number }>('/change-subscription', { subId }),
    onSuccess: (data) => {
      toast.success(data.message || 'Plan actualizado');
      void queryClient.invalidateQueries({ queryKey: MY_SUBSCRIPTION_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: CHECKER_PUBLICATIONS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'No se pudo actualizar tu plan');
    },
  });
}
