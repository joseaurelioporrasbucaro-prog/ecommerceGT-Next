import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import { useAuth } from '@/utils/AuthContext';
import type { CompanyInvitation, RespondInvitationResponse } from '@/types/api';
import { NOTIFICATIONS_QUERY_KEY } from './useNotifications';

export const INVITATION_QUERY_KEY = ['invitation'] as const;

/**
 * Fase 8 — detalle de una invitación a empresa por token.
 * GET /invitation/:token (auth). Usado por la pantalla /invite/[token]
 * (abierta desde la notificación o el correo).
 */
export function useInvitation(token: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...INVITATION_QUERY_KEY, token] as const,
    queryFn: () => ApiFetch.get<CompanyInvitation>(`/invitation/${token}`),
    enabled: !!token && !!user,
    retry: false,
  });
}

/**
 * Fase 8 — aceptar o rechazar una invitación.
 * POST /invitation/respond (auth) { token, accept }. Al responder, el backend
 * marca el único registro; intentar de nuevo (la otra vía) devuelve "ya
 * respondida". Invalida la invitación, la sesión (para refrescar isAdmin/bus)
 * y las notificaciones.
 */
export function useRespondInvitation(token: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation<RespondInvitationResponse, Error, boolean>({
    mutationFn: (accept: boolean) =>
      ApiFetch.post<RespondInvitationResponse>('/invitation/respond', { token, accept }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...INVITATION_QUERY_KEY, token] });
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}
