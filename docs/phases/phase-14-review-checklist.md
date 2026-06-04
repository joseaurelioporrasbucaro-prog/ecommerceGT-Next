# Checklist de review — Fase 14 (i18n con `next-intl`)

> Companion de `phase-14-i18n-next-intl.md`. Lo usa el revisor (Claude o quien sea) en sesión NUEVA después de que Codex commitee cada hito. Pre-cargado para que la sesión empiece eficiente y no queme tokens explorando.

---

## Prompt para arrancar la sesión nueva de review

Copiar esto a Claude al iniciar la próxima sesión:

```
Hola. Retomamos KIOSQUI. Codex terminó de implementar el Hito 14.<N> de la Fase 14 (i18n con next-intl).

Antes de tocar nada, leé en este orden:
1. AGENTS.md completo (especialmente §12 y §13)
2. docs/phases/phase-14-i18n-next-intl.md (el plan)
3. docs/phases/phase-14-review-checklist.md (este archivo, tu guía)
4. git log --oneline -20 en backend (master) y frontend (main) filtrando por fase14

Después ejecutá el checklist del HITO específico paso a paso.
Reportame al final con el verdict: ✅ APROBADO o ⚠️ ISSUES + lista.

Repos:
- Frontend: ~/Documents/Proyectos Git /ecommerceGT-Next (main)
- Backend:  ~/Documents/Proyectos Git /ecommerceGTBackEnd (master) [solo Hito 14.4]
```

---

## Reglas de revisión globales

🚨 = **BLOQUEANTE** (Codex debe corregir antes de seguir).
⚠️ = mejorable pero no bloquea aprobación.
✅ = correcto.

---

## Hito 14.1 — Setup `next-intl` + estructura `[locale]`

### Paso 1 — Inventario de commits

```bash
cd "ecommerceGT-Next" && git log --oneline | grep -i "fase14.1" | head -20
```

**Esperado:** ~7-9 commits granulares con prefijo `feat(fase14.1):`, `test(fase14.1):`, `docs(fase14.1):`.

- 🚨 Si hay un solo commit gigante → marcar.
- 🚨 Si faltan tests T-104..T-108 → marcar.

### Paso 2 — Dependencias

```bash
grep -E "next-intl|react-i18next|i18next" ecommerceGT-Next/package.json
```

**Esperado:**
- `next-intl` presente
- `react-i18next` **todavía presente** (convivencia, D-6)
- `i18next` **todavía presente**

- 🚨 Si `react-i18next` fue eliminado en este hito → violación de D-6, Codex se adelantó.
- ⚠️ Si `next-intl` no está → corte total.

### Paso 3 — Estructura de carpetas

```bash
ls ecommerceGT-Next/src/i18n/
# Esperado: routing.ts, request.ts, navigation.ts
ls ecommerceGT-Next/src/app/[locale]/ | head -20
# Esperado: muchas carpetas (login, register, publications, etc.)
ls ecommerceGT-Next/src/app/ | head
# Esperado: layout.tsx, globals.css, favicon.ico, sitemap.ts, robots.ts, [...not_found], [locale]
```

- 🚨 Si `src/app/[locale]/` no existe → corte total.
- 🚨 Si quedan carpetas top-level (ej. `src/app/login/` sin haber sido movida) → marcar.
- 🚨 Si `sitemap.ts` o `robots.ts` se movieron dentro de `[locale]/` → mal, deben quedar en raíz.

### Paso 4 — Root layout vs `[locale]/layout.tsx`

Leer ambos archivos:

```bash
cat ecommerceGT-Next/src/app/layout.tsx
cat ecommerceGT-Next/src/app/[locale]/layout.tsx
```

**`src/app/layout.tsx` (root)** esperado:
- 🚨 Sin `<html>` ni `<body>` — solo `return children;` (o equivalente).
- Sin metadata grande (la metadata vive en `[locale]/layout.tsx`).

**`src/app/[locale]/layout.tsx`** esperado:
- `<html lang={locale}>` con `lang` dinámico (no hardcoded).
- `NextIntlClientProvider` con `messages` y `locale`.
- Mantiene `AppProvider`, `QueryProvider`, `AuthProvider`, `ToastContainer`, `CookieConsentBanner`.
- 🚨 `alternates.languages` con `es`, `en`, `x-default` para hreflang.
- `generateStaticParams` con los locales.
- `setRequestLocale(locale)` llamado.

### Paso 5 — Middleware

```bash
cat ecommerceGT-Next/src/middleware.ts
```

**Esperado:**
- Importa y compone `createIntlMiddleware` y el check de auth.
- 🚨 `PROTECTED_ROUTES` se compara contra el path **sin** el prefijo de locale.
- Redirect a login conserva el locale: `redirect('/${locale}/login')`, no a `/login` pelado.
- `matcher` excluye `_next/static`, `_next/image`, `favicon.ico`, `uploads`, `api`.

### Paso 6 — Mensajes iniciales

```bash
ls ecommerceGT-Next/messages/es/
ls ecommerceGT-Next/messages/en/
# Esperado: al menos common.json y auth.json en cada uno

# Validar JSON correcto:
node -e "require('./messages/es/common.json'); require('./messages/es/auth.json'); console.log('ok')"
```

- 🚨 Si los JSON están malformados → fail.
- 🚨 Si `es/` o `en/` tienen distinto set de claves → fail (claves desincronizadas rompen la UI).

```bash
# Diff de keys
node -e "
const es = require('./messages/es/common.json');
const en = require('./messages/en/common.json');
function keys(o, prefix=''){return Object.entries(o).flatMap(([k,v])=>typeof v==='object'?keys(v,prefix+k+'.'):[prefix+k])}
const esK = new Set(keys(es)), enK = new Set(keys(en));
for (const k of esK) if (!enK.has(k)) console.log('FALTA en EN:', k);
for (const k of enK) if (!esK.has(k)) console.log('FALTA en ES:', k);
"
```

### Paso 7 — Build pasa

```bash
cd ecommerceGT-Next && npm run build
```

- 🚨 Si el build falla → fail total.
- ⚠️ Warnings nuevos en consola → revisar pero no bloqueante.

### Paso 8 — Smoke visual (Codex en el PR adjunta screenshots)

Verificar en el PR:
- Screenshot de `/es` y `/en` mostrando texto distinto en al menos una clave.
- Screenshot del selector de idioma en el header.
- Screenshot de la cookie `NEXT_LOCALE` en DevTools tras click del selector.

🚨 Si faltan los screenshots → pedirlos.

### Paso 9 — Tests T-104..T-108

Si Codex implementó tests con Playwright/Vitest+Next:
```bash
cd ecommerceGT-Next && npm test
```

Si **no hay runner de frontend setup** (Fase 21 lo agregaría), Codex documenta T-104..T-108 como "smoke manual ejecutado" en el PR y se acepta.

### Paso 10 — Backend tests siguen verdes

```bash
cd ecommerceGTBackEnd && npm test
```

- 🚨 Si bajaron del 17/17 → Codex tocó algo que no debía.

### Verdict Hito 14.1

✅ APROBADO si todos los 🚨 pasaron.
⚠️ APROBADO CON OBSERVACIONES si solo hay ⚠️.
❌ RECHAZADO si alguno fallò 🚨 — Codex debe corregir antes de pasar a 14.2.

---

## Hito 14.2 — Migración Login/Register/Forgot/HeaderOne/HeaderTwo

### Paso 1 — Commits

```bash
cd ecommerceGT-Next && git log --oneline | grep -i "fase14.2"
```

Esperado: 1 commit por archivo migrado + 1 chore de cleanup + tests + docs.

### Paso 2 — Verificar ausencia de `react-i18next`

```bash
grep -rn "react-i18next\|from.*i18next" ecommerceGT-Next/src/ 2>/dev/null
# Esperado: SIN OUTPUT
grep -E "react-i18next|^.+i18next" ecommerceGT-Next/package.json
# Esperado: SIN OUTPUT
ls ecommerceGT-Next/src/i18n.js 2>/dev/null
# Esperado: "No such file or directory"
```

🚨 Cualquier match → Codex no terminó la limpieza.

### Paso 3 — Imports nuevos correctos

```bash
grep -n "useTranslations" ecommerceGT-Next/src/form/ForgotForm.tsx
grep -n "useTranslations" ecommerceGT-Next/src/form/RegisterForm.tsx
grep -n "useTranslations" ecommerceGT-Next/src/layout/header/HeaderOne.tsx
grep -n "useTranslations" ecommerceGT-Next/src/layout/header/HeaderTwo.tsx
```

🚨 Si alguno sigue usando `useTranslation` (singular, sin 's') → no fue migrado.

### Paso 4 — Diff de claves: no se perdieron traducciones

```bash
# Tomar el bundle viejo del git y comparar con messages/es/auth.json:
git show HEAD~10:src/i18n.js > /tmp/i18n_old.js
# Extraer claves auth.* y comparar manualmente con messages/es/auth.json
```

🚨 Si una clave del bundle viejo no está en el nuevo → traducción perdida.

### Paso 5 — Build pasa

```bash
cd ecommerceGT-Next && npm run build
```

### Paso 6 — Smoke

Visitar `/es/login`, `/en/login`, `/es/register`, `/en/register`, `/es/forgot`, `/en/forgot`. Screenshots en el PR.

### Paso 7 — Backend tests

```bash
cd ecommerceGTBackEnd && npm test
```

🚨 < 17/17 → Codex tocó backend.

### Verdict Hito 14.2

Mismo formato que 14.1.

---

## Hito 14.3 — Contenido nuevo + fechas

### Paso 1 — Commits

```bash
cd ecommerceGT-Next && git log --oneline | grep -i "fase14.3"
```

Esperado: ~10–12 commits — uno por namespace + uno por helper de fechas.

### Paso 2 — Namespaces

```bash
ls ecommerceGT-Next/messages/es/
ls ecommerceGT-Next/messages/en/
# Esperado: common, auth, messages, support, pauta, profile, notifications, admin, home, publications, legal, danger
```

🚨 Cualquier namespace faltante de los 12 listados → fail.

### Paso 3 — Diff de claves por namespace

```bash
node -e "
const fs = require('fs');
const nss = fs.readdirSync('./messages/es').map(f => f.replace('.json',''));
function keys(o, prefix=''){return Object.entries(o).flatMap(([k,v])=>typeof v==='object'&&v!==null?keys(v,prefix+k+'.'):[prefix+k])}
for (const ns of nss) {
  const es = require(\`./messages/es/\${ns}.json\`);
  const en = require(\`./messages/en/\${ns}.json\`);
  const esK = new Set(keys(es)), enK = new Set(keys(en));
  for (const k of esK) if (!enK.has(k)) console.log('[ns:'+ns+'] FALTA en EN:', k);
  for (const k of enK) if (!esK.has(k)) console.log('[ns:'+ns+'] FALTA en ES:', k);
}
"
```

🚨 Cualquier desincronización → fail.

### Paso 4 — `request.ts` carga todos los namespaces

```bash
grep -A 5 "namespaces" ecommerceGT-Next/src/i18n/request.ts
```

🚨 Si carga solo `common+auth` → fail (los nuevos no llegan al provider).

### Paso 5 — Sweep de strings hardcoded

Esta es la revisión más larga. Tomar muestra de archivos por namespace y revisarlos:

```bash
# Por cada carpeta tocada, leer 1-2 archivos completos
cat ecommerceGT-Next/src/components/support/SupportTicketsMain.tsx | head -120
cat ecommerceGT-Next/src/components/pauta/PautaMain.tsx | head -120
```

🚨 Si quedan strings literales visibles (no comentarios, no atributos técnicos) sin `t()` → marcar uno por uno.

⚠️ Excepciones aceptables documentadas por Codex en el PR (ej. nombres propios, copy técnico).

### Paso 6 — Fechas

```bash
grep -rn "toLocaleDateString\|toLocaleString\|toLocaleTimeString" ecommerceGT-Next/src/ 2>/dev/null
grep -rn "'es-GT'\|'es-ES'\|'en-US'" ecommerceGT-Next/src/ 2>/dev/null
```

🚨 Output esperado: **0 ocurrencias** o solo en `src/utils/datetime.ts` (el helper).

```bash
ls ecommerceGT-Next/src/utils/datetime.ts
# Esperado: existe
```

### Paso 7 — Build + backend tests verdes

```bash
cd ecommerceGT-Next && npm run build
cd ecommerceGTBackEnd && npm test
```

### Paso 8 — Smoke visual

PR adjunta capturas de al menos:
- `/es/soporte/tickets` y `/en/soporte/tickets`
- `/es/pauta` y `/en/pauta`
- `/es/messages` y `/en/messages`
- Fecha en cualquier listado mostrándose en formato correcto del locale

### Verdict Hito 14.3

Mismo formato. Este hito es el más expuesto a "se me escapó un string" — revisar con calma.

---

## Hito 14.4 — Backend + emails + SEO

### Paso 1 — Commits (en backend Y frontend)

```bash
cd ecommerceGTBackEnd && git log --oneline | grep -i "fase14.4"
cd ecommerceGT-Next && git log --oneline | grep -i "fase14.4"
```

Esperado: ~5–7 backend (templates + error codes + tests + docs) + 3–4 frontend (Api.ts pasa locale + sitemap + robots + docs).

### Paso 2 — Helper `emailTemplates.js`

```bash
ls ecommerceGTBackEnd/utils/emailTemplates.js
cat ecommerceGTBackEnd/utils/emailTemplates.js | head -60
```

Esperado: módulo exporta `renderEmail(name, locale, params)` con al menos 6 plantillas (recovery, verificationConfirm, verificationConfirmWithTemp, reviewSeller, addedToCompany, invitedToCompany) en `es` y `en`.

🚨 Si solo tiene `es` → fail (defeats the purpose).

### Paso 3 — Reemplazo de `transp.sendMail` por `renderEmail`

```bash
grep -n "transp.sendMail" ecommerceGTBackEnd/config/connPostgresDB.js
grep -n "renderEmail" ecommerceGTBackEnd/config/connPostgresDB.js
```

🚨 Si quedan llamadas a `transp.sendMail({ subject, html })` con `subject` y `html` inline en `config/connPostgresDB.js` → fail. Todas deben venir del helper.

### Paso 4 — Códigos de error

```bash
grep -B 1 "code:" ecommerceGTBackEnd/config/connPostgresDB.js | grep -c "code: 'error\."
```

Esperado: al menos 20 respuestas de error con `code: 'error.*'` (los más visibles).

```bash
# Verificar shape correcto en una muestra
grep -n -B 1 -A 5 "code: 'error.budget_too_low'" ecommerceGTBackEnd/config/connPostgresDB.js
```

🚨 Si el shape no tiene `code` + `message` (fallback ES) + `params` (cuando aplica) → fail.

### Paso 5 — Frontend: `locale` en body de endpoints con email

```bash
grep -n "locale" ecommerceGT-Next/src/form/ForgotForm.tsx
grep -n "locale" ecommerceGT-Next/src/form/RegisterForm.tsx
```

Esperado: los body de POST a `/recoverypass`, `/register`, etc. incluyen `locale: useLocale()`.

🚨 Si no → backend cae a fallback ES siempre.

### Paso 6 — SEO bilingüe

```bash
cat ecommerceGT-Next/src/app/sitemap.ts
```

Esperado:
- 🚨 Itera sobre `routing.locales`.
- 🚨 Cada entry tiene `alternates.languages` con ambos locales.
- 🚨 Lista no vacía.

```bash
cat ecommerceGT-Next/src/app/robots.ts
```

Esperado:
- 🚨 `disallow` incluye prefijo de locale (`/es/soporte/`, `/en/soporte/`, ...).

### Paso 7 — Tests backend T-115..T-117

```bash
cd ecommerceGTBackEnd && npm test
```

Esperado: tests 17 previos + 3 nuevos = 20 verdes.

🚨 Si T-115..T-117 no existen → fail.

🚨 Si T-115 (email en inglés cuando `locale: 'en'`) falla → el helper no se está consultando.

### Paso 8 — Docs §13

| Doc | Verificación |
|---|---|
| `ecommerceGTBackEnd/docs/API_REFERENCE.md` | Documenta `{ code, message, params }` y `locale` en body |
| `ecommerceGTBackEnd/docs/GLOSSARY.md` | Entries "Locale", "Sub-path routing", "Error code" |
| `ecommerceGT-Next/docs/FRONTEND_STRUCTURE.md` | Documenta `src/app/[locale]/`, `src/i18n/*` |
| `ecommerceGT-Next/docs/ARCHITECTURE.md` | Diagrama "Request bilingüe" |
| `ecommerceGT-Next/docs/ONBOARDING.md` | Paso "agregar traducción" |
| `ecommerceGT-Next/docs/TEST_PLAN.md` | T-104..T-117 |
| `ecommerceGT-Next/MIGRATION.md` | Fase 14 cerrada con hitos 14.1..14.4 en bitácora |

🚨 Cualquier doc faltante → violación de §13.

### Verdict Hito 14.4 + Fase 14 completa

Si los 4 hitos están ✅ → **FASE 14 CIERRA**.

Confirmar también en la bitácora de `MIGRATION.md`:
- [ ] Sección por hito 14.1, 14.2, 14.3, 14.4.
- [ ] Migración SQL (si la hubiera — esta fase no agrega tablas, pero confirmar).
- [ ] Pendientes (cualquier endpoint que no migró su shape a `{ code, ... }` queda como follow-up).

---

## Reporte final esperado

Plantilla para el verdict:

```
# Review Fase 14 — i18n con next-intl

## Resumen ejecutivo
[1 párrafo: qué se hizo, cuántos commits, cuántos tests, estado de docs]

## Por hito
- Hito 14.1: ✅ / ⚠️ / ❌
- Hito 14.2: ✅ / ⚠️ / ❌
- Hito 14.3: ✅ / ⚠️ / ❌
- Hito 14.4: ✅ / ⚠️ / ❌

## Hardening / bonus que Codex agregó
- [bullet list]

## Issues encontrados
🚨 Bloqueantes:
- ...
⚠️ Observaciones:
- ...

## Verdict
✅ FASE 14 APROBADA / ⚠️ APROBADA CON OBSERVACIONES / ❌ RECHAZADA

## Estado de ramas
- Frontend main: <SHA>
- Backend master: <SHA>

## Próximo paso sugerido
[Fase 11.2 pasarela de pago | Fase 21 Playwright frontend tests | otra]
```
