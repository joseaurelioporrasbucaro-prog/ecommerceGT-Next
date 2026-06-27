# Kiosqui — Solicitud a Claude Design: Empresa (lado dueño) — `/company` + `/company/equipo`

**Para:** Claude Design · **De:** Claude Code (vía Aurelio) · Rama `design/kiosqui-system`.
**Propósito:** artboards + markup para las **dos pantallas del DUEÑO de la empresa**, que hoy
están re-skineadas **a criterio (sin mockup)**. El perfil **público** de empresa (`/empresa/[id]`)
ya quedó on-brand en Batch E; estas son las internas de gestión.

## ⚠️ Recordatorio operativo
**Commitear los entregables en la rama** (`batch_g/*.jsx` + el `.html` + el handoff). Los agentes
que aplican corren en un *worktree*; si quedan sin commitear, no los ven (lección de Batch E).

## Sistema de diseño (usar lo ya implementado)
- Tokens `--navy-*`, `--lav-*`, `--green-*`, `--surface`, `--fg-*`, `--border`, `--danger`,
  `--warning-bg`, `--r-lg/md/sm/pill`, `--shadow-*`, `--font-display/body`.
- Primitivas globales: `.kq-card`, `.kq-btn` (+`--action` verde / `--outline` / `--ghost` / `--sm`),
  `.kq-input`, `.kq-badge` (+`--lav`/`--green`/`--navy`/`--warn`), `.kq-chip`.
- **Referencias visuales ya shipeadas**: el **perfil público de empresa** (`CompanyProfileMain`:
  portada navy→lavanda, foto con marco blanco, check VERDE, stats, tabs) y el **portal staff**
  (`StaffShell` + `DataTable` de Batch F) por si la gestión de equipo conviene como tabla densa.

## Pantallas a diseñar

### 1. `/company` — "Mi empresa" (dashboard del dueño) · `CompanyMain.tsx`
Lo que maneja hoy:
- **Card de datos de la empresa**: logo (con acción **"Cambiar logo"**, sube imagen), **nombre legal**,
  **nombre comercial**, **dirección**, **teléfono**, checkbox **"mostrar empleados"** en el perfil público.
- Botón **"Guardar cambios"**.
- Acceso a **gestionar equipo** (link a `/company/equipo`).
- **Estados**: usuario **sin empresa** (mensaje + CTA "Ver planes"), y **no logueado** (prompt de login).
- Decisión de diseño: ¿usar la misma **portada navy→lavanda + foto con marco blanco** del perfil
  público para que se sienta consistente, o un dashboard de cards más sobrio? (recomendaría reusar
  la identidad del perfil público arriba + cards de edición debajo).

### 2. `/company/equipo` — Gestión de equipo · `CompanyTeamMain.tsx`
Lo que maneja hoy:
- **Slots del plan**: "X de Y miembros" (cuántos puede invitar según su plan).
- **Lista de miembros**: avatar + nombre + email + **rol** (Admin / miembro) + **límite de
  publicaciones por miembro** (input editable + guardar) + acción **quitar/expulsar** (rojo).
- **Invitar**: (a) **buscar un usuario existente** por nombre/@handle y agregarlo; (b) **invitar por
  email**.
- **Invitaciones pendientes**: lista con acción **cancelar**.
- **Gating**: solo un **admin** del equipo puede gestionar (los no-admin ven solo lectura / aviso).
- Decisión: ¿lista de miembros como **tabla densa** (estilo `DataTable` de Batch F) o como **cards**
  (estilo empleados del perfil público)? El límite-por-miembro y las acciones empujan a tabla.

## Decisiones a tomar (Design)
1. Identidad de `/company`: ¿reusa portada+foto del perfil público, o dashboard de cards?
2. Equipo: ¿tabla densa (Batch F) o cards? Mapeo de **rol** (Admin lavanda / miembro neutral) y
   **estado de invitación** (pendiente = `--warning-bg`).
3. Layout del bloque "Invitar" (buscar usuario vs invitar por email) — ¿tabs, dos columnas, o
   un solo input con toggle?
4. Light/dark.

## Formato de entrega (consistente con batches previos)
- `Batch G - Empresa (dueño).html` (artboards light+dark).
- `batch_g/*.jsx` (markup de referencia).
- `NN-HANDOFF-EMPRESA-DUEÑO.md` con specs por pantalla.
- **Commiteado en la rama.**

## Constraints técnicos (para que el handoff sea aplicable)
- **Solo skin + markup**: preservar toda la lógica (React Query, mutations de invitar/expulsar/
  cambiar límite/cancelar, gating por admin, subida de logo). No inventar datos.
- next-intl: reusar el namespace existente; copy nuevo en **voseo guatemalteco** (es) + en.
- styled-jsx scope gotcha → `:global()` para hijos/`<Link>`/`<Image>`. `.kq-card` recorta overflow
  (si una foto debe sobresalir, `overflow:visible`).
