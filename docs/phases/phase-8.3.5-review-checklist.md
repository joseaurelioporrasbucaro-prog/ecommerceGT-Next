# Checklist de review — Fase 8.3.5

> Companion de `phase-8.3.5-recovery-tokens.md`. Lo usa el revisor (Claude) en una sesión NUEVA después de que Codex commitee. Pre-cargado para que la sesión empiece eficiente.

## Prompt para arrancar la sesión nueva de review

Copiar esto a Claude al iniciar la próxima sesión:

```
Hola. Retomamos KIOSQUI. Codex terminó de implementar la Fase 8.3.5.

Antes de tocar nada, leé en este orden:
1. AGENTS.md completo (especialmente §12 y §13)
2. docs/phases/phase-8.3.5-recovery-tokens.md (el plan)
3. docs/phases/phase-8.3.5-review-checklist.md (este archivo, tu guía)
4. git log --oneline -10 en backend (master) y frontend (main)

Después ejecutá el checklist de este archivo paso a paso.
Reportame al final con el verdict: ✅ APROBADA o ⚠️ ISSUES + lista.

Repos:
- Backend: ~/Documents/Proyectos Git /ecommerceGTBackEnd (master)
- Frontend: ~/Documents/Proyectos Git /ecommerceGT-Next (main)
```

---

## Paso 1 — Inventario de commits

```bash
cd ecommerceGTBackEnd && git log --oneline | head -10
cd ecommerceGT-Next && git log --oneline | head -10
```

**Esperado:** ~7-9 commits nuevos con prefijo `feat(fase8.3.5):`, `test(fase8.3.5):`, `docs(fase8.3.5):`. Granulares, no mega-commits.

**Si:**
- Hay un solo commit gigante → ⚠️ marcar
- Faltan tests o docs → ⚠️ marcar
- Codex commiteó algo no planeado → leer ese diff específico

---

## Paso 2 — `npm test` localmente

```bash
cd ecommerceGTBackEnd && npm test
```

**Esperado:**
```
Tests  17 passed (17)
```

= 8 previos (login×2, lockout×2, unlock-password×2, bcrypt-rounds×2) + 9 nuevos (T-95..T-103).

**Si:**
- < 17 → ⚠️ algún test falla, leer log
- > 17 → Codex agregó tests extra (revisar si son útiles)
- T-90..T-94 todavía aparecen → ⚠️ Codex no eliminó los obsoletos

---

## Paso 3 — Auditoría del schema (§12)

```bash
grep -c "^CREATE TABLE" ecommerceGTBackEnd/database.sql
grep "password_reset_tokens" ecommerceGTBackEnd/database.sql | head -5
```

**Esperado:**
- 42 tablas (41 anteriores + `password_reset_tokens`)
- La tabla está al final del archivo, NO con ALTER

**Si:**
- `ALTER TABLE password_reset_tokens` aparece → ⚠️ violación §12
- La tabla está en medio del archivo modificando orden → ⚠️

---

## Paso 4 — Lectura crítica de los 9 tests

Abrir `tests/api/auth/recovery.spec.js` y verificar que cada test **realmente prueba lo que dice probar**, no solo `expect(true).toBe(true)`:

| Test | Setup esperado | Aserción crítica |
|---|---|---|
| T-95 | POST `/recoverypass` con email válido | Fila nueva en `password_reset_tokens` con `prt_used_at IS NULL` |
| T-96 | POST con email **inexistente** | Status 200 + `SELECT COUNT(*)` de tokens NO incrementa |
| T-97 | 3 tokens activos + intentar 4to | Status 200 pero NO se inserta el 4to (count sigue en 3) |
| T-98 | Token válido + nueva password | Status 200 + bcrypt.compare(new, user.cus_password) === true + token.prt_used_at !== null |
| T-99 | Token random que no existe en BD | Status 401, body.invalidToken === true |
| T-100 | Token ya con `prt_used_at = NOW()` | Status 401, body.tokenAlreadyUsed === true |
| T-101 | Token con `prt_expires_at < NOW()` | Status 401, body.tokenExpired === true |
| T-102 | 3 tokens activos del mismo user + usar 1 | Los otros 2 quedan con `prt_used_at != NULL` |
| T-103 | Token del user A + intentar usar para user B | Solo afecta al user A (verificar passwords de ambos) |

**Si:**
- Algún test es trivial (no prueba la lógica real) → ⚠️ marcar y proponer fortalecimiento
- Falta cleanup (los tests no se aíslan entre sí) → ⚠️

---

## Paso 5 — Sample check manual del flujo

Con la BD local + backend corriendo:

```bash
# 1) Solicitar reset (debería ver 200 + email enviado en consola si en dev)
curl -X POST http://localhost:4000/recoverypass \
  -H "Content-Type: application/json" \
  -d '{"email":"tester@test.com"}'

# 2) Extraer el token de:
#    - Los logs del servidor (si en dev), O
#    - SELECT prt_token_hash es solo hash, no sirve. Mejor:
#    - Hacer mock del transp.sendMail con vi.spyOn en tests para verificar el link enviado
#    - O modificar TEMPORALMENTE recoveryPwd para console.log el token plain (REVERTIR antes de cerrar)

# 3) POST /recoverypassnew con el token
curl -X POST http://localhost:4000/recoverypassnew \
  -H "Content-Type: application/json" \
  -d '{"token":"<token_plaintext>","npassword":"NewSecure123!"}'

# 4) Verificar en BD:
SELECT prt_used_at, prt_used_ip FROM ecom.password_reset_tokens
 WHERE prt_token_hash = encode(digest('<token>', 'sha256'), 'hex');
# Esperado: prt_used_at = NOW recent, prt_used_ip lleno

# 5) Intentar reusar el mismo token → debe dar 401 tokenAlreadyUsed
```

**Si no se puede correr esto sin modificar código:** marcar como "nice to have" y revisar con los tests automatizados que cubren la lógica.

---

## Paso 6 — Auditoría §13 (docs canónicos)

```bash
# API_REFERENCE menciona /recoverypass actualizado?
grep -A 3 "recoverypass" ecommerceGTBackEnd/docs/API_REFERENCE.md | head -20
# Esperado: shape nuevo con `token` en lugar de `lastPwd`

# SCHEMA menciona password_reset_tokens?
grep "password_reset_tokens" ecommerceGTBackEnd/docs/SCHEMA.md | head -5
# Esperado: en tabla resumen + bloque expandido

# GLOSSARY tiene Token de reset?
grep "Token de reset\|token de recuperaci" ecommerceGTBackEnd/docs/GLOSSARY.md
# Esperado: 1+ match

# TEST_PLAN actualizado?
grep -c "T-90\|T-91\|T-92\|T-93\|T-94" ecommerceGT-Next/docs/TEST_PLAN.md
grep "OBSOLETE" ecommerceGT-Next/docs/TEST_PLAN.md | grep "T-9"
# Esperado: marcados como OBSOLETE
grep -c "T-95\|T-96\|T-97\|T-98\|T-99\|T-100\|T-101\|T-102\|T-103" ecommerceGT-Next/docs/TEST_PLAN.md
# Esperado: 9+

# MIGRATION cerrada?
grep -A 2 "### Fase 8.3.5" ecommerceGT-Next/MIGRATION.md
# Esperado: ✅ checkmark + bitácora
```

**Si algún check falla** → ⚠️ violación §13. Pedirle a Codex (vía Aurelio) que complete, o completar yo mismo si es trivial (ej. cambiar T-90 a OBSOLETE).

---

## Paso 7 — Verificar criptografía y seguridad

Leer `config/connPostgresDB.js` y confirmar:

| Check | Cómo verificar | Por qué importa |
|---|---|---|
| Token random usa `crypto.randomBytes(32)` | `grep "randomBytes" config/connPostgresDB.js` | Math.random() NO sirve para crypto |
| Hash SHA-256 antes de guardar | `grep "createHash.*sha256" config/connPostgresDB.js` | Si la BD se filtra, tokens no usables |
| Comparación de hash en validación | Mismo hash sha256 al comparar | Sin esto, el endpoint sería inservible |
| Transacción atómica en cambio de password | `grep "BEGIN\|COMMIT\|ROLLBACK" config/connPostgresDB.js` cerca de recoveryPwdGenNew | Sin transacción, podrías cambiar password pero fallar al marcar token usado |
| Validación de expiración SOLO server-side | El frontend NO valida `prt_expires_at` | Cliente no es source of truth de seguridad |
| Anti-enumeración: 200 silencioso si email no existe | Leer el branch del `if (result.rows.length === 0)` en recoveryPwd | Confirmado en el plan D-2 |

**Si:**
- Token usa Math.random → 🚨 **CRÍTICO BLOQUEANTE**, no aprobar
- Falta SHA-256 → 🚨 CRÍTICO
- No hay transacción → ⚠️ alto riesgo (puede dejar BD inconsistente)
- Email enumeration posible → ⚠️ no es bloqueante pero anotar como follow-up

---

## Paso 8 — CI verde

Refrescar GitHub Actions del backend. Debe haber un nuevo run del último commit con todos los steps en ✅.

**Si está rojo:** el log indica qué falla. Probablemente vinculado a npm ci (ya vimos eso en Fase 20) o a tests.

---

## Paso 9 — Verificar que el commit message de Codex reporta decisiones

Esperado en el commit final:

```
ref docs/phases/phase-8.3.5-recovery-tokens.md
Tiempo: Xh
Decisiones aplicadas: D-1=B, D-2=B, D-3=B, D-4=B, D-5=A, D-6=B
Bloqueos: ninguno / lista
```

Si **alguna decisión cambió respecto al plan** (ej. D-3=A en lugar de B), entender por qué y validar.

---

## Verdict

- ✅ **APROBADA** — todos los checks pasan
- ⚠️ **APROBADA CON FOLLOW-UPS** — pequeños tweaks pero no bloqueantes (commit fix)
- 🚨 **RECHAZADA** — issue crítico (security, tests rotos, doc bloqueante) → pedir a Codex regenerar

---

## Cierre de la fase

Si aprobada:

```bash
# 1. Actualizar MIGRATION.md cerrando Fase 8.3.5 (Codex ya lo hizo, verificar)

# 2. Push a develop si Codex no lo hizo
cd ecommerceGTBackEnd && git checkout develop && git merge master --ff-only && git push origin develop && git checkout master
cd ecommerceGT-Next && git checkout develop && git merge main --ff-only && git push origin develop && git checkout main

# 3. Reportar a Aurelio:
#    ✅ Fase 8.3.5 aprobada y pusheada
#    Próximos pasos sugeridos: i18n / pasarela de pago / extender tests
```

## Notas para el revisor futuro

- Esta fase TOCA AUTH. Es el área más sensible del sistema. Si tenés DUDA en cualquier check, **rechazá** y pedile a Codex que aclare. Mejor 1 hora extra que un security bug en prod.
- Si Codex eliminó código de Fase 8.3.4 que NO debería haber eliminado (ej. validación de `passta_id=2` para bloqueo por intentos), restaurar.
- Si los tests dependen del email mock (`transp.sendMail` interceptado), verificar que esa intercepción NO contamine otros tests del suite.
