import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { ApiFetch } from '@/utils/Api';
import type { CloseSalePayload } from '@/types/api';

/**
 * Fase 7 — cierra una venta: cambia la publicación a estado "Vendida" (pubsta_id=3),
 * genera un token de encuesta y envía el email al comprador.
 *
 * POST /close-sale  (requiere auth)
 */
export function useCloseSale() {
  const queryClient = useQueryClient();
  const locale = useLocale();

  return useMutation({
    mutationFn: (payload: CloseSalePayload) =>
      ApiFetch.post<{ message: string }>('/close-sale', { ...payload, locale }),
    onSuccess: () => {
      // Invalida la lista de mis publicaciones para que refleje el nuevo estado "Vendida"
      queryClient.invalidateQueries({ queryKey: ['myPublications'] });
    },
  });
}
