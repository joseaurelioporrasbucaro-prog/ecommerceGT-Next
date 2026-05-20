# Migración ecommerceGT → ecommerceGT-Next

> Bitácora viva del proceso de migración del marketplace. Cada fase agrega su propia sección al final del documento con objetivo, archivos tocados y justificación. Este archivo es la fuente de verdad compartida con el equipo: cualquier decisión arquitectónica importante queda aquí, no solo en chats o PRs.
>
> **Para asistentes de IA (Claude, Gemini, ChatGPT, ...):** las reglas de trabajo (qué nunca hacer, convenciones técnicas, workflow por fase, plantillas de prompts) están en `AGENTS.md`. Leerlo PRIMERO. Este archivo solo contiene el estado del trabajo.

---

## 1. Contexto

Estamos migrando el frontend del marketplace desde el proyecto **legacy** (`ecommerceGT`, Create React App) al proyecto **nuevo** (`ecommerceGT-Next`, Next.js 13.4 App Router + TypeScript). Ambos consumen el mismo backend, **`ecommerceGTBackEnd`** (Node + Express + PostgreSQL), que se mantiene compartido durante toda la migración.

| Repo | Stack | Rol |
| --- | --- | --- |
| `ecommerceGT` | CRA + React 18 + react-router v5 + Redux + Context + MUI + axios + i18next | Frontend legacy. Fuente de la **lógica de negocio** y los flujos validados con usuarios. |
| `ecommerceGT-Next` | Next.js 13.4.6 App Router + TS strict + Bootstrap + Formik/Yup + i18next | Frontend nuevo. Fuente del **diseño y arquitectura técnica**. Aquí desemboca la migración. |
| `ecommerceGTBackEnd` | Node + Express 4 + Postgres + JWT (cookie httpOnly) + multer | Backend compartido. Se toca lo mínimo posible. |

**Objetivo de negocio (Fase 1):** marketplace de bienes raíces (publicaciones de casas, apartamentos, terrenos en venta o alquiler).

**Objetivo de negocio (Fase 2, futura):** abrir la plataforma a marketplace general — cualquier vendedor publica cualquier producto y completa una venta segura. La Fase 2 reintroducirá el flujo de carrito/checkout que el legacy tiene como demo (sobre FakeStoreAPI), pero esta vez con backend propio.

---

## 2. Estrategia

### 2.1. Trasplantar lógica, no clonar código

La migración **no** es un port línea a línea del legacy. La regla es:

> **Tomar la cáscara visual del scaffold `ecommerceGT-Next` y rellenarla con la lógica de negocio del legacy.**

Eso significa que cuando una pantalla del scaffold (ej. `creator-profile-info-personal`) ya tiene un layout que nos sirve, **se conserva el componente y solo se cambia el dato/endpoint**, en lugar de clonar el equivalente legacy con MUI.

### 2.2. El template es el techo de calidad

El scaffold de `ecommerceGT-Next` se eligió porque tiene un sistema de diseño más moderno que el legacy. Cuando hay diferencias entre ambos, **gana el scaffold**: la UI/UX nueva se usa como referencia y la lógica legacy se adapta hacia ella, no al revés.

> Ejemplo: para `/profile` (edición de perfil) NO se clona el formulario MUI del legacy. Se usa `creator-profile-info-personal` del scaffold como base y solo se cambian los campos/endpoints para que apunten a `POST /changeinfoa,b,c` del backend.

### 2.3. Backend: tocar solo lo necesario

El backend está estable y se comparte. La regla:

- **Sin tocar el backend** salvo que sea bloqueante para una feature.
- Los cambios propios del responsable del backend van marcados con `// Codigo Aurelio` en el código fuente. Es la única zona donde se modifica.
- Antes de tocar cualquier archivo del backend hay que **avisar y justificar** por qué no se puede resolver desde el frontend.

---

## 3. Estado inicial de los repos (al arrancar la migración)

### 3.1. `ecommerceGT-Next` (destino)

- Next 13.4.6, App Router, TypeScript strict.
- Auth implementada (login, registro, forgot password, verify) con cookie httpOnly del backend (`credentials: 'include'`).
- Perfil base parcialmente conectado.
- Resto de páginas (`/explore-arts`, `/art-details`, `/art-ranking`, `/upload`, `/forum`, `/wallet-connect`, `/activity`, `/creator-profile`, ...) son scaffolds del template original con datos estáticos en `src/data/`.
- **Faltaban:** `.env.local`, middleware de protección, React Query, tipos de API completos, manejo robusto de errores HTTP.

### 3.2. `ecommerceGT` (origen)

- 14 rutas funcionales: home, listado, detalle, login/registro, perfil, mis publicaciones, favoritos, mensajes, edición, encuesta de venta, etc.
- Stack mixto: Redux + Context + React Query parcial.
- Carrito/checkout son una demo sobre **FakeStoreAPI**, no usan el backend real. **No se migran en Fase 1.**

### 3.3. `ecommerceGTBackEnd` (compartido)

- ~50 endpoints REST en un solo `server.js` con un controlador grande.
- Auth: JWT en cookie httpOnly (`SameSite=lax`, expiración 1h, sin refresh token).
- Uploads: `POST /upload` vía multer a `/uploads/images/`, servido como estático.
- CORS por env `CORS_ORIGINS` (default `http://localhost:3000`).
- Sin WebSockets ni rate limiting.

---

## 4. Mapeo template → dominio inmobiliario

| Página del scaffold | Equivalente legacy | Acción |
| --- | --- | --- |
| `/login`, `/register`, `/forgot`, `/verify` | `/login`, `/register`, `/forgotpwd`, `/verify/:token` | ✅ Ya migrado en commits previos (auth + base perfil) |
| `/creator-profile-info-personal` | `/profile` (edición) | Renombrar y conectar a `POST /changeinfoa,b,c` y `/changepwd` |
| `/creator-profile` | `/users/:id` (perfil público de vendedor) | Renombrar a `/seller/[id]`, conectar `GET /infoCustomer/:id` + `GET /seller-reviews/:id` |
| `/creators` | (no existe) | Convertir en directorio público de vendedores (opcional) |
| `/explore-arts` | `/publications` + `/realestate` | Renombrar a `/publications`, conectar `GET /publications` con filtros |
| `/art-details` | `/detail/:id` | Renombrar a `/publications/[id]`, conectar `GET /publication/:id` + comentarios + galería + perfil del vendedor |
| `/upload` + `/upload-category` | Wizard de creación de publicación | Renombrar a `/publications/new`, reusar `DragDropSection` para imágenes (`POST /upload`) y conectar `POST /savepubl` |
| `/activity` | `/messages` (Messenger) | Renombrar a `/messages`, conectar inbox/conversación |
| `/art-ranking` | (no existe) | **Repurposear como ranking de vendedores** |
| `/forum` | (no existe) | **Descartar la página, rescatar el componente de comentarios** y reusarlo en `/publications/[id]` |
| `/wallet-connect` | (no existe) | **Repurposear como asociación de método de pago** (futuro) |
| `/home-two` | (no existe) | Mantener sin enlazar (podría eliminarse) |
| `/home-three` | (no existe) | Landing oficial provisional |
| `/contact`, `/faq`, `/terms` | estáticas | Mantener, ajustar copy a inmobiliaria |
| `/error-404`, `/[...not_found]` | `*` Error | ✅ Ya hecho |
| (no existe) | `/myPublics` | Crear `/my-publications` con `GET /my-publications/:cus_id` |
| (no existe) | `/favorites` | Crear `/favorites` con `GET /myfavorites` |
| (no existe) | `/edit/:id` | Crear `/publications/[id]/edit` con `PUT /publications/:id` |
| (no existe) | `/complete-survey/:token` | Crear `/survey/[token]` con `POST /submit-survey` |

---

## 5. Decisiones de scope (Fase 1)

| Tema | Decisión | Razón |
| --- | --- | --- |
| Carrito y checkout | **No se migran en Fase 1.** Quedan como referencia en el repo legacy. | El backend no tiene endpoints de carrito ni de pago; el legacy usa FakeStoreAPI. Reconstruir en Fase 2. |
| `/wallet-connect` | Repurposear como **asociación de método de pago**. | Anticipa la monetización de Fase 2 sin descartar el componente. |
| `/forum` | Descartar la página. **Salvar el componente de comentarios** para reusarlo en `/publications/[id]`. | El legacy tiene comentarios anidados; la UI del foro del scaffold encaja. |
| `/art-ranking` | Convertir en **ranking de vendedores** (top sellers). | Aprovecha el endpoint `GET /seller-reviews/:id` y agrega valor al directorio. |
| Landing | **`home-three`** provisional. | Decisión a revisar antes de cerrar Fase 9. |
| Header/menú | Mantener estructura del scaffold, **renombrar labels** (artistas → vendedores, arts → propiedades). | Evita rediseño; las rutas cambian pero la navegación visual no. |
| Estado del servidor | **React Query** como única vía. | Reemplaza el mix Redux + Context + React Query parcial del legacy con una sola estrategia. Caché, invalidación y reintentos gratis. |
| Estado de UI | **Context API** (ya existente en `AppProvider`). | El scaffold ya lo usa para sidebar, scroll, filtros. |
| Forms | **Formik + Yup**. | Ya está en el scaffold y el módulo de auth funciona; no se migra a react-hook-form. |
| Estilos | **Bootstrap 5 + SCSS** del scaffold. | No se introduce Tailwind ni se reescribe el design system. |

---

## 6. Plan por fases

| Fase | Objetivo | Estado | Tiempo estimado |
| --- | --- | --- | --- |
| **0** | Fundación técnica: env, React Query, ApiFetch endurecido, tipos API, este documento | ✅ Completada | 1–2 días |
| **1** | Auth completa + middleware de protección de rutas | ✅ Completada | 1 día |
| **2** | Catálogos de referencia (países/ciudades/categorías/transacciones) | ✅ Completada | 0.5 día |
| **3** | Catálogo público y detalle de publicaciones | ✅ Completada | 3 días |
| **4** | Acciones de usuario logueado (favoritos + contador, mis publicaciones, perfil, **username**) | ✅ Completada | 2–3 días |
| **4.3** | Likes funcionales en comentarios (minor de Fase 4) | ✅ Completada | 0.5 día |
| **4.4** | Migración del backend al nuevo remote `techmindsgt` (deploy en Render/Vercel) | ✅ Completada | 0.5 día |
| **5** | Wizard de crear/editar publicación + uploads + procesamiento de imágenes (sharp) | ✅ Completada | 3–4 días |
| **6.1** | Mensajería básica (inbox + conversación + polling + optimistic update) | ✅ Completada | 1 día |
| **6.2** | UI estilo Messenger (3 cols, sin footer, ancho completo) + reacciones, reply y denuncia | ✅ Completada | 1–2 días |
| **6.3.1** | Centro de notificaciones unificado: tabla, endpoints, inserción auto + bell badge en headers + `/activity` real | ✅ Completada | 1 día |
| **6.3.2** | Notifs faltantes (`comment` y `pub_favorite`) + UI `/activity` con tabs por categoría (estilo plantilla) + footer fix | ✅ Completada | 0.5 día |
| **6.3.3** | `MentionTextarea` con dropdown `@usuario` + linkificación en comentarios renderizados | ⬜ Pendiente | 1 día |
| **7** | Cierre de venta + reseñas | ⬜ Pendiente | 1 día |
| **8** | Empresas y planes (opcional) | ⬜ Pendiente | 1–2 días |
| **9** | Sponsors / publicaciones destacadas + ranking de vendedores + follow | ⬜ Pendiente | 2 días |
| **10** | Pulido, i18n, SEO, deploy | ⬜ Pendiente | 2 días |
| **11** | Logging estructurado + alertas (Pino/Winston, log rotation, integración con Sentry/BetterStack, tabla `system_alerts`) | ⬜ Pendiente | 1–2 días |
| **12** | Panel de administración / soporte (rol admin, dashboard de alertas, métricas, gestión usuarios) | ⬜ Pendiente | 2–3 días |
| **13** | Soporte al cliente (usuario "Soporte" especial vía mensajería de Fase 6, replies por email vía nodemailer, tickets) | ⬜ Pendiente | 1–2 días |

**Total estimado:** 23–31 días de trabajo enfocado.

---

## 7. Convenciones

### 7.1. Ramas y PRs

- **Una rama por fase**: `feat/migration-fase-N-resumen`.
- **Un PR por fase** apuntando a `main`. Permite revisión incremental.
- En la descripción del PR se enlaza la sección correspondiente de este `MIGRATION.md`.

### 7.2. Estructura de carpetas

- Renombres masivos (`Art-Details/` → `Publication-Details/`) se hacen **en la fase que toca esa carpeta**, no todos a la vez.
- Tipos de API: `src/types/api.ts` (única fuente de verdad de las respuestas del backend).
- Hooks de servidor (React Query): `src/hooks/api/use<Resource>.ts`.
- Provider de React Query: `src/utils/QueryProvider.tsx`.

### 7.3. Variables de entorno

- `.env.local` — local de cada dev, no se versiona (ya en `.gitignore`).
- `.env.example` — versionado, con todas las claves vacías para que un dev nuevo sepa qué setear.
- Backend en dev: puerto **4000**. Frontend Next: puerto **3000**.

### 7.4. Manejo de errores

- `ApiFetch` lanza `ApiError` con `status`, `message` (del backend si existe) y `body`.
- Componentes que muestran errores leen `err.message` directamente.
- 401 dispara logout (Fase 1).

---

## 8. Riesgos identificados

1. **Sesión de 1h sin refresh token.** UX pobre en flujos largos (wizard de publicación). Mitigación inicial: interceptar 401 → redirigir a login con toast. Solución mejor (Fase 9): refresh token en backend (`// Codigo Aurelio`).
2. **CORS + cookies en producción.** `SameSite=lax` no funciona si frontend y backend están en hosts distintos en prod. Requiere cambio puntual a `SameSite=None; Secure` en backend en Fase 9.
3. **Sin paginación en `GET /publications`.** Trabajo extra cuando el volumen crezca. Candidato a `// Codigo Aurelio` cuando lo necesitemos.
4. **Bugs del backend detectados durante el inventario:** algunos endpoints "auth requerida" no aplican el middleware (ej. `PUT /publications/:id`). Reportar antes de exponerlos en el cliente nuevo.
5. **Polling de mensajería.** Sin WebSockets, hay que vivir con `refetchInterval`. Aceptable en Fase 6.

---

## 9. Bitácora de fases

### Fase 0 — Fundación técnica

**Objetivo:** dejar el proyecto Next con la infraestructura mínima para soportar todas las fases siguientes sin reescribir cada vez. Ningún cambio toca lógica de negocio existente; solo se agregan herramientas.

**Sub-tareas:**

1. Crear este `MIGRATION.md` como bitácora compartida.
2. Crear `.env.local` y `.env.example` (`NEXT_PUBLIC_API_URL`).
3. Instalar React Query (`@tanstack/react-query`) y montar `QueryProvider` en `app/layout.tsx`.
4. Endurecer `src/utils/Api.ts`:
   - Métodos `put` y `delete`.
   - Soporte automático de `FormData`.
   - Lectura del cuerpo de error 4xx/5xx para devolver el mensaje real del backend en lugar de `"Error en GET"` genérico.
   - Manejo de `204 No Content`.
   - Error tipado `ApiError` con `status` para permitir `if (err.status === 401) ...`.
5. Crear `src/types/api.ts` con interfaces basadas en las respuestas reales del backend (`User`, `Publication`, `Comment`, `Message`, etc.).

**Lo que esta fase NO hace (a propósito):**

- No renombra carpetas del scaffold (eso pasa en cada fase, cuando toque).
- No elimina páginas (`wallet-connect`, `home-two`, `forum`); se eliminan o repurposean cuando ya esté lista la reemplazante.
- No agrega `middleware.ts` (eso es Fase 1).
- No modifica `AuthContext`, `LoginFrom`, `RegisterForm` ni nada que ya funcione.

**Por qué este orden:**

Sin React Query, cada componente de las próximas fases tendría que reinventar `useState/useEffect/loading/error`. Sin tipos, las respuestas serían `any` y los bugs aparecerían tarde. Sin `ApiFetch` robusto, los errores del backend se perderían y obligarían a debug doble. Sin `.env.local`, el fallback `localhost:4000` esconde un bug que aparece al hacer deploy.

#### Resultado de la Fase 0

- ✅ `tsc --noEmit` pasa sin errores.
- ✅ `next build` compila las 24 rutas existentes sin warnings nuevos.
- ✅ Auth, registro, recuperación de contraseña y edición de perfil **siguen funcionando exactamente igual** (cero cambio de lógica, solo se agregaron tipos genéricos a las llamadas de `ApiFetch`).
- ✅ React Query DevTools aparece en `process.env.NODE_ENV === 'development'` para inspeccionar caché y queries.

#### Archivos creados (4)

- `MIGRATION.md` — este documento.
- `.env.local` — variable local (no versionada).
- `.env.example` — plantilla versionada.
- `src/utils/QueryProvider.tsx` — provider de React Query (client component).
- `src/types/api.ts` — tipos derivados del backend.

#### Archivos modificados (9)

- `src/app/layout.tsx` — envuelve `AuthProvider` con `QueryProvider`.
- `src/utils/Api.ts` — reescrito: `put`/`delete`/`patch`, soporte FormData, `ApiError` con status, lectura de body de error.
- `src/utils/AuthContext.tsx` — tipa `ApiFetch.get<MeResponse>`; coalesce de `imagenu` para alinear `null → undefined` con la interfaz local.
- `src/form/LoginFrom.tsx`, `RegisterForm.tsx`, `ForgotForm.tsx` — tipos genéricos en los `ApiFetch.post`.
- `src/components/Creator-Profile-info/AccountSettingsTab.tsx`, `PersonalInfoTab.tsx` — tipos genéricos.
- `package.json`, `package-lock.json` — dependencias `@tanstack/react-query` y `@tanstack/react-query-devtools`.

#### Decisiones tomadas durante la fase

1. **Default genérico `<T = unknown>`** en `ApiFetch` (no `any`) para forzar tipado explícito en cada callsite. Hace ruido en el primer commit pero deja el estándar correcto para todas las fases siguientes.
2. **`QueryProvider` envuelve a `AuthProvider`** (y no al revés) para que el `useCurrentUser` de Fase 1 pueda usar React Query desde dentro del `AuthContext`.
3. **Tipos del backend reflejan la realidad cruda** (incluyendo typos `levell`/`sizee` y minúsculas `firstname` en `getInfoCus`). La normalización a camelCase limpio se hará en los hooks de cada fase, no en los tipos base.

---

### Fase 1 — Auth completa + middleware de protección de rutas

**Objetivo:** ninguna ruta privada accesible sin sesión; logout correcto (POST al backend + limpieza local + caché); eliminar `any` del módulo de auth; sentar la base para hooks de API de fases siguientes.

**Por qué esta fase antes de cualquier feature:**
Sin middleware, cualquier usuario puede navegar a `/my-publications` o `/messages` sin estar logueado. Sin logout correcto (era GET en lugar de POST), el backend nunca destruía la cookie. Sin `AuthUser` completo, `PersonalInfoTab` usaba `(user as any)?.birthday` — un bug silencioso esperando crecer.

**Sub-tareas:**

1. **`src/middleware.ts`** (nuevo): verifica la cookie `token` en rutas privadas y redirige a `/login?from=<ruta>` si falta. La cookie la genera el backend; el middleware no valida el JWT (confía en su existencia), la validez real la verifica cada endpoint autenticado.
2. **`src/hooks/api/useCurrentUser.ts`** (nuevo): hook React Query sobre `GET /me`, reutilizable desde Fase 3+ sin pasar por `AuthContext`.
3. **`src/hooks/api/useLogout.ts`** (nuevo): thin wrapper que llama `AuthContext.logout()` y luego hace `router.push('/login')`.
4. **`src/utils/AuthContext.tsx`** (actualizado):
   - `User` local eliminada; usa `AuthUser` de `src/types/api.ts` directamente (incluye `address`, `phone`, `birthday`, `genid`, `lang`).
   - `logout()` agregado al contexto: llama `POST /logout`, setea `user` a null, remueve la query de React Query.
   - Usa `useQueryClient()` del `QueryProvider` que ya lo envuelve.
   - Nota de arquitectura en comentario: el estado del usuario vive temporalmente en dos lugares (useState + React Query); se unificará en una fase futura.
5. **`src/layout/header/HeaderOne.tsx`** (actualizado): `handleLogout` usa `useAuth().logout()` + `router.push`. Se eliminó `ApiFetch.get("/logout")` (incorrecto) y `setUser` importado (innecesario).
6. **`src/components/Creator-Profile-info/PersonalInfoTab.tsx`** (actualizado): eliminados todos los `(user as any)?.birthday/genid/lang/phone/address` — ahora typesafe gracias al `AuthUser` completo.
7. **`src/app/verify/[token]/page.tsx`** (actualizado): el catch reemplaza `error?.response?.data?.message` (patrón axios) por `error instanceof ApiError ? error.message : fallback`.

**Rutas privadas protegidas por el middleware:**
- `/my-publications`
- `/favorites`
- `/messages`
- `/creator-profile-info-personal` (se renombrará a `/profile` en Fase 4)
- `/publications/new` y `/publications/[id]/edit`

#### Resultado

- `tsc --noEmit` limpio.
- `next build` pasa; el middleware aparece compilado (`ƒ Middleware 19.7 kB`).
- Logout ahora llama `POST /logout` (correcto) en lugar de `GET /logout` (bug anterior).

#### Archivos creados (3)

- `src/middleware.ts`
- `src/hooks/api/useCurrentUser.ts`
- `src/hooks/api/useLogout.ts`

#### Archivos modificados (4)

- `src/utils/AuthContext.tsx`
- `src/layout/header/HeaderOne.tsx`
- `src/components/Creator-Profile-info/PersonalInfoTab.tsx`
- `src/app/verify/[token]/page.tsx`

---

#### Follow-ups detectados (no parte de Fase 0)

- ⚠️ **Next.js 13.4.6 tiene una vulnerabilidad de seguridad parcheada** en versiones posteriores (aviso del `npm install`). Planificar upgrade a 13.5.x antes de Fase 9.
- ⚠️ Algunos endpoints "auth requerida" no aplican el middleware en backend (`PUT /publications/:id`, `POST /changestatus`, `POST /deleteimg`, `POST /getemployees`). Reportar y corregir en `// Codigo Aurelio` antes de exponerlos en el cliente nuevo.
- ⚠️ Inconsistencia de shape en `GET /infoCustomer/:id` (devuelve array de un elemento). Normalizar en el hook `useSellerInfo()` de Fase 3.

---

### Fase 2 — Catálogos de referencia

**Objetivo:** centralizar los catálogos del backend en hooks React Query tipados para que las fases de publicaciones, filtros, perfil y wizard no vuelvan a implementar `useEffect + useState` por cada selector.

**Sub-tareas:**

1. Verificar los shapes reales de los endpoints de catálogos en el backend sin modificarlo.
2. Corregir `src/types/api.ts` para reflejar las respuestas reales:
   - `GET /cat/countries` → `{ country, description }`.
   - `POST /cat/cities` → `{ city, description }`.
   - `POST /cat/municipalities` → `{ municipality, description }`.
   - `POST /cat/pubtransactions` → `{ pubtraid, pubtraidaux, description }`.
3. Crear `src/hooks/api/useCatalogs.ts` con hooks React Query para países, ciudades, municipios, categorías, transacciones y géneros.
4. Usar `enabled` en catálogos dependientes:
   - ciudades esperan `countryId`.
   - municipios esperan `cityId`.
   - transacciones esperan `categoryId`.
5. Migrar `PersonalInfoTab` para consumir `useGenders()` en lugar de cargar géneros manualmente.

#### Resultado

- `tsc --noEmit` limpio.
- `next build` pasa. Warnings existentes/no bloqueantes: `sharp` opcional no instalado y Google Fonts no se pudo optimizar por descarga bloqueada.
- No se tocó backend.

#### Archivos creados (1)

- `src/hooks/api/useCatalogs.ts`

#### Archivos modificados (3)

- `src/types/api.ts`
- `src/components/Creator-Profile-info/PersonalInfoTab.tsx`
- `MIGRATION.md`

#### Decisiones tomadas durante la fase

1. **Los tipos reflejan las rutas ecommerce actuales**, no las rutas antiguas de inventario (`/cat/pubtra`, `/cat/pubgen`, etc.). Esto evita mezclar dos familias de catálogos que devuelven shapes distintos.
2. **`pubtraid` y `pubtraidaux` se conservaron tal cual devuelve el backend.** `pubtraid` es el id de la relación categoría-transacción; `pubtraidaux` es el id real que usa `POST /savepubl`.
3. **Los hooks aceptan `number | string | null | undefined` como entrada**, porque los formularios suelen trabajar con valores string. Internamente se normaliza a número y se deshabilita la query cuando no hay id válido.

---

### Fase 3 — Catálogo público y detalle de publicaciones

**Objetivo:** reemplazar el listado y detalle estáticos del scaffold por datos reales del backend, manteniendo la cáscara visual Bootstrap del template y dejando listas las rutas canónicas `/publications` y `/publications/[id]`.

**Sub-tareas:**

1. Crear hooks React Query para publicaciones:
   - `usePublications()` sobre `GET /publications`.
   - `usePublicationDetail(id)` sobre `GET /publication/:id`.
   - `useSellerInfo(cusId)` sobre `GET /infoCustomer/:id`, normalizando el array de un elemento a un objeto o `null`.
2. Crear `usePublicationComments(pubId)` sobre `GET /comments/:pub_id` en modo solo lectura.
3. Crear `getBackendUrl()` para prefijar rutas relativas del backend (`/uploads/...`) con `NEXT_PUBLIC_API_URL`.
4. Crear UI pública:
   - `/publications`: listado con búsqueda y filtro por categoría.
   - `/publications/[id]`: detalle con galería, datos de vendedor, características y comentarios.
5. Agregar redirects desde rutas legacy/scaffold:
   - `/explore-arts` → `/publications`.
   - `/art-details` → `/publications`.
   - `/art-details/[id]` → `/publications/[id]`.
6. Actualizar navegación principal y móvil para apuntar a propiedades/publicaciones.

**Lo que esta fase NO hace (a propósito):**

- No implementa formulario para comentar (`POST /addcomment`); queda para Fase 4.
- No implementa favoritos ni acciones de usuario logueado; quedan para Fase 4.
- No toca el backend.
- No borra componentes estáticos del scaffold todavía; quedan como referencia hasta reemplazar sus usos restantes.

#### Resultado

- `tsc --noEmit` limpio.
- `next build` pasa. Warning no bloqueante: Google Fonts no se pudo optimizar por descarga bloqueada.
- Rutas nuevas compiladas: `/publications` y `/publications/[id]`.

#### Archivos creados (12)

- `src/utils/backendUrl.ts`
- `src/hooks/api/usePublications.ts`
- `src/hooks/api/usePublicationComments.ts`
- `src/components/publications/publicationUtils.ts`
- `src/components/publications/PublicationsBar.tsx`
- `src/components/publications/PublicationCard.tsx`
- `src/components/publications/PublicationsMain.tsx`
- `src/components/publications/PublicationContent.tsx`
- `src/components/publications/PublicationComments.tsx`
- `src/components/publications/PublicationDetailsMain.tsx`
- `src/app/publications/page.tsx`
- `src/app/publications/[id]/page.tsx`

#### Archivos modificados (6)

- `src/app/explore-arts/page.tsx`
- `src/app/art-details/page.tsx`
- `src/app/art-details/[id]/page.tsx`
- `src/data/menu-data.ts`
- `src/data/mobile-Menu-data.ts`
- `MIGRATION.md`

#### Decisiones tomadas durante la fase

1. **Comentarios solo lectura.** Se conectó `GET /comments/:pub_id` y se dejó claro en UI que la participación autenticada llega en Fase 4.
2. **`useSellerInfo()` normaliza `SellerInfoResponse` dentro del hook.** Los componentes reciben `SellerInfo | null` y no necesitan conocer el array `[0]` del backend.
3. **Los filtros del listado son client-side por ahora.** El endpoint `GET /publications` no acepta query params ni paginación, así que filtrar en el cliente evita tocar backend en esta fase.
4. **Las rutas antiguas quedan como redirects.** Esto evita romper enlaces existentes del scaffold mientras la navegación canónica se mueve a `/publications`.
5. **Galería estilo Facebook con `object-fit: contain`.** Las fotos verticales y horizontales se muestran completas sin recorte ni deformación; el fondo gradient oscuro rellena el `aspect-ratio: 16/9` fijo.
6. **`PropertyFeatureIcon` con fallback automático.** El componente intenta renderizar SVG personalizado en `public/assets/img/property-icons/`; si el archivo no existe (404), cae automáticamente al icono Font Awesome equivalente. Permite agregar iconos custom sin romper la UI mientras tanto.
7. **Username del vendedor mock.** Hasta que el backend agregue el campo `cus_username`, el handle `@<nombre>` se genera derivando del primer nombre. Lo conecta Fase 4 (ver §"Cambios planificados al backend").
8. **Tags `Nuevo` (naranja) + `Destacada` (verde) coexisten.** El primer tag se asigna automáticamente a la publicación más reciente del orden cronológico; el segundo está cableado pero queda inactivo (`isFeatured={false}`) hasta que Fase 9 agregue sponsors.

---

### Fase 4 — Acciones de usuario logueado + handle público

**Objetivo:** conectar acciones autenticadas sobre publicaciones (favoritos, comentarios, mis publicaciones) y reemplazar el handle visual derivado por un handle público real (`cus_handle`) sin romper el login por email (`cus_user_name`).

**Auditoría previa de backend (`AGENTS.md §12`):**

- Se leyó `ecommerceGTBackEnd/database.sql` antes de proponer o aplicar cambios.
- `cus_handle` y `cus_handle_changes_count` ya existen en `ecom.customer`; no se agregó ningún `ALTER TABLE` ni se creó columna nueva.
- `cus_user_name` se conserva como email de login.
- Las consultas nuevas/modificadas usan `ecom.` explícito para tablas nuevas o tocadas en esta fase.
- La tabla de favoritos correcta es `ecom.publications_favorites`.

**Backend (`Codigo Aurelio`) aplicado en `ecommerceGTBackEnd`:**

1. `server.js`:
   - `GET /handle/check/:handle`.
   - `GET /handle/suggestions?base=<handle>`.
   - `PUT /handle` con `authMiddleware`.
   - `GET /publication/:id` pasa a `authMiddlewareAux` para poder devolver `isFavorite` sin requerir sesión.
2. `config/connPostgresDB.js`:
   - Helpers de normalización/validación de handles con regex `^[a-z0-9_]{3,30}$`.
   - Sugerencias disponibles por base + sufijos y apellido.
   - `PUT /handle`: valida formato, unicidad y límite de 2 cambios.
   - `POST /register`: acepta `handle?: string`; si no llega, genera uno disponible desde el nombre.
   - `GET /me`: devuelve `handle` y `handleChangesCount`.
   - `GET /publication/:id`: devuelve `favoritesCount` e `isFavorite`.
   - Favoritos, comentarios y mis publicaciones usan tablas `ecom.*` en las rutas tocadas.

**Frontend aplicado en `ecommerceGT-Next`:**

1. Tipos:
   - `AuthUser.handle`, `AuthUser.handleChangesCount`.
   - `HandleCheckResponse`, `HandleSuggestionsResponse`, `UpdateHandleResponse`.
   - `PublicationDetail.favoritesCount` y `PublicationDetail.isFavorite`.
   - `RegisterPayload.handle`.
2. Hooks:
   - `useHandle.ts`: disponibilidad, sugerencias y actualización de handle.
   - `useFavorites.ts`: `useToggleFavorite()` con optimistic update + invalidación en `onSettled`, y `useMyFavorites()`.
   - `useMyPublications.ts`: listado autenticado de publicaciones propias.
   - `usePublicationComments.ts`: `useAddComment()` sobre `POST /addcomment`.
3. UI:
   - `RegisterForm`: campo opcional "Nombre de usuario" con validación en tiempo real e ideas clickeables cuando está ocupado.
   - `PersonalInfoTab`: edición de handle con contador "Cambios disponibles: X / 2" y bloqueo al alcanzar el límite.
   - `PublicationContent`: usa `seller.handle`, `favoritesCount` real e `isFavorite` real.
   - `PublicationCard`: corazón conectado a `useToggleFavorite()`.
   - `/favorites`: ruta protegida con listado de favoritos.
   - `/my-publications`: ruta protegida con listado propio, botón Editar y placeholder de Eliminar para Fase 5.
   - `PublicationComments`: formulario autenticado para comentar o responder; sin sesión muestra CTA a login.
   - `ForumComment` y `ForumReply`: extracción reutilizable usada por `PublicationComments` y `ForumMain`.

**Archivos creados en frontend:**

- `src/hooks/useDebouncedValue.ts`
- `src/hooks/api/useHandle.ts`
- `src/hooks/api/useFavorites.ts`
- `src/hooks/api/useMyPublications.ts`
- `src/components/comments/ForumComment.tsx`
- `src/components/comments/ForumReply.tsx`
- `src/components/publications/FavoritesMain.tsx`
- `src/components/publications/MyPublicationsMain.tsx`
- `src/app/favorites/page.tsx`
- `src/app/my-publications/page.tsx`

**Archivos modificados principales en frontend:**

- `src/types/api.ts`
- `src/utils/AuthContext.tsx`
- `src/hooks/api/usePublications.ts`
- `src/hooks/api/usePublicationComments.ts`
- `src/form/RegisterForm.tsx`
- `src/components/Creator-Profile-info/PersonalInfoTab.tsx`
- `src/components/publications/PublicationCard.tsx`
- `src/components/publications/PublicationContent.tsx`
- `src/components/publications/PublicationComments.tsx`
- `src/components/forum/ForumMain.tsx`
- `MIGRATION.md`

**Verificación:**

- `npx tsc --noEmit` pasa limpio.
- `node --check server.js` y `node --check config/connPostgresDB.js` pasan limpio en backend.
- `npx next build` pasa. Warnings existentes/no bloqueantes: `sharp` opcional no instalado y Google Fonts no se pudo optimizar por descarga bloqueada.

**Follow-ups para Fase 5:**

1. Implementar edición real en `/publications/[id]/edit`.
2. Implementar eliminación real de publicación y reemplazar el placeholder de `/my-publications`.
3. Revisar si conviene que `GET /myfavorites` devuelva el mismo shape completo que `PublicationListItemAuth` para evitar normalización local en `/favorites`.

---

## 9. Cambios planificados al backend (`Codigo Aurelio`)

Lista de cambios que requerirán tocar `ecommerceGTBackEnd`. **Ninguno se ejecuta en Fase 3.** Cada uno se aplica en su fase correspondiente con autorización explícita del usuario.

### Fase 4 — Refactor: extraer componente `<ForumComment />`

La estructura del comentario (avatar + autor + fecha + contenido + meta + replies) está duplicada en `ForumMain.tsx` (scaffold original) y `PublicationComments.tsx` (Fase 3).

Cuando lleguemos a Fase 4 y agreguemos el formulario de respuesta + likes funcionales, extraer:
- `src/components/comments/ForumComment.tsx` — comentario raíz (con meta de likes/respuestas y caja de respuesta).
- `src/components/comments/ForumReply.tsx` — respuesta anidada (con botón Reply).

Usar el mismo componente en `/forum` y en `/publications/[id]`. Evita inconsistencias visuales entre ambas pantallas y facilita conectar las mutations a `POST /addcomment`.

### Fase 4 — Handle público + favoritos con contador

**IMPORTANTE — auditoría obligatoria de `database.sql` (AGENTS.md §12):**
- Schema: `ecom` (no `public`).
- Tabla: `customer` (singular).
- ⚠️ **`cus_user_name` es legacy y guarda el EMAIL** del usuario (login). NO usarlo como handle público — el backend lo lee en `select * from customer where cus_user_name = $1` con el email como parámetro.
- Se agregó una columna nueva **`cus_handle varchar(50) NULL`** adyacente a `cus_user_name`, exclusiva para el alias público (`@handle`) y búsquedas internas.

**Cambio aplicado al `database.sql` (consolidado, sin ALTER):**

Ver `ecommerceGTBackEnd/database.sql`:
- Línea ~507 — `cus_handle varchar(50) NULL` agregada al `CREATE TABLE customer`.
- Línea ~541 — `CREATE UNIQUE INDEX IF NOT EXISTS customer_handle_unique ON customer(cus_handle) WHERE cus_handle IS NOT NULL;`.

Producción nueva queda coherente desde cero, sin parches acumulados.

**SQL de migración para entornos ya poblados (dev/staging):**

```sql
-- Solo si tu BD ya estaba creada antes de esta fase y querés alinearla.
-- En producción nueva esto NO se ejecuta — `database.sql` ya lo contiene.

-- 1. Si en iteraciones previas se creó la columna `cus_username`, renombrarla a cus_handle.
ALTER TABLE ecom.customer RENAME COLUMN cus_username TO cus_handle;
ALTER INDEX ecom.customer_username_unique RENAME TO customer_handle_unique;

-- 2. Si se creó por error un índice sobre cus_user_name (que es email/login), eliminarlo.
DROP INDEX IF EXISTS ecom.customer_user_name_unique;

-- 3. Si la columna cus_handle no existía en absoluto, crearla:
ALTER TABLE ecom.customer ADD COLUMN IF NOT EXISTS cus_handle varchar(50) NULL;

-- 3b. Agregar el contador de cambios (límite de 2).
ALTER TABLE ecom.customer
ADD COLUMN IF NOT EXISTS cus_handle_changes_count INT NOT NULL DEFAULT 0;

-- 4. Verificar que no haya duplicados antes del UNIQUE.
SELECT cus_handle, COUNT(*)
FROM ecom.customer
WHERE cus_handle IS NOT NULL
GROUP BY cus_handle
HAVING COUNT(*) > 1;
-- Si NO devuelve filas → saltar al paso 6.

-- 5. (Solo si paso 4 mostró duplicados) backfill con sufijo numérico.
WITH handles AS (
  SELECT
    cus_id,
    LOWER(REGEXP_REPLACE(cus_first_name, '\s+', '', 'g')) AS base_handle,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(REGEXP_REPLACE(cus_first_name, '\s+', '', 'g'))
      ORDER BY cus_id
    ) AS rn
  FROM ecom.customer
  WHERE cus_handle IS NULL
)
UPDATE ecom.customer c
SET cus_handle = CASE
  WHEN h.rn = 1 THEN h.base_handle
  ELSE h.base_handle || h.rn::text
END
FROM handles h
WHERE c.cus_id = h.cus_id;

-- 6. Crear el UNIQUE INDEX (si no existe ya).
CREATE UNIQUE INDEX IF NOT EXISTS customer_handle_unique
  ON ecom.customer(cus_handle)
  WHERE cus_handle IS NOT NULL;

-- 7. Verificación final.
SELECT cus_id, cus_first_name, cus_user_name AS email, cus_handle
FROM ecom.customer
ORDER BY cus_id;
```

**Reglas de negocio del handle (`cus_handle`):**

1. **Captura en el registro:** el formulario de registro pide handle como campo opcional. Si el usuario lo deja vacío, se genera automáticamente desde `LOWER(cus_first_name)` con sufijo numérico si colisiona (igual que el backfill).
2. **Validación en tiempo real al registrarse:** al escribir, debounce 400ms y consultar `GET /handle/check/:handle` para mostrar disponible/ocupado.
3. **Sugerencias al colisionar:** si el handle elegido ya existe, el endpoint `GET /handle/suggestions?base=<handle>` devuelve 3-5 alternativas disponibles (ej. para `juan` devuelve `juan2`, `juan_gt`, `juanp`, `juanperez`, `juan23`).
4. **Cambio post-registro limitado a 2 veces:** `cus_handle_changes_count INT DEFAULT 0` lleva el contador. El endpoint `PUT /handle` rechaza con HTTP 403 cuando el contador llega a 2. La UI muestra "Te quedan X cambios disponibles".
5. **Edición desde configuración del perfil:** la sección que ya muestra cambio de password / email en `PersonalInfoTab` (o en una sección nueva `AccountSettingsTab`) agrega el campo de handle con el contador.
6. **Validación canónica del formato:** lowercase, 3-30 caracteres, regex `^[a-z0-9_]+$`. Sin espacios, sin acentos, sin caracteres especiales más allá del guion bajo. La validación se hace tanto en frontend (Yup) como en backend (regex en el endpoint).

**Endpoints nuevos:**

- `GET /handle/check/:handle` (público) — devuelve `{ available: boolean }`.
- `GET /handle/suggestions?base=<handle>` (público) — devuelve `{ suggestions: string[] }` con 3-5 alternativas.
- `PUT /handle` (auth) — body `{ handle: string }`. Valida formato, unicidad, e incrementa `cus_handle_changes_count`. Rechaza con 403 si el contador es ≥ 2.
- `POST /register` — extender body para aceptar `handle?: string` opcional. Si llega vacío, generar automático desde `cus_first_name`.
- `GET /publication/:id` — agregar `favorites_count` (`COUNT(*) FROM ecom.publications_favorites WHERE pub_id = ...`) y `is_favorite` (`EXISTS(SELECT 1 FROM ecom.publications_favorites WHERE pub_id = $1 AND cus_id = $2)`, `false` si no hay sesión).
- `GET /me` — devolver `cus_handle` mapeado a `handle` y `cus_handle_changes_count` mapeado a `handleChangesCount` en el JSON.
- `GET /search/users?q=<handle>` (opcional, futuro) — búsqueda de usuarios por handle (Fase 9 con follow).

**Frontend (Fase 4):**

- `types/api.ts`:
  - `AuthUser.handle: string | null` y `AuthUser.handleChangesCount: number`.
  - `UpdateHandlePayload`, `HandleCheckResponse`, `HandleSuggestionsResponse`.
- `hooks/api/useHandle.ts`:
  - `useCheckHandle(handle)` — query con `enabled: handle.length >= 3`.
  - `useHandleSuggestions(base)` — query con `enabled` similar.
  - `useUpdateHandle()` — mutation, invalida `currentUser`.
- `RegisterForm`:
  - Campo "Nombre de usuario" con asterisco optional.
  - Validación en tiempo real con icon de check verde / cross rojo.
  - Cuando está ocupado: mostrar 3 chips clickeables con sugerencias.
- `PersonalInfoTab` o `AccountSettingsTab`:
  - Campo de handle con el contador "Cambios disponibles: X / 2".
  - Si `handleChangesCount >= 2`: campo deshabilitado con tooltip explicando el límite.
- `PublicationContent`:
  - Reemplazar el mock derivado por `seller.handle` real (mostrar `@${handle}`).
- `useToggleFavorite()` con optimistic updates.
- `useMyFavorites()` para `/favorites`.
- `useMyPublications(cusId)` para `/my-publications`.
- Reemplazar `favoritesCount = 0` en `PublicationContent` por `publication.favoritesCount`.

### Fase 5 — Procesamiento de imágenes con `sharp`

```bash
# En el repo del backend
npm install sharp
```

**Cambio en handler de upload (`Codigo Aurelio`):**
- Recibir `multipart/form-data` con la foto original.
- Generar 3 variantes con `sharp`:
  - `_card.jpg` — 800×800, `fit: cover, position: 'attention'`, JPEG q80.
  - `_detail.jpg` — 1600×900, `fit: cover, position: 'attention'`, JPEG q85.
  - `_thumb.jpg` — 200×150, `fit: cover`, JPEG q75.
- Guardar la `_detail.jpg` como principal en `pubima_url`.
- Devolver al frontend el path de cada variante para que use el más apropiado.

**Resultado:** las cards ya no recortan localmente — el backend entrega la imagen optimizada para cada lugar.

### Fase 9 — Sponsors / publicaciones destacadas + follow

```sql
-- Marcar publicaciones como sponsoreadas (admin-only).
ALTER TABLE ecom.publications ADD COLUMN pub_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE ecom.publications ADD COLUMN pub_featured_until TIMESTAMP NULL;
CREATE INDEX publications_featured_idx ON ecom.publications(pub_featured) WHERE pub_featured = TRUE;

-- Follow entre usuarios (vendedor/comprador).
CREATE TABLE ecom.customer_follows (
  follower_id INTEGER NOT NULL REFERENCES ecom.customer(cus_id) ON DELETE CASCADE,
  followed_id INTEGER NOT NULL REFERENCES ecom.customer(cus_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, followed_id),
  CHECK (follower_id <> followed_id)
);
CREATE INDEX customer_follows_followed_idx ON ecom.customer_follows(followed_id);
```

**Endpoints nuevos:**
- `GET /publications` — agregar query param `featured=true` y devolver primero las destacadas vigentes (`pub_featured_until > NOW()`).
- `POST /follow/:cus_id`, `DELETE /follow/:cus_id` — follow/unfollow.
- `GET /follow/:cus_id/followers` — total de seguidores.
- `GET /me/following` — lista de vendedores que sigo.

**Frontend (Fase 9):**
- Activar `isFeatured={publication.pub_featured}` en `PublicationCard`.
- Botón "Seguir" en perfil del vendedor.
- Sección "De los vendedores que sigues" en home/explore.

### ✅ Fase 4.2 (resuelto) — Renombre `publication_comments` → `publications_comments`

Estandarizamos el plural en el nombre de la tabla de comentarios para alinear con el resto del schema (`publications`, `publications_detail`, `publications_images`, `publications_favorites`).

**Cambio aplicado al `database.sql` (consolidado, sin ALTER):**

La tabla NO estaba en `database.sql` (se había creado manualmente en la BD — viola §12.1). Se agregó adyacente a `publications_favorites` con:
- Nombre correcto en plural: `publications_comments`.
- FKs en `BIGINT` (alineadas con `publications.pub_id` y `customer.cus_id`) — el script original tenía `INTEGER`, que viola §12.3 y puede fallar en runtime.
- Campo `parent_id` para hilos de respuesta (que el backend ya usa en INSERT pero no estaba en el script original).
- Constraints con nombres explícitos: `fk_publications_comments_publication`, `fk_publications_comments_customer`, `fk_publications_comments_parent`.
- Índices `idx_publications_comments_pub_id` y `idx_publications_comments_parent_id`.

**Backend:** todas las queries en `connPostgresDB.js` actualizadas a `ecom.publications_comments` (3 ocurrencias en `getComments`, `deleteComment`, `addComment`).

**SQL de migración para entornos ya poblados (dev/staging):**

```sql
-- 1. Renombrar la tabla.
ALTER TABLE ecom.publication_comments RENAME TO publications_comments;

-- 2. (Recomendado) Migrar tipos de FK a BIGINT para consistencia con el schema canónico.
--    Si la tabla original fue creada con INTEGER, esto evita errores futuros al hacer joins.
ALTER TABLE ecom.publications_comments
  ALTER COLUMN pub_id SET DATA TYPE BIGINT USING pub_id::BIGINT;
ALTER TABLE ecom.publications_comments
  ALTER COLUMN cus_id SET DATA TYPE BIGINT USING cus_id::BIGINT;

-- 3. Verificación.
SELECT comment_id, pub_id, cus_id, parent_id, content, created_at
FROM ecom.publications_comments
ORDER BY created_at DESC
LIMIT 5;
```

> Nota: las FKs y los índices que apuntan a esta tabla se actualizan automáticamente con el RENAME (PostgreSQL ajusta las referencias). Si tu BD tiene la tabla `comment_reports` con un FK a `publication_comments(comment_id)`, ese FK seguirá funcionando porque PostgreSQL re-resuelve el OID interno.

### ✅ Fase 4.3 (completada) — Likes funcionales en comentarios

**Objetivo:** conectar el botón ❤ que ya existía en el scaffold para que toggle el like del usuario autenticado en cada comentario y respuesta, con optimistic update y fallback.

**Archivos creados/modificados:**

| Archivo | Cambio |
| --- | --- |
| `database.sql` | Nueva tabla `ecom.comment_likes` + índice `idx_comment_likes_comment_id` |
| `ecommerceGTBackEnd/config/connPostgresDB.js` | `getComments` extendido con `likesCount`/`isLiked`; nueva función `toggleCommentLike`; export agregado |
| `ecommerceGTBackEnd/server.js` | `GET /comments/:pub_id` → añade `authMiddlewareAux`; nuevo `POST /comments/:comment_id/like` con `authMiddleware` |
| `src/types/api.ts` | Campos `likesCount: number` e `isLiked: boolean` en `Comment`; nuevo tipo `ToggleCommentLikeResponse` |
| `src/hooks/api/usePublicationComments.ts` | `parsePublicationId` exportada para reuso |
| `src/hooks/api/useToggleCommentLike.ts` | **Nuevo hook** — mutation con optimistic update sobre la query de comentarios; rollback automático en error |
| `src/components/comments/ForumComment.tsx` | Props `isLiked`/`onLike` → botón interactivo condicional (corazón relleno cuando liked) |
| `src/components/comments/ForumReply.tsx` | Mismo tratamiento que `ForumComment` |
| `src/components/publications/PublicationComments.tsx` | Conecta `useToggleCommentLike`; `handleLike` redirige a `/login` si no hay sesión; deshabilitado si publicación cerrada |

**Decisiones técnicas:**
- Un solo `useMutation` a nivel de `PublicationComments`, con `commentId` como variable (evita crear N hooks para N comentarios).
- `authMiddlewareAux` en GET para devolver `isLiked` correcto cuando hay sesión, sin romper la ruta pública.
- Tabla usa `SERIAL PRIMARY KEY` + `UNIQUE (comment_id, cus_id)` para garantizar un like por usuario, sin riesgo de duplicados.
- FKs con `ON DELETE CASCADE` para que los likes se limpien al borrar comentario o cuenta.

**SQL de `comment_likes` aplicado:**

```sql
CREATE TABLE IF NOT EXISTS ecom.comment_likes (
    like_id    SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL REFERENCES ecom.publications_comments(comment_id) ON DELETE CASCADE,
    cus_id     BIGINT  NOT NULL REFERENCES ecom.customer(cus_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_comment_likes UNIQUE (comment_id, cus_id)
);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON ecom.comment_likes(comment_id);
```

**Pendiente (seguimiento):**
- Ejecutar el `CREATE TABLE` en la base de datos de desarrollo/producción (el script `database.sql` ya lo tiene).

---

### ✅ Fase 4.4 (completada) — Migración del backend al nuevo remote `techmindsgt`

**Objetivo:** mover `ecommerceGTBackEnd` del remote personal `joseaurelioporrasbucaro-prog` (cuenta individual) al remote organizacional `techmindsgt` (cuenta del equipo, conectada a Render/Vercel para despliegue automático), preservando toda la historia git.

**Estado de partida:**
- Repo viejo (`Documents/Proyectos Git /ecommerceGTBackEnd`) — historia completa, decenas de commits, `development.env` **trackeado** (credenciales en git).
- Repo nuevo (`Documents/ecommerceGTBackEnd`) — placeholder con 2 commits de cmiche que dejaban la cáscara configurada para Vercel: `dotenv.config()` sin path fijo, `.env` en `.gitignore`, health check `GET /`.

**Estrategia ejecutada:**
1. En el repo viejo, antes de migrar:
   - `git rm --cached development.env` (sacar credenciales del tracking, sin borrar el archivo local).
   - Agregar `.env` y `development.env` al `.gitignore`.
   - Comentar el `require("dotenv").config({ path: "../development.env" })` de `connPostgresDB.js` para que Vercel/Render inyecten las vars directo desde su dashboard.
   - Commit: `chore: configure for Vercel — untrack development.env, comment dotenv loader, add .env to gitignore`.
2. Agregar el nuevo remote y `git push techminds master --force` — la historia completa del viejo reemplaza los 2 commits placeholder.
3. En el repo local nuevo: `git fetch && git reset --hard origin/master`.
4. Re-aplicar manualmente los cambios de cmiche para Vercel que se habían perdido en el force-push (health check `GET /`, `start()` async con try/catch). Commit aparte: `chore(vercel): restore Vercel-compatible env loading and health check endpoint`.

**Bug fix encontrado en el camino — prefijo `ecom.` en todas las tablas:**
Render no resuelve el `search_path` al esquema `ecom` por defecto. Se prefijaron las 77 referencias de tablas en `connPostgresDB.js` con su esquema completo (`ecom.customer`, `ecom.publications`, etc.). Commit: `fix(db): prefija todas las tablas con esquema ecom. para Render`.

**Follow-up de cmiche (commit `8e9d00e Changes in environment`):**
- Renombró las env vars de la conexión a `DB_*` (`process.env.USER` → `DB_USER`, etc.) — `USER` chocaba con la var del sistema en algunos hosts.
- Encontró 4 prefijos `ecom.` que el regex original había omitido (joins con coma `FROM a, b, c` en vez de `FROM ... JOIN`): `subscriptions`, `business`, `cat_password_status`, `cat_publication_transac`.
- Plantilla de `.env` documentada en `info.txt`.

**Reorganización local:**
- Repo viejo renombrado a `Proyectos Git /ecommerceGTBackEnd-old` (archivo, sigue en disco para referencia/rollback).
- Repo nuevo movido a `Proyectos Git /ecommerceGTBackEnd` (toma el nombre original).
- Workspace actualizado para incluir ambos.

**Pendiente (seguimiento):**
- Sincronizar `.env` local cada vez que un compañero cambie nombres de variables. Sugerido: agregar un `.env.example` versionado al repo nuevo como fuente de verdad.

---

### ✅ Fase 5 (completada) — Wizard de crear/editar/eliminar publicación + sharp

Cerrada como conjunto de 4 sub-fases. Cada una se implementó en su propia branch y mergeó a `main` con `--no-ff`.

#### 5.1 — Eliminar publicación (soft-delete)

| Archivo | Cambio |
|---|---|
| `ecommerceGTBackEnd/config/connPostgresDB.js` | Nueva función `deletePublication`: valida ownership, rechaza vendidas con 409, idempotente para anuladas, hace `UPDATE pubsta_id = 4` (Anulada) |
| `ecommerceGTBackEnd/server.js` | Ruta `DELETE /publications/:id` con `authMiddleware` |
| `src/types/api.ts` | Tipo `DeletePublicationResponse` |
| `src/hooks/api/useDeletePublication.ts` | **Nuevo** — mutation con optimistic update sobre `useMyPublications` (cambia `pubsta_id` a 4 en cache para que el badge "Anulada" aparezca al instante), rollback en error |
| `src/components/publications/MyPublicationsMain.tsx` | Modal de confirmación estilizado con `react-responsive-modal`, botón Eliminar funcional, deshabilitado para vendidas/anuladas con tooltip explicativo, toasts de éxito/error |

#### 5.2 — Crear publicación (wizard)

| Archivo | Cambio |
|---|---|
| `src/types/api.ts` | `UploadImageResponse`, `UploadedImage`, `CreatePublicationPayload`, `CreatePublicationResponse`, `CheckerPublicationsResponse` |
| `src/hooks/api/useCreatePublication.ts` | **Nuevo** — mutation a `POST /savepubl`, invalida `useMyPublications` y `usePublications` al éxito |
| `src/hooks/api/useCheckerPublications.ts` | **Nuevo** — query a `POST /checkerpub` para validar cuota del plan |
| `src/components/Upload/DragDropSection.tsx` | Reescrito: multi-imagen con preview por `URL.createObjectURL`, sube cada archivo al soltarse (Promise independiente por upload — evita race condition con instancia de `useMutation` compartida), botón eliminar individual que llama `POST /deleteimg`, máx 10 imágenes / 8 MB c/u, dropzone con UI custom (un solo botón "Seleccionar archivos") |
| `src/components/Upload/UploadMain.tsx` | Form Formik+Yup con campos cascada (categoría → transacción, país → ciudad → municipio), campos condicionales según tipo (Casa/Apto: rooms/baños/parqueos; Apto: + nivel; Terreno: solo tamaño), bloqueo con upgrade message si plan agotado |
| `src/middleware.ts` | `/upload` agregado a `PROTECTED_ROUTES` |
| `src/app/upload-category/` y `src/components/Upload-Category/` | **Eliminados** — pantalla del template "Single/Multiple" no aplica a inmobiliario |

**Sub-fix 5.2.1 — selector de moneda Q/USD + formato de precio con miles/decimales**

- Nueva columna `pubdet_currency varchar(3) NOT NULL DEFAULT 'GTQ'` en `ecom.publications_detail`. Migración SQL para BDs existentes:
  ```sql
  ALTER TABLE ecom.publications_detail
    ADD COLUMN IF NOT EXISTS pubdet_currency varchar(3) NOT NULL DEFAULT 'GTQ';
  ```
- Backend `savePublication`/`updatePublication` aceptan `currency` (USD o GTQ default). `getPublications`, `getMyPublications`, `getMyFavorites`, `getPublicationById` devuelven `currency`.
- Frontend: `formatPrice(price, currency)` formatea con coma=miles, punto=decimal, símbolo `Q` o `$` según moneda.
- Form: input controlado con `formatPriceDisplay`/`parsePriceInput`, toggle visual de moneda con dos botones tipo segmented control.
- Bug fix relacionado: `_register.scss` textarea en `:focus` usaba `var(--clr-common-white)` (siempre blanco) → ilegible en dark mode. Cambiado a `var(--clr-bg-white)`.

#### 5.3 — Editar publicación

| Archivo | Cambio |
|---|---|
| Backend `getPublicationEditById` | `authMiddleware` + ownership check + incluye `pubdet_currency` y array de imágenes en la respuesta |
| Backend `updatePublication` | `authMiddleware` + ownership check + 409 si vendida + 409 si anulada + valida campos obligatorios (rechaza payloads incompletos para no wipear datos) + acepta nombres del frontend (`propertie`, `noRooms`, ...) con coalesce a los legacy (`category`, `rooms`, ...) |
| `src/components/Upload/PublicationForm.tsx` | **Nuevo** — extraído de `UploadMain` (635 líneas reusables). API: `initialValues`, `initialImages`, `submitLabel`, `cancelHref`, `onSubmit(values, images)`. Mount-once strategy (sin `enableReinitialize`) para que formik no pise cambios del usuario. Cascadas con ref `cascadeFirstMount` para skip-ear el primer mount. Pattern "waitFor" — re-asserts cada select cuando su query de catálogo termina de cargar (evita un quirk de React donde `<select controlled value="X">` no sincroniza si la `<option value="X">` aparece después del primer render) |
| `src/components/Upload/EditPublicationMain.tsx` | **Nuevo** — carga datos via `usePublicationEdit`, mapea `PublicationEditData` → `PublicationFormValues`, dispara `useUpdatePublication`. `key={publicationId}` en `PublicationForm` para mount fresh por publicación |
| `src/components/Upload/UploadMain.tsx` | Reducido a ~95 líneas, sólo wrapper que pasa initial vacío + dispara `useCreatePublication` |
| `src/hooks/api/usePublicationEdit.ts` | **Nuevo** — query a `GET /publication/edit/:id`, `staleTime: 5min`, `refetchOnWindowFocus: false` (evita refetch en blur+focus que pisara cambios del usuario) |
| `src/hooks/api/useUpdatePublication.ts` | **Nuevo** — mutation a `PUT /publications/:id`, invalida `useMyPublications`, `usePublications`, detail (`PUBLICATION_DETAIL_QUERY_KEY`) y `usePublicationEdit` |
| `src/app/publications/[id]/edit/page.tsx` | **Nuevo** — ruta protegida por middleware regex `^/publications/[^/]+/edit` |
| Tipos | `PublicationEditData`, `UpdatePublicationPayload`, `UpdatePublicationResponse` |

**Bug histórico descubierto y arreglado:** `updatePublication` desestructuraba `category`/`rooms`/`bathrooms`/`parking` del body pero el frontend mandaba `propertie`/`noRooms`/`noBathrooms`/`noParking`. Cada edit guardaba `pubgen_id=NULL` silenciosamente. SQL de reparación para BDs afectadas:

```sql
UPDATE ecom.publications p
SET pubgen_id = CASE
  WHEN pd.pubdet_size IS NOT NULL AND pd.pubdet_rooms IS NULL THEN 3
  WHEN pd.pubdet_level IS NOT NULL                            THEN 2
  WHEN pd.pubdet_rooms IS NOT NULL                            THEN 1
  ELSE p.pubgen_id
END
FROM ecom.publications_detail pd
WHERE p.pub_id = pd.pub_id AND p.pubgen_id IS NULL;
```

#### 5.4 — Procesamiento de imágenes con `sharp`

| Archivo | Cambio |
|---|---|
| `ecommerceGTBackEnd/package.json` | `sharp ^0.34.5` instalado |
| `ecommerceGTBackEnd/server.js` | Endpoint `/upload` ahora genera 3 variantes (`_thumb 200×150 q75`, `_card 800×800 q80`, `_detail 1600×900 q85`) en paralelo con `Promise.all`, JPEG con `mozjpeg: true`, fit `cover` + position `attention` (sharp recorta enfocando el sujeto principal). Devuelve `{ message, file, path, variants: { thumb, card, detail } }` |
| `src/utils/imageVariants.ts` | **Nuevo** — helper `getImageVariant(path, 'thumb' \| 'card' \| 'detail')` que toma el path original (`/uploads/images/X.jpg`) y devuelve el path de la variante (`X_card.jpg`). Maneja URLs absolutas y paths sin extensión sin tocarlos |
| `src/components/publications/PublicationCard.tsx` | Usa variante `_card` en grids con cadena de fallback `variant → original → placeholder` (state `imageStage` reemplaza al `imageError` boolean previo) |
| `src/components/publications/PublicationGallery.tsx` | Imagen principal usa `_detail`, thumbnails usan `_thumb`. Cada uno con su propia cadena de fallback |
| `src/components/publications/MyPublicationsMain.tsx` | `PublicationRowImage` usa `_card` (es un cuadradito de 120px) con fallback chain |
| Tipo `UploadImageResponse` | Añadido campo opcional `variants?: { thumb?, card?, detail? }` |

**Backwards compat:** publicaciones creadas antes de Fase 5.4 no tienen variantes en disco. El `onError` de cada `<Image>` cae al original automáticamente. Sin migración manual necesaria.

---

### Fase 6 — Sistema de notificaciones + menciones (`@usuario`)

**Contexto:** La pantalla `/activity` del scaffold ya existe pero muestra datos estáticos. La idea es conectarla como **centro de notificaciones unificado** del usuario logueado: menciones en comentarios, respuestas a sus comentarios, likes recibidos, mensajes nuevos (mensajería de Fase 6), y eventos de venta (Fase 7).

**Cambio al `database.sql` (consolidado, sin ALTER):**

```sql
-- Notificaciones. Una sola tabla genérica con `type` discriminador y `payload` JSONB
-- para los datos específicos de cada tipo (avatar del actor, snippet del comentario, etc.).
-- recipient_cus_id es el usuario que la VE; actor_cus_id es quien la disparó.
CREATE TABLE IF NOT EXISTS notifications (
    notif_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recipient_cus_id BIGINT NOT NULL,
    actor_cus_id BIGINT NULL,
    -- 'mention' | 'reply' | 'comment_like' | 'pub_favorite' | 'message' | 'sale_closed' | 'review_received'
    notif_type VARCHAR(40) NOT NULL,
    pub_id BIGINT NULL,
    comment_id INTEGER NULL,
    message_id BIGINT NULL,
    payload JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_recipient
        FOREIGN KEY (recipient_cus_id) REFERENCES customer(cus_id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_actor
        FOREIGN KEY (actor_cus_id) REFERENCES customer(cus_id) ON DELETE SET NULL,
    CONSTRAINT fk_notifications_publication
        FOREIGN KEY (pub_id) REFERENCES publications(pub_id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_comment
        FOREIGN KEY (comment_id) REFERENCES publications_comments(comment_id) ON DELETE CASCADE
);

-- Índice optimizado para "mis notificaciones no leídas, más recientes primero"
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
    ON notifications(recipient_cus_id, is_read, created_at DESC);
```

**Endpoints nuevos:**
- `GET /notifications` (auth) — lista paginada de las notificaciones del usuario logueado, JOIN con `customer` para datos del actor. Default 20 más recientes.
- `GET /notifications/unread-count` (auth) — `{ total: number }`. Para el badge del bell del header.
- `PUT /notifications/:id/read` (auth) — marca una como leída.
- `PUT /notifications/read-all` (auth) — marca todas las del usuario como leídas.

**Lógica de inserción automática (en endpoints existentes, `// Codigo Aurelio`):**

1. **Menciones en comentarios** — al ejecutar `POST /addcomment`:
   - Parsear `content` con regex `/@([a-z0-9_]{3,30})/gi` para detectar handles.
   - Por cada handle único, buscar `customer` con `cus_handle = $1`.
   - Si el `cus_id` resultante es distinto del autor del comentario, INSERT en `notifications` con `notif_type = 'mention'` y `payload = { snippet: <primeros 80 chars del content> }`.

2. **Respuestas a mis comentarios** — al ejecutar `POST /addcomment` con `parent_id != null`:
   - SELECT `cus_id` del comentario padre.
   - Si es distinto del autor de la respuesta y NO ya recibió notificación de mención del mismo comentario (evitar doble notif), INSERT con `notif_type = 'reply'`.

3. **Likes en comentarios** — al ejecutar `POST /comments/:id/like` (Fase 4.3):
   - INSERT con `notif_type = 'comment_like'` para el dueño del comentario, si es distinto del que da like.

4. **Mensajes nuevos** — al ejecutar `POST /sendMessage` (Fase 6):
   - INSERT con `notif_type = 'message'` para el receptor.

5. **Cierre de venta** — al ejecutar `POST /closeSale` (Fase 7):
   - INSERT con `notif_type = 'sale_closed'` para el comprador (con link a la encuesta).

**Frontend:**

- Tipos en `types/api.ts`:
  ```ts
  export type NotificationType =
    | 'mention' | 'reply' | 'comment_like' | 'pub_favorite'
    | 'message' | 'sale_closed' | 'review_received';

  export interface Notification {
    notifId: number;
    actorCusId: number | null;
    actorFirstName: string | null;
    actorLastName: string | null;
    actorHandle: string | null;
    notifType: NotificationType;
    pubId: number | null;
    commentId: number | null;
    messageId: number | null;
    payload: Record<string, unknown>;
    isRead: boolean;
    createdAt: string;
  }
  ```

- Hook `useNotifications()` con paginación (`useInfiniteQuery`).
- Hook `useUnreadCount()` con `refetchInterval: 60_000` para polling del badge.
- Hook `useMarkAsRead(id)` y `useMarkAllAsRead()` con invalidate.
- **`/activity` page** (existente como scaffold) → conectar a `useNotifications()`. Renderizar cada `Notification` con texto, avatar del actor, link al recurso (publicación/comentario/mensaje) y botón "marcar leída". El item se renderiza distinto según `notifType` con un helper `renderNotificationContent(notif)`.
- **Badge en header** (`HeaderOne` y `HeaderTwo`): bell icon con contador de no leídas. Click → `/activity`.

**Editor de comentarios con menciones (`@usuario`)**

- Componente nuevo `MentionTextarea`: textarea controlada que detecta `@` al escribir y abre un dropdown con sugerencias del endpoint `GET /search/users?q=<prefix>` (ya planificado en Fase 9).
- Al seleccionar un usuario del dropdown, se inserta `@<handle>` en el textarea.
- Al renderizar el contenido del comentario en `ForumComment`/`ForumReply`, parsear `@<handle>` y reemplazarlo por `<Link href="/creator-profile/<cusId>">@handle</Link>`. Necesita un mapa `handle → cusId` que viene en la respuesta del backend.

**Endpoint auxiliar:**
- `GET /search/users?q=<prefix>&limit=8` (público, prefix mínimo 2 chars) — devuelve `{ users: { cusId, handle, firstName, lastName, avatar }[] }`. Usado tanto por el dropdown de menciones como por el follow de Fase 9.

---

### Fase 5+ — Filtros avanzados de búsqueda en `/publications`

**Contexto:** hoy `/publications` filtra solo por `category` (Casa/Apto/Terreno) y por keyword. Los chips del sidebar derecho redirigen a `/publications?category=<X>` y la página lo lee en el query param. Pero los compradores en inmobiliario filtran por mucho más: rooms, baños, parqueos, niveles, tamaño, rango de precio, ubicación.

**Objetivo:** que los filtros del sidebar derecho (cuando el usuario está en `/publications`) sean **dinámicos según la categoría seleccionada** y reflejen los campos que el wizard de creación (Fase 5) realmente captura.

**Diseño propuesto:**

1. **Filtros base (siempre):**
   - Categoría (Casa / Apartamento / Terreno / Local / Bodega).
   - Tipo de transacción (Venta / Alquiler).
   - Rango de precio (slider).
   - Ubicación: País → Departamento → Municipio (cascadas reusando `useCountries`/`useCities`/`useMunicipalities`).

2. **Filtros condicionados a la categoría seleccionada:**
   - Si `category === 'Casa'` o `'Apartamento'`: habitaciones (1-5+), baños (1-3+), parqueos (0-3+), niveles (1-3+), tamaño en m².
   - Si `category === 'Terreno'`: tamaño en m² (slider amplio), uso de suelo (residencial/comercial/industrial — campo nuevo en wizard).
   - Si `category === 'Local Comercial'`: tamaño, parqueos, ubicación premium (boolean).

3. **Auto-actualización con el wizard (Fase 5):**
   - Cuando el wizard agregue un nuevo campo (ej. "Año de construcción", "Tiene piscina"), el filtro avanzado lo expone automáticamente.
   - Estructura: definir un `CATEGORY_FILTER_SCHEMA: Record<string, FilterField[]>` central. El wizard y el filtro lo leen del mismo lugar — la UI se sincroniza sola.
   - `FilterField`: `{ key, label, type: 'number' | 'range' | 'boolean' | 'select', options?, min?, max? }`.

**Cambios planificados:**

**Backend (en `getPublications` de `connPostgresDB.js`, `// Codigo Aurelio`):**

```js
// Aceptar todos los filtros como query params:
// ?category=Casa&minPrice=500000&maxPrice=2000000&rooms=3&bathrooms=2
// &parking=1&country=1&city=2&town=10&size_min=80&size_max=200&sort=price_asc
```

Construir la query SQL dinámicamente con un WHERE compuesto por los filtros que llegan. Usar parámetros `$N` para evitar SQL injection.

**Frontend:**

- Componente nuevo `AdvancedFiltersPanel` que vive en el sidebar derecho cuando la ruta es `/publications` (reemplaza/complementa al `PublicCategoriesSidebar` cuando no hay sesión, o se agrega al `AccountRightSidebar` cuando sí).
- Estado de filtros sincronizado con URL (`router.push('/publications?...')`) para que las búsquedas sean compartibles.
- Hook `usePublications` extendido para aceptar filtros y pasarlos como query params al backend.
- Tipo `PublicationFilters` extendido con todos los campos.

**Estimación:** 2 días (backend + frontend + testing).

**Asignación de fase:** **Fase 5+** — depende de tener primero el wizard de creación con los campos finales decididos. Si el wizard agrega un campo (ej. "Tiene piscina"), el filtro lo gana sin cambiar código del filtro, gracias al schema central.

---

### Endpoints de auth pendientes (cualquier fase)

Detectados en revisiones anteriores; sin urgencia inmediata pero documentados:
- `PUT /publications/:id`, `POST /changestatus`, `POST /deleteimg`, `POST /getemployees` — agregar middleware `auth` que falta.
- Cookie en producción → `SameSite=None; Secure` (Fase 10 / deploy).
- Refresh token para sesión > 1 hora (Fase 10).

### ✅ Fase 4.1 (resuelto) — Tag "Vendida" en cards públicas y favoritos

Aplicado en commit posterior a Fase 4. Ahora `/publications`, `/favorites` y `/my-publications` muestran badges según `pubstaId`:
- `getPublications` y `getMyFavorites` (backend) — agregaron `p.pubsta_id as "pubstaId"` al SELECT. `getMyFavorites` también agregó `category` real (antes el frontend lo hardcodeaba).
- `PublicationListItem.pubstaId` y `FavoriteItem.pubstaId` (frontend) — tipados correctamente.
- Helper `getStatusBadge(pubstaId)` extraído a `publicationUtils.ts` con constantes `PUBSTA_DRAFT/PUBLISHED/SOLD/VOID`.
- `PublicationCard` muestra el badge encima de la imagen. Tag rojo "Vendida" para id=3, gris "Borrador" para id=1, gris oscuro "Anulada" para id=4. El badge gana sobre "Nuevo" (no se ven dos a la vez en la misma esquina).

---

### ✅ Fase 6.1 (completada) — Mensajería básica (inbox + conversación + polling)

Aplicado en commit `082c672` y mergeado a `main` (`ff5d384`). El backend ya tenía los endpoints (`POST /messages/send`, `GET /messages/conversation/:pub/:other`, `GET /messages/unread`, `POST /messages/mark-read`, `GET /messages/inbox`) — solo se cableó frontend.

**Hooks (`src/hooks/api/useMessages.ts`):**
- `useInbox()` — polling 30s.
- `useConversation(pubId, otherUserId)` — polling 5s mientras está abierta (efecto "tiempo real" sin websockets).
- `useUnreadMessagesCount()` — polling 60s para badge del header.
- `useSendMessage()` — mutation con optimistic update (id negativo temporal) + rollback en error.
- `useMarkConversationAsRead()` — invalida inbox y unread al success.

**UI:**
- `/messages` (auth-protected) con layout sidebar + conversación.
- Botón "Contactar" en `PublicationContent` → `/messages?pub=X&with=sellerId`.

---

### Fase 6.2 (en progreso) — UI estilo Facebook Messenger + reacciones, reply y reportes

**Contexto:** la Fase 6.1 dejó la mensajería funcional pero con UI básica. Esta sub-fase trae la experiencia al nivel de un cliente de chat real: layout de 3 columnas, ancho completo, hover actions sobre los mensajes (reaccionar, responder, denunciar) y un panel derecho con accesos directos.

**Cambios de layout aplicados:**

| Archivo | Cambio |
| --- | --- |
| `src/layout/DefaultWrapper.tsx` | Nueva lista `TOP_NAV_PAGES = ['/messages']`. En esas rutas: usa `HeaderOne` (navbar horizontal arriba) en vez de `HeaderTwo` (sidebar izq fijo). Sin footer y `overflow: hidden` para que el chat ocupe el viewport sin scroll global. Sidebar derecho aislado en componente interno `<RightSidebarSlot />`. |
| `src/layout/header/HeaderOne.tsx` | Removido el dropdown de perfil (Mi perfil / Cerrar sesión — esas viven en el sidebar derecho ahora). Removido el botón Login (la ruta está auth-protected). Agregado el toggle de tema (luna/sol) inline al lado del selector ES \| EN. La clase `home3-mode-switch` es **obligatoria**, sin ella el wrapper queda con `position: fixed` y desaparece del header. |
| `src/components/messages/MessagesMain.tsx` | Reescrito con grid de 3 columnas (`300px \| 1fr \| 260px`). Estado `mobilePanel: 'list' \| 'chat'` para alternar paneles en móvil con botón "← Chats". Sin `Breadcrumbs` (Messenger no tiene), título "Chats" inline en el sidebar. Altura `calc(100vh - 90px)` para que llene la pantalla. |
| `src/components/messages/InboxList.tsx` | Búsqueda con debounce, tabs "Todos / No leídos" con badge contador. Avatars 44px con dot indicator de unread. Tiempo formateado relativo (HH:MM hoy, día abreviado esta semana, DD MMM más viejo). |
| `src/components/messages/ConversationView.tsx` | Header compacto con solo avatar + nombre (el título de la publicación migró al panel derecho). Burbujas alineadas a la derecha cuando son propias. Texto blanco forzado en burbujas `is-mine` con `color: inherit`. Hora oculta por default, visible on hover. Acciones on hover: reaccionar (picker de 6 emojis Unicode), responder, denunciar. **Bug fix:** `Number(message.sender_id) === Number(myUserId)` — pg devuelve BIGINT como string, la comparación estricta fallaba y todas las burbujas iban a la izquierda. |
| `src/components/messages/ConversationInfoPanel.tsx` | **Nuevo.** Panel derecho con avatar grande + nombre del contacto, botones "Perfil" y "Publicación", acordeón con accesos directos y otro con detalle de la publicación. |
| `src/layout/sidebar/AccountRightSidebar.tsx` | Removido `comingSoon: true` del item "Mensajes" — ahora navega a `/messages`. |

**Backend aplicado (`Codigo Aurelio` en `ecommerceGTBackEnd`):**

1. `database.sql`:
   - Columna `reply_to_message_id INTEGER NULL` agregada a `CREATE TABLE messages` con `ON DELETE SET NULL` para preservar hilos al borrar un mensaje padre.
   - `CREATE TABLE IF NOT EXISTS ecom.message_reactions` — `(message_id, cus_id)` UNIQUE para garantizar una reacción por usuario por mensaje. Cambiar de emoji = UPSERT; mismo emoji = toggle off.
   - `CREATE TABLE IF NOT EXISTS ecom.message_reports` — `reason VARCHAR(40)` (`spam` / `ofensivo` / `estafa` / `otro`) + `detail TEXT NULL`. UNIQUE `(message_id, reporter_cus_id)` para evitar spam.
2. `config/connPostgresDB.js`:
   - `sendMessage` acepta `reply_to_message_id?` opcional en el body.
   - `getConversation` ahora trae también `reply_to_content`, `reply_to_sender_id`, `reply_to_sender_name` (LEFT JOIN sobre messages) y `reactions` agregadas como JSON (`[{ emoji, count, mine }]`) usando una subquery.
   - Nuevas funciones `reactToMessage` (toggle/upsert con verificación de pertenencia a la conversación) y `reportMessage` (solo reportes sobre mensajes RECIBIDOS, no propios).
3. `server.js`:
   - `POST /messages/:message_id/react` con `authMiddleware`.
   - `POST /messages/:message_id/report` con `authMiddleware`.

**SQL de migración para entornos ya poblados (dev/staging):**

```sql
-- 1. Columna de reply en messages (la tabla puede vivir en schema `ecom` o `public`
--    según el momento de creación — verificar con \dt antes).
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS reply_to_message_id INTEGER NULL;
ALTER TABLE messages
  ADD CONSTRAINT fk_msg_reply
  FOREIGN KEY (reply_to_message_id) REFERENCES messages(message_id) ON DELETE SET NULL;

-- 2. Reacciones
CREATE TABLE IF NOT EXISTS ecom.message_reactions (
    reaction_id SERIAL PRIMARY KEY,
    message_id  INTEGER NOT NULL,
    cus_id      BIGINT  NOT NULL,
    emoji       VARCHAR(16) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_message_reactions UNIQUE (message_id, cus_id),
    CONSTRAINT fk_message_reactions_message
        FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    CONSTRAINT fk_message_reactions_customer
        FOREIGN KEY (cus_id) REFERENCES ecom.customer(cus_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON ecom.message_reactions(message_id);

-- 3. Reportes / denuncias
CREATE TABLE IF NOT EXISTS ecom.message_reports (
    report_id        SERIAL PRIMARY KEY,
    message_id       INTEGER NOT NULL,
    reporter_cus_id  BIGINT  NOT NULL,
    reason           VARCHAR(40) NOT NULL,
    detail           TEXT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_message_reports UNIQUE (message_id, reporter_cus_id),
    CONSTRAINT fk_message_reports_message
        FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    CONSTRAINT fk_message_reports_reporter
        FOREIGN KEY (reporter_cus_id) REFERENCES ecom.customer(cus_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_message_reports_message_id ON ecom.message_reports(message_id);
```

**Frontend wireup:**

- `src/types/api.ts` — nuevos tipos `MessageReaction`, `MessageReportReason`, `ReactToMessagePayload`, `ReactToMessageResponse`, `ReportMessagePayload`. `ConversationMessage` extendido con `reply_to_*` y `reactions`. `SendMessagePayload` acepta `reply_to_message_id?`.
- `src/hooks/api/useMessages.ts` — nuevos hooks `useReactToMessage` (con optimistic update sobre el array `reactions` del mensaje, manejo de toggle/replace) y `useReportMessage`. `useSendMessage` propaga `reply_to_message_id` en el optimistic.
- `src/components/messages/ConversationView.tsx` reescrito:
  - State para `replyTo` (mensaje al que se responde) y `reportTarget` (modal).
  - Preview de "Respondiendo a..." sobre el composer con botón X para cancelar.
  - `MessageBubble`:
    - Muestra snippet del mensaje padre arriba de la burbuja cuando es reply.
    - Acciones on hover: reaccionar, responder, **denunciar** (este último solo en mensajes recibidos — backend rechaza reportes de propios).
    - Picker permanece abierto con flag `showReactions` + click-outside detector (arregla el bug donde se cerraba al salir del hover).
    - Resumen de reacciones como pills clickeables debajo del bubble — la propia queda resaltada en theme-1.
  - `ReportModal` — modal con 4 razones predefinidas (spam, ofensivo, estafa, otro) + campo opcional de detalle (max 500 chars).

**Bonus aplicado en esta misma fase:**

- `src/layout/sidebar/AccountRightSidebar.tsx` — removido `comingSoon: true` del item "Mensajes" (ya navega a `/messages`). Ahora también usa `generateInitialsAvatar` cuando el usuario logueado no tiene foto.
- `src/layout/header/HeaderOne.tsx` — agregada clase modificadora `home3-mode-switch` al toggle de tema para que aparezca inline en lugar de `position: fixed` al borde derecho.
- **`src/utils/avatarUtils.ts`** (nuevo) — utilidad `generateInitialsAvatar(name, size)` que genera un SVG data URL con las iniciales sobre un fondo de color tomado de una paleta de 10 (hash determinista del nombre — el mismo usuario siempre obtiene el mismo color). Aplicado en `InboxList`, `ConversationView`, `ConversationInfoPanel` y `AccountRightSidebar` como fallback cuando `cus_imagen` es null. Reemplaza el placeholder roto `/assets/img/profile/default-avatar.png` que no existía en `public/`.


---

### ✅ Fase 6.3.1 (completada) — Centro de notificaciones unificado

**Contexto:** la pantalla `/activity` mostraba datos estáticos del scaffold. Esta sub-fase la conecta a un centro de notificaciones REAL, con tabla genérica `notifications` discriminada por `notif_type`, e inserción automática desde los endpoints existentes (mensajes, comentarios, likes). El badge bell vive en `HeaderOne` y `HeaderTwo`.

**Backend aplicado (`Codigo Aurelio` en `ecommerceGTBackEnd`):**

1. `database.sql` — nueva tabla `ecom.notifications` con JSONB payload:
   - `notif_type VARCHAR(40)` discriminador (`mention` / `reply` / `comment_like` / `pub_favorite` / `message` / `sale_closed` / `review_received`).
   - FKs `recipient_cus_id`, `actor_cus_id` (SET NULL al borrar actor), `pub_id`, `comment_id`, `message_id` (todas CASCADE excepto actor).
   - Índice `idx_notifications_recipient_unread (recipient_cus_id, is_read, created_at DESC)` para query óptima del feed.

2. `config/connPostgresDB.js`:
   - **Helper interno `insertNotification`** — UPSERT silencioso (loguea errores sin propagar para no romper el flujo principal); no auto-notifica (actor === recipient → skip).
   - **Helper interno `resolveMentions`** — parsea regex `/@([a-z0-9_]{3,30})/gi`, resuelve handles a `cus_id` via SQL, filtra al autor.
   - **`addComment`** extendido con inserción de notif:
     - `mention` por cada `@handle` distinto al autor.
     - `reply` al dueño del comentario padre — pero NO si ya fue mencionado (evita doble notif).
   - **`toggleCommentLike`** extendido — notif `comment_like` solo al dar like (no al quitarlo).
   - **`sendMessage`** extendido — notif `message` al receptor.
   - **4 handlers nuevos**: `getNotifications` (paginado, cursor-based con `before=<iso>`), `getNotificationsUnreadCount`, `markNotificationAsRead`, `markAllNotificationsAsRead`.

3. `server.js` — 4 rutas nuevas con `authMiddleware`:
   - `GET /notifications` — listado paginado (default 20).
   - `GET /notifications/unread-count` — `{ total }`.
   - `PUT /notifications/:notif_id/read` — marca una como leída.
   - `PUT /notifications/read-all` — marca todas las del usuario.

**SQL de migración para entornos ya poblados (dev/staging):**

```sql
CREATE TABLE IF NOT EXISTS ecom.notifications (
    notif_id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recipient_cus_id BIGINT NOT NULL,
    actor_cus_id     BIGINT NULL,
    notif_type       VARCHAR(40) NOT NULL,
    pub_id           BIGINT  NULL,
    comment_id       INTEGER NULL,
    message_id       INTEGER NULL,
    payload          JSONB DEFAULT '{}',
    is_read          BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_recipient
        FOREIGN KEY (recipient_cus_id) REFERENCES ecom.customer(cus_id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_actor
        FOREIGN KEY (actor_cus_id) REFERENCES ecom.customer(cus_id) ON DELETE SET NULL,
    CONSTRAINT fk_notifications_publication
        FOREIGN KEY (pub_id) REFERENCES publications(pub_id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_comment
        FOREIGN KEY (comment_id) REFERENCES ecom.publications_comments(comment_id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_message
        FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
    ON ecom.notifications(recipient_cus_id, is_read, created_at DESC);
```

**Frontend wireup:**

- `src/types/api.ts` — tipos `NotificationType`, `AppNotification`, `NotificationsUnreadResponse`.
- `src/hooks/api/useNotifications.ts` (nuevo) — 4 hooks:
  - `useNotifications(enabled)` — listado, polling 60s.
  - `useNotificationsUnreadCount(enabled)` — contador, polling 60s.
  - `useMarkNotificationAsRead()` — mutation con optimistic update (marca local + decrementa contador).
  - `useMarkAllNotificationsAsRead()` — mutation que limpia todo el cache local en `onSuccess`.
- `src/components/notifications/notificationUtils.ts` (nuevo) — `getNotificationContent(notif)` devuelve `{ text, snippet, href, icon, iconColor }` por tipo. Reusado entre el dropdown y `/activity`. Incluye `formatRelativeTime` ("hace 5 min", "hace 2 d", "12 nov").
- `src/components/notifications/NotificationItem.tsx` (nuevo) — renderiza una notif: avatar del actor (con fallback `generateInitialsAvatar`), badge circular con ícono de tipo + color, texto, snippet en cursiva, hora relativa, dot morado si está unread. Click → callback + navegación via `<Link>`.
- `src/components/notifications/NotificationBell.tsx` (nuevo) — bell con badge de unread count, dropdown 380px con lista compacta + footer "Ver todas" → `/activity`. Cierra al click-outside.
- `src/components/activity/ActivityMain.tsx` reescrito — usa `useNotifications()` real, header con "Marcar todas como leídas", estados de loading/error/empty. Eliminados los imports de `activityData` y `Image` (ahora vive todo en `NotificationItem`).
- `src/layout/header/HeaderOne.tsx` + `HeaderTwo.tsx` — `<NotificationBell />` insertado antes del toggle de tema. En HeaderTwo solo aparece cuando hay sesión.

**Pendiente (6.3.2):**
- Componente `MentionTextarea` con dropdown de sugerencias `@usuario` (depende del endpoint nuevo `GET /search/users?q=<prefix>`).
- Renderizar `@<handle>` como `<Link href="/creator-profile/<cusId>">@handle</Link>` en `ForumComment`/`ForumReply` — necesita mapa `handle → cusId` desde el backend.
- Notifs `pub_favorite` (al endpoint de toggle favorite) y `sale_closed` / `review_received` (cuando se implementen las fases 7+).

---

### ✅ Fase 6.3.2 (completada) — Notificaciones faltantes + UI con tabs + bug fixes

**Contexto:** después de probar 6.3.1, el usuario detectó que las notificaciones de comentarios y likes no llegaban — solo las de mensajes. Investigación reveló que mi implementación inicial omitía dos casos críticos. Esta sub-fase los agrega y reescribe `/activity` con tabs por categoría siguiendo el patrón de la plantilla original.

**Bug fix en backend (`Codigo Aurelio`):**

1. **Faltaba notificar al dueño de la publicación cuando alguien comentaba.**
   - `addComment` ahora distingue:
     - `parent_id != null` → reply al dueño del comentario padre (ya estaba).
     - `parent_id == null` → comentario raíz → **nueva** notif `comment` al dueño de la publicación.
   - En ambos casos respeta la regla de "no doble notif" si el destinatario ya fue mencionado con @handle.

2. **Faltaba notificar al dueño cuando alguien marcaba favorito.**
   - `AddFavoritePubl` ahora inserta notif `pub_favorite` para el dueño cuando se ACTIVA un favorito (insert nuevo, o reactivación de uno desactivado). NO notifica al desactivar.

3. **Nuevo tipo `comment`** agregado al enum `notif_type`. La columna sigue siendo `VARCHAR(40)` por lo que no requiere migración de schema.

**Frontend (wireup del tipo nuevo):**

- `src/types/api.ts` — `NotificationType` extendido con `'comment'`.
- `src/components/notifications/notificationUtils.ts` — case `comment` agregado al renderer: texto "{name} comentó en tu publicación", ícono `fa-comment-alt`, color `#0984e3`.

**UI: `/activity` con tabs por categoría (estilo plantilla original):**

- `src/components/activity/ActivityMain.tsx` reescrito con `<nav class="activity-tabs">`:
  - **Todas** — todas las notificaciones.
  - **Comentarios** — `mention | reply | comment`.
  - **Likes** — `comment_like | pub_favorite`.
  - **Mensajes** — `message`.
  - **Ventas** — `sale_closed | review_received` (placeholder para Fase 7).
- Cada tab muestra **badge de unread** por categoría (rojo, 9+ cap).
- Filtrado client-side sobre el listado completo — el backend devuelve todo, el filtro vive en `useMemo`.
- Empty state distinto si la categoría está vacía vs si no hay notificaciones en absoluto.
- **Fix del footer gap**: `.activity-area { min-height: calc(100vh - 220px); }` evita que el footer se pegue cerca del header cuando hay pocas notificaciones.

**Cache de Next.js (instrucción de troubleshooting):**

Si al reiniciar `npm run dev` aparece `Error: Cannot find module './XXX.js'` (típicamente en `.next/server/webpack-runtime.js`), es un cache stale del bundler. Solución:

```bash
rm -rf .next
npm run dev
```

Esto es esperable cuando cambia mucho código entre runs. No es bug del proyecto.

**Estado de la cobertura de notificaciones:**

| Trigger | Tipo notif | Implementado |
| --- | --- | --- |
| `POST /addcomment` con `parent_id = null` | `comment` | ✅ |
| `POST /addcomment` con `parent_id != null` | `reply` | ✅ |
| `POST /addcomment` con `@handle` en contenido | `mention` | ✅ |
| `POST /comments/:id/like` (al likear) | `comment_like` | ✅ |
| `POST /addpubl` (toggle favorite activado) | `pub_favorite` | ✅ |
| `POST /messages/send` | `message` | ✅ |
| `POST /close-sale` | `sale_closed` | ⬜ Fase 7 |
| Endpoint de reseñas (futuro) | `review_received` | ⬜ Fase 7 |

**Pendiente para Fase 6.3.3 (no urgente):**
- `MentionTextarea` con dropdown `@usuario` y endpoint `GET /search/users?q=<prefix>`.
- Linkificación de `@handle` en `ForumComment` / `ForumReply` (mapa `handle → cusId`).
- Notifs en cierre de venta y reseñas (esperan Fase 7).

---

### Hotfix — Responsive breakpoint de los sidebars (1400 → 1600)

**Problema reportado:** el layout se rompía a 1400px en `/`, `/my-publications`, `/favorites`, `/messages`, `/creator-profile/[id]` (todas las rutas con `HeaderTwo`). El contenido se veía apretado y elementos se montaban entre sí.

**Causa raíz:** el template original define el umbral de sidebars fijos en `@media (min-width: 1400px)` en tres lugares:
- `.menu2-side-bar-wrapper { left: 0 }` — sidebar izquierdo
- `.sidebar-category-filter-wrapper { right: 0 }` — sidebar derecho
- `.c-container-1 { width: calc(100% - 583px) }` — container del header

A 1400px exacto, los dos sidebars ocupan 550px y los gutters suman ~33px, dejando solo **817px de ancho útil** para el contenido. En ese ancho el grid de cards, el hero banner y otros componentes quedan inservibles.

**Fix:** override global en `DefaultWrapper` que sube el umbral a **1600px**.

```css
/* 1400–1599: sidebars off-canvas, hamburguesa visible */
@media (min-width: 1400px) and (max-width: 1599px) {
  .menu2-side-bar-wrapper { left: -300px !important; }
  .sidebar-category-filter-wrapper { right: -300px !important; }
  .c-container-1 { width: 100% !important; }
  .menu-bar.d-xxl-none,
  .product-filter-btn.d-xxl-none { display: inline-block !important; }
}

/* 1600+: ambos sidebars fijos como antes */
@media (min-width: 1600px) {
  .app-layout.has-left-sidebar { padding-left: 275px; }
  .app-layout.has-right-sidebar { padding-right: 275px; }
}
```

**Resultado:** entre 1400 y 1599px ahora se usa el layout off-canvas (con hamburguesas izq/der para abrir los sidebars). A partir de 1600px los sidebars vuelven a quedar fijos y visibles permanentemente. La rama de `/messages` (HeaderOne, sin sidebar izq) recibe el mismo tratamiento para el sidebar derecho.

No se tocó `_header.scss` directamente — el override vive en `DefaultWrapper` para que un futuro upgrade del template no pierda el cambio.

---

### Polling frequency de las queries (referencia)

| Hook | Intervalo | Cuándo |
| --- | --- | --- |
| `useNotificationsUnreadCount` | 60s | Mientras hay sesión (bell en headers) |
| `useNotifications` | 60s | Solo si el dropdown está abierto o estás en `/activity` |
| `useUnreadMessagesCount` | 60s | Disponible, no wireado al header todavía |
| `useInbox` | 30s | Solo en `/messages` |
| `useConversation` | 5s | Solo con una conversación abierta |

Carga típica: 1 req/min para un usuario normal logueado (solo bell). ~16 req/min en `/messages` con chat abierto. Es polling pragmático sin WebSockets; si crece la base de usuarios habrá que migrar a SSE/WS (fase futura).

---

### Hotfix — Layout consistency en `/favorites` y home-three

**1. `/favorites` ahora espeja `/publications` (mismo UX)**

El usuario reportó que `/favorites` se veía roto comparado con `/publications` (que sí funcionaba bien). La diferencia: `FavoritesMain` solo renderizaba un `<div className="row">` con `PublicationCard`s, sin todo el resto del UX (categorías, filtros, sort, infinite scroll, empty states).

**Refactor aplicado:**

- **`src/components/publications/CategorySlider.tsx` (nuevo):** se extrajo el slider de categorías que estaba inline en `PublicationsMain`. Acepta un prop `uniqueId` para que las flechas Swiper de cada instancia no se peleen cuando hay más de un slider en la página.
- **`PublicationsMain.tsx`:** importa el `CategorySlider` desde el nuevo archivo. Eliminado código duplicado (~120 líneas).
- **`FavoritesMain.tsx`:** reescrito espejando `PublicationsMain` — `CategorySlider`, `PublicationsBar`, filtros con `useMemo`, infinite scroll con `IntersectionObserver`, mismos empty states. Diferencias:
  - Usa `useMyFavorites` en vez de `usePublications`.
  - Mapea `FavoriteItem → PublicationListItemAuth` para reusar `PublicationCard`.
  - No lee filtros desde URL (a diferencia de `/publications` que respeta `?category=`).
  - Empty state propio: "Tocá el corazón en cualquier propiedad para agregarla acá".

**2. Bug del home-three (y de cualquier página que use `c-container-1`)**

**Síntoma:** a viewport ≥1600px, el hero de `/home-three` y otros componentes que usan `c-container-1` quedaban apretadísimos.

**Causa raíz:** el template define `.c-container-1 { width: calc(100% - 583px); }` a partir de 1400px, asumiendo que el padre es el viewport (sin padding). Pero nuestro `DefaultWrapper` aplica `padding-left: 275px` y `padding-right: 275px` al `app-layout` para empujar el contenido entre los sidebars fijos. Resultado: a 1600px viewport el container quedaba en `(1600 - 550) - 583 = 467px` en vez de los ~1050px que debería tener.

**Fix:** override `c-container-1` a `width: 100%` cuando hay sidebars y viewport ≥1600px — el padding del `app-layout` ya ocupa el espacio de los sidebars, no hay que volver a restar.

```css
@media (min-width: 1600px) {
  .app-layout.has-left-sidebar .c-container-1,
  .app-layout.has-right-sidebar .c-container-1 {
    width: 100% !important;
  }
}
```

Aplicado también a la rama de `/messages` (HeaderOne) por consistencia.

---

### Hotfix — Headers responsive en rango 1600–1851

**Problema reportado:**
1. **HeaderOne (`/messages`)**: el menú horizontal (Home / Propiedades / Creators / Pages / Forum / Contact + búsqueda + lang + bell + theme) se parte en 2 filas entre 1600 y 1799px.
2. **HeaderTwo (resto de features)**: la búsqueda gigante (600px hardcoded) + los botones de la derecha (lang + bell + theme) se ocultan / cortan entre 1600 y 1851px.

**Causa raíz:** el template define anchos FIJOS sin media queries para esos rangos:
- `.header-main2-content .filter-search-input.header-search { width: 600px; }` en HeaderTwo.
- `.filter-search-input.header-search { width: 330px; }` en HeaderOne.
- `.main-menu1 { margin-right: 95px; }` margen enorme del menú.

A 1600px de viewport con los dos sidebars visibles, el área útil queda en 1050px. `col-xl-7` da ~612px de los cuales el search consume 600 → sobran 12px para hamburguesa/etc. Y en `col-xl-5` (~480px) el bell que agregamos en Fase 6.3.1 termina empujando todo afuera. En HeaderOne pasa lo mismo con el menú de 7 items + 95px de margin-right + el bell.

**Fix:** override responsive en `DefaultWrapper` para el rango 1600–1851:

```css
@media (min-width: 1600px) and (max-width: 1851px) {
  .header-main2-content .filter-search-input.header-search { width: 380px !important; }
  .header-main2-content .filter-search-input.header-search input { width: 100% !important; }
  .header1 .filter-search-input.header-search { width: 220px !important; }
  .main-menu1 { margin-right: 30px !important; }
}
```

Aplicado en ambas ramas del `DefaultWrapper` (la principal con HeaderTwo y la de `/messages` con HeaderOne). Resultado:
- Search bar de HeaderTwo: 600px → 380px en este rango (sigue siendo cómodo para escribir).
- Search bar de HeaderOne: 330px → 220px.
- Margin-right del menú: 95px → 30px (el template ya lo usa así en xxl/xl, lo extendemos al rango siguiente).

A partir de 1852px el viewport ya tiene espacio sobrado y vuelven los anchos originales del template.

---

### Hotfix v2 — Headers responsive (rangos extendidos + safety net)

El primer hotfix no cubrió suficiente:

1. **HeaderOne (`/messages`)** se seguía partiendo en 2 filas en **1200-1302** (rango xl) — el primer fix solo cubría 1600-1851.
2. **HeaderTwo** la búsqueda seguía tapando el bell y el toggle de tema entre 1600 y 1851 — el width 380px probablemente no era suficiente porque el template tiene varios `.filter-search-input.header-search input { width: 100% }` heredados que extendían el input al 100% del wrapper.

**Cambios v2:**

```css
/* HeaderOne tighter en xl + xxl (1200-1599) — no solo en 1600-1851 */
@media (min-width: 1200px) and (max-width: 1599px) {
  .header1 .filter-search-input.header-search {
    width: 180px !important;
    max-width: 180px !important;
  }
  .main-menu1 { margin-right: 20px !important; }
}

/* HeaderTwo + HeaderOne en 1600-1851 — más conservador + safety net */
@media (min-width: 1600px) and (max-width: 1851px) {
  .header-main2-content .filter-search-input.header-search {
    width: 320px !important;
    max-width: 100% !important;  /* nunca excede su columna */
  }
  .header-main2-content .filter-search-input.header-search input {
    width: 100% !important;
    max-width: 100% !important;
  }
  .header1 .filter-search-input.header-search {
    width: 220px !important;
    max-width: 220px !important;
  }
  .main-menu1 { margin-right: 30px !important; }
}
```

**Key insight:** agregamos `max-width: 100%` como safety net. Aunque el template define `width: 600px` con !important en otra parte (hipotéticamente), el `max-width: 100%` hace que el search bar nunca exceda su columna padre. Esto elimina la posibilidad de que cubra visualmente al bell/theme del col-xl-5.

**Importante para ver los cambios:** correr `rm -rf .next && npm run dev`. Sin esto el HMR puede dejar el CSS viejo cacheado y las overrides nuevas no aparecen.
