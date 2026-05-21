import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ApiFetch } from '@/utils/Api';
import { useAuth } from '@/utils/AuthContext';
import type { CompanyTeamResponse } from '@/types/api';

export const COMPANY_TEAM_QUERY_KEY = ['companyTeam'] as const;

/**
 * Fase 8 — equipo de la empresa del usuario: miembros (con uso/límite de
 * publicaciones) + invitaciones pendientes. POST /company-team (auth).
 */
export function useCompanyTeam() {
  const { user } = useAuth();
  return useQuery({
    queryKey: COMPANY_TEAM_QUERY_KEY,
    queryFn: () => ApiFetch.post<CompanyTeamResponse>('/company-team', {}),
    enabled: !!user,
    retry: false,
    staleTime: 30_000,
  });
}

/** Fase 8 — fijar el límite de publicaciones de un miembro (null = heredar). */
export function useSetEmployeeLimit() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, { cusId: number; limit: number | null }>({
    mutationFn: ({ cusId, limit }) =>
      ApiFetch.post<{ message: string }>('/set-employee-limit', { cusId, limit }),
    onSuccess: (data) => {
      toast.success(data.message || 'Límite actualizado');
      void queryClient.invalidateQueries({ queryKey: COMPANY_TEAM_QUERY_KEY });
    },
    onError: (err) => toast.error(err.message || 'No se pudo actualizar el límite'),
  });
}

/** Fase 8 — quitar a un miembro de la empresa. */
export function useRemoveEmployee() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, number>({
    mutationFn: (cusId) =>
      ApiFetch.post<{ message: string }>('/remove-employee', { cusId }),
    onSuccess: (data) => {
      toast.success(data.message || 'Usuario removido');
      void queryClient.invalidateQueries({ queryKey: COMPANY_TEAM_QUERY_KEY });
    },
    onError: (err) => toast.error(err.message || 'No se pudo quitar al usuario'),
  });
}

/** Fase 8 — cancelar una invitación pendiente. */
export function useCancelInvitation() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, number>({
    mutationFn: (invId) =>
      ApiFetch.post<{ message: string }>('/cancel-invitation', { invId }),
    onSuccess: (data) => {
      toast.success(data.message || 'Invitación cancelada');
      void queryClient.invalidateQueries({ queryKey: COMPANY_TEAM_QUERY_KEY });
    },
    onError: (err) => toast.error(err.message || 'No se pudo cancelar la invitación'),
  });
}
