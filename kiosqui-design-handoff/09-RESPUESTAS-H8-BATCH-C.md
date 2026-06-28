# Kiosqui — Handoff #9: Respuestas H8 + Batch C (admin, pauta, activity, survey, invite)

**Para:** Claude Code · **De:** Claude Design · **Fecha:** 2026-06-12
**Dos partes:** (1) respuestas a las preguntas abiertas del bloque [H8] del feedback; (2) Batch C nuevo.
**Referencia visual Batch C:** `Batch C - Admin y Engagement.html` (canvas, 6 artboards).
**Markup:** `batch_c/AdminScreen.jsx`, `batch_c/EngagementScreens.jsx`.

---

## PARTE 1 — Respuestas a [H8]

### [H8-1] Switch de divisa = doble valor real → APROBADO
Decisión de Aurelio correcta: **nada de tasas inventadas**. El switch alterna solo si la
publicación trae los dos precios reales; con uno solo, muestra estático. El frontend ya está
listo (`priceAlt`/`currencyAlt` leídos defensivamente). El backend dual-divisa
(`/upload` con 2 campos, al menos uno obligatorio; persistir en DB/`savepubl`/`publications`)
queda como **feature de backend pendiente de autorización de Aurelio + `Codigo Aurelio`**.
Diseño no bloquea. Cuando exista, el switch se enciende solo.

### [H8-2] Métricas en /my-publications → SIMPLIFICAR ahora, backend después
No bloquees por esto. Decisión:
- **Mostrá solo "vistas"** si el dato existe en algún lado barato; si no, **ocultá la fila de
  métricas por completo** (no muestres `—`, se ve roto). La fila de métricas es *opcional* en el diseño.
- El endpoint con contadores agregados (preferido: **extender `GET /my-publications/:cus_id`**
  con `views/favorites/inquiries`, no 3 endpoints) queda como backend pendiente
  (`Codigo Aurelio`). Cuando llegue, se reactiva la fila completa.

### [H8-3] Menú "⋯" en mobile del OwnerRow → OK dejarlo para después
El wrap actual (acciones apiladas) es aceptable para MVP. El dropdown ⋯ lo diseño
explícitamente en un batch de pulido (con estado abierto + accesibilidad). No es bloqueante.
Mientras: en mobile, **la acción principal (verde) full-width arriba, secundarias en fila
debajo** — ordenado, sin menú.

### [H8-4] Correos legales → SÍ, los 4 en `.com`
Confirmado: **todo `@kiosqui.com`**. Cambiá `privacidad@kiosqui.com` y `seguridad@kiosqui.com`
en `PrivacyMain.tsx` y `messages/*/legal.json`. Los 4 correos oficiales:
`soporte@kiosqui.com` · `ventas@kiosqui.com` · `privacidad@kiosqui.com` · `seguridad@kiosqui.com`.
Quitá todos los `.gt`.

### [H8-5] Sufijo `/mes` en rentas → cablear con `pubtra_id`
Sí queremos el `/mes` en rentas. El contrato: **`pubtra_id` ES el tipo de transacción**
(venta vs renta). Pedí al catálogo/producto el mapeo de valores (ej. 1=venta, 2=renta) y:
- Si `pubtra_id` = renta → mostrar sufijo " /mes" después del precio.
- Si = venta → sin sufijo.
Si el mapeo no está documentado, dejá `TODO(pubtra-map)` y preguntá a producto el valor exacto
— NO adivines. No es backend nuevo, es leer un campo que ya existe.

### [H8-6] ThemeChanger flotante fuera → APROBADO
Correcto. El toggle vive solo en el header. Consistente en toda la app.

### [H8-7] Un solo flag de pauta → usar SIEMPRE el badge "Destacado" lavanda
Aclaración de diseño: **el badge navy "Patrocinado" del canvas fue una exploración; NO lo uses.**
Con un solo flag (`/featured-publications` = pauta pagada), la regla es simple:
- Publicación con pauta → **badge "Destacado" lavanda** (el del sistema v2.1).
- Regla anti-redundancia [CARD-4] sigue: en la sección rotulada de la home, sin badge.
- El CTA "Enviar mensaje" verde aparece cuando hay `ctaOverride` (campaña tipo mensajes),
  independientemente del badge.
No necesitamos distinguir "Destacado" vs "Patrocinado" visualmente mientras haya un solo flag.
Un único lenguaje (lavanda) = más limpio.

---

## PARTE 2 — Batch C

Rutas: `/admin`, `/pauta`, `/activity`, `/survey`, `/invite`. Solo skin+markup, tokens, light+dark.

### /admin (`AdminMain.tsx` o equivalente)
- **Layout propio** (no HeaderTwo): sidebar fijo 240px `--navy-900` con logo cream, nav de
  administración (Resumen/Publicaciones/Usuarios/Pauta/Reportes/Configuración — activo con fondo
  lavanda translúcido + texto cream), usuario al fondo.
- Contenido: título + buscador; **4 stat cards** (icon-tile lavanda, valor display 27, delta verde/danger);
  **tabla de cola de moderación** (encabezados overline, filas con estado en pill de color, acciones
  aprobar `--green-100`/rechazar `--danger-bg`/ver outline).
- Dark: el sidebar ya es oscuro; el resto via tokens.

### /pauta (`PautaMain.tsx`)
- HeaderTwo estándar + PageHead "Destacá tu propiedad".
- **Card de la publicación** a promocionar (thumb + título + precio + "Cambiar").
- **3 planes** (Básico/Impulso/Máximo): Impulso `pop` con borde `--navy-800` + badge verde
  "Más elegido" flotante; lista de features con check verde; CTA (Impulso verde, otros outline).
- Reusa el patrón de pricing del handoff #1; precios en Q (es servicio local, no el `$` de
  subscriptions — acá sí es GTQ).

### /activity (`ActivityMain.tsx`)
- HeaderTwo + feed centrado (max 640). **Agrupado por día** (overline "Hoy"/"Ayer").
- Items: icon-tile de color según tipo (mensaje lavanda, favorito danger, vista navy,
  aprobación verde, pauta lavanda) + texto principal/secundario + timestamp. "Marcar todo leído".

### /survey (`SurveyMain.tsx`)
- HeaderTwo + card centrada (max 600). **Barra de progreso** (X de N + %), pregunta display,
  **escala 1-5** (botón seleccionado lavanda), labels extremos, Atrás (ghost) / Continuar (verde).
- Una pregunta por pantalla. Adaptar el tipo de input según la pregunta real (escala, opción
  múltiple con `.kq-chip`, texto con `.kq-input`).

### /invite (`InviteMain.tsx`)
- HeaderTwo + **banner navy** con halos (ícono regalo, headline, recompensa con número verde).
- Link de invitación (input readonly + "Copiar" verde), botones de compartir
  (WhatsApp/Facebook/Correo con sus colores de marca en el ícono), card de progreso de referidos.

## Checklist Batch C
- [ ] /admin con sidebar propio + stats + tabla moderación.
- [ ] /pauta con planes (precios GTQ).
- [ ] /activity, /survey, /invite según specs.
- [ ] Light/dark × mobile (admin: sidebar colapsa a drawer/iconos en mobile).
- [ ] `npx tsc --noEmit && npx next build`. Gaps → feedback §2.

---

## Estado del backlog tras Batch C
- ✅ A (auth+messages), B (perfil+soporte+legales), Card v2.1, C (admin+engagement).
- 🔜 **Batch A.1**: pulido /messages (barra de contexto de propiedad + modelo 3D + mobile lista→hilo).
- 🔜 **Footer global** (sigue pendiente — subir prioridad, es visible en todas las páginas).
- ⚠️ Backend pendiente (autorización Aurelio): dual-divisa [H8-1], métricas my-pubs [H8-2], variant card32 [CARD-2].
- ⚠️ Producto: mapeo `pubtra_id` [H8-5], retiro de legacy (`/art-ranking`, `/wallet-connect`, `/explore-arts`, `/home-two`).
