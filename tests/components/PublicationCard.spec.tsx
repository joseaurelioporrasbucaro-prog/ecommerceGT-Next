// Codigo Aurelio - protege la información que decide si una card merece un clic.
//
// Precio, moneda y prestaciones deben reflejar el listing real. Además, una foto
// rota no puede dejar un hueco y el corazón debe representar la caché autenticada.

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import PublicationCard from '@/components/publications/PublicationCard';
import type { PublicationListItemAuth } from '@/types/api';
import { renderConProviders } from '../helpers/renderConProviders';

vi.mock('@/hooks/api/useFavorites', () => ({
  useToggleFavorite: () => ({ mutate: vi.fn(), isPending: false }),
}));

function publicacion(overrides: Partial<PublicationListItemAuth> = {}): PublicationListItemAuth {
  return {
    id: 31,
    pubstaId: 2,
    title: 'Casa con jardín',
    description: 'Casa de prueba',
    address: 'Zona 15',
    price: 850000,
    currency: 'GTQ',
    rooms: 3,
    bathrooms: 2,
    parking: 2,
    levell: 1,
    sizee: 180,
    country: 'Guatemala',
    city: 'Guatemala',
    town: 'Guatemala',
    category: 'Casa',
    image: '/uploads/images/casa.webp',
    images: [],
    id_cus: 8,
    isFavorite: false,
    ...overrides,
  };
}

describe('PublicationCard', () => {
  test('muestra el monto y el símbolo de la moneda cargada en la publicación', () => {
    const { container } = renderConProviders(
      <PublicationCard publication={publicacion({ price: '125000.50', currency: 'USD' })} />,
    );

    expect(container.textContent).toContain('US$');
    expect(container.textContent).toContain('125,000.50');
  });

  test('solo muestra parqueos positivos en propiedades que no son terreno', () => {
    const casa = renderConProviders(
      <PublicationCard publication={publicacion({ parking: 2 })} />,
    );
    expect(screen.getByTitle('features.parking').textContent).toContain('2');
    casa.unmount();

    renderConProviders(
      <PublicationCard publication={publicacion({ category: 'Terreno', parking: 4 })} />,
    );
    expect(screen.queryByTitle('features.parking')).toBeNull();
  });

  test('oculta parqueos cuando el backend manda cero', () => {
    renderConProviders(<PublicationCard publication={publicacion({ parking: 0 })} />);
    expect(screen.queryByTitle('features.parking')).toBeNull();
  });

  test('el corazón relleno representa isFavorite=true', () => {
    renderConProviders(<PublicationCard publication={publicacion({ isFavorite: true })} />);

    const button = screen.getByRole('button', { name: 'favorite.remove' });
    expect(button.className).toContain('is-active');
    expect(button.querySelector('i')?.className).toContain('fas fa-heart');
  });

  // ── EL TEST QUE IMPORTA ──────────────────────────────────────────────────
  test('una variante y una imagen original rotas terminan en el fallback visible', async () => {
    const { container } = renderConProviders(
      <PublicationCard publication={publicacion()} />,
    );

    fireEvent.error(screen.getByRole('img', { name: 'Casa con jardín' }));
    fireEvent.error(await screen.findByRole('img', { name: 'Casa con jardín' }));

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'Casa con jardín' })).toBeNull();
      expect(container.querySelector('.pub-camera-fallback')).not.toBeNull();
    });
  });
});
