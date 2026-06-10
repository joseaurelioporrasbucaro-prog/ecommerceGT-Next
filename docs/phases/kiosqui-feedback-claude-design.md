# Kiosqui — Feedback para Claude Design (Fase 17)

> **Canal de ida y vuelta con Claude Design.** Las IA ejecutoras (Codex / Claude
> Code) **AGREGAN** en §2 cualquier hueco que encuentren (pantalla/estado sin
> diseño, token que tendrían que inventar, decisión de producto sin resolver) y lo
> marcan `TODO(design)` en el código. Aurelio lo manda a Claude Design **en lote**,
> no fase por fase.
>
> Este archivo también ES el mensaje pendiente a Claude Design: la §1 responde lo
> que pidió en el handoff #2 (§3).

## 1. Respuestas a las 5 preguntas del handoff #2 (§3)

1. **¿bridge.css aguanta los re-skins?** Sí para color/tokens. Para markup/layout
   nuevo se usa **SCSS dedicado por feature** (`_pub-card.scss`, `_header-kq.scss`,
   `_property-detail.scss`, `_publish-flow.scss`) + primitivas de `components.css`.
   El bridge = capa de color; los partials = estructura.
2. **Componentes de alta complejidad lógica (requieren diseño extra):** `Upload/`
   (wizard + Formik/Yup + subida de imágenes/visor 3D), `AdvancedFiltersPanel`
   (estado de filtros), `PublicationContent` (galería + visor 3D + tarjeta de
   agente), `MessagesMain` (no está en el kit).
3. **Pantallas SIN referencia visual** (que Claude Design debería diseñar):
   `/messages`, `/admin`, `/soporte`, `/forum`, `/contact`, `/faq`,
   `/creator-profile*`, `/company`, `/empresa`, auth (`/login` `/register`
   `/forgot` `/verify`), legales (`/terminos` `/privacidad` `/terms`),
   `/activity`, `/invite`, `/survey`, `/pauta`. Reutilizan pub-card: `/favorites`,
   `/my-publications`. Legacy a decidir (rebrand o retiro): `/art-ranking`,
   `/wallet-connect`, `/explore-arts`, `/home-two`.
4. **Decisiones de producto:** moneda de planes → se mantiene `$` (`subscriptions.
   sub_price` no tiene columna de moneda y los seeds leen como USD; no se toca
   backend) → `TODO(currency-plan)`. Plan recomendado → `RECOMMENDED_PLAN_ID = 3`
   (frontend, sin backend).
5. **Tokens inventados localmente:** ninguno fuera del sistema. Se formaliza
   `--rating` (green-600 / green-400) en F0.2. Si un WP necesita un gris/radius
   nuevo, se agrega a `colors_and_type.css` (no local) y se reporta en §2.

## 2. Gaps nuevos encontrados durante la ejecución

> Las IA ejecutoras agregan acá. Formato:
> `- [WP-N] <hueco> — dónde: <archivo/pantalla> — qué se necesita de diseño.`

### Del handoff #3 (2026-06-10, Claude Code)

- [H3] **El ítem "Vendedores" del §3 ya no existe como ruta**: la Fase 24
  (producto) unificó Directorio+Ranking en `/ranking` con tabs. El drawer quedó
  con 6 ítems (Inicio, Propiedades, Ranking, Pauta·auth, Planes, Contacto).
  Si diseño quiere "Vendedores" como entrada aparte, hay que decidirlo con
  producto.
- [H3] **`PublicCategoriesSidebar` quedó sin disparador**: el handoff define el
  avatar (solo logueado) como único botón izquierdo, así que el panel de
  categorías para visitantes ya no se puede abrir (antes era riel fijo ≥1400px).
  Su contenido (categorías + CTA registro) está cubierto por los chips del hero
  y el CTA del drawer — pero si se quiere conservar, necesita diseño.
- [H3] **/messages (HeaderOne) sin acceso al drawer de cuenta**: HeaderOne no
  tiene avatar de perfil y perdió el riel derecho. Falta diseño de HeaderOne
  (¿mismo patrón avatar + buscador?). TODO(design) en DefaultWrapper.
- [H3] **Estados Vendida/Borrador/Anulada como badge de esquina**: no están en
  el §6 (solo Destacado/Nuevo). Se aplicó el estilo "frosted" con punto de
  color del estado (el que landing.html reserva para estados neutros), en ambos
  temas (el "verde sólido en dark" de la referencia asume estados positivos
  tipo "En renta", no aplica a "Vendida"). Validar con diseño.
- [H3] **LanguageSwitcher no existe en el prototipo del header**: se mantuvo
  (funcionalidad i18n de Fase 14), junto al theme toggle. Si molesta
  visualmente, decidir dónde vive (¿drawer?).
- [H3] **Footer**: solo se cambió el logo (transparente). El re-skin completo
  del footer (fondo ink-900, 4 columnas, "Hecho en Guatemala") sigue pendiente
  del handoff #2 §2.6 — el copy actual aún dice "Designed by BDevs".
