# Kiosqui — Handoff #10: Pauta (saldo+campaña+segmentación) · Invite Q50 · /messages mobile

**Para:** Claude Code · **De:** Claude Design · **Fecha:** 2026-06-12 · **APROBADO por Aurelio.**
**Referencias visuales:**
- `Batch C - Admin y Engagement.html` → secciones Pauta e Invitar (light+dark)
- `Batch A - Auth y Mensajes.html` → sección "Mensajes mobile" (3 artboards 390px)
**Markup:** `batch_c/PautaInviteV2.jsx`, `batch_a/MessagesMobile.jsx`.

Rama `design/kiosqui-system`. Solo skin+markup con tokens. La lógica ya existe; esto es re-skin.

---

## 1. /pauta — RE-SKIN de `PautaMain.tsx` (la lógica YA está bien)

`PautaMain.tsx` ya implementa todo el comportamiento correcto (saldo `useAdCredit`, objetivos
destacar/mensajes, presupuesto + estimado con `usePricingConfig`, métodos de pago, segmentación
`targetCitId`/`targetTowId`/`targetAgeMin`/`targetAgeMax` con `useCities`/`useMunicipalities`,
fechas, "Mis campañas" con paginación). **NO toques la lógica.** El único trabajo es **visual**:

1. **Eliminá el morado del template**: en el `<style jsx>` reemplazá todos los
   `var(--clr-theme-1, #6c5ce7)` y `rgba(108,92,231,…)` por tokens Kiosqui:
   - acento/seleccionado → `var(--lav-500)` / fondo `var(--accent-soft)` / texto `var(--lav-700)`
   - CTA principal (`.pa-create`) → `var(--green-500)` texto `var(--navy-900)`, pill (ya es 24px radius ✓)
   - estimado (`.pa-estimate`) verde → mantené verde pero con tokens (`var(--green-100)` / `var(--green-700)`)
   - barras/acentos de progreso → `var(--green-500)`
2. **Saldo (`.pa-credit-card`)**: rediseñar como la **tarjeta navy** del mock (fondo `--navy-800`,
   halo lavanda, monto display grande cream, nota "Incluye Q50 de referidos" en verde con fa-gift,
   botón "Recargar saldo" verde). Hoy es verde plano — cambialo al patrón del mock.
3. **Objetivo (`.pa-objective`)**: las 2 cards al estilo del mock (icon-tile, título + descripción,
   seleccionada = borde lavanda + fondo `--lav-100`). Hoy son botones simples.
4. **Segmentación**: ya tenés los selects de departamento/municipio + edad + fechas. Reordená bajo
   un encabezado "4 · Segmentación" y, opcional, mostrá los **badges-resumen** lavanda
   ("Depto · Municipio", "X–Y años") como en el mock. Inputs con `.kq-input`, selects con chevron.
5. **Cards/inputs/labels**: bordes `--border`, radios del sistema, sombras `--shadow-xs/sm`.
6. **Dark mode**: que todo salga por tokens (hoy los colores hardcodeados no responden al tema).
7. Mover el `<style jsx>` a `_pauta.scss` con tokens es lo ideal; si se queda inline, igual usar
   `var(--…)` del sistema, nunca hex del template.

Resultado esperado = la sección "Pauta · constructor de campaña" del canvas, con "Mis campañas"
re-skineado al mismo lenguaje (status pills con colores semánticos, barra de progreso verde).

## 2. /invite — Q50 (ajuste de copy + crédito)

Ver `batch_c/PautaInviteV2.jsx` (InviteScreen). Si ya existe pantalla, ajustar; si no, crear.
- Banner navy: "Invitá a un amigo y ganá **Q50** en pauta". Recompensa: **ambos** (invitador e
  invitado) reciben **Q50** cuando el invitado hace su **primera compra de pauta**. Sin tope, no vence.
- Tira de 3 pasos (compartí → se registra → compra pauta → Q50 c/u).
- Link de invitación (input readonly + Copiar verde) + compartir WhatsApp/Facebook/Correo.
- Card de progreso de referidos (cuántos activaron, crédito ganado, pendientes).
- El crédito ganado **alimenta el saldo de /pauta** (misma `useAdCredit`).

## 3. /messages mobile — patrón lista → hilo [WP de Batch A]

Ver `batch_a/MessagesMobile.jsx`. En viewport mobile (<860px) el split desktop se vuelve
**una vista a la vez**:
- **Bandeja**: pantalla completa — topbar "Mensajes" + buscador + lista de conversaciones.
- Al tocar una → **hilo**: topbar con **botón volver** + avatar + estado ("En línea"); **barra de
  contexto de propiedad compacta** (fondo `--accent-soft`, thumb + título + precio + botón "3D"
  `--accent`); burbujas; composer (clip + input pill + send verde).
- Desktop (≥860px) sigue con el split 360px+hilo ya existente (no cambia).
- El botón "Modelo 3D" / "3D" abre el visor 3D de la publicación (ya existe el componente).

## 4. PREGUNTAS TÉCNICAS — necesito que el equipo/Claude Code confirme

Para cerrar la lógica de wallet + referidos (respondé en el feedback §2 o donde prefieran):

**Pauta / wallet:**
1. ¿Existe tabla de **saldo/wallet** por usuario con movimientos (recarga vs referido vs gasto), o `useAdCredit` ya la cubre?
2. La **recarga con tarjeta**: ¿usa la misma pasarela que suscripciones o es flujo nuevo? (hoy los métodos con tarjeta son stub).
3. El **estimado de impresiones** sale de `usePricingConfig` (adImpressionCost/adClickCost). ¿Esos costos son reales/configurables por admin, o placeholder?
4. La pauta **descuenta saldo** por impresión/clic servido (`spent`) — ¿en tiempo real, por job diario?
5. ¿Una publicación = una sola campaña activa? (el código bloquea pub con campaña active/paused — confirmar que es la regla deseada).

**Referidos Q50:**
6. ¿Hay tabla de **referidos** (invitador, invitado, estado: registrado/primera-compra)?
7. ¿Qué evento acredita los Q50 a **ambos**? (webhook de primera compra de pauta exitosa). ¿Idempotente para no duplicar?
8. ¿El código de invitación (`ANA2026`) se genera por usuario y se guarda en el registro del invitado?
9. Crédito sin tope ni vencimiento: ¿se gasta igual que el recargado, o tiene marca de origen (no reembolsable)?

## 5. Checklist
- [ ] `PautaMain.tsx` re-skineado (cero `#6c5ce7`; saldo navy; objetivos cards lavanda; segmentación ordenada; dark por tokens).
- [ ] "Mis campañas" re-skineado (pills semánticas, progreso verde).
- [ ] /invite Q50 (copy + crédito a ambos, alimenta saldo).
- [ ] /messages responsive (lista→hilo en mobile; desktop intacto).
- [ ] Light/dark × mobile/desktop. `npx tsc --noEmit && npx next build`.
- [ ] Responder §4 en el feedback. Gaps nuevos → §2.

---

## Estado del backlog (post Batch A.1 + C)
- ✅ Todas las pantallas grandes: home, landing, auth, messages (+mobile), perfil, contacto/FAQ/soporte, legales, pub-card v2.1, my-publications, admin, pauta, activity, survey, invite.
- ✅ Footer (Aurelio confirmó que ya está hecho).
- 🟡 Pendiente solo de **decisión de producto**: retiro de legacy (`/art-ranking`, `/wallet-connect`, `/explore-arts`, `/home-two`) y mapeo `pubtra_id` (venta/renta).
- 🟡 Pendiente de **backend** (autorización): wallet/recarga real, métricas my-pubs, dual-divisa, variant `card32`.
