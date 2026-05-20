import { useMutation } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { SubmitSurveyPayload } from '@/types/api';

/**
 * Fase 7 — el comprador envía su calificación al vendedor.
 * No requiere autenticación: se valida con el token JWT del email.
 *
 * POST /submit-survey
 */
export function useSubmitSurvey() {
  return useMutation({
    mutationFn: (payload: SubmitSurveyPayload) =>
      ApiFetch.post<{ message: string }>('/submit-survey', payload),
  });
}
