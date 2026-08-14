// @vitest-environment node
// Codigo Aurelio - evita romper el fallback de publicaciones viejas sin variantes WebP.

import { describe, expect, test } from 'vitest';
import { CARD_PLACEHOLDER } from '@/components/publications/publicationUtils';
import { getImageVariant } from '@/utils/imageVariants';

describe('variantes optimizadas de imágenes', () => {
  // ── EL TEST QUE IMPORTA ────────────────────────────────────────────────────
  test('construye la cadena variante, original y placeholder sin perder el original', () => {
    const original = '/uploads/images/casa-zona-15.jpg';

    expect([
      getImageVariant(original, 'card'),
      original,
      CARD_PLACEHOLDER,
    ]).toEqual([
      '/uploads/images/casa-zona-15_card.webp',
      '/uploads/images/casa-zona-15.jpg',
      CARD_PLACEHOLDER,
    ]);
    expect(CARD_PLACEHOLDER.startsWith('data:image/svg+xml')).toBe(true);
  });

  test('genera cada tamaño y conserva el host del backend', () => {
    expect(getImageVariant('/uploads/images/foto.png', 'thumb')).toBe('/uploads/images/foto_thumb.webp');
    expect(getImageVariant('/uploads/images/foto.jpeg', 'detail')).toBe('/uploads/images/foto_detail.webp');
    expect(getImageVariant('https://api.kiosqui.com/uploads/images/foto.jpg', 'card'))
      .toBe('https://api.kiosqui.com/uploads/images/foto_card.webp');
  });

  test('no inventa variantes para entradas vacías, externas o ya procesadas', () => {
    expect(getImageVariant(null, 'card')).toBe('');
    expect(getImageVariant(undefined, 'card')).toBe('');
    expect(getImageVariant('', 'card')).toBe('');
    expect(getImageVariant('0', 'card')).toBe('0');
    expect(getImageVariant('https://cdn.example.com/foto.jpg', 'card')).toBe('https://cdn.example.com/foto.jpg');
    expect(getImageVariant('/uploads/images/foto_card.webp', 'card')).toBe('/uploads/images/foto_card.webp');
    expect(getImageVariant('/uploads/images/sin-extension', 'card')).toBe('/uploads/images/sin-extension');
  });
});
