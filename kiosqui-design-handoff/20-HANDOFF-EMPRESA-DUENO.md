# Kiosqui — Handoff #20: Empresa (lado dueño) — /company + /company/equipo (Batch G)

**Para:** Claude Code · **De:** Claude Design · **Fecha:** 2026-06-27 · **APROBADO.**
Rama `design/kiosqui-system`. Referencia: `Batch G - Empresa (dueño).html` (6 artboards, light+dark).
Markup: `batch_g/CompanyOwnerScreens.jsx`. Solo skin+markup; preservar toda la lógica (React Query,
mutations, gating por admin, subida de logo con `ImageCropperModal`).

## Decisiones de diseño (respondiendo el pedido)
1. **Identidad de `/company`** → **reusar la portada navy→lavanda + foto enmarcada** del perfil
   público (consistencia), con la **tarjeta de edición debajo**. No un dashboard sobrio: se siente
   parte del mismo objeto "empresa".
2. **Equipo** → **tabla densa** (el límite-por-miembro editable + acciones lo piden). Rol **Admin =
   tag lavanda**; estado = tag neutro; **invitación pendiente = `--warning-bg`** (NO el ámbar
   `#f59e0b` del template).
3. **Bloque "Invitar"** → **dos columnas**: izquierda "buscar usuario existente" (input + resultados),
   derecha "invitar por correo" (nombre/apellido/email). Más claro que tabs.
4. **Logo dorado descartado**: el placeholder `#d4af37/#f1c75b` del código se reemplaza por gradiente
   **lavanda→navy** (alineado al sistema). Check de verificación **verde**.

## 1. `/company` — Mi empresa (`CompanyMain`)
- **Portada** navy→lavanda (200px) + **foto de empresa enmarcada en blanco** (marco surface; sin él un
  logo navy se pierde sobre la franja) con **badge de cámara verde "Cambiar logo"** (abre cropper 1:1).
- Encabezado: nombre comercial + **check verde** + razón social.
- **Tarjeta "Datos de la empresa"** + link "Gestionar equipo" (solo admin): campos **Logo** (preview +
  Cambiar logo), **Nombre legal** (`bname`), **Nombre comercial** (`btname`), **Dirección** (`baddress`),
  **Teléfono** (`bphone`), checkbox **"Mostrar empleados"** (`showEmployees`), botón **"Guardar cambios"**
  verde. Inputs `.kq-input` (height 50).
- **Estados**:
  - **No-admin** → banner `--warning-bg` "Solo un administrador puede editar", inputs `disabled`, sin botón guardar.
  - **Sin empresa** (`isError`) → estado vacío centrado (ícono edificio lavanda + texto + CTA **"Ver planes"** → `/pricing-plan`).
  - **No logueado** → prompt de login (reusar el patrón de alerta existente).

## 2. `/company/equipo` — Gestión de equipo (`CompanyTeamMain`)
- **Top**: link "← Mi empresa" + **badge de slots** navy "X de Y miembros" (`members.length` / `userLimit`).
- **Tabla de miembros** (`.kq-card`, head sunk): por fila → avatar navy + nombre + **tag Admin lavanda**
  + email | **límite de publicaciones** (input number + botón "Guardar" → `setLimit`, y "Usadas: x / y")
  | **acción "Quitar"** (ghost rojo → `removeEmployee`; oculto para admins y para uno mismo).
- **Invitaciones pendientes** (si hay): avatar neutro + nombre + **tag Pendiente `--warning-bg`** + email
  + "Cancelar" (ghost rojo → `cancelInvitation`).
- **Sumar miembros** (solo admin; si `members.length >= userLimit` → nota "límite alcanzado" + link
  upgrade, inputs disabled): **dos columnas** →
  - **Buscar usuario** (`useSearchBuyers`, ≥2 chars): input + lista de resultados con botón "Invitar" (`inviteExisting`).
  - **Invitar por correo** (`addEmployee`): nombre + apellido + email + botón "Enviar invitación" verde.
- **Gating**: si no es admin → solo lectura (mostrar uso de publicaciones por miembro, sin inputs ni acciones).

## Checklist
- [ ] `/company`: portada+foto enmarcada (cambiar logo verde), form con los 4 campos + showEmployees + guardar; estados no-admin / sin empresa / no logueado.
- [ ] `/company/equipo`: tabla de miembros (límite editable, quitar), pendientes (warning), invitar en 2 columnas (buscar + email), badge de slots, gating admin.
- [ ] **Responsive mobile** (ver §3).
- [ ] Dorado→lavanda/navy, ámbar→`--warning-bg`, check verde. `.kq-input`/`.kq-btn`/`.kq-badge`.
- [ ] Light/dark. Solo skin (no tocar mutations/gating). `npx tsc --noEmit && npx next build`. Gaps → feedback §2.

## 3. Responsive mobile (≤480px) — ver artboards "· mobile"
Ambas pantallas deben funcionar en mobile. Adaptaciones (referencia: `CompanyOwnerMobile` /
`CompanyTeamMobile` en el markup):
- **`/company`**: portada más baja (120px), **foto centrada** sobre la franja, link "Gestionar equipo"
  como botón full-width, y el **form a una sola columna** (todos los campos al 100%). Botón Guardar full-width.
- **`/company/equipo`**: la **tabla densa se convierte en cards** (una por miembro): cabecera
  avatar+nombre+rol+email y, debajo de un divisor, el input de límite + Guardar + quitar (icono) y
  "Usadas x/y". El bloque "Sumar miembros" se **apila** (buscar arriba, invitar por correo abajo;
  nombre/apellido en una fila de 2). Badge de slots centrado arriba. Topbar con flecha volver.
- Regla general: a partir de ~720px el form de empresa y el bloque invitar vuelven a 2 columnas; la
  lista de equipo vuelve a tabla. Usar los mismos tokens; nada de scroll horizontal en mobile.
