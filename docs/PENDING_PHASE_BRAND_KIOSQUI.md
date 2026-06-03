# Fase pendiente — Aplicación de la paleta de marca KIOSQUI

**Estado:** Diferida.
**Última prueba:** 2026-06-02 (rollback en commit `0748da4`).
**Por qué se diferió:** El tono del dark no convenció en ninguna de las dos
variantes probadas (verde como body y ink+crema). Para retomar se necesita un
**brief de diseño más sólido** del equipo de marca (referentes visuales,
mockups por pantalla, ratios de contraste objetivo, dónde sí y dónde no entran
los acentos).

Este documento concentra todo lo aprendido durante la prueba para que la
siguiente iteración no tenga que redescubrir los mismos gotchas.

---

## 1. Paleta de marca (referencia)

| Hex | Nombre | Rol propuesto en el experimento |
|---|---|---|
| `#0f4c4c` | brand-primary (verde oscuro) | Identidad, logos, links, botones primarios (light) |
| `#f6f0e6` | brand-cream | Texto sobre primario, fondo del body en light |
| `#d97941` | brand-accent (naranja) | Botones primarios, CTAs |
| `#caf492` | brand-highlight (verde lima) | Precios en dark, badges futuros |
| `#1f2933` | brand-ink (azul-negro) | Texto sobre crema, fondo del body en dark |

### Recomendaciones para la próxima iteración
- **No usar el lima sobre crema sin refuerzo** — contraste ~1.3:1, ilegible.
  Reservarlo para fondos oscuros.
- **El verde `#0f4c4c` como body es muy saturado** para una página de listings —
  cansa la vista. Mejor usarlo como acento de marca, no como superficie grande.
- **El ink `#1f2933` como body en dark se ve correcto** pero el conjunto se
  pareció demasiado al template original — la marca no se notaba sin más
  acentos visibles (badges, banners, ilustraciones).
- **Sugerencia para retomar:** acompañar la paleta con tipografía propia,
  ilustraciones o ornamentos de marca para que se note la identidad KIOSQUI
  sin depender únicamente del color del body.

---

## 2. Arquitectura del experimento (lo que funcionó)

### Centralización en un solo archivo
Toda la paleta vivía en `src/style/brand-kiosqui.scss` con dos bloques:

```scss
:root {
  /* tokens semánticos */
  --brand-primary: #0f4c4c;
  --brand-cream:   #f6f0e6;
  --brand-accent:  #d97941;
  --brand-highlight: #caf492;
  --brand-ink:     #1f2933;

  /* on-color tokens */
  --brand-on-primary: #f6f0e6;
  --brand-on-accent:  #ffffff;
  --brand-on-cream:   #1f2933;

  /* mapeo a tokens del template */
  --clr-theme-1: var(--brand-primary);
  --clr-bg-bodylight: var(--brand-cream);
  --clr-common-heading: var(--brand-ink);
  /* ... */
}

[data-theme='dark'] {
  /* sobreescribe los mismos tokens para dark */
}
```

Y se importaba al final de `src/style/index.scss`:

```scss
@import '../../public/assets/scss/main';
@import './brand-kiosqui.scss';   // ← debe ir AL FINAL
```

Para revertir bastaba con borrar el archivo + esa línea.

### Revert path
1. Borrar `src/style/brand-kiosqui.scss`
2. Borrar el `@import './brand-kiosqui.scss';` de `src/style/index.scss`
3. (Opcional) restaurar fallbacks `#6c5ce7` en los 38 archivos donde se
   reemplazaron por `#0f4c4c` — no afecta visualmente (son fallbacks de
   `var()` que la var siempre resuelve), pero da consistencia de código.

---

## 3. Gotchas descubiertos (LO IMPORTANTE)

### 3.1. SCSS reordena `@import 'foo.css'` al inicio del bundle ⚠️
**Síntoma:** cambiamos `--clr-bg-bodylight` en `[data-theme='dark']` pero
el body en dark seguía con el navy del template (`#111826`), no con
nuestro color KIOSQUI.

**Causa raíz:** el archivo se llamaba `brand-kiosqui.css`. Cuando SCSS
encuentra `@import './foo.css'`, **no inlinea** el contenido — lo
convierte en un `@import url(foo.css)` nativo de CSS. Y por spec del
CSS, los `@import` nativos están obligados a aparecer **al inicio** del
archivo compilado.

Resultado en el bundle final:
```css
@import url(brand-kiosqui.css);     /* mis tokens KIOSQUI — quedaron arriba */
... resto del template incluyendo _common.scss y _body-color.scss ...
[data-theme='dark'] { --clr-bg-bodylight: #111826; }  /* template, abajo → gana */
```

**Fix:** renombrar a `.scss`. SCSS inlinea el `.scss` en el lugar exacto
donde lo importás, así gana por cascada normal.

**Cómo detectarlo en el futuro:** los `!important` "se salvan", las
vars en `:root` se pierden. Si los botones funcionan pero el body
bg no, es esto.

### 3.2. El template no setea `background-color` en `body` ⚠️
**Síntoma:** togglear tema dark/light no cambia el fondo.

**Causa:** `public/assets/scss/component/_common.scss` define
```scss
body {
  font-family: $urbanist;
  color: var(--clr-common-body-text);
  /* SIN background-color */
}
```

Pero hay otra clase `.body-bg` en `_body-color.scss`:
```scss
.body-bg { background: var(--clr-bg-bodylight); }
```

Y `src/app/layout.tsx` tiene `<body className="body-bg">`. **OK, sí
funciona** — siempre y cuando los `--clr-bg-bodylight` se resuelvan
correctamente (depende del gotcha 3.1).

### 3.3. El template usa `background-image: linear-gradient(...)` en `.fill-btn` ⚠️
**Síntoma:** botón primario sigue azul→morado aunque cambies el
`background-color`.

**Causa:** `_common.scss` define
```scss
.fill-btn { background-image: linear-gradient(to right, #2b81ff, #7237ff, #2b81ff); }
```
`background-image` se pinta ENCIMA de `background-color`. Para matarlo
necesitás `background-image: none !important`.

### 3.4. El template tiene MUCHOS dark backgrounds hardcoded sin vars ⚠️
**Lista de archivos y selectores afectados** (encontrados en
`public/assets/scss/component/_body-color.scss` bajo el bloque
`[data-theme='dark']`):

| Selector | Color hardcoded | Rol |
|---|---|---|
| `.sticky` | `#0c1423` | Sticky header al hacer scroll |
| `.header-main2` | `#111826` | Header principal en dark |
| `.header-main2-content` | `#181f2d` | Contenido del header |
| `.menu2-side-bar` | `#181f2d` | Sidebar izquierdo |
| `.menu2-mobile-menu...a.mean-expand` | `#181f2d` | Sub-menú móvil |
| `.menu2-sidebar-widget .work-process-single` | `#1c2434` | Widget interno sidebar |
| `.subscribe-form input` | `#1c2434` | Input del newsletter |
| `.header-main2-content .filter-search-input.header-search input` | `#1c2434` | Search del header |
| `.common-select-arrow.common-select-arrow-40.white-bg` | `#1c2434` | Selects |
| `.social__links ul li a` | `#111826` | Botones sociales |
| `.menu2-side-bar` borders | `#262e3e` | Bordes |
| `.menu2-mobile-menu` border | `#262e3e` | |
| `.sidebar-creators-list .creator-single-short` border | `#262e3e` | |
| `.sidebar-category-filter` border | `#262e3e` | |
| `.home3-mode-switch .label` border | `#39404e` | Toggle dark/light |
| `.subscribe-form input` border (separado) | `#2d3136` | |
| `.copyright-support-lines::before/after` | `#222c3a` | Líneas decorativas footer |

**Para retomar:** estos selectores NO se actualizan al cambiar
`--clr-bg-*` vars. Hay que sobreescribirlos uno por uno apuntando a
los tokens semánticos. Lo intentamos así en la prueba:

```scss
[data-theme='dark'] .sticky,
[data-theme='dark'] .header-main2,
[data-theme='dark'] .header-main2-content,
[data-theme='dark'] .menu2-side-bar,
[data-theme='dark'] .menu2-mobile-menu.mean-container .mean-nav ul li a.mean-expand {
  background: var(--clr-bg-white) !important;   /* "raised" surface */
}

[data-theme='dark'] .menu2-sidebar-widget .work-process-single,
[data-theme='dark'] .subscribe-form input,
[data-theme='dark'] .header-main2-content .filter-search-input.header-search input,
[data-theme='dark'] .common-select-arrow.common-select-arrow-40.white-bg {
  background: var(--clr-bg-gray) !important;    /* "sunken" surface */
}
```

### 3.5. Auth pages tienen bg image inline en el componente
`src/components/login/LoginContent.tsx` aplica:
```tsx
<section className="login-area" style={{ background: "url(assets/img/bg/sign-up-bg.jpg)" }}>
```

El archivo `public/assets/img/bg/sign-up-bg.jpg` es un placeholder del
template con la dimensión "1920 x 1928" escrita dentro (12KB JPG dummy).
**Es intencional** según el equipo: lo van a reemplazar con una imagen
de marca real. **No quitarlo desde código** — basta reemplazar el
archivo cuando esté la imagen de marca.

Mismo patrón aplicar a `RegisterContent.tsx` si lo tiene.

### 3.6. La card del formulario auth tiene color hardcoded en light
`_register.scss` define:
```scss
.login-wrapper { background: #eff1f5; }
```
En dark, `_body-color.scss` lo sobreescribe a `var(--clr-bg-footer)`,
pero en light queda hardcoded. La próxima iteración debe mapearlo a
`--clr-bg-white` (o un token específico de card).

---

## 4. Componentes con fallback `#6c5ce7` heredado (NO crítico)

Durante el experimento se reemplazaron 38 archivos con fallback morado
`#6c5ce7` → `#0f4c4c`. Como son fallbacks de `var(--clr-theme-1, ...)`
nunca se ven en la práctica (la var siempre existe). El revert restaura
`#6c5ce7`.

Si la próxima iteración usa otra paleta, lo más limpio es alinear esos
fallbacks al nuevo brand-primary para consistencia de código.

---

## 5. Selectores donde se renderizan precios (para badges/highlights)

| Selector | Componente |
|---|---|
| `.publication-price-row .art-price` | PublicationCard (grid de listings) |
| `.publication-price-block .art-price` | Fallback de la misma card |
| `.meta-price` | PublicationContent (detalle de propiedad) |
| `.pv-price` | PublicationViewerMain (visor 3D fullscreen) |
| `.my-publication-meta > span:first-child` | MyPublicationsMain |
| `.pp-price .pp-amount` | PricingPlanMain (planes) |

`MyPublicationsMain` usa un `<span>` sin clase — el primer span del
`.my-publication-meta` es el precio, el segundo la dirección. Si se
necesita mayor robustez, agregar `className="my-publication-price"` al
span en `MyPublicationsMain.tsx:350`.

---

## 6. Botones del template

| Clase | Rol en el template | Rol que probamos en KIOSQUI |
|---|---|---|
| `.fill-btn` | Botón primario (gradient azul→morado) | Naranja sólido `#d97941` |
| `.fill-btn-orange` | Cancel / secundario (amarillo `#fcbd11`) | Outline naranja |
| `.fill-btn-lightblue` | Variante azul claro | (no usado) |
| `.fill-btn-lightred` | Variante rojo claro | (no usado) |
| `.border-btn` | Botón con borde | (no tocado) |
| `.text-btn` | Botón como link | (no tocado) |

Localizaciones especiales:
- `.appeal-link` en `LoginFrom.tsx` — botón que abre el modal de apelación
- `.login-btn .fill-btn` — botón submit del login (selector más específico)
- `.contact-btn .fill-btn` — formulario de contacto (no tocado)

---

## 7. Brief recomendado antes de retomar

Para no volver a iterar a ciegas, antes de la próxima fase pedir al
equipo de marca:

1. **Mockup de 3 pantallas clave en ambos themes:**
   - Home / landing
   - Listing de propiedades (`/publications`)
   - Detalle de propiedad
2. **Decisión sobre el dark theme:**
   - ¿Ink azul-negro (consistente con el template) o algo más
     diferenciado (verde profundo, marrón cálido)?
   - ¿Verde lima como acento de precios o solo como highlight ocasional?
3. **Sistema de elevation:** cuántos escalones (body / raised / floating)
   y qué colores específicos para cada uno en ambos themes.
4. **Inventario de componentes:** lista de cards, badges, banners donde
   debería entrar la paleta (no solo body bg + botones).
5. **Decisión sobre tipografía:** la marca KIOSQUI usa una sans-serif
   geométrica en su logo. ¿Mantener Urbanist del template o cambiar
   también la tipografía?

---

## 8. Commits de referencia (todos revertidos en `0748da4`)

| Commit | Aporte |
|---|---|
| `74e6f1d` | Setup inicial: brand-kiosqui.scss + mapeo de tokens + reemplazo masivo de fallbacks |
| `570f4bf` | Precios en lima (no funcionó en light) |
| `f69ab23` | Body background + botones naranja + ajuste de precios |
| `9a83a6f` | Mata gradiente azul→morado en botones + dark hardcodes |
| `6ca4995` | Dark variante 1: verde como body |
| `deb7edb` | Fix: rename .css → .scss (gotcha 3.1) |
| `57799d7` | Dark variante 2: ink + crema |
| `0748da4` | **Revert completo** |

Para ver los diffs:
```bash
git show 74e6f1d:src/style/brand-kiosqui.css   # primer setup
git show 57799d7:src/style/brand-kiosqui.scss  # último estado antes del rollback
```
