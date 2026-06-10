# Kiosqui — Handoff #3: Header con buscador, sidebars definitivos, badges y hero

**Para:** Claude Code · **De:** Claude Design · **Fecha:** 2026-06-10
**Continúa:** Handoff #1 (tokens + colores) y #2 (rama `design/kiosqui-system` + 8 gaps + re-skins).
**Referencia visual:** `landing.html` de este paquete (abrila en el navegador, probá light/dark y los dos sidebars).

Trabajá en la rama `design/kiosqui-system` (sincronizada con main). Commits chicos con prefijo `design:`.

---

## 1. Hero — titular nuevo (`KiosquiHero.tsx`)

El titular actual se parece demasiado a la competencia (MAPPI). Reemplazar por:

- **H1:** `La casa que buscás, en 3D y sin intermediarios` — con "3D" en acento lavanda (`var(--lav-700)` light / `var(--lav-400)` dark). **Sin fondo/highlight detrás de la palabra** — solo color de texto.
- **Sub:** `Recorré el modelo 3D de cada inmueble y tratá directo con propietarios verificados con DPI. Sin intermediarios escondidos.`
- Nota de producto: el 3D es una **vista de modelo 3D** (rotar/zoom), NO un "recorrido virtual". Cuidar el wording: "modelo 3D", "vela en 3D".

## 2. Header (`HeaderTwo.tsx`) — layout definitivo

Estructura de izquierda a derecha:

1. **Avatar de perfil** (solo logueado) — círculo 40px, iniciales del usuario, gradiente navy (light) / lavanda (dark). **Abre el sidebar de cuenta desde la IZQUIERDA.**
2. **Logo Kiosqui** — 48px de alto (móvil: 40px). **SIEMPRE las versiones transparentes** (ver §5). El header crece a 80px de alto.
3. **Buscador pill** — reemplaza TODOS los links de navegación (Comprar/Rentar/Cómo funciona/Precios/Vendedores: eliminarlos del header). Input con ícono `fa-search`, placeholder `Buscar por zona, ciudad, colonia…`, borde `--border-strong`, focus → borde lavanda + ring `--shadow-focus`. Max-width 440px, flex:1. Oculto bajo 600px.
4. (derecha) **Theme toggle** ☀️/🌙
5. **Iniciar sesión** (ghost, solo deslogueado) + **Publicar** (verde, siempre)
6. **Campana** de notificaciones con punto verde (solo logueado)
7. **Hamburguesa** — último elemento. **Abre el menú de navegación desde la DERECHA.**

Regla UX clave: el botón de la izquierda abre el panel izquierdo; el de la derecha abre el panel derecho. Aplica igual de desktop a mobile.

## 3. Sidebar derecho — menú de navegación (`SidebarMenuSection.tsx`)

Se mantiene deslizando desde la **derecha** (como ya está). Re-skin con tokens Kiosqui:

- **Head:** logo transparente 38px + botón cerrar (X).
- **Ítems** (lista plana, sin acordeón — ya está así en Fase 22): Inicio, Propiedades, Vendedores, Ranking, **Pauta (SOLO logueado)**, Planes, Contacto.
  - ⚠️ **Pauta**: ocultar si `!user` — un usuario sin sesión no debe ver ni entrar a Pauta. En Next: `{user && <li>…Pauta…</li>}`.
  - Estilo ítem: fila con ícono FA (20px) + label, radius 10px, hover lavanda suave (`--accent-soft` + texto `--lav-700`), activo navy sólido con texto cream (en dark: lavanda sólido con texto navy).
  - Íconos sugeridos: fa-home, fa-building, fa-users, fa-trophy, fa-bullhorn, fa-gem, fa-headset.
- **Top vendedores:** título overline + filas avatar 38px / nombre / @handle lavanda / check verde 18px.
- **CTA card** (lavanda suave, al fondo): cambia según auth (lógica ya existente):
  - Deslogueado → "Sumate y publicá tu propiedad" + botón **Iniciar sesión**
  - Logueado → "Publicá tu propiedad en minutos" + botón **Crear publicación**
  - Botón verde `--action`, pill, full-width.

## 4. Sidebar izquierdo — Mi cuenta (`AccountRightSidebar.tsx`)

⚠️ **Cambia de lado: ahora desliza desde la IZQUIERDA** (lo abre el avatar de perfil del header, que está a la izquierda). Renombrar el componente si conviene (`AccountSidebar`). Contenido:

- **Head:** título "Mi cuenta" + X.
- **Tarjeta de usuario:** fondo `--accent-soft` con borde lavanda, avatar 64px centrado, nombre (display bold) + @handle lavanda.
- **Nav:** Mi perfil, Mis publicaciones, Favoritos (badge contador), Mensajes (badge contador), Configuraciones, Planes. Badges: pill lavanda suave con texto lavanda.
- **Footer del panel:** "Cerrar sesión" en rojo `--danger`, hover `--danger-bg`.

Ambos drawers: 320px (max 86vw), overlay `rgba(17,24,42,.42)` con blur 2px, transición `transform .28s cubic-bezier(.4,0,.2,1)`, cierre con X / clic en overlay / Esc, `body{overflow:hidden}` mientras está abierto.

## 5. Logo — SIEMPRE transparente, embebido en el fondo

El logo nunca debe verse con un recuadro de fondo distinto. Assets en `assets/` de este paquete (copiar a `public/brand/`):

| Asset | Uso |
|---|---|
| `logo-transparent.png` | Wordmark navy — fondos claros (header light, drawer light) |
| `logo-cream-transparent.png` | Wordmark cream — fondos oscuros (header dark, drawer dark, **footer**) |

- NO usar más `logo-cream-bg.png` / `logo-navy-bg.png` en UI (tienen caja de color).
- Tamaños: header 48px (mobile 40px), drawer 38px, footer 52px.
- El swap por tema en Next: componente `KiosquiLogo` con `useTheme()` (ver handoff #2 §Gap 6, actualizar los src a los transparentes).

## 6. Badges de tarjeta (`PublicationCard.tsx`) — SOLO Destacado y Nuevo

Estados reales de la plataforma: **Destacado** y **Nuevo**. No existen "Verificado" ni "En renta" como badge de esquina (la renta se comunica por el precio `/mes`).

- Badge destacado/nuevo: pill con gradiente lavanda `linear-gradient(135deg, var(--lav-500), var(--lav-600))`, texto blanco, ícono estrella, glow `box-shadow: 0 4px 16px rgba(109,98,207,.5), 0 0 0 3px rgba(181,172,239,.25)`. En dark: gradiente `lav-400→lav-500`, texto navy.
- **La tarjeta destacada además lleva anillo**: `box-shadow: 0 0 0 1.5px var(--lav-400), var(--shadow-sm)` (clase `is-featured`).
- Tarjetas sin estado: sin badge, limpias.
- Existe un estilo "frosted" para futuros estados neutros (ver `.pub-tag` en landing.html), pero hoy no se usa.

## 7. Patrón de visibilidad por sesión

En la referencia HTML se usa `body.is-logged-in` + clases `.logged-in`/`.logged-out`. **En Next.js NO repliquen eso**: usar render condicional con `useAuth()` (`{user ? … : …}`), que ya es el patrón del repo. La referencia es solo para previsualizar ambos estados (botón "Iniciar sesión" simula el login).

## 8. Checklist de cierre

- [ ] `npx tsc --noEmit && npx next build` en verde.
- [ ] Probar las 4 combinaciones: light/dark × logueado/deslogueado.
- [ ] Verificar que Pauta no aparece deslogueado (ni por URL directa: revisar guard/middleware si existe).
- [ ] Logo legible y sin caja en header, drawer y footer, ambos temas.
- [ ] Hamburguesa→drawer derecho y avatar→drawer izquierdo funcionan en mobile.
- [ ] NO mergear a main; PR desde `design/kiosqui-system` cuando producto apruebe.
