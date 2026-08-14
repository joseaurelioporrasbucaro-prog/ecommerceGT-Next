# Test Plan — KIOSQUI / ecommerceGT

> **Propósito:** acumular casos de prueba manuales (smoke tests + regression) que después se traducen 1:1 a tests automatizados (Playwright para E2E, Vitest para unidad, supertest para API). Cada caso describe el setup, los pasos y el resultado esperado en lenguaje neutro respecto a frameworks.
>
> **Convención:** cada caso tiene un ID estable `T-NN` que NO se renumera nunca. Si una prueba queda obsoleta, se marca `OBSOLETE` pero el ID se reserva para mantener trazabilidad histórica.
>
> **Estados de un caso:**
> - 🟢 PASS — corrido manualmente, pasa
> - 🔴 FAIL — corrido manualmente, falla (con link al issue)
> - ⚪ PENDING — escrito pero no ejecutado todavía
> - 🤖 AUTOMATED — ya tiene test automatizado en CI
> - 🔒 OBSOLETE — ya no aplica

## Stack futuro de automatización

| Tipo | Herramienta | Cubre |
|---|---|---|
| E2E (browser) | Playwright | T-* en flujos completos UI |
| API integration | supertest + Vitest | T-* que solo tocan endpoints HTTP |
| Unitario | Vitest | helpers, hooks aislados |
| Visual regression | Playwright screenshots | layout de páginas críticas |

---

## Convenciones de setup

Antes de cada caso, asumimos:
- Backend corriendo en `localhost:4000` con BD `ecommercedb` migrada al estado de `database.sql`
- Frontend corriendo en `localhost:3000`
- Cuenta de prueba `aurelio@test.com` con `cus_role='admin'` (cuando se necesita admin)
- Cuenta de prueba `tester@test.com` con `cus_role='user'` (cuando se necesita user normal)
- Sin sesión activa al empezar (cookie limpia)

**Helpers SQL** que aparecen con frecuencia (copy-paste):

```sql
-- RESET-A: limpiar bloqueos de una cuenta
UPDATE ecom.customer
SET cus_password_fail_count = 0,
    passta_id = 1,
    cus_banned_until = NULL,
    cus_ban_reason = NULL,
    cus_banned_at = NULL,
    cus_account_status = 'active'
WHERE cus_user_name = '<EMAIL>';

-- RESET-B: ascender una cuenta a admin
UPDATE ecom.customer SET cus_role = 'admin'
WHERE cus_user_name = '<EMAIL>';

-- VERIFY-A: estado de bloqueo de una cuenta
SELECT cus_user_name, cus_role, cus_account_status, passta_id,
       cus_password_fail_count, cus_banned_until
FROM ecom.customer WHERE cus_user_name = '<EMAIL>';
```

---

# 📋 Casos de prueba

## Auth & Account Lifecycle

### T-01 — Login exitoso con credenciales válidas — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGTBackEnd/tests/api/auth/login.spec.js`

**Setup:** Cuenta `tester@test.com` con password `Test123!`, status `active`, `passta_id=1`.
**Pasos:**
1. Ir a `/login`
2. Ingresar email y password
3. Click "Sign in Account"

**Esperado:**
- Toast verde "¡Inicio de sesión exitoso!"
- Redirige a `/`
- Cookie `token` httpOnly presente
- `cus_password_fail_count` queda en `0` aunque venga >0 (bugfix de la Fase 8.3.3)

### T-02 — Login con password incorrecto, intentos 1-3 — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGTBackEnd/tests/api/auth/login.spec.js`

**Setup:** Cuenta resetada (RESET-A).
**Pasos:** Ingresar 3 veces con password mal.

**Esperado:** Cada intento devuelve `400 { message: "Contraseña incorrecta" }`. Frontend muestra toast rojo. `cus_password_fail_count` incrementa a 1, 2, 3.

### T-03 — Login con password incorrecto, intento 4 (warning) — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGTBackEnd/tests/api/auth/lockout.spec.js`

**Setup:** Cuenta con `cus_password_fail_count = 3`.
**Pasos:** Intentar login con password mal.

**Esperado:**
- Backend devuelve `400 { nearLockout: true, attemptsRemaining: 1, message: "Contraseña incorrecta. Te queda 1 intento antes de que tu cuenta se bloquee por 30 minutos. Te recomendamos restablecer tu contraseña ahora." }`
- Frontend muestra **toast warning amarillo durante 8 segundos** con ese mensaje
- `cus_password_fail_count = 4`

### T-04 — Login con password incorrecto, intento 5 (bloqueo) — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGTBackEnd/tests/api/auth/lockout.spec.js`

**Setup:** Cuenta con `cus_password_fail_count = 4`.
**Pasos:** Intentar login con password mal.

**Esperado:**
- Backend devuelve `403 { passwordLocked: true, minutesRemaining: 30, message: "Tu cuenta fue bloqueada por 30 minutos por demasiados intentos fallidos. Después deberás restablecer tu contraseña." }`
- BD: `passta_id=2`, `cus_banned_until = NOW() + 30 min`, `cus_password_fail_count=5`
- Frontend muestra **card grande de bloqueo con botón "Restablecer contraseña"**
- El botón "Restablecer contraseña" navega a `/forgot` (NO al flujo de apelación)

### T-05 — Login bloqueado, dentro de la ventana de 30 min — 🟢 PASS
**Setup:** Cuenta con `passta_id=2`, `cus_banned_until = NOW() + 20 min`.
**Pasos:** Intentar login con password CORRECTO.

**Esperado:** Backend devuelve `403 { passwordLocked: true, minutesRemaining: ~20 }`. UI: mismo card de bloqueo. **No debe entrar aunque el password sea correcto.**

### T-06 — Login bloqueado, ventana vencida (must reset) — ⚪ PENDING
**Setup:** Cuenta con `passta_id=2`, `cus_banned_until = NOW() - 5 min` (vencida).
**Pasos:** Intentar login con password CORRECTO.

**Esperado:** Backend devuelve `403 { mustResetPassword: true }` con mensaje indicando que debe restablecer. UI: card con botón "Restablecer contraseña". **No autolibera por tiempo.**

### T-07 — Recovery password reactiva la cuenta bloqueada — ⚪ PENDING
**Setup:** Cuenta bloqueada (`passta_id=2`).
**Pasos:**
1. Ir a `/forgot`, solicitar reset
2. Recibir email con código temporal
3. Cambiar password con el código

**Esperado:** Login con password nuevo entra normal. BD: `passta_id=1`, `cus_password_fail_count=0`, `cus_banned_until=NULL`. Pero si `cus_account_status='suspended'` por soporte, ese estado SE PRESERVA (el reset no rompe la sanción).

### T-08 — Recovery rechazado durante ventana de 30 min — ⚪ PENDING
**Setup:** Cuenta con `passta_id=2`, `cus_banned_until = NOW() + 15 min`.
**Pasos:** Intentar solicitar `/forgot` (POST `/recoverypass`).

**Esperado:** Backend devuelve `429` (rate limit / anti-abuse). El usuario debe esperar a que venza la ventana de 30 min para poder resetear.

### T-09 — Login exitoso resetea contador de fallos — 🟢 PASS (T-01)
Cubierto en T-01 — ver Esperado.

### T-10 — Cuenta sancionada (banned) por soporte — ⚪ PENDING
**Setup:** `cus_account_status='banned'`.
**Pasos:** Intentar login.

**Esperado:** `403 { banned: true, message: "Tu cuenta fue baneada permanentemente. Motivo: ..." }`. UI muestra card de apelación con `<textarea>` para escribir reason → crea ticket de soporte.

### T-11 — Cuenta suspended con `banned_until` futuro — ⚪ PENDING
**Setup:** `cus_account_status='suspended'`, `cus_banned_until = NOW() + 2 días`.
**Pasos:** Intentar login.

**Esperado:** `403 { banned: true }` con mensaje incluyendo "Hasta el dd/mm/yyyy". UI: card de apelación.

### T-12 — Cuenta suspended con ventana vencida → autolibera — ⚪ PENDING
**Setup:** `cus_account_status='suspended'`, `cus_banned_until = NOW() - 1 día`.
**Pasos:** Login con password correcto.

**Esperado:** Backend ejecuta el `UPDATE ... SET cus_account_status='active'` automáticamente y deja entrar. BD: status quedó en `active`, columnas de ban en `NULL`.

### T-13 — Cuenta inactive (desactivada por usuario) → autolibera en login — ⚪ PENDING
**Setup:** `cus_account_status='inactive'` (vía `/deactivate-account`).
**Pasos:** Login con password correcto.

**Esperado:** Entra normal. BD: `cus_account_status='active'`.

### T-14 — Cuenta pending_deletion dentro del plazo → autolibera — ⚪ PENDING
**Setup:** `cus_account_status='pending_deletion'`, `cus_deletion_scheduled_at = NOW() + 15 días`.
**Pasos:** Login con password correcto.

**Esperado:** Entra y BD: `cus_account_status='active'`, `cus_deletion_scheduled_at=NULL`, publicaciones con `pubsta_id=5` vuelven a `pubsta_id=2`.

### T-15 — Cuenta pending_deletion vencida → rechazo — ⚪ PENDING
**Setup:** `cus_account_status='pending_deletion'`, `cus_deletion_scheduled_at = NOW() - 1 día`.
**Pasos:** Intentar login.

**Esperado:** `403 "El plazo de recuperación de esta cuenta venció. La eliminación es definitiva."`. Cleanup lazy anonimiza la cuenta en próximas requests.

---

## Soporte — Portal `/soporte/usuarios`

### T-20 — Acceso requiere rol support/admin — ⚪ PENDING
**Setup:** Usuario con `cus_role='user'`.
**Pasos:** Navegar directo a `/soporte/usuarios`.

**Esperado:** Mensaje "Esta sección es solo para personal de soporte". No carga la tabla.

### T-21 — Badge "Bloqueo por contraseña" en usuario bloqueado — ⚪ PENDING (era 🔴 FAIL, fix en commit XXX)
**Setup:** Logueado como admin. Otro usuario con `passta_id=2`, `cus_banned_until = NOW() + 25 min`.
**Pasos:** Ir a `/soporte/usuarios`.

**Esperado:**
- Fila del usuario bloqueado muestra badge naranja **"🔒 Bloqueo por contraseña"**
- Subtexto: **"Espera hasta HH:MM"** con hora real
- **NO debe aparecer el chip "Activo"** (sería confuso porque la cuenta NO está realmente activa)

### T-22 — Botón "Desbloquear contraseña" para usuario `user` — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGTBackEnd/tests/api/support/unlock-password.spec.js`

**Setup:** Igual a T-21.
**Pasos:**
1. Ver botón "🔑 Desbloquear contraseña" en la columna de acciones
2. Click
3. Verificar toast de éxito

**Esperado:** POST `/support/users/:id/unlock-password` → 200. BD del usuario: `passta_id=1`, `cus_password_fail_count=0`, `cus_banned_until=NULL`. Tabla refresca: badge desaparece, botón también.

### T-23 — Botón "Desbloquear contraseña" para usuario STAFF — ⚪ PENDING (era 🔴 FAIL, fix en commit XXX)
**Setup:** Otro usuario con `cus_role='support'` que cayó en `passta_id=2`.
**Pasos:** Ir a `/soporte/usuarios`, buscar la fila.

**Esperado:** El botón "Desbloquear contraseña" **TAMBIÉN debe aparecer** para staff. Bug previo: el gate `!isStaff` lo escondía.

### T-24 — Cuenta `suspended` + `pwLocked` simultáneo — ⚪ PENDING
**Setup:** Usuario con `cus_account_status='suspended'` Y `passta_id=2`.
**Pasos:** Ver fila en `/soporte/usuarios`.

**Esperado:** Aparecen **ambos** chips: "Suspendido" (rojo) **y** "Bloqueo por contraseña" (naranja). El chip "Suspendido" NO se oculta. En acciones, botón "Reactivar" + botón "Desbloquear contraseña".

### T-25 — Recovery preserva sanción de soporte — ⚪ PENDING
**Setup:** Usuario `suspended` Y `passta_id=2`.
**Pasos:** Hacer recovery exitoso de password.

**Esperado:** BD: `passta_id=1`, `cus_password_fail_count=0`. PERO: `cus_account_status` sigue `suspended`, `cus_banned_until` SIGUE con la fecha de la sanción de soporte (NO la limpia, porque viene de soporte no del bloqueo de password).

### T-26 — Sancionar (banear permanentemente) — ⚪ PENDING
**Setup:** Logueado como admin/support. Usuario `user` con status `active`.
**Pasos:** Click "Sancionar" → llenar motivo "Spam reiterado" → tipo "Permanente".

**Esperado:** `cus_account_status='banned'`, `cus_ban_reason='Spam reiterado'`, `cus_banned_at=NOW()`. Fila muestra chip rojo "Baneado". El usuario al loguearse recibe el flujo de apelación (T-10).

### T-27 — Suspender temporal — ⚪ PENDING
**Setup:** Igual a T-26.
**Pasos:** Click "Sancionar" → motivo "Reportes múltiples" → tipo "Temporal" → duración 7 días.

**Esperado:** `cus_account_status='suspended'`, `cus_banned_until=NOW()+7d`. Chip "Suspendido" naranja. Login muestra mensaje con fecha hasta.

### T-28 — Reactivar cuenta sancionada — ⚪ PENDING
**Setup:** Usuario `banned` o `suspended`.
**Pasos:** Click "Reactivar".

**Esperado:** `cus_account_status='active'`, columnas de ban a NULL. Login deja entrar normalmente.

### T-29 — Staff no puede ser sancionado — ⚪ PENDING
**Setup:** Usuario con `cus_role='admin'` o `'support'`.
**Pasos:** Ver fila en `/soporte/usuarios`.

**Esperado:** En la columna de acciones, NO aparece "Sancionar". Si hay pwLocked, sí aparece "Desbloquear" (T-23).

---

## Admin — Portal `/admin/config`

### T-30 — Acceso requiere rol admin — 🟢 PASS
**Setup:** Usuario con `cus_role='support'` (NO admin).
**Pasos:** Navegar a `/admin/config`.

**Esperado:** Mensaje "Esta sección es solo para administradores".

### T-31 — Lectura de tarifas vigentes — 🟢 PASS
**Setup:** Admin logueado. `ecom.platform_config` con seeds default.
**Pasos:** Cargar `/admin/config`.

**Esperado:** 3 tarjetas (Impresión / Clic / Presupuesto mínimo) con los valores actuales de la BD mostrados como "Actual: Q X.XX". Inputs prefilled con esos valores.

### T-32 — Editar tarifa y guardar — 🟢 PASS
**Setup:** En `/admin/config`.
**Pasos:**
1. Cambiar valor de "Costo por clic" de 0.50 a 0.75
2. Verificar que el borde de la tarjeta se ilumine (`is-dirty`)
3. Click "Guardar cambio"

**Esperado:** Toast verde "Costo por clic actualizado a Q 0.7500". BD: `platform_config.ad_click_cost=0.75`. `updated_by=cus_id` del admin. La tarjeta deja de estar dirty. Refresca el "Actual: Q 0.75".

### T-33 — Descartar cambios sin guardar — ⚪ PENDING
**Setup:** Modificar input pero NO guardar.
**Pasos:** Click "Descartar".

**Esperado:** Input vuelve al valor `Actual`, border deja de estar dirty.

### T-34 — Validación valor negativo — ⚪ PENDING
**Setup:** En `/admin/config`.
**Pasos:** Cambiar valor a `-1` y guardar.

**Esperado:** Backend rechaza `400 "Valor inválido."`. Frontend muestra toast error. BD sin cambios.

### T-35 — Validación valor no numérico — ⚪ PENDING
**Setup:** Frontend ya restringe `type="number"` pero verificar el backend.
**Pasos:** POST manual `/admin/config { key: 'ad_click_cost', value: 'abc' }`.

**Esperado:** Backend rechaza `400 "Valor inválido."`. BD sin cambios.

### T-36 — Acceso al portal vía sidebar — 🟢 PASS
**Setup:** Admin logueado.
**Pasos:** Abrir panel lateral derecho "Mi cuenta".

**Esperado:** Aparecen grupos:
- "Soporte" (tickets, verificaciones, denuncias, usuarios)
- "Administración" (Imágenes del sitio, Configuración)

Click "Configuración" → llega a `/admin/config`.

### T-37 — Usuario normal NO ve secciones admin/soporte — ⚪ PENDING
**Setup:** Usuario con `cus_role='user'`.
**Pasos:** Abrir panel "Mi cuenta".

**Esperado:** Solo "Mi cuenta" + "Cerrar sesión". NO grupos de Soporte ni Administración.

### T-38 — Usuario `support` ve Soporte pero NO Administración — ⚪ PENDING
**Setup:** `cus_role='support'`.
**Pasos:** Abrir panel.

**Esperado:** "Mi cuenta" + "Soporte" + "Cerrar sesión". NO grupo Administración.

---

## Publicaciones — Crear / Editar / Buscar

### T-40 — Crear publicación con amenidades — ⚪ PENDING
**Setup:** Usuario activo. BD con seed de 26 amenidades en `ecom.cat_amenities`.
**Pasos:**
1. Ir a `/upload`
2. Llenar campos obligatorios (título, tipo, precio, ubicación, descripción)
3. Marcar 3 chips de la sección "Otros — comodidades": Piscina, Gimnasio, BBQ
4. Subir 1 imagen
5. Click "Publicar"

**Esperado:** POST `/save-publication` con `amenities: [1, 2, 4]`. BD: insert en `publications` + 3 rows en `publications_amenities`. Redirige a `/my-publications` y aparece la nueva.

### T-41 — Editar publicación cambiando amenidades — ⚪ PENDING
**Setup:** Publicación creada con amenities [1, 2].
**Pasos:**
1. Ir a `/my-publications`, click "Editar"
2. Desmarcar Piscina (1), marcar Salón de eventos (3)
3. Guardar

**Esperado:** PUT `/edit-publication/:id` con `amenities: [2, 3]`. BD: delete-all + insert-new pattern. Después del save, las amenidades son exactamente [2, 3].

### T-42 — Detalle muestra amenidades — ⚪ PENDING
**Setup:** Publicación con 3 amenidades.
**Pasos:** Abrir `/publications/:id`.

**Esperado:** Sección "Comodidades" visible con 3 chips, cada uno con icono + nombre.

### T-43 — Filtro AND de amenidades en `/publications` — ⚪ PENDING
**Setup:** 3 publicaciones:
- A: amenities [1, 2]
- B: amenities [1, 3]
- C: amenities [1, 2, 3]

**Pasos:**
1. Ir a `/publications`
2. Abrir "Filtros avanzados"
3. Marcar Piscina (1) + Gimnasio (2)

**Esperado:** Solo aparecen A y C (que tienen AMBAS). B se filtra porque le falta Gimnasio.

### T-44 — Terreno: campos frente/fondo visibles — ⚪ PENDING
**Setup:** Crear publicación.
**Pasos:** Seleccionar tipo "Terreno".

**Esperado:** Aparecen inputs "Frente (m)" y "Fondo (m)" además de "Tamaño (m²)". Para casas/aptos NO aparecen.

### T-45 — Casa: nivel se etiqueta como "Niveles" — ⚪ PENDING
**Setup:** Crear publicación.
**Pasos:** Seleccionar tipo "Casa".

**Esperado:** El campo `pubdet_level` se etiqueta como "Niveles" (cantidad de pisos), no "Nivel del edificio" (que es para apto).

### T-46 — Búsqueda por texto en `/publications` — ⚪ PENDING
**Setup:** Publicación con título "Casa en Mixco zona 1".
**Pasos:** Escribir "Mixco" en la barra de búsqueda.

**Esperado:** Aparece esa publicación. Búsqueda case-insensitive y por título/ubicación/descripción.

### T-47 — Vista Lista / Mapa / Split — ⚪ PENDING
**Setup:** Al menos 5 publicaciones con `cou_id=502` (Guatemala).
**Pasos:** Click los 3 toggles del header.

**Esperado:**
- Lista: grid de cards
- Mapa: Leaflet con OpenStreetMap + clustering, markers en centroides de municipios
- Split: 50/50 con cards a la izquierda y mapa a la derecha. Cards en grid `repeat(auto-fill, minmax(260px, 1fr))`.

---

## Pauta / Campañas

### T-50 — Crear campaña descuenta crédito — ⚪ PENDING
**Setup:** Usuario con `cus_ad_credit = 100`.
**Pasos:** Crear campaña con presupuesto Q 30.

**Esperado:** BD: `customer.cus_ad_credit = 70`, fila en `ad_campaigns`.

### T-51 — Campaña expirada reembolsa al crédito — ⚪ PENDING
**Setup:** Campaña con `end_date < hoy` y budget no consumido = 15.
**Pasos:** Cron job o request que dispare el cleanup.

**Esperado:** `cus_ad_credit += 15`, campaña marcada como `expired`. Log de auditoría.

---

## Planes

### T-60 — Listado de planes globales — ⚪ PENDING
**Setup:** BD con 6 planes default + 1 personalizado con `bus_id=5`.
**Pasos:** Como usuario con `bus_id=3`, abrir `/pricing-plan`.

**Esperado:** Ve los 6 planes globales. **NO** ve el personalizado (bus_id=5).

### T-61 — Plan personalizado visible solo a la empresa dueña — ⚪ PENDING
**Setup:** Igual, pero usuario con `bus_id=5`.
**Pasos:** Abrir `/pricing-plan`.

**Esperado:** Ve los 6 globales + el personalizado, este último con borde amarillo `border-warning border-4`.

---

## Password Recovery — Security (Fase 8.3.5)

> Fase 8.3.5 reemplaza el esquema de contraseña temporal por tokens cripto-seguros: token random de 32 bytes, SHA-256 en BD, link `/forgot?token=...`, expiración de 30 minutos, single-use y anti-enumeración de emails.

### T-90 — Reset exitoso con temporal correcta — 🔒 OBSOLETE
**Reemplazado por:** T-98.

**Motivo:** flujo legacy de Fase 8.3.4 basado en `lastPwd` / contraseña temporal.

### T-91 — Rechazo con temporal incorrecta — 🔒 OBSOLETE
**Reemplazado por:** T-99, T-100 y T-101.

**Motivo:** `/recoverypassnew` ya no acepta contraseña temporal; valida token.

### T-92 — Rechazo si falta lastPwd — 🔒 OBSOLETE
**Reemplazado por:** T-99.

**Motivo:** payload nuevo es `{ token, npassword }`.

### T-93 — Rechazo si NO hay solicitud de reset activa — 🔒 OBSOLETE
**Reemplazado por:** T-99 y T-101.

**Motivo:** la solicitud activa vive en `ecom.password_reset_tokens`, no en `customer.passta_id=5`.

### T-94 — Rechazo si npassword es muy corta — 🔒 OBSOLETE
**Reemplazado por:** T-98/T-99 suite actual; la validación de largo sigue cubierta en backend.

**Motivo:** se reserva el ID porque los T-NN no se renumeran.

### T-95 — Solicitar reset crea un token en BD — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGTBackEnd/tests/api/auth/recovery.spec.js`

**Setup:** Usuario activo con email registrado.
**Pasos:** `POST /recoverypass { email }`.

**Esperado:** Status 200. BD: una fila en `ecom.password_reset_tokens` con `prt_used_at IS NULL`; email contiene link con token de 64 chars.

### T-96 — Solicitar reset para email inexistente no enumera — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGTBackEnd/tests/api/auth/recovery.spec.js`

**Setup:** Email no registrado.
**Pasos:** `POST /recoverypass { email }`.

**Esperado:** Status 200 con mensaje genérico. No crea token ni envía email.

### T-97 — Rate-limit de recovery — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGTBackEnd/tests/api/auth/recovery.spec.js`

**Setup:** Usuario activo.
**Pasos:** Ejecutar 4 solicitudes `POST /recoverypass` en menos de 1 hora.

**Esperado:** Solo 3 tokens activos y 3 emails enviados. La cuarta responde 200 silencioso.

### T-98 — Reset exitoso con token válido — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGTBackEnd/tests/api/auth/recovery.spec.js`

**Setup:** Token activo creado por `/recoverypass`.
**Pasos:** `POST /recoverypassnew { token, npassword }`.

**Esperado:** Status 200. Token marcado usado, password actualizado, `passta_id=1`, `cus_password_fail_count=0`.

### T-99 — Token inválido — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGTBackEnd/tests/api/auth/recovery.spec.js`

**Setup:** Token de 64 chars que no existe en BD.
**Pasos:** `POST /recoverypassnew { token, npassword }`.

**Esperado:** Status 401 con `{ invalidToken: true }`.

### T-100 — Token usado — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGTBackEnd/tests/api/auth/recovery.spec.js`

**Setup:** Token con `prt_used_at IS NOT NULL`.
**Pasos:** `POST /recoverypassnew { token, npassword }`.

**Esperado:** Status 401 con `{ tokenAlreadyUsed: true }`.

### T-101 — Token expirado — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGTBackEnd/tests/api/auth/recovery.spec.js`

**Setup:** Token con `prt_expires_at < NOW()`.
**Pasos:** `POST /recoverypassnew { token, npassword }`.

**Esperado:** Status 401 con `{ tokenExpired: true }`.

### T-102 — Reset invalida otros tokens activos — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGTBackEnd/tests/api/auth/recovery.spec.js`

**Setup:** Usuario con dos tokens activos.
**Pasos:** Usar uno de los tokens en `/recoverypassnew`.

**Esperado:** Ambos tokens quedan con `prt_used_at IS NOT NULL`; no quedan tokens activos del usuario.

### T-103 — Token de otro usuario no afecta al actual — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGTBackEnd/tests/api/auth/recovery.spec.js`

**Setup:** Usuario A y usuario B; token pertenece a B.
**Pasos:** Usar token de B en `/recoverypassnew`.

**Esperado:** Cambia password de B. Password de A queda intacto.

---

## Ranking de Vendedores (Fase 9 + 9.1)

### T-70 — `/top-sellers` devuelve score compuesto — ⚪ PENDING
**Setup:** Vendedor A con 10 followers, 5 reviews (avg 4.5), 100 views, 3 pubs.
Vendedor B con 0 reviews pero 50 followers, 200 views, 5 pubs.

**Pasos:** `GET /top-sellers?limit=10`.

**Esperado:**
- Response es array directo (NO `{ sellers: [...] }`).
- Field naming `snake_case`: `avgrating`, `numreviews`, `totalviews`, `totalpubs`.
- Vendedor B aparece en el ranking (tiene publicaciones pero 0 reviews).
- `score` calculado correctamente.

### T-71 — `/sellers/ranking` filtra solo con reviews — ⚪ PENDING
**Setup:** Igual a T-70.

**Pasos:** `GET /sellers/ranking`.

**Esperado:**
- Response con wrapper `{ sellers: [...] }`.
- Field naming `camelCase`: `cusId`, `averageRating`, `totalReviews`.
- **Vendedor B NO aparece** (no tiene reviews completadas).
- Vendedor A sí aparece, ordenado por `AVG(rating) DESC`.
- Límite fijo: máximo 50 filas aunque haya más vendedores.

### T-72 — Ambos endpoints coexisten sin colisión — ⚪ PENDING
**Setup:** Datos seed con 20 vendedores variados.

**Pasos:** Llamar ambos endpoints en paralelo.

**Esperado:** Cada uno responde su shape correcto, sin errores cruzados, sin que un cambio de schema en uno afecte al otro. Sirve como guard contra regresiones futuras si alguien intenta consolidarlos sin actualizar todos los consumidores.

---

## i18n / next-intl (Fase 14.1)

> No hay runner frontend instalado todavía; la automatización de estos smoke
> queda diferida a Fase 21 según el plan. En Hito 14.1 se ejecutaron contra
> `next start` local después de `npx next build`.

### T-104 — Middleware redirige raíz a locale default — 🧪 SMOKE MANUAL
**Ejecución:** `curl -I -H 'Accept-Language: es' http://localhost:3000/`

**Esperado:** Redirect temporal de Next (`307`) a `/es`, con `Set-Cookie: NEXT_LOCALE=es`.

### T-105 — Middleware respeta `Accept-Language: en` — 🧪 SMOKE MANUAL
**Ejecución:** `curl -I -H 'Accept-Language: en' http://localhost:3000/`

**Esperado:** Redirect temporal de Next (`307`) a `/en`, con `Set-Cookie: NEXT_LOCALE=en`.

### T-106 — Middleware preserva auth redirect con locale — 🧪 SMOKE MANUAL
**Ejecución:** `curl -I http://localhost:3000/es/messages` sin cookie `token`.

**Esperado:** Redirect temporal de Next (`307`) a `/es/login?from=%2Fmessages`.

### T-107 — `/es` y `/en` renderizan texto traducido visible — 🧪 SMOKE MANUAL
**Ejecución:** Browser local sobre `/es`; click en selector `EN`.

**Esperado:** `/es` muestra `Inicio`; `/en` muestra `Home` en la píldora piloto del hero. Capturas: `/tmp/kiosqui-fase14-es.png`, `/tmp/kiosqui-fase14-en.png`.

### T-108 — Selector de idioma persiste vía `NEXT_LOCALE` — 🧪 SMOKE MANUAL
**Ejecución:** Browser local: click `EN` navega `/es` → `/en`. Verificación HTTP:
`curl -I http://localhost:3000/en` emite `Set-Cookie: NEXT_LOCALE=en` y
`curl -I --cookie 'NEXT_LOCALE=en' -H 'Accept-Language: es' http://localhost:3000/`
redirige a `/en`.

**Esperado:** La cookie gana sobre `Accept-Language` en visitas posteriores.

## i18n / next-intl (Fase 14.2)

> No hay runner frontend instalado todavía; la automatización de estos smoke
> queda diferida a Fase 21. En Hito 14.2 se ejecutaron contra `next dev`
> local después de `npm run build`.

### T-109 — Login renderiza claves localizadas en `/en/login` — 🧪 SMOKE MANUAL
**Ejecución:** Browser local sobre `/en/login`.

**Esperado:** El label visible del email dice `Email` y no `Correo`.
Captura: `/tmp/kiosqui-fase14-2-en-login.png`.

### T-110 — Register renderiza claves localizadas en `/en/register` — 🧪 SMOKE MANUAL
**Ejecución:** Browser local sobre `/en/register`.

**Esperado:** El formulario muestra claves auth en inglés: `Is it a company?`,
`First name`, `Username`, `I have read and accept the...`; no aparece
`MISSING_MESSAGE`. Captura: `/tmp/kiosqui-fase14-2-en-register.png`.

### T-111 — Forgot renderiza claves localizadas en `/en/forgot` — 🧪 SMOKE MANUAL
**Ejecución:** Browser local sobre `/en/forgot`.

**Esperado:** El título y el formulario muestran `Recover password`, `Email`,
`Send link`; no aparece `MISSING_MESSAGE`. Captura:
`/tmp/kiosqui-fase14-2-en-forgot.png`.

## i18n / next-intl (Fase 14.3)

> No hay runner frontend instalado todavía; la automatización de estos smoke
> queda diferida a Fase 21. En Hito 14.3 se ejecutan contra `next dev`
> local después de `npx next build`.

### T-112 — Soporte renderiza idiomas distintos — 🧪 SMOKE MANUAL
**Ejecución:** Browser local sobre `/es/soporte/tickets` y
`/en/soporte/tickets`.

**Esperado:** La página en español muestra labels/copy de soporte en español
y la página en inglés muestra labels/copy equivalentes en inglés; no aparece
`MISSING_MESSAGE`. Capturas:
`/tmp/kiosqui-fase14-3-es-support.png`,
`/tmp/kiosqui-fase14-3-en-support.png`.

### T-113 — Fechas y números respetan locale activo — 🧪 SMOKE MANUAL
**Ejecución:** Browser local en una vista con fechas migradas (por ejemplo
mensajes, soporte o comentarios) comparando `/es/...` y `/en/...`.

**Esperado:** La misma fecha se formatea según locale activo (ej.
`13 jun 2026` vs `Jun 13, 2026`) y los contadores usan `useFormatter`.

### T-114 — Sweep de locale hardcoded queda limpio — 🧪 SMOKE MANUAL
**Ejecución:**
`grep -rn "toLocaleDateString\\|toLocaleString\\|toLocaleTimeString" src/`
y `grep -rn "'es-GT'\\|'es-ES'\\|'en-US'" src/`.

**Esperado:** Ambos comandos devuelven 0 ocurrencias, salvo futuras
excepciones documentadas explícitamente en el PR.

## i18n / next-intl (Fase 14.4)

### T-115 — Recovery con locale inglés manda email EN — 🤖 AUTOMATED
**Runner:** Backend Vitest + Supertest.

**Spec:** `ecommerceGTBackEnd/tests/api/emails/recovery-locale.spec.js`.

**Ejecución:** `npm test` en backend.

**Esperado:** `POST /recoverypass { email, locale: "en" }` llama
`transp.sendMail` con subject que contiene `Reset` y link `/en/forgot?token=`.

### T-116 — Recovery sin locale cae a email ES — 🤖 AUTOMATED
**Runner:** Backend Vitest + Supertest.

**Spec:** `ecommerceGTBackEnd/tests/api/emails/recovery-locale.spec.js`.

**Ejecución:** `npm test` en backend.

**Esperado:** `POST /recoverypass { email }` llama `transp.sendMail` con
subject que contiene `Restablecer` y link `/es/forgot?token=`.

### T-117 — Error backend devuelve `{ code, message, params }` — 🤖 AUTOMATED
**Runner:** Backend Vitest + Supertest.

**Spec:** `ecommerceGTBackEnd/tests/api/emails/recovery-locale.spec.js`.

**Ejecución:** `npm test` en backend.

**Esperado:** Login con password incorrecta responde `400` con
`code: "auth.password_incorrect"`, `message` fallback en español y
`params: {}`.

---

## Infraestructura frontend — Hito 1

### T-118 — Vitest descubre los specs del frontend — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGT-Next/tests/infraestructura/infraestructura.spec.tsx`

**Esperado:** `npm test` ejecuta al menos un spec en `jsdom` y devuelve exit 0.
Previene una configuración que instala el runner pero no descubre ningún archivo.

### T-119 — Un componente real renderiza con los providers compartidos — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGT-Next/tests/infraestructura/infraestructura.spec.tsx`

**Esperado:** `SupportTicketsMain` resuelve una consulta con React Query, muestra
las claves del mock de `next-intl`, recibe un usuario de soporte configurable y
deja el resultado en un caché aislado, sin hacer una llamada HTTP real.

---

## Utilidades puras frontend — Hito 2

### T-120 — Variantes de imagen conservan la cadena de fallback — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGT-Next/tests/utils/imageVariants.spec.ts`

**Esperado:** una imagen del backend produce su variante WebP y conserva el
original y el placeholder como siguientes alternativas; URLs externas o ya
procesadas no se reescriben.

### T-121 — Utilidades de publicación toleran shapes reales — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGT-Next/tests/utils/publicationUtils.spec.ts`

**Esperado:** ceros y strings numéricos no caen al fallback, las imágenes se
normalizan sin duplicados y terreno/lote/solar se clasifican correctamente.

### T-122 — URL de publicación prefiere slug con fallback a id — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGT-Next/tests/utils/publicationUrl.spec.ts`

**Esperado:** slug y `pub_slug` son canónicos; ids numéricos o string mantienen
compatibilidad legacy y valores ausentes no generan links inválidos.

### T-123 — Rutas del backend se normalizan sin doble host — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGT-Next/tests/utils/backendUrl.spec.ts`

**Esperado:** rutas relativas reciben `NEXT_PUBLIC_API_URL`, URLs absolutas se
conservan y entradas vacías devuelven cadena vacía.

### T-124 — Avatar genera iniciales estables y acentuadas — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGT-Next/tests/utils/avatarUtils.spec.ts`

**Esperado:** nombres completos, vacíos, acentuados y sin foto producen un SVG
determinista; una foto existente siempre tiene prioridad.

---

## Componentes frontend de alto riesgo — Hito 3

### T-125 — Favoritos actualizan y revierten todas las cachés — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGT-Next/tests/hooks/useFavorites.spec.tsx`

**Esperado:** el optimista alcanza todas las claves `['publications', ...]`
aunque tengan filtros y aunque Postgres mande el id como string. Si la API
falla, listado y favoritos regresan exactamente al snapshot anterior.

### T-126 — PublicationCard refleja el listing real — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGT-Next/tests/components/PublicationCard.spec.tsx`

**Esperado:** precio y símbolo respetan la moneda del listing; parqueos solo
aparecen con un valor positivo y nunca en terrenos; el corazón refleja
`isFavorite` y dos fallos de imagen terminan en el fallback visible.

### T-127 — HeaderSearch no descarga el catálogo entero — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGT-Next/tests/components/HeaderSearch.spec.tsx`

**Esperado:** una búsqueda de un carácter no llama a la API. A partir de dos,
la consulta de propiedades incluye `limit=5` y la de usuarios conserva su
endpoint específico.

### T-128 — Pauta solo ofrece publicaciones promocionables — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGT-Next/tests/components/PautaMain.spec.tsx`

**Esperado:** el selector incluye publicaciones con `pubsta_id=2`, pero omite
vendidas (`3`) y pausadas (`5`) para impedir pagar una campaña inválida.

### T-129 — Auth valida y no expone contraseñas — 🤖 AUTOMATED
**Automatizado en:** `ecommerceGT-Next/tests/form/authForms.spec.tsx`

**Esperado:** login, registro y recuperación detienen formatos inválidos antes
de la red; los errores de negocio se muestran al usuario y la contraseña sigue
siendo un input protegido, sin aparecer como texto ni dentro de logs.

---

## Roadmap de automatización

Orden sugerido para empezar:

1. **API tests (más fácil):** T-01 a T-15 (auth). Solo requiere supertest + Vitest. Sin UI.
2. **Smoke E2E:** T-01, T-04, T-22, T-32, T-43, T-50. Cubre los flujos más críticos.
3. **Resto progresivamente** según se modifiquen las features asociadas.

### Esqueleto recomendado de directorio (cuando arranquemos)

```
tests/
├── api/                      # supertest + vitest — corren contra backend local
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── lockout.spec.ts
│   │   └── recovery.spec.ts
│   ├── admin/
│   │   └── config.spec.ts
│   └── support/
│       └── users.spec.ts
├── e2e/                      # playwright — corren contra frontend local
│   ├── auth.spec.ts
│   ├── publications.spec.ts
│   └── admin.spec.ts
├── fixtures/
│   ├── users.sql             # seeds de usuarios de prueba
│   └── publications.sql
└── helpers/
    ├── db.ts                 # wrappers de pg.query, RESET-A, RESET-B
    └── auth.ts               # login programático para setup
```

---

**Última actualización:** 2026-08-14 (Hito 3 de automatización frontend — T-125..T-129)
