import { useRouter } from 'next/navigation';
import { useAuth } from '@/utils/AuthContext';

/**
 * Hook de utilidad para el flujo completo de logout:
 * llama `AuthContext.logout()` (POST /logout + limpieza local) y luego
 * navega a /login. Úsalo en cualquier componente que necesite deslogear.
 *
 * La lógica de limpieza real (POST /logout, setUser(null), invalidar React Query)
 * vive en AuthContext para que sea la única fuente de verdad del estado de sesión.
 */
export function useLogout() {
  const { logout } = useAuth();
  const router = useRouter();

  return async () => {
    await logout();
    router.push('/login');
  };
}
