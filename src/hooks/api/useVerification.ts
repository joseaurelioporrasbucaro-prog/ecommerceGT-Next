import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type {
  RequestVerificationPayload,
  VerificationStatusResponse,
  VerificationRequestRow,
} from '@/types/api';

export const VERIFICATION_STATUS_KEY = ['verificationStatus'] as const;

/** Fase 8.1 — estado de verificación del usuario (personal + empresa si es admin). */
export function useVerificationStatus() {
  return useQuery({
    queryKey: VERIFICATION_STATUS_KEY,
    queryFn: () => ApiFetch.get<VerificationStatusResponse>('/verification/status'),
    staleTime: 60_000,
  });
}

/** Fase 8.1 — enviar solicitud de verificación (DPI personal / NIT empresa). */
export function useRequestVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RequestVerificationPayload) =>
      ApiFetch.post<{ message: string; status: string }>('/verification/request', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VERIFICATION_STATUS_KEY });
    },
  });
}

export const VERIFICATION_REQUESTS_KEY = ['verificationRequests'] as const;

/** Fase 8.2 — solicitudes de verificación para soporte (por estado). */
export function useVerificationRequests(status: 'pending' | 'verified' | 'rejected' = 'pending') {
  return useQuery({
    queryKey: [...VERIFICATION_REQUESTS_KEY, status] as const,
    queryFn: () =>
      ApiFetch.get<VerificationRequestRow[]>(`/verification/requests?status=${status}`),
    staleTime: 30_000,
  });
}

/** Fase 8.2 — aprobar/rechazar una solicitud (soporte). */
export function useResolveVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ verId, action, reason }: { verId: number; action: 'approve' | 'reject'; reason?: string }) =>
      ApiFetch.post<{ message: string }>(
        `/verification/${verId}/${action}`,
        action === 'reject' ? { reason } : {},
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VERIFICATION_REQUESTS_KEY });
    },
  });
}
