# Qué encender en producción

> Todo lo que hoy está **apagado o en su valor de desarrollo** y hay que activar
> al salir a producción. Cada fila dice qué pasa si se omite, porque casi
> ninguna de estas cosas falla ruidosamente: fallan en silencio.
>
> Inventario hecho leyendo el código (`process.env` de los dos repos), no de
> memoria. Última revisión: **2026-08-13**.
>
> Complementa a [`DEPLOY.md`](./DEPLOY.md) (cómo se despliega) y
> [`PENDIENTES.md`](./PENDIENTES.md) (qué falta construir).

---

## Orden

No es una lista para hacer en cualquier orden. Algunas dependen de otras:

1. **Dominios primero.** `COOKIE_SAMESITE` y `CORS_ORIGINS` dependen de qué
   dominio termine teniendo cada servicio.
2. **Secretos y base**, incluida la rotación de la contraseña.
3. **Dockerfile y migraciones**, antes del primer deploy que las necesite.
4. **Rendimiento y rate limiting.**
5. **HSTS al final**, y de a poco. Es lo único de esta lista que no se puede
   deshacer.

---

## 1 · Render (backend)

### 1.1 · Lo que cambia el comportamiento de todo

| Variable | Hoy | En producción | Si no se pone |
| --- | --- | --- | --- |
| `NODE_ENV` | `development` | **`production`** | La cookie sale sin `Secure` y `TRUST_PROXY` cae a `false`. Es la que activa los defaults seguros del resto. |
| `TRUST_PROXY` | `false` | **`1`** (solo Render) · `2` (Cloudflare → Render) | Con `false` en Render, Express ve la IP del proxy en todos los requests y trata a internet entero como un solo cliente: **el primer límite alcanzado bloquea a todos**. Con un número de más, el límite se evade otra vez. Nunca `true`. |
| `TRUST_CF_IP` | `false` | `true` **solo** si hay Cloudflare **y** el origen está cerrado al acceso directo | Si se prende sin cerrar el origen, alguien salta Cloudflare e inyecta el header a mano. |

Verificar en los logs de arranque:

```
@@TRUSTPROXY@@--> 1 | rate limit: ON
```

### 1.2 · Cookie de sesión y dominios

| Variable | Hoy | En producción |
| --- | --- | --- |
| `CORS_ORIGINS` | `http://localhost:3000` | **El dominio real del frontend**, ej. `https://kiosqui.com`. Coma para separar varios. |
| `CLIENT_URL` / `FRONTEND_URL` | `http://localhost:3000` | El dominio real. **Se usa para armar los links de los correos** (verificación, recuperación, encuestas): si quedan en localhost, los correos llegan con links rotos. |
| `COOKIE_SAMESITE` | sin poner (`lax`) | `lax` si el backend queda bajo `kiosqui.com` (ej. `api.kiosqui.com`). **`none`** si vive en otro dominio (`…onrender.com` contra `…vercel.app`). |
| `COOKIE_SECURE` | sin poner | **No hace falta ponerla**: se prende sola con `NODE_ENV=production`. Solo para forzarla al probar contra prod desde local. |

> Con `COOKIE_SAMESITE=none`, `Secure` se fuerza en código: los navegadores
> rechazan `SameSite=None` sin él.
>
> **Si el dominio no coincide y `sameSite` queda en `lax`, el login devuelve 200
> y todo lo demás 401.** Es el error más difícil de diagnosticar de esta lista.

### 1.3 · Secretos

| Variable | Hoy | En producción |
| --- | --- | --- |
| `JWT_SECRET` | `change-me` | **Cadena larga y aleatoria.** Firma las sesiones: con el valor de ejemplo, cualquiera falsifica la sesión de cualquier usuario. |
| `JWT_EMAIL_SECRET` | `change-me` | Otra cadena distinta. Firma los tokens de verificación y encuestas. |
| `CRYPTO_SECRET` | el de ejemplo | Otra distinta, 64 hex. |
| `DB_PASSWORD` | — | **Rotarla.** Hasta el 2026-08-13 el backend la imprimía en stdout al arrancar: quedó escrita en el historial de logs de Render de todos los deploys anteriores. Quitar el log no des-filtra lo que ya se escribió. |
| `BCRYPT_ROUNDS` | `10` | `10` está bien. **Nunca bajarlo**: los tests usan `4` por velocidad y ese valor no debe llegar a producción. |
| `TURNSTILE_SECRET_KEY` | — | La real de Cloudflare. Sin ella el captcha de `/contact` no valida. |

Generar secretos:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 1.4 · Correo

`MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_SECURE`, `MAIL_FROM`
(o los `EMAIL_USER`/`EMAIL_PASS` legacy), más `SUPPORT_EMAIL`, `SALES_EMAIL`,
`ALERT_EMAIL`, `TECHMINDS_CONTACT_EMAIL`.

Sin esto no salen: verificación de cuenta, recuperación de contraseña,
notificaciones e invitaciones de empresa. **La app no se cae — los correos
simplemente no llegan.**

### 1.5 · Rendimiento

| Variable | Valor | Por qué |
| --- | --- | --- |
| `UV_THREADPOOL_SIZE` | nº de núcleos del plan | **No va en `.env`, es del proceso**: se pone en el dashboard de Render. Sharp corre sobre el threadpool de libuv, que por defecto son 4 hilos sin importar los núcleos. Medido: `/upload` pasa de 9.0 a 15.3 req/s. |
| `DB_POOL_MAX` | `20` | Medido: de ahí para arriba el throughput no sube y la latencia de cola empeora. **`DB_POOL_MAX` × instancias tiene que quedar por debajo del tope de conexiones del plan de Postgres** (los de Render arrancan en ~22), dejando margen para migraciones y `psql`. |
| `IMAGE_QUEUE_CONCURRENCY` | `2` | Subirlo devuelve el problema que la cola vino a resolver: procesar imágenes le roba CPU a quien navega. |
| `MAP_CACHE_TTL_MS` | `60000` | El default. |
| `LOG_LEVEL` | `info` | |

### 1.6 · Rate limiting

`RATE_LIMIT_ENABLED` **se prende sola** fuera de `NODE_ENV=test`. Los topes
(`RATE_LIMIT_*_MAX`) tienen defaults calibrados contra el tráfico real; ver
`ecommerceGTBackEnd/docs/RATE_LIMITS.md`. Solo tocarlos con una medición
adelante.

### 1.7 · HSTS — **al final, y por etapas**

| Variable | Hoy | Cuándo |
| --- | --- | --- |
| `HSTS_MAX_AGE` | `0` (apagado) | Recién con el dominio definitivo sirviendo por HTTPS. |
| `HSTS_INCLUDE_SUBDOMAINS` | `false` | Solo si **todos** los subdominios tienen HTTPS. |

Es la única cabecera de esta lista que **el usuario no puede deshacer**: el
navegador se la guarda por `max-age` segundos y si el dominio queda sin HTTPS
válido, no hay forma de entrar ni de decirle que afloje.

1. `HSTS_MAX_AGE=300` (5 min) → verificar un día que nada se rompa.
2. `HSTS_MAX_AGE=31536000` (1 año).
3. Recién ahí, subdominios.

### 1.8 · Cosas que no son variables

- **Dockerfile.** No existe todavía. Sin él faltan `ffmpeg`/`ffprobe` (historias
  de video → `/upload-story` responde 503) y `gs` (el RTU se guarda sin
  comprimir, degradación silenciosa).
- **Migraciones SQL.** Correr las de `ecommerceGTBackEnd/docs/sql/`. Con
  **backup previo** de la base.
- **Almacenamiento de imágenes.** Mientras no esté R2, cada deploy borra
  `uploads/`. Ver `PENDIENTES.md` §A1. Mitigación provisional: disco persistente
  de Render montado en `uploads/`.

---

## 2 · Vercel (frontend)

Son tres, y las tres son `NEXT_PUBLIC_`, o sea que **van al bundle y las ve
cualquiera**. Ningún secreto acá.

| Variable | Hoy | En producción | Si no se pone |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | El dominio real del backend, ej. `https://api.kiosqui.com` | El sitio carga pero **ninguna llamada al backend funciona**: en producción el navegador ni siquiera deja pedir `http://localhost` desde una página HTTPS. |
| `NEXT_PUBLIC_SITE_URL` | — | El dominio del sitio, ej. `https://kiosqui.com` | Sitemap, JSON-LD y las tarjetas de Open Graph salen con URLs mal formadas. No rompe la navegación, sí el SEO y cómo se ve al compartir. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | la de testing | La sitekey real de Cloudflare | El captcha de `/contact` aprueba siempre. |

> El `TURNSTILE_SECRET_KEY` va **en Render, no acá**. La sitekey es pública; el
> secret no. Si se cruzan, el captcha deja de servir.
>
> `NEXT_PUBLIC_*` se hornea en el build: cambiarlas exige **redeploy**, no basta
> con guardar en el dashboard.

---

## 3 · Verificación después de encender

En este orden, porque cada uno depende del anterior:

1. **Arranque** — en los logs de Render: `@@TRUSTPROXY@@--> 1 | rate limit: ON`.
2. **Cabeceras** — `curl -sI https://api.kiosqui.com/publications?limit=1`
   debe traer `x-content-type-options: nosniff` y `x-frame-options: DENY`.
3. **Login de punta a punta** — entrar desde el sitio real y **recargar**. Si
   vuelve a pedir sesión, es `COOKIE_SAMESITE` (§1.2). El síntoma clásico:
   el login responde 200 y todo lo demás 401.
4. **Cerrar sesión** — tiene que cerrarla de verdad. Si no, los atributos del
   borrado no coinciden con los del alta.
5. **Correo** — pedir una recuperación de contraseña y confirmar que **el link
   apunta al dominio real**, no a localhost.
6. **Subir una imagen** — y volver a verla después de un redeploy. Si
   desapareció, es lo de `uploads/` efímero (§1.8).
7. **HSTS**, recién cuando 1–6 estén verdes.
