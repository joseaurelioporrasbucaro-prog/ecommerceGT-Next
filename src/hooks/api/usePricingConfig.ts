import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';

/**
 * Fase 10.7 — tarifas de pauta vigentes leídas de `ecom.platform_config`.
 *
 * El backend cachea por 60s; aquí hacemos staleTime 5 min porque cambian
 * raramente (admin las edita cuando crece el DAU). Endpoint público.
 *
 * Defaults coinciden con los seeds de migración para que el form muestre
 * estimados razonables mientras la query carga (1ra carga sin cache).
 */
export interface PricingConfig {
  adImpressionCost: number; // Q por impresión (destacar)
  adClickCost: number;      // Q por clic (mensajes)
  adMinBudget: number;      // mínimo de presupuesto por campaña
}

const DEFAULTS: PricingConfig = {
  adImpressionCost: 0.01,
  adClickCost: 0.50,
  adMinBudget: 10,
};

export function usePricingConfig(): PricingConfig {
  const q = useQuery({
    queryKey: ['pricingConfig'] as const,
    queryFn: () => ApiFetch.get<PricingConfig>('/pricing-config'),
    staleTime: 5 * 60_000,
    retry: false,
  });
  return q.data ?? DEFAULTS;
}
