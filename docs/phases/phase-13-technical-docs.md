# Fase 13 — Documentación técnica

> **Para:** Codex / cualquier ejecutor.
> **De:** Claude (arquitecto).
> **Fecha:** 2026-06-04.
> **Repos involucrados:** `ecommerceGTBackEnd` y `ecommerceGT-Next`.

## Objetivo

Generar la documentación técnica que falta para que un dev nuevo (ej. cmiche, julio, o alguien que se sume al equipo) pueda **levantar el proyecto, entender la arquitectura y empezar a contribuir en 1 día**.

Hoy hay docs dispersas: AGENTS.md (reglas), MIGRATION.md (bitácora histórica), TEST_PLAN.md, GIT_GUIDE.md, phases/. Falta:

- **API reference** (128 endpoints sin documentar formalmente)
- **Schema reference** (41 tablas sin ER diagram ni resumen)
- **Onboarding guide** (los archivos existentes asumen contexto)
- **README expandido** en ambos repos
- **Glosario del dominio** (KIOSQUI, publicación, amenidad, etc.)

## Pre-requisitos

- Fase 20 cerrada (CI en verde) — listo.
- `node ≥ 18`, `git`.
- Acceso de lectura a ambos repos.

## Inventario (estado actual)

### Backend (`ecommerceGTBackEnd`)
- `README.md` — minimalista. Solo tiene sección de tests (de la Fase 20).
- `database.sql` — 41 tablas, ~1500 líneas, con comentarios `// Codigo Aurelio` por fase.
- `server.js` — 128 endpoints, ~700 líneas.
- `config/connPostgresDB.js` — ~5400 líneas con TODA la lógica de negocio.
- **Sin** carpeta `docs/`.
- **Sin** ER diagram.
- **Sin** API reference formal.

### Frontend (`ecommerceGT-Next`)
- `README.md` — del template scaffold original, genérico.
- `AGENTS.md` — reglas inmutables (no tocar).
- `MIGRATION.md` — bitácora extensa de fases, fuente de verdad histórica.
- `docs/`:
  - `GIT_GUIDE.md` (Fase pasada)
  - `TEST_PLAN.md` (Fase 20)
  - `PENDING_PHASE_BRAND_KIOSQUI.md` (legacy)
  - `phases/` (Fase 20+)
- `src/` con ~18 carpetas, ~18 rutas en `app/`.

## Cambios planificados

### Backend — `ecommerceGTBackEnd/`

#### `README.md` — expandir
Estructura final mínima (sin reemplazar la sección de tests existente):

```markdown
# ecommerceGT — Backend

API REST en Node.js + Express + PostgreSQL para KIOSQUI (marketplace inmobiliario GT).

## Quick start
1. Clonar repo
2. `npm install`
3. Copiar `.env.example` a `.env`, llenar credenciales
4. Crear BD: `psql -U <user> -c "CREATE DATABASE ecommercedb"`
5. Cargar schema: `psql -U <user> -d ecommercedb -f database.sql`
6. `npm run dev`

API corriendo en http://localhost:4000

## Variables de entorno
| Variable | Descripción | Default |
|---|---|---|
| HOSTDB | Postgres host | localhost |
| PORTDB | Postgres port | 5432 |
| ... | ... | ... |

(Listar TODAS las vars del .env actual — buscar `process.env.` en el código.)

## Estructura
```
.
├── server.js              # Entrypoint + 128 endpoints HTTP
├── config/
│   └── connPostgresDB.js  # Pool de PG + toda la lógica de queries
├── utils/
│   └── bcryptRounds.js    # Helper para cost factor configurable
├── database.sql           # Schema completo (41 tablas)
├── docs/                  # ← NUEVO en esta fase
│   ├── API_REFERENCE.md
│   ├── SCHEMA.md
│   ├── ONBOARDING.md
│   └── GLOSSARY.md
└── tests/                 # Vitest + supertest
```

## Tests
(la sección actual se mantiene tal cual)

## Documentación detallada
- [docs/API_REFERENCE.md](docs/API_REFERENCE.md) — todos los endpoints
- [docs/SCHEMA.md](docs/SCHEMA.md) — esquema de BD + ER diagram
- [docs/ONBOARDING.md](docs/ONBOARDING.md) — guía para devs nuevos
- [docs/GLOSSARY.md](docs/GLOSSARY.md) — términos del dominio

## Despliegue
Render (auto-deploy desde `master`). Variables de entorno configuradas en el dashboard. BD provista por Render Postgres.

## Convenciones
Ver `AGENTS.md` en frontend para reglas inmutables del proyecto.
```

#### `docs/API_REFERENCE.md` (nuevo)
Documentar los 128 endpoints. Codex debe:

1. **Parsear `server.js`** extrayendo cada línea `app.get/post/put/delete/patch(...)`.
2. **Para cada endpoint** generar una fila con:
   - Método HTTP
   - Ruta
   - Auth required (sí si hay `authMiddleware`, no si no)
   - Handler (nombre de la función en `connPostgresDB.js`)
   - Línea de definición en `server.js`
   - Descripción de 1 línea (extraer del comentario `// Codigo Aurelio` que esté arriba, o de un primer comentario que encuentre antes)
3. **Agrupar por feature** según las fases (ver MIGRATION.md). Ejemplo de grupos:
   - Auth & Account (login, register, recovery, deactivation)
   - Publications (CRUD, search, ranking)
   - Comments & Forum
   - Amenities (Fase 19.5)
   - Sellers (top sellers, ranking)
   - Subscriptions / Plans
   - Companies / Teams
   - Verifications (DPI/NIT)
   - Support (users, tickets, verifications, reports)
   - Admin (config, site assets)
   - Ad Campaigns / Pauta
   - Payment Methods
   - Notifications
   - Misc (uploads, viewer)

Formato sugerido por grupo:

```markdown
## Auth & Account

| Método | Ruta | Auth | Handler | Descripción |
|---|---|---|---|---|
| POST | `/login` | público | `login()` | Login con email+password. 5 intentos fallidos → bloqueo 30 min (Fase 8.3.3). |
| POST | `/register` | público | `register()` | Crear cuenta nueva con verificación por email. |
| POST | `/recoverypass` | público | `recoveryPwd()` | Solicitar reset de password. Rechaza 429 si cuenta bloqueada por intentos. |
| ... | ... | ... | ... | ... |
```

Para endpoints con shape complejo de request/response, agregar bloque separado **solo si es útil**:

```markdown
### POST /login

**Request:**
```json
{ "email": "string", "password": "string" }
```

**Response 200:**
```json
{ "message": "Bienvenido user@example.com !!", "idpwd": 1 }
```
Setea cookie `token` (JWT, httpOnly, 1h).

**Response 400 (nearLockout, intento 4):**
```json
{ "message": "...", "nearLockout": true, "attemptsRemaining": 1 }
```

**Response 403 (passwordLocked, intento 5+):**
```json
{ "message": "...", "passwordLocked": true, "minutesRemaining": 30 }
```
```

**Decisión:** documentar shapes solo para endpoints "interesantes" — los que devuelven flags especiales, manejan estados complejos, o son críticos. Los CRUD simples van solo en la tabla.

#### `docs/SCHEMA.md` (nuevo)
Documentación de las 41 tablas:

1. **ER diagram en Mermaid** (GitHub lo renderiza nativo):
   ```mermaid
   erDiagram
     customer ||--o{ publications : "publica"
     customer }o--|| business : "pertenece"
     publications ||--o{ publications_amenities : "tiene"
     cat_amenities ||--o{ publications_amenities : "es"
     ...
   ```
   Codex: parsear `database.sql` extrayendo todas las FK (`REFERENCES table(column)`) y generar el diagrama Mermaid de relaciones principales. NO incluir tablas catálogo en el diagrama (cat_country, cat_city, etc.) para que sea legible — listarlas aparte.

2. **Tabla resumen de todas las tablas:**
   ```markdown
   | Tabla | Filas (~) | Para qué | Fase origen |
   |---|---|---|---|
   | `customer` | usuarios | Cuentas de usuarios | Fase 1 |
   | `publications` | propiedades | Listings de inmuebles | Fase 1 |
   | `cat_amenities` | 26 | Catálogo de comodidades | Fase 19.5 |
   | ... | ... | ... | ... |
   ```

3. **Bloque por tabla principal** (no todas, las ~15 más usadas) con columnas + descripción breve:
   ```markdown
   ### `customer`
   Cuenta de usuario. PK `cus_id`.
   | Columna | Tipo | Notas |
   |---|---|---|
   | `cus_id` | BIGINT IDENTITY | PK |
   | `cus_user_name` | varchar(50) | Email para login (sí, está mal llamado, legacy) |
   | `cus_role` | varchar(20) | `user`\|`support`\|`admin` (Fase 8.2) |
   | `cus_account_status` | varchar(20) | `active`\|`banned`\|`suspended`\|`inactive`\|`pending_deletion`\|`deleted` |
   | `passta_id` | INT | Legacy: `1`=activo, `2`=bloqueado por intentos fallidos (Fase 8.3.3) |
   | ... |
   ```

4. **Diagrama de subsistemas** — agrupación visual de tablas por dominio:
   - Auth & Account: `customer`, `customer_audit_log`, `cat_password_status`
   - Publications: `publications`, `publications_detail`, `publications_amenities`, `cat_amenities`
   - Forum / Comments: `publications_comments`, `comment_likes`
   - etc.

#### `docs/ONBOARDING.md` (nuevo)
Guía paso a paso para un dev que se acaba de unir al equipo:

```markdown
# Onboarding — KIOSQUI Backend

Bienvenido. Pasos para arrancar en 1 día.

## Día 0 — Setup
1. Cloná los 2 repos (backend + frontend)
2. Postgres corriendo localmente
3. Seguí el Quick Start del README
4. Verificá que `npm run dev` arranque sin errores

## Día 0.5 — Contexto
Leé en este orden:
1. `AGENTS.md` (frontend) — reglas inmutables
2. `MIGRATION.md` (frontend) — bitácora completa, todas las fases
3. `docs/API_REFERENCE.md` (backend) — los endpoints
4. `docs/SCHEMA.md` (backend) — las tablas
5. `docs/GLOSSARY.md` (backend) — términos del dominio

## Día 1 — Primera contribución
1. Buscá una fase pendiente en MIGRATION.md o un `// TODO` en código
2. Creá branch `feat/<tu-nombre>-<feature>`
3. Implementá + tests (ver `docs/TEST_PLAN.md` frontend)
4. PR a `develop` (NO directo a main/master)
5. Pedí review

## Cosas que no son obvias
- El backend está en CommonJS (no ES modules)
- TODO el código de queries vive en `config/connPostgresDB.js` (sí, archivo gigante; intencional)
- Hay 2 sistemas paralelos de bloqueo de cuenta: `passta_id` (intentos fallidos) y `cus_account_status` (sanciones de soporte) — ver GLOSSARY
- El email del usuario vive en `cus_user_name` (sí, mal llamado)
- Los seeds importantes están en `database.sql` mezclados con el schema

## Quién me ayuda
- Aurelio (líder) — decisiones de arquitectura
- cmiche, julio — equipo
- AGENTS.md sección §12 — reglas para tocar la BD
```

#### `docs/GLOSSARY.md` (nuevo)
Términos del dominio que aparecen en código:

```markdown
# Glosario — KIOSQUI

## Dominio
- **KIOSQUI** — marca de la plataforma (real estate marketplace GT)
- **Publicación / publication** — listing de un inmueble en venta o renta
- **Vendedor / seller** — usuario que publica inmuebles
- **Amenidad / amenity** — característica de un inmueble (Piscina, Gimnasio, etc.). 26 catalogadas.
- **Pauta / campaña** — sistema de publicidad pagada para destacar publicaciones
- **DPI / NIT / RTU** — documentos guatemaltecos de identificación (personal / empresa)
- **Apelación** — flujo donde un usuario suspendido por soporte puede defender su caso

## Técnico
- **passta_id** — Password Status ID, columna legacy en `customer`. `1`=activo, `2`=bloqueado por intentos. Coexiste con `cus_account_status` (que opera soporte).
- **cus_account_status** — Estado moderno de la cuenta. Valores: `active`, `banned`, `suspended`, `inactive`, `pending_deletion`, `deleted`.
- **Fase X.Y** — unidad de trabajo en MIGRATION.md. Cada fase entrega un feature cerrado.
- **T-NN** — ID estable de un caso de prueba en TEST_PLAN.md. NUNCA se renumera.
- **Marcador `// Codigo Aurelio`** — convención del backend para señalar lógica añadida durante la migración (no del scaffold original).

## Roles
- **user** — usuario normal de la plataforma
- **support** — staff de soporte (tickets, verificaciones, denuncias)
- **admin** — soporte + config de plataforma + imágenes del sitio

## Estados de publicación (pubsta_id)
- 1: borrador
- 2: activa
- 3: vendida
- 4: anulada
- 5: pausada por solicitud de eliminación de cuenta (Fase 12.1)
```

### Frontend — `ecommerceGT-Next/`

#### `README.md` — expandir
Mantener lo del template original como referencia pero agregar:

```markdown
# KIOSQUI — Frontend

Next.js 13 + TypeScript + React Query.

## Quick start
(igual que backend pero `npm run dev` en localhost:3000)

## Variables de entorno
- `NEXT_PUBLIC_API_URL` — URL del backend (default localhost:4000)

## Estructura
```
src/
├── app/                 # Next 13 App Router. Una carpeta = una ruta.
│   ├── publications/    # /publications + /publications/[id]
│   ├── soporte/         # Portal de soporte (gate por rol)
│   ├── admin/           # Portal de admin (gate por rol)
│   ├── creator-profile/ # Perfil público de vendedor
│   └── ...
├── components/          # Componentes React por feature
│   ├── publications/
│   ├── support/
│   ├── admin/
│   └── ...
├── hooks/api/           # React Query hooks (uno por endpoint)
├── types/api.ts         # Tipos TypeScript de payloads/responses
├── utils/
│   ├── Api.ts           # ApiFetch (wrapper de fetch con cookies)
│   └── AuthContext.tsx  # Context global del usuario logueado
├── layout/              # Header, sidebar, footer
└── elements/            # Componentes genéricos del template
```

## Convenciones
- Un endpoint = un hook en `src/hooks/api/useX.ts` que devuelve `useQuery` o `useMutation` de React Query
- Tipos de payload/response → `src/types/api.ts`
- "use client" obligatorio en componentes que usan hooks/estado
- Páginas en `app/` deben envolver con `<Wrapper>` (DefaultWrapper o variantes)

## Documentación adicional
- [AGENTS.md](AGENTS.md) — reglas inmutables del proyecto (LEER PRIMERO)
- [MIGRATION.md](MIGRATION.md) — bitácora histórica completa
- [docs/TEST_PLAN.md](docs/TEST_PLAN.md) — batería de tests
- [docs/GIT_GUIDE.md](docs/GIT_GUIDE.md) — flujo de git
- [docs/phases/](docs/phases/) — planes activos y archivados
- [Backend API Reference](../ecommerceGTBackEnd/docs/API_REFERENCE.md) — endpoints
```

#### `docs/FRONTEND_STRUCTURE.md` (nuevo)
Tour más detallado de cada carpeta de `src/`:
- Para cada carpeta, 2-5 líneas: propósito + ejemplos de archivos típicos
- Convenciones de naming (PascalCase componentes, kebab-case rutas, camelCase hooks)
- Patrones recurrentes:
  - Cómo se hace un fetch (`useX` hook + `ApiFetch`)
  - Cómo se autentica una página (chequeo de `useAuth()`)
  - Cómo se gate-ea por rol (`user?.role === 'admin'`)
  - Cómo se internacionaliza (no implementado todavía — Fase 14)

### Documentación cross-repo

#### `docs/ARCHITECTURE.md` (en frontend, único)
Diagrama top-level del sistema:

```
┌──────────────────┐  REST + cookies  ┌──────────────────┐
│  Next.js 13      │ ───────────────► │  Express + pg    │
│  React Query     │ ◄─────────────── │  JWT httpOnly    │
│  localhost:3000  │                  │  localhost:4000  │
└──────────────────┘                  └─────────┬────────┘
                                                │ pg.Pool
                                                ▼
                                      ┌──────────────────┐
                                      │  PostgreSQL      │
                                      │  schema: ecom    │
                                      │  41 tablas       │
                                      └──────────────────┘
```

Con explicación corta de cada capa.

#### Cross-references entre repos
En cada README mencionar el repo hermano con link al GitHub.

## Decisiones de diseño

### D-1: Generación de API_REFERENCE automática vs manual

- **Opción A — Generación con script.** Codex escribe un script `scripts/gen-api-ref.js` que parsea `server.js` y produce el .md.
- **Opción B — Generación manual una vez, mantener a mano.**

**Recomendación:** **B**. Razón: 128 endpoints suena mucho pero la mayoría son CRUDs simples documentables en 1 línea. Un script complica más de lo que ahorra (parseo de comentarios, agrupación por fase, manejo de casos edge). Mejor invertir 2h en hacerlo a mano + asumir que cada fase nueva tiene que actualizarlo (regla en AGENTS.md §X).

### D-2: ER diagram — Mermaid vs imagen

- **Opción A — Mermaid**. GitHub lo renderiza nativo. Editable como texto.
- **Opción B — Imagen exportada** desde dbdiagram.io o similar.

**Recomendación:** **A**. Mantenible en PR diffs, no requiere herramientas externas. Si crece mucho, se puede dividir en varios diagramas por subsistema.

### D-3: Granularidad de SCHEMA.md

Documentar las 41 tablas con MISMO nivel de detalle sería overkill. Tabla resumen para todas, bloques expandidos solo para las "core" (~15 tablas más usadas).

**Cores a expandir (sugerencia inicial):**
`customer`, `business`, `publications`, `publications_detail`, `cat_amenities`, `publications_amenities`, `subscriptions`, `customer_follows`, `seller_ratings`, `publications_comments`, `tickets`, `ticket_messages`, `verification_requests`, `ad_campaigns`, `customer_payment_methods`.

### D-4: Ubicación de docs cross-repo

Hay 2 opciones para `ARCHITECTURE.md`:
- En frontend (junto con MIGRATION.md que ya es fuente de verdad del proyecto)
- En backend (más cerca del schema)

**Recomendación:** **frontend** (donde ya viven MIGRATION.md, AGENTS.md). Un solo lugar para "fuente de verdad". El backend solo tiene su README + docs/ específicos del backend.

### D-5: ¿Versionar los .md o usar wiki de GitHub?

- **Opción A — Versionar en repo** (lo que se viene haciendo).
- **Opción B — Mover a wiki de GitHub.**

**Recomendación:** **A**. Mantener en repo permite:
- PRs que actualizan código + docs juntos
- Búsqueda con `grep` local
- Funciona offline
- No hay sync con el repo

## Criterios de aceptación

Codex marca con `[x]` cuando completa cada uno:

### Backend (`ecommerceGTBackEnd/`)
- [ ] `README.md` expandido (mantiene la sección de tests existente, agrega Quick start + env vars + estructura)
- [ ] `docs/` creado
- [ ] `docs/API_REFERENCE.md` con tabla de los 128 endpoints agrupados por feature
- [ ] Endpoints "interesantes" (auth, payments, support, admin) con bloque expandido de request/response
- [ ] `docs/SCHEMA.md` con ER diagram Mermaid + tabla resumen 41 tablas + bloques expandidos ~15 cores
- [ ] `docs/ONBOARDING.md` con guía Día 0 / Día 0.5 / Día 1
- [ ] `docs/GLOSSARY.md` con términos de dominio + técnicos + roles + estados

### Frontend (`ecommerceGT-Next/`)
- [ ] `README.md` expandido (mantiene info del template original, agrega Quick start + estructura + convenciones)
- [ ] `docs/FRONTEND_STRUCTURE.md` con tour de cada carpeta de `src/`
- [ ] `docs/ARCHITECTURE.md` con diagrama top-level + descripción de capas
- [ ] Cross-references entre los 2 READMEs

### MIGRATION.md
- [ ] Sección "Fase 13" agregada con bitácora de lo que se documentó

### Quality bar
- [ ] Cero código nuevo (solo documentación)
- [ ] Cero cambios funcionales
- [ ] Tests siguen pasando (`npm test` en backend)
- [ ] Cero linkrot — todos los links internos resuelven
- [ ] Diagramas Mermaid se renderizan correctamente (verificar con preview de GitHub)

## Riesgos / edge cases

| Riesgo | Mitigación |
|---|---|
| Docs envejecen al ritmo del código | Convención: "cada PR que toca un endpoint actualiza API_REFERENCE.md". Agregar a AGENTS.md como regla. |
| API_REFERENCE.md gigante / ilegible | Agrupar por feature/subsistema, no por orden alfabético. TOC al inicio. |
| ER diagram con 41 tablas es ilegible | Separar en sub-diagramas por dominio (auth / publications / support / etc.). |
| Codex inventa shapes de response que no son reales | Codex DEBE basar cada shape en `response.status(...).json(...)` real del código. Si no encuentra el shape, dejarlo como TODO en vez de inventar. |
| Diff gigante | Commit por archivo (no un commit con 8 archivos). |

## Out of scope (NO hacer en esta fase)

- ❌ Documentar TODAS las 41 tablas en detalle (solo las ~15 cores expandidas)
- ❌ Storybook para componentes
- ❌ Diagramas elaborados (C4 model, sequence diagrams complejos)
- ❌ Tutorial videos
- ❌ Traducción al inglés (Fase 14 — i18n)
- ❌ Auto-generación de API_REFERENCE con script (decisión D-1)
- ❌ Cambios funcionales en código
- ❌ Refactor de carpetas que no se entienden — primero documentarlas, después decidir refactor

## Estimación

- README backend expandido: ~30min
- API_REFERENCE.md: ~2h (lo más costoso por volumen)
- SCHEMA.md (ER + resumen + cores): ~1.5h
- ONBOARDING.md: ~30min
- GLOSSARY.md: ~30min
- README frontend expandido: ~30min
- FRONTEND_STRUCTURE.md: ~45min
- ARCHITECTURE.md: ~30min
- Cross-references + MIGRATION.md: ~15min

**Total: ~6-7h para Codex.** Si pasa de 10h, escalar a Claude vía Aurelio.

## Handshake — qué reportar al cerrar la fase

Codex commit messages (uno por archivo principal, NO un mega-commit):

```
docs(fase13): backend README expandido + estructura
docs(fase13): API_REFERENCE.md con 128 endpoints agrupados
docs(fase13): SCHEMA.md con ER Mermaid + 15 tablas core
docs(fase13): ONBOARDING.md + GLOSSARY.md (backend)
docs(fase13): frontend README + FRONTEND_STRUCTURE.md
docs(fase13): ARCHITECTURE.md cross-repo
docs(fase13): cierre en MIGRATION.md

ref docs/phases/phase-13-technical-docs.md
Tiempo total: Xh
Decisiones aplicadas: D-1=B, D-2=A, D-3={lista cores reales}, D-4=A, D-5=A
Bloqueos: ninguno / lista de cosas que requirieron decisión sobre la marcha
```

Eso le da a Claude el contexto para hacer el code review file-by-file.

---

## Recursos para Codex

- Para parsear endpoints de `server.js`: `grep -E "^app\.(get|post|put|delete|patch)" server.js`
- Para listar funciones exportadas de `config/connPostgresDB.js`: ver `module.exports` al final del archivo
- Para listar FKs de `database.sql`: `grep -E "REFERENCES" database.sql`
- Para tablas: `grep -E "^CREATE TABLE" database.sql`
- Mermaid ER diagram cheatsheet: https://mermaid.js.org/syntax/entityRelationshipDiagram.html
