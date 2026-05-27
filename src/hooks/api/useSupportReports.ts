import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { SupportReportRow, ReportType, MessageContextResponse } from '@/types/api';

export const SUPPORT_REPORTS_KEY = ['supportReports'] as const;

/** Fase 8.4 — bandeja de denuncias para soporte (por estado). */
export function useSupportReports(status: 'pending' | 'resolved' | 'dismissed' = 'pending') {
  return useQuery({
    queryKey: [...SUPPORT_REPORTS_KEY, status] as const,
    queryFn: () => ApiFetch.get<SupportReportRow[]>(`/support/reports?status=${status}`),
    staleTime: 20_000,
  });
}

/** Fase 8.4 — contexto de conversación de un mensaje denunciado (solo soporte). */
export function useMessageContext(messageId: number | null) {
  return useQuery({
    queryKey: ['messageContext', messageId] as const,
    queryFn: () => ApiFetch.get<MessageContextResponse>(`/support/message-context/${messageId}`),
    enabled: messageId != null,
    staleTime: 10_000,
  });
}

/** Fase 8.4 — resolver una denuncia: descartar o eliminar el contenido. */
export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { type: ReportType; reportId: number; contentId: number; action: 'dismiss' | 'delete' }) =>
      ApiFetch.post<{ message: string }>('/support/reports/resolve', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SUPPORT_REPORTS_KEY }),
  });
}
