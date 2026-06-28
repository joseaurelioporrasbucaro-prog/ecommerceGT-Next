# Kiosqui — Handoff #16: Configuración de cuenta + Perfil de empresa (Batch E)

**Para:** Claude Code · **De:** Claude Design · **Fecha:** 2026-06-17 · **APROBADO.**
Rama `design/kiosqui-system`. Referencia: `Batch E - Cuenta y Empresa.html` (7 artboards, light+dark).
Markup: `batch_e/AccountScreen.jsx`, `batch_e/CompanyScreen.jsx`.

---

## 0. Fix transversal — swap de logo de cabecera por tema (aplica a TODA la app)
El logo del header no cambiaba en dark (letras navy invisibles sobre fondo oscuro). Regla:
- Light → `logo-transparent.png` (wordmark navy). Dark → `logo-cream-transparent.png` (wordmark cream).
- En `KqHeader`/`HeaderTwo` ya debería estar el componente `KiosquiLogo` con `useTheme()` (handoff #3 §5);
  confirmá que efectivamente intercambia el archivo. Si quedó un `<img>` fijo, reemplazarlo.

## 1. Configuración de cuenta (`/creator-profile-info`)
Layout 2 columnas:
- **Columna izquierda (card):** franja decorativa **uniforme** navy→lavanda (96px, igual en todos los
  perfiles), avatar circular **con badge de cámara verde** abajo-derecha (cambiar foto), nombre +
  check verde, email, y **menú vertical** (Información personal / Configuración de cuenta /
  Notificaciones / Métodos de pago / Verificar cuenta). Ítem activo = navy sólido + texto cream +
  ícono verde. **El avatar NO debe recortarse** (contenedor con espacio propio, no usar overflow que lo corte).
- **Columna derecha (tab activa):**
  - **Información personal**: card "Nombre de usuario" (input + contador "2/2" + botón Guardar usuario);
    card "Información personal" (nombre, apellido, género, fecha, teléfono, idioma, dirección,
    **departamento→municipio** dependientes, checkbox "mostrar ubicación"); **Zona de peligro** (card
    roja, borde `--danger`, "Eliminar mi cuenta").
  - **Verificar cuenta**: título + chip de estado (En revisión = `--warning-bg`), banner de estado,
    input nº DPI, slots Frente/Reverso (adjuntar/cambiar), avisos, botón "Enviar a revisión" verde.
  - **Métodos de pago**: tarjetas (principal = borde lavanda + badge "Principal"; otras con "Quitar"),
    botón "Agregar tarjeta" outline. (La recarga real depende de pasarela — `TODO(backend)`.)
- Todos los inputs = `.kq-input` (height 50), selects con chevron, botones del sistema (verde=guardar).

## 2. Perfil de empresa (`/company/[id]`)
- **Portada** navy→lavanda (240px) + **tarjeta de empresa** (overlapping): **foto de perfil de la
  empresa** = marco blanco (surface) con la imagen/logo dentro (placeholder = ícono edificio sobre
  gradiente lavanda→navy). ⚠️ **Importante**: el marco blanco es lo que hace visible el logo sobre la
  franja navy — sin él, un logo navy se pierde. La empresa **siempre tiene foto de perfil**.
- Nombre + **check verde** (NO el dorado `#d4af37` del template — se descartó por estar fuera de
  paleta) + razón social + chip "Empresa verificada" verde + dirección + antigüedad + botón Contactar verde.
- **Stats**: Empleados / Publicaciones / Calificación (estrella verde).
- **Tabs**: Publicaciones (grid con `PublicationCard` v2.1) / Empleados (cards con avatar navy + @handle
  + badge "Admin" lavanda). Respetar `showemployees` (si está oculto, mostrar nota).

## 3. Checklist
- [ ] Swap de logo por tema en header (toda la app).
- [ ] Cuenta: franja uniforme, avatar con cámara sin recorte, menú vertical, 3 tabs + zona de peligro.
- [ ] Empresa: foto de perfil con marco blanco (visible sobre franja), check verde (no dorado), tabs.
- [ ] Inputs `.kq-input`, botones del sistema, rating/estrellas verdes.
- [ ] Light/dark. `npx tsc --noEmit && npx next build`. Gaps → feedback §2.

## Roadmap restante (internos, después)
Portal de soporte (staff) y Admin — los dejo al final como acordamos. Pasarela de pago e i18n
restante son de backend/producto.
