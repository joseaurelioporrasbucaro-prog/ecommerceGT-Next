# KIOSQUI — Frontend

Frontend Next.js 13 + TypeScript + React Query para KIOSQUI, marketplace inmobiliario de Guatemala.

Este repo empezó desde un scaffold de Next.js/template visual; la migración conserva el sistema visual útil del template y reemplaza la lógica por el dominio real de KIOSQUI.

Repo hermano backend: [ecommerceGTBackEnd](https://github.com/techmindsgt/ecommerceGTBackEnd).

## Quick start

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env.local` desde `.env.example`:

```bash
cp .env.example .env.local
```

Variable mínima:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

3. Levantar el backend en `http://localhost:4000`.
4. Levantar el frontend:

```bash
npm run dev
```

App local: `http://localhost:3000`.

## Scripts

```bash
npm run dev       # servidor de desarrollo
npm run build     # build de producción
npm run start     # servir build
npm run lint      # lint de Next
```

Antes de cerrar una fase funcional:

```bash
npx tsc --noEmit
npx next build
```

## Variables de entorno

| Variable | Descripción | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | URL base del backend Express. | `http://localhost:4000` |
| `NEXT_PUBLIC_SITE_URL` | URL pública para metadata/SEO cuando aplica. | `https://kiosqui.gt` en helpers SEO si no está definida |

## Stack

- Next.js 13.4 App Router.
- React 18.
- TypeScript strict.
- React Query para estado de servidor.
- Bootstrap 5 + SCSS del scaffold.
- Formik + Yup para formularios.
- `ApiFetch` con `credentials: 'include'` para cookie httpOnly del backend.

## Estructura

```text
src/
├── app/                 # Next 13 App Router; una carpeta = una ruta
│   ├── publications/    # /publications + /publications/[id]
│   ├── soporte/         # Portal de soporte
│   ├── admin/           # Portal admin
│   ├── creator-profile/ # Perfil público de vendedor
│   └── ...
├── components/          # Componentes React por feature
│   ├── publications/
│   ├── support/
│   ├── admin/
│   └── ...
├── hooks/api/           # Hooks React Query, normalmente uno por endpoint/recurso
├── types/api.ts         # Tipos de payloads/responses del backend
├── utils/
│   ├── Api.ts           # ApiFetch
│   ├── AuthContext.tsx  # Usuario logueado y logout
│   └── QueryProvider.tsx
├── layout/              # Header, sidebar, footer, wrappers
├── elements/            # Componentes genéricos del template
├── style/               # SCSS global del scaffold + overrides
└── data/                # Datos estáticos heredados del template o placeholders
```

## Convenciones

- Un endpoint o recurso remoto debe tener hook en `src/hooks/api/useX.ts` cuando se reutiliza.
- Tipos de backend viven en `src/types/api.ts`.
- Componentes que usan hooks/estado deben declarar `"use client"`.
- Páginas en `app/` normalmente montan un componente `Main` dentro de `DefaultWrapper` o un wrapper específico.
- Rutas privadas se agregan en `src/middleware.ts`.
- Errores de `ApiFetch`: `e instanceof ApiError ? e.message : 'Error inesperado'`.
- Estilos: Bootstrap + SCSS del scaffold. No Tailwind, no MUI.
- Strings nuevos visibles al usuario van en español.

## Documentación adicional

- [AGENTS.md](AGENTS.md) — reglas inmutables del proyecto. Leer primero.
- [MIGRATION.md](MIGRATION.md) — bitácora histórica completa.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — arquitectura cross-repo.
- [docs/FRONTEND_STRUCTURE.md](docs/FRONTEND_STRUCTURE.md) — tour de carpetas y patrones frontend.
- [docs/TEST_PLAN.md](docs/TEST_PLAN.md) — batería T-NN manual/automatizada.
- [docs/GIT_GUIDE.md](docs/GIT_GUIDE.md) — flujo de git.
- [docs/phases/](docs/phases/) — planes de fases.
- [Backend API Reference](https://github.com/techmindsgt/ecommerceGTBackEnd/blob/master/docs/API_REFERENCE.md) — endpoints del backend.
- [Backend Schema Reference](https://github.com/techmindsgt/ecommerceGTBackEnd/blob/master/docs/SCHEMA.md) — schema de PostgreSQL.

## Despliegue

Frontend desplegado en Vercel desde la rama principal del repo. El backend corre separado en Render y se configura con `NEXT_PUBLIC_API_URL`.

Para producción con dominios distintos, revisar CORS/cookies del backend (`CORS_ORIGINS`, `SameSite`, `Secure`) antes de publicar.

## Referencia del scaffold original

El proyecto fue bootstrapped como app Next.js. Documentación base:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js deployment documentation](https://nextjs.org/docs/deployment)
