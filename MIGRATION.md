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
| **6.3.3** | `MentionTextarea` con dropdown `@usuario` + linkificación en comentarios renderizados | ✅ Completada | 1 día |
| **7** | Cierre de venta + reseñas | ✅ Completada | 1 día |
| **8** | Empresas y planes | ✅ Completada | 1–2 días |
| **8.3.5** | Password recovery con tokens cripto-seguros | ✅ Completada | 0.5–1 día |
| **9** | Sponsors / publicaciones destacadas + ranking de vendedores + follow | ⬜ Pendiente | 2 días |
| **9.1** | Ranking público de vendedores por reseñas verificadas | ✅ Completada | 0.5 día |
| **10** | Pulido, i18n, SEO, deploy | ⬜ Pendiente | 2 días |
| **11** | Logging estructurado + alertas (Pino/Winston, log rotation, integración con Sentry/BetterStack, tabla `system_alerts`) | ⬜ Pendiente | 1–2 días |
| **12** | Panel de administración / soporte (rol admin, dashboard de alertas, métricas, gestión usuarios) | ⬜ Pendiente | 2–3 días |
| **13** | Soporte al cliente (usuario "Soporte" especial vía mensajería de Fase 6, replies por email vía nodemailer, tickets) | ⬜ Pendiente | 1–2 días |
| **13.docs** | Documentación técnica completa de la plataforma | ✅ Completada | 1 día |
| **14** | i18n bilingüe es/en con `next-intl` + sub-paths `/es` `/en` + emails bilingües + SEO bilingüe — plan ejecutable [`docs/phases/phase-14-i18n-next-intl.md`](docs/phases/phase-14-i18n-next-intl.md) | ✅ Completada | 3–4 días |
| **20** | Automatización de tests backend con Vitest/Supertest + CI | ✅ Completada | 0.5–1 día |
| **22** | UI cleanup pre-rediseño: menú KIOSQUI (header + hamburguesa + sidebar) · footer simplificado · FAB Crear publicación · URLs canónicas con slug SEO + anti-enumeración · backend redirect 301 de URLs legacy | ✅ Completada | 0.5–1 día |
| **23** | Captcha Cloudflare Turnstile en `/contact` + reescritura del form en español + backend endpoint con verificación server-side | ✅ Completada | 0.5 día |
| **24** | Ranking unificado en `/ranking` con tabs internas (Directorio + Mejor calificados) + bloque explicativo "cómo se calcula" en cada tab + redirects desde `/creators` y `/art-ranking` | ✅ Completada | 0.5 día |

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

### Fase 8.3.5 — Password recovery con tokens cripto-seguros

**Cambio aplicado al `database.sql` (consolidado, sin ALTER):**

Se agregó `CREATE TABLE IF NOT EXISTS ecom.password_reset_tokens` con FK a
`ecom.customer(cus_id)`, token SHA-256, expiración, marcas de uso e IPs de
auditoría. Producción nueva queda coherente desde cero.

**SQL de migración para entornos ya poblados (dev/staging/prod):**

```sql
-- Fase 8.3.5 — Password recovery con tokens cripto-seguros.
-- En producción nueva esto NO se ejecuta: database.sql ya contiene la tabla.

CREATE TABLE IF NOT EXISTS ecom.password_reset_tokens (
    prt_id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cus_id           BIGINT NOT NULL REFERENCES ecom.customer(cus_id) ON DELETE CASCADE,
    prt_token_hash   VARCHAR(128) NOT NULL,
    prt_expires_at   TIMESTAMP NOT NULL,
    prt_used_at      TIMESTAMP NULL,
    prt_requested_ip VARCHAR(45) NULL,
    prt_used_ip      VARCHAR(45) NULL,
    prt_created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prt_token_hash
    ON ecom.password_reset_tokens(prt_token_hash);

CREATE INDEX IF NOT EXISTS idx_prt_cus_id_expires
    ON ecom.password_reset_tokens(cus_id, prt_expires_at);

-- Cuentas que quedaron en el flujo viejo de contraseña temporal pasan al
-- flujo nuevo: entran a /forgot, solicitan link y reciben token.
UPDATE ecom.customer
SET passta_id = 1
WHERE passta_id = 5;
```

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

---

### Hotfix v3 — HeaderOne en lg + HeaderTwo con selectores más específicos

**Bug 1: HeaderOne (`/messages`) se rompe entre 992 y 1199**

Causa: el `<div className="main-menu1 d-none d-lg-block">` se hace visible desde lg (≥992px), pero el hamburguesa `<menu-bar d-xl-none>` también se muestra abajo de xl (<1200px). Resultado: entre 992-1199 **ambos** elementos se renderizan y compiten por el espacio — el menú horizontal se mete y el hamburguesa también, partiendo todo en 2 filas.

**Fix:** cambiar el menú a `d-xl-block`. Así:
- ≥1200 (xl+) → solo menú horizontal.
- <1200 → solo hamburguesa.
- Nunca ambos al mismo tiempo.

**Bug 2: HeaderTwo bell + theme ocultos en 1600-1851 (continuación)**

El override de v2 con `.header-main2-content` (especificidad: 2 clases) podía estar siendo overrideado por algún CSS heredado o por orden de inyección de styled-jsx global vs los `.scss` importados en `layout.tsx`.

**Fix:** se agrega más especificidad al override (`.app-layout .header2 .header-main2-content ...`) y se fuerza el comportamiento flex correcto en `header-main-right`:

```css
.app-layout .header2 .header-main2-content .header-main-right {
  min-width: 0;
  flex-wrap: nowrap;
}
.app-layout .header2 .header-main2-content .header-main-right > * {
  flex-shrink: 0;
}
.app-layout .header2 .header-main2-content .filter-search-input.header-search {
  width: 320px !important;
  max-width: 100% !important;
  flex-shrink: 1 !important;
}
```

`flex-wrap: nowrap` evita que los elementos se partan en 2 filas. `flex-shrink: 0` en los hijos directos (lang, bell, theme) garantiza que ningún ícono se "shrinkee" a 0 ancho. Y `flex-shrink: 1` en la búsqueda permite que SOLO ella se ajuste si hay falta de espacio.

**Importante:** después de pull, correr `rm -rf .next && npm run dev` — los overrides de styled-jsx global pueden quedar cacheados.

---

### Hotfix v4 — HeaderTwo 1600-1840: cambio de proporción de columnas

Las versiones v2/v3 achicaban la búsqueda pero no resolvían que el bell + theme quedaran tapados/ocultos entre 1600 y 1840. El problema de fondo: el template usa `col-xl-7` (58%) para la búsqueda y `col-xl-5` (42%) para los íconos. Con los sidebars ocupando 550px, la columna derecha (42% de ~995px = ~418px) no garantizaba que los íconos no se salieran de su espacio visible.

**Fix definitivo:** en 1600-1840 cambiamos la PROPORCIÓN de las columnas en vez de solo el ancho de la búsqueda:

```css
@media (min-width: 1600px) and (max-width: 1840px) {
  .col-xl-7 { width: 45% !important; }   /* búsqueda: era 58% */
  .col-xl-5 { width: 55% !important; }   /* íconos: era 42% */
  .filter-search-input.header-search { width: 260px !important; }
  .header-main-right { flex-wrap: nowrap !important; overflow: visible !important; }
  .header-main-right > * { flex-shrink: 0 !important; }
}
```

Al darle 55% a la columna de los íconos (lang + bell + theme), siempre tienen lugar de sobra. La búsqueda baja a 260px en el 45% restante. Selectores con `.app-layout .header2 .header-main2-content` para máxima especificidad.

**Verificado con `next build` limpio** (no solo tsc) para descartar que fuera un problema de compilación.

> ⚠️ **Si después de pull sigue sin verse:** es caché de `.next`. Detené el dev server, `rm -rf .next`, y `npm run dev` de nuevo. Los `<style jsx global>` se cachean agresivamente con HMR.

### Hotfix v5 — Header con sidebars: replicar el mecanismo del template (definitivo) ✅

Las versiones v1–v4 fueron parches sobre un enfoque equivocado. El error de raíz: la migración **padeaba** `.app-layout` 275px por lado para correr el contenido entre los sidebars `position: fixed`. Eso deja el borde del contenedor **pegado** al sidebar (0px de aire), y el último ícono de la derecha (toggle de tema) caía **debajo** del sidebar (`z-index: 999`). Ni cambiar la proporción de columnas (v4) ni `overflow: visible` lo arreglaban — de hecho `overflow: visible` empeoraba el derrame bajo el sidebar.

**Causa entendida comparando con la plantilla original:** el template **no padea nada**. Encoge su contenedor a `.c-container-1 { width: calc(100% - 583px) }` **centrado** (`margin: auto`). Como 583 ÷ 2 = 291.5 > 275, deja ~16px de aire a cada lado y nada se mete bajo el sidebar.

**Fix definitivo (confirmado por el usuario):** replicar ese mecanismo exacto. Se elimina el padding y todos los hacks de columnas; se aplica el `calc` centrado a `.container` (el template solo lo hace en `.c-container-1`, pero la migración usa `.container` en casi todas las páginas):

```css
@media (min-width: 1600px) {
  .app-layout.has-left-sidebar .container,
  .app-layout.has-right-sidebar .container {
    width: calc(100% - 583px) !important;
    max-width: none !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
}
```

Así header, cards y footer libran los sidebars con el mismo aire que la plantilla. La proporción 58/42 de columnas del template queda intacta (no hay que tocarla).

**Bonus — HeaderOne en `/messages`:** el menú horizontal de 4 ítems se partía en 2 líneas en el rango **1600-1605px**, porque justo a 1600 entra el `padding-right:275` del sidebar **y** la búsqueda saltaba de 180→220px a la vez (`.container.header-container` tiene `max-width: 1650px`, así que abajo de eso el ancho sigue al viewport). Fix: mantener la búsqueda en 180px hasta 1699 y ensancharla a 220px recién en 1700+, donde ya sobra ancho.

Commit: `ae6997f` en `main`. Reemplaza los hotfixes v1–v4 (cuyo CSS fue borrado).

### ✅ Fase 6.3.3 (completada) — Menciones `@usuario`: dropdown + linkificación

Las notificaciones de `mention`/`reply` ya se insertaban desde 6.3.1/6.3.2 (el backend parsea `@handle` en `POST /addcomment` vía `resolveMentions`). Faltaba la UX: poder elegir a quién mencionar y que las menciones renderizadas sean clickeables.

**Backend (`// Codigo Aurelio`, commit `b68c23f` en `techmindsgt`, deployado):**
- `GET /search/users?q=` (público, prefijo ≥2): busca `cus_handle ILIKE 'q%'`, limit 8, devuelve `{cusId, handle, firstName, lastName, avatar}`. Alimenta el dropdown.
- `getComments` ahora adjunta `mentions: [{handle, cusId}]` por comentario — recolecta todos los `@handle` y los resuelve en **una sola query** (sin N+1), para que el front linkifique sin requests extra. Mantiene el shape array.

**Frontend (`main`):**
- `types/api.ts`: `CommentMention`, `UserSearchResult`, y `mentions?` en `Comment`.
- `useSearchUsers(q)`: hook React Query, `enabled` con prefijo ≥2, `staleTime 60s`.
- `MentionTextarea`: textarea controlada que detecta `@palabra` en el caret, abre dropdown con avatar+nombre+handle, navegación con flechas/Enter/Escape, inserta `@handle ` al elegir. Reemplaza los `<textarea>` del comentario nuevo y del reply inline.
- `renderCommentContent(content, mentions)`: helper que parte el texto y reemplaza cada `@handle` resuelto por `<Link href="/creator-profile/[cusId]">`. Los `@algo` sin resolver quedan como texto. `ForumComment`/`ForumReply` ahora aceptan `content: React.ReactNode`.

**Verificación:** endpoint probado local (`q=au` → aurelio), `getComments` devuelve `mentions`, `tsc --noEmit` limpio, `/publications/1` compila 200. UX del dropdown pendiente de verificación visual del usuario.

**Siguiente:** Fase 7 (cierre de venta + reseñas).

---

### ✅ Fase 7 (completada) — Cierre de venta + reseñas de vendedor

El backend ya tenía `closeSale`, `submitSurvey` y `getSellerReviews` con rutas `POST /close-sale`, `POST /submit-survey` y `GET /seller-reviews/:id`. Faltaba conectar el frontend y agregar la notificación in-app.

**Backend (`// Codigo Aurelio`, commit `a86e902` en `techmindsgt`):**
- `closeSale` ahora llama a `insertNotification` con `notif_type: 'sale_closed'` al comprador después de enviar el email y crear el registro de encuesta.

**Frontend (`main`, commit `9801064`):**
- `types/api.ts`: `SellerReview` y `SellerReviewsResponse` alineados con el backend real (campos `cus_first_name`, `cus_last_name`, `completed_at`, `totalReviews`). `CloseSalePayload` y `SubmitSurveyPayload` extienden `Record<string, unknown>` para compatibilidad con `ApiFetch.post`.
- `useCloseSale`: mutation `POST /close-sale` (auth requerida). Invalida `myPublications` en éxito.
- `useSellerReviews(id)`: query `GET /seller-reviews/:id` (pública). `staleTime 5 min`.
- `useSubmitSurvey`: mutation `POST /submit-survey` (sin auth, se valida con token JWT del email).
- **`MyPublicationsMain`**: botón verde "Cerrar venta" (solo aparece en publicaciones con `pubsta_id === 2` = activas). Abre `CloseSaleModal`: modal con buscador de comprador por handle (reutiliza `useSearchUsers`) + dropdown de resultados + botón "Confirmar venta".
- **`/survey/[token]`** (nueva ruta): `SurveyMain` con selector de estrellas interactivo (hover + clic), label descriptivo por puntuación, textarea de comentario, submit al backend, estado de éxito post-envío.
- **`CreatorProfileMain`**: eliminados datos estáticos. Conectado a `useSellerInfo` (`GET /infoCustomer/:id`) y `useSellerReviews`. Muestra avatar real, nombre, handle, estadísticas (publicaciones, reseñas, calificación promedio) y tarjetas de reseñas con `StarDisplay`, fecha y comentario.

---

### ✅ Fase 7.1 (completada) — Calificar desde la notificación + perfil reconstruido sobre la plantilla

Feedback del usuario: (1) las notificaciones deben permitir calificar directamente y traer un texto claro ("X cerró la venta contigo. ¡Califícalo!"), y (2) `creator-profile` debía basarse en la **plantilla** (que se compró justamente para eso), no en un layout custom. La primera versión de `CreatorProfileMain` (Fase 7) usaba estilos inline propios en lugar de la estructura del scaffold — corregido aquí.

**Backend (`// Codigo Aurelio`, commit `5dec9d2` en `techmindsgt`):**
- `closeSale`: el payload de la notificación `sale_closed` ahora incluye `surveyToken` + `pubTitle`, para poder linkear al formulario de calificación desde la propia notificación. Email link corregido de `/complete-survey/` a `/survey/[token]` (estaba desalineado con la ruta del front) y rediseñado.
- `submitSurvey`: al completar una calificación, inserta una notificación `review_received` al vendedor (estrellas + comentario como snippet). Decodifica `seller_id`/`buyer_id` del token JWT.
- `getSellerPublications` + `GET /seller-publications/:id`: publicaciones públicas de un vendedor (mismo shape que el listado público, `pubsta <> 4` y `<> 1`), para alimentar el tab "Publicaciones" del perfil reutilizando `PublicationCard`.

**Frontend (`main`, commit `6c61f3e`):**
- `notificationUtils.ts`: `sale_closed` → texto "X cerró la venta contigo. ¡Califícalo!" + `href` directo a `/survey/[token]` (lee `payload.surveyToken`), snippet con el título de la publicación. `review_received` → muestra las estrellas recibidas y enlaza al perfil propio del vendedor (`recipient_cus_id`).
- `useSellerPublications(id)`: hook React Query para el nuevo endpoint.
- **`CreatorProfileMain` reconstruido sobre la plantilla**: usa la estructura nativa del scaffold `creator-details-area` (cover + `creator-about` card + `creator-info-bar` con `artist-meta-info` + `creator-info-tab` con `nav-tabs`). Tabs reales: **Publicaciones** (grid de `PublicationCard`) y **Reseñas** (resumen con promedio + tarjetas con avatar, estrellas, fecha y comentario). Datos reales de `useSellerInfo` + `useSellerReviews` + `useSellerPublications`.
- Calificar desde el email **y** desde la notificación: ambos llevan a `/survey/[token]` (ruta pública, no requiere sesión).

**Verificación:** `tsc --noEmit` limpio, `next build` OK (`/survey/[token]` y `/creator-profile/[id]` compilan). Pendiente de verificación visual del usuario.

---

### ✅ Fase 7.2 (completada) — Perfil estilo plantilla: seguir, stats, ubicación, antigüedad, compartir

Feedback del usuario sobre el `creator-profile`: traer los elementos de la plantilla (likes, seguidores, seguidos, botón seguir, compartir, ubicación, antigüedad) con datos reales. El follow se adelantó desde la Fase 9.

> ⚠️ **Migración de BD requerida.** Esta fase añade la tabla `ecom.customer_follows`. **Hay que correr el `CREATE TABLE` en producción ANTES de desplegar el backend**, o `getInfoCus` falla (consulta la tabla). No hay runner de migraciones automático; se aplica a mano (igual que mensajería/notifs). El SQL está en `database.sql`.

**Backend (`// Codigo Aurelio`, commit `2819127` en `techmindsgt`):**
- Nueva tabla `ecom.customer_follows` (`follower_cus_id`, `followed_cus_id`, unique + CHECK anti-auto-follow + índices).
- `getInfoCus` ahora pasa por `authMiddlewareAux` (auth opcional) y devuelve, además de nombre/handle/avatar: `address`, `joindate` (cus_create_date), `likes` (favoritos recibidos en sus publicaciones), `followers`, `following` e `isfollowing` (relativo al viewer logueado). `totalpublis` ahora cuenta solo `pubsta NOT IN (1,4)`.
- `followUser` / `unfollowUser` + rutas `POST /follow/:id` y `DELETE /follow/:id` (auth).

**Frontend (`main`, commit `c3846bb`):**
- `types/api.ts` + `usePublications`: `SellerInfoRow`/`SellerInfo` extendidos con los nuevos campos + normalización (`toInt`, booleano).
- `useToggleFollow(sellerId)`: mutation `POST`/`DELETE /follow/:id` con **actualización optimista** del cache `['sellerInfo', id]` (alterna `isFollowing`, ajusta `followers ±1`). Si no hay sesión, redirige a `/login?from=`.
- `CreatorProfileMain`:
  - Tarjeta izquierda: lista con **ubicación** (`fa-map-marker-alt`) y **antigüedad** ("Se unió en {mes año}", `flaticon-calendar`).
  - Barra de stats (`artist-meta-info`): **Publicaciones · Likes · Seguidores · Siguiendo**, con formato `1.2k`/`3.4M`.
  - `creator-details-action`: botón **Seguir/Siguiendo** (funcional, optimista, oculto en el perfil propio) + botón **Compartir** (Web Share API con fallback a copiar enlace + toast).

**Verificación:** migración aplicada a la BD local; `GET /infoCustomer/:id` devuelve los nuevos campos; `POST`/`DELETE /follow/:id` responden 401 sin sesión. `tsc --noEmit` limpio, `next build` OK.

**Siguiente:** Fase 8 (Empresas y planes) o Fase 9 (ranking de vendedores; el follow ya quedó hecho).

---

### ✅ Fase 7.3 (completada) — Fix de vistas, avatar nítido, vistas totales y ubicación configurable

Feedback del usuario: (1) avatar pixelado, (2) ubicación solo departamento+municipio elegibles en config con opción de mostrar/ocultar, (3) mostrar vistas totales en el perfil, (4) bug: dar like incrementaba las vistas, (5) el dueño no debe sumar vistas a su propia publicación.

**Chunk 1 — vistas + avatar (sin migración; backend `583ffcf`, frontend `8db444c`):**
- **Bug vistas/like**: el conteo estaba dentro de `getPublicationById` (GET), así que cada refetch sumaba vista. Al dar like, `useToggleFavorite` invalidaba el detalle → refetch → +1. Se removió esa invalidación (la actualización optimista ya mantiene `favoritesCount`) y el conteo se movió a un endpoint dedicado **`POST /publications/:id/view`** que **excluye al dueño** (`AND ($2 IS NULL OR cus_id <> $2)`). `useRegisterView` hace un ping único al montar el detalle.
- **Avatar**: se renderizaba a 120px dentro de un contenedor de 280px → estirado/pixelado. Ahora a 300px (mantiene `unoptimized` porque `next.config` solo permite `localhost:4000` y en prod el backend es otro dominio). *Nota: la nitidez tope la define la resolución de la imagen subida; los avatares no pasan por sharp.*
- **Vistas totales**: `getInfoCus` devuelve `totalviews` (SUM de `pub_views` de publicaciones activas/vendidas); nuevo stat "Vistas" en la barra del perfil.

**Chunk 2 — ubicación de perfil (⚠️ con migración; backend pendiente de deploy, frontend pendiente de push):**

> ⚠️ **Esquema (AGENTS.md §12.1).** En `database.sql` las columnas `cit_id`, `tow_id`, `cus_show_location` se agregaron **dentro del `CREATE TABLE customer`** (con sus FKs a `cat_city`/`cat_town`), como si siempre hubieran existido — NO con `ALTER TABLE`. El `database.sql` refleja el estado final para instalaciones nuevas.
>
> **SQL de migración para entornos ya poblados (dev/staging/prod):**
> ```sql
> ALTER TABLE ecom.customer
>   ADD COLUMN IF NOT EXISTS cit_id INT,
>   ADD COLUMN IF NOT EXISTS tow_id INT,
>   ADD COLUMN IF NOT EXISTS cus_show_location BOOLEAN NOT NULL DEFAULT false;
> ```
> Correr en BDs existentes **antes** de desplegar el backend (ya aplicado en local y producción).

- Privacidad primero: `cus_show_location` por defecto `false` (oculto). Solo Guatemala (cou_id 502), así que en config se elige **Departamento** (cat_city) + **Municipio** (cat_town).
- `changeInfoB` acepta `citId`/`towId`/`showLocation`. `verifyMe` los devuelve para prefill. `getInfoCus` devuelve `department`/`municipality` **solo si `cus_show_location = true`** (gate de privacidad en el backend) + flag `showlocation`.
- `PersonalInfoTab`: selects en cascada Departamento → Municipio (reutiliza `useCities`/`useMunicipalities`) + checkbox "Mostrar mi ubicación…". Validación: si activa el toggle, depto+municipio obligatorios.
- `CreatorProfileMain`: la lista de ubicación ahora muestra "Municipio, Departamento" (en vez de la dirección libre), solo cuando el backend los devuelve.

**Verificación:** migraciones aplicadas a BD local; `POST /publications/:id/view` suma vistas anónimas (no del dueño); `getInfoCus` devuelve `totalviews`, y `department`/`municipality` solo con `show_location` ON. `tsc --noEmit` limpio.

**Siguiente:** Fase 9 (sponsors / destacados + ranking de vendedores).

---

### Fase 8 — Empresas y planes ✅

Aprovecha el modelo que ya existía en `database.sql` (`subscriptions`, `business`,
`customer_subscription`, `customer.bus_id`/`cus_is_admin`). **Sin cambios de esquema.**

- **Página de planes `/pricing-plan`** (`PricingPlanMain`): cards en lenguaje visual de
  la plantilla, toggle Mensual/Anual, marca el plan actual y permite cambiarlo. Hook
  `usePlans` → `POST /getplans` (ya existía en backend).
- **Suscripción del usuario:** backend nuevo `getMySubscription` (`POST /my-subscription`)
  y `changeSubscription` (`POST /change-subscription`, upsert del `sub_id` en
  `customer_subscription` sin reiniciar `cussub_pubcount`). Hooks `useMySubscription`/
  `useChangeSubscription`.
- **Gestión de empresa `/company`** (`CompanyMain`): editar datos de la empresa (solo
  `cus_is_admin`), listar el equipo, indicador "X / Y usuarios" según el plan, y formulario
  de invitar empleado. Hooks `useCompany`/`useEmployees`/`useUpdateCompany`/`useAddEmployee`
  sobre `/getcompany`, `/getemployees`, `/changeinfoc` (ya existían) y el nuevo
  `addEmployee` (`POST /add-employee`) que valida el límite `sub_users` del plan del admin.
- **Límite de publicaciones:** ya estaba — `useCheckerPublications` (`POST /checkerpub`) +
  enforcement en `UploadMain` que enlaza a `/pricing-plan` al agotar la cuota.
- **Navegación:** links "Planes" (todos) y "Mi empresa" (solo admins) en el sidebar de cuenta.

> Nota legacy: `POST /getemployees` no lleva `authMiddleware` (estado heredado); se invoca
> con el `busid` que devuelve `/getcompany`. Endurecerlo a `req.user` queda como follow-up.

**Verificación:** `tsc --noEmit` limpio; `node -c` OK en backend. Endpoints probados contra
backend local (mismo repo en disco; `node --watch` recarga). Pendiente de push a infra
compartida (techmindsgt) cuando se autorice.

---

### Pendiente — Tabs en el perfil de empresa (Empleados / Publicaciones)

> Planificado, **no implementado**. Surgió al pulir el perfil público de empresa
> (`/empresa/[id]`). Se difirió por presupuesto de tokens; retomar en frío.

Objetivo: que `/empresa/[id]` tenga pestañas como el `creator-profile`:

- **Empleados** (ya existe): grid de empleados, respetando el flag `bus_show_employees`
  (`showemployees`). Sin exponer quién es admin (decisión de seguridad de Fase 8).
- **Publicaciones** (nuevo): mostrar las publicaciones activas de **todos** los
  empleados de la empresa, renderizadas con `PublicationCard` (igual que el
  creator-profile).

Trabajo estimado (fase contenida):

1. **Backend** (`ecommerceGTBackEnd`, marcar `// Codigo Aurelio`):
   nuevo endpoint público `GET /company-publications/:id`. Reutiliza la query de
   `getSellerPublications` pero filtrando
   `cus_id IN (SELECT cus_id FROM ecom.customer WHERE bus_id = $1)`.
2. **Frontend** (`ecommerceGT-Next`):
   - Hook `useCompanyPublications(id)`.
   - Refactor de `CompanyProfileMain` a tabs (patrón de `CreatorProfileMain`):
     Empleados | Publicaciones.
   - La columna de stats "Publicaciones" (ya muestra `totalpublis`) puede activar
     la pestaña.

Sin cambios de esquema. No requiere ALTER TABLE.

---

### Fase 8.1 — Verificación de identidad (DPI / NIT)

El check (azul personal / dorado empresa) y el mensaje "cuenta/empresa verificada"
**solo aparecen si la cuenta está verificada**. El usuario envía su DPI (personal)
o NIT (empresa) + foto del documento desde Configuraciones → "Verificar cuenta";
soporte lo valida **manualmente** (el portal de revisión es una fase próxima).

Estados: `unverified` → `pending` (enviado) → `verified` / `rejected` (con motivo).

> ⚠️ `cus_dpi` / `bus_nit` y `ver_document` son **datos sensibles**: nunca se
> devuelven en endpoints públicos, solo se usan internamente para validar.

**SQL para BDs existentes** (correr **antes** de desplegar el backend):

```sql
-- Columnas de estado en customer
ALTER TABLE ecom.customer
  ADD COLUMN IF NOT EXISTS cus_dpi varchar(20) NULL,
  ADD COLUMN IF NOT EXISTS cus_verification_status varchar(20) NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS cus_verified_at TIMESTAMP NULL;

-- Columnas de estado en business
ALTER TABLE ecom.business
  ADD COLUMN IF NOT EXISTS bus_nit varchar(20) NULL,
  ADD COLUMN IF NOT EXISTS bus_verification_status varchar(20) NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS bus_verified_at TIMESTAMP NULL;

-- Tabla de solicitudes de verificación
CREATE TABLE IF NOT EXISTS ecom.verification_requests (
    ver_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cus_id          BIGINT NOT NULL REFERENCES ecom.customer(cus_id) ON DELETE CASCADE,
    bus_id          BIGINT NULL REFERENCES ecom.business(bus_id) ON DELETE CASCADE,
    ver_type        VARCHAR(20) NOT NULL,
    ver_document    VARCHAR(20) NOT NULL,
    ver_document_image VARCHAR(200) NULL,
    ver_status      VARCHAR(20) NOT NULL DEFAULT 'pending',
    ver_reject_reason VARCHAR(255) NULL,
    ver_reviewed_by BIGINT NULL REFERENCES ecom.customer(cus_id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at    TIMESTAMP NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_verification_pending_personal
    ON ecom.verification_requests(cus_id)
    WHERE ver_status = 'pending' AND ver_type = 'personal';
CREATE UNIQUE INDEX IF NOT EXISTS uq_verification_pending_business
    ON ecom.verification_requests(bus_id)
    WHERE ver_status = 'pending' AND ver_type = 'business';
```

> Nota: `customer` ya tenía `cus_is_verified`/`cus_verification_token`, pero esos
> son de **verificación de email** (registro). La verificación de identidad usa
> columnas nuevas (`cus_verification_status`), no se reutilizan.

**Backend:** `POST /verification/request` (auth) crea la solicitud pending;
`GET /verification/status` (auth) devuelve el estado. `verifyMe`, `getInfoCus`
y `getCompanyProfile` exponen un flag `verified` para condicionar el check.

**Frontend:** checks condicionados a `verified`; sección "Verificar cuenta" en
configuraciones (envía DPI/NIT + foto, muestra estado).

**Documentos que se piden (refinado):**
- **Personal:** número de DPI + **2 fotos** (frente y reverso). Variante de imagen
  `_doc` (1400x880 ≈ aspecto carné, calidad 88) para que los datos sean legibles.
- **Empresarial:** número de NIT + **RTU en PDF**. El backend lo comprime con
  Ghostscript (`gs -dPDFSETTINGS=/ebook`); si `gs` no está instalado, guarda el PDF
  tal cual. Endpoint `POST /upload-pdf` (auth), guarda en `uploads/verification`,
  límite 8 MB, solo `application/pdf`.

**SQL extra** (columna para el reverso del DPI):

```sql
ALTER TABLE ecom.verification_requests
  ADD COLUMN IF NOT EXISTS ver_document_image_back varchar(200) NULL;
```

> Para que la compresión del RTU funcione, instalar Ghostscript en el servidor
> (local: `brew install ghostscript`). Sin él, el PDF se guarda sin comprimir.
>
> 📌 **DESPLIEGUE — instalar Ghostscript (pendiente, fase final):**
> - **¿Dónde?** En el **BACKEND** (donde corre `/upload-pdf`), que está en **Render**.
>   En **Vercel** corre el frontend (Next.js) → ahí **NO** se necesita Ghostscript.
> - **Cómo en Render:** el runtime nativo de Node **no** trae `gs` y no permite
>   `apt-get` fácilmente. Lo más limpio es desplegar el backend con un **Dockerfile**
>   que incluya:
>   ```dockerfile
>   RUN apt-get update && apt-get install -y ghostscript && rm -rf /var/lib/apt/lists/*
>   ```
>   (en Render: cambiar el servicio a "Docker" o agregar el Dockerfile al repo).
> - **No es bloqueante:** si `gs` no está, `/upload-pdf` guarda el PDF tal cual
>   (el código ya tiene fallback). Es solo una optimización de tamaño.
> - **Verificar tras desplegar:** subir un RTU y confirmar en logs que NO aparece
>   "ghostscript no disponible".

> ⚠️ **Follow-up de privacidad (pendiente):** los documentos se guardan en
> `uploads/verification` y hoy `/uploads` se sirve estático (URL no adivinable,
> pero accesible con el link). El DPI/RTU es PII sensible → conviene un endpoint
> de descarga **autenticado** (solo soporte) en lugar de servirlo estático. Hacerlo
> junto con el portal de revisión.

**Pendiente (fase próxima):** portal de soporte para aprobar/rechazar solicitudes
(incluye el endpoint de descarga autenticado de los documentos).

---

### Fase 8.2 — Portal de soporte + descarga autenticada de documentos ✅

Implementada. Da a soporte una forma segura de revisar y resolver solicitudes de
verificación, y salda la deuda de privacidad de los documentos.

**SQL para BDs existentes** (correr **antes** de desplegar el backend):

```sql
ALTER TABLE ecom.customer
  ADD COLUMN IF NOT EXISTS cus_role varchar(20) NOT NULL DEFAULT 'user';
-- Darse a uno mismo el rol de soporte para entrar al portal:
-- UPDATE ecom.customer SET cus_role = 'support' WHERE cus_id = <TU_CUS_ID>;
```

- **Rol de plataforma** (`cus_role`: `user` | `support` | `admin`) — distinto de
  `cus_is_admin` (que es admin de EMPRESA). Middleware `requireSupport` consulta el
  rol fresco en BD. `verifyMe` (/me) ahora expone `role`.
- **Privacidad — documentos NO públicos:** todos los documentos de verificación
  (fotos del DPI + RTU) se suben a `uploads/verification` vía `POST
  /upload-verification` (imágenes → WebP legible con sharp `fit:inside`, PDF →
  Ghostscript). Un guard `app.use("/uploads/verification", 403)` **antes** del
  `express.static` bloquea el acceso directo. Solo soporte los descarga vía
  `GET /verification/document/:ver_id/:side` (sendFile autenticado).
- **Endpoints (auth + requireSupport):** `GET /verification/requests?status=pending`,
  `GET /verification/document/:ver_id/:side`, `POST /verification/:ver_id/approve`,
  `POST /verification/:ver_id/reject` (con `reason`). Aprobar/rechazar actualiza
  customer/business + la solicitud y **notifica** al usuario
  (`verification_approved` / `verification_rejected`).
- **Frontend:** portal en `/soporte/verificaciones` (solo `role` support/admin;
  el enlace en el menú aparece solo a soporte). Visor de documentos + aprobar/
  rechazar con motivo.

> Nota: la subida de docs de verificación cambió de `/upload-pdf` (+`uploadImage`)
> a un único `POST /upload-verification`. Las fotos del DPI ya NO van a
> `uploads/images` (público) sino a `uploads/verification` (privado).

---

### Fase 10 — Sistema de pauta/sponsors por publicación ✅ (estructura; pago = stub)

> **Implementada la estructura.** Falta SOLO la pasarela de pago: hoy la campaña
> se activa al crearse (`camp_status='active'`) sin cobrar. Cuando se integre el
> proveedor (Recurrente/NeoNet/etc.), agregar el gate de pago antes de activar.

**SQL para BDs existentes:**
```sql
CREATE TABLE IF NOT EXISTS ecom.ad_campaigns (
    camp_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pub_id BIGINT NOT NULL REFERENCES ecom.publications(pub_id) ON DELETE CASCADE,
    cus_id BIGINT NOT NULL REFERENCES ecom.customer(cus_id) ON DELETE CASCADE,
    camp_status VARCHAR(20) NOT NULL DEFAULT 'active',
    budget NUMERIC(10,2) NOT NULL DEFAULT 0,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NULL,
    target_cit_id INT NULL REFERENCES ecom.cat_city(cit_id),
    target_tow_id INT NULL REFERENCES ecom.cat_town(tow_id),
    target_age_min INT NULL, target_age_max INT NULL,
    impressions BIGINT NOT NULL DEFAULT 0, clicks BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ecom.ad_campaigns(camp_status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_cus ON ecom.ad_campaigns(cus_id);
-- Objetivo + consumo de presupuesto (si ya creaste la tabla antes):
ALTER TABLE ecom.ad_campaigns
  ADD COLUMN IF NOT EXISTS camp_objective VARCHAR(20) NOT NULL DEFAULT 'destacar',
  ADD COLUMN IF NOT EXISTS spent NUMERIC(10,2) NOT NULL DEFAULT 0;
```

> **Consumo de presupuesto (Fase 10.1):** `destacar` descuenta **Q0.05/impresión**;
> `mensajes` descuenta **Q0.50/clic** en "Enviar mensaje". Al llegar `spent` al
> `budget` la campaña pasa a `finished` sola. El serving ordena por **saldo
> restante DESC** (más presupuesto = más prioridad y alcance). Tarifas en
> `connPostgresDB.js` (`AD_IMPRESSION_COST` / `AD_CLICK_COST`). Las campañas
> `mensajes` muestran un botón "Enviar mensaje" en Destacados. Métricas casi en
> tiempo real (refetch al enfocar + cada 30s).

> `camp_objective`: `destacar` (consume por impresión) | `mensajes` (consume por
> clic en "Enviar mensaje"). Presupuesto mínimo Q10. El form de `/pauta` incluye
> objetivo, fecha inicio/fin (duración), segmentación y un explicador estilo Meta.

- **Anunciante:** `/pauta` (crear campaña: publicación propia, presupuesto, fecha
  fin, segmentación departamento/municipio/edad) + lista con métricas
  (impresiones/clics) y pausar/reanudar/finalizar. Endpoints `POST /campaigns`,
  `GET /campaigns/mine`, `POST /campaigns/:id/status`.
- **Serving segmentado:** `GET /featured-publications` (authMiddlewareAux) filtra
  **server-side** por ubicación (`cit_id`/`tow_id`) y edad (de `cus_birthday`) del
  viewer; sin sesión solo muestra campañas sin segmentar. Rota con `random()`, suma
  impresiones. Clic → `POST /featured/:campId/click`.
- **Render:** sección "Destacados" en el listado de publicaciones con badge
  **"Patrocinado"** (PublicationCard `isFeatured`).
- **Privacidad:** el targeting es server-side; nunca se expone la ubicación/edad
  del viewer al anunciante.

**Pendiente:** integrar pasarela de pago (gate antes de activar la campaña;
webhook de confirmación). Esa es la única pieza faltante de la Fase 10.

---

### Fase 10.2 — Crédito reutilizable por campaña expirada ✅

**Problema:** la query de serving deja de mostrar una campaña cuando
`end_date < CURRENT_DATE`, pero `camp_status` seguía en `active` y el saldo no
gastado quedaba atrapado en BD sin servir y sin reembolso. El anunciante perdía
el remanente.

**Solución:** al expirar la fecha, marcar la campaña como `finished` y devolver
`(budget - spent)` como **crédito reutilizable** del anunciante. El crédito se
aplica en futuras campañas (descuenta del campo `cus_ad_credit`). Cuando se
integre la pasarela real, el crédito reemplaza 1:1 el cobro.

```sql
-- BD existente: agregar columna de crédito al cliente.
ALTER TABLE ecom.customer
  ADD COLUMN IF NOT EXISTS cus_ad_credit NUMERIC(10,2) NOT NULL DEFAULT 0;
```

**Reembolso automático** (`reconcileExpiredCampaignsForUser` en
`connPostgresDB.js`): se ejecuta lazy al abrir `/pauta` (en `getMyCampaigns` y
en `getAdCredit`) dentro de transacción con `FOR UPDATE` para evitar dobles
abonos en concurrencia. Busca todas las campañas del usuario con
`camp_status='active' AND end_date < CURRENT_DATE`, las pasa a `finished` y
suma el saldo no gastado a `cus_ad_credit`.

**Reembolso manual:** `setCampaignStatus` también devuelve `(budget - spent)`
cuando el anunciante hace clic en "Finalizar" (solo en la transición
`active|paused → finished`, para no acreditar dos veces si reintentan).

**Uso del crédito en nueva campaña:** `createCampaign` acepta `useCredit` en el
payload. Si es `true`, descuenta `min(budget, available_credit)` de
`cus_ad_credit` atómicamente (con `FOR UPDATE` sobre la fila del cliente). El
mensaje de respuesta indica cuánto crédito se aplicó.

**UI (`/pauta`):**
- Banner verde con saldo disponible cuando `credit > 0`.
- Checkbox "Usar mi crédito disponible (Q X.XX)" debajo del campo de
  presupuesto (solo se muestra si hay saldo).
- Bloque informativo en el explicador menciona la devolución del saldo no
  gastado.
- **Paginación de "Mis campañas"** a 10/página (reutiliza el componente
  `Pagination` del soporte). El form a la izquierda + el feed a la derecha; al
  pasar de 10 campañas aparecen los controles.

**Endpoints nuevos:**
- `GET /ad-credit` (auth requerido) → `{ credit: number }`. Antes de leer
  ejecuta el reconcile, por lo que el saldo siempre está al día.

**Frontend nuevos:**
- Hook `useAdCredit()` en `src/hooks/api/useCampaigns.ts` (staleTime 5s,
  refetch al enfocar).
- `useCreateCampaign` y `useSetCampaignStatus` invalidan tanto
  `MY_CAMPAIGNS_KEY` como `AD_CREDIT_KEY` al éxito.

> **Nota:** mientras el cobro siga siendo stub, las campañas se activan sin
> cobro y el crédito solo cobra sentido como "presupuesto reutilizable
> contable". Al conectar pasarela real, el flujo es:
> `if useCredit: deduct credit; charge remainder via gateway`.

> **POLÍTICA DE NO-REEMBOLSO-A-TARJETA (importante, decidido 2026-05-27):**
> Esta plataforma **NO realiza reembolsos a dinero físico ni a tarjeta**. El
> único mecanismo de devolución es **crédito reutilizable** dentro de la
> aplicación (`cus_ad_credit`). Esto aplica a:
>   - Saldo no gastado al expirar una campaña (Fase 10.2).
>   - Saldo no gastado al finalizar una campaña manualmente.
>   - Saldo restante al anular una publicación con campaña activa por motivos
>     de moderación (Fase 10.6).
>
> El crédito no caduca, no es transferible entre cuentas, no se canjea por
> dinero. Solo se puede aplicar a nuevas campañas del mismo anunciante.
>
> Esta política **debe quedar declarada explícitamente** en:
>   - Términos y Condiciones de uso (sección "Pauta paga" → cláusula
>     "Reembolsos y créditos").
>   - El formulario de creación de campaña en `/pauta` (mostrar una nota
>     breve junto al selector de método de pago).
>   - La descripción de la tarjeta "Mi saldo de pauta" en `/pauta`.
>
> Justificación: este modelo es estándar en plataformas de pauta (Meta,
> Google, X) y simplifica enormemente la contabilidad. Evita disputas con
> pasarelas, reduce fraude (chargebacks repetidos), y nos protege frente a
> DIACO porque (1) el dinero se preserva 1:1 como crédito y (2) la política
> se declara antes del cobro con aceptación explícita.

---

### Fase 10.3 — UX de pauta: método de pago, prefill, badge "Pautada" ✅

**Mejoras de UX** (sin schema nuevo). Tres cambios concretos surgidos del feedback de Aurelio:

1. **Tarjeta de saldo siempre visible** en `/pauta` (verde si > 0, gris si vacío),
   reemplazando el banner condicional. Es la fuente de verdad de cuánto saldo
   tiene el anunciante para reutilizar.

2. **Selector de método de pago (3 opciones)** que aparece cuando el presupuesto
   supera el mínimo:
   - **Solo mi saldo** — disponible si el saldo cubre todo el presupuesto.
     Envía `useCredit: true` y descuenta del crédito.
   - **Saldo + tarjeta** — aplica el saldo disponible y el resto se cobra a la
     tarjeta (stub hasta pasarela). Default cuando hay saldo > 0.
   - **Solo con tarjeta** — conserva el saldo para después. Default cuando no
     hay saldo.

   Bajo el selector hay un **resumen del pago** (Presupuesto / Desde tu saldo /
   A cobrar con tarjeta) que se actualiza en vivo. Si el método elegido
   requiere tarjeta y la pasarela aún no está, se muestra una nota informativa
   y la campaña se crea sin cobro (igual que antes).

3. **Botón "Pautar" en `/mis-publicaciones`** (publicaciones activas no
   pautadas) → enlace a `/pauta?pub=<id>`. `PautaMain` lee el query param con
   `useSearchParams` y prellena el selector de publicación. Si la publicación
   ya tiene una campaña activa, el botón cambia a **"Ver pauta"** (color
   naranja) y aparece un **badge dorado "Pautada"** en la imagen.

**Fix de layout:** el bloque "¿Cómo funciona la pauta?" usaba
`<p className="pa-explain-note" style="display:flex">`, lo que convertía los
hijos del párrafo (icono, `<strong>`, paréntesis, "Q10") en flex items y
fragmentaba el texto en columnas raras. Se reemplazó por una `<ul
className="pa-explain-list">` con dos `<li>`; cada item tiene su ícono flex y
el texto fluye normalmente.

**Archivos:**
- `src/components/pauta/PautaMain.tsx`: estados `paymentMethod`, derivados
  `creditApplied`/`cardCharge`/`paymentValid`, `useSearchParams` para prefill,
  bloque de selector + resumen, fix de layout.
- `src/components/publications/MyPublicationsMain.tsx`: cruce con
  `useMyCampaigns` para `pautadasIds`, botón "Pautar"/"Ver pauta", badge
  "Pautada".

> **Pendiente para Fase 10.5** (espera pasarela): wiring real del flujo de
> cobro. El método `card` y `credit_plus_card` actualmente activan la campaña
> sin cobrar la diferencia.

---

### Fase 10.4 — Una campaña activa por publicación + fix crash en cards ✅

**Bug detectado** (gracias al feedback de Aurelio que creó 2 campañas de
"mensajes" + 1 de "destacar" sobre la misma publicación): la misma publicación
aparecía duplicada en la sección Destacados (una vez por cada campaña activa)
y, peor, `PublicationCard` crasheaba en `publicationUtils.ts:119` con
`Cannot read properties of undefined (reading 'forEach')` porque el endpoint
`/featured-publications` solo devuelve `image` (string), no la galería
completa `images: { url }[]` que sí incluye `/publications`. La función
`getPublicationListAllImages` hacía `publication.images.forEach(...)` sin
guard, asumiendo siempre forma de listado público.

**Solución (3 capas):**

1. **Frontend (defensiva):** `publication.images?.forEach(...)` —
   `publicationUtils.ts`. Aunque el dato esté incompleto, no rompe la card.

2. **Backend (regla de negocio):** `createCampaign` rechaza con **HTTP 409**
   si ya existe una campaña en estado `active` o `paused` para esa
   publicación. Mensaje: *"Esta publicación ya tiene una campaña activa o
   pausada. Finaliza la actual antes de crear otra."* Esto simplifica
   métricas, evita doble cobro al integrar pasarela y evita duplicados en
   Destacados.

3. **Backend (dedup defensivo):** `getFeaturedPublications` usa `DISTINCT ON
   (p.pub_id)` para colapsar duplicados históricos (BD que ya tenía 2+
   campañas por pub). Se queda con la de mayor saldo restante.

**UI** (`PautaMain`): el dropdown de publicaciones oculta las que ya tienen
campaña activa/pausada y muestra un hint:
> 🔒 *2 publicaciones ya tienen una campaña activa y no aparecen aquí.
> Finaliza la actual desde "Mis campañas" si quieres crear otra.*

**Modelo de Meta para referencia:** Meta sí permite múltiples ad sets sobre
el mismo "post" promocionado, pero entre ellos compiten en subasta. Como
nosotros no tenemos subasta real, una sola campaña activa por publicación es
el modelo correcto para esta fase.

**UI polish (mismo Fase 10.4):**
- Badge "PATROCINADO" pasa de verde a **dorado** (gradient `#fbbf24 → #d97706`)
  para reforzar visualmente que es contenido pagado y diferenciarlo de los
  badges verdes de status.
- `PublicationCard` ahora acepta un prop `ctaOverride` para sobrescribir el
  botón "Ver propiedad". Para campañas con objetivo `mensajes`, el CTA se
  reemplaza por un botón **dorado "Enviar mensaje"** (mismo tamaño/forma que
  el botón morado de "Ver propiedad", con ícono de avión) que enlaza a
  `/messages?pub=<id>` y registra el clic vía `recordAdClick`. Esto sustituye
  el link externo `featured-msg-btn` que aparecía debajo de la card y se veía
  desbalanceado en el grid.

**Bug fix "Ver pauta" no aparecía:** en `MyPublicationsMain.tsx` se filtraba
solo por `camp_status === 'active'`, pero el lock del backend (1 campaña por
publicación) cubre también `'paused'`. Si el anunciante pausaba la campaña, el
botón mostraba "Pautar" en vez de "Ver pauta" y el badge dorado desaparecía.
Se unificó al mismo criterio (`active OR paused`) que usa el dropdown de
`/pauta`. El mapa pasa de `Set<pub_id>` a `Map<pub_id, camp_id>` para que en
el futuro "Ver pauta" pueda profundizar al detalle de esa campaña específica.

**`/messages?pub=<id>` ahora abre la conversación con el dueño:** al hacer
clic en "Enviar mensaje" desde un anuncio patrocinado solo se pasa
`?pub=<id>` (no se sabe el `with` desde la card). `MessagesMain` detecta el
caso `pub presente + with ausente`, usa `usePublicationDetail` para resolver
`cus_id` del dueño y hace `router.replace('/messages?pub=X&with=Y')`. Si el
viewer es el propio dueño, redirige a `/messages` (no tiene sentido hablar
consigo mismo).

**Sugerencias de inicio de conversación:** cuando el chat está vacío,
`ConversationView` ahora muestra 4 chips con prompts predefinidos
(disponibilidad, visita, precio, qué incluye). Hacer clic en una rellena el
textarea pero NO envía — el usuario revisa/edita antes de mandar. Esto reduce
fricción para anuncios de "mensajes" y mejora la calidad de los primeros
mensajes (menos "hola" sueltos).

---

### Fase 10.6 — Denuncias enriquecidas + reembolso automático al sancionar ✅

**Pregunta de Aurelio:** ¿hay que crear flujo de denuncias separado para
pauta? **Respuesta:** no — el contenido violatorio es el mismo, así que la
denuncia es la misma. Lo que sí enriquecemos es el **contexto** que ve
soporte: si la publicación está pautada, eso amplifica el daño (mayor
alcance) y debe priorizarse.

**Backend — `getSupportReports`:**
- Cada fila ahora trae `active_camp_id`, `active_camp_objective`,
  `active_camp_remaining` (NUMERIC, devuelto como string por pg). Se calcula
  con `LEFT JOIN ad_campaigns` filtrando por `camp_status IN ('active','paused')`.
- `ORDER BY (active_camp_remaining IS NULL), active_camp_remaining DESC NULLS LAST, created_at DESC`
  → las denuncias sobre publicaciones pautadas aparecen primero, y entre
  ellas las de mayor saldo restante (mayor alcance/daño potencial).

**Backend — `resolveReport` (cuando soporte anula publicación):**
- Se ejecuta en transacción con `FOR UPDATE` sobre las campañas afectadas.
- Busca campañas `active|paused` para esa publicación, las marca `finished`
  y suma `(budget - spent)` al `cus_ad_credit` del anunciante.
- Inserta notificación `pub_sanctioned_refund` con `payload.refunded`.
- La respuesta incluye `{ refund: { campaigns: N, totalRefunded: Q } }` para
  que el frontend muestre el monto exacto.
- **Justificación:** la publicación se baja por contenido violatorio, pero
  no nos quedamos con el dinero del anunciante por dos razones: (1) es justo
  (el incumplimiento de las reglas no implica decomiso unilateral), (2) nos
  protege legalmente — DIACO/Código de Comercio podrían interpretar retener
  el saldo como enriquecimiento sin causa (Fase 12).

**Frontend — `SupportReportsMain`:**
- Chip dorado **"Pautada Q123.45"** junto al tipo de la denuncia cuando hay
  campaña activa. Tooltip con detalle.
- Fila con `background: rgba(251,191,36,0.05)` y borde izquierdo dorado para
  reforzar la prioridad visual.
- `act(r, 'delete')`: si la denuncia es sobre una publicación pautada, el
  `window.confirm` ahora muestra explícitamente:
  > *"Esta publicación tiene una campaña activa. Al eliminarla:
  > • Se finalizará la campaña.
  > • Se reembolsarán Q123.45 al crédito del anunciante."*

**Frontend — notificaciones:**
- Nuevo tipo `pub_sanctioned_refund` en `NotificationType`.
- Renderizado en `notificationUtils.ts`: ícono `fa-undo` dorado, snippet con
  el monto reembolsado, `href: '/pauta'`.

**Archivos tocados:**
- Backend: `config/connPostgresDB.js` (getSupportReports + resolveReport).
- Frontend: `src/types/api.ts` (SupportReportRow + NotificationType),
  `src/components/support/SupportReportsMain.tsx` (chip + confirm),
  `src/components/notifications/notificationUtils.ts`.

> Sin schema nuevo. Compatible con BD existente — el LEFT JOIN devuelve
> NULL si no hay campaña activa.

---

### Fase 10.7 — Precios de pauta dinámicos (config en BD) ✅

**Problema:** los precios de pauta estaban hardcoded en backend
(`AD_IMPRESSION_COST=0.05`, `AD_CLICK_COST=0.50`) y frontend
(constantes en `PautaMain.tsx`). Cualquier ajuste requería redeploy de ambos
repos. Además, Aurelio anticipó (correctamente) que con CPM Q50 una
campaña de Q1000 necesita 20,000 impresiones que en los primeros meses son
inalcanzables → las campañas no terminan → mal mensaje para anunciantes.

**Modelo de pricing — supuestos y decisiones (para revisión legal/finanzas):**

| Concepto | MVP (launch) | Cuando DAU > 5,000 | Justificación |
|---|---|---|---|
| CPM (Q por 1,000 imp) | **Q10** | Q20-Q50 | Meta GT cobra Q8-Q40. Empezamos abajo para incentivar prueba. |
| Q por impresión | **0.01** | 0.02-0.05 | CPM / 1000. |
| Q por clic (mensajes) | **0.50** | 0.50-1.00 | Click vale lo mismo en cualquier escala porque mide intención real. Meta GT cobra Q0.80-Q4.00. |
| Min budget | **Q10** | Q10-Q50 | Permite probar sin compromiso. |

**Decisión filosófica:** preferimos **subir precios** cuando hay tracción a
**bajarlos** cuando no hay (lo segundo daña confianza y métricas). Los
defaults seedeados están calibrados para "no llegamos a 10k usuarios en los
primeros meses" — escenario real de Aurelio, 2026-05-28.

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS ecom.platform_config (
    config_key   VARCHAR(60) PRIMARY KEY,
    config_value NUMERIC(12,4) NOT NULL,
    description  TEXT,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by   BIGINT REFERENCES ecom.customer(cus_id)
);
INSERT INTO ecom.platform_config (config_key, config_value, description) VALUES
    ('ad_impression_cost', 0.01, 'Q por impresión en campañas "destacar". Subir cuando DAU >= 5000.'),
    ('ad_click_cost',      0.50, 'Q por clic en botón "Enviar mensaje" de campañas "mensajes".'),
    ('ad_min_budget',     10.00, 'Presupuesto mínimo (Q) para crear una campaña.')
ON CONFLICT (config_key) DO NOTHING;
```

**Backend (`connPostgresDB.js`):**
- `getPlatformConfig()` con cache en memoria 60s y fallback a defaults si la
  tabla aún no existe (compatibilidad con BDs viejas sin migrar).
- `invalidatePlatformConfig()` se llama al actualizar.
- `createCampaign`, `getFeaturedPublications`, `recordAdClick` ahora leen
  del config en vez de constantes.

**Endpoints nuevos (`server.js`):**
- `GET /pricing-config` — **público** (sin auth). Devuelve
  `{ adImpressionCost, adClickCost, adMinBudget }`. Lo consume el form de
  `/pauta` para mostrar tarifas y estimados actualizados.
- `POST /admin/config` — requiere `cus_role='admin'`. Body: `{ key, value }`.
  Valida que `value >= 0`. Al éxito, invalida cache.

**Frontend:**
- Hook `usePricingConfig()` (staleTime 5 min, defaults intermedios para
  primer render).
- `PautaMain.tsx`: las constantes `MIN_BUDGET`, `IMPRESSION_COST`,
  `CLICK_COST` ahora son derivadas del hook. El explicador "¿Cómo funciona?"
  muestra los ejemplos numéricos calculados en runtime (Q10 ≈ 1,000 vistas
  en lugar del antiguo "Q10 ≈ 200 vistas").

**Cómo cambiar precios en producción (sin redeploy):**
```sql
UPDATE ecom.platform_config
   SET config_value = 0.025, updated_at = now()
 WHERE config_key = 'ad_impression_cost';
```
Backend invalida cache en ≤60s. Frontend en ≤5 min. Los cambios aplican a
**campañas nuevas y a impresiones futuras de campañas existentes** (no se
retroactiva el `spent` ya acumulado).

**Pendiente para Fase 11.x (opcional):** UI admin en `/admin/config` para
editar valores sin SQL directo. Por ahora un admin con acceso a Render/psql
es suficiente.

---

### Fase 11.1 — Eliminar cuenta + anonimización (GDPR-light) ✅

**Contribuye a Fase 12** (cumplimiento legal): habilita el "derecho al
olvido" preventivo antes de tener una ley de datos personales fuerte en GT.

**Backend — `POST /account/delete`** (auth requerido):
- Requiere la contraseña actual; bcrypt-compare contra `cus_password`.
- Transacción con `FOR UPDATE` sobre la fila del cliente.
- Finaliza campañas `active|paused` del usuario **sin reembolso** (el saldo
  se pierde por política T&C — Fase 10.2 / Fase 12 cláusula "Reembolsos y
  créditos"). El usuario es advertido explícitamente en el modal.
- Anula publicaciones del usuario (`pubsta_id = 4`), excepto vendidas (`= 3`).
- Anonimiza columnas PII de `customer`:
  ```
  cus_first_name='Usuario', cus_last_name='eliminado',
  cus_email_address=NULL, cus_phone=NULL, cus_birthday=NULL,
  cus_address=NULL, cus_imagen=NULL, cus_cover=NULL, cus_dpi=NULL,
  cus_handle='deleted_'||cus_id, cus_show_location=false, cus_ad_credit=0,
  cus_account_status='deleted', cus_ban_reason='Cuenta eliminada por el usuario.'
  ```
- Limpia la cookie `jwt` con `response.clearCookie`.

> **No hacemos hard-delete** por integridad referencial. Tenemos FKs desde
> `publications`, `messages`, `messages_reactions`, `tickets`,
> `customer_reviews`, etc. Borrar el row dejaría conversaciones huérfanas.
> El nombre "Usuario eliminado" preserva trazabilidad histórica anonimizada.

**Backend — enforcement en login:**
```js
if (user.cus_account_status === 'deleted') {
  return response.status(403).json({
    message: "Esta cuenta fue eliminada. Si deseas regresar, crea una cuenta nueva."
  });
}
```
Se chequea ANTES de las verificaciones de `banned`/`suspended` para dar el
mensaje correcto.

**Schema** (sin migración nueva; columna existente):
```sql
-- Solo se actualizó el comentario de cus_account_status para incluir 'deleted'.
-- En BD existente NO necesitas hacer nada: el VARCHAR(20) ya acepta el valor.
```

**Frontend:**
- Hook `useDeleteAccount` (POST /account/delete con password).
- Componente `DangerZone` (`src/components/Creator-Profile-info/`):
  caja con borde rojo al final de la sección Información Personal, botón
  "Eliminar cuenta" → modal con:
    1. Lista detallada de consecuencias (PII, pubs anuladas, campañas sin
       reembolso, no podrá volver a entrar).
    2. Checkbox de aceptación obligatorio.
    3. Campo de contraseña actual.
    4. Botón rojo "Eliminar definitivamente" (deshabilitado hasta cumplir
       las dos condiciones).
- Tras éxito: `logout()` del AuthContext (limpia caché de React Query) +
  `router.push('/')`.

**Archivos tocados:**
- Backend: `database.sql` (comment), `config/connPostgresDB.js` (login +
  `deleteAccount`), `server.js` (`POST /account/delete`).
- Frontend: `src/hooks/api/useDeleteAccount.ts` (nuevo),
  `src/components/Creator-Profile-info/DangerZone.tsx` (nuevo),
  `PersonalInfoTab.tsx` (monta `<DangerZone />`).

> **Importante para soporte:** un usuario que pidió eliminar su cuenta NO
> debería poder ser "reactivado" desde `/soporte/usuarios` sin un proceso
> formal (sería socavar su decisión de eliminación). Ver Fase 12 →
> implementar excepción en `supportUnbanUser` para no tocar status='deleted'.

---

### Fase 17 (pendiente) — Aplicar paleta de marca KIOSQUI

**Estado:** Diferida tras un experimento que no convenció (commit `0748da4`
revierte todo).

**Decisión (Aurelio, 2026-06-02):** la prueba aplicó la paleta KIOSQUI
(`#0f4c4c` verde, `#f6f0e6` crema, `#d97941` naranja, `#caf492` lima,
`#1f2933` ink) directamente sobre el theme del template. Ninguna de las
dos variantes de dark probadas (verde como body y ink+crema) terminó de
verse bien — el sitio quedó "limpio pero plano", sin la identidad que
debería tener una marca cálida y artesanal como KIOSQUI.

**Por qué se diferió y no se siguió iterando:**
- La paleta sola no basta. Falta tipografía, ilustración, ornamentos,
  jerarquía de elevation — todo lo que hace que una marca se "sienta".
- Necesitamos un brief de diseño con mockups por pantalla antes de
  volver a tocar CSS.

**Brief mínimo recomendado para retomar:**
1. Mockups de 3 pantallas clave en dark Y light (home, listing, detalle).
2. Decisión sobre el dark: ink azul-negro o algo más diferenciado.
3. Sistema de elevation (cuántos escalones, qué colores en cada theme).
4. Inventario de componentes donde entra la paleta más allá de body+botones
   (cards, badges, banners, dividers).
5. Decisión sobre tipografía propia o seguir con Urbanist del template.

**Aprendizaje completo del experimento:**
[`docs/PENDING_PHASE_BRAND_KIOSQUI.md`](docs/PENDING_PHASE_BRAND_KIOSQUI.md)
documenta TODO lo descubierto durante la prueba (5 días de trabajo):
- Arquitectura del archivo `brand-kiosqui.scss` (single source of truth).
- **3 gotchas críticos del template** que la próxima iteración debe evitar:
  - SCSS reordena `@import 'foo.css'` al inicio del bundle → usar `.scss`.
  - El template no setea `background-color` en `<body>` directamente.
  - El template usa `background-image: linear-gradient(...)` en `.fill-btn`
    que se pinta encima del `background-color`.
- Lista exhaustiva de selectores hardcoded con colores azul-noche en dark
  que el template definió sin usar vars (17 selectores en `_body-color.scss`).
- Mapeo de selectores donde se renderizan precios, botones, cards de auth.
- Inventario de los 38 archivos con fallbacks heredados de etapas previas.

**Tamaño estimado al retomar:** 2-3 ventanas si el brief de diseño llega
completo. Sin brief, no empezar.

---

### Fase 19.5 — Amenidades + dimensiones de terreno + niveles de casa ✅

**Entregado 2026-06-03.** Sección "Otros" en el form con amenidades en
chips por categoría + frente/fondo (terreno) + niveles (casa).

**SQL (correr en prod):**
```sql
CREATE TABLE ecom.cat_amenities (
    amen_id SERIAL PRIMARY KEY, amen_name VARCHAR(60) NOT NULL,
    amen_icon VARCHAR(40), amen_category VARCHAR(30) DEFAULT 'otros',
    amen_active BOOLEAN DEFAULT true, amen_order INT DEFAULT 100
);
-- + seed con 26 amenidades en 5 categorías
CREATE TABLE ecom.publications_amenities (
    pub_id BIGINT REFERENCES publications(pub_id) ON DELETE CASCADE,
    amen_id INT REFERENCES cat_amenities(amen_id),
    PRIMARY KEY (pub_id, amen_id)
);
CREATE INDEX idx_pub_amen_amen_id ON publications_amenities(amen_id);
ALTER TABLE ecom.publications_detail
    ADD COLUMN pubdet_frente NUMERIC(8,2),
    ADD COLUMN pubdet_fondo  NUMERIC(8,2);
```

**Seed (26 amenidades, 5 categorías):**
- **Condominio** (7): Piscina, Gimnasio, Salón de eventos, BBQ,
  Juegos, Cancha deportiva, Ascensor
- **Interior** (6): Cocina equipada, Aire, Calefacción, Closets,
  Lavandería, Amueblada
- **Exterior** (5): Jardín, Terraza, Patio, Parqueo visitas, Mascotas
- **Seguridad** (4): Garita 24h, Cámaras, Acceso controlado, Alarma
- **Servicios** (4): Agua, Luz, Internet, Gas

**Backend:**
- `GET /amenities` público con catálogo activo ordenado.
- `savePublication` / `updatePublication` aceptan `amenities: number[]`,
  `frente`, `fondo`. Casa ahora persiste `nlevel` (niveles totales).
- `updatePublication` con delete-all + insert-new para amenidades.
  Si el body no manda `amenities`, preserva (update parcial).
- `getPublicationById` devuelve amenities con JOIN al catálogo.
- `getPublicationEditById` devuelve `amenities` como `number[]`
  para precargar chips.

**Frontend:**
- `useAmenities()` + `useAmenitiesGrouped()` con cache 10 min.
- `AmenitiesPicker` — chips por categoría con toggle.
- `PublicationForm` — sección "Otros" después de descripción.
  Inputs frente/fondo en bloque terreno. Casa muestra "Niveles".
- `PublicationContent` (detalle) — sección "Comodidades" con grid de
  chips. Frente/fondo en tab de detalles para terreno.

**Decisión M:N vs columnas booleanas:** agregar amenidad futura = un
INSERT en `cat_amenities`, sin schema change ni redeploy backend.

---

### Fase 19 — Búsqueda avanzada + mapa interactivo ✅

**Entregado 2026-06-03.** Filtros avanzados client-side + mapa Leaflet
con clustering por municipio. **Sin cambios backend.**

**Componentes nuevos:**

1. **`src/utils/gtMunicipalityCoords.ts`** — diccionario de coordenadas
   centroides de ~30 municipios principales de Guatemala (capital, Mixco,
   Villa Nueva, Antigua, Xela, Cobán, Flores, etc.) + 22 departamentos.
   - `getCoordsFromLocation(country, city, town)` busca por prioridad:
     municipio → ciudad → fallback al centro de GT (15.5, -90.25).
   - Normalización: minúsculas, sin tildes, sin prefijos
     ("ciudad de"/"departamento de") → matches robustos.
   - `clusterByCoords()` agrupa publicaciones con coords idénticas
     (mismo municipio) para mostrar un solo pin con badge "N".

2. **`src/components/publications/AdvancedFiltersPanel.tsx`** — panel
   colapsable con 6 filtros: precio min/max, habitaciones min, baños
   min, m² min, ubicación texto libre. Badge con contador de filtros
   activos en el header. Botón "Limpiar N filtros" cuando hay alguno.

3. **`src/components/publications/PropertiesMap.tsx`** — mapa Leaflet
   con OpenStreetMap tiles (sin API key). Componentes cargados con
   `dynamic(..., {ssr: false})` para evitar errores de `window` en SSR.
   Iconos default parcheados con CDN (`unpkg.com/leaflet`). Popup por
   cluster con: foto de la primera propiedad (variante 'card'), precio
   con currency, ubicación, botón "Ver propiedad". Si el cluster tiene
   más de 1, agrega "+ N propiedades más en esta zona".

**Modificaciones:**

- `src/components/publications/PublicationsBar.tsx`: extiendo
  `PublicationFilters` con `priceMin`, `priceMax`, `roomsMin`,
  `bathsMin`, `sizeMin`, `location`. Strings vacíos = sin filtro.
- `src/components/publications/PublicationsMain.tsx`:
  - Aplica los 6 filtros nuevos en el `useMemo` existente, antes del
    sort. NaN se ignora (cero / infinity como neutro).
  - Toggle de vista: Lista / Lista + Mapa (split) / Mapa.
  - Modo split: grid 1.2fr + 1fr con mapa sticky a la derecha.
    En ≤991px colapsa a una columna (mapa arriba, lista abajo).
  - Modo lista: grid 4 columnas (existente).
  - Modo mapa: solo el mapa, sin destacados ni listado.
  - `<FeaturedPublicationsSection>` solo se muestra en modo lista.

**Dependencias nuevas (frontend):**
- `leaflet` ^1.9.4 — librería de mapas (open source, sin API key).
- `react-leaflet` ^5.0.0 — wrappers React de Leaflet.
- `@types/leaflet` — types.
- Instalados con `--legacy-peer-deps` por conflicto menor con la
  versión de React del template.

**Limitación documentada (entrará en Fase 19.1):**
- 🟡 Las coordenadas son por centroide de municipio, no exactas por
  publicación. Precisión ±2-5 km. Funciona para descubrimiento pero
  no para "buscar la propiedad exacta en el mapa". Solución:
  - Agregar `pubdet_lat NUMERIC(9,6)` y `pubdet_lng NUMERIC(9,6)` a
    `publications_detail`.
  - Al subir/editar publicación, geocoding con Nominatim (free) o
    input manual de lat/lng por el propietario.
  - `getCoordsFromLocation()` queda como fallback cuando no hay coords
    exactas.
- 🟡 No hay filtro por viewport del mapa (panear el mapa NO refiltra
  el listado). Hacerlo requeriría `useMap()` de react-leaflet +
  `onMoveEnd`. Mejora UX significativa para Fase 19.2.
- 🟡 Filtros aplican sobre el array completo en cliente. Con 1000+
  publicaciones podría ralentizar; cuando llegue a esa escala mover
  filtros a server-side (`/publications?priceMin=...&priceMax=...`).

---

### Fase 18 — Launch polish (SEO + FAQ + 404 + sitemap) ✅

**Entregado 2026-06-02.** Mejoras pequeñas-medianas para SEO y experiencia
de marca antes del lanzamiento.

**1. Home oficial reapuntada (cierre Fase 16):**
- `src/app/page.tsx` ahora renderiza `HomeThreeMain` (la versión KIOSQUI
  con 6 secciones dinámicas). El `HomeMain` legacy del template sigue
  accesible en `/home-two` para QA o comparativa.

**2. `/faq` con contenido real:**
- `src/components/faq/FAQMain.tsx` reescrito completamente.
- 6 categorías: Cuenta, Verificación, Publicar propiedades, Planes y
  pauta, Eliminar/desactivar cuenta, Soporte y denuncias.
- ~22 Q&A en acordeón (una abierta a la vez) con respuestas que
  cross-linkean a /terminos, /privacidad, /soporte/tickets, etc.

**3. `/404` mejorado:**
- `src/components/error-page/ErrorMain.tsx` traducido + copy reescrito.
- 2 CTAs primarios: "Volver al inicio" + "Buscar propiedades".
- Chips de rescate SEO: Casas / Apartamentos / Terrenos. Reduce bounce
  cuando el usuario llega por link viejo.

**4. Metadata + OpenGraph en RootLayout:**
- `src/app/layout.tsx` exporta `metadata: Metadata` con:
  - `metadataBase: new URL(NEXT_PUBLIC_SITE_URL || 'https://kiosqui.gt')`
  - Title template `%s | KIOSQUI`.
  - Description, keywords (bienes raíces GT).
  - OpenGraph: type, locale es_GT, og:image 1200x630.
  - Twitter Card summary_large_image.
- `lang="en"` → `lang="es"` en `<html>`.

**5. `/sitemap.xml` dinámico:**
- Nuevo `src/app/sitemap.ts` que Next sirve automáticamente.
- Por ahora estático con rutas públicas. Las publicaciones individuales
  pendientes (requiere endpoint backend `/sitemap-data` público con
  `[{id, updatedAt}]`).

**6. `/robots.txt`:**
- Nuevo `src/app/robots.ts` que Next sirve automáticamente.
- Allow: rutas públicas. Disallow: `/soporte/*`, `/admin/*`, `/messages`,
  `/favorites`, `/my-publications`, `/creator-profile-info*`, `/verify`,
  `/forgot`, `/invite`, `/api/`.
- Apunta al sitemap.

**Pendientes (no bloquean launch):**
- ✅ ~~Imagen `/assets/img/og-default.jpg` 1200x630 con branding KIOSQUI~~ —
  RESUELTO 2026-06-28 con OG image **dinámica** (`src/app/[locale]/opengraph-image.tsx`
  + `twitter-image.tsx`, `ImageResponse` de `next/server`), localizada es/en, sin
  depender de un asset estático. Se quitaron las refs muertas al `.jpg` en metadata.
  Verificado: render 200 `image/png` 1200x630 válido en ambos locales.
- ✅ ~~Endpoint público `/sitemap-data` en backend para incluir
  publicaciones individuales en sitemap.~~ — HECHO 2026-06-28. Backend
  `GET /sitemap-data` ({id, slug}, `pubsta_id NOT IN (3,4)`, con slug, cap 20000);
  `sitemap.xml/route.ts` lo consume y emite `/{locale}/publications/{slug}` con
  hreflang. Verificado e2e: 30 URLs de publicaciones en el sitemap. **Con esto
  Fase 18 queda 100% cerrada** (solo quedaría partir el sitemap en índice si se
  superan ~25k publicaciones × 2 locales).
- ✅ ~~Metadata específico en `/publications/[id]`~~ — entregado en Fase 18.1.
- ✅ ~~Schema.org JSON-LD para Listing en publicaciones~~ — entregado en Fase 18.1.

---

### Fase 18.1 — SEO de publicaciones individuales (metadata + JSON-LD) ✅

**Entregado 2026-06-02.** Cada `/publications/[id]` ahora emite metadata
único (título del anuncio, descripción, OG image real) y JSON-LD
Schema.org para rich results en Google.

**Archivos nuevos:**

1. **`src/utils/publicationSeo.ts`** — helpers de SEO:
   - `fetchPublicationForSEO(id)`: fetch SSR al endpoint público
     `/publication/:id` con `next: { revalidate: 300 }` (Next dedupa con
     el llamado de `generateMetadata` → no doble request).
   - `absoluteImageUrl(src)`: resuelve relativas con `getBackendUrl` y
     aplica `getImageVariant(src, 'card')` para usar la variante
     optimizada en lugar del original.
   - `PublicationSeoData`: shape acotado y seguro (solo lo que SEO
     necesita).

2. **`src/components/publications/PublicationJsonLd.tsx`** — server
   component que emite `<script type="application/ld+json">` con
   Schema.org Product:
   - @type Product (mejor cobertura en Google rich results que
     RealEstateListing a 2026).
   - name, description, image[], address.
   - offers: price, priceCurrency, availability (InStock si
     `price > 0`).
   - additionalProperty[]: habitaciones, baños, parqueos, m² del
     terreno.
   - category: "Casa" / "Apartamento" / "Terreno".

3. **`src/app/publications/[id]/page.tsx`** — modificado:
   - `generateMetadata({params})` exporta title, description, openGraph
     (article + images), twitter card y canonical.
   - El page es ahora `async` y vuelve a llamar `fetchPublicationForSEO`
     (cache dedupa) para renderizar `<PublicationJsonLd>` server-side.
   - Fallback: si `fetchPublicationForSEO` devuelve null, metadata
     genérica + skip del JSON-LD. La página seguirá funcionando.

**Beneficios concretos:**
- Compartir un anuncio en WhatsApp/Twitter/Facebook → preview con
  foto del inmueble + título + precio en descripción.
- Google indexa el título real ("Casa 3 habitaciones en zona 15")
  en lugar del default "KIOSQUI".
- Rich results: precio y características aparecen en SERPs si Google
  los considera relevantes.
- Cache 5 min en el fetch → bajo costo en backend, frescura suficiente
  para SEO.

**Pendientes opcionales:**
- 🟡 Exponer `pubsta_id` en `PublicationSeoData` para que
  `availability` sea más estricto: 2='InStock', 3='SoldOut',
  4='Discontinued'. Hoy InStock si tiene precio > 0.
- 🟡 Si en el futuro tenemos coordenadas en BD, agregar `geo:{...}` al
  JSON-LD para mejorar local SEO.

---

### Fase 16 — Home Style 3 con datos reales ✅

**Entregado 2026-06-02.** `/home-three` ahora monta 6 secciones de marketplace
real en vez del contenido NFT-themed del template ("Discover Digital
Artworks & Collect Best NFTs").

**Secciones nuevas en `src/components/home-three/`:**

1. **`KiosquiHero`** — titular "Encontrá tu próximo hogar en Guatemala" +
   barra de búsqueda funcional (submit → `/publications?q=`) + chips
   rápidos (Casas / Apartamentos / Terrenos) + trust badges (DPI
   verificado, visor 3D, mensajería directa).
2. **`FeaturedShowcase`** — wrapper sobre `FeaturedPublicationsSection`
   (Fase 10). Si no hay campañas activas, retorna `null` (no muestra
   header vacío).
3. **`CategoriesShowcase`** — 3 cards (Casa, Apto, Terreno) con icono y
   gradient distinto por categoría. Consume `usePublicationCategories()`,
   no hardcodea IDs.
4. **`TopSellersShowcase`** — 8 vendedores del endpoint `/top-sellers`
   (Fase 9): avatar, badge de verificado, nombre, handle, total de
   publicaciones + rating. Skeleton shimmer mientras carga.
5. **`HowItWorks`** — 4 pasos estáticos (Buscás → Contactás → Visitás
   → Cerrás).
6. **`HomeCTA`** — banner final que cambia según `useAuth()`:
   - Sin sesión: "Crear cuenta gratis" + "Ver planes".
   - Con sesión: "Publicar propiedad" + "Ver mis publicaciones".

**Orquestación (`HomeThreeMain.tsx`):**
- Reescrito completamente. Antes solo montaba `<HeroSectionThree/>` +
  `<ExploreArtsThree/>` (del template). Ahora monta las 6 secciones
  nuevas + estilos globales compartidos para `.kh-section-head`.
- Archivos viejos `HeroSectionThree.tsx`, `ExploreArtsThree.tsx`,
  `ExploreArtsCommon.tsx` se mantienen en disco por si alguien quiere
  reciclar alguno. No están referenciados → tree-shake los saca del
  bundle.

**Hooks consumidos (ninguno nuevo):**
- `useTopSellers(8)` — Fase 9.
- `useFeaturedPublications(6)` — Fase 10.
- `usePublicationCategories()` — Fase 7.
- `useAuth()` — Fase 1.

**Sin cambios backend.** Todos los endpoints ya existían.

**Pendientes opcionales (no bloquean):**
- 🟡 La home oficial (`/`) sigue apuntando al `HomeMain` legacy del
  template. Para hacer `/` también KIOSQUI, basta cambiar
  `src/app/page.tsx` para que renderice `HomeThreeMain`.
- 🟡 El hero podría tener una mini-demo del visor 3D cuando la pauta
  empiece a generar tráfico.

---

### Fase 16 (plan original) — Home Style 3 con datos reales

**Decisión (Aurelio, 2026-05-28):** la home oficial pasa a ser
`/home-three` (`HomeThreeMain` + `HeroSectionThree` + `ExploreArtsThree`).
Hoy muestra contenido de template NFT-themed en inglés ("Discover Digital
Artworks & Collect Best NFTs") con imágenes y perfiles hardcoded.

**Cambios necesarios:**

1. **Convertir `/home-three` en la home oficial** — `src/app/page.tsx`
   apunta a `HomeThreeMain`, redirigir `/home-three` a `/` (o dejar de
   alias). Quitar el otro home (`home-two` si existe).

2. **Hero section** (`HeroSectionThree`):
   - Quitar copy NFT, reescribir para bienes raíces GT.
   - **Imagen hero**: leerla del nuevo `site_assets` (Fase 15) para que se
     pueda cambiar desde el portal sin redeploy.
   - Sidebar con 3 cards: mostrar las 3 **propiedades destacadas activas
     más relevantes** (mezcla de `useFeaturedPublications` Fase 10).

3. **Sección "Categorías"** (nueva o reutilizar `ExploreArtsThree`):
   - Mostrar las categorías de propiedad (`cat_publication_gender`) con
     ícono y cantidad de publicaciones activas.
   - Click → `/publications?category=X`.

4. **Sección "Top Creators"**:
   - Reutilizar el endpoint `getTopSellers` (Fase 9) que ya existe.
   - Cards con avatar, nombre, badge de verificación, total de pubs.
   - Click → `/creator-profile/[id]`.

5. **Sección "Propiedades destacadas"** (debajo del hero):
   - Grid de 6-8 publicaciones más recientes con tag de "Patrocinado" si
     vienen del feed de pauta.
   - "Ver todas" → `/publications`.

6. **Sección "Cómo funciona"** (opcional pero recomendado):
   - 3 pasos: Crear cuenta → Publicar/Buscar → Conectar.
   - Construye confianza para visitantes nuevos.

**Endpoints nuevos requeridos:**
- `GET /home-stats` (público): `{ totalActivePubs, totalSellers,
  totalCompanies }` para mostrar "1,234 propiedades activas" en el hero.
- `GET /categories-with-counts` (público): `[{ pubgen_id,
  pubgen_description, count }]` para la sección Categorías.

**Endpoints reutilizables:**
- `GET /top-sellers` (Fase 9).
- `GET /featured-publications?limit=8` (Fase 10).
- `GET /publications` (lista general).

**Estimación:** 1.5 días (redactar copy + adaptar componentes + endpoints +
estilos). Posiblemente más si el copy publicitario lo escribe un copywriter.

**Trigger:** después de Fase 15 (portal de imágenes) para que la imagen
hero sea dinámica desde día 1.

---

### Fase 15 — Portal de gestión de imágenes (CMS-lite) ✅

**Implementado 2026-05-28.** Permite cambiar imágenes user-facing del sitio
sin redeploy. Patrón inspirado en `ecom.platform_config` (Fase 10.7).

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS ecom.site_assets (
    asset_key    VARCHAR(60) PRIMARY KEY,
    asset_url    TEXT NOT NULL,
    asset_label  TEXT,
    width        INT, height INT,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by   BIGINT REFERENCES ecom.customer(cus_id)
);
```
Seed inicial con 8 keys: `error_404`, `hero_home_bg`, `hero_card_1..3`,
`logo_light`, `logo_dark`, `cover_default`. URLs apuntan a los assets
estáticos del template como fallback inicial.

**Backend:**
- `getSiteAssetsFromDb()` con cache 5 min (igual patrón que
  `platform_config`). Fallback a `{}` si la tabla no existe.
- `GET /site-assets` (público): mapa `{ asset_key: { url, label, width,
  height } }`. Frontend lo consume con staleTime 10 min.
- `GET /admin/site-assets` (admin): lista con metadata extra (updated_at,
  updated_by_name).
- `POST /admin/site-assets` (admin): actualiza `asset_url` de una key
  específica. Invalida cache.
- `POST /upload-site-asset` (admin, multipart): subida dedicada que
  preserva aspect ratio con `sharp.resize({fit:'inside'})` — crítico para
  logos. Devuelve `{ path, width, height }` y la guarda en
  `uploads/site-assets/`. **Distinto del `/upload` general** que usa
  `fit:'cover'` y rompería logos.

**Frontend:**
- Hook `useSiteAssets()` (todos) + `useSiteAsset(key)` (uno).
- Helper `resolveAssetUrl(url)`: prefija con backend si empieza con
  `/uploads/`, deja relativa si empieza con `/assets/` (Next public).
- Página admin `/admin/imagenes` (`AdminImagesMain`): grid de cards con
  preview, key, label, dimensiones, "última actualización por X". Botón
  "Cambiar imagen" → file input → sube vía `/upload-site-asset` → updatea
  asset_url. Bloquea con mensaje si `user.role !== 'admin'`.
- **404 ya migrado** (`ErrorMain.tsx`) como prueba de fuego: usa
  `useSiteAsset('error_404')` con fallback al import estático.

**Migración SQL para BDs existentes:**
```sql
-- copy/paste del bloque ecom.site_assets de database.sql
```

**Cómo agregar una nueva imagen al portal:**
1. `INSERT` en `ecom.site_assets` con la URL del template como fallback.
2. En el componente que la usaba, reemplazar el `import` estático por
   `useSiteAsset('mi_key')` + fallback al import original.
3. Listo — aparece automáticamente en `/admin/imagenes`.

**Pendiente para Fase 16 (Home Style 3):**
- Migrar `HeroSectionThree` para que lea `hero_home_bg`, `hero_card_1..3`
  vía `useSiteAsset` (las keys ya están seedeadas).

---

### ~~Fase 15 (planning original)~~ — Portal de gestión de imágenes (CMS-lite)

**Recordatorio (Aurelio, 2026-05-28):** poder cambiar las imágenes de la
página (404, hero, banners, etc.) **sin redeploy**, desde un panel admin.

**Imágenes candidatas para migrar a dinámicas:**
- `404` (`error-404.png`) — la que se muestra en `/error-404`.
- Hero principal (`banner-3-bg.jpg`) — fondo del Home Style 3.
- Cards laterales del hero (3 imágenes en `HeroSectionThree`).
- Logo (`logo/logo.png`, `logo/logo-white.png`).
- About hero, login background, register background.
- Cover por defecto de perfiles sin portada.
- Placeholder de publicación sin imagen.

**NO migrar a dinámicas** (cambian rara vez, no vale la pena):
- Iconos SVG, shapes decorativos del template.
- Avatares de perfil generados por el usuario (ya son dinámicos vía R2).

**Schema (Fase 15):**
```sql
CREATE TABLE IF NOT EXISTS ecom.site_assets (
    asset_key    VARCHAR(60) PRIMARY KEY,        -- 'hero_home_bg', 'logo_light', etc.
    asset_url    TEXT NOT NULL,                  -- ruta servida (R2 o local)
    asset_label  TEXT,                           -- descripción para el admin
    width        INT, height INT,                -- para Image fit; null si desconocido
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by   BIGINT REFERENCES ecom.customer(cus_id)
);
-- Seed con keys + URLs actuales como fallback.
INSERT INTO ecom.site_assets (asset_key, asset_url, asset_label, width, height) VALUES
    ('error_404',    '/assets/img/shape/error-404.png',     'Imagen del error 404',      602, 354),
    ('hero_home_bg', '/assets/img/banner/banner-3-bg.jpg',  'Fondo del hero principal',  1920, 800),
    ('hero_card_1',  '/assets/img/bids/oc-category-2-2.jpg','Card lateral 1',            500, 500),
    ('hero_card_2',  '/assets/img/bids/oc-category-1.jpg',  'Card lateral 2',            500, 500),
    ('hero_card_3',  '/assets/img/bids/oc-category-3.jpg',  'Card lateral 3',            500, 500),
    ('logo_light',   '/assets/img/logo/logo.png',           'Logo (modo claro)',         null, null),
    ('logo_dark',    '/assets/img/logo/logo-white.png',     'Logo (modo oscuro)',        null, null),
    ('cover_default','/assets/img/profile/profile-cover/profile-cover-big-1.jpg',
                                                            'Portada por defecto',       1200, 400)
ON CONFLICT (asset_key) DO NOTHING;
```

**Backend:**
- `GET /site-assets` (público): `{ [asset_key]: { url, width, height, label } }`.
  Cacheado en memoria 5 min (igual que `platform_config`).
- `POST /admin/site-assets/upload` (solo `cus_role='admin'`):
  - Body multipart con `asset_key` + archivo.
  - Sube a R2/local en `uploads/site-assets/<asset_key>-<hash>.<ext>`.
  - Updates `asset_url` en la tabla.
  - Invalida cache.
- `GET /admin/site-assets` (solo `cus_role='admin'`): lista todas las keys
  con preview, para el portal admin.

**Frontend:**
- Hook `useSiteAssets()` — fetch una vez con staleTime 10 min.
- Helper `useSiteAsset('hero_home_bg')` → `{ url, width, height }`.
- Reemplazar `import errorLogo from "../../../public/assets/img/shape/error-404.png"`
  por `const { url, width, height } = useSiteAsset('error_404');` +
  `<Image src={url} width={width} height={height} />`.
- Página admin `/admin/imagenes`: lista de assets con preview, botón
  "Cambiar imagen" por cada uno → modal con cropper + upload.
- Reutilizar cropper de Fase 7 (avatar/cover).

**Estimación:** 2 días (schema + endpoints + hook + reemplazo en
componentes + página admin).

**Importante:** mover SOLO las imágenes user-facing donde tiene sentido
cambiar sin redeploy. Iconos SVG decorativos NO entran al portal — saturan
el UI sin valor.

---

### Fase 24 ✅ — Ranking unificado con tabs internas

**Por qué:** la app tenía dos páginas (`/creators` y `/art-ranking`) que
parecían lo mismo desde afuera — ambas listaban vendedores. Pero internamente
usaban endpoints distintos con algoritmos distintos:

- `/creators` → `GET /top-sellers` con score compuesto
  (`seguidores×2 + reseñas×5 + rating×10 + vistas×0.05`).
  Cualquier vendedor con ≥1 publicación activa entra al ranking.
- `/art-ranking` → `GET /sellers/ranking` con `AVG(rating_stars)` estricto.
  Requiere ≥1 reseña completada para aparecer.

El usuario terminaba viendo dos entradas en el menú principal sin entender
la diferencia. Solución: una sola pantalla con tabs.

**Cambios:**

- **`src/app/[locale]/ranking/page.tsx`** (nuevo): página única canónica.
  Envuelve `RankingUnifiedMain` con `<Suspense>` (requerido por Next 13.4
  porque el componente usa `useSearchParams`).
- **`src/components/ranking/RankingUnifiedMain.tsx`** (nuevo): controla el
  estado de la tab activa, sincroniza con el query param `?tab=` y emite
  `router.replace` (no `push`) para que el back del navegador NO vaya entre
  tabs sino a la página anterior.
- **`src/components/ranking/RankingExplainerBox.tsx`** (nuevo): bloque
  reusable con icono + título + descripción + fórmula. Aparece arriba de
  cada tab explicando cómo se calcula ese ranking.
- **`src/components/ranking/RankingDirectoryPanel.tsx`** (nuevo): tab
  Directorio. Reusa `CreatorSingle` (cards visuales con cover + avatar).
- **`src/components/ranking/RankingRatedPanel.tsx`** (nuevo): tab Mejor
  calificados. Reusa `RankingTableTitle` + `SingleArtRanking` (tabla con
  columnas). Re-aplica el override CSS del Fase 22 que neutraliza el
  counter `decimal-leading-zero` del template (bug "011/022").
- **`src/app/[locale]/creators/page.tsx`** y **`art-ranking/page.tsx`**:
  ahora solo hacen `redirect(/<locale>/ranking?tab=...)`. Esto preserva
  el SEO de los links ya indexados por Google.
- **`src/data/menu-data.ts`**: dos entradas (Directorio + Ranking) → una
  sola entrada "Ranking" → `/ranking`. Los `id` huecos se conservan
  documentados para reactivar la entrada si en el futuro se quiere
  volver al patrón anterior sin renumerar todo.
- **`src/layout/footer/Footer.tsx`**: ahora los links del footer usan los
  query params correctos: `/ranking?tab=directorio` y `/ranking?tab=calificados`.

**URLs canónicas:**
- `/<locale>/ranking?tab=directorio` (default si no hay `?tab`)
- `/<locale>/ranking?tab=calificados`

**Redirects (legacy):**
- `/<locale>/creators` → `/<locale>/ranking?tab=directorio`
- `/<locale>/art-ranking` → `/<locale>/ranking?tab=calificados`

**Out of scope:**
- Tests automatizados de la UI del ranking (queda para Fase 21 / Playwright).
- Sitemap dinámico no se modifica — las URLs viejas siguen siendo válidas
  (redirect 307/308) y el nuevo `/ranking` es estático.

---

### Fase 23 ✅ — Captcha Cloudflare Turnstile en `/contact`

**Por qué:** el form de contacto del template original no enviaba nada
(`console.log` y nada más) y no tenía protección anti-bot. Al exponerlo al
público iba a recibir spam casi de inmediato. Elegimos **Cloudflare
Turnstile** sobre reCAPTCHA porque (a) es gratis sin cuota dura, (b) NO
trackea al usuario (sin cookies de Google), (c) drop-in con un solo script.

**Cambios principales:**

- **Frontend `src/components/common/TurnstileWidget.tsx`** (nuevo):
  componente client que carga el script de Cloudflare on-demand y renderea
  el widget. En dev sin sitekey muestra un placeholder claro en lugar de
  fallar silencioso.
- **Frontend `src/form/ContactFormSection.tsx`** (reescrito): el form del
  template estaba en inglés con copy genérico y no enviaba nada. Ahora está
  en español, valida con Yup, integra Turnstile, llama a `POST /contact` y
  bloquea el submit hasta que el captcha esté completo.
- **Backend `submitContactMessage`** en `config/connPostgresDB.js`: valida
  Turnstile contra `https://challenges.cloudflare.com/turnstile/v0/siteverify`
  con `TURNSTILE_SECRET_KEY` antes de aceptar el mensaje. Si la secret no
  está configurada en producción → 503 (no acepta nada). En dev sin secret
  → warning + paso libre. Envía email a `SUPPORT_EMAIL || EMAIL_USER` con
  HTML escapado defensivamente.
- **Backend `server.js`**: registra `POST /contact` (público, sin
  `authMiddleware`).

**Variables de entorno nuevas** (que el deploy debe configurar):

| Variable | Dónde | Para qué |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Frontend (Vercel/Render) | Sitekey pública del widget |
| `TURNSTILE_SECRET_KEY` | Backend (Render) | Secret server-side para validar |
| `SUPPORT_EMAIL` (opcional) | Backend | Destinatario del email de contacto. Si no se setea, va al `EMAIL_USER` (sender). |

Para testing local sin Cloudflare existe la sitekey "always pass":
- Frontend: `NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA`
- Backend: `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA`

**Out of scope (futuro):** persistir mensajes en BD (tabla `contact_messages`).
Hoy solo se envían por email. Si el volumen crece, agregar la tabla antes
del email para tener trazabilidad.

---

### Fase 22 ✅ — UI cleanup pre-rediseño + URLs canónicas con slug

**Por qué:** dos cosas mezcladas porque ambas son "preparación previa al
rediseño de UI" (Fase 17 todavía pendiente con Claude Design):

1. **Limpieza de menús, footer y nav** — el template `oction` traía mucho
   copy de NFT marketplace (Wallet Connect, Activity, Forum, Pages con
   FAQ/Login/Terms sueltos, Home Style 1/2/3, Creator Profile, etc.).
2. **URLs canónicas con slug SEO + anti-enumeración** — antes `/publications/123`
   permitía cambiar el número y leer cualquier publicación. Ahora las URLs
   son `/publications/casa-zona-15-aBxYz9` (slug + 6 chars random base62).

#### 22.1 — Limpieza de menús, footer y FAB

**Tres listas de menú independientes** en `src/data/menu-data.ts`:
- `desktopMenu` → `HeaderOneMenu` (navbar superior en `/messages`)
- `mobileMenu` → `MobileMenu` (hamburguesa derecha de `HeaderOne`) **y**
  `SidebarMenuSection` (sidebar derecho de `HeaderTwo` en el resto)

Antes los 3 leían el mismo bundle con basura del template. Ahora son **7
items KIOSQUI**: Inicio · Propiedades · **Directorio** · Ranking · Planes
· Contacto.

> "Directorio" (id=3, ruta `/creators`) reemplaza al label "Vendedores"
> porque ya existe "Ranking" (id=4, ruta `/art-ranking`) y ambos llevan a
> listados de vendedores con criterios distintos:
> - `/creators` → `getTopSellers` con score compuesto
>   (`seguidores×2 + reviews×5 + rating×10 + vistas×0.05`).
> - `/art-ranking` → `getSellerRanking` estricto solo por
>   `AVG(rating_stars)`, requiere ≥1 reseña completada.

**Quitados del menú principal:** Home Style 1/2, Creator Profile, Creator
Personal Info, FAQ (queda en footer), Login, Terms (queda en footer),
Wallet Connect, Activity, 404 page, Forum, submenús de Publicaciones,
**Pauta** (solo útil para usuarios logueados; se accede desde
`/pricing-plan`, `/my-publications` o el FAB).

**Footer reescrito** (`src/layout/footer/Footer.tsx`): 3 columnas KIOSQUI
(Marca con redes sociales reales, Legal + Ayuda, Explorar). Eliminados
"Explore Artworks" e "Insight Community" del template. Copyright limpiado
del placeholder "BDevs / (987) 547587587 / Subscribe sin endpoint".

**FAB Crear publicación** (`src/components/common/CreatePublicationFAB.tsx`):
botón flotante redondo bottom-right que solo aparece si hay sesión. Se
oculta en `/upload`, `/login`, `/register`, `/forgot`, `/verify`, `/messages`
y `/publications/<x>/viewer`. Z-index 1040.

**Sidebar `SidebarMenuSection`** (`src/layout/sidebar/SidebarMenuSection.tsx`):
ahora consume `mobileMenu` (lista plana), eliminada toda la lógica de
acordeón / submenús. Reemplazado el CTA "Create and sell your NFTs" del
template por "Publicá tu propiedad en minutos" → `/upload`. **Top Sellers,
Support Links y todo lo demás del sidebar quedan intactos** (el cambio es
solo en el bloque del menú interno).

#### 22.2 — URLs canónicas con slug SEO + redirect 301 legacy

**Cambio aplicado al `database.sql` (consolidado, sin `ALTER`):**

`CREATE TABLE publications` (línea 599) ahora incluye:
```sql
pub_slug VARCHAR(160) UNIQUE,
```
+ `CREATE INDEX IF NOT EXISTS idx_publications_pub_slug ON publications(pub_slug);`

Producción nueva queda coherente desde cero.

**Helper backend `utils/slugify.js`** (nuevo):
- `slugify(text)`: lowercase + NFD (sin tildes) + `ñ → n` + `[^a-z0-9]+ → -`
  + capeado a 60 chars.
- `genSlugSuffix()`: 6 chars base62 (62⁶ ≈ 5.7 × 10¹⁰ → colisión despreciable).
  Usa `crypto.randomBytes`, no `Math.random`.
- `composeSlug(title)`: `<slug>-<6 chars>`. Si el título queda vacío,
  fallback a `"publicacion-XXXXXX"`.
- `looksLikeLegacyId(s)`: helper para detectar param numérico en endpoint.

**Cambios en `config/connPostgresDB.js`:**
- `getPublicationById`: ahora acepta **slug O id numérico**.
  - Si el param es slug → lookup por `pub_slug`.
  - Si el param es ID numérico → lookup por `pub_id` Y responde **301
    redirect** al URL canónico con slug (para que crawlers de Google
    indexen el slug y dejen de pegar al ID legacy).
- `savePublication`: genera slug con `composeSlug(title)` y lo inserta en
  `pub_slug`. Reintenta hasta 3 veces ante colisión UNIQUE (código `23505`).
- `getPublications`, `getMyPublications`, `getPublicationEditById`,
  `getPublicationsByCompanyId` etc.: añadido `p.pub_slug as slug` en el
  SELECT para que los listados frontend tengan el slug disponible.

**Cambios frontend:**
- `src/utils/publicationUrl.ts` (nuevo): helper `publicationPath(pub)` que
  resuelve URL canónica con fallback elegante. Slug > pub_slug > id > pub_id.
- `src/types/api.ts`: campo opcional `slug` en `PublicationListItem`,
  `pub_slug` en `PublicationDetail` y `MyPublicationItem`, `slug` en
  `PublicationSeoData`.
- **Sweep en componentes públicos**: `PublicationCard`, `HeaderSearch`
  (búsqueda global), `MyPublicationsMain` (link al detalle, NO al edit),
  `PublicationDetailsMain` (botón al viewer 3D), `PropertiesMap` (popup del
  mapa), `PublicationContent` (redirect `?from=` al login), `PublicationJsonLd`
  (Schema.org canonical url), `app/[locale]/publications/[id]/page.tsx`
  (`generateMetadata` con `alternates.canonical` usando slug).
- **Conservados con `pub_id`**: hooks de mutación (`useUpdatePublication`,
  `useDeletePublication`, `useRegisterView`) porque son endpoints autenticados
  que toman ID interno. Comentarios desde notificaciones y mensajes también
  usan `pub_id` — el backend resuelve y emite 301 si corresponde.

**SQL de migración para entornos ya poblados (dev/staging/prod):**

```sql
-- Fase 22 — Slug SEO + sufijo random anti-enumeración.
-- Para entornos con publicaciones existentes sin slug. En producción nueva
-- esto NO se ejecuta: database.sql ya contiene la columna.

ALTER TABLE ecom.publications
  ADD COLUMN IF NOT EXISTS pub_slug VARCHAR(160) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_publications_pub_slug
  ON ecom.publications(pub_slug);

-- Backfill: genera slug para filas existentes. Usa un sufijo random de 6
-- chars base62 simulado con MD5 truncado (sin necesitar pgcrypto en
-- entornos que no lo tengan instalado). El slugify es minimal: lowercase
-- + reemplazar no-alnum por guion + capear largo. Para slugs "bonitos" el
-- código JS de runtime es mejor; este backfill es solo para evitar nulls.
UPDATE ecom.publications
SET pub_slug = LOWER(
    REGEXP_REPLACE(
      LEFT(COALESCE(pub_title, 'publicacion'), 50),
      '[^a-zA-Z0-9]+', '-', 'g'
    )
  ) || '-' || SUBSTRING(MD5(pub_id::text || NOW()::text) FOR 6)
WHERE pub_slug IS NULL;
```

**Tests backend:** sin cambios funcionales en el shape de respuestas
existentes (los listados solo ganan un campo nuevo `slug`). `npm test`
sigue 20/20 verde.

---

### Fase 14 ✅ — Internacionalización (i18n) con `next-intl` y sub-paths `/es` `/en`

> **Plan ejecutable:** [`docs/phases/phase-14-i18n-next-intl.md`](docs/phases/phase-14-i18n-next-intl.md)
> **Checklist de review:** [`docs/phases/phase-14-review-checklist.md`](docs/phases/phase-14-review-checklist.md)
>
> Plan armado para Codex como ejecutor + Claude como revisor. 4 hitos
> secuenciales (14.1 → 14.4). Cada hito termina con tests verdes y commit
> granular antes de pasar al siguiente.

**Por qué `next-intl` y sub-paths `/es` `/en` (no `react-i18next`):**

| Aspecto | `react-i18next` (estado actual) | `next-intl` + sub-paths |
|---|---|---|
| SEO | Una URL para ambos idiomas — Google indexa la default | `/es/publicaciones/123` y `/en/listings/123` indexables como páginas distintas |
| hreflang | Manual y frágil | Emitido por el middleware + `alternates.languages` en metadata |
| Server Components | Solo cliente | First-class — traducciones en servidor, sin JS extra |
| Detección Accept-Language | A mano | Middleware lo hace |
| Links compartibles | Pierden el idioma | Preservan `/en/...` al pegarse en redes |

**Decisiones cerradas (ver §Decisiones en el plan):**

| ID | Decisión |
|---|---|
| D-1 | Librería = `next-intl` |
| D-2 | Routing = sub-paths `/es` `/en` (no subdominios, no query param) |
| D-3 | Default = `es` |
| D-4 | Detección 1ª visita = `Accept-Language` vía middleware |
| D-5 | Persistencia = cookie `NEXT_LOCALE` (no columna `cus_locale` aún) |
| D-6 | Convivencia react-i18next ↔ next-intl en 14.1+14.2; cleanup al final de 14.2 |
| D-7 | Mensajes split por namespace en disco (`messages/es/common.json`, etc.) |
| D-8 | Errores backend = `{ code, message, params }` (frontend traduce, fallback al `message` ES) |
| D-9 | Emails bilingües — `locale` viene en el body del request |
| D-10 | Fechas vía `useFormatter`/`getFormatter`; cero `toLocaleDateString('es-GT', ...)` hardcoded |
| D-11 | Hitos secuenciales (NO paralelo) |

**Hitos:**

| Hito | Entrega | Estim. |
|---|---|---|
| 14.1 Setup | `next-intl` instalado, `src/app/[locale]/`, middleware combinado (auth+intl), home piloto traducida, selector de idioma visible, T-104..T-108 | ~6h |
| 14.2 Migración base | Login/Register/Forgot/HeaderOne/HeaderTwo → `useTranslations`; cleanup de `react-i18next`+`i18next`+`src/i18n.js`; T-109..T-111 | ~3h |
| 14.3 Contenido nuevo | 10 namespaces (messages, support, pauta, profile, notifications, admin, home, publications, legal, danger). Helper `useDateFmt`. 0 `toLocaleDateString` con literal. T-112..T-114 | ~12–16h |
| 14.4 Backend + emails + SEO | Helper `emailTemplates.js` bilingüe, 20 endpoints con `{code, message, params}`, sitemap XML con `/es+/en` + hreflang, `robots.ts` con disallow por locale, T-115..T-117 | ~5h |
| **Total** | | **~26–30h Codex** |

**Out of scope (NO se hace en esta fase):**

- ❌ Columna `cus_locale` en BD (difiere; pasa por body).
- ❌ Tercer idioma (k'iche', portugués, etc.).
- ❌ A/B testing de copy traducido.
- ❌ Traducciones IA en runtime (estáticas en JSON).
- ❌ RTL languages.

**Cambio aplicado al `database.sql`:**

Ninguno — esta fase no agrega tablas ni columnas. La persistencia del
locale vive en cookie `NEXT_LOCALE` (per D-5).

**SQL de migración para entornos ya poblados:**

```sql
-- Fase 14 NO requiere migración SQL.
-- La persistencia de locale es por cookie (D-5).
-- La eventual columna `cus_locale` queda como follow-up para una fase futura
-- (D-5 explícita).
```

**Riesgos conocidos (ver detalle en el plan):**

| Riesgo | Mitigación |
|---|---|
| Next 13.4.6 no admite layouts sin `<html>` en root | Codex valida en 14.1; si falla, escala a upgrade Next 13.5+ |
| Codex toca todo en un commit gigante | Plan exige granularidad por hito |
| Cookie `NEXT_LOCALE` colisiona con cookie-consent | Nombres distintos; verificar en 14.1 |
| URLs viejas sin locale rompen backlinks externos | Middleware redirige `/publications/123` → `/es/publications/123` |
| Fase 11.2 (pasarela) corre en paralelo | Fase 14 cierra **antes** de abrir 11.2 |

**Estado:** cerrada el 2026-06-05. La fase deja rutas `/es` y `/en`,
contenido visible migrado a `next-intl`, emails bilingües en backend y SEO
bilingüe con sitemap/robots localizados.

---

#### Bitácora por hito

> Sub-secciones que Codex llena al cerrar cada hito (commit + SHA + notas).
> El revisor (Claude) confirma cada una antes de pasar a la siguiente.

##### Hito 14.1 — Setup `next-intl` + estructura `[locale]` — ✅ Completado

- **SHA Codex:** `d574cef` (cierre smoke); commits del hito:
  `141f7a3`, `b093781`, `7c76e30`, `fc7b56c`, `b18c747`,
  `b504b93`, `d574cef`.
- **Tests añadidos/documentados:** T-104..T-108 en `docs/TEST_PLAN.md`
  como smoke manual (runner frontend queda para Fase 21).
- **Validación ejecutada:**
  - `npx tsc --noEmit` ✅
  - `npx next build` ✅
  - `npm test` backend ✅ 17/17
  - `curl` smoke T-104..T-106 y T-108 ✅
  - Browser smoke T-107..T-108 ✅ (`/tmp/kiosqui-fase14-es.png`,
    `/tmp/kiosqui-fase14-en.png`)
- **Decisiones aplicadas:** D-1=B, D-2=A, D-3=A, D-4=A, D-5=A,
  D-6=B, D-7=B, D-8=B, D-9=B, D-10=A, D-11=B.
- **Archivos creados:**
  - `src/i18n/routing.ts`
  - `src/i18n/request.ts`
  - `src/i18n/navigation.ts`
  - `src/app/[locale]/layout.tsx`
  - `src/components/i18n/LanguageSwitcher.tsx`
  - `src/utils/stripLocalePath.ts`
  - `messages/es/common.json`, `messages/en/common.json`
  - `messages/es/auth.json`, `messages/en/auth.json` (sembrado desde `src/i18n.js`)
- **Archivos movidos:** todas las carpetas de `src/app/` → `src/app/[locale]/`,
  excepto `layout.tsx`, `globals.css`, `favicon.ico`, `sitemap.xml/route.ts`,
  `robots.ts`, `[...not_found]/`.
- **Archivos modificados:**
  - `src/middleware.ts` combina `next-intl` + auth; auth corre aun cuando
    `next-intl` devuelve rewrite interno.
  - `src/app/layout.tsx` queda como root mínimo sin `<html>`.
  - `src/app/[locale]/layout.tsx` contiene `<html lang={locale}>`,
    `NextIntlClientProvider`, providers actuales y `alternates.languages`.
  - `next.config.js` usa plugin `next-intl`.
  - `package.json` / `package-lock.json` agregan `next-intl@3.26.5`.
  - `HeaderOne` / `HeaderTwo` muestran selector de idioma.
  - `KiosquiHero` incluye píldora piloto `common.nav.home` (`Inicio` / `Home`).
  - `DefaultWrapper`, sidebars y cookie banner normalizan paths con locale.
- **Bloqueos resueltos:** ninguno. Next 13.4.6 aceptó root layout sin
  `<html>` y `[locale]/layout.tsx` con `<html lang={locale}>`.
- **Notas del revisor:** Revisar que los links legacy con `next/link` puro
  sigan redirigiendo por middleware; Hito 14.3 migrará los links restantes
  de forma incremental.

##### Hito 14.2 — Migración base (5 archivos) — ✅ Completado

- **SHA Codex:** `4106cc4` (cleanup final de código; cierre documental en
  `docs(fase14.2): cerrar hito migración base`).
- **Tests añadidos/documentados:** T-109..T-111 en `docs/TEST_PLAN.md`
  como smoke manual (runner frontend queda para Fase 21).
- **Decisiones aplicadas:** D-6 (termina convivencia; cleanup de deps y
  bundle legacy), D-7 (claves en `messages/<locale>/auth.json`).
- **Archivos migrados** (`react-i18next` → `next-intl`):
  - `src/form/ForgotForm.tsx`
  - `src/form/RegisterForm.tsx`
  - `src/layout/header/HeaderOne.tsx`
- **Archivos auditados sin migración adicional:**
  - `src/layout/header/HeaderTwo.tsx` — ya migrado en Hito 14.1.
  - `src/form/LoginFrom.tsx` — no importaba `react-i18next`; T-109 confirma
    `/en/login` con label `Email`.
- **Archivos adicionales modificados:**
  - `src/app/[locale]/forgot/page.tsx` — título/breadcrumb de recovery
    conectados a `auth.forgot`.
  - `src/utils/AuthContext.tsx` — removido import lateral `../i18n`.
  - `messages/es/auth.json`, `messages/en/auth.json` — claves nuevas para
    Forgot y Register, sin perder las claves del bundle viejo.
- **Archivos eliminados:** `src/i18n.js`
- **Deps eliminadas:** `react-i18next`, `i18next` (de `package.json` y
  `package-lock.json`).
- **Validación grep ejecutada:** `grep -rn "react-i18next\|from.*['\"]i18next" src/`
  → 0 hits.
- **Validación ejecutada:**
  - `npx tsc --noEmit` ✅
  - `npm run build` ✅
  - `npm test` backend ✅ 17/17
  - Smoke manual T-109..T-111 ✅
    (`/tmp/kiosqui-fase14-2-es-login.png`,
    `/tmp/kiosqui-fase14-2-en-login.png`,
    `/tmp/kiosqui-fase14-2-es-register.png`,
    `/tmp/kiosqui-fase14-2-en-register.png`,
    `/tmp/kiosqui-fase14-2-es-forgot.png`,
    `/tmp/kiosqui-fase14-2-en-forgot.png`)
- **Bloqueos resueltos:** al borrar `src/i18n.js`, `AuthContext` conservaba
  un import lateral `../i18n`; se eliminó en el commit de cleanup. El dev
  server local quedó con artefactos `.next` mezclados después del build y se
  reinició antes del smoke final.
- **Follow-ups detectados:** `LoginMain`/`LoginContent` y los breadcrumbs de
  `SignUpMain` aún tienen copy del scaffold en inglés; no consumían
  `react-i18next` y quedan para el barrido amplio de Hito 14.3.
- **Notas del revisor:** _por completar_

##### Hito 14.3 — Contenido nuevo (Fases 5–11) + fechas con `useFormatter` — ✅ Completado

- **SHA Codex:** `514f52e` (último commit de código; cierre documental en
  `docs(fase14.3): cerrar hito contenido nuevo`). Commits del hito:
  `21e89a0`, `462694b`, `6590871`, `dc46568`, `34cd062`, `456a24d`,
  `bbf0a03`, `89a494b`, `af84bbd`, `58a5942`, `b6a62b6`, `b49d9b6`,
  `ec37a83`, `514f52e`.
- **Tests añadidos/documentados:** T-112..T-114 en `docs/TEST_PLAN.md`
  como smoke manual (runner frontend queda para Fase 21).
- **Decisiones aplicadas:** D-7 (namespaces en `messages/<locale>/<ns>.json`),
  D-10 (fechas/números vía `useFormatter` mediante helper).
- **Namespaces creados** (en `messages/es/` y `messages/en/`):
  `messages`, `support`, `pauta`, `profile`, `notifications`, `admin`,
  `home`, `publications`, `legal`, `danger`.
- **Namespaces registrados:** `src/i18n/request.ts` carga y mergea los 10
  namespaces nuevos junto con `common` y `auth`.
- **Helper creado:** `src/utils/datetime.ts` con `useDateFmt()` (client) y
  `src/utils/datetime.server.ts` con `getDateFmt()` para server components.
- **Sweep `toLocaleDateString`:**
  - `grep -rn "toLocaleDateString\|toLocaleString\|toLocaleTimeString" src/`
    → 0 hits.
  - `grep -rn "'es-GT'\|'es-ES'\|'en-US'" src/` → 0 hits.
  - Excepción técnica no visible: `PublicationJsonLd` conserva labels
    estáticos dentro del JSON-LD estructurado.
- **Follow-ups del 14.2 cerrados:** `LoginMain`, `LoginContent`,
  `SignUpMain`, `SignUpContent` y `LoginFrom` consumen `next-intl`; se removió
  el `any` de `LoginFrom` al tipar/narrowear `ApiError.body`.
- **Validación ejecutada:**
  - `npx tsc --noEmit` ✅
  - `npx next build` ✅
  - `npm test` backend ✅ 17/17
  - Smoke manual T-112..T-114 ✅
- **Bloqueos resueltos:** ninguno.
- **Notas del revisor:** _por completar_

##### Hito 14.4 — Backend (errores + emails) + SEO bilingüe — ✅ Completado

- **SHA Codex (backend):** `04c735d` (docs backend). Commits del hito backend:
  `b66f010`, `611f513`, `9252bdc`, `909ddd6`, `28df9f4`, `04c735d`.
- **SHA Codex (frontend):** `29782ba` (fix final del sitemap XML con
  `hreflang`). Commits de código frontend: `7061487`, `b8af9b5`, `956d1c6`,
  `7725e02`, `29782ba`; cierre documental previo en `f3564ae` y ajuste smoke en
  `a237ba7`.
- **Tests añadidos/documentados:** T-115..T-117 automatizados en backend
  (`tests/api/emails/recovery-locale.spec.js`) y documentados en
  `docs/TEST_PLAN.md`.
- **Decisiones aplicadas:** D-8 (`{ code, message, params }`) y D-9
  (`renderEmail(name, locale, params)` con `locale` por body).
- **Archivos backend creados:** `utils/emailTemplates.js` con 6 plantillas
  bilingües: `recovery`, `verificationConfirm`,
  `verificationConfirmWithTemp`, `reviewSeller`, `addedToCompany`,
  `invitedToCompany`.
- **Archivos backend modificados:**
  - `config/connPostgresDB.js` — las 6 llamadas a `transp.sendMail` pasan por
    `renderEmail()`; links de email salen localizados (`/es/...`, `/en/...`).
  - `config/connPostgresDB.js` — 21 endpoints visibles migrados a errores
    `{ code, message, params }`, preservando flags legacy donde aplicaba.
  - `docs/API_REFERENCE.md`, `docs/GLOSSARY.md` — convención de errores,
    `locale` en body y términos nuevos.
- **Archivos frontend modificados:**
  - `src/form/ForgotForm.tsx`, `src/form/RegisterForm.tsx` — mandan `locale`
    en `/recoverypass` y `/register`.
  - `src/hooks/api/useCompany.ts`, `src/hooks/api/useCloseSale.ts` — mandan
    `locale` en invitaciones/alta de empleados y cierre de venta.
  - `src/types/api.ts` — payloads aceptan `locale`.
  - `src/app/sitemap.xml/route.ts` — emite XML manual con variantes `/es/...`
    y `/en/...` + `xhtml:link hreflang`.
  - `src/app/robots.ts` — `allow`/`disallow` localizados por prefijo.
  - `src/middleware.ts` — excluye `sitemap.xml` y `robots.txt` del middleware
    i18n para que queden disponibles en raíz.
- **Docs §13 actualizadas:**
  - Backend: `docs/API_REFERENCE.md`, `docs/GLOSSARY.md`.
  - Frontend: `docs/FRONTEND_STRUCTURE.md`, `docs/ARCHITECTURE.md`,
    `docs/ONBOARDING.md`, `docs/TEST_PLAN.md`.
- **Validación ejecutada:**
  - Backend `npm test` ✅ 20/20.
  - Frontend `npx tsc --noEmit` ✅
  - Frontend `npm run build` ✅
  - Sitemap smoke con `hreflang` ✅
- **Bloqueos resueltos:** el primer smoke de `/sitemap.xml` mostró redirect
  307 a `/es/sitemap.xml`; se excluyeron `sitemap.xml` y `robots.txt` del
  matcher de `src/middleware.ts`. Después se detectó que Next 13.4 serializa
  `src/app/sitemap.ts` sin `hreflang`; se reemplazó por
  `src/app/sitemap.xml/route.ts` con XML explícito y el smoke quedó verde.
- **Notas del revisor:** _por completar_

##### Cierre Fase 14 — ✅ Completada

- **Verdict global:** ✅ Completada por Codex, lista para revisión final.
- **Follow-ups que quedaron fuera de scope:**
  - Persistir preferencia de idioma en BD (`cus_locale`) sigue fuera de scope
    por D-5; hoy vive en cookie `NEXT_LOCALE` y body por request.
  - Traducir cada `error.code` en frontend con namespaces de errores puede
    hacerse en una fase de pulido; hoy el backend entrega `code/params` y el
    fallback `message` en español mantiene compatibilidad.
  - Completar el sweep de `{ code, message, params }` en endpoints legacy de
    perfil, comentarios, mensajería, denuncias internas y assets.
- **Fecha de cierre:** 2026-06-05.

---

### Fase 13 — Documentación técnica completa de la plataforma ✅

**Objetivo:** crear un set de documentos de referencia que sobrevivan a la
rotación del equipo, sirvan para onboarding de nuevos colaboradores
(actuales y futuros) y permitan a soporte/ops resolver problemas sin
necesitar al desarrollador original.

**Estado:** cerrada el 2026-06-04 como fase docs-only. La ejecución final vive
en `docs/phases/phase-13-technical-docs.md`; este bloque conserva la bitácora
de lo entregado.

**Decisiones aplicadas:**
- D-1=B: `docs/API_REFERENCE.md` manual, generado por inspección real de
  `server.js` y `connPostgresDB.js`, sin agregar script de autogeneración.
- D-2=A: diagramas Mermaid en Markdown.
- D-3=lista del plan: se expandieron las tablas core `customer`, `business`,
  `publications`, `publications_detail`, `cat_amenities`,
  `publications_amenities`, `subscriptions`, `customer_follows`,
  `seller_ratings`, `publications_comments`, `tickets`, `ticket_messages`,
  `verification_requests`, `ad_campaigns` y `customer_payment_methods`.
- D-4=A: README expandido en cada repo.
- D-5=A: `docs/ARCHITECTURE.md` centralizado en frontend con links al backend.

**Backend (`ecommerceGTBackEnd`):**
- `README.md`: quick start, variables de entorno, estructura, tests, deploy y
  links a docs.
- `docs/API_REFERENCE.md`: 128 endpoints agrupados por feature, con método,
  ruta, auth, handler, línea de `server.js`, descripción y shapes expandidos
  para auth, handle, `/me`, soporte, verificaciones, tickets, pauta, admin,
  métodos de pago y uploads.
- `docs/SCHEMA.md`: referencia del schema `ecom`, resumen de 41 tablas, ER
  Mermaid por subsistema y detalle de 15 tablas core.
- `docs/ONBOARDING.md`: guía Día 0 / Día 0.5 / Día 1 para dev nuevo.
- `docs/GLOSSARY.md`: términos de dominio, técnicos, roles y estados.

**Frontend / compartido (`ecommerceGT-Next`):**
- `README.md`: quick start, stack, scripts, env vars, estructura, convenciones
  y cross-links al backend.
- `docs/FRONTEND_STRUCTURE.md`: tour de `src/`, rutas App Router,
  componentes, hooks, tipos, utils, estilos y patrones recurrentes.
- `docs/ARCHITECTURE.md`: vista cross-repo, capas, flujos de sesión,
  publicación y soporte, uploads, ambientes y riesgos conocidos.
- `docs/phases/phase-13-technical-docs.md`: checklist de aceptación actualizado
  durante la ejecución.

**TODOs dejados intencionalmente (no inventar shapes):**
- `POST /changestatus`, `POST /deleteimg`, `POST /getemployees` y
  `GET /my-publications/:cus_id` quedan marcados con TODO en
  `docs/API_REFERENCE.md` porque el shape/auth no se puede asegurar sin
  ambigüedad solo desde el código actual.

**Verificación local:**
- Backend: `npm test` pasa con 4 archivos y 8 tests.
- Linkrot: chequeo de los 9 Markdown relevantes de Fase 13 sin links internos
  rotos.
- Mermaid: 7 diagramas renderizados localmente con `@mermaid-js/mermaid-cli`
  11.15.0.
- Cero código nuevo y cero cambios funcionales: solo archivos Markdown.

**Nota de numeración:** la tabla histórica ya tenía `13` reservado para
soporte al cliente. Para no borrar ese roadmap pendiente, esta fase queda
marcada en la tabla como `13.docs`.

**Plan original de referencia (bosquejo previo, no checklist vigente):**

#### Backend (`ecommerceGTBackEnd/docs/`)
1. **`API.md`** — todos los endpoints agrupados por dominio:
   - Path, método, auth requerido (middleware), body, query params,
     respuestas posibles (códigos + shape), notas.
   - Ejemplo por endpoint:
     ```
     POST /campaigns                Auth: requerida
     Body: { pubId, objective, budget, ... useCredit? }
     200: { message, campId, creditUsed? }
     409: si ya hay campaña active/paused para pub_id
     ```
   - Generación: scrapear `server.js` automáticamente con un script
     (`scripts/extract-endpoints.js`) que parse cada `app.<method>`.

2. **`DATABASE.md`** — esquema completo del `ecom.*`:
   - Tabla por tabla: columnas, tipos, FKs, índices, comentarios.
   - Diagrama ER (mermaid o dbdiagram.io export).
   - Convenciones: prefijo `cus_`, `pub_`, `cat_`, `pubsta_id=4` = Anulada.

3. **`QUERIES.md`** — biblioteca de queries útiles para soporte/ops:
   - "Buscar usuario por DPI", "ver campañas activas por mes", "top
     anunciantes por gasto", "campañas con saldo no gastado próximas a
     expirar", "publicaciones sin imágenes", etc.
   - Cada query con descripción y ejemplo de uso.
   - **Incluir queries de Fase 10.7** (cambiar precios sin redeploy):
     ```sql
     UPDATE ecom.platform_config SET config_value = X WHERE config_key = '...';
     ```

4. **`OPS.md`** — runbook operativo:
   - Cómo desplegar (Render + Dockerfile + Ghostscript).
   - Cómo reiniciar el backend, migrar BD, restaurar backup.
   - Variables de entorno (lista completa con descripción).
   - Cron jobs (si hay).
   - Logs: cómo verlos en Render, qué buscar cuando algo falla.

5. **`MIGRATIONS.md`** — separar las SQL ALTER de MIGRATION.md (que es
   bitácora) en un archivo numerado por fase con scripts ejecutables.
   Ejemplo: `migrations/2026-05-27-fase-10.6.sql`, `2026-05-28-fase-10.7.sql`.

#### Frontend (`ecommerceGT-Next/docs/`)
1. **`COMPONENTS.md`** — componentes principales agrupados por dominio:
   - `PublicationCard` (props, variantes, isFeatured, ctaOverride…).
   - `MessageBubble`, `ConversationView`, `MentionTextarea`, etc.
   - Una sección por dominio (publications, messages, support, pauta).

2. **`HOOKS.md`** — todos los `useXxx` de `src/hooks/api/`:
   - Endpoint que consumen, queryKey, staleTime, invalidaciones, errores.
   - Tabla resumen para encontrar rápido cuál usar.

3. **`ROUTES.md`** — todas las rutas de `src/app/`:
   - Path, componente Main, auth requerida, props/searchParams, dependencias.

4. **`STYLE.md`** — convenciones:
   - styled-jsx con `:global()` para penetrar Next.js Link wrappers.
   - Patrón de loading/error/empty en cada query.
   - Variables CSS (`--clr-theme-1`, etc.).
   - Cuándo usar `react-responsive-modal`, `react-toastify`, etc.

#### Compartido (`README.md` principal de cada repo)
- Reescribir con secciones claras: "Qué es esta plataforma", "Stack",
  "Setup local en 5 min", "Cómo correr tests/lint", "Cómo contribuir",
  "Quién mantiene".

**Herramientas sugeridas:**
- **Mermaid** para diagramas (compatible con GitHub Markdown).
- **dbdiagram.io** para el ER (exportable a markdown).
- **Swagger/OpenAPI** opcional para `API.md` si el equipo crece y quieren
  un Try-it-out interactivo. Por ahora markdown plano es suficiente.

**Prioridad sugerida cuando se aborde la fase:**
1. `QUERIES.md` + `OPS.md` (más valor para soporte/ops).
2. `API.md` (onboarding de nuevos devs).
3. `DATABASE.md` + `MIGRATIONS.md`.
4. Frontend docs (menos urgentes — el código se auto-documenta más).

**Estimación:** ~2 días de trabajo concentrado. Posiblemente delegable
parcialmente a un script que parse `server.js` y `database.sql`
automáticamente.

> **Trigger sugerido:** abordar Fase 13 **antes** del lanzamiento público,
> después de Fase 11 (pasarela) y Fase 12 (legal). Para entonces el
> esquema ya estará casi congelado y vale la pena documentarlo.

---

### Fase 12.2 — Audit log con hashes para detección de reincidentes ✅

**Objetivo:** que cuentas eliminadas (Fase 12.1) o baneadas (Fase 8.3)
dejen un rastro irreversible útil para detectar fraude cuando el mismo
usuario intente volver con datos distintos. **Sin guardar PII en claro.**

**SQL — tabla nueva `ecom.customer_audit_log`:**
```sql
CREATE TABLE ecom.customer_audit_log (
    audit_id      BIGSERIAL PRIMARY KEY,
    cus_id        BIGINT NOT NULL REFERENCES ecom.customer(cus_id),
    email_hash    VARCHAR(64),  -- SHA-256 hex
    dpi_hash      VARCHAR(64),
    phone_hash    VARCHAR(64),
    audit_reason  VARCHAR(40) NOT NULL, -- user_deletion | sanction_ban |
                                        -- sanction_suspend | fraud_detected
    reason_detail TEXT,
    fraud_flag    BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMP NOT NULL DEFAULT now()
);
-- Índices parciales solo para filas con valor (sparse).
CREATE INDEX idx_audit_email_hash ON ecom.customer_audit_log(email_hash) WHERE email_hash IS NOT NULL;
CREATE INDEX idx_audit_dpi_hash   ON ecom.customer_audit_log(dpi_hash)   WHERE dpi_hash IS NOT NULL;
CREATE INDEX idx_audit_phone_hash ON ecom.customer_audit_log(phone_hash) WHERE phone_hash IS NOT NULL;
CREATE INDEX idx_audit_fraud_flag ON ecom.customer_audit_log(fraud_flag) WHERE fraud_flag = true;
```

**Backend (`connPostgresDB.js`):**
- `sha256Hex(value)` helper — normaliza con `String(v).trim().toLowerCase()`
  y devuelve SHA-256 hex (64 chars). Determinístico sin sal — esa es la
  intención: que el mismo DPI siempre dé el mismo hash.
- `writeAuditLog(client, cusId, reason, opts)` helper — INSERT con hashes
  computados. Acepta pg.Pool o client de transacción. Fire-and-forget: si
  el insert falla, loguea pero no propaga.
- **Cableo en `cleanupExpiredDeletions`** — lee email/phone + desencripta
  DPI ANTES de anonimizar, escribe audit log con `reason='user_deletion'`
  (sin fraud_flag).
- **Cableo en `supportBanUser`** — escribe audit log con
  `reason='sanction_ban'` y `fraud_flag=true` cuando es baneo permanente.
  Suspensión temporal escribe `reason='sanction_suspend'` SIN fraud_flag
  (no es razón para vetar registro futuro).
- **Check de reincidencia en `register`** — antes de crear el customer,
  hashea el email y consulta el audit log. Si hay match con
  `fraud_flag=true`, devuelve **403** con mensaje genérico ("No es
  posible crear una cuenta con estos datos") — NO revelamos que estaba
  baneado (eso ayudaría al atacante a aprender qué tenemos). El check
  falla-silencioso si la query rompe: preferimos permitir registro a
  romper la página.

**Política legal (`/privacidad`):**
- Sección 7 "Retención" → nueva subsección 7.1 "Registro de auditoría
  (prevención de fraude)" declara la base legal de "interés legítimo",
  qué se conserva (hashes irreversibles), por cuánto tiempo
  (indefinido) y para qué (bloquear reingreso de baneados).

**Por qué hashes y no encriptación:**
- Determinístico sin clave secreta → comparable contra nuevos registros.
- Irreversible → si nos hackean la tabla, no obtienen emails/DPIs.
- Base legal sólida en GDPR Art. 6(1)(f) "interés legítimo" y mejor que
  retener PII en claro indefinidamente.

**Limitaciones conocidas:**
- 🟡 El check en `register` solo verifica email — DPI y phone se piden
  DESPUÉS (en verificación de identidad). Si el atacante usa email nuevo
  + DPI viejo, lo detectamos hasta que envíe verificación. Documentar en
  `submitVerificationRequest` que también puede consultar audit log.
- 🟡 No hay panel de soporte para ver/manipular audit log entries
  (e.g., marcar manualmente `fraud_flag` a una cuenta sospechosa antes
  de que se elimine, o whitelist un email falso positivo). Fase futura.
- 🟡 Si `CRYPTO_SECRET` rota en el futuro, los DPI encriptados de
  cuentas pending_deletion fallarán al desencriptar — el cleanup
  guarda el audit log SIN dpi_hash en ese caso (deja el campo en null).

---

### Fase 12.1 — Política dual de cierre de cuenta (desactivar + eliminar 30d) ✅

**Objetivo:** dar a los usuarios DOS opciones diferenciadas en lugar del
borrado lógico instantáneo de Fase 11. Ambas opciones son recuperables
(la primera siempre, la segunda durante 30 días).

**SQL migration:**
```sql
ALTER TABLE ecom.customer
  ADD COLUMN IF NOT EXISTS cus_deletion_scheduled_at TIMESTAMP NULL;
```

**Estados nuevos en `cus_account_status`:**
- `inactive` — desactivación voluntaria, login normal la reactiva.
- `pending_deletion` — countdown de 30 días, login normal CANCELA y restaura.

**Backend (`connPostgresDB.js`):**
- `POST /account/deactivate` (auth) — status='inactive'. NO anonimiza
  nada, NO toca publicaciones ni campañas. Limpia cookie.
- `POST /account/delete` (auth) — status='pending_deletion' +
  `cus_deletion_scheduled_at = now() + 30 days`. PAUSA publicaciones
  (`pubsta_id=5`) y campañas activas. NO anonimiza todavía.
- **Login modificado** para soportar nuevos estados:
  - `inactive` → reactiva automáticamente, sigue al flujo normal.
  - `pending_deletion` + scheduled aún futuro → cancela countdown,
    restaura `pubsta_id=5` → 2 (publicaciones vuelven a activas).
  - `pending_deletion` + scheduled vencido → rechaza login (la siguiente
    request del cleanup la anonimiza).
- **Cleanup lazy `cleanupExpiredDeletions()`** — corre fire-and-forget en
  cada login (cualquier usuario), anonimiza cuentas vencidas en batch.
  Guard `cleanupInFlight` previene ejecuciones paralelas. **No requiere
  cron job**: se autoejecuta con el tráfico normal.

**Frontend (`DangerZone.tsx`):**
- Dos cards:
  - "Desactivar mi cuenta (recuperable)" — botón ámbar `#d97706`.
  - "Eliminar mi cuenta (30 días de gracia)" — botón rojo `#ef4444`.
- Cada uno abre su propio modal con consecuencias específicas, checkbox
  de aceptación y campo de contraseña para confirmar.
- Hook nuevo `useDeactivateAccount.ts`. `useDeleteAccount.ts` actualizado.

**Política legal en `/privacidad`:**
- Sección "Derechos sobre tus datos" → Eliminación: ahora describe AMBAS
  opciones con el período de gracia explícito.

**Motivo del cambio:**
GT no tiene ley de protección de datos vigente, pero:
- GDPR aplica extraterritorialmente a usuarios europeos (multa hasta €20M).
- CCPA / LGPD / LFPDPPP (California / Brasil / México) exigen borrado real.
- Nuestros propios Términos ya prometen anonimización → obligados.
- El esquema dual (desactivar vs eliminar) es lo que hace Twitter/X y
  Facebook → familiar para el usuario.

---

### Fase 12 — Cumplimiento legal antes de producción ✅ (entregable principal)

**Estado:** Páginas legales + cookie banner + checkbox de consentimiento
**entregados el 2026-06-02** (commit pendiente al final de esta ventana).
La auditoría legal con abogado guatemalteco **sigue pendiente** antes del
launch — ver disclaimer abajo.

**Lo entregado:**

1. **`/terminos` — Términos y Condiciones** (`src/app/terminos/page.tsx`)
   12 secciones cubriendo: aceptación, identidad de KIOSQUI como
   intermediario tecnológico, cuenta y autenticación, verificación
   (DPI/NIT/RTU), publicaciones de propiedades, planes y suscripciones,
   pauta, sanciones (con apelación), propiedad intelectual, limitación
   de responsabilidad, modificaciones, jurisdicción guatemalteca.

2. **`/privacidad` — Política de Privacidad** (`src/app/privacidad/page.tsx`)
   11 secciones cubriendo: datos recolectados (cuenta, perfil, sensibles
   de verificación con AES-256-GCM, publicaciones, pago, técnicos,
   comunicaciones), usos, compartición (no vendemos), cookies, derechos
   del usuario (acceso, rectificación, eliminación via Danger Zone del
   perfil, oposición, portabilidad), retención (4 años por fiscalía),
   seguridad, menores, cambios, contacto (`privacidad@kiosqui.gt`,
   `seguridad@kiosqui.gt`).

3. **`/contenido` — Política de Contenido** (`src/app/contenido/page.tsx`)
   11 secciones cubriendo: contenido permitido vs prohibido (estafas,
   discriminación, contenido ilegal), requisitos de fotos (sin marcas
   de agua, sin rostros sin consentimiento), reglas de contacto,
   manipulación de precio/disponibilidad, suplantación, spam, cómo
   reportar (link al sistema de denuncias Fase 10.6), sanciones (links
   cruzados a Fase 8.3), apelaciones (Fase 8.3.1).

4. **Cookie consent banner** (`src/components/legal/CookieConsentBanner.tsx`)
   Fixed bottom, mounted en el RootLayout (`src/app/layout.tsx`). Guarda
   aceptación en `localStorage.kiosqui_cookie_consent_v1` (subir sufijo
   a `_v2` reaparece el banner si cambia la política). Detecta el visor
   3D fullscreen por URL y se oculta ahí. SSR-safe (no renderiza hasta
   useEffect).

5. **Checkbox de aceptación en registro** (`src/form/RegisterForm.tsx`)
   Campo nuevo `acceptTerms: boolean` en el form, validado con Yup
   (`Yup.boolean().oneOf([true], ...)`). El botón submit queda disabled
   hasta marcarlo. Los links abren `/terminos` y `/privacidad` en pestaña
   nueva (`target="_blank"`).

6. **Links en footer** (`src/layout/footer/Footer.tsx`)
   El widget "Marketplace" del template (placeholders en inglés como
   "Compare Us", "Career") se reemplazó con widget "Legal" apuntando a
   las 3 páginas + soporte + FAQ.

7. **Componente compartido** (`src/components/legal/LegalPageMain.tsx`)
   Wrapper con breadcrumb + fecha última actualización + TOC sticky
   (≥lg) + estilos consistentes. Las 3 páginas legales lo consumen,
   evitando duplicar markup y CSS.

**Pendiente (no bloquea launch técnico, pero sí legal):**
- 🟡 **Auditoría con abogado mercantil/IT guatemalteco** antes del
  launch. Texto borrador escrito por Claude; un profesional debe
  validar jurisdicción, cláusulas de limitación de responsabilidad,
  retención de datos sensibles (DPI/NIT/RTU) y FEL. Costo estimado
  Q1,500-Q3,000.
- 🟡 **Registrar `cus_terms_accepted_at` y `cus_terms_version` en BD**
  cuando el usuario acepta los términos en el registro. Hoy se valida
  en cliente pero no se persiste con timestamp+versión. Necesario para
  forzar re-aceptación si cambian los términos. Backend pendiente.
- 🟡 **Implementar registro de consentimiento de cookies en BD** para
  usuarios autenticados (hoy solo localStorage del browser).
- 🟡 **FEL (factura electrónica)** — al integrar pasarela (Fase 11.2).
- 🟡 **Email legal/DPO real** — `privacidad@kiosqui.gt`, `soporte@kiosqui.gt`,
  `seguridad@kiosqui.gt` ya están referenciados en las páginas pero los
  buzones reales hay que crearlos cuando esté el dominio en producción.

---

### Fase 12 (plan original) — Cumplimiento legal antes de producción

**Objetivo:** dejar la plataforma lista legalmente para operar en Guatemala
antes del lanzamiento público. Recopilación de los puntos discutidos con
Aurelio el 2026-05-27.

> **Disclaimer:** Claude no es abogado. Esta fase debe ser auditada por un
> abogado mercantil/IT guatemalteco antes del launch (~Q1,500-Q3,000 por
> 1-2h de revisión).

**Documentos a redactar y publicar:**

1. **Términos y Condiciones de uso** — con sección específica de "Pauta paga"
   y sub-cláusula "Reembolsos y créditos" (texto sugerido):
   - El anuncio compite por saldo restante; no garantizamos posición
     específica ni resultados (impresiones/clics) determinísticos.
   - **No se reembolsa dinero físico ni a tarjeta bajo ninguna circunstancia.**
     El único mecanismo de devolución es **crédito interno** (`cus_ad_credit`)
     reutilizable en futuras campañas del mismo anunciante.
   - El crédito **no caduca**, **no es transferible** entre cuentas, **no es
     canjeable por dinero**, y se conserva indefinidamente mientras la cuenta
     esté activa.
   - Si la publicación pautada se anula por incumplir las reglas de la
     comunidad (Fase 10.6), el saldo no gastado se acredita igualmente
     (no decomisamos saldo por incumplimientos).
   - Al cerrar la cuenta voluntariamente, el crédito **se pierde** (cláusula
     necesaria — abrir cuenta nueva no transfiere saldo).
   - No nos hacemos responsables de transacciones entre usuarios fuera de
     la plataforma.

2. **Política de Privacidad** — debe declarar:
   - Recopilamos ubicación (`cit_id`, `tow_id`) y edad (`cus_birthday`) para
     segmentar anuncios (Fase 10).
   - DPI/NIT/RTU se almacenan privados con acceso controlado (Fase 8.1/8.2).
   - El equipo de soporte puede acceder al contexto de conversaciones cuando
     se denuncia un mensaje (Fase 8.4 ya tiene checkbox de consentimiento
     en cada denuncia, pero hay que reforzarlo en la política).
   - Usamos cookies para sesión y preferencias (ningún tracker de terceros
     por ahora).

3. **Política de Contenido / Reglas de la comunidad** — qué se puede pautar
   y publicar: bienes raíces legítimos, sin esquemas piramidales, sin
   propiedades sin verificación del propietario, etc.

4. **Aviso de cookies** — banner inicial con opciones (aceptar / rechazar
   no-esenciales). Por ahora solo tenemos cookies de sesión, así que el
   aviso es relativamente simple.

5. **Correo legal/DPO** — `legal@<dominio>.gt` para recibir denuncias,
   notificaciones de autoridades, y peticiones de eliminación de datos
   (right-to-be-forgotten preventivo).

**Implementaciones técnicas pendientes:**

6. **Factura electrónica (FEL)** — al integrar pasarela (Fase 11) la pauta es
   un servicio gravado con **IVA 12%** en GT. Cada cobro debe generar FEL
   automática (proveedores: G4S, INFILE, etc.). Ver SAT — Decreto Gubernativo
   FEL 5-2022.

7. **SLA de denuncias de pauta** — 24h máximo para resolver una denuncia de
   contenido pagado. Ya hay tickets (Fase 8.5); falta categoría específica
   "denuncia de pauta" + priorización en el round-robin.

8. **Botón "Eliminar mi cuenta"** — derecho al olvido preventivo. Si el
   usuario lo pide, anonimizar (`cus_first_name = "Usuario eliminado"`,
   `cus_email = NULL`, etc.) y anular publicaciones. No borramos en hard
   delete por integridad referencial (FKs en publications, messages,
   tickets).

9. **Registro de consentimiento explícito** — al crear cuenta, checkbox no
   pre-marcado para "Acepto términos y política de privacidad". Guardar
   `cus_terms_accepted_at` con la versión vigente (`cus_terms_version`).
   Si se actualizan los términos, forzar re-aceptación en próximo login.

**Marcos legales aplicables (GT):**
- Constitución Art. 24 (correspondencia privada) → afecta a `getMessageContext`.
- Decreto 6-2003 (Ley de Protección al Consumidor / DIACO) → ya cumplimos
  con PQRS vía tickets, falta T&C públicos.
- Código de Comercio (publicidad engañosa) → SLA de denuncias.
- Decreto 5-2022 FEL → al integrar pasarela.
- *(GT no tiene aún Ley de Datos Personales aprobada; usar GDPR-light como
  best practice para usuarios extranjeros.)*

---

### Fase 11 — Método de pago en el perfil del usuario ✅ (stub)

**Entregado 2026-06-03.** UI completa + endpoints backend + tabla SQL para
guardar métodos de pago del usuario. Es un **STUB de pasarela** — no
procesa cobros reales. Cuando llegue Fase 11.2 (Recurrente / NeoNet /
Stripe) el form del frontend cambia para usar el SDK del proveedor, y
el backend NO requiere cambios (sigue recibiendo el mismo payload con
token + last4).

**SQL — tabla nueva `ecom.customer_payment_methods`:**
```sql
CREATE TABLE ecom.customer_payment_methods (
    pm_id              BIGSERIAL PRIMARY KEY,
    cus_id             BIGINT REFERENCES customer,
    pm_type            VARCHAR(20),  -- 'card' | 'transfer' | 'wallet'
    pm_label           VARCHAR(80),
    -- card
    pm_brand           VARCHAR(30),
    pm_last4           VARCHAR(4),
    pm_exp_month       INT,
    pm_exp_year        INT,
    pm_holder_name     VARCHAR(100),
    -- transfer
    pm_bank_name       VARCHAR(80),
    pm_account_type    VARCHAR(20),  -- 'ahorro' | 'monetario'
    -- wallet
    pm_wallet_handle   VARCHAR(100),
    -- común
    pm_provider_token  TEXT,         -- opaco; Stripe/Recurrente lo emiten
    pm_provider        VARCHAR(20),  -- 'stripe' | 'recurrente' | 'manual'
    pm_is_default      BOOLEAN DEFAULT false,
    pm_active          BOOLEAN DEFAULT true,
    pm_created_at      TIMESTAMP,
    pm_updated_at      TIMESTAMP
);
CREATE UNIQUE INDEX idx_pm_one_default_per_user
  ON ecom.customer_payment_methods(cus_id)
  WHERE pm_is_default = true AND pm_active = true;
```

**Backend (`connPostgresDB.js`):**
- `GET /payment-methods` — lista métodos activos, default primero.
- `POST /payment-methods` — agrega; valida por tipo (card → marca + last4
  numérico + exp válido + holder; transfer → banco + accountType en
  whitelist; wallet → walletHandle). Si `makeDefault=true`, baja el
  default actual antes de subir el nuevo (transacción).
- `DELETE /payment-methods/:id` — soft delete (`pm_active=false`). Si era
  default, NO promueve otro automáticamente (decisión: evitar cambiar a
  cuál método se cobrará por sorpresa).
- `POST /payment-methods/:id/default` — transacción 2 pasos para respetar
  el UNIQUE parcial: baja el default actual + sube el nuevo.

**Frontend:**
- `src/hooks/api/usePaymentMethods.ts` — 4 hooks (list, add, remove,
  setDefault) con invalidación correcta.
- `src/components/Creator-Profile-info/PaymentMethodsTab.tsx` — UI con:
  - Listado de métodos activos: card con icono de marca (Visa/Mastercard
    con colores oficiales), label, detalle (•••• 1234 vence MM/YY), badge
    de "Predeterminado", botones para marcar default + eliminar.
  - Modal de agregar: selector de tipo (3 chips) + form dinámico según
    tipo. Para card pide número completo + CVV (placeholder) pero solo
    envía últimos 4 dígitos + token mock — NUNCA viaja el número completo
    al backend.
- `CreatorProfileInfoMain.tsx` — nuevo tab 3 "Métodos de pago" en el
  sidebar.

**Seguridad PCI (importante):**
- Hoy el form pide número completo y CVV solo en cliente para mockear el
  flow. **El backend NUNCA recibe estos datos.** Solo last4 + token mock.
- En producción, este form se reemplaza por el iframe/widget del proveedor
  de pagos. Eso es PCI-compliant porque el dato sensible nunca toca tu
  servidor.
- `pm_provider_token` está dimensionado TEXT para aceptar tokens largos
  de cualquier proveedor.

**Pendientes (entrarán en Fase 11.2):**
- 🟡 Integrar SDK real de pasarela (Recurrente, NeoNet, Stripe — depende
  de qué procesador adoptemos).
- 🟡 Validar tarjeta contra el proveedor antes de guardar (3DS,
  pre-autorización, etc.).
- 🟡 Webhook del proveedor para casos como tarjeta vencida, dispute,
  refund, etc.
- 🟡 Endpoint `/payment-methods/:id/charge` para que createCampaign,
  changeSubscription, etc. cobren contra el método elegido.
- 🟡 Email/notificación al usuario al agregar/eliminar método.

---

### Fase 11 (plan original) — Método de pago en el perfil del usuario

**Objetivo:** habilitar el campo "Método de pago" dentro de
`creator-profile-info-personal` (sección de Configuraciones) para que el
usuario pueda guardar una tarjeta antes de pautar.

**Por qué se difiere:** depende de la pasarela elegida (Recurrente / NeoNet /
Visanet GT). No se almacenan datos de tarjeta en nuestra BD: solo el token /
último-4 / brand devueltos por la pasarela. Ver bloque de seguridad de la
sección `user_privacy` en system prompt (nunca pedir CVV/PAN completos al
LLM/Claude — el usuario los ingresa directo en el iframe del proveedor).

**Esbozo de tareas:**
1. Decisión técnica: pasarela. Recurrente parece la opción más probable para
   GT (acepta tarjetas locales + transferencia bancaria).
2. Tabla `ecom.customer_payment_methods` (`paymet_id`, `cus_id`,
   `gateway_token`, `brand`, `last_four`, `is_default`, `created_at`).
3. Endpoints: `GET /payment-methods`, `POST /payment-methods` (recibe token
   del front), `DELETE /payment-methods/:id`, `POST /payment-methods/:id/default`.
4. UI: nueva sección en `PersonalInfoTab` con lista de tarjetas, botón
   "Agregar tarjeta" que abre el iframe/SDK del proveedor, botón "Eliminar" y
   marcar default.
5. Integrar en Fase 10.3 (Pauta): cuando el método de pago elegido implique
   cobro a tarjeta, requerir tarjeta default y mostrar `last_four`/`brand`
   antes de crear. Si no hay tarjeta, deshabilitar y enlazar al perfil.
6. Webhook del proveedor para confirmar el cobro y desbloquear la campaña
   (transición `pending_payment → active`).
7. Reembolsos: cuando el sistema actual genera `cus_ad_credit` (Fase 10.2) y
   la fuente original fue tarjeta, idealmente reembolsar a la tarjeta vía API
   del proveedor; mantener el crédito como fallback.

> **Importante (AMOS):** todo el flujo de tarjetas vive en el iframe/SDK del
> proveedor. El backend nunca ve PAN/CVV. Si la pasarela elegida no expone
> PCI-tokenization, se descarta.

---

### Fase 10 (plan original) — Sistema de pauta/sponsors por publicación

> Requisito de Aurelio (2026-05-22): "para sponsorear una publicación la persona
> debe **pagar** para que se vea destacada; sistema de **pauta por publicación**
> para que aparezca destacada, **personalizado por ubicación y edad**" (por eso se
> recolectan ubicación y edad de cada usuario).

Es una feature mayor con dinero de por medio → fase propia. Esbozo:

1. **Modelo de campañas** (`ecom.ad_campaigns` o similar): pub_id, anunciante
   (cus_id), presupuesto, fechas inicio/fin, estado, segmentación
   (departamento/municipio objetivo, rango de edad), métricas (impresiones/clics).
2. **Pago**: integrar una pasarela (no ejecutar transacciones desde el agente;
   el usuario/empresa paga). Definir proveedor (ej. local GT) y webhook de
   confirmación que activa la campaña.
3. **Segmentación/targeting**: al servir listados/destacados, filtrar/priorizar
   publicaciones con campaña activa cuyo target (ubicación + edad) coincida con el
   usuario que mira (usa `cit_id`/`tow_id`/`cus_birthday`). Respetar privacidad:
   el targeting es server-side, no se expone la data del usuario.
4. **Render**: carrusel/“Destacados” en home + badge “Patrocinado” en las cards.
5. **Tope/rotación**: repartir impresiones entre campañas activas (round-robin o
   por presupuesto) para no mostrar siempre la misma.

Por ahora **no implementado**. La Fase 9 (abajo) hace solo el ranking de vendedores.

---

### Fase 8.3 — Gestión de usuarios (bloqueo/baneo) ✅

Soporte puede suspender (temporal) o banear (permanente) usuarios. Un usuario
sancionado no puede iniciar sesión (enforcement en `login`). Base para que las
denuncias (Fase 8.4) puedan sancionar al autor.

**SQL para BDs existentes** (correr antes de desplegar el backend):

```sql
ALTER TABLE ecom.customer
  ADD COLUMN IF NOT EXISTS cus_account_status varchar(20) NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS cus_ban_reason varchar(255) NULL,
  ADD COLUMN IF NOT EXISTS cus_banned_at TIMESTAMP NULL;
```

- `cus_account_status`: `active` | `suspended` | `banned`. `login` rechaza
  suspended/banned mostrando el motivo (`cus_ban_reason`).
- **Endpoints (auth + requireSupport):** `GET /support/users?search=&status=`
  (lista/busca, máx 100), `POST /support/users/:cus_id/ban` (status+reason),
  `POST /support/users/:cus_id/unban`. No se puede sancionar a uno mismo ni a
  otro support/admin.
- **Frontend:** portal `/soporte/usuarios` (tabla con buscador + filtro por estado,
  modal de sanción suspender/banear con motivo, reactivar). Enlace en el menú de
  configuración solo para rol support/admin.

> Nota de alcance v1: el baneo bloquea **nuevos** inicios de sesión; una sesión
> activa con token vigente (≤1 h) sigue hasta expirar. Si se requiere corte
> inmediato, añadir un check de estado en `authMiddleware` (costo: 1 query por
> request) — pendiente de evaluar.

**Pendientes del back-office de soporte:** Fase 8.4 (bandeja de denuncias:
comentarios/mensajes/publicaciones) y Fase 8.5 (sistema de tickets + delegación
equitativa a agentes de soporte).

---

### Fase 8.4 — Bandeja de denuncias (soporte) ✅

Soporte revisa y resuelve denuncias de **comentarios, mensajes y publicaciones**
en una bandeja unificada. Comentarios y mensajes ya se podían denunciar; se agrega
la denuncia de **publicaciones**.

**SQL para BDs existentes** (correr antes de desplegar el backend):

```sql
-- Estado de resolución en denuncias existentes
ALTER TABLE ecom.comment_reports
  ADD COLUMN IF NOT EXISTS report_status varchar(20) NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS resolved_by BIGINT NULL,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP NULL;
ALTER TABLE ecom.message_reports
  ADD COLUMN IF NOT EXISTS report_status varchar(20) NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS resolved_by BIGINT NULL,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP NULL;

-- Denuncias de publicaciones (nueva)
CREATE TABLE IF NOT EXISTS ecom.publication_reports (
    report_id        SERIAL PRIMARY KEY,
    pub_id           BIGINT NOT NULL REFERENCES ecom.publications(pub_id) ON DELETE CASCADE,
    reporter_cus_id  BIGINT NOT NULL REFERENCES ecom.customer(cus_id) ON DELETE CASCADE,
    reason           VARCHAR(40) NOT NULL,
    detail           TEXT NULL,
    report_status    varchar(20) NOT NULL DEFAULT 'pending',
    resolved_by      BIGINT NULL,
    resolved_at      TIMESTAMP NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_publication_reports UNIQUE (pub_id, reporter_cus_id)
);
CREATE INDEX IF NOT EXISTS idx_publication_reports_status ON ecom.publication_reports(report_status);
```

- **Denunciar publicación:** `POST /reportpublication/:pub_id` (auth) + botón
  "Denunciar" en el detalle de publicación (motivo + detalle).
- **Bandeja (requireSupport):** `GET /support/reports?status=pending|resolved|dismissed`
  (UNION normalizado de las 3 fuentes), `POST /support/reports/resolve`
  (`{type, reportId, contentId, action}`): `dismiss` (descarta) o `delete`
  (comentario/mensaje → borrado; publicación → soft-delete pubsta_id=4 + reportes
  resueltos).
- **Frontend:** portal `/soporte/denuncias` (tabla con tipo, contenido+enlace,
  autor, motivo, fecha, descartar/eliminar). Enlace en el menú solo support/admin.

**Pendiente del back-office:** Fase 8.5 — sistema de tickets + delegación
equitativa a agentes de soporte (las denuncias podrían volverse tickets).

---

### Fase 8.5 — Sistema de tickets + delegación ✅

Implementada. Cierra la gestión de soporte: tickets ordenados y repartidos
equitativamente (round-robin) entre agentes. Correr el SQL de abajo (las dos
`CREATE TABLE IF NOT EXISTS`) en BDs existentes antes de desplegar el backend.

- **Usuario:** `/soporte/tickets` (lista + crear, modal) → detalle `/soporte/tickets/[id]`
  (hilo + responder). `POST /tickets`, `GET /tickets/mine`, `GET /tickets/:id`,
  `POST /tickets/:id/messages`.
- **Soporte (requireSupport):** `/soporte/tickets-admin` (tabla con filtros estado/agente).
  `GET /support/tickets`, `GET /support/agents`, `POST /support/tickets/:id/assign`,
  `POST /support/tickets/:id/status`. Notas internas (is_internal) ocultas al usuario.
- **Notificaciones:** `ticket_assigned` (al agente) y `ticket_reply` (a la otra parte).
- Detalle compartido usuario/soporte (`viewerIsStaff` controla controles y notas internas).

**Esquema (dentro de CREATE TABLE + ALTER en esta sección):**
```sql
CREATE TABLE IF NOT EXISTS ecom.tickets (
    ticket_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cus_id        BIGINT NOT NULL REFERENCES ecom.customer(cus_id) ON DELETE CASCADE, -- quien lo abre
    assigned_to   BIGINT NULL REFERENCES ecom.customer(cus_id),     -- agente de soporte
    subject       VARCHAR(150) NOT NULL,
    category      VARCHAR(30) NOT NULL DEFAULT 'otro', -- cuenta | pago | denuncia | verificacion | otro
    priority      VARCHAR(10) NOT NULL DEFAULT 'normal', -- low | normal | high
    status        VARCHAR(20) NOT NULL DEFAULT 'open',   -- open | in_progress | resolved | closed
    -- opcional: vínculo a una denuncia que originó el ticket
    source_type   VARCHAR(20) NULL,  -- 'report' | null
    source_id     BIGINT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS ecom.ticket_messages (
    tmsg_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ticket_id  BIGINT NOT NULL REFERENCES ecom.tickets(ticket_id) ON DELETE CASCADE,
    cus_id     BIGINT NOT NULL REFERENCES ecom.customer(cus_id),
    body       TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT false, -- nota interna de soporte (no la ve el usuario)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON ecom.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON ecom.tickets(assigned_to);
```

**Delegación equitativa (round-robin):** al crear/auto-asignar un ticket, elegir el
agente `support` con MENOS tickets abiertos asignados:
```sql
SELECT cus_id FROM ecom.customer
 WHERE cus_role IN ('support','admin')
 ORDER BY (SELECT COUNT(*) FROM ecom.tickets t
            WHERE t.assigned_to = customer.cus_id AND t.status IN ('open','in_progress')) ASC,
          random()
 LIMIT 1;
```

**Backend (// Codigo Aurelio):**
- `POST /tickets` (auth, usuario): crea ticket (subject, category, body inicial) → auto-asigna por round-robin.
- `GET /tickets/mine` (auth): tickets del usuario. `GET /tickets/:id` (auth, dueño o soporte): detalle + mensajes (filtrar `is_internal` para el usuario).
- `POST /tickets/:id/messages` (auth): responder.
- Soporte (requireSupport): `GET /support/tickets?status=&assignee=` (lista/filtra),
  `POST /support/tickets/:id/assign` (reasignar), `POST /support/tickets/:id/status`,
  notas internas (`is_internal=true`).
- Opcional: "convertir denuncia en ticket" desde la bandeja 8.4 (source_type='report').

**Frontend:**
- Usuario: `/soporte/tickets` (mis tickets) + detalle con hilo + crear ticket.
- Soporte: `/soporte/tickets-admin` — tabla con filtros (estado, agente), reasignar,
  cambiar estado, responder, notas internas. Reusar patrón de tabla de 8.3/8.4.
- Notificaciones: `ticket_reply` / `ticket_assigned` (reusar centro de notif).

Tamaño estimado: 1 ventana completa. Empezar por backend (esquema + endpoints +
round-robin), luego frontend usuario, luego panel de soporte.

---

### Fase 9.1 — Ranking público de vendedores ✅

**Objetivo:** reproponer `/art-ranking` como directorio público de vendedores, ordenado por calificación promedio de reseñas completadas.

**Backend (`ecommerceGTBackEnd`):**
- Se auditó `database.sql` antes de escribir la query: la tabla real de reseñas es `ecom.seller_ratings`; followers viven en `ecom.customer_follows`; publicaciones activas en `ecom.publications`.
- Se agregó `getSellerRanking` en `config/connPostgresDB.js`, marcado con `// Codigo Aurelio`.
- Se agregó la ruta pública `GET /sellers/ranking` en `server.js`.
- El endpoint devuelve `{ sellers: [...] }`, solo vendedores con al menos una reseña `COMPLETED`, ordenados por promedio de estrellas DESC y total de reseñas DESC, con límite 50.

**Frontend (`ecommerceGT-Next`):**
- `src/types/api.ts`: agrega `SellerRankingItem` y `SellerRankingResponse`.
- `src/hooks/api/useSellerRanking.ts`: hook React Query con `staleTime` de 5 minutos y genérico explícito en `ApiFetch.get`.
- `src/components/art-ranking/RankingMain.tsx`: reemplaza datos estáticos por ranking real, con loading skeleton, error y empty state.
- `src/components/art-ranking/SingleArtRanking.tsx`: renderiza posición, avatar con fallback de iniciales, nombre, handle, estrellas, reseñas, seguidores y publicaciones.
- `src/components/art-ranking/RankingTableTitle.tsx`: columnas en español.

**Verificación:**
- `node --check server.js` pasa.
- `node --check config/connPostgresDB.js` pasa.
- `git diff --check` pasa en frontend y backend.
- `npx tsc --noEmit` no muestra errores en los archivos de ranking ni en el hook nuevo. El proyecto completo todavía falla por errores preexistentes de `implicit any`/`never` en módulos fuera del alcance de esta subfase.

**Pendiente de Fase 9 mayor:** sponsors/publicaciones destacadas siguen pendientes; el follow ya estaba adelantado en fases anteriores.

**Nota de arquitectura — relación con Fase 9 original (Aurelio, 2026-06-04):**
La Fase 9 original creó `GET /top-sellers` + `useTopSellers` que ya rankea vendedores y se usa en home, sidebar y `/creators`. Cuando se revisó esta subfase 9.1, se detectó solapamiento con el endpoint original. **Decisión: mantener ambos endpoints porque cubren casos distintos** (no son intercambiables):
- `/top-sellers` — showcase widget, score compuesto, todos los vendedores con publicaciones, parametrizado con `?limit`. Field naming `snake_case`. Array directo.
- `/sellers/ranking` — página dedicada `/art-ranking`, rating puro, solo vendedores con reviews completados, limit fijo 50. Field naming `camelCase`. `{ sellers: [...] }`.

La diferencia está cross-referenciada en código (`connPostgresDB.js getTopSellers/getSellerRanking`, `useTopSellers.ts`, `useSellerRanking.ts`). Si en el futuro se quiere consolidar en un solo endpoint con `?sortBy=`, eso es scope de una fase de cleanup posterior.

---

### Fase 8.3.4 — Fix de seguridad CWE-640 en password recovery ✅

**Bug crítico detectado durante QA manual:** el endpoint `POST /recoverypassnew` aceptaba `{email, npassword}` y cambiaba la contraseña sin verificar nada. Cualquier persona con el email de la víctima podía:

1. Ir a `/forgot`
2. Poner el email
3. (El frontend pasaba inmediatamente al form de nueva contraseña, **sin esperar nada del correo**)
4. Setear una contraseña nueva
5. Tomar control de la cuenta

Esto es CWE-640 ("Weak Password Recovery Mechanism") clásico — toma de cuenta solo conociendo el email.

**Fix aplicado:**

Backend (`config/connPostgresDB.js`, función `recoveryPwdGenNew`):
- Ahora exige `lastPwd` en el body (la contraseña temporal enviada en `/recoverypass`).
- Valida con `bcrypt.compare(lastPwd, user.cus_password)`. Si no coincide → 401 `{ invalidTempPassword: true }`.
- Falta `lastPwd` → 400 `{ missingTempPassword: true }`.
- Exige `user.passta_id === 5` (solicitud de reset activa). Si la cuenta está en estado normal → 403 `{ noResetPending: true }`. Esto cierra otra puerta: aunque alguien tenga la contraseña actual de un usuario, no puede usar este endpoint sin pasar primero por `/recoverypass`.
- Valida largo mínimo de `npassword` (8 chars).

Frontend (`src/form/ForgotForm.tsx`):
- Vista 2 ahora pide 3 campos: **Contraseña temporal del correo** + Nueva contraseña + Confirmar.
- El campo de temporal tiene `autocomplete="one-time-code"` para que el navegador no lo guarde.
- Botón "¿No recibiste el correo? Volver a empezar" para reset del flujo.
- Envía `lastPwd: values.tempPassword` al backend.

Tests automatizados (`tests/api/auth/recovery.spec.js`):
- T-90 — Reset exitoso con temporal correcta
- T-91 — Rechazo con temporal incorrecta (401)
- T-92 — Rechazo si falta lastPwd (400)
- T-93 — Rechazo si no hay reset pendiente (403)
- T-94 — Rechazo si npassword < 8 chars (400)

Tests totales: 8 → **13 pasando** en `npm test`.

**Seguimiento:** el follow-up de tokens cripto-seguros quedó resuelto en Fase 8.3.5. Esta sección queda como contexto histórico del fix intermedio.

---

### Fase 8.3.5 — Password recovery con tokens cripto-seguros ✅

**Objetivo:** reemplazar el flujo de recuperación basado en contraseña temporal por email (`lastPwd`, Fase 8.3.4) por tokens random single-use con expiración corta y hash SHA-256 en BD.

**Decisiones aplicadas:**
- D-1=B: el backend guarda `prt_token_hash` (SHA-256), no el token plaintext.
- D-2=B: anti-enumeración; si el email no existe, `/recoverypass` devuelve 200 con mensaje genérico y no crea token.
- D-3=B: token válido por 30 minutos.
- D-4=B: rate-limit de 3 solicitudes por usuario en 1 hora.
- D-5=A: se rompe compatibilidad con el payload viejo `{ email, lastPwd, npassword }`.
- D-6=B: `passta_id=5` queda como estado defensivo legacy; el login todavía puede redirigir al usuario a `/forgot`.

**Backend (`ecommerceGTBackEnd`):**
- `database.sql`: agrega `ecom.password_reset_tokens` con índices `idx_prt_token_hash` e `idx_prt_cus_id_expires`.
- `.env.example`, `tests/.env.test.example`, `tests/setup-env.js`: documentan/configuran `FRONTEND_URL=http://localhost:3000`.
- `config/connPostgresDB.js`:
  - `recoveryPwd` ahora genera token random de 32 bytes, guarda SHA-256, inserta expiración de 30 minutos, respeta bloqueo por intentos y envía link `/forgot?token=...`.
  - `recoveryPwdGenNew` valida token existente/no usado/no expirado y cambia password en transacción (`SELECT ... FOR UPDATE`), marcando el token usado e invalidando otros tokens activos del usuario.
- `tests/helpers/db.js`: agrega `getActiveTokensFor(cusId)`.
- `tests/api/auth/recovery.spec.js`: reemplaza T-90..T-94 por T-95..T-103.

**Frontend (`ecommerceGT-Next`):**
- `src/form/ForgotForm.tsx`: detecta `?token=`. Sin token muestra solo email; con token muestra nueva contraseña + confirmar. Elimina `lastPwd`, contraseña temporal, `userForgot` y `any`.

**Documentación canónica actualizada:**
- Backend `docs/API_REFERENCE.md`: nuevos shapes de `/recoverypass` y `/recoverypassnew`.
- Backend `docs/SCHEMA.md`: `password_reset_tokens` en resumen, ER y bloque expandido.
- Backend `docs/GLOSSARY.md`: entrada "Token de reset" y nota de `passta_id=5` legacy.
- Backend `README.md`: `FRONTEND_URL` y suite actualizada.
- Frontend `docs/TEST_PLAN.md`: T-90..T-94 `🔒 OBSOLETE`, T-95..T-103 `🤖 AUTOMATED`.
- Frontend `docs/ARCHITECTURE.md`: conteo actualizado a 42 tablas.
- Frontend `docs/phases/phase-8.3.5-recovery-tokens.md`: checklist marcado durante la ejecución.

**Migración para BDs existentes:** ver §9 "Fase 8.3.5 — Password recovery con tokens cripto-seguros"; incluye `CREATE TABLE`, índices y limpieza de `passta_id=5`.

**Verificación:**
- Backend `npx vitest run tests/api/auth/recovery.spec.js`: 9/9 pasa.
- Backend `npm test`: 5 archivos, 17 tests, todo pasa.
- Frontend `npx tsc --noEmit`: limpio.
- Frontend `npx next build`: compila correctamente.

**Follow-ups detectados:** considerar cleanup futuro de tokens viejos (`prt_used_at`/`prt_expires_at` antiguos) con job programado si la tabla crece.

---

### Fase 8.3.3 — Bloqueo por contraseña, y por qué hay DOS columnas de estado ✅

> **Leer esto antes de "arreglar" la duplicación.** Que `customer` tenga
> `passta_id` y `cus_account_status` a la vez **no es un descuido**: son dos
> cosas distintas y la separación fue deliberada. Esta sección existe porque la
> decisión no estaba escrita en ningún lado y ya costó re-derivarla leyendo
> código y fechas de commits (2026-08-12).

**Las dos columnas:**

| Columna | Qué representa | Quién la mueve | Cómo se libera |
| --- | --- | --- | --- |
| `passta_id` | Bloqueo por **intentos fallidos de contraseña** | El sistema: 5 fallos → `passta_id=2` + 30 min | `POST /recoverypass`, o soporte con `POST /support/users/:id/unlock-password` |
| `cus_account_status` | **Estado de la cuenta** (`active`/`inactive`/`suspended`/`banned`/`pending_deletion`/`deleted`) | Soporte, y el propio usuario al desactivar/eliminar | Según el estado (ver Fases 8.3.1 y 12.1) |

Son **ortogonales**: una cuenta perfectamente activa puede tener el bloqueo de
contraseña puesto, y una cuenta suspendida por soporte puede tener la
contraseña sin bloquear. Meterlas en un solo campo obligaría a inventar estados
combinados (`active_pero_con_password_bloqueada`) que no le sirven a nadie.

**El incidente que lo originó (Aurelio, 2026-06-03):** 5 fallos de contraseña
dejaban `passta_id=2`, pero el portal `/soporte/usuarios` solo operaba sobre
`cus_account_status` — así que **soporte no podía desbloquear**. El usuario
quedaba trabado y desde el panel se lo veía como activo.

**Se evaluaron dos salidas, el mismo día:**

1. **Unificar** todo en `cus_account_status` y eliminar `passta_id`
   (rama `feat/unify-account-status` del backend + `claude/hardcore-spence-cd51f8`
   del frontend).
2. **Mantenerlas separadas** y darle a soporte un endpoint que entienda
   `passta_id`.

**Se eligió la 2**, que es la que está en `master` desde el commit `b9abf9f`.
Las ramas de la opción 1 quedaron sin mergear y **no hay que fusionarlas**: hoy
darían conflictos en los tres archivos que tocan y revertirían esta decisión
más todo lo construido encima.

**Lo que hay que saber para no romperlo:**

- El bloqueo de contraseña **no se libera solo** al vencer `cus_banned_until`:
  la única vía es restablecer la contraseña. Es anti-abuso a propósito.
- `supportUnlockPassword` opera sobre `passta_id`, no sobre el estado de cuenta.
- Frontend: `LoginFrom.tsx` lee `res.idpwd` (`1` = normal, `5` = debe cambiar
  contraseña). Ese valor sale de `passta_id`.
- La interface `PasswordStatus` de `src/types/api.ts` se eliminó el 2026-08-12:
  tenía 0 usos y el frontend no llama ni a `/cat/passta` ni a `/changestatus`.
  El backend sigue exponiendo ambos endpoints para el frontend legacy.

---

### Fase 8.3.1 — Suspensión con duración + apelación ✅

Mejoras a la sanción de usuarios (Fase 8.3):

**SQL para BDs existentes:**
```sql
ALTER TABLE ecom.customer
  ADD COLUMN IF NOT EXISTS cus_banned_until TIMESTAMP NULL;
```

- **Suspensión temporal:** al sancionar con "Suspender" se elige un plazo (7/15/30
  días o personalizado) → `cus_banned_until = now() + N días`. El `login`
  **reactiva sola** la cuenta cuando vence (`active` + limpia campos). Banear sigue
  siendo permanente (`cus_banned_until = NULL`). `supportBanUser` acepta `days`.
- **Apelación pública:** un usuario sancionado no puede entrar, así que en el login,
  al bloquearse (403 con `banned:true`), se muestra el motivo + botón "Apelar esta
  decisión" → `POST /appeal` (SIN auth) con `{ email, message }`. Valida que la
  cuenta esté suspendida/baneada, no duplica apelaciones abiertas, y crea un
  **ticket categoría `apelacion`** (prioridad alta) asignado por round-robin → cae
  en el panel de tickets de soporte. Al resolver, soporte reactiva desde /soporte/usuarios.

---

### Fase 20 — Infraestructura de tests automatizados backend ✅

**Objetivo:** dejar una primera base automatizada y determinista para los flujos críticos de auth/soporte antes de seguir ampliando cobertura.

**Backend (`ecommerceGTBackEnd`):**
- Se agregó Vitest + Supertest con `vitest.config.js`, estructura `tests/`, helpers de BD y fixtures mínimos.
- `server.js` ahora exporta `app` y solo levanta `app.listen()` cuando se ejecuta directamente.
- `package.json` agrega `test`, `test:watch`, `test:coverage` y `db:test:setup`; `package-lock.json` queda versionado para que `npm ci` funcione en CI.
- `.env.test.example` documenta la configuración local; `.env.test` queda ignorado.
- `BCRYPT_ROUNDS` se lee desde env con fallback 10 para producción; tests usan cost 4.
- `.github/workflows/test.yml` ejecuta `npm ci` + `npm test` con PostgreSQL 15 en push a `master` y PR a `main`/`master`/`develop`.

**Tests automatizados:**
- `tests/api/auth/login.spec.js`: T-01 y T-02.
- `tests/api/auth/lockout.spec.js`: T-03 y T-04.
- `tests/api/support/unlock-password.spec.js`: T-22.
- `tests/unit/bcrypt-rounds.spec.js`: guard de fallback seguro para bcrypt.

**Decisiones aplicadas:**
- D-1=B: BD local con sufijo `_test`; helper aborta si `DB_DATABASE` no termina en `_test`.
- D-2=A: schema desde `database.sql` una vez y reset con `TRUNCATE ... CASCADE` + fixtures entre tests.
- D-3=A: `BCRYPT_ROUNDS=4` solo en tests; fallback 10 fuera de test.
- D-4=A: specs agrupados por endpoint.
- D-5=skip: sin thresholds de coverage por ahora; script opcional `test:coverage`.

**Documentación:**
- `docs/TEST_PLAN.md` marca T-01, T-02, T-03, T-04 y T-22 como 🤖 AUTOMATED con ruta de spec.
- `docs/phases/phase-20-test-automation.md` queda con checklist completo.
- README del backend documenta cómo correr `npm run db:test:setup`, `npm test` y `npm run test:watch`.

**Verificación:**
- `npm test` pasa con 4 archivos y 8 tests, incluyendo los 5 smoke tests pedidos.
- Determinismo validado con 10 corridas seguidas de `npm test`.
- Aislamiento validado ejecutando cada spec API por separado.
- Tiempo total observado: ~1.2s en la corrida local final, por debajo del límite de 30s.

**Nota:** el plan original pedía `docs/MIGRATION.md`, pero la bitácora real del repo es `MIGRATION.md` en la raíz. Se actualiza este archivo para mantener una sola fuente de verdad.
