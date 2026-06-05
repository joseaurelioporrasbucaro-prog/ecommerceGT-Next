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

_(vacío — todavía no se encontraron gaps nuevos)_
