# Fase 14 — Internacionalización (i18n) bilingüe con `next-intl` y sub-paths `/es` `/en`

> **Para:** Codex / cualquier ejecutor.
> **De:** Claude (arquitecto).
> **Fecha:** 2026-06-04.
> **Repos involucrados:** `ecommerceGT-Next` (main) y `ecommerceGTBackEnd` (master).
> **Tipo:** feature + refactor amplio. **Cuatro hitos secuenciales** (14.1 → 14.2 → 14.3 → 14.4). Codex puede entregar cada hito en su propia rama o todo de corrido, pero cada hito termina con tests verdes antes de empezar el siguiente.

---

## Objetivo

Llevar KIOSQUI de scaffold parcial de `react-i18next` (solo Login/Register/Forgot/HeaderTwo) a **i18n bilingüe completo (es / en)** usando **`next-intl`** con **rutas localizadas** (`/es/...` y `/en/...`), incluyendo el contenido nuevo de Fases 5–11 (mensajes, soporte, pauta, notificaciones, perfiles, etc.) y los emails del backend.

### Por qué `next-intl` y no quedarnos con `react-i18next`

| Aspecto | `react-i18next` (estado actual) | `next-intl` (lo que vamos a tener) |
|---|---|---|
| **SEO** | Una sola URL para ambos idiomas — Google indexa solo la default | `/es/publicaciones/123` y `/en/listings/123` indexables como páginas distintas |
| **hreflang** | Manual y frágil | Emitido automático por el middleware |
| **`og:locale`** | Estático | Por ruta, en RSC |
| **Server Components** | No funcionan (`"use client"` obligado) | First-class — traducciones en servidor, sin JS extra |
| **Detección Accept-Language** | A mano | Middleware lo hace |
| **Links compartibles** | Pierden el idioma | Preservan `/en/...` al pegarse en WhatsApp / Facebook |
| **Ecosistema Next** | Tercero genérico | Recomendado por la doc oficial de Next |

### Por qué sub-paths `/es` `/en` (no subdominios, no parámetro)

- ✅ Mejor SEO: Google considera cada sub-path como una página separada con `hreflang` cruzado.
- ✅ Sin DNS extra ni certs por subdominio.
- ✅ Links compartibles preservan idioma.
- ❌ Costo: hay que mover páginas de `src/app/` a `src/app/[locale]/`.

---

## Pre-requisitos

- Fase 12 (legal pages + cookie consent) cerrada (ya está) — la cookie de consentimiento ya existe y la usaremos como referencia para la cookie de locale.
- Fase 18 (SEO launch) cerrada (ya está) — `sitemap.ts`, `robots.ts`, metadata por página existen. Vamos a extenderlos para que emitan ambas variantes localizadas.
- Fase 20 (tests automatizados) cerrada (ya está). Vamos a sumar tests por hito.
- Sin fases pendientes que toquen el backend de forma masiva (Fase 11.2 podría correr en paralelo, ver §Riesgos).

---

## Inventario (estado actual)

### Frontend
- `package.json` declara `i18next@26.0.8` + `react-i18next@17.0.6`.
- `src/i18n.js` (288 líneas) con bundle inline `es` + `en`. Cubre claves de Login, Register, Forgot, HeaderTwo, validation. Inicializa al importarlo.
- `src/app/layout.tsx` con `<html lang="es">` hardcoded. Único layout.
- `src/middleware.ts` solo protege rutas autenticadas (cookie `token`).
- **5 archivos** usan `useTranslation` hoy:
  - `src/form/ForgotForm.tsx`
  - `src/form/RegisterForm.tsx`
  - `src/layout/header/HeaderOne.tsx`
  - `src/layout/header/HeaderTwo.tsx`
  - (`src/i18n.js` lo configura)
- **0 selectores de idioma visibles al usuario.** El idioma queda fijo en `es`.
- **~50 hits** de `toLocaleDateString` / `toLocaleString` con `'es-GT'` / `'es-ES'` hardcoded en todo el código.
- **App Router** con ~25 carpetas de rutas en `src/app/` (top-level). Mayoría son server components.
- **Todo el contenido de Fases 5–11** está en español hardcoded: mensajes, soporte (verificaciones, usuarios, tickets, denuncias), pauta, notificaciones, perfiles, configuraciones, danger zone, legal pages, etc.

### Backend
- Emails en `config/connPostgresDB.js` con `transp.sendMail({ subject, html })` hardcoded en español. Lugares confirmados (line refs aproximadas):
  - L383 — `recoveryPwd` (link de reset)
  - L1954 / L1962 — confirmación de cuenta (con/sin temporal)
  - L2060 — califica vendedor
  - L3040 — te agregaron a empresa (con temporal)
  - L3147 — te invitaron a una empresa
- Respuestas de error con `response.status(N).json({ message: "..." })` siempre en español, sin código de error machine-readable.
- Notificaciones in-app (`ecom.notifications`) con `payload` JSON; los textos visibles vienen de mappers en frontend y/o del backend según el caso (verificar por endpoint).

---

## Decisiones de diseño cerradas (D-1..D-11)

### D-1: Librería
**A.** Mantener `react-i18next` (no migrar).
**B.** Migrar a `next-intl`. **← Recomendada y aplicada.**

### D-2: Estrategia de routing
**A.** Sub-paths `/es/...` `/en/...`. **← Recomendada y aplicada.**
**B.** Subdominios `es.kiosqui.gt` / `en.kiosqui.gt` (más infra, más SEO premium pero overkill hoy).
**C.** Query param `?lang=en` (peor SEO, scope no aceptable).

### D-3: Locale default
**A.** `es` (mercado principal GT). **← Aplicada.**
**B.** `en`.

### D-4: Detección de idioma en primera visita
**A.** Leer `Accept-Language` header, redirect al locale más cercano. **← Aplicada vía middleware `next-intl`.**
**B.** Siempre redirect a `/es` (ignorar header).

### D-5: Persistencia de elección del usuario
**A.** Cookie `NEXT_LOCALE` (lo que usa `next-intl` por defecto). **← Aplicada.**
**B.** localStorage.
**C.** Columna `cus_locale` en `customer` (futuro — no ahora; añade complejidad y requiere SQL).

### D-6: Convivencia react-i18next ↔ next-intl
**A.** Big-bang: borrar `react-i18next` y `src/i18n.js` el mismo día. Alto riesgo.
**B.** Convivencia durante hitos 14.1 y 14.2. Los 5 archivos viejos siguen usando `useTranslation` de `react-i18next` con su bundle hasta que se migren explícitamente. Al final del hito 14.2 se borran las deps. **← Aplicada.**

### D-7: Estructura de mensajes
**A.** Un solo `messages/es.json` + `messages/en.json` planos.
**B.** Split por namespace: `messages/es/common.json`, `messages/es/auth.json`, `messages/es/support.json`, etc., y se mergea en el provider. **← Aplicada.** Justificación: archivos < 500 líneas son revisables; un solo bundle se vuelve ingobernable con todo el contenido de Fases 5–11.

> ⚠️ **Codex:** `next-intl` recibe un solo objeto de mensajes en el provider. El split por namespace es **organización en disco** — al cargarlos se mergean en memoria con `{ common: ..., auth: ..., support: ... }`. Las claves se referencian como `t('support.tickets.newTicket')` desde cualquier componente.

### D-8: Errores del backend
**A.** Seguir en español hardcoded, frontend traduce con regex sobre `message`.
**B.** Códigos machine-readable con `params`. Frontend traduce con `t(error.code, error.params)`. **← Aplicada.**

```js
// Backend (nuevo patrón)
return response.status(400).json({
  code: 'error.budget_too_low',
  message: 'El presupuesto mínimo es Q10.', // fallback español si la traducción falla
  params: { min: 10 },
});
```

```ts
// Frontend (ApiError extendido)
const friendly = t(error.code, error.params || {});
toast.error(friendly);
```

### D-9: Emails del backend
**A.** Mandar siempre en español.
**B.** Mandar en el idioma preferido del usuario.

**Aplicada: B con caveat.** No vamos a guardar `cus_locale` en BD en esta fase (D-5 lo difiere). Mientras tanto: **el backend recibe `locale` en el body del request que dispara el email** (login response no, pero los flujos relevantes — registro, recovery, invitaciones — sí pueden pasarlo). Si no se manda, fallback a `es`.

Helper en backend:
```js
// utils/emailTemplates.js
const TEMPLATES = {
  recovery: { es: { subject, html }, en: { subject, html } },
  verification: { es: ..., en: ... },
  // ...
};
function renderEmail(name, locale, params) {
  const lang = TEMPLATES[name][locale] ? locale : 'es';
  return TEMPLATES[name][lang](params); // subject + html ya interpolados
}
```

### D-10: Fechas / números
**A.** Reemplazar `toLocaleDateString('es-GT', ...)` hardcoded por `useFormatter()` de `next-intl`. **← Aplicada.**
**B.** Dejar `'es-GT'` hardcoded y vivir con la inconsistencia.

```tsx
const format = useFormatter();
format.dateTime(date, { dateStyle: 'medium' }); // respeta el locale activo
```

### D-11: Orden de los hitos
**A.** En paralelo (Codex se confunde).
**B.** Secuencial: 14.1 termina con tests verdes → 14.2 → 14.3 → 14.4. **← Aplicada.**

---

## Hito 14.1 — Setup `next-intl` + estructura `[locale]`

### Objetivo
Tener `next-intl` instalado y funcionando con `/es` y `/en` activos. Una sola página piloto traducida (Home). El resto del sitio sigue en español hardcoded — eso se ataca en 14.3.

### Cambios

#### 1. Dependencias

```bash
cd ecommerceGT-Next
npm install next-intl
# NO desinstalar react-i18next ni i18next todavía (convivencia, D-6)
```

#### 2. Configurar `next.config.js`

```js
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  // ... config existente
};

module.exports = withNextIntl(nextConfig);
```

#### 3. Crear `src/i18n/routing.ts`

```ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'always', // siempre /es o /en en la URL; default no es "naked"
});
```

#### 4. Crear `src/i18n/request.ts`

```ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Carga messages por namespace y los mergea
  const [common, auth] = await Promise.all([
    import(`../../messages/${locale}/common.json`).then(m => m.default),
    import(`../../messages/${locale}/auth.json`).then(m => m.default),
  ]);

  return {
    locale,
    messages: { common, auth },
  };
});
```

#### 5. Crear `src/i18n/navigation.ts` (wrappers de `Link`, `useRouter`)

```ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

Estos reemplazan a los imports de `next/link` y `next/navigation` en archivos que necesiten preservar el locale. **No los reemplaza todos hoy** — solo donde Codex traduzca en 14.1/14.2. El resto se va migrando en 14.3.

#### 6. Actualizar `src/middleware.ts`

Combinar el middleware actual (auth) con el middleware de `next-intl`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_ROUTES = [
  '/my-publications', '/favorites', '/messages',
  '/creator-profile-info-personal', '/publications/new', '/upload',
];
const PROTECTED_PATTERNS = [/^\/[a-z]{2}\/publications\/[^/]+\/edit/];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) intl primero — redirige raíz a /es, valida que el segmento de locale exista, setea cookie
  const intlResponse = intlMiddleware(req);
  if (intlResponse.headers.get('x-middleware-rewrite') || intlResponse.headers.get('location')) {
    return intlResponse;
  }

  // 2) auth — quita el prefijo /es o /en antes de comparar contra PROTECTED_ROUTES
  const pathWithoutLocale = pathname.replace(/^\/(es|en)(?=\/|$)/, '') || '/';
  const isProtected =
    PROTECTED_ROUTES.some(r => pathWithoutLocale.startsWith(r)) ||
    PROTECTED_PATTERNS.some(p => p.test(pathname));

  if (!isProtected) return intlResponse;

  const token = req.cookies.get('token')?.value;
  if (!token) {
    const locale = pathname.split('/')[1] || routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, req.url);
    loginUrl.searchParams.set('from', pathWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }
  return intlResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|uploads|api).*)'],
};
```

> ⚠️ **Codex:** verificar que el regex de `PROTECTED_PATTERNS` se actualice para tolerar el prefijo de locale. El test E2E debe entrar a `/es/publications/123/edit` sin sesión y recibir redirect a `/es/login`.

#### 7. Mover `src/app/` → `src/app/[locale]/`

Mover **todas** las carpetas que hoy son top-level en `src/app/` dentro de `[locale]/`. Excepciones que **NO** se mueven:
- `src/app/layout.tsx` → se queda como root layout, sin `<html>`. Lo nuevo es `src/app/[locale]/layout.tsx`.
- `src/app/globals.css`, `favicon.ico` → quedan en la raíz.
- `src/app/sitemap.ts`, `src/app/robots.ts` → quedan en la raíz (se actualizan en hito 14.4 para emitir ambas variantes).
- `src/app/[...not_found]` → se queda en la raíz como catch-all para rutas sin locale válido.

Estructura final:
```
src/app/
├── layout.tsx                 // root, sin <html>, solo <html lang> en [locale]
├── globals.css
├── favicon.ico
├── sitemap.ts                 // emite /es/... y /en/... con hreflang
├── robots.ts
├── [...not_found]/
└── [locale]/
    ├── layout.tsx             // <html lang={locale}>, NextIntlClientProvider
    ├── page.tsx               // Home
    ├── login/
    ├── register/
    ├── forgot/
    ├── publications/
    ├── ... (todas las rutas actuales)
    └── (etc.)
```

#### 8. Nuevo `src/app/layout.tsx` (root)

```tsx
import "./globals.css";
import "../style/index.scss";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

> El root layout NO puede tener `<html>` porque el de `[locale]/` lo tendrá. Next 13.4+ permite esto.

> ⚠️ **Verificar:** si Next 13.4.6 da error de "html in non-root layout", actualizar a 13.5+ (mínimo). Codex valida y si no le pasa el build, escala.

#### 9. Nuevo `src/app/[locale]/layout.tsx`

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import AppProvider from "@/contextApi/AppProvider";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/utils/AuthContext";
import QueryProvider from "@/utils/QueryProvider";
import CookieConsentBanner from "@/components/legal/CookieConsentBanner";
import { routing } from "@/i18n/routing";
import 'react-toastify/dist/ReactToastify.css';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  // Mover acá la metadata del root layout viejo, pero con locale dinámico:
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kiosqui.gt";
  const localized = {
    es: {
      title: "KIOSQUI — Marketplace de bienes raíces en Guatemala",
      description: "Casas, apartamentos y terrenos publicados directamente por propietarios verificados en Guatemala.",
    },
    en: {
      title: "KIOSQUI — Real estate marketplace in Guatemala",
      description: "Houses, apartments and land posted directly by verified owners in Guatemala.",
    },
  } as const;
  const t = localized[params.locale as 'es' | 'en'] || localized.es;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.title, template: "%s | KIOSQUI" },
    description: t.description,
    openGraph: {
      type: "website",
      locale: params.locale === 'en' ? 'en_US' : 'es_GT',
      url: `${SITE_URL}/${params.locale}`,
      siteName: "KIOSQUI",
      title: t.title,
      description: t.description,
      images: [{ url: "/assets/img/og-default.jpg", width: 1200, height: 630, alt: "KIOSQUI" }],
    },
    twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/assets/img/og-default.jpg"] },
    alternates: {
      canonical: `${SITE_URL}/${params.locale}`,
      languages: {
        es: `${SITE_URL}/es`,
        en: `${SITE_URL}/en`,
        'x-default': `${SITE_URL}/es`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as any)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="stylesheet" href="/assets/css/fontAwesome5Pro.css" />
        <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="body-bg" suppressHydrationWarning={true}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProvider>
            <QueryProvider>
              <AuthProvider>{children}</AuthProvider>
            </QueryProvider>
          </AppProvider>
          <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
          <CookieConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

#### 10. Crear estructura de mensajes inicial

```
messages/
├── es/
│   ├── common.json    // nav, footer, botones genéricos
│   └── auth.json      // login, register, forgot (sembrado desde src/i18n.js)
└── en/
    ├── common.json
    └── auth.json
```

Sembrar las claves desde `src/i18n.js` (las que ya están traducidas) — usar el bundle `en` que ya existe. Estructura mínima del `common.json`:

```json
{
  "nav": {
    "home": "Inicio",
    "services": "Servicios",
    "publications": "Publicaciones",
    "myCompany": "TechMind"
  },
  "common": {
    "next": "Siguiente",
    "back": "Anterior",
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "loading": "Cargando..."
  }
}
```

#### 11. Página piloto: Home (`src/app/[locale]/page.tsx`)

Migrar el componente `HomeThreeMain` (o el que renderiza `/`) para que use `useTranslations('common.nav')` en al menos un texto visible. Esto valida end-to-end que el sistema funciona.

#### 12. Selector de idioma en `HeaderTwo`

Agregar un dropdown / toggle visible al usuario:

```tsx
'use client';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const toggle = () => {
    const next = locale === 'es' ? 'en' : 'es';
    router.replace(pathname, { locale: next });
  };
  return (
    <button onClick={toggle} className="lang-switcher" aria-label="Toggle language">
      {locale === 'es' ? 'EN' : 'ES'}
    </button>
  );
}
```

Insertarlo en `HeaderOne` y `HeaderTwo` cerca del menú principal (usar el mismo lugar en ambos para consistencia).

### Tests del hito 14.1

Agregar a `tests/` del frontend (si Codex no tiene runner de frontend setup, esto se difiere a Fase 21 — solo dejar evidencia visual + smoke manual en el PR):

| ID | Nombre | Validación |
|---|---|---|
| **T-104** | Middleware redirige raíz a `/es` por default | `GET /` → `302 → /es` (cuando `Accept-Language: es`) |
| **T-105** | Middleware respeta `Accept-Language: en` | `GET /` con header `en` → `302 → /en` |
| **T-106** | Middleware preserva auth-redirect con locale | `GET /es/messages` sin cookie `token` → `302 → /es/login?from=/messages` |
| **T-107** | `/es` y `/en` renderizan la home con texto traducido | Smoke: visible "Inicio" vs "Home" en el nav |
| **T-108** | Selector de idioma persiste vía cookie `NEXT_LOCALE` | Click → cookie escrita → reload mantiene idioma |

### Criterios de aceptación 14.1

- [x] `next-intl` instalado, `react-i18next` y `i18next` siguen en `package.json` (convivencia).
- [x] `src/i18n/routing.ts`, `request.ts`, `navigation.ts` creados.
- [x] `src/middleware.ts` combina auth + intl, y los tests T-104..T-106 pasan.
- [x] Toda la app vive bajo `src/app/[locale]/`. Root layout solo retorna `children`.
- [x] `[locale]/layout.tsx` renderiza `<html lang={locale}>` + `NextIntlClientProvider` + `alternates.languages` con hreflang.
- [x] `messages/es/common.json`, `messages/en/common.json`, `messages/es/auth.json`, `messages/en/auth.json` existen y se cargan en `request.ts`.
- [x] Home en `/es` y `/en` muestra texto distinto en al menos una clave (smoke visual del PR).
- [x] Selector de idioma visible en header — Codex incluye screenshot en el PR.
- [x] **Tests automatizados del backend siguen verdes (17/17).** Este hito no toca backend.

---

## Hito 14.2 — Migrar Login / Register / Forgot / HeaderOne / HeaderTwo de `react-i18next` a `next-intl`

### Objetivo
Mover los 5 archivos que ya usan `useTranslation` al nuevo sistema, sin perder traducciones. Al final del hito, borrar `react-i18next` + `i18next` + `src/i18n.js` del proyecto.

### Cambios

#### 1. Poblar `messages/es/auth.json` y `messages/en/auth.json`

Volcar las claves de `src/i18n.js` que correspondan a `auth.*` y `auth.validation.*`. Usar **exactamente las mismas claves** del bundle viejo para que el find-replace en los 5 archivos sea mecánico.

Ejemplo del shape final:
```json
{
  "login": {
    "title": "Iniciar sesión",
    "email": "Correo",
    "password": "Contraseña",
    "submit": "Iniciar",
    "forgot": "¿Olvidé mi contraseña?",
    "noAccountLink": "¿No tienes una cuenta? Crear una"
  },
  "register": { ... },
  "forgot": { ... },
  "validation": {
    "requiredAll": "Campo requerido",
    "invalidEmailDomain": "Correo inválido",
    "passwordLength": "Mínimo 8 caracteres",
    "passwordUppercase": "Debe contener una mayúscula",
    "passwordNumber": "Debe contener un número",
    "passwordMismatch": "Las contraseñas no coinciden"
  }
}
```

#### 2. Migrar los 5 archivos

Buscar y reemplazar en cada uno:
```ts
// Antes
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
t("auth.login.title")

// Después
import { useTranslations } from 'next-intl';
const t = useTranslations('auth');
t("login.title")
```

Archivos a migrar (en este orden, uno por commit):
1. `src/form/ForgotForm.tsx`
2. `src/form/RegisterForm.tsx`
3. `src/layout/header/HeaderTwo.tsx`
4. `src/layout/header/HeaderOne.tsx`

Verificar `LoginForm.tsx` (no salió en el grep — confirmar) y migrarlo también si usa `useTranslation`.

#### 3. Smoke test manual de cada uno

Codex pasa con el navegador / Playwright headless por:
- `/es/login` → texto en español.
- `/en/login` → texto en inglés.
- `/es/register` → idem.
- `/en/register` → idem.
- `/es/forgot` y `/en/forgot` → idem.

Screenshot en el PR de cada par.

#### 4. Borrar el sistema viejo

```bash
npm uninstall react-i18next i18next
rm src/i18n.js
```

Buscar que **NO queden** imports residuales:
```bash
grep -rn "react-i18next\|from.*i18next" src/
# Esperado: salida vacía
```

### Tests del hito 14.2

| ID | Nombre | Validación |
|---|---|---|
| **T-109** | Login renderiza claves localizadas en `/en/login` | Smoke: input label "Email" (no "Correo") |
| **T-110** | Register renderiza claves localizadas en `/en/register` | Smoke |
| **T-111** | Forgot renderiza claves localizadas en `/en/forgot` | Smoke |

### Criterios de aceptación 14.2

- [ ] 5 archivos migrados a `useTranslations` de `next-intl`.
- [ ] `package.json` ya **NO** declara `react-i18next` ni `i18next`.
- [ ] `src/i18n.js` borrado.
- [ ] `grep "react-i18next" src/` no devuelve nada.
- [ ] `messages/es/auth.json` y `messages/en/auth.json` tienen todas las claves que existían en el bundle viejo (sin pérdida).
- [ ] Build pasa: `npm run build` sin errores.
- [ ] Backend tests siguen verdes (17/17).

---

## Hito 14.3 — Contenido nuevo (Fases 5–11) y fechas con `useFormatter`

### Objetivo
Traducir todo lo que en Fases 5–11 quedó en español hardcoded: mensajes, soporte, pauta, notificaciones, perfiles, configuraciones, legal pages, danger zone, etc. Y resolver los **~50 hits** de `toLocaleDateString` / `'es-GT'` hardcoded.

### Estrategia
Codex avanza **carpeta por carpeta** dentro de `src/components/`. Por cada carpeta:
1. Crea `messages/es/<namespace>.json` y `messages/en/<namespace>.json` vacíos.
2. Extrae los strings visibles uno por uno hacia esos JSONs.
3. Reemplaza `"Texto literal"` por `t('namespace.key')`.
4. Confirma compilando.

### Namespaces a crear

| Namespace | Carpetas afectadas |
|---|---|
| `messages` | `src/components/messages/` (InboxList, ConversationView) |
| `support` | `src/components/support/` (todos los archivos de soporte y tickets) |
| `pauta` | `src/components/pauta/`, `src/components/Upload/PublicationForm.tsx` (sección "pautar") |
| `profile` | `src/components/Creator-Profile/`, `src/components/company/` |
| `notifications` | `src/components/notifications/` |
| `admin` | `src/components/admin/` |
| `home` | `src/components/Home-three/`, secciones del Hero, How it works, etc. |
| `publications` | `src/components/publications/`, formularios y detalle de publicación |
| `legal` | páginas `/terminos`, `/privacidad`, `/contenido` |
| `danger` | DangerZone (eliminar cuenta) |

Registrar todos en `src/i18n/request.ts`:
```ts
const namespaces = ['common', 'auth', 'messages', 'support', 'pauta', 'profile', 'notifications', 'admin', 'home', 'publications', 'legal', 'danger'];
const loaded = await Promise.all(
  namespaces.map(ns => import(`../../messages/${locale}/${ns}.json`).then(m => ({ [ns]: m.default })))
);
const messages = Object.assign({}, ...loaded);
```

### Fechas con `useFormatter`

Crear helper `src/utils/datetime.ts` con re-exports tipados:

```ts
'use client';
import { useFormatter } from 'next-intl';
export function useDateFmt() {
  const f = useFormatter();
  return {
    short: (d: Date | string) => f.dateTime(new Date(d), { dateStyle: 'short' }),
    medium: (d: Date | string) => f.dateTime(new Date(d), { dateStyle: 'medium' }),
    relative: (d: Date | string) => f.relativeTime(new Date(d), new Date()),
    time: (d: Date | string) => f.dateTime(new Date(d), { timeStyle: 'short' }),
  };
}
```

Reemplazar los **~50 hits** de `toLocaleDateString('es-GT', ...)` en `src/` por `useDateFmt().medium(date)` (o el helper que aplique). Server components: usar `getFormatter()` de `next-intl/server` en vez del hook.

> ⚠️ **Codex:** si un archivo es Server Component, usar:
> ```ts
> import { getFormatter } from 'next-intl/server';
> const fmt = await getFormatter();
> fmt.dateTime(date, { dateStyle: 'medium' });
> ```

### Tests del hito 14.3

| ID | Nombre | Validación |
|---|---|---|
| **T-112** | Una página rica (ej. `/es/soporte/tickets`) y su par `/en/soporte/tickets` renderizan idiomas distintos | Smoke visual del PR |
| **T-113** | `formatDate` respeta locale activo | Smoke: `13 jun 2026` vs `Jun 13, 2026` en la misma página |
| **T-114** | `grep "es-GT\|toLocaleDateString" src/` devuelve **0 ocurrencias** | (acepta exepciones documentadas en el PR si las hay) |

### Criterios de aceptación 14.3

- [ ] Los 10 namespaces creados con sus pares `es/` `en/`.
- [ ] **0 strings hardcoded en español** en componentes de Fases 5–11 (criterio de revisión, no de grep — Codex documenta en el PR si quedó alguno con justificación).
- [ ] **0 `toLocaleDateString` con locale literal** — todos via `useDateFmt` o `getFormatter`.
- [ ] Build pasa.
- [ ] Backend tests siguen verdes.

---

## Hito 14.4 — Backend: códigos de error + emails bilingües + SEO bilingüe

### Objetivo
Cerrar el loop: errores y emails que llegan al usuario en su idioma.

### Cambios backend (`ecommerceGTBackEnd`)

#### 1. Convención de respuesta de error

Tocar `config/connPostgresDB.js` para que las respuestas que llegan al frontend tengan la forma:

```js
return response.status(400).json({
  code: 'error.budget_too_low',
  message: 'El presupuesto mínimo es Q10.', // fallback ES
  params: { min: 10 },
});
```

**No es necesario** tocar todas las respuestas del backend en este hito — solo las que el frontend ya muestra como toast.error. Codex hace un sweep:
```bash
grep -n "response.status(4" config/connPostgresDB.js | wc -l
```
y migra al menos las **20 más visibles** (login, register, recovery, verification, ticket, ad campaign, payment method). El resto queda como follow-up tracking en `MIGRATION.md` §Fase 14.

#### 2. Helper `utils/emailTemplates.js` (nuevo)

```js
const TEMPLATES = {
  recovery: {
    es: ({ resetLink }) => ({
      subject: 'Restablecer contraseña — KIOSQUI',
      html: `<h2>Restablecer contraseña</h2><p>Hacé click ...</p><a href="${resetLink}">Restablecer</a>`,
    }),
    en: ({ resetLink }) => ({
      subject: 'Reset your password — KIOSQUI',
      html: `<h2>Reset your password</h2><p>Click ...</p><a href="${resetLink}">Reset</a>`,
    }),
  },
  verificationConfirm: { es: ..., en: ... },
  verificationConfirmWithTemp: { es: ..., en: ... },
  reviewSeller: { es: ..., en: ... },
  addedToCompany: { es: ..., en: ... },
  invitedToCompany: { es: ..., en: ... },
};

function renderEmail(name, locale, params) {
  const lang = (TEMPLATES[name] && TEMPLATES[name][locale]) ? locale : 'es';
  return TEMPLATES[name][lang](params);
}

module.exports = { renderEmail };
```

Reemplazar las 6 llamadas a `transp.sendMail({ subject, html })` en `connPostgresDB.js`:

```js
const { renderEmail } = require('../utils/emailTemplates');
const { subject, html } = renderEmail('recovery', locale || 'es', { resetLink });
await transp.sendMail({ from: process.env.EMAIL_USER, to: email, subject, html });
```

`locale` se obtiene así por flujo:
- Recovery: `request.body.locale` (frontend lo pasa al pedir el reset).
- Verification: `request.body.locale` al registrar.
- Review seller: difícil de pasar (es trigger asíncrono post-compra) — fallback a `es`.
- Added/Invited to company: `request.body.locale` del que invita.

> ⚠️ **Codex:** **NO** agregar columna `cus_locale` a `customer` (D-5 difiere eso). Si `locale` no llega en el body, fallback duro a `es`.

#### 3. Frontend: pasar `locale` a los endpoints que disparan emails

En `Api.ts` o donde corresponda, agregar el locale activo al body:

```ts
import { useLocale } from 'next-intl';

// dentro del hook que llama a /recoverypass:
const locale = useLocale();
await ApiFetch.post('/recoverypass', { email, locale });
```

Endpoints que reciben el cambio:
- `POST /recoverypass`
- `POST /register` (cualquier path que dispare email de confirmación)
- `POST /companies/:id/employees/invite` (o el endpoint real de invitación)
- Los endpoints donde Codex identifique que el backend manda email.

#### 4. SEO bilingüe — `sitemap.ts` y `robots.ts`

`src/app/sitemap.ts` debe emitir **ambas variantes** por ruta:

```ts
import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://kiosqui.gt';
  const paths = ['', '/publications', '/explore-arts', '/pricing-plan', '/faq', '/terminos', '/privacidad', '/contenido', '/login', '/register', '/forgot'];
  return paths.flatMap(p =>
    routing.locales.map(locale => ({
      url: `${SITE}/${locale}${p}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: p === '' ? 1.0 : 0.7,
      alternates: {
        languages: Object.fromEntries(routing.locales.map(l => [l, `${SITE}/${l}${p}`])),
      },
    }))
  );
}
```

`src/app/robots.ts` actualizar disallow para incluir prefijo de locale:
```ts
disallow: ['/es/soporte/', '/en/soporte/', '/es/admin/', '/en/admin/', ...]
```

### Tests del hito 14.4

Backend (vitest + supertest):

| ID | Nombre | Validación |
|---|---|---|
| **T-115** | `POST /recoverypass` con `locale: 'en'` manda email con subject inglés | Spy `transp.sendMail` recibe `subject` que contiene "Reset" |
| **T-116** | `POST /recoverypass` sin `locale` cae a `es` | Subject contiene "Restablecer" |
| **T-117** | Endpoint con error devuelve shape `{ code, message, params }` | Hacer login con creds inválidas → response tiene `code` |

### Criterios de aceptación 14.4

- [ ] `utils/emailTemplates.js` creado con 6 plantillas bilingües.
- [ ] Las 6 llamadas a `transp.sendMail` usan `renderEmail()`.
- [ ] Endpoints clave devuelven `{ code, message, params }` (al menos los 20 más visibles).
- [ ] Frontend pasa `locale` al body de los endpoints que disparan emails.
- [ ] `sitemap.ts` emite `/es/...` y `/en/...` con `hreflang`.
- [ ] `robots.ts` actualizado con disallow por locale.
- [ ] T-115..T-117 verdes.
- [ ] Tests previos siguen verdes (17 + nuevos del hito).

---

## Documentación a actualizar (per AGENTS.md §13)

### Frontend (`ecommerceGT-Next/docs/`)
- `FRONTEND_STRUCTURE.md`: documentar `src/app/[locale]/`, `src/i18n/*`, namespaces de `messages/`.
- `ARCHITECTURE.md`: agregar diagrama de "Cómo se resuelve un request bilingüe" (middleware → request.ts → layout → page).
- `ONBOARDING.md`: paso "agregar una traducción" con find-replace de namespace.
- `TEST_PLAN.md`: T-104..T-117 marcados según hito.
- `MIGRATION.md`: cerrar Fase 14 con bitácora detallada por hito, sub-secciones 14.1 / 14.2 / 14.3 / 14.4.

### Backend (`ecommerceGTBackEnd/docs/`)
- `API_REFERENCE.md`: documentar el nuevo shape `{ code, message, params }` y la convención de `locale` en body. Listar los endpoints migrados.
- `GLOSSARY.md`: entradas para "Locale", "Sub-path routing", "Error code".
- (no toca `SCHEMA.md` — esta fase no agrega tablas).

---

## Riesgos / edge cases

| Riesgo | Mitigación |
|---|---|
| Codex toca todo en un commit gigante | Plan exige granularidad — uno por archivo en hito 14.2, uno por namespace en 14.3. |
| `react-i18next` y `next-intl` viven juntos y entran en conflicto | Convivencia limitada a hitos 14.1+14.2. Bundles independientes. Tests confirman. |
| Next 13.4.6 no permite layouts sin `<html>` en root | Codex valida en el hito 14.1; si falla, escalar a actualizar Next a 13.5+. **Bloqueo conocido**. |
| Cookie `NEXT_LOCALE` colisiona con la cookie de cookie-consent | Nombres distintos — sin colisión. Verificar en hito 14.1. |
| URLs viejas (sin locale) en backlinks externos rompen | Middleware redirige `/publications/123` → `/es/publications/123`. Verificar en T-104. |
| Fase 11.2 (pasarela de pago) corre en paralelo y mete strings nuevos hardcoded | Si Fase 11.2 entra primero, sus strings entran al sweep de hito 14.3. Si entra después, debe seguir el patrón ya establecido. **Decisión:** Fase 14 cierra antes de empezar 11.2. |
| Plantillas de email se duplican por locale → mantenimiento doble | Aceptado. Alternativa (extraer cuerpo de email a archivos `.hbs` o `mjml`) queda para futuro. |
| Páginas de error 404 / 500 con locale | Hito 14.1 incluye un `[locale]/not-found.tsx`. El catch-all `[...not_found]/` queda para URLs sin locale válido. |

---

## Out of scope (explícito — no hacer aquí)

- ❌ Columna `cus_locale` en BD. Difiere; lo pasamos por body por ahora.
- ❌ Tercer idioma (k'iche', portugués, etc.). Solo es/en.
- ❌ A/B testing de copy traducido. Otra fase.
- ❌ Traducciones generadas por IA en runtime. Estáticas en JSON.
- ❌ RTL languages (árabe, hebreo). Out.
- ❌ Notificaciones push localizadas (Fase 11/12 lo verá si llega).

---

## Estimación

| Hito | Estimación Codex |
|---|---|
| 14.1 Setup | ~6h |
| 14.2 Migración base | ~3h |
| 14.3 Contenido nuevo (Fases 5–11) | ~12–16h (es el grueso) |
| 14.4 Backend + emails + SEO | ~5h |
| **Total** | **~26–30h Codex** (3–4 días concentrados) |

Si pasa de 40h, escalar a Claude para revisar arquitectura.

---

## Handshake — Commits sugeridos por hito

### 14.1
```
feat(fase14.1): install next-intl y setup routing
feat(fase14.1): middleware combina auth + intl
feat(fase14.1): mover app/ a app/[locale]/
feat(fase14.1): NextIntlClientProvider en [locale]/layout.tsx
feat(fase14.1): messages/es y messages/en con common+auth iniciales
feat(fase14.1): selector de idioma en header
test(fase14.1): T-104..T-108 middleware y rendering
docs(fase14.1): FRONTEND_STRUCTURE + ARCHITECTURE
```

### 14.2
```
refactor(fase14.2): migrar ForgotForm a next-intl
refactor(fase14.2): migrar RegisterForm a next-intl
refactor(fase14.2): migrar HeaderTwo a next-intl
refactor(fase14.2): migrar HeaderOne a next-intl
chore(fase14.2): eliminar react-i18next, i18next y src/i18n.js
test(fase14.2): T-109..T-111
docs(fase14.2): cierre del hito en MIGRATION
```

### 14.3
```
feat(fase14.3): namespace messages — extracción
feat(fase14.3): namespace support — extracción
... (uno por namespace, ~10 commits)
feat(fase14.3): useDateFmt helper + reemplazos
test(fase14.3): T-112..T-114
docs(fase14.3): cierre del hito en MIGRATION
```

### 14.4
```
feat(fase14.4): backend emailTemplates helper bilingüe
refactor(fase14.4): migrar transp.sendMail a renderEmail
feat(fase14.4): error codes con params en endpoints clave
feat(fase14.4): frontend pasa locale a endpoints con email
feat(fase14.4): sitemap.ts emite es+en con hreflang
feat(fase14.4): robots.ts disallow por locale
test(fase14.4): T-115..T-117
docs(fase14.4): API_REFERENCE + GLOSSARY backend, MIGRATION frontend
```

Cada commit con:
```
ref docs/phases/phase-14-i18n-next-intl.md
Hito: 14.N
Decisiones aplicadas: D-1=B, D-2=A, D-3=A, D-4=A, D-5=A, D-6=B, D-7=B, D-8=B, D-9=B, D-10=A, D-11=B
Bloqueos: <ninguno | descripción>
```

---

## Bloqueos a reportar inmediatamente (NO seguir, escalar a Claude)

- ❌ Next 13.4.6 no admite layouts sin `<html>` en root → **necesita upgrade**.
- ❌ Build de Next falla por incompat con `next-intl` o con alguna dep transitiva.
- ❌ `messages/` no se está cargando en server components (mensaje "MISSING_MESSAGE").
- ❌ Sub-paths rompen el comportamiento de `next/link` en componentes que aún usan `next/link` puro.
- ❌ Cookie `NEXT_LOCALE` no persiste en producción (SameSite/Secure flags).

Reportar con:
```
BLOQUEO Fase 14.X
Síntoma: ...
Reproducción: ...
Qué intenté: ...
```
