# Kiosqui — Handoff #11: Decisiones de diseño (cierre de huecos)

**Para:** Claude Code · **De:** Claude Design · **Fecha:** 2026-06-13 · **APROBADO.**
Rama `design/kiosqui-system`. Respuestas firmes a los 8 huecos de decisión. Sin ambigüedad: aplicar.

---

## 1. ⭐ PRIORIDAD — `.fill-btn` global (el hueco más grande)

Reemplazar el degradado azul→morado de Oction por el **sistema de botón Kiosqui** en TODA la app
(header "Publicar", registro, modales, "Enviar denuncia", etc.). El spec ya estaba en handoff #2 §Gap1
y vive en `components.css` (`.kq-btn`). **Decisión de roles:**

- **Primario / CTA = VERDE acción.** `background: var(--green-500)`, texto `var(--navy-900)`, pill.
  hover `--green-600`, active `--green-700` + `translateY(1px)`, focus ring lavanda `--shadow-focus`.
- **Secundario institucional = NAVY.** `--navy-800` texto cream — para acciones de marca no-CTA
  (ej. "Ver detalles", encabezados oscuros).
- **Outline** = transparente, texto `--primary`, borde `--border-strong` → hover borde navy + `--sand-100`.
- **Ghost** = transparente, texto `--primary` → hover `--sand-100`. Para cancelar/terciario.
- **Destructivo** = `--danger` texto blanco (denuncias/eliminar).

Acción concreta: en `_common.scss` redefiní `.fill-btn` (y `.fill-btn-*`) para que hereden de
`.kq-btn`/variantes; borrá todos los `linear-gradient(...)` hardcodeados de los partials
(`_about`, `_art`, `_creator`, `_footer`, `_custome`). Un solo lugar manda. Dark por tokens.

> Regla: **verde = lo que el usuario debe hacer** (publicar, recargar, enviar, crear). Navy = marca.
> Nunca dos verdes compitiendo en la misma vista; el resto va outline/ghost.

## 2. Enlace de referido — colisión `/invite/CODE` vs invite de empresa

**Decisión UX (namespacing):**
- `/invite/:code` → **referido personal Q50** (el caso masivo).
- Invitación de empresa/equipo → mover a `/invite/team/:code` (o `/team/join/:code`). No comparten ruta.
- **Pantalla de registro "te invitó X":** banner arriba del form de registro, fondo `--accent-soft`,
  avatar del invitador + "**Andrea** te invitó a Kiosqui. Al hacer tu primera compra de pauta, ambos
  ganan **Q50** en saldo." El código viaja oculto en el form (`referredBy`). Si el code es inválido,
  ocultar el banner y registrar normal (no bloquear).

## 3. ⭐ Estrellas de rating `#f59e0b` → VERDE de marca

Confirmado: **verde**, fuera el ámbar. Usar el token `--rating` (`green-600` light / `green-400` dark)
que ya formalizaron en F0.2. Reemplazar `#f59e0b` en todos los componentes de rating.

## 4. Badges ámbar ("pautada"/destacado `#fbbf24`/`#d97706`) → LAVANDA

Confirmado: alinear a paleta. Todo badge de "destacado/pautada/nuevo" usa el **lavanda con glow**
del handoff #3 §6 (gradiente `lav-500→lav-600`, texto blanco; dark `lav-400→lav-500` texto navy;
tarjeta destacada con anillo `is-featured`). Cero ámbar en badges.

## 5. Swap de logo por tema → SÍ, versiones transparentes

Confirmado (ya en handoff #3 §5): `logo-transparent.png` (wordmark navy) en light;
`logo-cream-transparent.png` (wordmark cream) en dark; footer siempre cream-transparent.
Componente `KiosquiLogo` con `useTheme()`. **Nunca** las versiones con caja de color.

## 6. Barra de propiedad en /messages — foto+precio reales

**Decisión de producto/diseño: SÍ, vale la pena.** Pedir a backend que el inbox exponga
`property: { thumbUrl, price, title, zone, hasGlb }` por conversación. Mientras backend lo entrega:
- Con datos → thumb real + título + precio (patrón ya diseñado).
- Sin datos (fallback) → el placeholder navy actual con `fa-camera`. No romper si falta.
Marcar `TODO(backend): inbox.property payload`.

## 7. Botón "3D" en /messages — OCULTAR si no hay modelo

**Decisión: ocultarlo** cuando la pub no tiene GLB (mejor que mostrar visor vacío). Requiere el flag
`hasGlb` del payload del punto 6. Render condicional `{property?.hasGlb && <Btn3D/>}`. Mismo criterio
en la pub-card/detalle: el acceso al visor 3D solo aparece si `hasGlb`.

## 8. Pauta — SÍ al rediseño completo (ya entregado en handoff #10)

**Decisión: usar el constructor ambicioso**, no el form viejo re-skineado. El rediseño (saldo navy,
objetivo en cards, **slider/estimado de impresiones en vivo**, segmentación ubicación+edad+fechas,
columna sticky "saldo + a pagar") ya está especificado en **handoff #10** con markup en
`batch_c/PautaInviteV2.jsx` y referencia en `Batch C - Admin y Engagement.html`. Tratar el #10 como
el spec de Pauta; este punto solo confirma que reemplaza al form viejo.

---

## Checklist
- [ ] `.fill-btn`/`.fill-btn-*` heredan de `.kq-btn`; cero gradientes Oction en partials. **(prioridad)**
- [ ] Rating `--rating` verde en todos lados; cero `#f59e0b`.
- [ ] Badges lavanda; cero `#fbbf24`/`#d97706`.
- [ ] `KiosquiLogo` swap por tema, transparentes, en header/drawer/footer.
- [ ] Registro con banner "te invitó X"; rutas de invite namespaced.
- [ ] /messages: payload `property` (TODO backend) + fallback; botón 3D condicional a `hasGlb`.
- [ ] /pauta = rediseño del handoff #10.
- [ ] Light/dark. `npx tsc --noEmit && npx next build`. Gaps nuevos → feedback §2.
