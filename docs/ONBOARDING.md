# Onboarding Frontend — KIOSQUI

Guía corta para entrar al repo sin romper convenciones vivas. Para reglas
obligatorias, leer primero `AGENTS.md`; para estado de fases, leer `MIGRATION.md`.

## Setup local

1. Instalar dependencias con `npm install`.
2. Crear `.env.local` tomando `.env.example` como referencia.
3. Confirmar `NEXT_PUBLIC_API_URL` apuntando al backend local o staging.
4. Correr `npm run dev` y abrir `/es`.
5. Antes de commitear cambios de código: `npx tsc --noEmit` y `npm run build`.

## Agregar una traducción

1. Elegir namespace por dominio en `messages/<locale>/`:
   `auth`, `common`, `publications`, `profile`, `support`, `pauta`,
   `messages`, `notifications`, `admin`, `home`, `legal` o `danger`.
2. Agregar la misma clave en `messages/es/<ns>.json` y
   `messages/en/<ns>.json`.
3. En componentes client o server usar:

```tsx
const t = useTranslations('support');
t('tickets.title');
```

4. Para fechas y números, usar `src/utils/datetime.ts` o
   `src/utils/datetime.server.ts`; no usar `toLocaleDateString` con locale
   literal.
5. Si un endpoint backend devuelve `{ code, message, params }`, preferir una
   clave de traducción para `code` y usar `message` como fallback.

## Links y rutas

- Las rutas públicas viven bajo `/es` y `/en`.
- Usar wrappers de `@/i18n/navigation` cuando el componente deba preservar
  locale (`Link`, `useRouter`, `redirect`).
- Rutas privadas nuevas deben registrarse en `src/middleware.ts`.

## Emails transaccionales

Los formularios/hooks que disparan emails deben mandar `locale` en el body,
obtenido con `useLocale()` de `next-intl`. En Fase 14.4 esto aplica a recovery,
registro, invitaciones de empresa y cierre de venta.
