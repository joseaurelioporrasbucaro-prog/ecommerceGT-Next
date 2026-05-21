import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { BuyerSearchRow, BuyerSearchResult } from '@/types/api';

/**
 * Fase 8 — busca usuarios existentes por nombre o correo (POST /search-buyers,
 * auth). Excluye al solicitante. Usado para agregar usuarios ya registrados a
 * una empresa sin crear cuenta nueva. Se habilita con ≥2 caracteres.
 */
export function useSearchBuyers(term: string) {
  const q = term.trim();
  return useQuery({
    queryKey: ['searchBuyers', q] as const,
    queryFn: async () => {
      const rows = await ApiFetch.post<BuyerSearchRow[]>('/search-buyers', { term: q });
      return rows.map<BuyerSearchResult>((r) => ({
        cusId: r.cus_id,
        firstName: r.cus_first_name ?? '',
        lastName: r.cus_last_name ?? '',
        email: r.cus_email_address ?? '',
      }));
    },
    enabled: q.length >= 2,
    retry: false,
    staleTime: 30_000,
  });
}
