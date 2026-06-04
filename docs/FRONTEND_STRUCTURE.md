# Frontend Structure — KIOSQUI

Tour de `src/` para navegar el frontend sin tener que abrir todo el repo.

## Mapa rápido

```text
src/
├── app/          # rutas Next.js App Router
├── components/   # UI por feature
├── hooks/api/    # React Query hooks contra backend
├── types/        # tipos compartidos, especialmente api.ts
├── utils/        # ApiFetch, AuthContext, helpers de dominio
├── layout/       # wrappers, headers, sidebars, footer
├── style/        # SCSS global del scaffold
├── form/         # formularios legacy/feature con Formik
├── elements/     # piezas genéricas del template
├── data/         # datos estáticos heredados o placeholders
└── contextApi/   # estado de UI global del scaffold
```

## Carpetas principales

### `src/app/`

Next.js App Router. Cada carpeta representa una ruta:

- `page.tsx` monta el componente principal.
- Rutas dinámicas usan `[id]`, `[token]`, `[...not_found]`.
- `layout.tsx` configura providers globales.
- `robots.ts` y `sitemap.ts` generan SEO técnico.

Ejemplos:

| Ruta | Archivo | Componente principal |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Home oficial. |
| `/publications` | `src/app/publications/page.tsx` | `PublicationsMain`. |
| `/publications/[id]` | `src/app/publications/[id]/page.tsx` | Detalle + metadata/JSON-LD. |
| `/favorites` | `src/app/favorites/page.tsx` | `FavoritesMain`. |
| `/messages` | `src/app/messages/page.tsx` | `MessagesMain`. |
| `/soporte/*` | `src/app/soporte/.../page.tsx` | Portales de soporte. |
| `/admin/*` | `src/app/admin/.../page.tsx` | Portales admin. |

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
- `publicationUtils.ts`, `imageVariants.ts`, `publicationSeo.ts` — helpers de dominio/imagen/SEO.
- `gtMunicipalityCoords.ts` — centroides de municipios para mapa.

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

i18n completo sigue pendiente de Fase 14.

Estado actual:

- `i18next` existe con bundle inline parcial.
- La mayoría del contenido nuevo está hardcodeado en español.
- No hay locale en URL ni selector consolidado.

Regla práctica hasta Fase 14: todo texto nuevo visible al usuario debe ir en español claro.

## Páginas que todavía son referencia del template

Algunas rutas se mantienen para QA, comparación o futuro repurpose:

- `/home-two`
- `/art-details`
- `/explore-arts`
- `/wallet-connect`
- partes de `/forum`

No eliminarlas sin fase explícita.
