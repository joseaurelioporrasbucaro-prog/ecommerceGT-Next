// Codigo Aurelio - evita corazones desincronizados entre filtros y rollbacks incompletos.
//
// El listado guarda una caché por combinación de filtros. Una coincidencia exacta
// deja esas entradas fuera del optimista, y comparar el id numeric de Postgres con
// `===` deja fuera los ids que llegan como string. Ambos defectos ya llegaron a
// producción, por eso el caso principal exige las dos condiciones a la vez.

import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ApiFetch } from '@/utils/Api';
import { useToggleFavorite } from '@/hooks/api/useFavorites';
import type { FavoriteItem, PublicationListItemAuth, ToggleFavoriteResponse } from '@/types/api';
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

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function publicacion(overrides: Partial<PublicationListItemAuth> = {}): PublicationListItemAuth {
  return {
    id: 17,
    pubstaId: 2,
    title: 'Casa zona 10',
    description: 'Casa de prueba',
    address: 'Zona 10',
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
    image: '',
    images: [],
    id_cus: 1,
    isFavorite: false,
    ...overrides,
  };
}

function favorito(): FavoriteItem {
  return {
    id: 17,
    pubstaId: 2,
    title: 'Casa zona 10',
    description: 'Casa de prueba',
    address: 'Zona 10',
    price: 850000,
    currency: 'GTQ',
    rooms: 3,
    bathrooms: 2,
    parking: 2,
    country: 'Guatemala',
    city: 'Guatemala',
    town: 'Guatemala',
    category: 'Casa',
    image: '',
    isFavorite: true,
  };
}

function DisparadorFavorito({ pubId }: { pubId: number }) {
  const mutation = useToggleFavorite(pubId);
  return (
    <button type="button" onClick={() => mutation.mutate()}>
      cambiar favorito
    </button>
  );
}

describe('useToggleFavorite', () => {
  // ── EL TEST QUE IMPORTA ──────────────────────────────────────────────────
  test('actualiza todas las cachés filtradas aunque Postgres mande el id como string', async () => {
    const peticion = deferred<ToggleFavoriteResponse>();
    vi.mocked(ApiFetch.post).mockReturnValue(peticion.promise);

    const { queryClient } = renderConProviders(<DisparadorFavorito pubId={17} />, {
      user: crearUsuarioDePrueba({ id: 9 }),
    });
    const keyCiudad = ['publications', '?cityId=1000'] as const;
    const keyBusqueda = ['publications', '?q=casa'] as const;
    queryClient.setQueryData(keyCiudad, [
      publicacion({ id: '17' as unknown as number }),
    ]);
    queryClient.setQueryData(keyBusqueda, [publicacion({ id: 17 })]);

    fireEvent.click(screen.getByRole('button', { name: 'cambiar favorito' }));

    await waitFor(() => {
      expect(queryClient.getQueryData<PublicationListItemAuth[]>(keyCiudad)?.[0].isFavorite).toBe(true);
      expect(queryClient.getQueryData<PublicationListItemAuth[]>(keyBusqueda)?.[0].isFavorite).toBe(true);
    });

    await act(async () => {
      peticion.resolve({ message: 'Guardada' });
      await peticion.promise;
    });
  });

  test('si el backend falla restaura listado y favoritos al estado anterior', async () => {
    const peticion = deferred<ToggleFavoriteResponse>();
    vi.mocked(ApiFetch.post).mockReturnValue(peticion.promise);

    const { queryClient } = renderConProviders(<DisparadorFavorito pubId={17} />, {
      user: crearUsuarioDePrueba({ id: 9 }),
    });
    const keyListado = ['publications', '?cityId=1000'] as const;
    const keyFavoritos = ['myFavorites'] as const;
    queryClient.setQueryData(keyListado, [publicacion({ isFavorite: true })]);
    queryClient.setQueryData(keyFavoritos, [favorito()]);

    fireEvent.click(screen.getByRole('button', { name: 'cambiar favorito' }));

    await waitFor(() => {
      expect(queryClient.getQueryData<PublicationListItemAuth[]>(keyListado)?.[0].isFavorite).toBe(false);
      expect(queryClient.getQueryData<FavoriteItem[]>(keyFavoritos)).toEqual([]);
    });

    act(() => peticion.reject(new Error('Fallo de red')));

    await waitFor(() => {
      expect(queryClient.getQueryData<PublicationListItemAuth[]>(keyListado)?.[0].isFavorite).toBe(true);
      expect(queryClient.getQueryData<FavoriteItem[]>(keyFavoritos)).toEqual([favorito()]);
    });
  });
});
