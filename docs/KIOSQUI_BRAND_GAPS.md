# Kiosqui — Brand gaps tras la migración de Home + Pricing

**Fecha:** 2026-06-05
**Contexto:** Se migró la home (`src/components/home-three/`) y el pricing
(`src/components/pricing/PricingPlanMain.tsx`) al sistema de diseño Kiosqui
(navy/verde/lavanda/cream). El mecanismo central es un **puente de variables**
(`src/style/kiosqui/bridge.css`) que remapea las `--clr-*` del template Oction a
los tokens de marca. Eso recoloreó **toda la app de un golpe** para todo lo que
usa esas variables.

**El problema:** lo que usa **hex hardcodeado** (no variables) NO responde al
puente y sigue con el azul/morado/ámbar del template. Este documento lista esos
huecos para que claude design provea los reemplazos de marca.

---

## Tokens de marca disponibles (de `src/style/kiosqui/colors_and_type.css`)

- Navy: `--navy-800` `#1e2d4a` (primary) … escala `--navy-{100..950}`
- Verde (acción/CTA): `--green-500` `#9bc64a` … escala `--green-{100..800}`
- Lavanda (acento): `--lav-500` `#b5acef` … escala `--lav-{100..700}`
- Cream/canvas: `--cream` `#f8f4ee`, `--paper`, `--sand-{100..300}`
- Semánticos (auto light/dark): `--bg --surface --fg-strong --fg-muted --border --action --accent`
- Logos: `kiosqui-design-handoff/assets/logo-{cream-bg,navy-bg,transparent}.png`

---

## Inconsistencias a resolver

### 1. Botón primario global `.fill-btn` (ALTA prioridad)
Gradiente azul→morado hardcodeado, es el botón de acción de toda la app
(header "Publicar", register, account, creator, etc.).

- `public/assets/scss/component/_common.scss:568` — `linear-gradient(to right, #2b81ff, #7237ff, #2b81ff)`
- Repetido en: `_about.scss:173`, `_art.scss:185,472,474`, `_creator.scss:48,294-296`, `_footer.scss:144`, `_custome.scss:44`

**Pedido a claude design:** definir el sistema de botón de marca (¿verde
`--action` con texto navy? ¿navy sólido? ¿gradiente navy→lavanda?) y dar el SCSS
de reemplazo de `.fill-btn` + variantes (`.fill-btn-orange/-lightblue/-lightred`).
En la home ya se hizo localmente: búsqueda y CTAs usan verde `--green-500` con
texto `--navy-900` — conviene que `.fill-btn` sea consistente con eso.

### 2. Estrellas de rating — ámbar `#f59e0b`
Fuera de paleta (navy/verde/lavanda no tienen ámbar).
- `CreatorProfileMain.tsx:37,555`, `survey/SurveyMain.tsx:36,137,161`,
  `company/CompanyTeamMain.tsx:366`, `publications/PublicationContent.tsx:390`,
  `publications/FeaturedPublicationsSection.tsx:45`, `notifications/notificationUtils.ts:110,192`
- En la home ya se cambió la estrella de TopSellers a `--green-600`.

**Pedido:** ¿se mantiene el ámbar para ratings (color "estrella" clásico) o se
unifica a `--green-600`? Definir un token (`--rating` / `--star`) y aplicarlo.

### 3. Badges "pautada"/destacado — gradiente ámbar `#fbbf24,#d97706`
- `publications/PublicationCard.tsx:297,430`, `publications/PublicationViewerMain.tsx:365,548`,
  `publications/MyPublicationsMain.tsx:616,617,624`, `support/SupportReportsMain.tsx:263,266`

**Pedido:** gradiente/insignia de marca para "destacado/pautado" (la referencia
usa lavanda `--lav-500` para "Destacado" y verde para tags de estado).

### 4. Tints azules de fondo — `rgba(39,133,255,.x)`
Fondos suaves que no usan variable y quedan azules sobre navy.
- `Creator-Profile-info/PaymentMethodsTab.tsx:617`, `admin/AdminConfigMain.tsx:244`,
  `legal/CookieConsentBanner.tsx:112`, `publications/PublicationsMain.tsx:417`

**Pedido:** reemplazar por `--accent-soft` (lavanda) o `--green-100` según rol.

### 5. Preloader — spinner `#2785ff`
- `public/assets/scss/component/_preloader.scss:36`
**Pedido:** color de spinner de marca (navy o lavanda).

### 6. Logo del header/footer
El handoff trae logos cream/navy/transparente, pero el header (`HeaderTwo`) y
`Footer`/`FooterTwo` siguen con el branding del template.
**Pedido:** integrar el logo Kiosqui con swap por tema
(`logo-cream-bg.png` en light, `logo-navy-bg.png` en dark).

### 7. Pricing — copy y moneda (decisión de producto, NO técnica)
`PricingPlanMain.tsx` usa **tuteo** ("Elige el plan ideal para ti") y símbolo
**`$`** hardcodeado en `fmtPrice` (línea 13). La marca pide **voseo** ("Elegí…
para vos") y **`Q`** (Quetzales).
**No se cambió** para no tergiversar montos si el backend está en USD.
**Pedido / decisión:** confirmar moneda real de los planes y, si es GTQ, pasar
`fmtPrice` a `Q` y el copy a voseo (alineado con la referencia `landing.html`).

### 8. Pricing — sin flag "recomendado/popular" en el backend
El tipo `Plan` (`src/types/api.ts`) no tiene campo destacado. La referencia
resalta "Pro (Más popular)"; el componente real resalta el **plan actual** del
usuario (`.is-current`). Si se quiere un plan recomendado fijo, hay que agregar
un campo al backend/`Plan` y un toggle de UI.

---

## Prompt listo para pegar a claude design

> Estoy migrando la app `ecommerceGT-Next` (Kiosqui, marketplace inmobiliario
> GT) al nuevo sistema de diseño. Ya hay un puente de variables que remapea las
> `--clr-*` del template Oction a los tokens de marca (navy `#1e2d4a` / verde
> `#9bc64a` / lavanda `#b5acef` / cream `#f8f4ee`), definidos en
> `src/style/kiosqui/colors_and_type.css`. La home y el pricing ya están
> on-brand. Necesito que cubras los elementos con color **hardcodeado** que el
> puente no alcanza (lista abajo). Para cada uno, dame el SCSS/TSX de reemplazo
> usando los tokens semánticos (`--action`, `--accent`, `--navy-*`, `--green-*`,
> `--lav-*`) y que funcione en light y dark (`[data-theme="dark"]`):
>
> 1. Sistema de botón `.fill-btn` (gradiente azul→morado `#2b81ff,#7237ff`) en
>    `_common.scss:568` y repeticiones en `_about/_art/_creator/_footer/_custome`.
>    Debe quedar consistente con la home (CTA verde `--green-500` + texto navy).
> 2. Color de estrellas de rating (`#f59e0b`) → definir token `--rating`.
> 3. Badges "destacado/pautado" (gradiente ámbar `#fbbf24,#d97706`).
> 4. Tints de fondo `rgba(39,133,255,.x)` → `--accent-soft` / `--green-100`.
> 5. Spinner del preloader (`#2785ff`, `_preloader.scss:36`).
> 6. Integrar logo Kiosqui en header/footer con swap por tema (assets en
>    `kiosqui-design-handoff/assets/`).
> 7. Pricing: confirmar moneda (`$`→`Q`?) y pasar copy a voseo.
>
> Mantené todo aislado/revertible y respetá AGENTS.md (SCSS+Bootstrap, voseo,
> `"use client"` en componentes con estado).

---

## Cómo revertir TODA la migración

1. Quitar de `src/app/layout.tsx` los 3 `import '../style/kiosqui/*.css'`.
2. Quitar de `src/app/[locale]/layout.tsx` los `<link>` de Encode Sans + preconnect.
3. `rm -rf src/style/kiosqui public/fonts/encode-sans-expanded`
4. `git checkout -- src/components/home-three src/components/pricing/PricingPlanMain.tsx`

(O simplemente descartar la rama `claude/interesting-aryabhata-529860`.)
