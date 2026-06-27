import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import { useAuth } from '@/utils/AuthContext';
import type { ReferralSummary, ReferralValidation } from '@/types/api';

export const REFERRALS_QUERY_KEY = ['referrals', 'me'] as const;

/**
 * Programa de referidos Q50 — resumen del usuario (código, link, progreso).
 * GET /referrals/me (auth). Lo usa /invite.
 */
export function useMyReferrals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: REFERRALS_QUERY_KEY,
    queryFn: () => ApiFetch.get<ReferralSummary>('/referrals/me'),
    enabled: !!user,
    staleTime: 30_000,
  });
}

/**
 * Validación pública de un código de referido (sin auth). La usa el banner de
 * /register para mostrar quién invitó. GET /referrals/validate/:code.
 */
export function useValidateReferralCode(code: string | null | undefined) {
  const normalized = code?.trim().toUpperCase() ?? '';
  return useQuery({
    queryKey: ['referrals', 'validate', normalized] as const,
    queryFn: () =>
      ApiFetch.get<ReferralValidation>(`/referrals/validate/${encodeURIComponent(normalized)}`),
    enabled: normalized.length > 0,
    staleTime: 5 * 60_000,
    retry: false,
  });
}
