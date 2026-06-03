import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ApiFetch } from '@/utils/Api';
import { useAuth } from '@/utils/AuthContext';

/**
 * Fase 11 — métodos de pago del usuario logueado.
 *
 * STUB de pasarela: hoy los datos se mandan tal como los carga el usuario
 * en el form (con un providerToken mock que generamos en cliente). Cuando
 * llegue Fase 11.2 (integración con Recurrente/NeoNet/Stripe), el provider
 * SDK reemplaza el form y devuelve un token tokenizado real — el backend
 * NO necesita cambios, solo cambia `providerToken` y `provider`.
 *
 * Endpoints consumidos:
 *  - GET    /payment-methods
 *  - POST   /payment-methods
 *  - DELETE /payment-methods/:id (soft)
 *  - POST   /payment-methods/:id/default
 */

export type PaymentMethodType = 'card' | 'transfer' | 'wallet';

export interface PaymentMethod {
  id: number;
  type: PaymentMethodType;
  label: string | null;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  holderName: string | null;
  bankName: string | null;
  accountType: string | null; // 'ahorro' | 'monetario'
  walletHandle: string | null;
  provider: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface AddPaymentMethodPayload {
  type: PaymentMethodType;
  label?: string;
  // Card
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  holderName?: string;
  // Transfer
  bankName?: string;
  accountType?: 'ahorro' | 'monetario';
  // Wallet
  walletHandle?: string;
  // Stub: cliente genera UUID temporal hasta integrar pasarela real.
  providerToken?: string;
  provider?: string;
  makeDefault?: boolean;
}

export const PAYMENT_METHODS_QUERY_KEY = ['paymentMethods'] as const;

export function usePaymentMethods() {
  const { user } = useAuth();
  return useQuery({
    queryKey: PAYMENT_METHODS_QUERY_KEY,
    queryFn: () => ApiFetch.get<PaymentMethod[]>('/payment-methods'),
    enabled: !!user,
    staleTime: 60_000,
  });
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string; paymentMethod: PaymentMethod },
    Error,
    AddPaymentMethodPayload
  >({
    mutationFn: (payload) =>
      ApiFetch.post('/payment-methods', payload as unknown as Record<string, unknown>),
    onSuccess: (data) => {
      toast.success(data.message || 'Método de pago agregado.');
      void queryClient.invalidateQueries({ queryKey: PAYMENT_METHODS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'No se pudo agregar el método de pago.');
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) =>
      ApiFetch.delete<{ message: string }>(`/payment-methods/${id}`),
    onSuccess: (data) => {
      toast.success(data.message || 'Método de pago eliminado.');
      void queryClient.invalidateQueries({ queryKey: PAYMENT_METHODS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'No se pudo eliminar el método de pago.');
    },
  });
}

export function useSetPaymentMethodDefault() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) =>
      ApiFetch.post<{ message: string }>(`/payment-methods/${id}/default`, {}),
    onSuccess: (data) => {
      toast.success(data.message || 'Predeterminado actualizado.');
      void queryClient.invalidateQueries({ queryKey: PAYMENT_METHODS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'No se pudo cambiar el predeterminado.');
    },
  });
}
