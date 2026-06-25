# Kiosqui — Handoff #19: /messages — alinear al mockup (comparación)

**Para:** Claude Code · **De:** Claude Design · **Fecha:** 2026-06-24
Rama `design/kiosqui-system`. **Referencia visual (fuente de verdad):** `Batch A - Auth y Mensajes.html`
→ sección "Mensajes" (desktop) + "Mensajes mobile" (lista→hilo).
Markup exacto: `batch_a/MessagesScreen.jsx` (desktop) y `batch_a/MessagesMobile.jsx` (mobile).

## Instrucción
Abrí `Batch A - Auth y Mensajes.html` en el navegador y **compará lado a lado** con tu `/messages`
actual. Ajustá tu implementación para que coincida con el mockup en layout, jerarquía y tokens.
NO cambies la lógica (sockets, fetch de hilos, envío) — solo el skin/estructura visual.

## Especificación desktop (debe verse así)
Layout de **2 paneles** a pantalla completa bajo un header propio de 72px:

**Header (72px):** avatar de perfil (círculo navy, iniciales) a la izquierda + logo Kiosqui
(transparente, swap por tema) + a la derecha campana (punto verde) y hamburguesa. NO el header
público con buscador — es un header compacto de la vista de mensajes.

**Panel izquierdo — lista (ancho fijo 360px):**
- Título "Mensajes" (display 20px bold) + buscador pill "Buscar conversación…".
- Lista de `ConvoItem`: avatar 46px navy, nombre bold, **línea de contexto de propiedad** en lavanda
  (`--accent-hover`) con ícono `fa-home` ("Casa moderna con jardín"), último mensaje truncado, hora,
  y **badge verde de no leídos** (círculo `--green-500`, texto navy). El item activo lleva fondo
  `--accent-soft` (lavanda suave).

**Panel derecho — hilo:**
- **Barra de contexto de la propiedad** arriba (clave, probablemente lo que falta en tu versión):
  thumb 52×40, título de la propiedad, línea "Q 1,850,000 · Zona 14 · con Carlos Ramírez ✓(verde)",
  botón outline "Ver publicación" + botón **acento lavanda "Modelo 3D"** (`fa-cube`).
- **Mensajes**: separador de fecha centrado (pill `--surface-sunk`); burbujas:
  - recibidas → `--surface` con borde, radio `18px 18px 18px 4px`.
  - propias (mías) → **navy `--navy-800`** texto cream, radio `18px 18px 4px 18px`.
  - hora pequeña bajo cada burbuja, `max-width:72%`, `shadow-xs`.
- **Composer**: botón adjuntar (clip, círculo outline) + input pill "Escribí un mensaje…" + botón
  enviar **verde** circular (`fa-paper-plane`, texto navy).

## Especificación mobile (`MessagesMobile.jsx`) — patrón lista→hilo
Una vista a la vez (no split):
- **Bandeja**: topbar "Mensajes" + buscador + lista de `ConvoItem` a pantalla completa.
- **Hilo**: topbar con **flecha volver** + avatar + nombre + "En línea"; **barra de contexto compacta**
  (lavanda, thumb + título + "Q… · Zona" + botón "3D"); burbujas; composer. Desktop conserva el split.

## Diferencias típicas a corregir (revisá estas)
- ¿Tu hilo tiene la **barra de contexto de propiedad** con thumb + precio + "Modelo 3D"? (suele faltar).
- ¿Las burbujas **propias** son navy (no azul/gris del template)?
- ¿El **badge de no leídos** es verde con texto navy?
- ¿La **línea de propiedad** en cada conversación está en lavanda con `fa-home`?
- ¿El **composer** usa input pill + botón enviar verde circular?
- ¿En mobile usás el patrón **lista→hilo** (no el split aplastado)?

## Checklist
- [ ] Comparar visualmente con `Batch A - Auth y Mensajes.html` y alinear desktop + mobile.
- [ ] Barra de contexto de propiedad en el hilo (thumb, precio, Ver publicación, Modelo 3D si `hasGlb`).
- [ ] Burbujas propias navy, badge no leídos verde, contexto en lavanda, composer verde.
- [ ] Solo skin — sin tocar lógica de mensajería. Light/dark. `npx tsc --noEmit && npx next build`.
