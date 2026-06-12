# Kiosqui — Handoff #6: Batch B — Perfil de vendedor + Contacto + FAQ + Soporte + Legales

**Para:** Claude Code · **De:** Claude Design · **Fecha:** 2026-06-11 · **Estado:** APROBADO por Aurelio.
**Referencia visual:** `Batch B - Perfil y Soporte.html` (canvas, 7 artboards light+dark)
**Markup de referencia:** `batch_b/ProfileScreen.jsx` y `batch_b/SupportScreens.jsx` (cosmético — copiar estructura visual, mantener la lógica real del repo).

Rama: `design/kiosqui-system`. Commits `design:`. Reglas del handoff #2 §4 vigentes
(no tocar hooks/React Query/AuthContext; solo skin + markup). Todo via tokens — nada hardcodeado.

---

## 1. Perfil público de vendedor (`/creator-profile*` → `CreatorProfileMain.tsx`)

Estructura (ver `batch_b/ProfileScreen.jsx`):

1. **HeaderTwo estándar** (avatar izquierda, buscador, Publicar + campana + hamburguesa).
2. **Banda navy** `--navy-800` con halo lavanda (`radial-gradient(560px 320px at 88% -20%, rgba(181,172,239,.28), transparent 60%)`), altura ~128px visible.
3. **Card de identidad superpuesta** (margin-top −64px sobre la banda): `--surface`, radius lg, `--shadow-md`, padding 26/30. Contiene:
   - Avatar 92px gradiente navy con **check verde** 28px (border 3px surface) abajo-derecha.
   - Nombre display 26px + badge "**Verificado con DPI**" (pill `--green-100`/`--green-800`, fa-id-card) — solo si el usuario está verificado.
   - @handle en `--accent-hover` bold; bio 1–2 líneas `--fg-muted`.
   - **Stats**: Publicaciones / Vendidas / Rating (número display 24px; el rating usa `--rating`). Usar datos reales.
   - **CTAs**: "Enviar mensaje" `.kq-btn--action` (lleva a /messages con la conversación) + "Compartir perfil" outline sm.
4. **Tabs** "Publicaciones (n)" / "Reseñas (n)": font-display 14, activa = texto `--fg-strong` + subrayado 2.5px `--green-500`; inactiva `--fg-subtle`.
5. **Grid de pub-cards** 3 col (reusar `PublicationCard` re-skineado del handoff #2/#3 — destacados con badge lavanda glow + anillo).
6. Tab Reseñas: lista de reseñas (avatar, nombre, estrellas `--rating`, texto). No hay artboard — usar el mismo lenguaje de cards; si hace falta diseño detallado, agregarlo al feedback §2.

## 2. Patrón "página de contenido" (`/contact`, `/faq`, `/soporte`)

Compartido: **PageHead** centrado — overline lavanda (uppercase, tracking +.14em) + título display 36px + sub `--fg-muted` max-width 520, padding 52/40.

### `/contact` (`ContactMain.tsx`)
- Grid `1.5fr 1fr` max-width 980.
- **Card de formulario**: nombre/correo en grid 2 col, select "Asunto" (`.kq-input` + chevron custom; opciones: Consulta sobre una propiedad / Problema con mi cuenta / Pauta y publicidad / Otro), textarea 5 filas, submit verde con fa-paper-plane.
- **Columna lateral**: 3 tiles (fa-envelope correo soporte@kiosqui.gt · fa-headset centro de ayuda · fa-bullhorn pauta@kiosqui.gt) con icon-tile 42px `--accent-soft`; + mini card navy "¿Sos vendedor?" con CTA verde "Crear publicación".
- Ajustar correos a los reales del producto (TODO(copy) si no existen).

### `/faq` (`FaqMain.tsx`)
- Max-width 760. Buscador pill 52px con sombra. Chips de categoría (`.kq-chip`, activa navy): Todas / Cuenta / Publicaciones / Modelo 3D / Pagos / Seguridad.
- **Acordeón**: cards `--surface` radius md; pregunta = label 15px bold; botón circular 28px (cerrado: `--surface-sunk` +, abierto: `--lav-500` − blanco); respuesta `--fg-muted` 14/1.6. Abierto lleva `--shadow-sm`.
- Contenido de las preguntas: usar las reales del producto; las del mock son sugerencia de copy.

### `/soporte` (`SupportMain.tsx` o la ruta real)
- Grid 3×2 de **topic cards**: icon-tile 46px `--accent-soft` lavanda, título display 17, descripción, link "n guías →" en lavanda bold. Temas: Mi cuenta / Publicaciones / Modelo 3D / Planes y pagos / Seguridad / Pauta.
- **Banda de ticket** abajo: `--green-100` con borde `--green-300`, ícono fa-life-ring en círculo verde, texto + botón `.kq-btn--primary` "Abrir ticket".

## 3. Legales (`/terminos`, `/privacidad`, `/terms`)

Plantilla tipográfica única (ver `LegalScreen`):
- Grid `230px 1fr` gap 44, max-width 980.
- **TOC sticky** (top 24): overline "Contenido"; items 14px, activo = lavanda bold + fondo `--accent-soft` + borde izq 2.5px `--lav-500`. Resaltar sección visible al hacer scroll (scrollspy simple).
- **Prosa**: overline "Legal" + H1 display 34 + "Última actualización: …" con borde inferior; H2 display 21; párrafos 16/1.7; callouts informativos en card `--accent-soft` con fa-info-circle.
- El copy legal real lo provee el equipo — la plantilla es el contenedor.

## 4. Checklist

- [ ] `/creator-profile*` re-skineado (datos reales: stats, publicaciones, verificación).
- [ ] `/contact`, `/faq`, `/soporte` con el patrón PageHead + sus cuerpos.
- [ ] `/terminos` + `/privacidad` con la plantilla legal (mismo layout ambas).
- [ ] Light/dark × mobile/desktop (en mobile: grids → 1 col, TOC legal arriba colapsado o oculto).
- [ ] `npx tsc --noEmit && npx next build`.
- [ ] Gaps nuevos → feedback §2 con `TODO(design)` (ej: diseño detallado del tab Reseñas si lo necesitan).
