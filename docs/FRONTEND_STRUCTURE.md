# Frontend Structure — KIOSQUI

Tour de `src/` para navegar el frontend sin tener que abrir todo el repo.

La infraestructura de pruebas vive en `tests/` y se configura desde
`vitest.config.mts`.

## Mapa rápido

```text
src/
├── app/          # rutas Next.js App Router
├── i18n/         # routing/request/navigation de next-intl
├── components/   # UI por feature
├── hooks/api/    # React Query hooks contra backend
├── types/        # tipos compartidos, especialmente api.ts
├── utils/        # ApiFetch, AuthContext, helpers de dominio
├── layout/       # wrappers, headers, sidebars, footer
├── style/        # SCSS global del scaffold
├── ../messages/  # JSON i18n por locale y namespace
├── form/         # formularios legacy/feature con Formik
├── elements/     # piezas genéricas del template
├── data/         # datos estáticos heredados o placeholders
└── contextApi/   # estado de UI global del scaffold
```

## Carpetas principales

### `src/app/`

Next.js App Router. Desde Fase 14.1, las páginas viven bajo `src/app/[locale]/`
para soportar sub-paths `/es` y `/en`. En la raíz de `src/app/` solo quedan
`layout.tsx`, `globals.css`, `favicon.ico`, `sitemap.xml/route.ts`,
`robots.ts`, `[...not_found]/` y `[locale]/`.

- `page.tsx` monta el componente principal.
- Rutas dinámicas usan `[id]`, `[token]`, `[...not_found]`.
- `src/app/layout.tsx` solo importa estilos globales y retorna `children`.
- `src/app/[locale]/layout.tsx` configura `<html lang={locale}>`,
  `NextIntlClientProvider`, providers globales y metadata localizada.
- `sitemap.xml/route.ts` emite XML explícito con variantes `/es/...` y
  `/en/...` + `xhtml:link hreflang`; `robots.ts` bloquea rutas privadas con
  prefijo de locale.

Ejemplos:

| Ruta | Archivo | Componente principal |
| --- | --- | --- |
| `/es` / `/en` | `src/app/[locale]/page.tsx` | Home oficial. |
| `/es/publications` | `src/app/[locale]/publications/page.tsx` | `PublicationsMain`. |
| `/es/publications/[id]` | `src/app/[locale]/publications/[id]/page.tsx` | Detalle + metadata/JSON-LD. |
| `/es/favorites` | `src/app/[locale]/favorites/page.tsx` | `FavoritesMain`. |
| `/es/messages` | `src/app/[locale]/messages/page.tsx` | `MessagesMain`. |
| `/es/soporte/*` | `src/app/[locale]/soporte/.../page.tsx` | Portales de soporte. |
| `/es/admin/*` | `src/app/[locale]/admin/.../page.tsx` | Portales admin. |

### `src/components/`

Componentes por dominio. Convención práctica: un componente `Main` por pantalla y componentes menores cerca de su feature.

- `publications/` — listados, cards, detalle, galería, comentarios, filtros, mapa, favoritos, mis publicaciones.
- `messages/` — inbox, conversación, burbujas, reacciones, reportes.
- `support/` — usuarios, verificaciones, denuncias, tickets.
- `admin/` — configuración y portal de imágenes.
- `pauta/` — campañas, crédito, métodos de pago aplicados a pauta.
- `Creator-Profile/` — perfil público de vendedor.
- `Creator-Profile-info/` — configuración del usuario logueado.
- `company/` — empresa, equipo y perfil público.
- `comments/` — piezas reutilizables de comentarios (`ForumComment`, `ForumReply`, `MentionTextarea`).
- `legal/` — páginas legales y cookie banner.
- `home-three/` — home KIOSQUI real.
- Carpetas con nombres heredados (`Explore-Arts`, `Tearms`, `art-details`) vienen del template y no deben renombrarse masivamente fuera de una fase dedicada.

### `src/hooks/api/`

Hooks React Query contra el backend. Patrón esperado:

```ts
export const RESOURCE_QUERY_KEY = ['resource'] as const;

export function useResource() {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEY,
    queryFn: () => ApiFetch.get<ResourceResponse>('/resource'),
    retry: false,
    staleTime: 60_000,
  });
}
```

Convenciones:

- Query keys exportadas para invalidar desde mutations.
- `ApiFetch.get<T>` / `post<T>` siempre con genérico explícito.
- Mutations importantes hacen optimistic update cuando aplica y `invalidateQueries` en `onSettled`.
- Errores se muestran con `error instanceof ApiError ? error.message : 'Error inesperado'`.

Ejemplos por dominio:

| Hook | Endpoint/recurso |
| --- | --- |
| `useCurrentUser` | `/me` |
| `usePublications` | `/publications`, detalle, seller info |
| `useFavorites` | `/myfavorites`, toggle favorito |
| `usePublicationComments` | `/comments/:id`, `/addcomment` |
| `useMessages` | inbox, conversación, unread, enviar mensaje |
| `useNotifications` | centro de notificaciones |
| `useCampaigns` | pauta/campañas |
| `usePaymentMethods` | métodos de pago |
| `useVerification` | verificación DPI/NIT |
| `useTickets` | tickets de usuario/soporte |

### `src/types/`

`src/types/api.ts` es la fuente de verdad de payloads/responses del backend.

Reglas:

- Reflejar el backend real, incluso si trae nombres legacy o typos.
- Normalizar en hooks/componentes cuando convenga, no mentir en el tipo base.
- No usar `any`; si el shape no está cerrado, usar `unknown` + narrowing.

### `src/utils/`

- `Api.ts` — wrapper de `fetch`, cookies incluidas, `ApiError` tipado, soporte JSON/FormData.
- `AuthContext.tsx` — usuario logueado, `checkAuth`, `logout`.
- `QueryProvider.tsx` — React Query provider y devtools en desarrollo.
- `backendUrl.ts` — resuelve rutas `/uploads/...` contra `NEXT_PUBLIC_API_URL`.
- `stripLocalePath.ts` — normaliza paths `/es/...` y `/en/...` a paths internos sin locale.
- `datetime.ts` / `datetime.server.ts` — helpers de fecha/número basados en
  `next-intl`.
- `publicationUtils.ts`, `imageVariants.ts`, `publicationSeo.ts` — helpers de dominio/imagen/SEO.
- `gtMunicipalityCoords.ts` — centroides de municipios para mapa.

### `src/i18n/` y `messages/`

Setup de `next-intl` introducido en Fase 14.1:

- `src/i18n/routing.ts` — locales soportados (`es`, `en`), default `es` y `localePrefix: 'always'`.
- `src/i18n/request.ts` — carga namespaces JSON desde `messages/<locale>/`.
- `src/i18n/navigation.ts` — wrappers `Link`, `useRouter`, `usePathname`, `redirect`.
- Namespaces activos en `messages/<locale>/`: `common`, `auth`, `messages`,
  `support`, `pauta`, `profile`, `notifications`, `admin`, `home`,
  `publications`, `legal`, `danger`.
- `src/i18n/request.ts` carga todos los namespaces y los expone como objeto
  namespaced para `useTranslations('<namespace>')`.

### `src/layout/`

Wrappers y navegación:

- `DefaultWrapper.tsx` — layout base, headers/sidebars, ajustes responsive globales.
- `header/` — `HeaderOne`, `HeaderTwo` y navegación superior/lateral.
- `sidebar/` — menús, filtros y sidebars del template.
- `footer/` — footer con links legales.

### `src/style/`

SCSS global del scaffold. Preferir reusar clases existentes antes de crear estilos nuevos.

Notas:

- Usar Bootstrap + SCSS; no Tailwind, no MUI.
- Separadores neutros: `rgba(128, 128, 128, 0.2)` o similar.
- Si `styled-jsx` necesita afectar hijos, usar `:global(...)`.

### `src/form/`

Formularios grandes/legacy con Formik + Yup:

- `LoginFrom.tsx`
- `RegisterForm.tsx`
- `ForgotForm.tsx`

Nuevos formularios complejos pueden vivir junto a su feature si no pertenecen al módulo auth.

### `src/contextApi/`

Estado de UI heredado del scaffold (`AppProvider`): sidebar, filtros, toggles visuales. No mezclar con estado de servidor.

### `src/elements/`, `src/ui/`, `src/svg/`, `src/interFace/`

Piezas genéricas del template y tipos antiguos. Reusar con cuidado; muchas siguen nombradas para el dominio original del scaffold.

### `src/data/`

Datos estáticos del template o placeholders. El objetivo de la migración es reemplazarlos por hooks/API cuando una pantalla se vuelve real.

## Pruebas frontend

- `vitest.config.mts` — Vitest con `jsdom`, alias `@/` y cobertura V8.
- `tests/setup.ts` — mocks compartidos de Next, `next-intl`, imágenes, tema y auth.
- `tests/helpers/renderConProviders.tsx` — render con un `QueryClient` aislado y
  `retry: false`.
- `tests/helpers/AuthProviderDePrueba.tsx` — sesión configurable sin cookie ni
  llamadas a `/me`.
- `tests/<área>/*.spec.ts(x)` — specs agrupados por comportamiento.

Los nombres y comentarios se escriben en español. Cada prueba nueva debe verse
en rojo al romper deliberadamente la conducta que protege antes de aceptarse
como válida.

## Naming

| Elemento | Convención |
| --- | --- |
| Componentes React | PascalCase: `PublicationCard.tsx`. |
| Hooks | camelCase con prefijo `use`: `usePublications.ts`. |
| Query keys | `RESOURCE_QUERY_KEY`, exportadas. |
| Rutas App Router | carpetas kebab/lowercase cuando son nuevas: `my-publications`. |
| Tipos API | PascalCase en `src/types/api.ts`. |
| Helpers | camelCase: `formatPrice`, `getBackendUrl`. |

## Patrón de fetch

1. Tipo en `src/types/api.ts`.
2. Hook en `src/hooks/api/useX.ts`.
3. Componente consume `data`, `isLoading`, `error`.
4. Loading/error/empty state visible en español.
5. Mutations invalidan queries relacionadas.

## Auth de páginas

Hay dos capas:

1. `src/middleware.ts` protege rutas por presencia de cookie `token`.
2. El backend valida JWT real en cada endpoint autenticado.

Para una ruta privada nueva:

```ts
const PROTECTED_ROUTES = [
  '/my-publications',
  '/favorites',
  '/messages',
  '/upload',
];
```

Para rutas dinámicas:

```ts
const PROTECTED_PATTERNS = [/^\/publications\/[^/]+\/edit/];
```

## Gate por rol

El frontend usa `useAuth()` o `useCurrentUser()` y revisa:

```ts
const isSupport = user?.role === 'support' || user?.role === 'admin';
const isAdmin = user?.role === 'admin';
```

El gate visual no reemplaza la seguridad: el backend valida `requireSupport` o `cus_role='admin'` en handlers sensibles.

## i18n

Estado actual:

- `next-intl` está activo con sub-paths `/es` y `/en`.
- `src/middleware.ts` combina resolución de locale con protección de rutas por cookie `token`.
- `NEXT_LOCALE` persiste la elección del usuario.
- El selector de idioma vive en `HeaderOne` y `HeaderTwo`.
- La convivencia con `react-i18next` terminó en Hito 14.2: `react-i18next`, `i18next` y `src/i18n.js` fueron eliminados.
- Hito 14.3 extrajo contenido visible de Fases 5-11 a namespaces JSON y
  reemplazó fechas hardcoded por helpers basados en `useFormatter`.
- Hito 14.4 pasa `locale` a endpoints que disparan emails y genera sitemap /
  robots bilingües.

Regla práctica: texto nuevo visible debe ir a `messages/<locale>/<namespace>.json`
en ambos idiomas. Si el backend devuelve `{ code, message, params }`, el
frontend debe preferir traducir `code` cuando exista una clave y usar `message`
como fallback.

## Páginas que todavía son referencia del template

Algunas rutas se mantienen para QA, comparación o futuro repurpose:

- `/home-two`
- `/art-details`
- `/explore-arts`
- `/wallet-connect`
- partes de `/forum`

No eliminarlas sin fase explícita.
