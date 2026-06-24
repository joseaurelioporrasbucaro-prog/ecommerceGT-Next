# Kiosqui — Solicitud a Claude Design: Portal de Soporte (staff) + Admin

**Para:** Claude Design · **De:** Claude Code (vía Aurelio) · Rama `design/kiosqui-system`.
**Propósito:** pedir los artboards + markup para re-skinear la **última gran área**
del rebrand: el **portal interno de soporte/staff** y el **panel de admin**. El landing
público `/soporte` ya quedó on-brand en Batch B; esto es lo de adentro (colas, tablas,
gestión).

---

## ⚠️ Lección operativa — por favor commitear los entregables al repo
Los agentes que **aplican** el handoff corren en un *git worktree*. Si los mockups
(`batch_X/*.jsx`, el `.html`, el `NN-HANDOFF.md`) quedan **sin commitear** en el checkout
principal, **no llegan al worktree y los agentes no los ven**. Nos pasó con Batch E: el
perfil de empresa salió con breadcrumb de más y la foto sin "flotar" hasta que comparé a
mano contra `CompanyScreen.jsx`. → **Commiteá `batch_f/` + el HTML + el handoff** en la
rama para que la aplicación sea fiel.

---

## Sistema de diseño ya implementado (usar esto, no reinventar)
- **Tokens** (CSS vars, claro/oscuro auto): `--navy-600/700/800/900`, `--lav-100…700`,
  `--green-100…900`, `--surface`, `--surface-sunk`, `--bg`, `--cream`, `--fg-strong/muted/subtle`,
  `--border`, `--border-strong`, `--danger`, `--danger-bg`, `--warning-bg`, `--accent`(=lav-500),
  `--accent-hover`, `--rating`, `--action`/`--on-action`, `--r-lg/md/sm/pill`, `--shadow-xs/sm/md/focus`,
  `--font-display`, `--font-body`.
- **Primitivas globales** (`src/style/kiosqui/components.css`): `.kq-card` (ojo: tiene
  `overflow:hidden`), `.kq-btn` + `--action`(verde)/`--outline`/`--ghost`/`--sm`/`--lg`,
  `.kq-input` (+`--error`), `.kq-badge` + `--green`/`--lav`/`--navy`/`--solid`/`--warn`, `.kq-chip`.
- **Patrones ya usados**: banda/`PageHead` de cabecera, cards de superficie, chips de estado,
  tabs subrayadas (activo = borde verde + pill lavanda de conteo), avatares de gradiente navy
  con `@handle` en `--accent-hover`, estrellas/acciones en verde.
- **Tono:** esta es un área **interna/staff** → puede ser más **densa y utilitaria** que el
  público (tablas, filtros, mucha data), pero on-brand. Light **y** dark obligatorios.

---

## Pantallas a diseñar (ruta · componente · qué es · estado actual)

1. **Mis tickets** — `/soporte/tickets` · `MyTicketsMain.tsx` (130) · lista de los tickets
   **propios** del usuario con su estado. i18n `support.myTickets` = "Mis tickets de soporte".
   Hoy usa colores Oction (`--clr-theme-*`).
2. **Cola de tickets (staff)** — `/soporte/tickets-admin` · `SupportTicketsMain.tsx` (117) ·
   **tabla** de todos los tickets con **filtros por estado**, **asignación** (hay lógica de
   round-robin / assignee) y badges de estado/assignee. i18n `support.tickets`/`assignee`/
   `statusFilter`/`table`/`pagination`.
3. **Detalle de ticket** — `TicketDetailMain.tsx` (152) · **hilo** de mensajes del ticket
   (staff ↔ usuario), cambio de estado, asignar, responder. i18n `support.ticketDetail`.
4. **Verificaciones** — `SupportVerificationsMain.tsx` (227) · **cola** de solicitudes de
   verificación de identidad (DPI: frente/reverso), **aprobar/rechazar**, ver documentos.
   i18n `support.verifications`. (Conecta con la tab "Verificar cuenta" del usuario.)
5. **Reportes/denuncias** — `SupportReportsMain.tsx` (300) · publicaciones **denunciadas**,
   revisar y resolver. i18n `support.reports`.
6. **Usuarios** — `SupportUsersMain.tsx` (332) · **gestión de usuarios**: estados de cuenta
   (`accountStatus`), roles, acciones. i18n `support.users`.
7. **Admin · Configuración** — `/admin` · `AdminConfigMain.tsx` (433) · parámetros del sistema.
   ⚠️ tiene **`#2785ff` hardcodeado** (azul Oction) que hay que sacar. i18n namespace `admin`.
8. **Admin · Imágenes** — `AdminImagesMain.tsx` (197) · gestión de imágenes/banners del sitio.
- **Compartido:** `support/Pagination.tsx`.

---

## Componentes de sistema que probablemente hacen falta (pedimos specs)
- **Data table densa**: header (¿sticky?), hover de fila, acciones por fila, zebra opcional,
  y **comportamiento mobile** (¿colapsa a cards o scroll horizontal?). Es el componente más
  repetido (tickets, verificaciones, reportes, usuarios).
- **Chips de estado** mapeados a tokens — definir el **mapeo exacto de color** para cada set:
  - Ticket: abierto / en progreso / resuelto / cerrado (+ ¿pendiente?).
  - Verificación: pendiente (`--warning-bg`) / aprobado (verde) / rechazado (`--danger`).
  - Cuenta de usuario: activo / suspendido / baneado.
- **Barra de filtros** (selects/segmented + búsqueda + paginación) consistente con el listado.
- **Assignee**: avatar navy + nombre; control para **asignar/reasignar** (y el estado "sin asignar").
- **Badges de rol** (admin / agente / usuario) con su color.
- **Hilo de ticket** (mensajes staff vs usuario diferenciados, estilo conversación interna).
- **Toolbar de acciones** del detalle (asignar, cambiar estado, resolver, responder).
- **Estados vacío / cargando / error** de tablas + **paginación** on-brand.
- **Nav del portal staff**: ¿sidebar lateral o tabs para Tickets / Verificaciones / Reportes /
  Usuarios / Admin? (definir).

## Decisiones que necesitamos de Design
1. Densidad de tabla (staff compacta).
2. Mapeo de color de cada set de estados (arriba).
3. Mobile de las tablas: ¿cards o scroll-x?
4. Navegación del portal: ¿sidebar o tabs?
5. Badges de rol y assignee (color + forma).
6. Light/dark de tablas y chips.

## Formato de entrega (consistente con batches previos)
- `Batch F - Soporte y Admin.html` (artboards light + dark).
- `batch_f/*.jsx` (markup de referencia por pantalla + el data-table/chips/filtros).
- `NN-HANDOFF-SOPORTE-ADMIN.md` con specs por pantalla.
- **Todo commiteado en la rama** (ver la lección de arriba).

## Constraints técnicos (para que el handoff sea aplicable tal cual)
- **Solo skin + markup**: preservar TODA la lógica (React Query, mutations de
  asignación/estado/aprobación, gating por rol, filtros, paginación). No inventar datos:
  si un dato (rol, rating, etc.) no existe en el endpoint, se omite y se anota.
- **next-intl**: los namespaces `support` y `admin` ya existen con muchas keys
  (`status`, `statusFilter`, `accountStatus`, `filters`, `assignee`, `categories`, `table`,
  `pagination`, `myTickets`, `tickets`, `ticketDetail`, `reports`, `users`, `verifications`).
  Reusar keys; copy nuevo en **voseo guatemalteco** (es) + en.
- **styled-jsx**: cuidado con el *scope gotcha* — reglas scopeadas NO aplican a markup de
  componentes hijos/separados, a JSX en `const` fuera del `return`, ni a `className` de
  `<Link>`/`<Image>` → usar `:global()`. Nunca backticks dentro de comentarios CSS de un
  `<style jsx>{` … `}`. `.kq-card` recorta overflow (si algo debe sobresalir, `overflow:visible`).
- Un solo bloque `<style jsx>` por componente.

---

Cuando esté el Batch F commiteado, Claude Code lo aplica por chunks con verificación
adversarial (lógica + on-brand + scope) y `tsc --noEmit && next build`, igual que A–E.
