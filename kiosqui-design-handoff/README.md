# Kiosqui Design Handoff — para Claude Code

Hola Claude Code 👋. Este paquete contiene el sistema de diseño nuevo de
**Kiosqui** (marketplace inmobiliario, repo `ecommerceGT-Next`). Tu objetivo
es migrar la home actual al nuevo sistema visual, **respetando la estructura
de componentes existente y la lógica/hooks** — solo cambian estilos, colores,
tipografía y un poco de copy.

## Contexto del repo de destino

- Next.js 13 App Router + TypeScript + Bootstrap 5 + SCSS.
- La home oficial se monta en `src/app/page.tsx` → `HomeThreeMain`.
- Componentes a tocar viven en `src/components/home-three/`:
  - `KiosquiHero.tsx`
  - `FeaturedShowcase.tsx`
  - `CategoriesShowcase.tsx`
  - `TopSellersShowcase.tsx`
  - `HowItWorks.tsx`
  - `HomeCTA.tsx`
- También opcionalmente `src/components/pricing/PricingPlanMain.tsx`.
- Existe `next-themes` con `data-theme` en `<html>` y un `ThemeChanger.tsx`.
  El nuevo sistema **ya soporta light + dark**.

## Lo que está en este paquete

```
kiosqui-design-handoff/
├── README.md              ← este archivo (instrucciones para vos)
├── landing.html           ← REFERENCIA VISUAL — abrila en el browser para ver el resultado esperado
├── colors_and_type.css    ← tokens crudos (color scales, type, radii, shadows) + dark mode
├── components.css         ← primitivas reusables (botones, inputs, badges, chips, cards)
├── assets/                ← logos en navy, cream y transparente + palette.png
└── fonts/                 ← Encode Sans Expanded (Regular/Medium/Bold/Black) — fuente de marca
```

## Sistema de diseño — resumen ejecutivo

### Colores (light mode)
- **Navy `#1e2d4a`** — primary, headings, dark sections (`--primary`, `--navy-800`)
- **Verde `#9bc64a`** — action / CTA / verificación (`--action`, `--green-500`)
- **Lavanda `#b5acef`** — accent, lente del logo, focus ring (`--accent`, `--lav-500`)
- **Cream `#f8f4ee`** — canvas/paper (`--bg`, `--cream`)
- **Ink `#22252a`** — máxima oscuridad / footer (`--ink-900`)

### Dark mode
Activado con `[data-theme="dark"]` en `<html>` (compatible con `next-themes`).
Los anchors de marca NO cambian; cambian las variables semánticas (`--bg`,
`--surface`, `--fg`, `--fg-strong`, `--border`, shadows). Ver
`colors_and_type.css` líneas con `[data-theme="dark"]`.

> **Importante:** NO hardcodees `var(--navy-XXX)` o `var(--ink-XXX)` directamente
> en componentes. Usá las variables semánticas (`--fg-strong`, `--fg-muted`,
> `--bg`, `--surface`, `--border`) para que el dark mode funcione automáticamente.

### Tipografía
- **Encode Sans Expanded** → display, headings, hero (la cara del wordmark).
  Está en `fonts/` como TTF — agregar como `@font-face` o subir a `public/fonts/`.
  Pesos provistos: 400, 500, 700, 900.
- **Encode Sans** (no expanded) → body, UI. Cargar de Google Fonts:
  `<link href="https://fonts.googleapis.com/css2?family=Encode+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">`
- Headings: `font-weight: 700-800`, `letter-spacing: -0.02em`.

### Tono / copy
- **Voseo guatemalteco**: "Encontrá", "Buscás", "Publicá", "Cerrás", "Filtrá".
- Trust language: "verificado con DPI", "Sin intermediarios escondidos", "visor 3D".
- Currency: `Q` (Quetzales), e.g. `Q 1,850,000`, `Q 4,200/mes`.
- Casing: sentence case en todo (los únicos UPPERCASE son overlines pequeños).

### Visual
- **Botones pill** (`border-radius: 999px`) — esto es un sello de marca.
- **Cards**: `border-radius: 20px`, borde warm `#e6ddcf`, shadow soft navy-tinted.
- **Hover en cards**: lift `translateY(-2px)` + shadow más profunda.
- **Focus ring**: lavanda (`box-shadow: 0 0 0 3px rgba(181,172,239,.55)`).
- **Iconos**: Font Awesome 5 (`fas fa-*`) — el repo ya lo carga.

## Lo que hay que hacer

### Paso 1 — Instalar tokens
1. Copiar `colors_and_type.css` y `components.css` a `src/style/kiosqui/` (o a
   donde el repo prefiera tener vars globales). Importarlos en `src/style/index.scss`:
   ```scss
   @import './kiosqui/colors_and_type.css';
   @import './kiosqui/components.css';
   ```
2. Copiar las 4 TTFs de `fonts/` a `public/fonts/encode-sans-expanded/` y
   verificar que las rutas en `@font-face` del `colors_and_type.css` apunten
   correctamente (ajustá `url(...)` si hace falta).
3. Agregar el `<link>` de Google Fonts en `src/app/layout.tsx` `<head>`:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link href="https://fonts.googleapis.com/css2?family=Encode+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
   ```

### Paso 2 — Mapear los tokens del template a los de Kiosqui
El template usa `--clr-theme-1: #2785ff` (azul). En el SCSS global del scaffold
(`public/assets/scss/main` o donde estén las vars), agregá overrides:

```scss
:root {
  --clr-theme-1: var(--navy-800);
  --clr-bg-bodylight: var(--cream);
  --clr-bg-white: var(--surface);
  --clr-bg-gray: var(--paper);
  --clr-common-heading: var(--fg-strong);
  --clr-common-body-text: var(--fg-muted);
  --clr-common-border: var(--border);
  --clr-common-placeholder: var(--fg-subtle);
}
[data-theme="dark"] {
  --clr-theme-1: var(--lav-400); /* en dark, los acentos del template van a lavanda */
  --clr-bg-bodylight: var(--bg);
  /* … etc */
}
```

Esto hace que TODO el template (no solo home-three) cambie de un toque sin
tocar cada componente.

### Paso 3 — Refinar componentes de home-three
Para cada uno de los 6 componentes de `src/components/home-three/`, los
estilos `<style jsx>` ya usan `var(--clr-theme-1)` y `var(--clr-common-*)`,
así que con el paso 2 ya van a quedar en navy. Pero **mirá `landing.html` como
referencia** y aplicá estos refinamientos específicos:

#### `KiosquiHero.tsx`
- Botón "Buscar" → fondo `var(--green-500)` con texto `var(--navy-900)` (NO el azul del template).
- Borde de búsqueda pill (`border-radius: 999px`), no 12px.
- Chip de "Buscar por tipo" → hover lavanda, no azul.
- Trust icons en verde (`var(--green-600)`).
- Bg con halos lavanda/verde radial:
  ```css
  background:
    radial-gradient(900px 480px at 85% -10%, rgba(181,172,239,.28), transparent 60%),
    radial-gradient(700px 400px at -10% 110%, rgba(155,198,74,.18), transparent 60%),
    var(--cream);
  ```

#### `FeaturedShowcase.tsx`
- Link "Ver todas" → `var(--lav-700)`.
- Mantener layout, solo refinar.

#### `CategoriesShowcase.tsx`
- Reemplazar los 3 gradients hardcoded:
  - Casa → `linear-gradient(135deg, var(--navy-800), var(--navy-600))`
  - Apartamento → `linear-gradient(135deg, var(--green-600), var(--green-500))`
  - Terreno → `linear-gradient(135deg, var(--lav-600), var(--lav-500))`
- En dark mode, sobreescribir Casa a lavanda (el navy se pierde sobre dark surface).

#### `TopSellersShowcase.tsx`
- Checkmark verificado en `var(--green-500)` con texto `var(--navy-900)`.
- Handles `@username` en `var(--lav-700)`.

#### `HowItWorks.tsx`
- Steps con icon bg alternados: lavanda / verde / neutro / lavanda.
- Número de step en `var(--navy-800)` con texto cream.

#### `HomeCTA.tsx`
- Fondo: `var(--navy-800)` con halos radial lavanda y verde adentro.
- Primary button → `var(--green-500)` con texto `var(--navy-900)` (NO `#fff`).
- Secondary link → `var(--lav-300)` con underline.

### Paso 4 — Pricing (`PricingPlanMain.tsx`)
- Toggle Mensual/Anual: cápsula con fondo `var(--navy-800)` para el activo.
- Card destacada ("Más popular" en Pro): borde y badge en `var(--green-500)`.
- Botón CTA de la card destacada en verde, las demás outline.
- Ver sección `.pp-*` en `landing.html`.

### Paso 5 — Verificá
1. Levantá `npm run dev` y mirá `http://localhost:3000`.
2. Probá el theme toggle (light ↔ dark) — todo debería seguir legible y on-brand.
3. `npx tsc --noEmit && npx next build` antes de cerrar.

## Reglas del proyecto a respetar (de AGENTS.md)

- Componentes con hooks/estado → `"use client"`.
- Strings nuevos visibles → en español, voseo.
- Estilos: SCSS + Bootstrap (no Tailwind, no MUI).
- Tipos de backend en `src/types/api.ts`.
- Errores de `ApiFetch`: `e instanceof ApiError ? e.message : 'Error inesperado'`.

## Si tenés dudas
- Abrí `landing.html` localmente para ver el resultado esperado en light y dark.
- Mirá `colors_and_type.css` para todos los tokens disponibles.
- Mirá `components.css` para primitivas (`.kq-btn`, `.kq-card`, `.kq-badge`, etc).

¡Buena suerte! 🚀
