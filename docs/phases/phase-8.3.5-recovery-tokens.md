# Fase 8.3.5 — Password recovery con tokens cripto-seguros

> **Para:** Codex / cualquier ejecutor.
> **De:** Claude (arquitecto).
> **Fecha:** 2026-06-04.
> **Repos involucrados:** `ecommerceGTBackEnd` (master) y `ecommerceGT-Next` (main).
> **Tipo:** security hardening (industry standard recovery flow).

## Objetivo

Migrar el flujo de password recovery del esquema actual ("contraseña temporal por email + bcrypt.compare", Fase 8.3.4) al **estándar industria: tokens cripto-seguros con link directo**.

### Por qué

El esquema actual (Fase 8.3.4) cierra CWE-640 básico pero todavía depende de que la contraseña temporal viaje en plaintext por email. Riesgos residuales:
- Si el correo del usuario está comprometido → atacante toma la cuenta
- Si el servidor de email registra los mensajes (forwarding, archivos) → temporal queda expuesta
- Si el usuario reenvía el email sin pensar → comparte la temporal
- No hay expiración explícita: la temporal vive hasta que el usuario haga reset (puede ser horas/días)

Con tokens:
- El token NO sirve para login (solo para resetear, una vez)
- Expira corto (30 min default)
- Single-use (al usarlo, se invalida)
- El usuario hace click un link → flujo continuo, sin copiar/pegar
- Si el atacante intercepta el correo, el window es chiquito y el efecto limitado

## Pre-requisitos

- Fase 8.3.4 cerrada (ya está)
- Fase 20 con tests automatizados (ya está, 13/13 verde)
- Postgres local + CI funcionando

## Inventario (estado actual)

### Backend
- `POST /recoverypass` — recibe `{email}`, genera contraseña temporal de 10 chars, hashea con bcrypt, hace `UPDATE customer SET cus_password = $1, passta_id = 5` y envía email con la temporal en plaintext.
- `POST /recoverypassnew` — recibe `{email, lastPwd, npassword}`, valida con bcrypt.compare, exige `passta_id=5`, cambia password.
- Sin tabla de tokens.
- Email se envía con `transp.sendMail` (Nodemailer ya configurado).

### Frontend
- `src/form/ForgotForm.tsx` con 2 vistas:
  - Vista 1: input email → POST /recoverypass
  - Vista 2: 3 campos (temporal + nueva + confirmar) → POST /recoverypassnew

### Tests
- `tests/api/auth/recovery.spec.js` con T-90..T-94 (5 tests pasando)

## Cambios planificados

### Database — `database.sql`

Agregar al final del archivo (respetando §12 — modificar el CREATE original NO aplica acá porque la tabla es nueva):

```sql
-- ============================================================================
-- Fase 8.3.5 — Tokens de password recovery (industry standard)
--
-- Reemplaza el esquema previo de "contraseña temporal en email + passta_id=5".
-- Cada solicitud de reset genera un token random de 32 bytes (hex = 64 chars).
-- El token va en un link al correo: https://app.com/forgot?token=XYZ
-- Validez: 30 minutos. Single-use: se marca usado al cambiar la contraseña.
-- ============================================================================
CREATE TABLE IF NOT EXISTS ecom.password_reset_tokens (
    prt_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cus_id          BIGINT NOT NULL REFERENCES ecom.customer(cus_id) ON DELETE CASCADE,
    prt_token_hash  VARCHAR(128) NOT NULL,  -- SHA-256 del token; NO guardamos el plaintext
    prt_expires_at  TIMESTAMP NOT NULL,
    prt_used_at     TIMESTAMP NULL,         -- NULL = no usado; al usarlo, se setea NOW()
    prt_requested_ip VARCHAR(45) NULL,      -- IPv4/IPv6 del que pidió reset (audit)
    prt_used_ip     VARCHAR(45) NULL,       -- IP del que usó el token (audit)
    prt_created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prt_token_hash ON ecom.password_reset_tokens(prt_token_hash);
CREATE INDEX IF NOT EXISTS idx_prt_cus_id_expires ON ecom.password_reset_tokens(cus_id, prt_expires_at);
```

**Por qué hash y no plaintext del token:** mismo principio que con passwords — si la BD se filtra, el atacante no puede usar los tokens directamente.

### Backend — `config/connPostgresDB.js`

#### `recoveryPwd` (modificar)

Reemplazar el flujo de contraseña temporal:

```javascript
const crypto = require('node:crypto');

const recoveryPwd = async (request, response) => {
  const { email } = request.body;
  try {
    const result = await pool.query(
      'SELECT cus_id, cus_email_address, passta_id, cus_banned_until FROM ecom.customer WHERE cus_email_address = $1',
      [email]
    );

    // Si NO existe el email, devolvemos 200 igual (anti-enumeración).
    // El atacante no debería poder descubrir qué emails están registrados.
    if (result.rows.length === 0) {
      return response.status(200).json({
        message: "Si el correo está registrado, recibirás un link para restablecer."
      });
    }

    const user = result.rows[0];

    // Mantener la guarda de Fase 8.3.3: si está bloqueado por intentos, rechazar.
    if (user.passta_id === 2 && user.cus_banned_until) {
      const bannedUntil = new Date(user.cus_banned_until);
      if (bannedUntil > new Date()) {
        const minsLeft = Math.max(1, Math.ceil((bannedUntil.getTime() - Date.now()) / 60000));
        return response.status(429).json({
          message: `Tu cuenta está temporalmente bloqueada. Podrás restablecer en ${minsLeft} minuto(s).`,
          minutesRemaining: minsLeft,
        });
      }
    }

    // Rate-limit: máximo 3 solicitudes activas por usuario en 1 hora (anti-spam de emails)
    const recentCount = await pool.query(
      `SELECT COUNT(*)::int AS n
         FROM ecom.password_reset_tokens
        WHERE cus_id = $1
          AND prt_created_at > NOW() - INTERVAL '1 hour'`,
      [user.cus_id]
    );
    if (recentCount.rows[0].n >= 3) {
      // 200 silencioso para anti-enumeración pero NO mandamos otro email
      return response.status(200).json({
        message: "Si el correo está registrado, recibirás un link para restablecer."
      });
    }

    // Generar token random 32 bytes (256 bits) → hex 64 chars
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const ip = request.ip || request.headers['x-forwarded-for'] || null;

    await pool.query(
      `INSERT INTO ecom.password_reset_tokens (cus_id, prt_token_hash, prt_expires_at, prt_requested_ip)
       VALUES ($1, $2, NOW() + INTERVAL '30 minutes', $3)`,
      [user.cus_id, tokenHash, ip]
    );

    // Link al frontend. CORS_ORIGINS contiene el dominio público del frontend.
    const frontendUrl = process.env.FRONTEND_URL || (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',')[0];
    const resetLink = `${frontendUrl}/forgot?token=${token}`;

    await transp.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Restablecer contraseña — KIOSQUI",
      html: `
        <h2>Restablecer contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Hacé click en el siguiente link (válido por 30 minutos):</p>
        <p><a href="${resetLink}" style="background:#2785ff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;">Restablecer contraseña</a></p>
        <p style="font-size:12px;color:#666;">Si no fuiste vos, ignorá este correo. Tu contraseña sigue siendo la misma.</p>
        <p style="font-size:12px;color:#999;">Link directo: ${resetLink}</p>
      `,
    });

    response.status(200).json({
      message: "Si el correo está registrado, recibirás un link para restablecer."
    });
  } catch (error) {
    console.error("recoveryPwd error:", error);
    response.status(500).json({ message: "Error al procesar la solicitud." });
  }
};
```

#### `recoveryPwdGenNew` (rewrite completo)

```javascript
const recoveryPwdGenNew = async (request, response) => {
  const { token, npassword } = request.body;

  try {
    if (!token || typeof token !== 'string' || token.length !== 64) {
      return response.status(400).json({
        message: "Token inválido o ausente.",
        invalidToken: true,
      });
    }
    if (!npassword || typeof npassword !== 'string' || npassword.length < 8) {
      return response.status(400).json({
        message: "La nueva contraseña debe tener al menos 8 caracteres.",
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const tokenRow = await pool.query(
      `SELECT prt_id, cus_id, prt_expires_at, prt_used_at
         FROM ecom.password_reset_tokens
        WHERE prt_token_hash = $1`,
      [tokenHash]
    );

    if (tokenRow.rows.length === 0) {
      return response.status(401).json({
        message: "Token inválido o expirado.",
        invalidToken: true,
      });
    }

    const t = tokenRow.rows[0];

    if (t.prt_used_at !== null) {
      return response.status(401).json({
        message: "Este link ya fue usado. Solicitá uno nuevo si lo necesitás.",
        tokenAlreadyUsed: true,
      });
    }

    if (new Date(t.prt_expires_at) < new Date()) {
      return response.status(401).json({
        message: "Este link expiró. Solicitá uno nuevo.",
        tokenExpired: true,
      });
    }

    const hashedNewPwd = await bcrypt.hash(npassword, BCRYPT_ROUNDS);
    const ip = request.ip || request.headers['x-forwarded-for'] || null;

    // Transacción: marcar token usado + cambiar password + limpiar passta_id de bloqueo
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE ecom.password_reset_tokens
            SET prt_used_at = NOW(), prt_used_ip = $1
          WHERE prt_id = $2`,
        [ip, t.prt_id]
      );
      await client.query(
        `UPDATE ecom.customer
            SET cus_password = $1,
                passta_id = 1,
                cus_password_fail_count = 0,
                cus_banned_until = CASE WHEN cus_account_status = 'suspended' THEN cus_banned_until ELSE NULL END
          WHERE cus_id = $2`,
        [hashedNewPwd, t.cus_id]
      );
      // Invalidar TODOS los otros tokens activos del usuario (no se acumulan)
      await client.query(
        `UPDATE ecom.password_reset_tokens
            SET prt_used_at = NOW()
          WHERE cus_id = $1
            AND prt_used_at IS NULL
            AND prt_id != $2`,
        [t.cus_id, t.prt_id]
      );
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    response.status(200).json({ message: "Contraseña actualizada exitosamente." });
  } catch (error) {
    console.error("recoveryPwdGenNew error:", error);
    response.status(500).json({ message: "Error al actualizar la contraseña." });
  }
};
```

#### Limpiar lógica obsoleta

En `login`, eliminar el bloque que detecta `passta_id === 5` y redirige a /forgot. Ese estado ya no existe — fue parte del esquema temporal anterior. Verificar con grep:

```bash
grep -n "passta_id === 5\|passta_id == 5\|passta_id = 5" config/connPostgresDB.js
```

Si aparece, evaluar caso por caso si se elimina o se mantiene por compatibilidad.

### Frontend — `src/form/ForgotForm.tsx` (rewrite)

```typescript
"use client";
import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ApiFetch } from "@/utils/Api";

const ForgotForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const token = searchParams?.get("token");

  // VISTA 1: pedir email (cuando no hay token en URL)
  const emailSchema = Yup.object().shape({
    email: Yup.string()
      .email(t("auth.validation.invalidEmailDomain"))
      .required(t("auth.validation.requiredAll")),
  });

  const formikEmail = useFormik({
    initialValues: { email: "" },
    validationSchema: emailSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      try {
        const res = await ApiFetch.post<{ message?: string }>("/recoverypass", { email: values.email });
        toast.success(res.message || "Si el correo está registrado, recibirás un link.");
        resetForm();
      } catch (error: any) {
        // Backend devuelve 200 aunque no exista el email (anti-enumeración).
        // Solo mostramos error si hay rate-limit u otro fallo explícito.
        toast.info(error.message || "Si el correo está registrado, recibirás un link.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // VISTA 2: nueva contraseña (cuando hay token en URL, vino del click del email)
  const passwordSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, t("auth.validation.passwordLength"))
      .matches(/[A-Z]/, t("auth.validation.passwordUppercase"))
      .matches(/[0-9]/, t("auth.validation.passwordNumber"))
      .required(t("auth.validation.requiredAll")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null as any], t("auth.validation.passwordMismatch"))
      .required(t("auth.validation.requiredAll")),
  });

  const formikPassword = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: passwordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const res = await ApiFetch.post<{ message?: string }>("/recoverypassnew", {
          token,
          npassword: values.password,
        });
        toast.success(res.message || "Contraseña actualizada exitosamente.");
        router.push("/login");
      } catch (error: any) {
        toast.error(error.message || "Error al actualizar contraseña.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const renderError = (formikInstance: any, field: string) => {
    if (formikInstance.touched[field] && formikInstance.errors[field]) {
      return <div style={{ color: "#d32f2f", fontSize: "12px", marginTop: "5px" }}>{formikInstance.errors[field]}</div>;
    }
    return null;
  };

  if (!token) {
    // VISTA 1: pedir email
    return (
      <form onSubmit={formikEmail.handleSubmit} className="login-form">
        <p className="mb-4 text-gray text-center">
          Ingresá tu correo. Si está registrado, te enviaremos un link para restablecer tu contraseña.
        </p>
        <div className="single-input-unit">
          <label htmlFor="email">{t("auth.register.email")}</label>
          <input
            type="email"
            name="email"
            placeholder="ejemplo@correo.com"
            onChange={formikEmail.handleChange}
            onBlur={formikEmail.handleBlur}
            value={formikEmail.values.email}
          />
          {renderError(formikEmail, "email")}
        </div>
        <div className="login-btn mt-30">
          <button className="fill-btn" type="submit" disabled={formikEmail.isSubmitting}>
            {formikEmail.isSubmitting ? "Enviando..." : "Enviar link"}
          </button>
        </div>
        <div className="note mt-3 text-center">
          <Link className="text-btn" href="/login">Volver al Login</Link>
        </div>
      </form>
    );
  }

  // VISTA 2: token presente, pedir nueva contraseña
  return (
    <form onSubmit={formikPassword.handleSubmit} className="login-form">
      <p className="mb-4 text-gray text-center">
        Escribí tu nueva contraseña. El link es válido por 30 minutos y se puede usar una sola vez.
      </p>
      <div className="single-input-unit mb-4">
        <label htmlFor="password">Nueva contraseña</label>
        <input
          type="password"
          name="password"
          placeholder="********"
          onChange={formikPassword.handleChange}
          onBlur={formikPassword.handleBlur}
          value={formikPassword.values.password}
          autoComplete="new-password"
        />
        {renderError(formikPassword, "password")}
      </div>
      <div className="single-input-unit">
        <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
        <input
          type="password"
          name="confirmPassword"
          placeholder="********"
          onChange={formikPassword.handleChange}
          onBlur={formikPassword.handleBlur}
          value={formikPassword.values.confirmPassword}
          autoComplete="new-password"
        />
        {renderError(formikPassword, "confirmPassword")}
      </div>
      <div className="login-btn mt-30">
        <button className="fill-btn" type="submit" disabled={formikPassword.isSubmitting}>
          {formikPassword.isSubmitting ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </div>
      <div className="note mt-3 text-center">
        <Link className="text-btn" href="/forgot">¿Link expirado? Solicitar uno nuevo</Link>
      </div>
    </form>
  );
};

export default ForgotForm;
```

### Tests automatizados — `tests/api/auth/recovery.spec.js` (rewrite)

Eliminar T-90..T-94 actuales (basados en `lastPwd`) y reemplazar por:

- **T-95** — Solicitar reset crea un token en BD (status 200, fila nueva en `password_reset_tokens` con `prt_used_at IS NULL`)
- **T-96** — Solicitar reset para email inexistente devuelve 200 igual (anti-enumeración) y NO crea token
- **T-97** — Rate-limit: 4ta solicitud en <1h se ignora (no crea email, devuelve 200)
- **T-98** — Reset exitoso con token válido (status 200, token marcado usado, password cambiada)
- **T-99** — Token inválido (no existe) devuelve 401 `{ invalidToken: true }`
- **T-100** — Token usado devuelve 401 `{ tokenAlreadyUsed: true }`
- **T-101** — Token expirado devuelve 401 `{ tokenExpired: true }`
- **T-102** — Reset con token válido invalida TODOS los otros tokens activos del mismo user
- **T-103** — Reset con token de otro usuario no afecta al actual (cus_id del token decide)

Setup helper: agregar a `tests/helpers/db.js` un `getActiveTokensFor(cusId)` para inspeccionar tokens.

### Documentación a actualizar (per AGENTS.md §13)

- `docs/API_REFERENCE.md` backend — actualizar `/recoverypass` y `/recoverypassnew` con nuevos shapes
- `docs/SCHEMA.md` backend — agregar `password_reset_tokens` al resumen + bloque expandido
- `docs/GLOSSARY.md` backend — agregar entrada "Token de reset"
- `docs/TEST_PLAN.md` frontend — marcar T-90..T-94 como 🔒 OBSOLETE (reemplazadas por T-95..T-103), agregar las nuevas como 🤖 AUTOMATED
- `MIGRATION.md` frontend — sección Fase 8.3.5 con migración + bitácora
- `database.sql` backend — nueva tabla `password_reset_tokens`

## Decisiones de diseño

### D-1: Token hash vs plaintext en BD

- **A:** Guardar el token plaintext (más simple, fácil de buscar)
- **B:** Guardar SHA-256 del token (defense in depth)

**Recomendación: B.** Si la BD se filtra, el atacante no puede usar los tokens directamente. Costo: una operación de hash al validar (microsegundos). Vale la pena.

### D-2: Anti-enumeración de emails

- **A:** Devolver 404 si el email no existe (más informativo)
- **B:** Devolver 200 siempre con mensaje "si está registrado..." (no revela qué emails están en BD)

**Recomendación: B.** Es standard de seguridad. El usuario legítimo se entera por el email (o falta de él); el atacante no puede enumerar.

### D-3: Vida del token

- **A:** 15 minutos
- **B:** 30 minutos
- **C:** 1 hora

**Recomendación: B (30 min).** Tradeoff razonable entre seguridad y UX (gente que abre emails desde móvil, lee después de comer, etc.).

### D-4: Rate-limit de solicitudes

- **A:** Sin límite (email spam posible)
- **B:** 3 solicitudes activas (no expiradas/usadas) por usuario por hora
- **C:** Más estricto

**Recomendación: B.** Permite que el usuario pida un re-envío si no le llegó el primero, sin invitar al spam.

### D-5: Compatibilidad con clientes viejos

El frontend live en producción podría no tener todavía la nueva versión (race condition durante deploy). Opciones:

- **A:** Romper compatibilidad — desde el día del deploy, los emails con contraseña temporal del esquema viejo dejan de funcionar
- **B:** Mantener `/recoverypassnew` viejo escuchando con `lastPwd` opcional durante 30 días (deprecation period)

**Recomendación: A.** El esquema viejo solo lleva ~1 día activo (Fase 8.3.4 fue hoy). No hay carga real de tokens-en-vuelo. Limpieza simple.

### D-6: ¿Eliminar `passta_id = 5`?

El estado `passta_id = 5` ("debe cambiar contraseña temporal") era parte del esquema viejo. Ya no se usa después de esta fase.

- **A:** Limpiar todas las referencias en código y database (`cat_password_status` puede tener row con descripción "Cambio forzoso")
- **B:** Dejar el código por compatibilidad — si una BD vieja tiene cuentas con `passta_id=5`, el login las redirige a /forgot que es el flujo nuevo

**Recomendación: B.** El código tiene un check tipo `if (user.passta_id === 5) { redirigir a /forgot }` que sigue siendo correcto — el usuario llega a /forgot, no ve token, pide reset normalmente, recibe link nuevo. Cero downtime para cuentas en estado raro.

## Criterios de aceptación

### Database
- [ ] Tabla `ecom.password_reset_tokens` creada en `database.sql`
- [ ] 2 índices: `idx_prt_token_hash`, `idx_prt_cus_id_expires`

### Backend
- [ ] `recoveryPwd` rewriteado: genera token, hashea SHA-256, inserta en tabla, envía email con link
- [ ] `recoveryPwdGenNew` rewriteado: valida token (existe + no usado + no expirado), cambia password en transacción
- [ ] Rate-limit de 3 solicitudes/hora por usuario
- [ ] Anti-enumeración: 200 si email no existe
- [ ] Transacción atómica: cambiar password + marcar token usado + invalidar otros tokens
- [ ] Variable `FRONTEND_URL` agregada a `.env.example` con default `http://localhost:3000`

### Frontend
- [ ] `ForgotForm.tsx` rewriteado: detecta `?token=` en URL, muestra Vista 1 o Vista 2 según corresponda
- [ ] Vista 1 más simple: solo input de email
- [ ] Vista 2: 2 campos (nueva + confirmar), no necesita email ni temporal (todo va en el token)
- [ ] Toast info (no error) cuando email no existe (anti-enumeración)
- [ ] Link "¿Link expirado? Solicitar uno nuevo" en Vista 2

### Tests
- [ ] T-95..T-103 implementados en `recovery.spec.js`
- [ ] T-90..T-94 anteriores eliminados (no marcados OBSOLETE en `recovery.spec.js`; sí marcados en TEST_PLAN.md)
- [ ] `npm test` corre 17/17 verde

### Documentación (per AGENTS.md §13)
- [ ] `API_REFERENCE.md`: nuevos shapes de `/recoverypass` y `/recoverypassnew`
- [ ] `SCHEMA.md`: `password_reset_tokens` en resumen + bloque expandido
- [ ] `GLOSSARY.md`: entrada "Token de reset"
- [ ] `TEST_PLAN.md`: T-90..T-94 → OBSOLETE, T-95..T-103 → AUTOMATED
- [ ] `MIGRATION.md`: Fase 8.3.5 con bitácora + migración SQL para BD existente

### Migración para BD existente (NO va en database.sql, va en MIGRATION.md §9)
```sql
-- Fase 8.3.5
CREATE TABLE IF NOT EXISTS ecom.password_reset_tokens (
    ...
);
CREATE INDEX IF NOT EXISTS idx_prt_token_hash ON ecom.password_reset_tokens(prt_token_hash);
CREATE INDEX IF NOT EXISTS idx_prt_cus_id_expires ON ecom.password_reset_tokens(cus_id, prt_expires_at);

-- Limpiar tokens passta_id=5 huérfanos (cuentas que estaban en flujo viejo)
UPDATE ecom.customer SET passta_id = 1 WHERE passta_id = 5;
```

## Riesgos / edge cases

| Riesgo | Mitigación |
|---|---|
| Token leakeado en logs de servidor (URL en query string) | El backend NO loguea el query string. Verificar en `morgan` o middleware similar. Si hay, ofuscar. |
| Token leakeado por Referer header al hacer click | Email cliente moderno usa `noreferrer`. Aún así, no incluir info sensible en el path. |
| Doble click en el botón "Guardar" envía 2 requests con el mismo token → segundo falla con `tokenAlreadyUsed` | Frontend deshabilita botón mientras `isSubmitting`. Backend devuelve mensaje claro. |
| Token expirado a la mitad del formulario | Backend devuelve 401 `{tokenExpired: true}` al guardar. Frontend muestra error + link "solicitar uno nuevo". |
| Variable FRONTEND_URL mal configurada → link al dominio equivocado | Default a `localhost:3000` para dev. Validar en deploy checklist. |
| Cleanup de tokens viejos | No es crítico para esta fase. Considerar cron job futuro que delete tokens con `prt_used_at < NOW() - 7 días`. |

## Out of scope

- ❌ Cleanup automático de tokens viejos (cron). Para otra fase si la tabla crece mucho.
- ❌ Notificación al usuario cuando alguien pide reset (email "alguien intentó cambiar tu contraseña"). Futuro.
- ❌ 2FA / passkeys. Otra fase de hardening.
- ❌ Captcha en el form de "olvidé contraseña". Futuro si hay bot abuse.

## Estimación

- DB: 15 min
- Backend rewrite (recoveryPwd + recoveryPwdGenNew + tests): ~2h
- Frontend rewrite ForgotForm: ~1h
- Tests automatizados T-95..T-103: ~1.5h
- Documentación (per §13): ~1h

**Total: ~5h Codex.** Si pasa de 7h, escalar a Claude.

## Handshake

Codex commits sugeridos (uno por archivo, no mega-commit):

```
feat(fase8.3.5): tabla password_reset_tokens
feat(fase8.3.5): backend recoveryPwd con tokens cripto-seguros
feat(fase8.3.5): backend recoveryPwdGenNew validación de tokens
feat(fase8.3.5): frontend ForgotForm con flujo de link en email
test(fase8.3.5): T-95..T-103 recovery con tokens
docs(fase8.3.5): API_REFERENCE + SCHEMA + GLOSSARY actualizados
docs(fase8.3.5): cierre en MIGRATION.md + TEST_PLAN

ref docs/phases/phase-8.3.5-recovery-tokens.md
Tiempo: Xh
Decisiones aplicadas: D-1=B, D-2=B, D-3=B, D-4=B, D-5=A, D-6=B
Bloqueos: ninguno
```
