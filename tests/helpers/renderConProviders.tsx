// Codigo Aurelio - un QueryClient por render impide que un spec herede caché de otro.
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { AuthUser } from '@/types/api';
import { AuthProviderDePrueba } from './AuthProviderDePrueba';

interface OpcionesDeRender extends Omit<RenderOptions, 'wrapper'> {
  user?: AuthUser | null;
}

export function renderConProviders(
  ui: React.ReactElement,
  { user = null, ...options }: OpcionesDeRender = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProviderDePrueba user={user}>{children}</AuthProviderDePrueba>
      </QueryClientProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}
