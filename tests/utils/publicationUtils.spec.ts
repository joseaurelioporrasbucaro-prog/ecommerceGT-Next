// @vitest-environment node
// Codigo Aurelio - cubre shapes reales de Postgres y evita cards vacías o mal clasificadas.

import { describe, expect, test } from 'vitest';
import type { PublicationListItem } from '@/types/api';
import {
  formatNumberValue,
  getPublicationListAllImages,
  getPublicationListImage,
  isLandCategory,
} from '@/components/publications/publicationUtils';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function publicacion(overrides: Partial<PublicationListItem> = {}): PublicationListItem {
  return {
    id: '17' as unknown as number,
    pubstaId: 2,
    title: 'Casa de prueba',
    description: 'Descripción',
    address: 'Zona 1',
    price: '100000',
    currency: 'GTQ',
    rooms: 2,
    bathrooms: 1,
    parking: 0,
    levell: 1,
    sizee: 90,
    country: 'Guatemala',
    city: 'Guatemala',
    town: 'Ciudad de Guatemala',
    category: 'Casa',
    image: '',
    images: [],
    ...overrides,
  };
}

describe('utilidades de presentación de publicaciones', () => {
  // ── EL TEST QUE IMPORTA ────────────────────────────────────────────────────
  test('no confunde cero ni strings numéricos de Postgres con un valor ausente', () => {
    expect(formatNumberValue(null, '-')).toBe('-');
    expect(formatNumberValue(undefined, '-')).toBe('-');
    expect(formatNumberValue(0, '-')).toBe('0');
    expect(formatNumberValue('0' as unknown as number, '-')).toBe('0');
    expect(formatNumberValue('' as unknown as number, '-')).toBe('');
  });

  test('elige la imagen principal y cae a la primera de galería', () => {
    expect(getPublicationListImage(publicacion())).toBeNull();
    expect(getPublicationListImage(publicacion({
      images: [{ id: '1', url: '/uploads/images/galeria.jpg' }],
    }))).toBe(`${BACKEND}/uploads/images/galeria.jpg`);
    expect(getPublicationListImage(publicacion({
      image: '/uploads/images/principal.jpg',
      images: [{ id: '1', url: '/uploads/images/galeria.jpg' }],
    }))).toBe(`${BACKEND}/uploads/images/principal.jpg`);
  });

  test('arma la galería absoluta sin vacíos ni imágenes repetidas', () => {
    expect(getPublicationListAllImages(publicacion({
      image: '/uploads/images/principal.jpg',
      images: [
        { id: '1', url: '/uploads/images/principal.jpg' },
        { id: '2', url: '' },
        { id: '3', url: 'https://cdn.example.com/segunda.jpg' },
      ],
    }))).toEqual([
      `${BACKEND}/uploads/images/principal.jpg`,
      'https://cdn.example.com/segunda.jpg',
    ]);
  });

  test('reconoce las variantes de terreno sin falsos positivos vacíos', () => {
    expect(isLandCategory('Terreno residencial')).toBe(true);
    expect(isLandCategory('LOTE EN VENTA')).toBe(true);
    expect(isLandCategory('Solar urbano')).toBe(true);
    expect(isLandCategory('Casa')).toBe(false);
    expect(isLandCategory('0')).toBe(false);
    expect(isLandCategory('')).toBe(false);
    expect(isLandCategory(null)).toBe(false);
    expect(isLandCategory(undefined)).toBe(false);
  });
});
