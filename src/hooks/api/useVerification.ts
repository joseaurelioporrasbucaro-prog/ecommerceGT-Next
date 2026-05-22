import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type {
  RequestVerificationPayload,
  VerificationStatusResponse,
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
