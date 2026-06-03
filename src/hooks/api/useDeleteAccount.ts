import { useMutation } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';

/**
 * Fase 12.1 — solicitar eliminación con 30 días de gracia.
 *
 * `POST /account/delete` requiere la contraseña actual. Al éxito:
 *  - Cambia `cus_account_status = 'pending_deletion'`.
 *  - Programa `cus_deletion_scheduled_at = now() + 30 días`.
 *  - PAUSA publicaciones (pubsta_id=5 'pending_deletion_paused') para que
 *    dejen de aparecer pero puedan restaurarse si el usuario regresa.
 *  - PAUSA campañas activas (el crédito se pierde si llega el plazo).
 *  - Limpia la cookie de sesión.
 *
 * Si el usuario inicia sesión dentro de los 30 días, el backend CANCELA
 * automáticamente la eliminación, restaura sus publicaciones a activas y
 * lo loguea normalmente. Pasado el plazo, el cleanup lazy del backend
 * anonimiza la PII de forma definitiva (status='deleted') — desde ese
 * momento no es recuperable y debe crear cuenta nueva.
 *
 * Diferencia con `useDeactivateAccount`:
 *  - delete     → countdown de 30 días, luego anonimización irreversible.
 *  - deactivate → pausa simple del status, sin countdown, recuperable siempre.
 *
 * El frontend debe redirigir a `/` y limpiar el AuthContext después del éxito.
 */
type DeleteAccountPayload = {
  password: string;
};

type DeleteAccountResponse = {
  message: string;
  gracePeriodDays?: number;
};

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (payload: DeleteAccountPayload) =>
      ApiFetch.post<DeleteAccountResponse>('/account/delete', payload),
  });
}
