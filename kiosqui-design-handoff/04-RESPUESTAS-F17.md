# Kiosqui — Handoff #4: Respuestas al Feedback Fase 17

**Para:** Claude Code (y Aurelio) · **De:** Claude Design · **Fecha:** 2026-06-10
**Responde a:** `Feedback para Claude Design (Fase 17)` §2 (gaps H3).
**Referencia actualizada:** `landing.html` de este paquete (incorpora las decisiones de abajo).

---

## 1. Decisiones sobre los gaps H3

### [H3-1] Ítem "Vendedores" → RESUELTO: se elimina
Producto ya unificó Directorio+Ranking en `/ranking` con tabs (Fase 24). El drawer
queda con **6 ítems**: Inicio, Propiedades, Ranking (ícono fa-trophy), Pauta (auth),
Planes, Contacto. `landing.html` ya está actualizado así. No reabrir con producto.

### [H3-2] `PublicCategoriesSidebar` → RESUELTO: se retira
Decisión de diseño: **retirarlo**. Su contenido está cubierto por los chips del hero
(categorías) y el CTA del drawer (registro). Un tercer panel lateral para visitantes
compite con el modelo de dos drawers (perfil-izquierda / menú-derecha) y rompe la
regla "botón izquierdo abre panel izquierdo". Si analytics luego muestra que las
categorías necesitan más visibilidad, diseñaremos una sección de categorías más
fuerte en el body — no otro riel.
→ Acción: eliminar el componente del DefaultWrapper (o dejarlo huérfano marcado
`deprecated`), quitar cualquier trigger restante.

### [H3-3] `/messages` (HeaderOne) → RESUELTO: un solo header
Decisión: **HeaderOne se retira; HeaderTwo (el nuevo) es el único header** en toda
la app, incluido `/messages`. Mismo avatar-izquierda, buscador, hamburguesa-derecha.
Razón: el usuario aprende UN patrón de navegación; mantener dos headers duplica
mantenimiento y rompe la consistencia del gesto izquierda/derecha.
→ Acción: en `DefaultWrapper`, reemplazar HeaderOne por HeaderTwo en las rutas que
lo usaban. Si `/messages` necesita densidad (chat a pantalla completa), el header
puede perder el buscador en esa ruta (prop `compact`), pero conserva avatar +
hamburguesa. El diseño completo de `/messages` viene en el próximo batch de
pantallas (ver §2).

### [H3-4] Badges Vendida/Borrador/Anulada → VALIDADO con ajuste
Correcto usar el frosted con punto de estado — esa es exactamente su función
("estados neutros/no-positivos"). Especificación canónica (ya en `landing.html`):

| Estado | Clase | Punto (light) | Punto (dark) |
|---|---|---|---|
| Vendida | `.pub-tag.st-vendida` | `--navy-500` | `--navy-300` |
| Borrador | `.pub-tag.st-borrador` | `--ink-400` | `--ink-400` |
| Anulada | `.pub-tag.st-anulada` | `--danger` | `--danger` |

Ajuste vs. lo que aplicaron: en **dark mode NO usar el verde sólido** (correcto
lo que asumieron) — el frosted en dark se vuelve **vidrio oscuro**:
`background: rgba(19,26,45,.72)` + borde `rgba(248,244,238,.18)` + blur, texto cream.
Así Destacado/Nuevo (lavanda glow) siguen siendo los únicos badges "brillantes".
Además: una tarjeta Vendida/Anulada puede llevar la foto con
`filter: saturate(.35) brightness(.85)` para comunicar no-disponible (opcional,
a criterio en my-publications).

### [H3-5] LanguageSwitcher → RESUELTO: vive en el header
Se queda en el header, junto al theme toggle, con el **mismo lenguaje visual**:
botón circular 38px, borde `--border-strong`, label tipográfico "ES"/"EN"
(font-display, 12px, bold, tracking +.04em). Ya está en `landing.html`
(`#langSwitch`, clase `.lang-switch`). En mobile puede colapsar dentro del drawer
(fila al fondo: "Idioma · ES/EN") si el header queda apretado bajo 400px.

### [H3-6] Footer → confirmado pendiente, espec completa
Sigue vigente el handoff #2 §2.6. Espec resumida (la referencia es el footer de
`landing.html`): fondo `--ink-900` SIEMPRE (no cambia con tema), logo
`logo-cream-transparent.png` 52px, grid `1.6fr 1fr 1fr 1fr` (mobile: 2 col → 1 col),
columnas Explorar / Kiosqui / Soporte, links `rgba(248,244,238,.65)` hover cream,
bottom bar con borde `rgba(248,244,238,.14)`: "© 2026 Kiosqui. Todos los derechos
reservados." + "Hecho en Guatemala 🇬🇹". **Eliminar "Designed by BDevs".**
Prioridad: alta (es visible en todas las páginas).

## 2. Pantallas sin referencia — plan propuesto

Acepto el backlog. Propongo diseñarlas en este orden (batches):

- **Batch A (próximo):** auth (`/login`, `/register`, `/forgot`, `/verify`) +
  `/messages` — son el corazón del funnel y el gap más citado.
- **Batch B:** `/creator-profile*` (perfil público de vendedor) + `/contact` +
  `/faq` + `/soporte` (comparten patrón de página de contenido).
- **Batch C:** `/admin` + `/pauta` + `/activity` + `/survey` + `/invite`.
- **Legales** (`/terminos`, `/privacidad`): plantilla tipográfica simple, la
  incluyo en Batch B casi gratis.
- **Legacy** (`/art-ranking`, `/wallet-connect`, `/explore-arts`, `/home-two`):
  recomiendo **retiro**, no rebrand — son del template NFT y no aportan al
  producto inmobiliario. Decisión final de producto.

Aurelio: confirmá el orden (o reordená) y arranco con el Batch A.

## 3. Sobre las decisiones de producto reportadas

- **Moneda `$` en planes** (`TODO(currency-plan)`): aceptado como estado actual.
  Nota de diseño: mostrar el símbolo con el formato `$ 99` (espacio fino) para
  consistencia con `Q 1,850,000`. Cuando backend agregue columna de moneda,
  migrar a `Q` será un cambio de un punto.
- **`RECOMMENDED_PLAN_ID = 3`**: correcto (camino A del handoff #2 Gap 8).
- **`--rating` formalizado**: perfecto, así queda en el sistema central.

## 4. Checklist para Claude Code (este handoff)

- [ ] Drawer: 6 ítems (sin "Vendedores"), Ranking con fa-trophy.
- [ ] Retirar `PublicCategoriesSidebar` y sus triggers.
- [ ] Unificar header: HeaderTwo en todas las rutas (incluida /messages, prop `compact` opcional).
- [ ] Badges de estado: clases `.st-vendida/.st-borrador/.st-anulada` según §1.4 (copiar CSS de landing.html).
- [ ] LanguageSwitcher con estilo `.lang-switch` (copiar de landing.html).
- [ ] Footer re-skin completo (§1.6) — quitar "Designed by BDevs".
- [ ] `npx tsc --noEmit && npx next build` + probar light/dark × auth/no-auth.
- [ ] Seguir agregando gaps nuevos al archivo de feedback §2.
