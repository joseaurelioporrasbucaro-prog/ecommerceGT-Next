# Migración ecommerceGT → ecommerceGT-Next

> Bitácora viva del proceso de migración del marketplace. Cada fase agrega su propia sección al final del documento con objetivo, archivos tocados y justificación. Este archivo es la fuente de verdad compartida con el equipo: cualquier decisión arquitectónica importante queda aquí, no solo en chats o PRs.

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
| **5** | Wizard de crear/editar publicación + uploads + procesamiento de imágenes (sharp) | ⬜ Pendiente | 3–4 días |
| **6** | Mensajería (inbox + conversación + polling) | ⬜ Pendiente | 2 días |
| **7** | Cierre de venta + reseñas | ⬜ Pendiente | 1 día |
| **8** | Empresas y planes (opcional) | ⬜ Pendiente | 1–2 días |
| **9** | Sponsors / publicaciones destacadas + ranking de vendedores + follow | ⬜ Pendiente | 2 días |
| **10** | Pulido, i18n, SEO, deploy | ⬜ Pendiente | 2 días |

**Total estimado:** 19–25 días de trabajo enfocado.

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

### Endpoints de auth pendientes (cualquier fase)

Detectados en revisiones anteriores; sin urgencia inmediata pero documentados:
- `PUT /publications/:id`, `POST /changestatus`, `POST /deleteimg`, `POST /getemployees` — agregar middleware `auth` que falta.
- Cookie en producción → `SameSite=None; Secure` (Fase 10 / deploy).
- Refresh token para sesión > 1 hora (Fase 10).

### Follow-up Fase 5 — Tag "Vendida" en cards públicas y favoritos

Hoy `/my-publications` muestra tag "Vendida" porque `MyPublicationItem` incluye `pubsta_id`. Pero `/publications` y `/favorites` no lo muestran porque sus respuestas (`PublicationListItem`, `FavoriteItem`) no devuelven el status.

**Cambio backend en `connPostgresDB.js` (// Codigo Aurelio):**
- `getPublications` — agregar `p.pubsta_id` al SELECT (mantener filtro `pubsta_id <> 4` para anuladas, pero permitir status 3=Vendida).
- `getMyFavorites` — agregar `p.pubsta_id` al SELECT.

**Frontend:**
- `PublicationListItem.pubstaId: number` y `FavoriteItem.pubstaId: number` en `types/api.ts`.
- `PublicationCard` recibe `pubstaId` opcional y muestra tag "Vendida" rojo cuando `=== 3` (helper `getStatusBadge` ya existe en `MyPublicationsMain.tsx`, extraer a `publicationUtils.ts`).
