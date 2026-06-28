# Kiosqui — Handoff #7: Respuestas a gaps H5 + Batch B

**Para:** Claude Code (y Aurelio) · **De:** Claude Design · **Fecha:** 2026-06-11
**Responde a:** Feedback Fase 17 §2, bloques [H5], [Pulido] y [B].

---

## 1. Gaps del handoff #4/#5 ([H5] + [Pulido])

### [H5-1] /verify por link con token → APROBADO, se queda así
Correcto no tocar backend. El flujo link-con-token es incluso mejor UX (un clic
menos). Especificación de los 3 estados sobre AuthShell (mismo panel de marca):

| Estado | Contenido del panel derecho |
|---|---|
| **Verificando** | Spinner de doble color (anillo `--navy-200`, segmento `--green-500`, toque `--lav-500` — el mismo del preloader, 48px) + "Verificando tu correo…" display 22 + sub "Esto toma solo un segundo." |
| **Éxito** | Círculo 72px `--green-100` con fa-check `--green-700` 28px + "¡Correo verificado!" display 26 + sub "Tu cuenta está lista." + CTA verde "Ir a iniciar sesión" (o auto-redirect con countdown "Te llevamos en 3…") |
| **Error/vencido** | Círculo 72px `--danger-bg` con fa-triangle-exclamation `--danger` + "El enlace venció" + sub "Los enlaces duran 30 minutos." + CTA verde "Reenviar correo" + ghost "Volver a iniciar sesión" |

No migrar a OTP. Si producto lo pide a futuro, la referencia de 4 cajas ya existe.

### [H5-2] Social login retirado → APROBADO
Links muertos fuera. Si algún día se hace OAuth real, será feature completa
(backend + diseño de botones). No reintroducir placeholders.

### [H5-3] Auth sin theme toggle → APROBADO
El auth respeta el tema del sistema/última elección guardada. No agregar toggle
flotante. (El panel navy es idéntico en ambos temas, así que el impacto es mínimo.)

### [H5-4] /messages — barra de contexto de propiedad → SÍ LA QUEREMOS
Es parte del diferenciador (el chat siempre ancla a una propiedad y al modelo 3D).
Queda como **WP pendiente**, no urgente. Espec en handoff #5 §3.2. El patrón
lista→hilo mobile también queda pendiente. Ambos entran como "Batch A.1 — pulido
de mensajes" cuando cierre el Batch C. Mantener `TODO(design)` en el código.

### [Pulido-1] Pricing en la home → NO duplicar
El pricing vive SOLO en `/pricing-plan`. La sección de precios de `landing.html`
era parte de la propuesta de landing, pero estando la ruta dedicada + entrada
"Planes" en el drawer, duplicarla en la home alarga el scroll sin aportar.
Decisión: home sin sección de planes. (Si analytics muestra poca conversión a
/pricing-plan, lo reabrimos.)

## 2. Gaps del Batch B ([B])

### [B-1] Stat "Vendidas" → usar las reales del backend
Aprobado usar `SellerInfo` tal cual. Trío recomendado para la card de identidad:
**Publicaciones / Seguidores / Rating** (rating con `--rating`). "Vendidas" queda
descartado hasta que backend lo exponga (no pedir el cambio ahora).

### [B-2] Tab Reseñas → APROBADO el approach
Summary verde con score display + cards con avatar navy es exactamente el lenguaje
del sistema. No necesito artboard adicional — si Aurelio quiere pulirlo
visualmente, lo metemos en un batch de pulido posterior.

### [B-3] /soporte sin guías reales → APROBADO el aterrizaje
Topic cards → categorías del FAQ (`?cat=`) y `/pricing-plan` está bien. Cambiar el
microcopy de las cards de "n guías" a algo verdadero: **"Ver preguntas →"** (las
que van al FAQ) y **"Ver planes →"** (la de pagos). No mostrar conteos falsos.

### [B-4] Correos de /contact → PREGUNTA ABIERTA PARA AURELIO
`soporte@kiosqui.gt` y `pauta@kiosqui.gt` fueron invento del mock. **Aurelio:
confirmá los correos reales** (o decidí crearlos). Mientras tanto los TODO(copy)
están bien — no lanzar con correos inventados.

### [B-5] Mapa de Google retirado → APROBADO
El mapa del template (Nueva York 😄) no tenía función. Si algún día hay oficina
física que mostrar, se diseña entonces.

## 3. Estado del backlog

- ✅ Batch A (auth + messages) — aplicado, con 2 WP pendientes de pulido (contexto de propiedad + mobile en /messages).
- ✅ Batch B (perfil + contacto + FAQ + soporte + legales) — aplicado.
- ⏭️ **Batch C** (siguiente): `/admin`, `/pauta`, `/activity`, `/survey`, `/invite`.
- 🔜 Batch A.1 (pulido /messages) después del C.
- ⚠️ Pendiente decisión de producto: retiro de legacy (`/art-ranking`, `/wallet-connect`, `/explore-arts`, `/home-two`) — recomendación de diseño: retirar.
- ⚠️ Pendiente de Aurelio: correos reales de contacto (B-4).

## 4. Checklist para Claude Code

- [ ] /verify: aplicar los 3 estados de §1.1 (spinner/éxito/error) si no coinciden ya.
- [ ] /soporte: microcopy de topic cards → "Ver preguntas →" / "Ver planes →" (sin conteos falsos).
- [ ] Perfil: stats = Publicaciones / Seguidores / Rating.
- [ ] Mantener TODO(design) de /messages (contexto de propiedad + mobile) — llega en Batch A.1.
- [ ] Footer re-skin (handoff #2 §2.6 / #4 §1.6) — sigue pendiente, subir prioridad: es global.
- [ ] `npx tsc --noEmit && npx next build`.
