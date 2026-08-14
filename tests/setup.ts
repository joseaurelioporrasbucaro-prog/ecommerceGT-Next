// Codigo Aurelio - mocks comunes para que cada spec pruebe conducta, no plumbing de Next.
import React from 'react';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  if (typeof document !== 'undefined') cleanup();
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
  useLocale: () => 'es',
  useTranslations: () =>
    Object.assign((clave: string) => clave, {
      has: (_clave: string) => true,
      raw: (clave: string) => clave,
      rich: (clave: string) => clave,
    }),
  useFormatter: () => ({
    dateTime: (valor: Date | number) => String(valor),
    number: (valor: number) => String(valor),
    relativeTime: (valor: Date | number) => String(valor),
  }),
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: vi.fn(),
    theme: 'light',
  }),
}));

interface ImagenNextProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | { src: string };
  fill?: boolean;
  priority?: boolean;
}

vi.mock('next/image', () => ({
  default: ({ src, fill: _fill, priority: _priority, ...props }: ImagenNextProps) =>
    React.createElement('img', {
      ...props,
      src: typeof src === 'string' ? src : src.src,
    }),
}));

vi.mock('@/utils/AuthContext', async () => {
  const modulo = await import('./helpers/AuthProviderDePrueba');
  return {
    AuthProvider: modulo.AuthProviderDePrueba,
    useAuth: modulo.useAuthDePrueba,
  };
});
