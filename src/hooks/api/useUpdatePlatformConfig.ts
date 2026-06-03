import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';

/**
 * Fase 19.7 — mutation admin para editar `ecom.platform_config`.
 *
 * Backend: `POST /admin/config { key, value }`. Solo `cus_role='admin'`.
 *
 * Las keys son las columnas del seed: `ad_impression_cost`, `ad_click_cost`,
 * `ad_min_budget`. El backend valida que el value sea numérico ≥ 0 y refresca
 * su cache de 60s al actualizar (invalidatePlatformConfig).
 *
 * Al éxito invalida la query `pricingConfig` para que el form de /pauta y
 * /admin/config refresquen al instante.
 */
export interface UpdatePlatformConfigPayload {
  key: 'ad_impression_cost' | 'ad_click_cost' | 'ad_min_budget';
  value: number;
}

export interface UpdatePlatformConfigResponse {
  message: string;
  key: string;
  value: number;
}

export function useUpdatePlatformConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePlatformConfigPayload) =>
      ApiFetch.post<UpdatePlatformConfigResponse>(
        '/admin/config',
        payload as unknown as Record<string, unknown>,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pricingConfig'] });
    },
  });
}
