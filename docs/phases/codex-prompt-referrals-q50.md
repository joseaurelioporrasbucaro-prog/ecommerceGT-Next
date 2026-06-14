# Prompt para Codex — Backend del programa de referidos (Q50)

> Pegá esto en Codex apuntando al repo **ecommerceGTBackEnd**. El frontend ya tiene la
> cáscara lista (`/invite` → `src/components/pauta/ReferralInviteMain.tsx`); este prompt
> implementa el backend que la vuelve funcional. Toda edición nueva va marcada con
> `// Codigo Aurelio` y la lógica principal vive en `config/connPostgresDB.js`.

---

## Objetivo

Programa de referidos "Invitá a un amigo y ganá Q50 en pauta". Reglas de negocio
(las mismas que ya muestra el frontend, **no las cambies**):

- Cada usuario tiene un **código de referido** único y estable.
- Cuando un usuario nuevo se **registra con ese código** y luego hace su **primera
  compra de pauta** (primera campaña pagada/activada), **ambos** —el que invitó y el
  invitado— reciben **Q50 de crédito** en su saldo de pauta.
- **Idempotente**: el Q50 se acredita **una sola vez por referido** (en su primera
  compra), aunque el invitado haga muchas campañas o se reintente el flujo.
- **Sin tope** de referidos. El crédito **no caduca, no es transferible y no es
  canjeable por dinero** (coherente con la política de reembolsos existente: solo
  crédito interno reutilizable).
- El crédito cae en el **mismo saldo** que ya devuelve `GET /ad-credit` (el que usa
  `/pauta`). No crear una segunda billetera.

---

## 1. Modelo de datos (migraciones SQL)

Localizá primero **dónde vive hoy el saldo de pauta** (el que sirve `GET /ad-credit`)
— probablemente una columna de crédito en el usuario o una tabla de movimientos. Reusá
ese mecanismo para acreditar; **no** dupliques el concepto de saldo.

Crear (esquema `ecom`):

1. **Código de referido por usuario.** Columna nueva en la tabla de usuarios, p. ej.
   `referral_code VARCHAR(16) UNIQUE` (generar al crear el usuario y backfill para los
   existentes). Alternativa: tabla `referral_codes(cus_id, code UNIQUE, created_at)`.
   El código debe ser corto, URL-safe y no adivinable trivialmente.

2. **Relación de referido (quién invitó a quién).** Tabla
   `referrals(id, referrer_cus_id, referred_cus_id UNIQUE, code_used, status, created_at,
   rewarded_at)` donde:
   - `referred_cus_id` es **UNIQUE** → un usuario solo puede ser referido una vez.
   - `status`: `'pending'` (registrado, aún sin comprar pauta) → `'rewarded'` (ya se
     acreditó el Q50 a ambos).
   - `rewarded_at` nulo hasta el crédito.

3. **(Recomendado) Ledger de crédito** `ad_credit_movements(id, cus_id, amount,
   reason, ref_id, created_at)` para auditar de dónde salió cada crédito
   (`reason IN ('referral_referrer','referral_referred','campaign_refund', ...)`). Si ya
   existe un ledger, reusalo. La idempotencia se ancla aquí + en `referrals.status`.

---

## 2. Endpoints (contrato que el frontend ya espera)

El frontend hoy muestra: código/enlace, progreso (activados / ganado / pendientes) y el
saldo (vía `/ad-credit`). Implementá:

1. **`GET /referrals/me`** (autenticado) → resumen del usuario actual:
   ```json
   {
     "code": "ANA2026",
     "link": "https://kiosqui.com/invite/ANA2026",
     "activatedCount": 1,     // referidos que ya compraron pauta (status rewarded)
     "pendingCount": 2,       // registrados que aún no compran (status pending)
     "earnedCredit": 50       // Q ganados por referidos (suma de movimientos referral_referrer)
   }
   ```
   El frontend reemplazará el estado-cero y el placeholder de código por esto.

2. **Registro con código** — extender el endpoint de registro existente para aceptar un
   `referralCode` opcional (body o query). Al registrar:
   - Validar que el código exista y **no sea el del propio usuario**.
   - Crear fila en `referrals` con `status='pending'` (idempotente: si ya existe
     `referred_cus_id`, ignorar — un usuario no puede ser referido dos veces).
   - **No** acreditar nada todavía.

3. **(Opcional) `GET /referrals/validate/:code`** público → `{ valid, referrerName }`
   para que la landing de registro muestre "Te invitó {nombre}".

---

## 3. Hook de acreditación (el corazón, idempotente)

En el flujo donde se **crea/activa la primera campaña pagada** del usuario (buscá el
handler de creación de campaña / pauta), agregá al final, dentro de la **misma
transacción** del cobro:

```
// Codigo Aurelio — referidos Q50: acreditar al confirmarse la PRIMERA compra de pauta.
1. ¿Es la primera campaña pagada de este usuario?  (contar campañas previas del cus_id)
2. ¿Existe una fila referrals donde referred_cus_id = este usuario AND status = 'pending'?
3. Si ambas SÍ:
     - acreditar Q50 al referred (este usuario) y Q50 al referrer
       (insertar en ad_credit_movements + sumar al saldo que sirve /ad-credit)
     - UPDATE referrals SET status='rewarded', rewarded_at=now() WHERE id=...
   Hacerlo con guardas para que sea idempotente:
     - el UPDATE condicionado a status='pending' evita doble crédito en carreras
     - o UNIQUE(reason, ref_id) en el ledger
```

Puntos críticos:
- **Idempotencia**: que dos requests simultáneos no acrediten dos veces. Usá el cambio
  de `status` condicionado (`WHERE status='pending'`) y/o un índice único en el ledger
  por `(reason, ref_id)`.
- **"Primera compra"**: definí con precisión qué cuenta (campaña activada / pagada, no
  un borrador). Documentalo en el código.
- Todo dentro de la transacción del cobro para no acreditar si el cobro falla.

---

## 4. Colisión de rutas a resolver

El frontend tiene **dos** cosas bajo `/invite`:
- `/invite/[token]` → **invitación de EMPRESA** (ya existe, no tocar).
- `/invite` (índice) → **pantalla de referidos** (nueva cáscara).

El enlace de referido que muestra el diseño es `kiosqui.com/invite/CODE`, que **choca**
con la ruta de token de empresa. Definí con el equipo una de estas (y avisá al frontend):
- (a) Namespace propio para referidos: `kiosqui.com/r/CODE` o `?ref=CODE` en registro.
- (b) Que `/invite/[token]` distinga: si el token matchea un `referral_code`, trata como
  referido; si matchea un token de empresa, flujo actual.

Recomendación: **(a) `?ref=CODE` hacia la pantalla de registro** — es el patrón menos
ambiguo y no toca el flujo de empresa. El frontend ajustará `link` según lo que definas.

---

## 5. Entregables

- Migraciones SQL (idempotentes) para correr en local y prod.
- Endpoints `GET /referrals/me` (+ registro con `referralCode`, + opcional validate).
- Hook de acreditación idempotente en la primera compra de pauta.
- Backfill de `referral_code` para usuarios existentes.
- Nota al frontend con: formato final del `link`/ruta de canje elegida (§4) y la forma
  exacta del JSON de `GET /referrals/me` si cambia respecto a §2.

> Cuando el backend esté listo, el frontend (`ReferralInviteMain.tsx`) cambia: (1) leer
> `GET /referrals/me` para código/enlace/progreso reales, (2) habilitar Copiar/compartir
> (hoy muestran "próximamente"), (3) quitar el badge "Próximamente".
