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

// Codigo Aurelio - los formularios usan la navegación localizada, que por
// debajo exige el App Router real. Se centraliza para que todos los specs vean
// el mismo contrato de Link/router y ninguno arme una variante incompatible.
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) =>
    React.createElement('a', { ...props, href }, children),
  useRouter: () => ({
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/',
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

// ─────────────────────────────────────────────────────────────────────────────
// Codigo Aurelio (revisión del Hito 1) — APIs del navegador que jsdom NO trae.
//
// El spec de infraestructura probó con `SupportTicketsMain`, que da la
// casualidad de que no usa ninguna. Pero el Hito 3 arranca por
// `PublicationCard`, que llama a `window.matchMedia` en un `useEffect`, y ahí
// el render revienta con "matchMedia is not a function" — un error que no habla
// del componente y manda a cualquiera a buscar donde no es.
//
// Van acá y no en cada spec a propósito: si cada archivo se arma su propio
// mock, terminan siendo siete mocks distintos e incompatibles del mismo objeto.
//
// Cubre lo que la app usa hoy (verificado con grep sobre src/):
//   · matchMedia            → PublicationCard (prefers-reduced-motion)
//   · IntersectionObserver  → scroll infinito y animaciones de entrada
//   · scrollTo / scrollIntoView → navegación entre filtros y comentarios
//   · navigator.share / clipboard → botón Compartir
// ─────────────────────────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) => ({
      matches: false, // ningún media query activo: el caso base
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),    // API vieja, todavía usada por algunas libs
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as unknown as MediaQueryList;
  }

  if (!window.IntersectionObserver) {
    window.IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = '';
      thresholds = [];
    } as unknown as typeof IntersectionObserver;
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as unknown as typeof ResizeObserver;
  }

  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();

  // `share` no existe en jsdom; `clipboard` sí pero es de solo lectura, así que
  // hay que definirla en vez de asignarla.
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined), readText: vi.fn() },
  });
  Object.defineProperty(navigator, 'share', {
    configurable: true,
    writable: true,
    value: undefined, // sin soporte por defecto: el fallback a copiar es el camino real en escritorio
  });
}
