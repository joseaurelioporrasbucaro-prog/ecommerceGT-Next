# Kiosqui — Solicitud a Claude Design: 3 vistas modernas

**De:** Claude Code (+ Aurelio) · **Para:** Claude Design · **Fecha:** 2026-06-13

Pedido de **diseño nuevo** (no re-skin) para tres vistas centrales. Para cada una:
estado actual, qué está mal, y qué necesitamos. Al final, una nota técnica que
condiciona el diseño de los filtros.

---

## 1. Listado de publicaciones (`/publications`) — PRIORIDAD

**Estado actual.** `PublicationsMain.tsx` (472 líneas) orquesta:
- `PublicationsBar.tsx` — barra superior: búsqueda libre, orden (recientes /
  precio asc / precio desc) y categoría.
- `AdvancedFiltersPanel.tsx` — botón "Filtros avanzados" que abre un modal con:
  precio min/max, cuartos min, baños min, tamaño min, amenidades.
- `CategorySlider.tsx` — slider de categorías.
- `PropertiesMap.tsx` — toggle lista ↔ mapa.
- Tarjetas en grid (`PublicationCard` v2.1, ya rediseñada).

**Qué está mal:**
1. **Filtrado y orden son CLIENT-SIDE.** `PublicationsMain` filtra/ordena en memoria
   sobre el array ya cargado y pagina con `visibleCount` (load-more local). Resultado:
   los filtros solo "ven" lo ya traído → resultados incompletos/inconsistentes y no
   escala. **Este es el problema de fondo de "los filtros están mal".**
2. **Filtros fragmentados** entre la barra (búsqueda/orden/categoría) y un modal
   aparte (precio/cuartos/baños/tamaño/amenidades). El usuario no ve de un vistazo
   qué filtros tiene aplicados.
3. **Ubicación = texto libre** (busca concatenando país/ciudad/municipio). Frágil y
   propenso a cero-resultados. Debería ser selector de **departamento → municipio**
   (ya existe catálogo: `useCities`/`useMunicipalities`).
4. Sin **chips de filtros activos** (con "quitar"), sin estado vacío claro ("no hay
   resultados con estos filtros → limpiar"), sin contador de resultados.

**Qué necesitamos (diseño):**
- Una **barra de filtros cohesiva y moderna** (estilo portal inmobiliario): tipo de
  propiedad, departamento/municipio, rango de precio (con moneda Q/US$), cuartos,
  baños, tamaño, amenidades, y orden — todo accesible sin esconder la mitad en un
  modal (o un modal que muestre TODO junto, no dividido).
- **Chips de filtros activos** removibles + botón "limpiar todo" + contador de
  resultados ("128 propiedades").
- **Estados**: cargando (skeletons), vacío (sin resultados → limpiar), error.
- Toggle **lista ↔ mapa** integrado y responsive (en móvil, filtros colapsables).
- Grid de tarjetas (la card v2.1 ya está; respetarla).

> **Nota técnica para el equipo:** el rediseño de filtros debería ir junto con
> **filtrado server-side** (el backend recibe los filtros y devuelve la página ya
> filtrada/ordenada/paginada). Hoy es client-side y por eso "falla". Es trabajo de
> backend + frontend, no solo diseño — pero el diseño debe asumir server-driven
> (paginación real, no load-more sobre un set parcial).

---

## 2. Vista de comentarios (en el detalle)

**Estado actual.** `PublicationComments.tsx` + `comments/ForumComment.tsx`,
`ForumReply.tsx`, `MentionTextarea.tsx`, `renderCommentContent.tsx`. Hilos con
respuestas anidadas, menciones (@usuario), likes y reportes. Funcional pero el
diseño es heredado del template (foros), no pensado para preguntas sobre una
propiedad.

**Qué necesitamos (diseño):**
- Un patrón de **comentarios/preguntas sobre la propiedad** moderno: jerarquía clara
  pregunta → respuesta (especialmente respuestas del **vendedor**, destacadas),
  avatar + nombre + fecha, menciones estilizadas, like/responder/reportar discretos.
- Caja de redacción (composer) on-brand con el patrón pill ya usado en /messages.
- Estado vacío ("Sé el primero en preguntar"), orden (recientes/relevantes), y
  colapso de hilos largos ("ver N respuestas").
- Dark mode por tokens.

---

## 3. Detalle de publicación (`/publications/[id]`)

**Estado actual.** `PublicationDetailsMain.tsx` — ya re-skineado en WP-5 (galería,
acceso a visor 3D gateado a `hasGlb`, specs, amenidades, precio, comentarios). Sirve,
pero Aurelio lo quiere **más moderno** (nivel portal inmobiliario premium).

**Qué necesitamos (diseño):**
- Layout de detalle moderno: **galería protagonista** + acceso 3D claro, bloque de
  **precio + título + ubicación** jerárquico, **specs con íconos** (cuartos, baños,
  parqueo, tamaño, nivel), amenidades, descripción, **card del vendedor** (avatar,
  rating verde, verificado, botón "Enviar mensaje" verde), mapa de ubicación, y la
  sección de comentarios (#2) integrada.
- Barra de acción sticky en móvil (precio + "Enviar mensaje" + "3D").
- Respetar tokens Kiosqui + dark mode. La card v2.1 y el visor 3D ya existen.

---

## Resumen para Claude Design
| Vista | Tipo | Bloqueante |
|---|---|---|
| Listado + filtros | Rediseño + **filtrado server-side** (backend) | El más urgente; los filtros hoy fallan por ser client-side |
| Comentarios | Rediseño de patrón | — |
| Detalle | Modernización | — |

Cuando Claude Design entregue los handoffs, Claude Code los aplica sobre
`design/kiosqui-system` con el mismo flujo (chunks + tsc/build + PR + feedback §2).
