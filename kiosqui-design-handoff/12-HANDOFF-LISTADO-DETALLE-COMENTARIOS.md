# Kiosqui — Handoff #12: Listado, Detalle y Comentarios (3 vistas modernas)

**Para:** Claude Code · **De:** Claude Design · **Fecha:** 2026-06-13 · **APROBADO.**
**Referencia visual:** `Batch D - Listado, Detalle y Comentarios.html` (9 artboards, light+dark).
**Markup:** `batch_d/ListingScreen.jsx`, `batch_d/DetailScreen.jsx`, `batch_d/CommentsView.jsx`.
Rama `design/kiosqui-system`. Skin+markup con tokens; el listado además requiere trabajo de datos (ver §1.0).

---

## 1. /publications — Listado [PRIORIDAD]

### 1.0 ⚠️ Causa raíz (NO es diseño): filtrado/orden CLIENT-SIDE
Hoy `PublicationsMain` filtra y ordena **en memoria** sobre lo ya cargado (load-more local) → por eso
los resultados salen incompletos/inconsistentes. El rediseño asume **filtrado server-side**:
- El frontend manda los filtros como **query params** a backend; backend devuelve `{ items, total, page }`.
- Params: `type`, `deptId`, `townId`, `priceMin`, `priceMax`, `currency`, `beds`, `baths`, `sizeMin`,
  `sizeMax`, `amenities[]`, `sort`, `page`. Mapear a los campos reales (`targetCitId`/`targetTowId`
  ya existen para pauta; reutilizar el catálogo `useCities`/`useMunicipalities`).
- Paginación real (no load-more local) y `total` para el contador.
- **TODO(backend): endpoint de búsqueda con filtros + paginación.** Sin esto, el rediseño se ve bien
  pero el bug de fondo sigue. Coordinar con `ecommerceGTBackEnd`.

### 1.1 Barra de filtros cohesiva (reemplaza barra fragmentada + modal)
Una sola fila (wrap en mobile), todos los filtros visibles. Ver `ListingScreen` / `DSelect`:
- **Tipo** (Casa/Apto/Terreno/Oficina), **Departamento**, **Municipio** (dependiente del depto),
  **Precio** (rango con selector Q/US$), **Cuartos**, **Baños**, **Tamaño** (m²), **Amenidades**
  (multi), **Orden** (Más recientes / Precio ↑ / Precio ↓ / Más grandes).
- Cada control: `.kq-input`-like, height 44, borde `--border-strong`, chevron, radius `--r-sm`.
  Seleccionado = texto `--fg-strong` peso 600.
- **Ubicación = departamento→municipio** (selects con catálogo), NO texto libre. Es el fix de fragilidad.
- Toggle **lista↔mapa** a la derecha (segmented, activo navy).

### 1.2 Chips activos + contador
- Bajo la barra: **chips removibles** de cada filtro aplicado (fondo `--accent-soft`, texto `--lav-700`,
  botón ✕ que quita ese filtro) + enlace **"Limpiar todo"**.
- **Contador**: "<total> inmuebles en <ubicación>" — el total viene del backend, no del array local.

### 1.3 Estados
- **Loading**: skeletons de fila (rectángulos `--surface-sunk` con shimmer) — NO spinner full-page.
- **Vacío**: icono lavanda + "Sin resultados" + sugerencia + botón "Limpiar filtros" (ver artboard `list-empty`).
- **Error**: card con icono + "No pudimos cargar" + botón "Reintentar".

### 1.4 Vistas: grid (DEFAULT) · lista · mapa
**Vista por defecto = GRID con la tarjeta v2.1 ya implementada** (`PublicationCard` re-skineado,
la de foto 3:2 + switch Q⇄US$ + specs aireados). Es la que costó diseñar; reutilizarla, no inventar otra.
- **Grid** (default): `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`, gap 22. Cada celda
  es la `PublicationCard` v2.1 (badge Destacado/Nuevo lavanda glow + anillo `is-featured`, badge tipo
  Venta/Renta, tag 3D **solo si `hasGlb`**, switch de precio). Ver `DGridCard` en `ListingScreen.jsx`
  como referencia data-driven (reusa `PriceSwitch`/`Spec21` reales de `CardV21.jsx`).
- **Lista**: filas horizontales (`DListRow`) — foto 280px + cuerpo con aire (mismos datos). Alternativa.
- **Mapa**: split 50/50 (lista scrolleable izq + mapa der con pines de precio verdes).
- **Toggle** en la barra: grid / mapa (y opcional lista). **Recordar la preferencia** del usuario en
  `localStorage` (`kq:listView`). Responsive: en mobile el toggle alterna pantalla completa (no split).

## 2. /publications/[id] — Detalle
Ver `DetailScreen`. Re-skin de `PublicationDetailsMain` a layout moderno:
- **Galería protagonista**: foto grande (2fr) + 2 thumbs (1fr), botón **"Ver modelo 3D"** lavanda
  sobre la foto principal (**solo si `hasGlb`**), overlay "+N fotos" en la última.
- **Jerarquía**: badges (Destacado lavanda + tipo) → H1 título → ubicación con pin.
- **Specs**: 4 tiles con icono lavanda + valor display + label (hab./baños/m²/parqueos).
- **Descripción** + **Amenidades** (chips con check verde).
- **Mapa** embebido (bloque).
- **Card de vendedor sticky**: precio (Q + US$), avatar + nombre + check verde + **rating verde**
  (`--rating`), "Enviar mensaje" **verde**, Guardar/Compartir ghost. **SIN botón "Mostrar teléfono"**
  (decisión de seguridad: no exponer teléfono; el contacto es por mensaje interno).
- **Modelo 3D = función PREMIUM**: el botón "Ver modelo 3D" debe resaltar — gradiente lavanda
  (`lav-500→lav-700`), glow fuerte (`0 10px 30px rgba(109,98,207,.6)` + anillo lavanda) y chip
  **"Premium" con corona** (`fa-crown`). Solo visible si `hasGlb`.
- **Comentarios integrados** abajo (sección 3).
- **Barra sticky inferior en móvil**: precio + botón 3D (si `hasGlb`) + "Enviar mensaje" verde.
  Nota: las filas del listado (`DListRow`, vista lista y split mapa) deben llevar `min-width:0` en el
  cuerpo y `flex-wrap` en la fila de specs para que en columnas angostas (split mapa) no se corten los
  íconos (hab./baños/m²/parqueo) ni la etiqueta Venta/Renta.

## 3. Comentarios / Preguntas (en el detalle)
Ver `CommentsView`. Re-skin de `PublicationComments` del patrón foro al patrón **preguntas sobre la
propiedad**:
- Encabezado "Preguntas (n)" + subtítulo.
- **Composer pill** on-brand: avatar + input pill + botón "Preguntar" verde.
- **Hilo pregunta→respuesta**: pregunta (avatar navy, nombre, tiempo, texto, like/responder) y
  **respuesta del vendedor DESTACADA** (fondo `--accent-soft`, borde-izq lavanda, avatar lavanda,
  chip "Vendedor"). Mantener menciones/likes/reportes existentes.
- **Colapso de hilos**: "Ver N respuestas más".
- **Estado vacío**: "Sé el primero en preguntar".
- Dark por tokens.

## 4. Checklist
- [ ] **Backend**: endpoint búsqueda con filtros server-side + paginación + total. (bloqueante del fix real)
- [ ] Barra de filtros cohesiva (depto→municipio, precio Q/US$, amenidades multi, orden) → server params.
- [ ] Chips activos removibles + limpiar + contador desde `total`.
- [ ] Estados loading(skeleton)/vacío/error.
- [ ] Lista↔mapa responsive; tag/btn 3D condicionado a `hasGlb`.
- [ ] Detalle moderno (galería+3D, specs, seller card rating verde, sticky móvil).
- [ ] Comentarios patrón pregunta→respuesta (vendedor destacado).
- [ ] Light/dark. `npx tsc --noEmit && npx next build`. Gaps nuevos → feedback §2.
