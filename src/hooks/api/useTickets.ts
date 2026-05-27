import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type {
  MyTicketRow,
  TicketDetailResponse,
  SupportTicketRow,
  SupportAgent,
  TicketStatus,
} from '@/types/api';

export const MY_TICKETS_KEY = ['myTickets'] as const;
export const SUPPORT_TICKETS_KEY = ['supportTickets'] as const;
const ticketKey = (id: number | string) => ['ticket', String(id)] as const;

/** Mis tickets (usuario). */
export function useMyTickets() {
  return useQuery({ queryKey: MY_TICKETS_KEY, queryFn: () => ApiFetch.get<MyTicketRow[]>('/tickets/mine'), staleTime: 15_000 });
}

/** Detalle + hilo de un ticket (dueño o soporte). */
export function useTicket(id: number | string | null) {
  return useQuery({
    queryKey: ticketKey(id ?? 'none'),
    queryFn: () => ApiFetch.get<TicketDetailResponse>(`/tickets/${id}`),
    enabled: id != null,
    staleTime: 5_000,
  });
}

/** Crear ticket. */
export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { subject: string; category: string; body: string }) =>
      ApiFetch.post<{ message: string; ticketId: number }>('/tickets', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: MY_TICKETS_KEY }),
  });
}

/** Responder un ticket (dueño o soporte; isInternal solo soporte). */
export function useReplyTicket(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { body: string; isInternal?: boolean }) =>
      ApiFetch.post<{ message: string }>(`/tickets/${id}/messages`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketKey(id) });
      qc.invalidateQueries({ queryKey: MY_TICKETS_KEY });
      qc.invalidateQueries({ queryKey: SUPPORT_TICKETS_KEY });
    },
  });
}

// ── Soporte ──
export function useSupportTickets(status: '' | TicketStatus, assignee: string) {
  return useQuery({
    queryKey: [...SUPPORT_TICKETS_KEY, status, assignee] as const,
    queryFn: () => {
      const p = new URLSearchParams();
      if (status) p.set('status', status);
      if (assignee) p.set('assignee', assignee);
      const qs = p.toString();
      return ApiFetch.get<SupportTicketRow[]>(`/support/tickets${qs ? `?${qs}` : ''}`);
    },
    staleTime: 15_000,
  });
}

export function useSupportAgents() {
  return useQuery({ queryKey: ['supportAgents'], queryFn: () => ApiFetch.get<SupportAgent[]>('/support/agents'), staleTime: 60_000 });
}

export function useAssignTicket(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assigneeId: number) => ApiFetch.post<{ message: string }>(`/support/tickets/${id}/assign`, { assigneeId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketKey(id) });
      qc.invalidateQueries({ queryKey: SUPPORT_TICKETS_KEY });
    },
  });
}

export function useSetTicketStatus(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: TicketStatus) => ApiFetch.post<{ message: string }>(`/support/tickets/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketKey(id) });
      qc.invalidateQueries({ queryKey: SUPPORT_TICKETS_KEY });
    },
  });
}
