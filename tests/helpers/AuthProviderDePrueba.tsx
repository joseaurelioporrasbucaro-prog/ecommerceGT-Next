// Codigo Aurelio - evita que los tests dependan de una cookie o de GET /me.
import React, { createContext, useContext, useState } from 'react';
import type { AuthUser } from '@/types/api';

interface AuthDePrueba {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  userForgot: unknown;
  setUserForgot: React.Dispatch<React.SetStateAction<unknown>>;
}

interface AuthProviderDePruebaProps {
  children: React.ReactNode;
  user?: AuthUser | null;
}

const AuthContextDePrueba = createContext<AuthDePrueba | undefined>(undefined);

export function AuthProviderDePrueba({ children, user: initialUser = null }: AuthProviderDePruebaProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [userForgot, setUserForgot] = useState<unknown>(null);

  const checkAuth = async () => Promise.resolve();
  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContextDePrueba.Provider
      value={{
        user,
        setUser,
        loading: false,
        checkAuth,
        logout,
        userForgot,
        setUserForgot,
      }}
    >
      {children}
    </AuthContextDePrueba.Provider>
  );
}

export function useAuthDePrueba() {
  const context = useContext(AuthContextDePrueba);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}

export function crearUsuarioDePrueba(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    firstName: 'Aurelio',
    lastName: 'Prueba',
    email: 'aurelio@test.com',
    handle: 'aurelio',
    handleChangesCount: 0,
    address: null,
    phone: null,
    birthday: null,
    genid: null,
    lang: 'es',
    isAdmin: false,
    imagenu: null,
    cover: null,
    citId: null,
    towId: null,
    showLocation: false,
    verified: false,
    verificationStatus: 'unverified',
    busId: '',
    role: 'user',
    ...overrides,
  };
}
