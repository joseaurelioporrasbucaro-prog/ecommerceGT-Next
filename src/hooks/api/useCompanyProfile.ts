import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { CompanyProfileResponse } from '@/types/api';

/**
 * Fase 8 — perfil PÚBLICO de una empresa (estilo creator-profile).
 * GET /company-profile/:id. Incluye empleados solo si la empresa lo activó.
 */
export function useCompanyProfile(id: string | number | undefined) {
  return useQuery({
    queryKey: ['companyProfile', String(id)] as const,
    queryFn: () => ApiFetch.get<CompanyProfileResponse>(`/company-profile/${id}`),
    enabled: !!id,
    retry: false,
    staleTime: 2 * 60_000,
  });
}
