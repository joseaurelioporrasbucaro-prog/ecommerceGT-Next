# Kiosqui — Handoff #5: Batch A — Auth (/login /register /forgot /verify) + /messages

**Para:** Claude Code · **De:** Claude Design · **Fecha:** 2026-06-10 · **Estado:** APROBADO por Aurelio.
**Referencia visual:** `Batch A - Auth y Mensajes.html` (canvas con 7 artboards, light+dark)
**Referencia de markup:** `batch_a/AuthScreens.jsx` y `batch_a/MessagesScreen.jsx` (React cosmético — copiar la estructura visual, NO la falta de lógica).

Rama: `design/kiosqui-system`. Commits `design:`. Reglas de no-regresión del handoff #2 §4 vigentes
(no tocar hooks/Formik/Yup/React Query/AuthContext; solo skin + markup).

---

## 1. Auth — layout compartido `AuthShell`

Las 4 rutas comparten un shell de dos paneles (crear componente `src/components/auth/AuthShell.tsx`):

- **Grid:** `minmax(420px, 44%) 1fr`. En mobile (<860px): panel de marca se colapsa a una franja superior de ~180px (logo + headline corto, sin bullets).
- **Panel izquierdo (marca):** fondo `--navy-800` SIEMPRE (no cambia con tema) con halos:
  `radial-gradient(620px 420px at 90% -10%, rgba(181,172,239,.30), transparent 60%), radial-gradient(520px 380px at -10% 110%, rgba(155,198,74,.16), transparent 60%)`.
  Contenido: logo `logo-cream-transparent.png` 36px arriba; headline display 38px/1.15 cream
  (cambia por ruta, ver §2); 3 bullets de valor con ícono en tile 38px lavanda translúcida
  (`rgba(181,172,239,.18)` + ícono `--lav-300`): fa-cube "Vé cada inmueble en modelo 3D",
  fa-id-card "Propietarios verificados con DPI", fa-comments "Tratá directo, sin intermediarios";
  pie: "© 2026 Kiosqui · Hecho en Guatemala 🇬🇹" en `rgba(248,244,238,.5)`.
- **Panel derecho (formulario):** fondo `--bg` (cream light / deep navy dark), formulario centrado max-width 400, sin card.

Elementos de formulario (ya existen como primitivas en `components.css`):
- Título: display 30px bold + sub `--fg-muted`.
- Inputs `.kq-input` con label `.kq-field`. Focus = borde lavanda + `--shadow-focus`.
- Submit: `.kq-btn--action` full-width, alto 50px, font 16px.
- Links inline en `--accent-hover` (lavanda), bold.
- Checkboxes con `accent-color: var(--green-600)`.

## 2. Las 4 rutas

| Ruta | Headline del panel | Particularidades |
|---|---|---|
| `/login` | "Bienvenido de vuelta. Tu próxima propiedad te espera." | Email + contraseña (link "¿La olvidaste?" a la derecha del label) + checkbox "Mantener sesión iniciada" + footer "¿No tenés cuenta? **Registrate gratis**" |
| `/register` | "Creá tu cuenta y publicá tu primera propiedad gratis." | Nombre/Apellido en grid 2-col, email, contraseña ("Mínimo 8 caracteres"), checkbox términos+privacidad (links lavanda), footer "¿Ya tenés cuenta? **Iniciá sesión**" |
| `/forgot` | "Tranquilo, recuperamos tu acceso en un minuto." | Back-link "← Volver a iniciar sesión" arriba; email; CTA "Enviar enlace"; nota informativa en card `--accent-soft` radius md con fa-info-circle: "Si no lo ves en tu bandeja, revisá la carpeta de spam. El enlace vence en 30 minutos." |
| `/verify` | "Un paso más. Confirmá que sos vos." | 4 cajas de código 64×72, display bold 28px, radius md; caja activa = borde 2px lavanda + `--shadow-focus`; sub muestra el correo en bold; CTA "Verificar"; footer "¿No llegó? **Reenviar código** · disponible en 0:42" (timer real con la lógica existente) |

Ajustar el número de cajas al largo real del código del backend (la referencia usa 4; si es 6, mismo estilo).

## 3. `/messages`

Ver `batch_a/MessagesScreen.jsx`. Estructura:

1. **HeaderTwo `compact`** (sin buscador): avatar perfil izquierda, logo 32px, campana + hamburguesa derecha. Es la prop `compact` definida en handoff #4 §1.3.
2. **Grid `360px 1fr`** bajo el header (altura completa, `overflow` interno):
   - **Lista de conversaciones** (fondo `--bg-elevated`, borde derecho): título "Mensajes" display 20px; buscador pill 40px; items: avatar 46px gradiente navy, nombre bold + hora caption, **línea de contexto de propiedad** en lavanda con fa-home (cada conversación está atada a una publicación — usar el dato real), preview del último mensaje truncado, badge no-leídos verde (`--green-500`, texto navy). Item activo: fondo `--accent-soft`, radius md.
   - **Hilo:** barra de contexto de propiedad arriba (thumb 52×40 radius sm, título bold, "precio · zona · con {nombre} ✓", botones `.kq-btn--outline sm` "Ver publicación" y `.kq-btn--accent sm` con fa-cube "**Modelo 3D**"); área de mensajes con separador de fecha (chip `--surface-sunk`); **burbujas**: entrantes = `--surface` con borde `--border`, radius `18px 18px 18px 4px`; salientes = `--navy-800` texto cream, radius `18px 18px 4px 18px`; hora en caption debajo; **composer**: clip (paperclip) circular outline, input pill flex, send circular 46px verde con fa-paper-plane.
3. **Dark:** todo via tokens (no hardcodear); el logo del header usa el swap del componente `KiosquiLogo`.
4. Mobile (<860px): lista y hilo se vuelven dos vistas apiladas (lista → tap → hilo con back). La referencia no incluye mobile; usar el mismo lenguaje.

## 4. Checklist

- [ ] `AuthShell` compartido + 4 rutas re-skineadas (Formik/Yup intactos; mapear errores de validación al estilo `.kq-input--error` + texto `--danger` caption).
- [ ] `/messages` re-skineado conservando la lógica de fetch/envío existente.
- [ ] Logos SOLO transparentes (assets actualizados — recortados, copiar de `assets/` de este paquete a `public/brand/` reemplazando los anteriores).
- [ ] Probar light/dark × mobile/desktop en las 5 rutas.
- [ ] `npx tsc --noEmit && npx next build`.
- [ ] Gaps nuevos → archivo de feedback §2 con `TODO(design)`.
