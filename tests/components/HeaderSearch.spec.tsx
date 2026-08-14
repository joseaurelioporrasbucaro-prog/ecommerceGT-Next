// Codigo Aurelio - impide que el buscador del header descargue el catálogo entero.
//
// El header vive en todas las páginas. Consultar con una letra o perder `limit`
// vuelve a sumar megabytes a cada navegación, aunque el dropdown muestre solo cinco.

import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import HeaderSearch from '@/layout/header/component/HeaderSearch';
import { ApiFetch } from '@/utils/Api';
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

describe('HeaderSearch', () => {
  // ── EL TEST QUE IMPORTA ──────────────────────────────────────────────────
  test('espera dos caracteres y limita la búsqueda de publicaciones', async () => {
    vi.mocked(ApiFetch.get).mockResolvedValue({
      users: [],
      items: [],
      nextCursor: null,
      hasMore: false,
    });
    renderConProviders(<HeaderSearch placeholder="Buscar en Kiosqui" />);
    const input = screen.getByPlaceholderText('Buscar en Kiosqui');

    fireEvent.change(input, { target: { value: 'c' } });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(ApiFetch.get).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: 'casa' } });
    await waitFor(() => expect(ApiFetch.get).toHaveBeenCalledTimes(2));

    const urls = vi.mocked(ApiFetch.get).mock.calls.map(([url]) => url);
    expect(urls).toContain('/search/users?q=casa');
    const publicationUrl = urls.find((url) => url.startsWith('/publications?'));
    expect(publicationUrl).toBeDefined();
    expect(new URLSearchParams(publicationUrl?.split('?')[1]).get('limit')).toBe('5');
  });
});
