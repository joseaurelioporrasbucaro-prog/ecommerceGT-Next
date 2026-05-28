import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { Campaign, CreateCampaignPayload, CampaignStatus, CampaignObjective, AnyPublicationListItem } from '@/types/api';

export const MY_CAMPAIGNS_KEY = ['myCampaigns'] as const;
export const FEATURED_KEY = ['featuredPublications'] as const;
export const AD_CREDIT_KEY = ['adCredit'] as const; // Fase 10.2

/** Fase 10 — campañas del anunciante. Refresca al enfocar y cada 30s para que
 *  las métricas (impresiones/clics/gastado) se vean casi en tiempo real. */
export function useMyCampaigns() {
  return useQuery({
    queryKey: MY_CAMPAIGNS_KEY,
    queryFn: () => ApiFetch.get<Campaign[]>('/campaigns/mine'),
    staleTime: 5_000,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });
}

/** Fase 10 — crear campaña. Fase 10.2: si useCredit, descuenta crédito del anunciante. */
export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) => ApiFetch.post<{ message: string; campId: number; creditUsed?: number }>('/campaigns', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MY_CAMPAIGNS_KEY });
      qc.invalidateQueries({ queryKey: AD_CREDIT_KEY });
    },
  });
}

/** Fase 10.2 — saldo reutilizable de pauta (se incrementa al expirar una campaña sin gastar todo). */
export function useAdCredit() {
  return useQuery({
    queryKey: AD_CREDIT_KEY,
    queryFn: () => ApiFetch.get<{ credit: number }>('/ad-credit'),
    staleTime: 5_000,
    refetchOnWindowFocus: true,
  });
}

/** Fase 10 — pausar/reanudar/finalizar campaña. */
export function useSetCampaignStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ campId, status }: { campId: number; status: CampaignStatus }) =>
      ApiFetch.post<{ message: string }>(`/campaigns/${campId}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MY_CAMPAIGNS_KEY });
      qc.invalidateQueries({ queryKey: AD_CREDIT_KEY }); // Fase 10.2: finalizar puede reembolsar
    },
  });
}

/** Publicación destacada (incluye campId para métricas de clic). */
export type FeaturedPublication = AnyPublicationListItem & { campId: number; sponsored: boolean; campObjective: CampaignObjective };

/** Fase 10 — publicaciones destacadas segmentadas para el viewer. */
export function useFeaturedPublications(limit = 8) {
  return useQuery({
    queryKey: [...FEATURED_KEY, limit] as const,
    queryFn: () => ApiFetch.get<FeaturedPublication[]>(`/featured-publications?limit=${limit}`),
    staleTime: 60_000,
  });
}

/** Registrar clic en un destacado (best-effort). */
export function recordAdClick(campId: number) {
  ApiFetch.post(`/featured/${campId}/click`, {}).catch(() => {});
}
