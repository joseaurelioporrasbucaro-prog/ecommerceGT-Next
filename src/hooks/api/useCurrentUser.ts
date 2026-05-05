import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { MeResponse } from '@/types/api';

/**
 * Clave canónica del caché de React Query para el usuario actual.
 * Exportada para que `AuthContext.logout()` y `useLogout` puedan
 * invalidar/remover esta query sin hardcodear el string en varios lugares.
 */
export const CURRENT_USER_QUERY_KEY = ['currentUser'] as const;

/**
 * Hook React Query sobre `GET /me`.
 *
 * Úsalo en componentes nuevos (Fase 3+) que necesiten datos del usuario
 * actual de forma reactiva. Para componentes que ya consumen `useAuth()`,
 * ese contexto sigue siendo válido y no requiere migración.
 *
 * - `retry: false` porque un 401 no se debe reintentar (la sesión expiró).
 * - `staleTime: 5min` para no golpear `/me` en cada re-render.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => ApiFetch.get<MeResponse>('/me'),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
