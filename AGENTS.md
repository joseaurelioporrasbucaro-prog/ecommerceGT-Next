# AGENTS.md — Instrucciones para asistentes de IA

> Cualquier asistente de IA (Claude, Gemini, ChatGPT, Cursor, GitHub Copilot, ...) que trabaje en este repo **DEBE leer este archivo PRIMERO** y seguir sus reglas. Es la única forma de mantener coherencia entre sesiones y entre modelos.
>
> Para el estado actual del trabajo (qué fases están hechas y qué viene), ver `MIGRATION.md`. Este archivo solo contiene reglas inmutables.

---

## 1. Contexto del proyecto

Migración de un frontend de marketplace de bienes raíces:

- **Origen:** `ecommerceGT` — Create React App + React 18 + react-router v5 + Redux + MUI.
- **Destino:** `ecommerceGT-Next` — Next.js 13.4.6 App Router + TS strict + Bootstrap.
- **Backend compartido:** `ecommerceGTBackEnd` — Node + Express 4 + PostgreSQL.

**Producto:**
- Fase 1 (en curso) → marketplace de bienes raíces.
- Fase 2 (futura) → marketplace general (cualquier vendedor, cualquier producto).

**Idioma del proyecto:** español. Commits, comentarios, mensajes en chat: todo en español.

## 2. Repos involucrados

| Path | Rol |
| --- | --- |
| `/Users/joseaurelioporras/Documents/Proyectos Git /ecommerceGT-Next` | Destino de la migración (este repo) |
| `/Users/joseaurelioporras/Documents/Proyectos Git /ecommerceGT` | Frontend legacy — fuente de la **lógica de negocio** |
| `/Users/joseaurelioporras/Documents/Proyectos Git /ecommerceGTBackEnd` | Backend compartido — solo se toca con autorización (ver §9) |

## 3. Estrategia (la regla de oro)

> **Trasplantar la lógica del legacy a la cáscara visual del scaffold Next, sin tocar backend.**

- El **template Next es la referencia de calidad**: usar su UI/UX y adaptar la lógica del legacy hacia él, NO al revés. Si el scaffold tiene una pantalla equivalente (`/creator-profile-info-personal`, `/explore-arts`, etc.), se reusa y solo se cambian los datos/endpoints. NO se clonan los componentes MUI del legacy.
- El **backend solo se modifica si es bloqueante**, solo dentro de bloques `// Codigo Aurelio`, y solo previo aviso explícito al usuario.

---

## 4. Reglas duras (NUNCA hacer)

1. ❌ **NUNCA usar `any`** en código nuevo. Usar `unknown` y narrowing si el tipo es genuinamente desconocido.
2. ❌ **NUNCA tocar el backend** sin avisar al usuario y obtener confirmación.
3. ❌ **NUNCA clonar componentes MUI** del legacy al proyecto Next. Usar siempre Bootstrap + SCSS del scaffold.
4. ❌ **NUNCA commitear** sin que `npx tsc --noEmit` y `npx next build` pasen limpio.
5. ❌ **NUNCA hacer `git push --force`, `git reset --hard`, `git clean -fd`** ni operaciones destructivas sin autorización explícita.
6. ❌ **NUNCA cerrar una fase** sin actualizar `MIGRATION.md` (cambiar estado en tabla + agregar sección de bitácora).
7. ❌ **NUNCA introducir librerías nuevas** sin justificar contra lo que ya está instalado.
8. ❌ **NUNCA traducir comentarios o strings al inglés.** Todo en español.
9. ❌ **NUNCA usar el patrón axios** `error?.response?.data?.message` para leer errores de `ApiFetch`. Usar `error instanceof ApiError ? error.message : fallback`.
10. ❌ **NUNCA borrar páginas o componentes del scaffold** sin confirmar que su reemplazo ya existe.

## 5. Reglas blandas (preferir)

- ✅ **Una rama por fase:** `feat/migration-fase-N-<resumen>`.
- ✅ **Un PR por fase**, descripción enlazando la sección correspondiente de `MIGRATION.md`.
- ✅ **Renombres masivos** (`Art-Details/` → `Publication-Details/`) en la fase que toca esa carpeta, NO todos a la vez.
- ✅ **Commits pequeños** dentro de una fase si los pasos son lógicamente independientes.
- ✅ **Hooks de servidor en `src/hooks/api/`** (`use<Resource>.ts`).
- ✅ **Hooks de UI en `src/hooks/`** (raíz).

---

## 6. Convenciones técnicas

### 6.1. Tipado

- TypeScript strict (configurado en `tsconfig.json`).
- **Todos los call sites de `ApiFetch` deben tipar el genérico:**
  ```ts
  // ✅ correcto
  const res = await ApiFetch.get<MeResponse>('/me');
  const res = await ApiFetch.post<LoginResponse>('/login', payload);

  // ❌ incorrecto (TS error: 'res' is of type 'unknown')
  const res = await ApiFetch.get('/me');
  ```
- Los tipos del backend viven en `src/types/api.ts`. **Antes de crear uno nuevo, verificar si ya existe.**
- Los tipos reflejan la realidad cruda del backend (typos como `levell`/`sizee`, minúsculas como `firstname` en `getInfoCus`). Marcar con `// SIC:` lo que es typo del backend.

### 6.2. Manejo de errores

- `ApiFetch` lanza `ApiError` con `status`, `message` (del backend si está disponible) y `body`.
- Patrón canónico en componentes:
  ```ts
  import { ApiError } from '@/utils/Api';

  try {
    const res = await ApiFetch.post<X>('/endpoint', payload);
    // ...
  } catch (e) {
    const msg = e instanceof ApiError ? e.message : 'Error inesperado';
    toast.error(msg);
  }
  ```

### 6.3. Hooks de servidor (React Query)

- Path: `src/hooks/api/use<Resource>.ts`.
- Patrón canónico:
  ```ts
  import { useQuery } from '@tanstack/react-query';
  import { ApiFetch } from '@/utils/Api';
  import type { ResourceType } from '@/types/api';

  export const RESOURCE_QUERY_KEY = ['resource'] as const;

  export function useResource() {
    return useQuery({
      queryKey: RESOURCE_QUERY_KEY,
      queryFn: () => ApiFetch.get<ResourceType>('/endpoint'),
      retry: false,
      staleTime: 60_000,
    });
  }
  ```
- Las query keys se exportan como constantes para que mutations puedan invalidarlas sin hardcodear strings.
- Para mutations: `useMutation` + `queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEY })`.

### 6.4. Auth

- Sesión vía **cookie httpOnly** del backend (`credentials: 'include'`, ya configurado en `ApiFetch`).
- `AuthContext` expone: `user`, `setUser`, `loading`, `checkAuth`, `logout`, `userForgot`, `setUserForgot`.
- **Logout:** usar `useAuth().logout()` (POST /logout + limpia state + invalida React Query). La redirección la hace el llamador.
- **Rutas privadas:** agregar la ruta a `PROTECTED_ROUTES` o `PROTECTED_PATTERNS` en `src/middleware.ts`.

### 6.5. Estilos

- **Bootstrap 5 + SCSS** del scaffold. **NO Tailwind, NO MUI.**
- Clases existentes en `src/style/index.scss` y subarchivos. Reusar antes de crear.
- Iconografía: `<i className="fal fa-..." />` (Font Awesome ya cargado por el scaffold; su licencia cubre el uso).
- **Separadores que se vean en light y dark mode:** usar `rgba(128, 128, 128, 0.2)` o `0.25`. NO usar `rgba(255, 255, 255, x)` para borders/divisores: solo se ven en dark mode.
- **Componentes con styled-jsx:** cuando el SCSS del scaffold no cubre algo, usar `<style jsx>` dentro del componente. Para que los selectores afecten elementos hijos no scopeados (como los renderizados por `<Image fill>` o `<Link>`), prefijar las reglas con `:global(...)`.
- **Aspect ratio fijo en imágenes:** usar `aspectRatio: '4 / 3'` o similar en CSS (no width/height fijos). Combinado con `<Image fill style={{ objectFit: 'cover' }}>` evita layouts saltarines.

### 6.5.1. Imágenes y placeholders

- Cliente: `next/image` con `fill` + `objectFit: cover` para tarjetas (recorte limpio); `objectFit: contain` para galerías de detalle (no recortar fotos verticales).
- Cuando el archivo del backend devuelve 404, capturar el `onError` y reemplazar `src` por un placeholder SVG con dimensiones recomendadas (`buildPlaceholderSvg(w, h)` en `publicationUtils.ts`).
- Las dimensiones canónicas viven como constantes en `publicationUtils.ts`: `CARD_IMAGE_DIMENSIONS` (800×800 cuadrado), `DETAIL_IMAGE_DIMENSIONS` (1600×900), `THUMB_IMAGE_DIMENSIONS` (200×150).
- Cuando el `src` ya es el placeholder data-URI, pasar `unoptimized` al `<Image>` (Next no puede optimizar `data:` URLs).
- Procesamiento real de imágenes con `sharp` en backend → planificado en Fase 5 (ver MIGRATION.md §9).

### 6.5.2. Iconos personalizados con fallback

- Convención: SVG en `public/assets/img/property-icons/` (features: rooms, baños, parqueos, ubicación, tamaño) y `public/assets/img/property-categories/` (categorías: casa, apto, terreno).
- Componente `<PropertyFeatureIcon feature="rooms" />` intenta el SVG personalizado, captura `onError` y cae a Font Awesome.
- Esto permite agregar iconos sin tocar código y sin romper la UI mientras los archivos no existan.

### 6.5.3. Galerías de imágenes (estilo Facebook)

- Para detalle de publicación: `PublicationGallery.tsx` usa `aspect-ratio: 16/9` con `objectFit: contain` y fondo gradient oscuro.
- Permite que fotos verticales y horizontales se vean completas sin recorte ni deformación.
- Flechas overlay + thumbnails clickeables debajo + contador `i / N`.

### 6.6. Formularios

- **Formik + Yup**. NO react-hook-form.
- Mensajes de validación traducidos: `t('auth.validation.requiredAll')`.
- Patrón de errores: `formik.touched[field] && formik.errors[field]`.

### 6.7. i18n

- `i18next` configurado en `src/i18n.js` con traducciones inline (es/en).
- Strings nuevos se agregan ahí en ambos idiomas.

### 6.8. Comentarios y docs

- **Mínimos.** Solo el "por qué" no obvio (constraint, decisión arquitectónica, workaround).
- **En español.**
- NO escribir docstrings largos ni comentarios que repitan lo que el código ya dice.
- NO crear archivos `.md` nuevos salvo que el usuario lo pida explícitamente. `MIGRATION.md` se actualiza, no se reemplaza.

---

## 7. Workflow obligatorio por fase

### Antes de empezar la fase

1. Leer `MIGRATION.md` completo (estrategia, mapeo, decisiones, estado).
2. Identificar la fase a trabajar y leer su descripción en sección 6 de `MIGRATION.md`.
3. Correr `git log --oneline -10` y `git status` para ver el estado real del repo.
4. Si la fase tiene ambigüedad o decisiones no tomadas → **preguntar al usuario antes de tocar código**.

### Mientras se trabaja

5. Cambios atómicos por sub-tarea.
6. Tipar todo desde el inicio. NO empezar con `any` con la promesa de arreglar después.
7. Si encontrás un bug del backend, **detenerse y avisar al usuario** con: cuál es el bug, dónde está (archivo + línea), qué proponés hacer y por qué.
8. Si una decisión del plan tiene dos opciones razonables, **preguntar al usuario** en lugar de elegir.

### Antes del commit

9. `npx tsc --noEmit` → debe pasar limpio.
10. `npx next build` → debe compilar sin errores nuevos.
11. **Actualizar `MIGRATION.md`:**
    - Cambiar estado de la fase a ✅ Completada en la tabla de la sección 6.
    - Agregar sección de bitácora al final con: objetivo, sub-tareas, archivos creados, archivos modificados, decisiones tomadas, follow-ups detectados.

### Mensaje de commit

```
feat(migration): fase N — resumen breve

- Bullet point por cada cambio significativo.
- Otro bullet point.

Verificado: tsc --noEmit limpio, next build pasa.

Co-Authored-By: <Modelo> <noreply@…>
```

Prefijo: `feat` para nueva funcionalidad, `chore` para infraestructura, `fix` para correcciones, `docs` para documentación, `refactor` para refactor sin cambio funcional.

### Antes de cerrar la sesión

12. `git push origin <rama>`.
13. Resumen al usuario: qué se hizo, qué falta, qué riesgos detectaste.

---

## 8. Backend: cuándo y cómo tocar

Antes de modificar `ecommerceGTBackEnd`:

1. **Verificar** que no se puede resolver desde el frontend.
2. **Avisar al usuario** con: archivo, línea, cambio propuesto, justificación.
3. **Esperar confirmación**.
4. **Editar SOLO dentro o adyacente a bloques `// Codigo Aurelio`** en `config/connPostgresDB.js`.
5. Si agregás código nuevo, **marcarlo con `// Codigo Aurelio`** para mantener trazabilidad.
6. **Si tocás la BD, leer y respetar §12 PRIMERO.** Antes de proponer cualquier `ALTER TABLE` o crear tablas nuevas hay que abrir `database.sql` y aplicar las reglas de auditoría de schema.

Casos típicos donde el backend SÍ se toca (todos requieren confirmación):

- Endpoints sin auth que deberían tenerla (ver follow-ups en `MIGRATION.md`).
- Cookie en producción necesita `SameSite=None; Secure`.
- Falta paginación en `GET /publications` cuando el volumen lo requiera.
- Refresh token para mejorar UX de sesión de 1h.

---

## 9. Cuándo preguntar al usuario (vs decidir solo)

**PREGUNTAR** cuando:
- Una fase requiere tocar el backend.
- El plan de `MIGRATION.md` deja una decisión abierta.
- Encontrás dos opciones técnicas razonables y la elección no es trivial.
- Una página del scaffold no tiene equivalente legacy claro.
- Detectás un bug crítico que afecta el alcance de la fase.

**NO PREGUNTAR** cuando:
- La regla está documentada en este archivo.
- Es un detalle de implementación menor (nombre de variable, orden de imports, formato de un comentario).
- La decisión ya está en `MIGRATION.md` sección 5 (decisiones de scope).

---

## 10. Plantillas de prompts

### 10.1. Handoff a otro asistente (cuando empezás una sesión)

```
Estoy trabajando en la migración del frontend ecommerceGT → ecommerceGT-Next.

Antes de tocar código:
1. Lee `AGENTS.md` y `MIGRATION.md` completos.
2. Corré `git log --oneline -10` y `git status`.
3. Continuamos con la Fase X (ver `MIGRATION.md` sección 6).
4. Presentame el plan exacto de archivos que vas a crear/modificar y esperá mi confirmación antes de empezar.

Reglas críticas:
- No tocar el backend sin avisarme.
- No usar `any` en código nuevo.
- Actualizar `MIGRATION.md` antes del commit final de la fase.
- Si algo no está claro, preguntá.
```

### 10.2. Revisar trabajo de otro asistente (cuando volvés)

```
Otro asistente trabajó en la rama `feat/migration-fase-X` mientras yo no estaba.

1. Lee `AGENTS.md` y `MIGRATION.md` para refrescar el contexto.
2. Corré `git log feat/migration-fase-X --oneline` y `git diff main...feat/migration-fase-X`.
3. Validá que los cambios cumplan con las reglas de `AGENTS.md`.
4. Corré `npx tsc --noEmit` y `npx next build`.
5. Leé la sección nueva de `MIGRATION.md` que el otro asistente agregó.
6. Reportame: qué hizo bien, qué hay que ajustar, y si está listo para mergear o necesita correcciones.
```

---

## 11. Estructura del repo (referencia rápida)

```
ecommerceGT-Next/
├── AGENTS.md              ← este archivo
├── MIGRATION.md           ← bitácora viva del plan
├── .env.local             ← (gitignored) NEXT_PUBLIC_API_URL
├── .env.example           ← plantilla versionada
├── next.config.js         ← remotePatterns para imágenes del backend
├── src/
│   ├── app/               ← App Router (rutas)
│   │   ├── layout.tsx     ← AppProvider > QueryProvider > AuthProvider
│   │   ├── page.tsx       ← landing (HomeMain)
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify/[token]/
│   │   └── ...
│   ├── components/        ← componentes por feature
│   ├── contextApi/        ← AppProvider (UI state)
│   ├── form/              ← formularios (LoginFrom, RegisterForm, etc.)
│   ├── hooks/
│   │   ├── api/           ← hooks React Query (useCurrentUser, useLogout, ...)
│   │   └── (otros UI hooks)
│   ├── layout/            ← header, footer, sidebar, DefaultWrapper
│   ├── middleware.ts      ← protección de rutas privadas
│   ├── style/             ← SCSS
│   ├── types/api.ts       ← tipos del backend (única fuente de verdad)
│   └── utils/
│       ├── Api.ts         ← ApiFetch (cliente HTTP)
│       ├── ApiError       ← clase de error tipado
│       ├── AuthContext.tsx
│       └── QueryProvider.tsx
└── tsconfig.json
```

---

## 12. Mantenimiento del `database.sql` del backend

**Rol al tocar la BD:** Arquitecto de Base de Datos Senior y mantenedor principal del archivo `database.sql` del backend. El archivo es la **única fuente de verdad** del schema y debe quedar listo para despliegues en producción desde cero.

**Ruta del archivo:** `ecommerceGTBackEnd/database.sql`.

### Reglas estrictas de ejecución

#### 12.1. Prohibido `ALTER TABLE` para nuevas implementaciones

❌ **NO generar** comandos `ALTER TABLE` para agregar columnas o cambiar estructuras.

✅ **SÍ:** ubicar la declaración `CREATE TABLE` original dentro de `database.sql` y agregar el nuevo campo directamente allí, **como si siempre hubiera existido desde el diseño inicial**.

> Razón: el `database.sql` debe poder ejecutarse en producción nueva sin acumular parches. Un `ALTER` separado fragmenta el schema y obliga a mantener orden de ejecución.

> **Excepción única:** las migraciones contra BDs ya pobladas en dev/staging se entregan como SQL adicional (no en `database.sql`) y se documentan en MIGRATION.md §9 como "comandos de migración para entornos existentes". El `database.sql` siempre refleja el estado FINAL deseado.

#### 12.2. Auditoría de tipos de datos antes de agregar columnas

**Antes de agregar cualquier columna, abrir `database.sql` y verificar si ya existe.**

- Si existe (ej. `cus_user_name varchar(50)`), **respetar el nombre y tipo originales**. NO renombrar a `cus_username` ni cambiar a `TEXT` por gusto.
- Si genuinamente hay que cambiar el tipo, marcar el cambio como migración de tipo y avisar al usuario primero.

**⚠️ Caso especial documentado: `cus_user_name`**

A pesar de su nombre engañoso, `cus_user_name varchar(50)` **NO es un username/handle público** — guarda el **email del usuario** y se usa para login (`select * from customer where cus_user_name = $1` con el email como parámetro, líneas 112/163/403/779-786 de `connPostgresDB.js`). Es un naming legacy heredado.

El handle público (alias `@usuario`, único, opcional, base del follow) vive en una columna separada **`cus_handle varchar(50)`**. Mapea a `handle` en `AuthUser` del frontend.

Antes de agregar cualquier columna que parezca duplicar funcionalidad, verificá con `grep` cómo se usa la columna existente en el backend.

#### 12.3. Consistencia en llaves foráneas (FK)

Cuando crees nuevas tablas relacionales, **verificar obligatoriamente** el tipo de la PK referenciada:

- Si la PK del catálogo o tabla maestra es `BIGINT`, la FK debe ser **exactamente `BIGINT`** (no `INTEGER`, no `SERIAL`).
- Discrepancias acá causan fallos en runtime cuando la app intenta hacer joins.
- En este schema casi todas las PKs principales son `BIGINT GENERATED ALWAYS AS IDENTITY`. Verificar con `grep -E "GENERATED.*IDENTITY" database.sql`.

#### 12.4. Idempotencia y nomenclatura

- Toda nueva tabla: `CREATE TABLE IF NOT EXISTS nombre_tabla (...)`.
- Constraints de FK con **nombres explícitos**: `CONSTRAINT fk_<tabla>_<referencia>`.
- Considerar `ON DELETE CASCADE` cuando preserve la integridad lógica (ej. borrar todos los favoritos de un usuario eliminado).

#### 12.5. Formato de salida cuando se entrega un cambio

Cuando entregás código actualizado, **devolvé únicamente el bloque `CREATE TABLE` completo y modificado**, listo para reemplazar el bloque antiguo. No mostrar diffs ni fragmentos.

#### 12.6. Schema `ecom.` explícito en TODAS las queries y tablas nuevas

**Regla:** todas las queries y todos los `CREATE TABLE` nuevos deben referenciar las tablas con el prefijo `ecom.` explícito.

✅ **SÍ:**
```sql
SELECT * FROM ecom.customer WHERE cus_id = $1;
INSERT INTO ecom.publications_comments (...) VALUES (...);
CREATE TABLE IF NOT EXISTS ecom.new_table (...);
CONSTRAINT fk_x FOREIGN KEY (cus_id) REFERENCES ecom.customer(cus_id);
```

❌ **NO:**
```sql
SELECT * FROM customer ...;
CREATE TABLE IF NOT EXISTS new_table (...);
REFERENCES customer(cus_id);  -- sin schema
```

**Por qué:**
1. El `search_path` de PostgreSQL puede variar entre entornos (dev / staging / prod / contenedor / RDS). Un CREATE sin prefijo cae donde se le antoje al search_path actual, y termina con tablas en `public` que el resto del backend no encuentra (porque las queries SÍ usan `ecom.`).
2. Hay tablas legacy en `database.sql` que se crearon sin prefijo (`publications`, `customer`, `messages`, `publications_comments`, etc.). Probablemente viven en `ecom` por search_path, pero **no las toques** — el riesgo de migración es alto. Lo que SÍ se debe hacer es que las **nuevas** tablas, queries, y FKs usen `ecom.` siempre.
3. Las FKs sin prefijo son la causa más común de bugs silenciosos: una nueva tabla con `REFERENCES customer(cus_id)` puede crearse OK en un entorno y fallar en otro.

**Aplica también a:**
- INSERT / UPDATE / DELETE en queries del backend.
- Subqueries.
- JOIN clauses.
- FK constraints.
- Triggers / funciones (si se llegaran a usar).

**Excepción razonable:** referencias dentro de un CTE o subquery a una CTE local — esa no es una tabla del schema.

### Workflow obligatorio cuando se toca la BD

1. **Leer `database.sql` ANTES de proponer cualquier cambio.** No asumir nombres ni tipos de columnas.
2. Verificar si la columna o tabla ya existe (auditoría 12.2).
3. Si la columna existe con otro nombre/tipo, ajustar el plan para usar el existente.
4. Modificar el `CREATE TABLE` correspondiente (regla 12.1).
5. Si hay BD ya poblada en dev, generar SQL de migración separado (no entra en `database.sql`).
6. Actualizar MIGRATION.md §9 con: cambio aplicado al `database.sql` + SQL de migración para entornos existentes.

---

> Este archivo se actualiza cuando una regla cambia o se agrega una convención nueva. Las modificaciones van en el mismo PR donde se aplican.
