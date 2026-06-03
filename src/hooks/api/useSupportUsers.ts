import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { SupportUserRow, AccountStatus } from '@/types/api';

export const SUPPORT_USERS_KEY = ['supportUsers'] as const;

/** Fase 8.3 — lista/busca usuarios para soporte (search + estado). */
export function useSupportUsers(search: string, status: '' | AccountStatus) {
  return useQuery({
    queryKey: [...SUPPORT_USERS_KEY, search, status] as const,
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const qs = params.toString();
      return ApiFetch.get<SupportUserRow[]>(`/support/users${qs ? `?${qs}` : ''}`);
    },
    staleTime: 15_000,
  });
}

/** Fase 8.3 — suspender/banear un usuario. */
export function useBanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cusId, status, reason, days }: { cusId: number; status: 'suspended' | 'banned'; reason: string; days?: number }) =>
      ApiFetch.post<{ message: string }>(`/support/users/${cusId}/ban`, { status, reason, days }),
    onSuccess: () => qc.invalidateQueries({ queryKey: SUPPORT_USERS_KEY }),
  });
}

/** Fase 8.3 — reactivar (quitar sanción) a un usuario. */
export function useUnbanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cusId: number) => ApiFetch.post<{ message: string }>(`/support/users/${cusId}/unban`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: SUPPORT_USERS_KEY }),
  });
}

/** Fase 8.3.3 — levantar bloqueo por intentos fallidos de contraseña. */
export function useUnlockPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cusId: number) =>
      ApiFetch.post<{ message: string }>(`/support/users/${cusId}/unlock-password`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: SUPPORT_USERS_KEY }),
  });
}
