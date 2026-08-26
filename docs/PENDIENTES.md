# Pendientes de KIOSQUI

> **Qué es esto.** La lista única de lo que falta, ordenada por consecuencia y no
> por esfuerzo. Existe porque "queda anotado" dicho en una conversación no es un
> registro: el 2026-08-13 se perdió así una fase entera de seguridad que Aurelio
> había pedido explícitamente aplazar, y una rama descartada sobrevivió dos meses
> costándole medio día al desarrollador de la app móvil.
>
> **Regla:** nada se considera "anotado" hasta que está en este archivo.
>
> Última revisión: **2026-08-13** (verificado contra el código, no de memoria).

---

## A · Bloquea el lanzamiento

Cosas que **no fallan en local y sí en producción**. Detalle completo en
[`DEPLOY.md`](./DEPLOY.md).

### A1 · Las imágenes se borran en cada deploy 🔴

El disco de Render es efímero. Todo `uploads/` —fotos de publicaciones,
avatares, portadas, historias, documentos de verificación— desaparece en cada
despliegue. En un marketplace inmobiliario la foto *es* el producto.

- **Decisión ya tomada:** Cloudflare R2 (ver [`ALMACENAMIENTO-IMAGENES.md`](./ALMACENAMIENTO-IMAGENES.md)).
  Gratis hasta 10 GB, sin cobro de egress, API compatible con S3, CDN incluida.
- **La arquitectura ya lo permite:** multer está aislado en `server.js` y la base
  guarda la URL, no el archivo.
- **De paso resuelve** la contención de CPU al subir imágenes (medida en
  `PRUEBAS_CARGA.md`) y da CDN.
- **Requiere de Aurelio:** crear la cuenta de Cloudflare y el bucket, y poner las
  credenciales en las env vars de Render.

### A2 · El login puede no funcionar en producción 🔴

`connPostgresDB.js` emite la cookie con `sameSite: "lax"` y **`secure: false`**.

- `kiosqui.com` + `api.kiosqui.com` → funciona (mismo sitio registrable).
- `kiosqui.vercel.app` + `…onrender.com` → **el navegador descarta la cookie**:
  el login devuelve 200 y todo lo demás 401.
- `secure: false` además deja viajar la sesión por HTTP plano. En producción
  tiene que ser `true` en cualquier escenario.

**Camino recomendado:** dominio propio para el backend (`api.kiosqui.com`). Es
DNS, no código. Si el backend tuviera que vivir en otro dominio, hay que pasar a
`{ secure: true, sameSite: "none" }` y coordinarlo con la app móvil.

### A3 · No hay Dockerfile 🟠

Verificado: el repo del backend no tiene ninguno. Sin él, en Render faltan:

| Binario | Para qué | Si falta |
| --- | --- | --- |
| `ffmpeg` + `ffprobe` | Historias de video | `/upload-story` responde 503 |
| `gs` (Ghostscript) | Comprimir el RTU en PDF | Se guarda sin comprimir (no rompe) |

Es también donde va `UV_THREADPOOL_SIZE` (sharp compite por los 4 hilos por
defecto de libuv).

### A4 · Configuración de Render 🟠

- **`TRUST_PROXY`**: con Render solo → `1`. Con Cloudflare delante → `2`, o
  mejor `TRUST_CF_IP=true`. **Nunca `true` a secas.** Si no coincide con la
  topología real, los rate limits fallan en silencio en las dos direcciones.
  Verificar en los logs: `@@TRUSTPROXY@@--> 1 | rate limit: ON`.
- **Migraciones SQL en prod**: confirmar que están aplicadas las de
  `ecommerceGTBackEnd/docs/sql/`. La de índices del listado
  (`2026-08-11-indices-listado.sql`) es la que sostiene el rendimiento medido.
  La de `2026-08-13-estado-pausada.sql` ya la corrió Aurelio ✅.
- **Backup de la BD** antes del primer deploy con migraciones.

### A5 · Rotar TODOS los secretos 🔴🔴 — lo más urgente de esta lista

Dos filtraciones distintas, las dos confirmadas:

**1. `info.txt` del backend, versionado desde 2026-02-20.** Tenía en texto plano
`JWT_SECRET`, `JWT_EMAIL_SECRET`, `DB_PASSWORD`, `EMAIL_USER` y una **contraseña
de aplicación de Gmail**. Verificado el 2026-08-25: las cinco eran **idénticas a
las del `.env` en uso**. Los valores ya se reemplazaron por marcadores
(commit `d31912d`), pero **eso no des-filtra nada**: siguen en el historial de
git, en cada clon y en cada copia local.

La peor no es la de la base —apunta a localhost—, es el **`JWT_SECRET`**: con él
se firma la sesión de cualquier usuario de la plataforma. Es toma de cuenta
total, sin necesidad de contraseñas.

**2. `DB_PASSWORD` en los logs de Render.** Hasta el 2026-08-13 el backend la
imprimía en stdout al arrancar. El log ya se quitó, pero quedó escrita en el
historial de logs de todos los deploys anteriores.

**Qué hay que hacer, en este orden:**

1. **Revocar la contraseña de aplicación de Gmail** — Cuenta de Google →
   Seguridad → Contraseñas de aplicaciones. Es la única con alcance **fuera** del
   proyecto: permite enviar correo como esa cuenta y las contraseñas de
   aplicación saltan el 2FA.
2. **Generar `JWT_SECRET` y `JWT_EMAIL_SECRET` nuevos**, y confirmar que
   producción **no** esté usando los mismos valores. Ojo: rotar el `JWT_SECRET`
   cierra la sesión de todos los usuarios, incluida la app móvil (tokens de 30
   días). Es el costo, y vale la pena.
3. **Rotar la contraseña de Postgres** y actualizar la env var de Render.

> Reescribir el historial de git para borrar los valores es otra decisión: es
> disruptivo para el equipo y **no sustituye la rotación**. Rotar primero.

### A5b · (histórico) Rotar `DB_PASSWORD` por los logs

Hasta el 2026-08-13 el backend imprimía la contraseña de Postgres en stdout al
arrancar. **El log ya se quitó, pero eso no des-filtra el secreto**: quedó
escrito en el historial de logs de Render de todos los deploys anteriores, que
persiste y lo ve cualquiera con acceso al dashboard.

Hay que **rotar la contraseña en Postgres** y actualizar la env var.

---

## B · Seguridad — la fase que se aplazó el 2026-08-13

Aurelio pidió tratarla como fase aparte. Esto es lo que quedó abierto.

### B1 · `POST /changeinfoc` no verificaba de quién era la empresa ✅ (2026-08-13)

El handler **nunca leía `request.user`**: tomaba `busid` del body y escribía.
Cualquiera con una cuenta podía reescribir nombre, razón comercial, dirección,
teléfono **y logo** de cualquier empresa — y como el handler borra el juego de
imágenes anterior, también le borraba el logo a la víctima. Confirmado
reabriendo el agujero contra el test: la empresa ajena quedaba renombrada.

Ahora la empresa sale del cliente de la sesión y se exige `cus_is_admin`, igual
que en `addEmployee` e `inviteExistingUser`. El `busid` se sigue aceptando en el
body para no romper al web ni a la app, pero se ignora y se registra en el log.

### B2 · "Continuar con Google" (OAuth) 🟡 — decisiones cerradas

**Decidido por Aurelio (2026-08-13):**

1. **Se unifica, no se duplica.** Si el correo de Google ya tiene cuenta, se
   entra a **esa** cuenta. Crear una segunda con el mismo correo sería absurdo.
2. **Se le pide que agregue una contraseña** después de entrar, para que no
   quede atado solo a Google.

**Lo que falta resolver antes de programar:**

- **Verificar el correo de Google antes de unificar.** Google devuelve
  `email_verified` en el token; si viniera `false` no se puede unificar, porque
  sería una toma de cuenta ajena con solo registrar ese correo en Google.
- **`cus_password` es `NOT NULL`** en el esquema. Mientras el usuario no ponga
  una, hay que permitir el nulo o marcar el origen de la cuenta
  (`cus_auth_provider`), y que el login por contraseña rechace esas cuentas con
  un mensaje claro ("entrá con Google") en vez de "contraseña incorrecta".
- **El pedido de contraseña no puede bloquear el primer ingreso**: se entra y se
  ofrece agregarla después, o media plataforma abandona en el registro.
- **La app móvil usa otro flujo OAuth** (nativo, no redirect web). Coordinarlo
  con su desarrollador antes de tocar el endpoint.
- **Interacción con el bloqueo por contraseña**: `passta_id` no aplica a quien
  entra por Google. Revisar que el login OAuth no lo consulte (ver Fase 8.3.3).

**Beneficio:** para esos usuarios desaparecen el bloqueo por contraseña, el
reset y la verificación por correo. Menos superficie que mantener.

### B3 · Comunicación "encriptada" 🟡 (código listo, falta configurarlo)

HTTPS/TLS ya encripta credenciales, cookies y cuerpo. Encriptar el payload por
encima es un antipatrón: la llave viajaría en el bundle JS.

**Hecho el 2026-08-13:**

- Los atributos de la cookie de sesión están centralizados en
  `utils/sesionCliente.js`. `secure` **se prende solo en producción**
  (`NODE_ENV`), y `sameSite` se configura con `COOKIE_SAMESITE`. Si se pone
  `none`, `secure` se fuerza: los navegadores rechazan `SameSite=None` sin él.
- El borrado usa **los mismos atributos** que el alta. Sin eso, `clearCookie`
  no borra nada en producción y el "cerrar sesión" no cierra nada.
- Se arregló que `deactivateAccount` y `deleteAccount` hacían
  `clearCookie("jwt")` — una cookie que nadie setea nunca. Desactivar la cuenta
  **no deslogueaba**: el JWT seguía en el navegador y `authMiddleware` sólo
  valida la firma, no el estado de la cuenta.
- Cabeceras `X-Content-Type-Options`, `X-Frame-Options` y `Referrer-Policy`.

**Falta configurar en Render, en este orden:**

1. `HSTS_MAX_AGE` viene en `0` (apagado) **a propósito**: es la única cabecera
   que el usuario no puede deshacer — el navegador la recuerda y si el dominio
   queda sin HTTPS válido, no hay forma de entrar. Prender recién con el
   dominio definitivo: `300` un día, después `31536000`.
2. `COOKIE_SAMESITE` según A2: `lax` si el backend queda bajo `kiosqui.com`,
   `none` si vive en otro dominio.

> **Queda abierto:** la app móvil usa `Authorization: Bearer` con tokens de 30
> días, que una cookie no borra. Desactivar la cuenta desde la app no invalida
> su token. Arreglarlo de verdad implica revocación (access + refresh, o chequeo
> de estado por request); está anotado en `utils/sesionCliente.js`.

### B4 · Inyección SQL — verificado, no hay ✅

285 consultas, todas parametrizadas con `$n`, cero concatenación. **No hace
falta sanitizar inputs para esto**: el driver manda los valores aparte del SQL.

> Lección del método: el primer grep dio cero porque solo miraba interpolaciones
> pegadas a `pool.query(`. Ese cero era falso — no veía las consultas armadas en
> funciones aparte. Con un patrón más amplio aparecieron 20 (todas legítimas) y
> apareció además un bug de prototype pollution en `?sort`, ya corregido.

Donde sí conviene validar es contra **XSS**, si algún día se renderiza contenido
de usuario como HTML. Hoy React escapa solo; el riesgo aparecería con
`dangerouslySetInnerHTML`.

---

## C · Producto

| Fase | Estado | Nota |
| --- | --- | --- |
| **11.2 · Pasarela de pago** | ⬜ | Toda la estructura está hecha (campañas, presupuesto, crédito, descuento por impresión). El cobro es un *stub*: **hoy la pauta se regala**. Es lo que convierte a Kiosqui en negocio. Falta elegir proveedor (Recurrente es el típico en Guatemala) y tener cuenta de comercio. |
| **13 · Documentación** | ⬜ | Documentación técnica en `docs/`. |
| **17 · Paleta de marca** | 🟡 parcial | Faltan WP-3 filtros, WP-5 detalle, WP-6 upload, WP-7 pricing, y Batch C. Ver `PENDING_PHASE_BRAND_KIOSQUI.md` y `KIOSQUI_BRAND_GAPS.md`. |
| **14 · i18n** | ✅ | Hecha. `next-intl` con `/es` y `/en`. |
| **8.2 · Privacidad de verificación** | ✅ | `uploads/verification` devuelve 403 y la descarga va por endpoint autenticado de soporte. |

---

### B5 · Índice único para el crédito de pauta 🟡

Los reembolsos de campaña (`setCampaignStatus`, `finalizarCampanasDePublicacion`,
`reconcileExpiredCampaignsForUser`) hacen `UPDATE cus_ad_credit + $2` directo.
Hoy cada uno está protegido por su propia transición de estado + `FOR UPDATE`, y
la creación concurrente por `pg_advisory_xact_lock`. Funciona, pero la garantía
depende de que cada camino se acuerde de su guard.

Ya existe el mecanismo correcto y no se usa acá: `ad_credit_movements`, con
`UNIQUE (reason, ref_id)` y `ON CONFLICT DO NOTHING` — idempotente por
construcción. Sólo lo usan los referidos, porque su `ref_id` tiene FK a
`ecom.referrals(id)` y no puede apuntar a una campaña.

**Qué falta:** migración que permita referenciar campañas (relajar la FK o
agregar `camp_id`), y pasar los reembolsos por ahí. Beneficio doble:
imposibilita el doble abono venga de donde venga, y da trazabilidad — hoy no hay
forma de auditar por qué el crédito de alguien vale lo que vale.

Complemento: índice único parcial
`(pub_id) WHERE camp_status IN ('active','paused')`, que haría imposible tener
dos campañas vivas por publicación aunque el código falle.

---

## D · Deuda técnica anotada

- **Labels huérfanos en los formularios de auth** 🟡 — hallazgo de los tests del
  Hito 3, confirmado: `LoginFrom.tsx` tiene `<label htmlFor="m-id">` y el input
  no tiene ningún `id`; `ForgotForm.tsx` usa `htmlFor` en tres labels y el
  archivo no tiene un solo `id=`. Consecuencia: hacer clic en la etiqueta no
  enfoca el campo, y un lector de pantalla no sabe qué campo está leyendo — o
  sea, el login es difícil de usar para alguien con discapacidad visual.
  Arreglo chico (agregar los `id` que faltan), pero toca formularios de auth,
  así que va con su propio test.

- **Automatización de pruebas** 🟡 — el frontend no tiene **ninguna**
  infraestructura de tests (0 archivos); el backend tiene 240 tests sobre ~21
  de 156 rutas. Plan por hitos para Codex en
  [`phases/plan-tests-codex.md`](./phases/plan-tests-codex.md); la revisión
  final la hace Claude.
- **CI en Node 20 (EOL)**: provoca la desincronización recurrente del
  `package-lock.json` entre npm 10 y npm 11. Alinear versiones.
- **Suite de tests**: estable en 229 desde el 2026-08-13. La intermitencia venía
  de specs que limpiaban parcialmente entre casos; el criterio ahora es
  `resetDb()` completo en `beforeEach`. Si reaparece, empezar por ahí.
