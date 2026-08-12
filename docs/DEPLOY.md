# Deploy — Kiosqui

> Documento cross-repo. Cubre `ecommerceGT-Next` (frontend, Vercel) y `ecommerceGTBackEnd` (backend, Render).
> Última revisión: 2026-08-11.

| Capa | Local | Producción | Repo |
| --- | --- | --- | --- |
| Frontend | `http://localhost:3000` | Vercel | `ecommerceGT-Next` (rama `main`) |
| Backend | `http://localhost:4000` | Render | `techmindsgt/ecommerceGTBackEnd` (rama `master`) |
| DB | Postgres local | Render Postgres / instancia administrada | schema en `database.sql` |

---

## ⚠️ Antes del primer deploy: leer esto

Hay tres cosas que **no fallan en local y sí en producción**. Las tres tienen que resolverse antes o durante el primer despliegue, no después.

### 1. La cookie de sesión y los dominios

`connPostgresDB.js:1391` emite la cookie así:

```js
response.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax" });
```

`SameSite=Lax` significa que el navegador **solo manda la cookie si el frontend y el backend comparten el dominio registrable**. Consecuencias:

- ✅ `kiosqui.com` (Vercel) + `api.kiosqui.com` (Render, dominio propio) → **funciona**. Mismo sitio.
- ❌ `kiosqui.vercel.app` + `kiosqui-api.onrender.com` → **el login no funciona**. Son sitios distintos: el navegador descarta la cookie y toda request autenticada responde 401, aunque el login devuelva 200.

**Por eso el backend necesita un dominio propio bajo `kiosqui.com` antes de salir a producción.** Es la opción recomendada: no requiere tocar código.

Si por lo que sea el backend tiene que vivir en otro dominio, hay que cambiar la cookie a `{ secure: true, sameSite: "none" }` — y ahí `secure: true` es obligatorio, los navegadores rechazan `SameSite=None` sin él. Ese cambio es de backend y hay que coordinarlo, porque también afecta a la app móvil.

> Además, `secure: false` debería pasar a `true` en producción en cualquier escenario: hoy la cookie de sesión puede viajar por HTTP plano.

### 2. `TRUST_PROXY` (rate limits)

En Render la app nunca ve la IP del cliente en el socket, la ve en `X-Forwarded-For`. Si `TRUST_PROXY` no coincide con la cantidad real de proxies, **los rate limits fallan en silencio**, en las dos direcciones:

- **De menos** (`false`/`0` en Render): todos los usuarios comparten la IP del proxy → el primer límite alcanzado bloquea a todo el mundo.
- **De más** (`2` con un solo proxy): el límite se evade otra vez falsificando el header.

| Topología | Valor |
| --- | --- |
| Solo Render | `TRUST_PROXY=1` |
| Cloudflare → Render | `TRUST_PROXY=2`, o mejor `TRUST_CF_IP=true` |
| Local | `TRUST_PROXY=false` |

**Nunca `true`.** Detalle completo en `ecommerceGTBackEnd/docs/RATE_LIMITS.md` §4.

Al arrancar, el backend loguea lo que quedó configurado — verificarlo en los logs de Render:

```
@@TRUSTPROXY@@--> 1 | rate limit: ON
```

### 3. El disco de Render es efímero

Render **borra el disco en cada deploy**. Todo lo que está en `uploads/` (fotos de publicaciones, avatares, portadas, historias, documentos de verificación) desaparece con cada despliegue.

Hoy no hay solución aplicada — la decisión de object storage (Cloudflare R2 / Cloudinary) sigue pendiente. Ver `docs/ALMACENAMIENTO-IMAGENES.md`. La arquitectura ya lo permite (multer en `server.js`, la BD guarda la URL), pero **mientras no se resuelva, cada deploy del backend se lleva las imágenes puestas.**

Mitigación provisional: contratar un *persistent disk* en Render y montarlo en `uploads/`.

---

## Backend — Render

### Binarios del sistema: hace falta Dockerfile

El backend depende de tres binarios que **no vienen en el runtime Node de Render**:

| Binario | Para qué | Si falta |
| --- | --- | --- |
| `ffmpeg` + `ffprobe` | Historias de video (transcodificar y partir en trozos de 15 s) | `/upload-story` responde 503; las historias de video no funcionan |
| `gs` (Ghostscript) | Comprimir el RTU en PDF de verificación | El PDF se guarda sin comprimir (degradación silenciosa, no rompe) |

Con el runtime Node nativo de Render no se pueden instalar. **Se necesita un Dockerfile** con algo del estilo:

```dockerfile
FROM node:20-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
      ffmpeg ghostscript \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 4000
CMD ["node", "server.js"]
```

> Este Dockerfile **todavía no existe en el repo** — hay que crearlo y probarlo. Sin él el backend arranca igual, pero las historias de video quedan caídas.

### Configuración del servicio

| Campo | Valor |
| --- | --- |
| Repo | `techmindsgt/ecommerceGTBackEnd`, rama `master` |
| Runtime | Docker (por ffmpeg/Ghostscript) |
| Build | `npm ci` (o el del Dockerfile) |
| Start | `node server.js` |
| Health check | `GET /` → `{"status":"ok"}` |
| Puerto | Render inyecta `PORT`; `server.js` ya lo respeta |

### Variables de entorno

Base (`.env.example` tiene la lista completa y comentada):

```
NODE_ENV=production
PORT=                      # lo inyecta Render
DB_HOST= DB_PORT= DB_DATABASE= DB_USER= DB_PASSWORD=
JWT_SECRET=                # secreto fuerte, NO el de dev
JWT_EMAIL_SECRET=
CRYPTO_SECRET=             # 64 hex
BCRYPT_ROUNDS=10
CORS_ORIGINS=https://kiosqui.com,https://www.kiosqui.com
FRONTEND_URL=https://kiosqui.com
CLIENT_URL=https://kiosqui.com
TRUST_PROXY=1              # ← ver §2 de arriba
RATE_LIMIT_ENABLED=true
TURNSTILE_SECRET_KEY=
MAIL_HOST=mail.kiosqui.com MAIL_PORT=465 MAIL_SECURE=true
MAIL_USER=noreply@kiosqui.com MAIL_PASS=
MAIL_FROM=noreply@kiosqui.com
SUPPORT_EMAIL= SALES_EMAIL= TECHMINDS_CONTACT_EMAIL=
LOG_LEVEL=info
ALERT_EMAIL=
```

`CORS_ORIGINS` es una lista separada por comas y **tiene que incluir todos los orígenes reales**: el dominio de producción, el `www`, los preview de Vercel si se usan, y el origen de la landing de Tech Minds.

### Base de datos

El schema vive en `database.sql`. Las migraciones son **manuales** — no hay herramienta de migraciones. Antes de desplegar, revisar en `MIGRATION.md` si la fase que estás subiendo trae SQL nuevo (varias fases incluyen su propio bloque `CREATE TABLE` / `ALTER TABLE`) y correrlo contra la BD de producción **antes** de que salga el código que lo usa.

---

## Frontend — Vercel

Es un Next.js 13.4.6 App Router estándar; Vercel lo detecta solo.

| Campo | Valor |
| --- | --- |
| Repo | `ecommerceGT-Next`, rama `main` |
| Framework | Next.js (autodetectado) |
| Build | `next build` |
| Install | `npm install` |
| Output | (lo maneja Vercel) |

### Variables de entorno

```
NEXT_PUBLIC_API_URL=https://api.kiosqui.com
NEXT_PUBLIC_SITE_URL=https://kiosqui.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

Las tres son `NEXT_PUBLIC_`, o sea que **se hornean en el bundle en build time**: cambiarlas exige un redeploy, no basta con guardar y reiniciar. Y no poner nada secreto ahí — viajan al navegador.

`NEXT_PUBLIC_SITE_URL` la consumen el sitemap, el JSON-LD y las OG images. Si queda mal, el SEO apunta a URLs equivocadas.

---

## Orden de un despliegue

El orden importa: el backend primero, porque el frontend asume que los endpoints ya existen.

1. **SQL** — correr las migraciones de la fase contra la BD de producción.
2. **Backend** — push a `master`; Render construye y despliega.
3. **Verificar el backend** antes de tocar el frontend:
   ```bash
   curl -s https://api.kiosqui.com/ && echo
   ```
   Y en los logs de Render: que aparezca `@@TRUSTPROXY@@--> 1 | rate limit: ON`.
4. **Frontend** — push a `main`; Vercel construye y despliega.
5. **Smoke test en producción**: login (confirma que la cookie cruza), listado de publicaciones, detalle, subir una imagen, formulario de contacto.

### Rollback

- **Vercel**: *Deployments* → el despliegue anterior → *Promote to Production*. Instantáneo.
- **Render**: *Events* → *Rollback* al deploy anterior.
- **BD**: no hay rollback automático. Si la fase trajo SQL destructivo, hace falta backup previo.

---

## Comandos locales

Backend:

```bash
npm run dev
```

Tests del backend (142 tests, requiere Postgres local — ver `tests/setup-env.js`):

```bash
npm test
```

Frontend:

```bash
npm run dev
```

---

## Checklist del primer deploy

- [ ] Dominio propio para el backend bajo `kiosqui.com` (si no, la cookie de sesión no cruza — §1)
- [ ] `secure: true` en la cookie de sesión para producción
- [ ] Dockerfile con `ffmpeg` y `ghostscript` (§ Binarios)
- [ ] `TRUST_PROXY` acorde a la topología, verificado en los logs de arranque
- [ ] Decisión de object storage, o disco persistente en Render (§3)
- [ ] `CORS_ORIGINS` con todos los orígenes reales
- [ ] Secretos de producción distintos a los de desarrollo (`JWT_SECRET`, `CRYPTO_SECRET`, `JWT_EMAIL_SECRET`)
- [ ] SQL de las fases pendientes aplicado
- [ ] Backup de la BD antes del primer deploy con migraciones
