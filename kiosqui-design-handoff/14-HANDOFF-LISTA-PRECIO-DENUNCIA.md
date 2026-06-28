# Kiosqui — Handoff #14: Card de lista (Enviar mensaje) · Precio dual Q/US$ · Denunciar

**Para:** Claude Code · **De:** Claude Design · **Fecha:** 2026-06-16 · **APROBADO.**
Rama `design/kiosqui-system`. Referencia: `Batch D - Listado, Detalle y Comentarios.html` · `batch_d/ListingScreen.jsx` (DListRow) · `batch_d/DetailScreen.jsx`.

## 1. Botón "Enviar mensaje" en la tarjeta de LISTA (`DListRow`)
En la vista **lista (filas)** del listado, la fila inferior del cuerpo es un flex con:
- **Specs a la izquierda** (hab./baños/m²/parqueos, con `flex-wrap`).
- **Botón verde "Enviar mensaje"** (`.kq-btn--action.kq-btn--sm`, ícono `fa-comment-dots`) a la derecha,
  `flex-shrink:0`, alineado abajo. La fila lleva `flex-wrap:wrap` para que en columnas angostas
  (split mapa) el botón baje a una segunda línea en vez de cortarse.
- El botón hace `e.stopPropagation()` para no abrir el detalle al pulsarlo.
- Solo en la vista lista; en grid (card v2.1) NO se agrega (mantiene su diseño aprobado).

## 2. Precio dual Q + US$ (cuando hay tipo de cambio)
En el **detalle** (card de vendedor) y donde se muestre precio destacado:
- Precio principal en **Q** grande (display 30px).
- Al lado, **chip verde** (`green-100` bg, `green-800` texto) con el equivalente en **US$**
  (`fa-dollar-sign` + monto). Nota debajo: "Precio de venta · tipo de cambio referencial".
- La conversión la define el **cliente al crear la publicación**: él ingresa el precio y elige la
  moneda (Q o US$); si ingresa ambos montos, se muestran los dos. No hay tipo de cambio automático —
  cada monto es el que el vendedor escribió. Si solo cargó una moneda, mostrar solo esa (sin chip ni
  nota de conversión). Quitar la nota "tipo de cambio referencial" cuando los montos son los del usuario.
- En la barra sticky móvil mantener "Q … · US$ … · Venta/Renta".

## 3. Botón "Denunciar publicación" (detalle)
Debajo de Guardar/Compartir en la card del vendedor: acción **discreta** (texto gris `--fg-subtle`,
ícono `far fa-flag`, sin fondo, full-width). Abre el modal de reporte existente (motivo + descripción).
No debe competir con el CTA "Enviar mensaje". Va en `PublicationDetailsMain` (y reutilizar el flujo
de denuncia que ya existe en el repo).

## Checklist
- [ ] `DListRow`: botón Enviar mensaje (verde, derecha, wrap, stopPropagation) solo en vista lista.
- [ ] Detalle: precio dual Q + chip US$ (+ barra sticky) con `TODO(product)` del tipo de cambio.
- [ ] Detalle: botón Denunciar discreto → modal de reporte existente.
- [ ] Light/dark. `npx tsc --noEmit && npx next build`. Gaps → feedback §2.
