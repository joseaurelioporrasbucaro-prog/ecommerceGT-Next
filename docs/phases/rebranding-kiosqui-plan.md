# Fase 17 — Rebranding Kiosqui (UI kit, design track)

> **Para:** Codex / Claude Code / cualquier ejecutor.
> **De:** Claude (arquitecto), a partir del handoff de Claude Design
> (`kiosqui-design-handoff/_handoff 2/02-NEXT-STEPS.md`).
> **Fecha:** 2026-06-05.
> **Rama:** `design/kiosqui-system` (NUNCA main hasta aprobación visual).
> **Regla dura de esta fase:** **NO se toca el backend.** La meta es ganar UI/UX
> sin perder funcionalidad. Todo lo que necesite backend se pospone o se resuelve
> frontend-only.

## 0. Contexto y por qué

Esta es la **Fase 17 — Aplicación de la paleta de marca** (ver
`docs/PENDING_PHASE_BRAND_KIOSQUI.md`). Estaba **diferida** esperando "un brief
de diseño más sólido" (§7 de ese doc). **El handoff de Claude Design ES ese
brief.** El experimento previo (paleta teal/naranja `#0f4c4c`) era OTRA paleta y
se revirtió entero (commit `0748da4`); esta es la segunda iteración con la paleta
definitiva **navy / verde / lavanda / cream**.

Avance ya hecho (handoff #1): **home + pricing** migrados al color/tipo Kiosqui
vía puente de variables (`src/style/kiosqui/bridge.css` remapea `--clr-*` →
tokens de marca). Ese trabajo está **sin commitear** en la rama
`claude/interesting-aryabhata-529860`.

El handoff #2 pide:
1. **Cerrar los 8 gaps** con hex hardcodeado (decisiones de Claude Design en
   `_handoff 2/02-NEXT-STEPS.md §1`).
2. **Migrar la estructura de UI** (markup, no solo color): PublicationCard,
   Header, Filtros, PropertyDetail, Upload, Footer (§2).

Va en una **rama de diseño aislada** para no retrasar las fases funcionales ni
mezclarse con main hasta la aprobación visual.

## 0bis. Política de ramas (AMBOS repos) — LEER PRIMERO

- El rebranding se trabaja **ÚNICAMENTE** en la rama `design/kiosqui-system`.
  Se crea en **los dos repos**, naciendo de su rama base:
  - Frontend `ecommerceGT-Next` (base `main`):
    `git checkout main && git pull && git checkout -b design/kiosqui-system`
  - Backend `ecommerceGTBackEnd` (base `master`):
    `git checkout master && git pull && git checkout -b design/kiosqui-system`
    → rama de **paridad**: en Fase 17 el backend **NO se modifica**, solo se
    mantiene sincronizada. Cualquier cambio de backend requiere **autorización
    explícita** de Aurelio (no debería hacer falta en esta fase).
- **Siempre jalar de main/master** antes de empezar y de forma periódica
  (`git merge main` / `git merge master`) para no quedar atrás de las fases
  funcionales que siguen avanzando en la rama base.
- **Merge a main/master SOLO con autorización** de Aurelio + aprobación visual de
  producto/diseño. Nunca auto-merge.
- Cada AI/paquete trabaja en una **sub-rama** desde `design/kiosqui-system`
  (ej. `design/kiosqui-system--pub-card`) y abre PR **hacia `design/kiosqui-system`**
  (jamás hacia main/master).

## 1. Reglas de oro (AGENTS.md + handoff §4)

- ❌ **NO tocar backend.** Confirmado por Aurelio: solo UI/UX, sin perder
  funcionalidad. (Gap 8 → solo Camino A frontend; nada de campos nuevos en BD.)
- ❌ NO mergear a `main` hasta aprobación visual de producto/diseño.
- ❌ NO tocar lógica de negocio (hooks React Query, `AuthContext`, `middleware`).
  Solo *skin*: markup + estilos + iconografía + copy.
- ❌ NO inventar copy nuevo sin `TODO(copy)`. Voseo guatemalteco.
- ❌ NO `any`, NO MUI, NO Tailwind, NO libs nuevas. Bootstrap + SCSS.
- ❌ NO hardcodear `var(--navy-XXX)` donde aplique el rol semántico
  (`--fg-strong`, `--bg`, `--surface`, `--border`) → dark mode automático.
- ✅ `npx tsc --noEmit && npx next build` limpio antes de CADA commit.
- ✅ Commits con prefijo `design:` **citando la referencia del prototipo**.
- ✅ styled-jsx con `:global(...)`; dark vía `:global([data-theme='dark']) .sel`.
- ✅ Separadores `rgba(128,128,128,.2)` (visibles en light y dark).
- ✅ **Feedback a Claude Design:** si algo falta en el prototipo (pantalla/estado
  no cubierto, token que tenés que inventar, decisión de producto sin resolver),
  NO improvises: anotalo en `docs/phases/kiosqui-feedback-claude-design.md` (creá
  el archivo si no existe) y marcá `TODO(design)` en el código. Claude Design pidió
  este feedback (handoff §3) — es el canal de ida y vuelta con diseño.

## 2. Gotchas heredados (de PENDING_PHASE_BRAND_KIOSQUI.md §3 — LEER)

Aprendidos en el intento previo; aplican igual a esta paleta:

- **3.1 — SCSS hoistea `@import 'x.css'` al tope del bundle** y pierde la cascada.
  Por eso los CSS de Kiosqui se importan en `src/app/layout.tsx` (import JS, Next
  respeta el orden), **NO** con `@import` dentro de un `.scss`. Mantenerlo así.
- **3.3 — `.fill-btn` usa `background-image: linear-gradient(...)`** que pinta
  sobre `background-color`. La solución de Gap 1 reemplaza la regla entera (sin
  `background-image`), así que queda resuelto — pero NO dejar gradientes sueltos.
- **3.4 — `_body-color.scss` tiene MUCHOS fondos dark hardcodeados** que NO
  responden a `--clr-bg-*`: `.sticky #0c1423`, `.header-main2 #111826`,
  `.header-main2-content #181f2d`, `.menu2-side-bar #181f2d`, inputs `#1c2434`,
  bordes `#262e3e`, etc. (tabla completa en §3.4 de ese doc). **Esto cae en WP-4**
  (header/footer/sidebars): hay que sobreescribir esos selectores a tokens
  semánticos en dark, uno por uno.
- **3.5 — auth pages** (`LoginContent.tsx`) tienen `background:url(...)` inline a
  un placeholder del template. Es intencional: se reemplaza el **archivo**, no el
  código. (Fuera de scope de los WP actuales — listado para no romperlo.)
- **3.6 — `.login-wrapper` bg `#eff1f5` hardcodeado en light** (`_register.scss`).
  Mapear a `--clr-bg-white` cuando se re-skineen auth (futuro).
- **§5 — selectores de precio** ya identificados: `.art-price`, `.meta-price`,
  `.pv-price`, `.pp-amount`. Útiles para WP-2/WP-5.

## 3. Moneda — RESUELTO leyendo el backend (sin tocarlo)

- **Propiedades:** la tabla `pub_detail` tiene `pubdet_currency varchar(3)
  DEFAULT 'GTQ'` (ISO 4217, GTQ o USD **por publicación**). El frontend **ya** lo
  respeta: `types/api.ts` expone `currency: 'GTQ' | 'USD'` y `PublicationCard.tsx`
  usa `formatPrice(publication.price, publication.currency, ...)`.
  → **WP-2/WP-5 NO cambian la moneda**: mantienen `formatPrice(price, currency)`
  tal cual; solo cambia el markup/estilo.
- **Planes (pricing):** `subscriptions.sub_price numeric(10,2)` **sin columna de
  moneda**; los seeds (0/5/40/75/420/780) leen como **USD**. Sin tocar backend no
  hay forma de marcar moneda por plan. → **WP-7 mantiene `$` (USD)** en el pricing;
  el cambio a `Q` sería decisión de producto a aplicar SOLO en el `fmtPrice` del
  frontend (no en BD). Default: **dejar `$`**, marcar `TODO(currency-plan)`.

## 4. Decisiones (estado)

| # | Decisión | Estado |
|---|---|---|
| D1 | Número de fase | ✅ **Fase 17** (confirmado por Aurelio + PENDING_PHASE doc). |
| D2 | Moneda | ✅ Propiedades: per-listing (ya OK). Planes: `$`/USD, sin backend. |
| D3 | Plan recomendado | ✅ **Camino A** (const frontend). Camino B (backend) descartado. |
| D4 | (Claude Design) pantallas sin referencia | ver §5.3 — pendiente que diseñe. |

## 5. Respuestas a las 5 preguntas de Claude Design (handoff §3)

1. **¿bridge.css aguanta los re-skins?** Sí para color/tokens. Para markup/layout
   nuevo hace falta **SCSS dedicado por feature** (`_pub-card.scss`,
   `_header-kq.scss`, `_property-detail.scss`, `_publish-flow.scss`) +
   primitivas de `components.css`. Bridge = capa de color; partials = estructura.
2. **Componentes de alta complejidad lógica (requieren diseño extra):** `Upload/`
   (wizard multi-paso + Formik/Yup + subida imágenes/visor 3D),
   `AdvancedFiltersPanel` (estado de filtros), `PublicationContent` (galería +
   visor 3D + tarjeta de agente), `MessagesMain` (no está en el kit).
3. **Pantallas SIN referencia visual** (que Claude Design decida diseñar):
   `/messages`, `/admin`, `/soporte`, `/forum`, `/contact`, `/faq`,
   `/creator-profile*`, `/company`, `/empresa`, auth (`/login` `/register`
   `/forgot` `/verify`), legales (`/terminos` `/privacidad` `/terms`),
   `/activity`, `/invite`, `/survey`, `/pauta`. Reutilizan pub-card: `/favorites`,
   `/my-publications`. Legacy a decidir si rebrand o retiro: `/art-ranking`,
   `/wallet-connect`, `/explore-arts`, `/home-two`.
4. **Decisiones de producto sin humano:** solo moneda de planes (D2) →
   `TODO(currency-plan)`. `RECOMMENDED_PLAN_ID` (D3) lo confirma Aurelio con el ID
   real del plan a destacar.
5. **Tokens inventados localmente:** ninguno fuera del sistema en home/pricing.
   Falta formalizar **`--rating`** (lo agrega F0.2). Si un WP necesita un
   gris/radius nuevo, lo agrega a `colors_and_type.css`, no local.

## 6. Arquitectura del trabajo: contrato + fan-out

Núcleo (**Foundation**) que define el contrato compartido (tokens + primitivas +
logo) y va PRIMERO con un solo dueño; luego **hojas paralelas** que tocan archivos
disjuntos. Anti-conflicto:
- **Solo Foundation toca el SCSS del scaffold** (`public/assets/scss/component/*`).
- **Cada re-skin agrega partials NUEVOS** → cero conflictos entre AIs.
- Cada AI en su **sub-rama** desde `design/kiosqui-system` → PR hacia ella.

```
Foundation (F0) ── 1 dueño, PRIMERO ─────────────────────────────────┐
  F0.1 branch + portar/commitear home+pricing                         │
  F0.2 token --rating                                                 │ contrato
  F0.3 primitivas: .fill-btn, .badge-*, preloader (Gaps 1,3,5)        │
  F0.4 logo → public/brand/ + KiosquiLogo.tsx (Gap 6)                 │
└──────────────────────────────────────────────────────────────────────┘
        ├── WP-1  Codex        — gaps mecánicos (rating, tints) [Gaps 2,4]
        ├── WP-2  Claude Code A — PublicationCard (CRÍTICO)     [§2.1]
        ├── WP-3  Claude Code A — AdvancedFiltersPanel          [§2.3]
        ├── WP-4  Claude Code B — Header + Footer + dark 3.4    [§2.2, §2.6]
        ├── WP-5  Claude Code C — PropertyDetail                [§2.4]
        ├── WP-6  Claude Code C — Upload publish flow           [§2.5]
        └── WP-7  Aurelio/Claude — Pricing voseo + recomendado  [Gaps 7,8]
```

Referencias de markup: `kiosqui-design-handoff/_handoff 2/landing.html` (estilos
`.pub-*`, `.nav`, `.footer`, `.pp-*`) y `ui_kit_reference/*.jsx`. Las decisiones
CSS exactas de los 8 gaps están en `02-NEXT-STEPS.md §1` (no se repiten acá).

## 7. Paquetes de trabajo — prompts listos para pegar

> **Encabezado común** (pegar antes de cada prompt):
>
> ```
> Trabajás en el repo ecommerceGT-Next (Kiosqui, marketplace inmobiliario GT).
> ANTES de tocar código leé: AGENTS.md, docs/phases/rebranding-kiosqui-plan.md,
> docs/PENDING_PHASE_BRAND_KIOSQUI.md (gotchas §3), docs/KIOSQUI_BRAND_GAPS.md y
> kiosqui-design-handoff/_handoff 2/02-NEXT-STEPS.md. Estás en la rama
> design/kiosqui-system (NUNCA main); trabajá en la sub-rama indicada.
> Reglas: NO tocar backend; NO tocar lógica (hooks/AuthContext/middleware), solo
> skin; NO `any`; Bootstrap+SCSS; español/voseo; tsc --noEmit + next build limpio
> antes de commitear; cada commit `design:` citando la referencia del prototipo.
> Si aparece una decisión de producto, marcá TODO y reportá — no la resuelvas solo.
> ```

### F0 — Foundation (1 dueño, PRIMERO)

> **ESTADO: F0.1 ✅ HECHO (2026-06-05).** La rama `design/kiosqui-system` ya existe
> y está pusheada a origin en **ambos** repos; home/pricing ya están migrados y
> commiteados (`5f13a74`), junto con el plan, el gaps doc y el paquete de handoff.
> **Codex: empezá directo en F0.2.** NO recrees la rama ni re-portes home/pricing.

```
Objetivo: completar el contrato compartido (tokens + primitivas + logo).
1. ✅ HECHO — rama design/kiosqui-system creada + pusheada (ambos repos) y
   home/pricing migrados/commiteados. Solo hacé:
   git fetch && git checkout design/kiosqui-system && git pull
   (Los CSS de Kiosqui se importan en src/app/layout.tsx — NO moverlos a un
   @import de SCSS: gotcha 3.1.)
2. Token --rating en src/style/kiosqui/colors_and_type.css:
   :root{--rating:var(--green-600);} [data-theme="dark"]{--rating:var(--green-400);}
3. Primitivas globales (bloques CSS EXACTOS de 02-NEXT-STEPS.md §1):
   - Gap 1: reemplazar `.fill-btn` + variantes + `.fill-btn-outline` + `-sm/-lg`
     en _common.scss; borrar los linear-gradient de _about.scss:173,
     _art.scss:185,472,474, _creator.scss:48,294-296, _footer.scss:144,
     _custome.scss:44.
   - Gap 3: `.badge-featured/.badge-status/.badge-type` en partial nuevo _badges.scss.
   - Gap 5: spinner de marca en _preloader.scss (reemplaza #2785ff).
4. Gap 6: copiar _handoff 2/assets/logo-*.png → public/brand/; crear
   src/components/common/KiosquiLogo.tsx (código en 02-NEXT-STEPS.md §1 Gap 6).
   NO integrarlo aún (eso es WP-4).
5. tsc + build limpio. Commits `design:` separados. Push. Avisar para fan-out.
```

### WP-1 — Gaps mecánicos (Codex) · `design/kiosqui-system--gaps-mecanicos`

```
Objetivo: Gap 2 (estrellas) y Gap 4 (tints azules). Find-replace dirigido, sin
tocar lógica ni layout.
- Gap 2: `#f59e0b` → `var(--rating)` en CreatorProfileMain.tsx:37,555,
  SurveyMain.tsx:36,137,161, CompanyTeamMain.tsx:366, PublicationContent.tsx:390,
  FeaturedPublicationsSection.tsx:45, notificationUtils.ts:110,192.
- Gap 4: reemplazos contextuales (tabla 02-NEXT-STEPS.md §1 Gap 4):
  PaymentMethodsTab.tsx:617→lav-200/lav-500; AdminConfigMain.tsx:244→--accent-soft;
  CookieConsentBanner.tsx:112→lav-200/lav-500; PublicationsMain.tsx:417→
  green-100/green-600.
- Verificar que no quede `rgba(39,133,255,...)`. tsc + build limpio.
```

### WP-2 — PublicationCard (Claude Code A) · `design/kiosqui-system--pub-card` ⭐ CRÍTICO

```
Objetivo: re-skin de src/components/publications/PublicationCard.tsx al patrón
`.pub-card` del prototipo (landing.html FEATURED + ui_kit_reference/PropertyCard.jsx).
Se usa en publications, favorites, my-publications, home featured.
- Mantener TODA la lógica/props/hooks (favoritos, navegación, tracking). MANTENER
  `formatPrice(publication.price, publication.currency, ...)` tal cual — la moneda
  ya es per-listing (GTQ/USD), NO cambiarla.
- Markup base en 02-NEXT-STEPS.md §2.1; mapear data-binding a las props reales
  (leer PublicationCard.tsx primero).
- Extraer estilos `.pub-*` de landing.html a partial NUEVO _pub-card.scss (@use en
  main.scss). NO tocar SCSS de scaffold. Badges con `.badge-featured/.badge-status`.
- Verificar las 4 pantallas que la consumen. tsc + build limpio.
```

### WP-3 — AdvancedFiltersPanel (Claude Code A) · `design/kiosqui-system--filters`

```
Objetivo: re-skin de AdvancedFiltersPanel.tsx (+ contenedor de búsqueda) a chips
horizontales + modal (02-NEXT-STEPS.md §2.3). Lógica de filtros/fetch INTACTA.
Chips `.kq-chip`; "Filtros" outline pill; slider lavanda; checks verdes; "Aplicar"
verde, "Limpiar" ghost. tsc + build limpio.
```

### WP-4 — Header + Footer + dark hardcodes (Claude Code B) · `design/kiosqui-system--header-footer`

```
Objetivo: re-skin de HeaderTwo.tsx (+ HeaderOne.tsx) y Footer.tsx/FooterTwo.tsx
(02-NEXT-STEPS.md §2.2/§2.6; landing.html `.nav`/`.footer`). Integrar
<KiosquiLogo/> (footer variant="dark") y en MobileMenu.tsx.
- Header sticky translúcido, nav Comprar/Rentar/Cómo funciona/Precios/Vendedores,
  theme toggle, Guardados c/contador, "Iniciar sesión" ghost, "Publicar" verde
  (.fill-btn), sin gradient bar (solo border-bottom).
- ⚠️ IMPORTANTE (gotcha 3.4): _body-color.scss tiene fondos dark hardcodeados que
  NO responden a vars (.sticky, .header-main2, .header-main2-content,
  .menu2-side-bar, inputs #1c2434, bordes #262e3e...). Sobreescribirlos a tokens
  semánticos en dark (ver tabla en PENDING_PHASE_BRAND_KIOSQUI.md §3.4).
- NO cambiar lógica de navegación/auth/sidebars. tsc + build limpio.
```

### WP-5 — PropertyDetail / PublicationContent (Claude Code C) · `design/kiosqui-system--detail`

```
Objetivo: re-skin de PublicationContent.tsx (02-NEXT-STEPS.md §2.4 +
ui_kit_reference/PropertyDetail.jsx): gallery grid, badges sobre el título, H1
display, spec tiles (4), amenidades como `.badge-featured`, tarjeta de agente
sticky (top:88px) con precio grande, "Contactar" verde, "Enviar mensaje" outline.
- Mantener `formatPrice(price, currency)`. NO tocar galería/visor 3D ni mensajería
  a nivel lógico. Partial nuevo _property-detail.scss. tsc + build limpio.
```

### WP-6 — Upload / publish flow (Claude Code C/D) · `design/kiosqui-system--publish`

```
Objetivo: re-skin del wizard en src/components/Upload/ a 4 pasos con stepper
(02-NEXT-STEPS.md §2.5 + ui_kit_reference/PublishFlow.jsx). CUIDADO: Formik/Yup +
subida de imágenes — NO tocar lógica, solo skin del stepper y contenedores.
Stepper: verde (completado)/navy (activo)/gris (futuro). Partial _publish-flow.scss.
tsc + build limpio.
```

### WP-7 — Pricing: voseo + plan recomendado (Aurelio/Claude) · `design/kiosqui-system--pricing-polish`

```
Objetivo: cerrar Gaps 7 y 8 en PricingPlanMain.tsx (02-NEXT-STEPS.md §1).
- Voseo: aplicar los strings de la tabla del Gap 7 (Elegí/Publicá/gestioná/...).
- Moneda: MANTENER `$` (los planes no tienen moneda en backend y los seeds son
  USD; no se toca backend). Dejar comentario TODO(currency-plan).
- Plan recomendado (Camino A, frontend-only): `const RECOMMENDED_PLAN_ID = 3;`
  (sub_id 3 = "empresa pequeña" mensual — confirmado por Aurelio) + clase `is-recommended` + badge
  "Más popular" verde + CTA verde (estilos `.pp-card.is-recommended` de
  landing.html). Camino B (campo backend) DESCARTADO.
- tsc + build limpio.
```

## 8. Verificación por paquete

Cada WP: `npx tsc --noEmit && npx next build`, levantar dev y revisar las
pantallas tocadas en **light y dark** (toggle del header). Cards y pricing
necesitan backend levantado para datos reales; sin backend, verificar que no
rompe layout y que cargan los estilos.

## 8bis. Revisión por mini-fase (gate de calidad — NO saltar)

Cada paquete (F0, WP-1..7) **no se da por cerrado** hasta pasar revisión:
1. La IA ejecutora abre **PR de su sub-rama → `design/kiosqui-system`** (nunca a
   main). En el PR: qué archivos del prototipo usó de referencia + captura
   light/dark.
2. **Revisión por Claude** (sesión aparte, patrón AGENTS.md §10.2): leer el diff,
   validar reglas (NO backend, NO lógica, NO `any`, tokens semánticos, voseo),
   correr `tsc --noEmit` + `next build`, revisar la pantalla en light y dark.
3. **Solo con visto bueno** se mergea la sub-rama a `design/kiosqui-system`.
4. Hallazgos de diseño → `docs/phases/kiosqui-feedback-claude-design.md`.

Prompt de revisión (pegar en una sesión Claude por cada PR):
```
Otra IA trabajó el paquete <F0/WP-N> en la sub-rama <nombre> hacia
design/kiosqui-system. Leé AGENTS.md y docs/phases/rebranding-kiosqui-plan.md.
Corré `git diff design/kiosqui-system...<sub-rama>`. Validá: NO toca backend ni
lógica (hooks/AuthContext/middleware); usa tokens semánticos (dark OK); voseo; sin
`any`; `tsc --noEmit` + `next build` limpios; pantalla(s) OK en light y dark.
Reportá: qué está bien, qué ajustar, y si está listo para mergear a
design/kiosqui-system o necesita correcciones. Anotá gaps en
docs/phases/kiosqui-feedback-claude-design.md.
```

## 9. Orden sugerido con presupuesto acotado

1. **F0.2–F0.4** (F0.1 ✅ ya hecho; desbloquea todo) — Codex o un Claude Code.
2. **WP-1** a Codex (mecánico, barato) en paralelo con WP-2.
3. **WP-2 (PublicationCard)** — mayor impacto visual, temprano.
4. **WP-4 (header/footer + dark 3.4)** — se ve en toda la app.
5. **WP-5/WP-6 (detail/upload)** — grandes, repartir entre instancias.
6. **WP-3 y WP-7** al final.

Cada paquete es independiente: si una ventana se agota, el resto sigue.
