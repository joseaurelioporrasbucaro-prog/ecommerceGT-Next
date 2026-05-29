import { useMutation } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';

/**
 * Fase 11 — borrado lógico (GDPR-light) de la cuenta del usuario logueado.
 *
 * `POST /account/delete` requiere la contraseña actual. Al éxito:
 *  - Anonimiza PII en `customer`.
 *  - Anula publicaciones del usuario (pubsta_id = 4).
 *  - Finaliza campañas activas/pausadas SIN reembolso (el crédito se pierde
 *    por política de T&C; ver MIGRATION.md Fase 10.2).
 *  - Marca `cus_account_status = 'deleted'` (bloquea login).
 *  - Limpia la cookie de sesión.
 *
 * El frontend debe redirigir a `/` y limpiar el AuthContext después del éxito.
 */
type DeleteAccountPayload = {
  password: string;
};

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (payload: DeleteAccountPayload) =>
      ApiFetch.post<{ message: string }>('/account/delete', payload),
  });
}
