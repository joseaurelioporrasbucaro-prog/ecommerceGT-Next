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

### A5 · Rotar `DB_PASSWORD` 🔴

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

### B2 · "Continuar con Google" (OAuth) 🟡

Lo que hay que decidir antes de programar:

- **Vinculación de cuentas**: si `juan@gmail.com` ya existe con contraseña y
  luego entra con Google, ¿es la misma cuenta? Casi siempre sí, pero hay que
  decidirlo — es donde más se equivoca la gente.
- **`cus_password` es obligatoria** en el esquema: una cuenta de Google no
  tiene. Hay que permitir el nulo o marcar el origen de la cuenta.
- **La app móvil usa un flujo OAuth distinto** al del web; hay que coordinarlo.
- **Beneficio real**: para esos usuarios desaparecen el bloqueo por contraseña,
  el reset y la verificación por correo. Menos superficie que mantener.

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

## D · Deuda técnica anotada

- **CI en Node 20 (EOL)**: provoca la desincronización recurrente del
  `package-lock.json` entre npm 10 y npm 11. Alinear versiones.
- **Suite de tests**: estable en 229 desde el 2026-08-13. La intermitencia venía
  de specs que limpiaban parcialmente entre casos; el criterio ahora es
  `resetDb()` completo en `beforeEach`. Si reaparece, empezar por ahí.
