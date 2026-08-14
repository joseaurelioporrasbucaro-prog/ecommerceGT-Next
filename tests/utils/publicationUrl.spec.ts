// @vitest-environment node
// Codigo Aurelio - protege slugs canónicos sin romper publicaciones legacy con id numérico.

import { describe, expect, test } from 'vitest';
import { publicationIdentifier, publicationPath } from '@/utils/publicationUrl';

describe('URL canónica de publicaciones', () => {
  // ── EL TEST QUE IMPORTA ────────────────────────────────────────────────────
  test('prefiere slug y pub_slug aunque también exista un id', () => {
    expect(publicationPath({ id: 15, slug: 'casa-zona-15-aBxYz9' }))
      .toBe('/publications/casa-zona-15-aBxYz9');
    expect(publicationPath({ pub_id: 16, pub_slug: 'apartamento-centro-CnEd2K' }))
      .toBe('/publications/apartamento-centro-CnEd2K');
    expect(publicationIdentifier({ id: 17, slug: '0' })).toBe('0');
  });

  test('acepta ids numéricos y strings enviados por Postgres', () => {
    expect(publicationPath({ id: 0 })).toBe('/publications/0');
    expect(publicationPath({ id: '18' })).toBe('/publications/18');
    expect(publicationPath({ pub_id: '19' })).toBe('/publications/19');
    expect(publicationIdentifier({ pub_id: '19' })).toBe('19');
  });

  test('no fabrica enlaces cuando slug e id están ausentes o vacíos', () => {
    expect(publicationPath({})).toBe('');
    expect(publicationPath({ slug: null, pub_slug: undefined })).toBe('');
    expect(publicationPath({ id: '' })).toBe('');
    expect(publicationIdentifier({ id: null as unknown as number })).toBe('');
  });
});
