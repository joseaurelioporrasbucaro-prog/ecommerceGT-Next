# Kiosqui — Handoff #2: rama de diseño + UI kit migration

**Para:** Claude Code
**De:** Claude Design
**Fecha:** 2026-06-05
**Estado:** Continuación del handoff #1 (que migró home + pricing al color/typo).

Excelente trabajo con el `bridge.css` — la estrategia de remapear las `--clr-*`
del template Oction a los tokens Kiosqui fue la correcta. Este handoff cierra
los 8 huecos que detectaste **y agrega la migración de UI más allá del color**
(cards de propiedades, header, filtros, detail, upload, footer), que tiene
implicaciones de layout/markup y conviene aislar.

---

## 0. Workflow de rama (HACER PRIMERO)

Todo este trabajo va a una rama dedicada de diseño, **NO** a main/master:

```bash
# Desde la rama actual de la migración o desde main
git checkout main
git pull origin main
git checkout -b design/kiosqui-system
git push -u origin design/kiosqui-system
```

**Reglas:**
- Mantené `design/kiosqui-system` siempre **sincronizada con main**: hacé
  `git merge main` (o `git rebase main`) cada vez que main avance.
- **NO mergees a main** hasta que producto/diseño aprueben visualmente.
- Cada gap/sección abre un commit chico con prefijo `design:`, ej:
  - `design: define .fill-btn system (green CTA + navy text)`
  - `design: brand rating star color via --rating token`
  - `design: integrate Kiosqui logo with theme swap in header/footer`
- Si la migración previa (home + pricing) está en otra rama, mergeala primero
  a `design/kiosqui-system` antes de seguir.

---

## 1. Decisiones de diseño para los 8 huecos

### Gap 1 — Sistema `.fill-btn` (ALTA prioridad)

**Decisión:** unificar con la home. El botón primario de Kiosqui es **verde
acción con texto navy oscuro**, pill (border-radius 999px). Las variantes
mantienen rol semántico, no decorativo.

```scss
// public/assets/scss/component/_common.scss — reemplazo de .fill-btn
.fill-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 50px;
  padding: 0 26px;
  border: 1.5px solid transparent;
  border-radius: 999px;            // pill — sello de marca
  background: var(--green-500);    // ACCIÓN
  color: var(--navy-900);          // texto navy sobre verde
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition: background .15s ease, color .15s ease, border-color .15s ease,
              transform .08s ease, box-shadow .15s ease;

  &:hover  { background: var(--green-600); color: var(--navy-900); }
  &:active { background: var(--green-700); transform: translateY(1px); }
  &:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(181,172,239,.55); }
  &:disabled, &.disabled { opacity: .45; pointer-events: none; }
}

// Variantes — mantenemos los nombres legacy pero remapeamos a roles
.fill-btn-orange    { background: var(--warning); color: var(--ink-900); }       // alertas/avisos
.fill-btn-orange:hover    { background: #c2741f; }
.fill-btn-lightblue { background: var(--lav-500); color: var(--navy-900); }      // accent (no azul)
.fill-btn-lightblue:hover { background: var(--lav-600); color: #fff; }
.fill-btn-lightred  { background: var(--danger); color: #fff; }                  // destructivo
.fill-btn-lightred:hover  { background: #b53d3d; }

// Outline secundario — para acciones no-CTA
.fill-btn-outline {
  background: transparent;
  color: var(--primary);
  border-color: var(--border-strong);
}
.fill-btn-outline:hover {
  border-color: var(--primary);
  background: var(--sand-100);
}

// Tamaños
.fill-btn-sm { height: 40px; padding: 0 18px; font-size: 13.5px; }
.fill-btn-lg { height: 56px; padding: 0 32px; font-size: 16px; }
```

**Reemplazos directos en SCSS de scaffold:**
- `_about.scss:173`, `_art.scss:185,472,474`, `_creator.scss:48,294-296`,
  `_footer.scss:144`, `_custome.scss:44` — borrar los `linear-gradient(...)`
  hardcodeados y dejar que herede de `.fill-btn` arriba.

---

### Gap 2 — Estrellas de rating

**Decisión:** mantener símbolo "estrella dorada" (es lenguaje universal en
reseñas, lo entiende todo el mundo) **pero** dentro de la familia de marca.
Usar **`--green-600`** (`#84ad3f`) — es lo que ya hizo la home y se ve verde
"orgánico" con peso visual similar al ámbar. Definir token:

```css
/* en src/style/kiosqui/colors_and_type.css */
:root         { --rating: var(--green-600); }
[data-theme="dark"] { --rating: var(--green-400); }
```

**Aplicar:** `CreatorProfileMain.tsx:37,555`, `SurveyMain.tsx:36,137,161`,
`CompanyTeamMain.tsx:366`, `PublicationContent.tsx:390`,
`FeaturedPublicationsSection.tsx:45`, `notificationUtils.ts:110,192`.
Reemplazar `#f59e0b` → `var(--rating)`.

---

### Gap 3 — Badges "destacado/pautado"

**Decisión:** lavanda sólido (no gradiente), pill, con texto navy oscuro.
Es lo que se ve en `landing.html` con `.pub-tag.feat`:

```scss
.badge-featured {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--lav-500);
  color: var(--navy-900);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  i { font-size: 11px; }
}

// Variante "estado de venta" — verde sólido
.badge-status {
  @extend .badge-featured;
  background: var(--green-500);
}

// Variante "tipo/categoría" — navy ghost
.badge-type {
  @extend .badge-featured;
  background: var(--navy-100);
  color: var(--navy-700);
}
[data-theme="dark"] .badge-type {
  background: rgba(248,244,238,.10);
  color: var(--cream);
}
```

**Reemplazar** los gradientes `linear-gradient(135deg, #fbbf24, #d97706)` en
`PublicationCard.tsx:297,430`, `PublicationViewerMain.tsx:365,548`,
`MyPublicationsMain.tsx:616-624`, `SupportReportsMain.tsx:263,266` por la
clase `.badge-featured`.

---

### Gap 4 — Tints azules `rgba(39,133,255,.x)`

**Decisión por contexto** (no todos son lo mismo):

| Archivo | Uso | Reemplazo |
|---|---|---|
| `PaymentMethodsTab.tsx:617` | Card seleccionada de método de pago | `var(--lav-200)` bg + `var(--lav-500)` border |
| `AdminConfigMain.tsx:244` | Highlight de fila/setting activo | `var(--accent-soft)` (lavanda translúcida) |
| `CookieConsentBanner.tsx:112` | Banner de info | `var(--lav-200)` bg con border `var(--lav-500)` |
| `PublicationsMain.tsx:417` | Highlight de filtro activo | `var(--green-100)` bg + `var(--green-600)` border (si es selección positiva) o `var(--lav-200)` (si es neutral) |

Para tints genéricos de "información/seleccionado", usar
`background: var(--accent-soft)`. Para "confirmación/activo positivo", verde.

---

### Gap 5 — Preloader

**Decisión:** spinner de doble color que respeta la marca:

```scss
// public/assets/scss/component/_preloader.scss
.preloader-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--navy-200);   // anillo base
  border-top-color: var(--green-500);  // segmento que gira en verde acción
  border-right-color: var(--lav-500);  // toque lavanda
  border-radius: 50%;
  animation: kq-spin 0.9s linear infinite;
}
[data-theme="dark"] .preloader-spinner {
  border-color: rgba(248,244,238,.15);
  border-top-color: var(--green-400);
  border-right-color: var(--lav-400);
}
@keyframes kq-spin { to { transform: rotate(360deg); } }
```

Reemplazar `#2785ff` en `_preloader.scss:36`.

---

### Gap 6 — Logo del header/footer

**Decisión:** swap por tema. El header en light usa el logo cream-bg (wordmark
navy sobre fondo claro), en dark usa el navy-bg (wordmark cream). El footer
(siempre fondo oscuro `--ink-900`) siempre usa navy-bg.

**Componente sugerido** (`src/components/common/KiosquiLogo.tsx`):

```tsx
"use client";
import Image from 'next/image';
import { useTheme } from 'next-themes';

interface KiosquiLogoProps {
  height?: number;
  variant?: 'auto' | 'light' | 'dark';
}

export default function KiosquiLogo({ height = 32, variant = 'auto' }: KiosquiLogoProps) {
  const { resolvedTheme } = useTheme();
  const isDark = variant === 'auto' ? resolvedTheme === 'dark' : variant === 'dark';
  const src = isDark
    ? '/brand/logo-navy-bg.png'   // wordmark cream para fondos oscuros
    : '/brand/logo-cream-bg.png'; // wordmark navy para fondos claros
  return (
    <Image src={src} alt="Kiosqui" height={height} width={height * 3.4} priority />
  );
}
```

**Pasos:**
1. Copiar los 3 PNG de `kiosqui-design-handoff/assets/logo-*.png` a `public/brand/`.
2. Reemplazar el `<img>`/`<Image>` del logo en `HeaderTwo.tsx`, `HeaderOne.tsx`,
   `Footer.tsx`, `FooterTwo.tsx`, `MobileMenu.tsx` por `<KiosquiLogo />`.
3. En el footer pasar `variant="dark"` explícito (siempre fondo oscuro).

---

### Gap 7 — Pricing: moneda y voseo

**Necesito que confirmes con producto antes de aplicar.** Mientras tanto,
hipótesis por defecto (consistente con marca):

- **Moneda:** `Q` (Quetzales). El target del producto es Guatemala.
- **Voseo:** sí, "Elegí el plan ideal para vos".
- **Formato:** `Q 99` con espacio fino (mismo formato que la home muestra
  `Q 1,850,000`).

**Cambio en `PricingPlanMain.tsx:13`:**

```tsx
const fmtPrice = (price: number, currency: 'GTQ' | 'USD' = 'GTQ') => {
  if (price === 0) return 'Gratis';
  const symbol = currency === 'GTQ' ? 'Q' : '$';
  const value = price.toFixed(price % 1 === 0 ? 0 : 2);
  return `${symbol} ${value}`;
};
```

Y los strings del componente:

| Antes | Después |
|---|---|
| Elige el plan ideal para ti | Elegí el plan ideal para vos |
| Publica más propiedades y gestiona tu equipo. | Publicá más propiedades y gestioná tu equipo. |
| Cambia o cancela cuando quieras. | Cambiá o cancelá cuando quieras. |
| Inicia sesión para elegir | Iniciá sesión para elegir |
| Elegir plan | Elegir plan ✓ (ya está bien) |

**Pregunta abierta para producto/backend:** ¿el campo `price` del `Plan` viene
en GTQ o USD? Si es USD, ¿conviene agregar `currency: 'GTQ'|'USD'` al schema
del backend? **Marcar como TODO** y no aplicar el cambio de símbolo hasta
confirmar para no tergiversar montos en producción.

---

### Gap 8 — Plan "recomendado" sin flag en backend

**Decisión:** dos caminos, elegí según urgencia:

**Camino A (rápido, frontend-only):** constante con el `pubgen_id`/`id` del
plan a destacar:

```tsx
// src/components/pricing/PricingPlanMain.tsx
const RECOMMENDED_PLAN_ID = 3; // ID del plan "Pro" — ajustar al ID real

// En el render:
const isRecommended = plan.id === RECOMMENDED_PLAN_ID;
<div className={`pp-card ${isCurrent ? 'is-current' : ''} ${isRecommended ? 'is-recommended' : ''}`}>
  {isRecommended && (
    <span className="pp-popular">
      <i className="fas fa-star" /> Más popular
    </span>
  )}
  …
</div>
```

CSS de la card destacada (ver `landing.html` sección `.pp-card.is-recommended`):
borde navy `--navy-800`, badge verde flotante arriba, CTA verde sólido.

**Camino B (correcto, requiere backend):** agregar `recommended: boolean` al
schema `Plan` en `src/types/api.ts` + endpoint correspondiente. Coordinar con
el repo `ecommerceGTBackEnd`. **Esto va en un PR aparte** — no en
`design/kiosqui-system`.

**Recomendación:** A para el demo visual ahora, B en una iteración futura.

---

## 2. Siguiente fase — UI kit migration (más allá del color)

Esto es donde el alcance crece: la **estructura visual** de las páginas más
importantes del producto cambia para parecerse al UI kit que se prototipó
(`ui_kits/web/` del paquete original + `landing.html`). Lo separo en
**componentes** (re-skin con cambios de markup mínimos) y **páginas** (re-skin
de sección/ordenamiento).

### 2.1 — `PublicationCard.tsx` (CRÍTICO — se usa en toda la app)

**Estado actual:** card del template Oction, layout NFT-style (avatar artista
arriba, "place bid", "art-meta").

**Objetivo:** card inmobiliaria del prototipo (ver `landing.html` →
`.pub-card`). Cambios:

| Elemento | Cambio |
|---|---|
| Imagen | Top, altura 200px, sin avatar de artista flotante |
| Badge (esquina sup-izq) | `.badge-featured` (lavanda) o `.badge-status` (verde) según `featured`/`operation_type` |
| Botón corazón (esquina sup-der) | 38×38, circular, fondo `rgba(255,255,255,.94)`, `color: --navy-700`, hover → `--danger`, estado activo → `is-fav` con `fas fa-heart` rojo |
| Precio | `font-display`, peso 700, 20px, color `--fg-strong` — destacado |
| Tipo de propiedad | Caption a la derecha del precio, `--fg-subtle` |
| Título | `--text-body-sm`, peso 600, 2 líneas máx con `-webkit-line-clamp` |
| Ubicación | Ícono `fas fa-map-marker-alt` en `--accent-hover` + texto `--fg-muted` |
| Stats (cama/baño/m²) | Row con `border-top: 1px solid --border`, padding-top 13px, gap 18px, íconos `fas fa-bed`/`fa-bath`/`fa-vector-square` |
| Hover | `translateY(-3px)` + `--shadow-md` |

**Markup base** (copialo del prototipo y adaptá los hooks/data binding):

```tsx
<article className="pub-card" onClick={() => onOpen(pub)}>
  <div className="pub-photo">
    {pub.featured && (
      <span className="badge-featured">
        <i className="fas fa-star" /> Destacado
      </span>
    )}
    {!pub.featured && pub.operationType === 'rent' && (
      <span className="badge-status" style={{background:'var(--lav-500)'}}>En renta</span>
    )}
    {!pub.featured && pub.operationType === 'sale' && (
      <span className="badge-status">En venta</span>
    )}
    <button
      className={`pub-fav ${isSaved ? 'is-fav' : ''}`}
      onClick={(e) => { e.stopPropagation(); onToggleSave(pub.id); }}
      aria-label="Guardar"
    >
      <i className={isSaved ? 'fas fa-heart' : 'far fa-heart'} />
    </button>
    {pub.imageUrl ? (
      <img src={pub.imageUrl} alt={pub.title} />
    ) : (
      <i className="fas fa-camera" />
    )}
  </div>
  <div className="pub-body">
    <div className="pub-row1">
      <span className="pub-price">{fmtPrice(pub.price)}</span>
      <span className="pub-type">{pub.category}</span>
    </div>
    <h4 className="pub-title">{pub.title}</h4>
    <div className="pub-loc">
      <i className="fas fa-map-marker-alt" /> {pub.zone}, {pub.city}
    </div>
    <div className="pub-stats">
      {pub.beds > 0 && <span><i className="fas fa-bed" /> {pub.beds}</span>}
      {pub.baths > 0 && <span><i className="fas fa-bath" /> {pub.baths}</span>}
      <span><i className="fas fa-vector-square" /> {pub.area} m²</span>
    </div>
  </div>
</article>
```

Los estilos `.pub-*` ya están en `landing.html` (líneas que arrancan con
`/* ---------- FEATURED ---------- */`). Extraerlos a `_pub-card.scss`.

### 2.2 — `HeaderTwo.tsx`

**Cambios:**
1. Sticky translucent: `background: rgba(255,253,249,.85); backdrop-filter: blur(14px);`
2. Logo a la izquierda + `<KiosquiLogo />` (gap 6).
3. Nav links: Comprar / Rentar / Cómo funciona / Precios / Vendedores.
4. A la derecha: theme toggle (☀️/🌙), **Guardados** con contador, "Iniciar sesión" ghost, **Publicar** verde con `<i class="fas fa-plus" />`.
5. Sin gradient bar abajo — solo `border-bottom: 1px solid var(--border)`.

Ver `landing.html` → sección `.nav`.

### 2.3 — `AdvancedFiltersPanel.tsx`

**Estado actual:** panel modal con sliders + selects del template.

**Objetivo:** filter chips horizontales arriba + filtros avanzados en sidebar.
Mantener la lógica de fetch/state actual, solo refactor visual.

- **Chips de tipo** arriba (Todos / Casa / Apto / Terreno / Oficina) — `.kq-chip` del paquete.
- **Botón "Filtros"** outline pill que abre el panel modal.
- **Sort dropdown** a la derecha — `.kq-chip` con flecha.
- **Modal de filtros avanzados**: range slider lavanda (`--accent`),
  checkboxes con tick verde, botón "Aplicar" verde, "Limpiar" ghost.

### 2.4 — `PublicationContent.tsx` (PropertyDetail)

**Objetivo:** matchear la página de detalle del prototipo (ver
`ui_kits/web/PropertyDetail.jsx` del paquete original — si no lo tenés, lo
re-genero).

Estructura:
1. **Gallery** grid 2fr/1fr 380px alto, 3 fotos visibles + botón "24 fotos" sobre la tercera.
2. **Badges** (`.badge-featured` + `.badge-type`) arriba del título.
3. **H1** display + ubicación con pin.
4. **Spec tiles** grid de 4 (Habitaciones / Baños / m² / Parqueos) con ícono lavanda + valor display + label caption.
5. **Descripción** + lista de amenidades como `.badge-featured` con check.
6. **Sticky agent card** a la derecha (`top: 88px`): precio enorme, avatar+verified, botón "Contactar" verde, "Enviar mensaje" outline, "Guardar"/"Compartir" como ghost.

### 2.5 — `Upload/` (publish flow)

**Objetivo:** wizard de 4 pasos como `ui_kits/web/PublishFlow.jsx`:
Tipo → Detalles → Fotos → Precio. Con stepper visual arriba (números 1-4,
verde para completados, navy para activo, gris para futuros).

### 2.6 — `Footer.tsx` / `FooterTwo.tsx`

Estructura simple del prototipo: fondo `--ink-900`, logo cream, 4 columnas
(Explorar / Kiosqui / Soporte / link al sitio), copyright + "Hecho en
Guatemala 🇬🇹". Ver `landing.html` → sección `.footer`.

---

## 3. Devolveme estas respuestas

Para poder cerrar este handoff, necesito que respondas (en un nuevo doc
`HANDOFF_2_FEEDBACK.md` o como prefieras):

1. ¿La estrategia del `bridge.css` aguanta los re-skins de componente o vas a
   necesitar SCSS dedicado por feature? Ej: `_pub-card.scss`, `_header-kq.scss`.
2. De los componentes en 2.1–2.6, ¿cuáles tienen alta complejidad de lógica
   (hooks, formularios largos, modals con state) que requerirán **diseños
   adicionales** que yo no cubrí en el prototipo? Listalos.
3. ¿Qué pantallas del producto (rutas en `src/app/`) NO tienen referencia
   visual en el handoff? Ej: `/messages`, `/admin`, `/forum`, `/contact`.
   Listalas y yo decido cuáles diseñar.
4. ¿Hay decisiones de producto que estoy tomando sin pasar por humano? (Ej:
   currency en pricing, IDs de plan recomendado). Marcalas con TODO en código
   y reportá la lista.
5. ¿Falta algún token en `colors_and_type.css` que estés inventando
   localmente? (Ej: un gris específico, un radius custom). Si sí, listalos
   para incorporarlos al sistema central.

---

## 4. Reglas de no-regresión

- **NO mergear a main** hasta aprobación visual de producto/diseño.
- **NO tocar lógica de negocio** (hooks de React Query, AuthContext,
  middleware). Solo skin: markup + estilos + iconografía + copy.
- **NO inventar copy nuevo** en español sin marcar `TODO(copy)` — el copy
  actual del repo es bueno (voseo guatemalteco, trust language).
- **SÍ documentar cada commit** con qué archivo del prototipo usaste como
  referencia. Ej:
  > `design: re-skin PublicationCard with .pub-card pattern from landing.html:380-440`
- **SÍ correr `npx tsc --noEmit && npx next build`** antes de cerrar cada commit.

---

¡Gracias! Cuando tengas un primer batch listo (o el feedback de la sección 3),
me reportás y seguimos.
