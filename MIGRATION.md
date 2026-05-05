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
| **1** | Auth completa + middleware de protección de rutas | ⬜ Pendiente | 1 día |
| **2** | Catálogos de referencia (países/ciudades/categorías/transacciones) | ⬜ Pendiente | 0.5 día |
| **3** | Catálogo público y detalle de publicaciones | ⬜ Pendiente | 3 días |
| **4** | Acciones de usuario logueado (favoritos, mis publicaciones, perfil) | ⬜ Pendiente | 2 días |
| **5** | Wizard de crear/editar publicación + uploads | ⬜ Pendiente | 3–4 días |
| **6** | Mensajería (inbox + conversación + polling) | ⬜ Pendiente | 2 días |
| **7** | Cierre de venta + reseñas | ⬜ Pendiente | 1 día |
| **8** | Empresas y planes (opcional) | ⬜ Pendiente | 1–2 días |
| **9** | Pulido, i18n, SEO, deploy | ⬜ Pendiente | 2 días |

**Total estimado:** 17–22 días de trabajo enfocado.

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

#### Follow-ups detectados (no parte de Fase 0)

- ⚠️ **Next.js 13.4.6 tiene una vulnerabilidad de seguridad parcheada** en versiones posteriores (aviso del `npm install`). Planificar upgrade a 13.5.x antes de Fase 9.
- ⚠️ Algunos endpoints "auth requerida" no aplican el middleware en backend (`PUT /publications/:id`, `POST /changestatus`, `POST /deleteimg`, `POST /getemployees`). Reportar y corregir en `// Codigo Aurelio` antes de exponerlos en el cliente nuevo.
- ⚠️ Inconsistencia de shape en `GET /infoCustomer/:id` (devuelve array de un elemento). Normalizar en el hook `useSellerInfo()` de Fase 3.
