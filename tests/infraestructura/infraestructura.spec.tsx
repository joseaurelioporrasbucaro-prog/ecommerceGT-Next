// Codigo Aurelio - detecta un runner desconectado y providers que no representan la app real.
//
// El primer caso evita que `npm test` quede configurado sin descubrir specs.
// El segundo previene que cada componente tenga que inventar mocks incompatibles
// para next-intl, React Query y autenticación.

import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ApiFetch } from '@/utils/Api';
import SupportTicketsMain from '@/components/support/SupportTicketsMain';
import { crearUsuarioDePrueba } from '../helpers/AuthProviderDePrueba';
import { renderConProviders } from '../helpers/renderConProviders';

vi.mock('@/utils/Api', () => ({
  ApiFetch: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('infraestructura de pruebas del frontend', () => {
  test('Vitest descubre y ejecuta los specs del frontend', () => {
    expect(true).toBe(true);
  });

  // ── EL TEST QUE IMPORTA ────────────────────────────────────────────────────
  test('un componente real comparte traducciones y caché aislada sin llamar al backend', async () => {
    vi.mocked(ApiFetch.get).mockResolvedValue([]);

    const { queryClient } = renderConProviders(<SupportTicketsMain />, {
      user: crearUsuarioDePrueba({ role: 'support' }),
    });

    expect(await screen.findByText('tickets.empty')).toBeTruthy();
    expect(screen.getByText('breadcrumbs.tickets')).toBeTruthy();
    expect(ApiFetch.get).toHaveBeenCalledWith('/support/tickets');
    expect(queryClient.getQueryData(['supportTickets', '', ''])).toEqual([]);
  });
});
