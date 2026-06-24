# Kiosqui — Handoff #17: Portal de Soporte (staff) + Admin (Batch F)

**Para:** Claude Code · **De:** Claude Design · **Fecha:** 2026-06-23 · **APROBADO.**
Rama `design/kiosqui-system`. Referencia: `Batch F - Soporte y Admin.html` (12 artboards, light+dark).
Markup: `batch_f/SupportShell.jsx`, `batch_f/TicketScreens.jsx`, `batch_f/AdminScreens.jsx`.
⚠️ **Commitear `batch_f/` + el HTML + este .md en la rama** para que el worktree los vea (lección Batch E).

---

## Sistema compartido (batch_f/SupportShell.jsx)
- **StaffShell**: `KqHeader` compacto + **sidebar lateral** (Tickets / Verificaciones / Denuncias /
  Usuarios / Configuración / Imágenes, con contador) + área de contenido con título/acciones.
  Decisión: sidebar (no tabs) por ser 6 secciones.
- **DataTable densa**: header `--surface-sunk` en mayúsculas (overline), filas con hover
  `--surface-sunk`, padding 13×16, fuente 14px, **scroll horizontal** en mobile (min-width 760).
- **StatusChip / RoleBadge / Av** (avatar gradiente navy).

### Mapeo de color de estados (DECISIÓN DE DISEÑO — usar tal cual)
- **Ticket**: open=`--warning-bg`/#9a5a12 · in_progress=`--lav-200`/`--lav-700` · resolved=`--green-100`/`--green-800` · closed=`--surface-sunk`/`--fg-muted`.
- **Verificación**: pending=warn · verified=green · rejected=`--danger-bg`/`--danger`.
- **Cuenta**: active=green · suspended=warn · banned=danger.
- **Rol**: admin=navy sólido/cream · support(agente)=lavanda/#fff · user=neutral.

### Decisiones a las 6 preguntas
1. Densidad: compacta (13×16, 14px). 2. Colores: arriba. 3. Mobile: **scroll-x** (fiel al `<table>`).
4. Nav: **sidebar**. 5. Rol=badge navy/lav/neutral, assignee=avatar+nombre. 6. Light+dark por tokens.

## Pantallas
1. **Cola de tickets** (`/soporte/tickets-admin`): filtros estado + asignación (segmented), tabla
   (#/asunto/solicitante/categoría/estado/agente/actualizado), paginación. "Mis tickets"
   (`/soporte/tickets`) = misma tabla sin filtro de asignación, scope al usuario.
2. **Detalle de ticket**: hilo (mensajes staff=lavanda, usuario=surface, **nota interna=ámbar**),
   panel lateral (select estado + select asignar), responder con toggle "nota interna" (solo staff).
3. **Verificaciones**: filtro pending/verified/rejected, tabla con tipo (DPI/RTU), solicitante,
   documento, **archivos frente/reverso** (links), aprobar=verde / rechazar=rojo (+ modal de motivo,
   ya existe en código). 
4. **Denuncias**: tabla pub/motivo/conteo/acciones (Ver / Ocultar pub.).
5. **Usuarios**: buscador + filtros, tabla usuario(avatar)/correo/rol/estado/pubs/acciones.
6. **Admin · Configuración**: grupos (Publicaciones, Pauta, Modelo 3D) con toggles verdes + campos
   numéricos. **Quitar el `#2785ff` hardcodeado** → tokens. Botón "Guardar cambios" verde.

## Constraints (recordatorio)
- Solo skin+markup; preservar React Query, mutations (asignar/estado/aprobar/rechazar), gating por rol,
  filtros, paginación. No inventar datos (rol/rating si no existen → omitir y anotar).
- next-intl: reusar keys `support`/`admin`; copy nuevo en voseo (es) + en.
- styled-jsx scope gotcha → `:global()` para hijos/`<Link>`/`<Image>`. `.kq-card` recorta overflow.

## Pantalla "Imágenes" (`AdminImagesMain`) — INCLUIDA
Grid de site-assets: preview 16:9, `asset_key` (código lavanda), label, resolución recomendada,
quién/cuándo actualizó, botón "Cambiar imagen" (upload). Estado "sin imagen" para vacíos. Banner
informativo arriba. Reusa StaffShell (sidebar active="images"). Preservar la lógica de
`/upload-site-asset` + `/admin/site-assets` (preserva aspect ratio).

## Checklist
- [ ] StaffShell + DataTable + chips/roles aplicados a las 6 pantallas.
- [ ] Mapeo de estados exacto; admin sin `#2785ff`.
- [ ] Light/dark. `npx tsc --noEmit && npx next build`. Gaps → feedback §2.
