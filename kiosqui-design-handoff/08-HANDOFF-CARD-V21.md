# Kiosqui — Handoff #8: PublicationCard v2.1 + /my-publications + correos

**Para:** Claude Code · **De:** Claude Design · **Fecha:** 2026-06-12 · **Estado:** APROBADO por Aurelio.
**Responde a:** Feedback Fase 17 §2 — gaps [CARD-1..4] y [WP-2].
**Referencia visual:** `Card v2 - Foto protagonista.html` (canvas). La sección "⭐ Card v2.1 — ELEGIDA" es la definitiva; el CTA elegido es la **opción 1 (verde sólido)** de la sección de CTAs.
**Markup de referencia:** `batch_card/CardV21.jsx` (card) y `batch_card/CardV2.jsx` (filas OwnerRow de my-publications).

Rama: `design/kiosqui-system`. Reglas de siempre: solo skin+markup, tokens, commits `design:`.

---

## 1. PublicationCard v2.1 — la foto protagonista [CARD-1]

Reemplaza la card del handoff #2 §2.1. Estructura (ver `CardV21.jsx`):

**Foto:**
- Ratio **3:2** (`padding-top: 66.67%`), `object-fit: cover`, esquinas superiores del radius lg.
- **Badge compacto** 24px alto, esquina sup-izq (10,10): pill translúcida con blur —
  Destacado/Nuevo: `rgba(109,98,207,.92)` con fa-star 9px; Patrocinado: `rgba(17,24,42,.55)`.
  Texto blanco 11px bold. (Los estados Vendida/Borrador/Anulada de my-publications NO van
  sobre la foto en listados públicos — esas publicaciones no se listan.)
- **Corazón** 32px translúcido `rgba(17,24,42,.4)` + blur, esquina sup-der (8,8); guardado = `#ff7a7a` fill.
- Card destacada: anillo `0 0 0 1.5px var(--lav-400)` además del badge.

**Cuerpo (el aire es intencional — no comprimir):**
- Padding `16px 18px 18px`.
- **Precio con switch Q ⇄ US$** (ver §2): símbolo 14px `--fg-subtle` + monto display 23px bold `--fg-strong`; sufijo `/mes` en rentas, body-sm `--fg-subtle`.
- Título: body-sm 600, 1 línea con ellipsis — margen `10px 0 5px`.
- Ubicación: pin fa-map-marker-alt 12px `--accent-hover` + texto body-sm `--fg-muted`.
- **Specs row**: `margin-top:14px; padding-top:14px; border-top:1px solid var(--border)`;
  gap **22px**; cada spec = ícono 13px `--navy-400` + gap 8px + texto body-sm `--fg-muted`:
  fa-bed "3 hab" · fa-bath "2.5 baños" · fa-vector-square "180 m²". (Terrenos: solo m² + lo que aplique.)
- Ancho de referencia: ~316px en grids de 3; fluido en la grilla real.

**[CARD-3] CTA pautada — APROBADO verde sólido:** cuando la publicación tiene pauta con
`ctaOverride`, agregar al fondo del cuerpo (`margin-top:14px`):
`.kq-btn--action .kq-btn--sm` full-width, fa-comments + "Enviar mensaje".
**Eliminar el estilo dorado** de Fase 10.4. El CTA lleva a /messages con la conversación de esa publicación.

**[CARD-4] Regla anti-redundancia:** dentro de la sección "Patrocinado" de la home, las
cards NO muestran el badge "Patrocinado" (el título de sección ya lo dice). El badge aparece
solo cuando la card pautada se mezcla en listados normales (/publications, búsqueda).

## 2. Switch de precio Q ⇄ US$ [nuevo]

- Alterna cada **3.2s** entre GTQ y USD con animación de entrada
  (`opacity 0→1` + `translateY(60%)→0`, `.45s cubic-bezier(.2,.7,.3,1)`), gated por
  `@media (prefers-reduced-motion: no-preference)` — con reduced-motion muestra solo GTQ.
- Conversión: usar el tipo de cambio que el backend/config exponga. Si no existe,
  `TODO(currency-rate)` con constante temporal (~7.8) y avisar en feedback §2.
- Implementación de referencia: `usePriceSwitch` + `PriceSwitch` en `CardV21.jsx` +
  keyframes `kq-price-in` (en el `<style>` del canvas). Extraer a `_pub-card.scss`.
- Aplica en: cards de listados, home y favoritos. NO aplica en /my-publications (el dueño
  ya sabe su precio; las filas muestran solo GTQ).

## 3. /my-publications — filas de propietario [WP-2]

NO usa pub-cards: usa **filas** (ver `OwnerRow` en `CardV2.jsx`):
- Fila: `--surface`, borde `--border`, radius md, shadow xs, padding 14/16, gap 16.
- Thumb 104×70 radius sm (variant `thumb` del backend sirve). **Vendida/Anulada: foto con
  `filter: saturate(.35) brightness(.85)`**.
- Centro: título label 15 + **badge frosted de estado** (22px, `--surface-sunk`, borde
  `--border`, dot 6px: Activa `--green-600` · Borrador `--ink-400` · Vendida `--navy-500` ·
  Anulada `--danger`); línea "precio · zona · fecha"; métricas caption (fa-eye vistas ·
  fa-heart favoritos · fa-comments consultas — usar las reales).
- Acciones a la derecha (sm): **la acción principal del estado en verde** (Activa→"Pautar",
  Borrador→"Publicar"), secundarias outline ("Editar", "Cerrar venta", "Republicar"),
  "Eliminar" outline con texto/borde danger. En mobile: colapsar secundarias en menú "⋯".

## 4. Correos de contacto [B-4 — CONFIRMADOS]

- Soporte: **soporte@kiosqui.com**
- Ventas/pauta: **ventas@kiosqui.com**
Actualizar `/contact` (tiles laterales) y cualquier mailto. Quitar los `TODO(copy)`.
(Nota: el tile de pauta del mock decía pauta@ — usar **ventas@kiosqui.com** con label "Ventas y pauta".)

## 5. Checklist

- [ ] `_pub-card.scss` v2.1 (foto 3:2 + cuerpo con aire + specs con íconos + switch de precio).
- [ ] Fallback de imagen sin backend: usar variant `detail` 1600×900 con `object-fit:cover` para el 3:2. Si luego se quiere optimizar, proponer variant `card32` (requiere autorización de Aurelio).
- [ ] CTA pautada verde (eliminar dorado Fase 10.4) + regla del badge en sección Patrocinado.
- [ ] /my-publications con OwnerRow (estados + métricas + acciones).
- [ ] Correos reales en /contact.
- [ ] Light/dark × mobile/desktop. `npx tsc --noEmit && npx next build`.
- [ ] Gaps nuevos → feedback §2.
