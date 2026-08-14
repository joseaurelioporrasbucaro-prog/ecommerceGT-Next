// @vitest-environment node
// Codigo Aurelio - evita avatares sin iniciales cuando faltan fotos o hay nombres reales con tildes.

import { describe, expect, test } from 'vitest';
import { generateInitialsAvatar, resolveAvatarSrc } from '@/utils/avatarUtils';

function svgDe(dataUrl: string): string {
  return decodeURIComponent(dataUrl.slice(dataUrl.indexOf(',') + 1));
}

describe('fallback de avatar por iniciales', () => {
  // ── EL TEST QUE IMPORTA ────────────────────────────────────────────────────
  test('usa primer nombre y último apellido sin perder caracteres acentuados', () => {
    expect(svgDe(generateInitialsAvatar('María López'))).toContain('>ML</text>');
    expect(svgDe(generateInitialsAvatar('José de León'))).toContain('>JL</text>');
    expect(svgDe(generateInitialsAvatar('Álvaro Ñuflo'))).toContain('>ÁÑ</text>');
  });

  test('nombres vacíos y valores límite siguen produciendo un avatar visible', () => {
    expect(svgDe(generateInitialsAvatar(''))).toContain('>?</text>');
    expect(svgDe(generateInitialsAvatar('   '))).toContain('>?</text>');
    expect(svgDe(generateInitialsAvatar('0'))).toContain('>0</text>');
    expect(svgDe(resolveAvatarSrc(null, undefined))).toContain('>?</text>');
  });

  test('una imagen existente gana y el fallback respeta tamaño y estabilidad', () => {
    const resolver = (path: string) => `https://api.kiosqui.com${path}`;
    expect(resolveAvatarSrc('/uploads/images/perfil.jpg', 'María López', 80, resolver))
      .toBe('https://api.kiosqui.com/uploads/images/perfil.jpg');

    const primero = generateInitialsAvatar('María López', 80);
    expect(generateInitialsAvatar('María López', 80)).toBe(primero);
    expect(svgDe(primero)).toContain('width="80" height="80"');
  });
});
