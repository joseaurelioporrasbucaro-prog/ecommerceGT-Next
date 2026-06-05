"use client";
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiFetch } from './Api';
import type { AuthUser, MeResponse } from '@/types/api';
import { CURRENT_USER_QUERY_KEY } from '@/hooks/api/useCurrentUser';

/**
 * Nota de arquitectura (transitoria):
 * El estado del usuario actual vive en DOS lugares:
 *   1. `AuthContext` (useState) — consumido por todos los componentes actuales.
 *   2. React Query cache (`CURRENT_USER_QUERY_KEY`) — para componentes nuevos de Fase 3+.
 *
 * Al hacer logout() ambos se limpian. En una fase futura se unificará para que
 * AuthContext consuma directamente React Query en lugar de su propio useState.
 */

interface AuthContextType {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  loading: boolean;
  checkAuth: () => Promise<void>;
  /** Llama POST /logout, limpia el estado local y el caché de React Query. */
  logout: () => Promise<void>;
  userForgot: unknown;
  setUserForgot: React.Dispatch<React.SetStateAction<unknown>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userForgot, setUserForgot] = useState<unknown>(null);
  const queryClient = useQueryClient();

  const checkAuth = async () => {
    try {
      const res = await ApiFetch.get<MeResponse>('/me');
      if (res.user) {
        setUser(res.user);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout completo:
   * 1. Llama POST /logout para que el backend destruya la cookie httpOnly.
   * 2. Limpia el usuario en el estado local.
   * 3. Elimina la query de React Query para que el próximo useCurrentUser()
   *    haga un fetch fresco en lugar de devolver datos stale.
   *
   * La redirección es responsabilidad del llamador (useLogout, HeaderOne).
   */
  const logout = async () => {
    try {
      await ApiFetch.post<{ message?: string }>('/logout');
    } catch {
      // Si el backend falla (ej. sesión ya expirada), igual limpiamos localmente.
    }
    setUser(null);
    queryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, checkAuth, logout, userForgot, setUserForgot }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
