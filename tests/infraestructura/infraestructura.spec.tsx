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

  // ── AGREGADO EN LA REVISIÓN DEL HITO 1 ─────────────────────────────────────
  test('un componente que usa APIs del navegador también renderiza', async () => {
    // `SupportTicketsMain` da la casualidad de no usar ninguna, así que pasaba
    // sin cubrir el caso. `PublicationCard` —el primer componente del Hito 3—
    // llama a `window.matchMedia` en un useEffect, y jsdom no lo trae: el
    // render moría con "matchMedia is not a function", un error que no habla
    // del componente y manda a buscar donde no es.
    //
    // Este test existe para que el setup no vuelva a quedar incompleto sin que
    // nadie se entere hasta el hito siguiente.
    const { default: PublicationCard } = await import('@/components/publications/PublicationCard');

    const publicacion = {
      id: '17', pubstaId: 2, title: 'Casa en zona 10', description: 'Bonita',
      address: 'Zona 10', price: '850000', currency: 'GTQ', rooms: 3, bathrooms: 2,
      parking: 2, levell: 1, sizee: 180, country: 'Guatemala', city: 'Guatemala',
      town: 'Guatemala', category: 'Casa', image: '', images: [],
    };

    renderConProviders(<PublicationCard publication={publicacion as never} />);

    expect(screen.getByText('Casa en zona 10')).toBeTruthy();
  });

  test('las APIs que jsdom no trae están disponibles', () => {
    // Si alguien las saca de setup.ts, que se rompa acá y no dentro de un spec
    // de componente, donde el síntoma no señala la causa.
    expect(typeof window.matchMedia).toBe('function');
    expect(typeof window.IntersectionObserver).toBe('function');
    expect(typeof window.ResizeObserver).toBe('function');
    expect(typeof window.scrollTo).toBe('function');
    expect(typeof Element.prototype.scrollIntoView).toBe('function');
    expect(navigator.clipboard).toBeDefined();
  });
});
