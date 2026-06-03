import { useMutation } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';

/**
 * Fase 12.1 — desactivación de cuenta (recuperable siempre).
 *
 * `POST /account/deactivate` requiere la contraseña actual. Al éxito:
 *  - Cambia `cus_account_status = 'inactive'`.
 *  - NO anonimiza ningún dato.
 *  - NO anula publicaciones ni finaliza campañas.
 *  - Limpia la cookie de sesión.
 *
 * El usuario puede regresar haciendo login normal cuando quiera; el backend
 * detecta `inactive` y reactiva automáticamente. Ideal para quien necesita
 * "tomar un descanso" sin perder nada.
 *
 * Diferencia con `useDeleteAccount` (Fase 12.1):
 *  - delete  → status='pending_deletion', countdown de 30 días, después
 *              anonimiza definitivamente.
 *  - deactivate → status='inactive', sin countdown, recuperable siempre.
 */
type DeactivateAccountPayload = {
  password: string;
};

export function useDeactivateAccount() {
  return useMutation({
    mutationFn: (payload: DeactivateAccountPayload) =>
      ApiFetch.post<{ message: string }>('/account/deactivate', payload),
  });
}
