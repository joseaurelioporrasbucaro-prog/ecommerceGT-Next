// @vitest-environment node
// Codigo Aurelio - evita URLs relativas rotas y dobles prefijos del API.

import { describe, expect, test } from 'vitest';
import { getBackendUrl } from '@/utils/backendUrl';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

describe('resolución de rutas del backend', () => {
  // ── EL TEST QUE IMPORTA ────────────────────────────────────────────────────
  test('agrega el host una sola vez y normaliza la barra inicial', () => {
    expect(getBackendUrl('/uploads/images/casa.jpg')).toBe(`${BACKEND}/uploads/images/casa.jpg`);
    expect(getBackendUrl('uploads/images/casa.jpg')).toBe(`${BACKEND}/uploads/images/casa.jpg`);
    expect(getBackendUrl('0')).toBe(`${BACKEND}/0`);
  });

  test('conserva URLs absolutas HTTP y HTTPS', () => {
    expect(getBackendUrl('http://cdn.example.com/casa.jpg')).toBe('http://cdn.example.com/casa.jpg');
    expect(getBackendUrl('https://cdn.example.com/casa.jpg')).toBe('https://cdn.example.com/casa.jpg');
  });

  test('las entradas realmente ausentes no apuntan al host', () => {
    expect(getBackendUrl(null)).toBe('');
    expect(getBackendUrl(undefined)).toBe('');
    expect(getBackendUrl('')).toBe('');
  });
});
