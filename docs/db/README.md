# Revisión de esquema — qué hay acá y cómo usarlo

Herramientas para contestar una pregunta: **¿mi base está al día con lo que el
código espera?** Y el resultado de hacérsela a la base local el 2026-09-10.

| Archivo | Qué hace | Dónde corre |
|---|---|---|
| `comparar-con-database-sql.sh` | **La respuesta completa.** Crea un Postgres temporal con el `database.sql` del backend y lo compara contra tu base: esquema y catálogos. | terminal |
| `migracion-2026-09-10.sql` | Pone una base existente al día con `database.sql` @ `ee9df52`. Idempotente, en una transacción. | pgAdmin o `psql -f` |
| `indices-recomendados.sql` | 9 índices de rendimiento que **no** están en `database.sql`. `CONCURRENTLY`, uno por uno. | `psql -f`, o pgAdmin de a uno |
| `auditoria-pgadmin.sql` | Diagnóstico rápido en **una sola consulta**. | pgAdmin, DBeaver, cualquier GUI |
| `auditoria-esquema.sql` | El mismo diagnóstico en seis `SELECT`. | solo `psql -f` |
| `revisar-historial-backend.sh` | Quién agregó cada tabla al `database.sql`, y qué se quedó afuera. | clon del backend |

## Resultado de la revisión (2026-09-10)

Tu base local (`ecommercedb`) estaba **atrasada respecto del backend master**, y
de una forma que rompe el web. Todo lo que faltaba es trabajo de cmiche entre el
4-ago y el 9-sep que llegó a `database.sql` pero nunca a tu base:

| Faltaba | Commit | Qué fallaba |
|---|---|---|
| `publications.pub_origin` | `d1d0742` (11-ago) | crear publicación (`savePublication`) |
| vista `v_plan_efectivo` | `299c1eb` + `41bfb91` (3/4-sep) | gate de Subir (`checkerpub`), crear y editar publicación, Mi suscripción, equipo de empresa |
| `business.sub_id` | `299c1eb` (3-sep) | cambiar de plan, agregar/invitar/quitar empleados |
| `customer.cou_id` | `9532e41` (9-sep) | editar perfil (`updateMyBasics`, `changeInfoB`) |
| `stories`, `story_views` | `39c4d51` (4-ago) | `/stories` — solo la app mobile |

Además, cosas que no rompen pero divergen: 7 FK en `INTEGER` que el archivo
declara `BIGINT` (`fc52386`), 5 `NOT NULL`, 3 FK, un `DEFAULT 0`, 8 índices del
archivo, El Salvador (1 país, 14 departamentos, 262 municipios) y el typo
`Bloqueda`.

Lo que **no** faltaba: ninguna tabla huérfana, ninguna tabla tuya que el archivo
no conozca, y `referrals`, `ad_credit_movements`, `company_invitations` y
`publications_images_glb` están en los dos lados.

**Cómo se verificó `migracion-2026-09-10.sql`:** sobre una copia de tu base
(`pg_dump` → Postgres temporal), corrida dos veces. Después de aplicarla, la copia
queda idéntica a una base creada desde cero con `database.sql`: mismo esquema y
las 688 filas de catálogo iguales. Tus datos pasaban todas las restricciones
nuevas (cero nulos y cero huérfanos) antes de escribirla.

## Cómo saber si tu base está al día

```bash
cd "/Users/joseaurelioporras/Documents/Proyectos Git /ecommerceGTBackEnd" && git fetch origin master
cd "/Users/joseaurelioporras/Documents/Proyectos Git /ecommerceGT-Next"
./docs/db/comparar-con-database-sql.sh "/Users/joseaurelioporras/Documents/Proyectos Git /ecommerceGTBackEnd"
```

Toma la conexión del `.env` del backend (o de `PGHOST`/`PGDATABASE`/… si están
definidas) y nunca imprime la contraseña. A tu base solo le hace `SELECT`, en una
sesión de solo lectura. El Postgres temporal corre en `127.0.0.1:55439` y se
borra al terminar; si el puerto está ocupado, `REF_PORT=55440`.

Sale con código 0 si no hay diferencias. `<` es lo que dice `database.sql` y a tu
base le falta; `>` es lo que tu base tiene y el archivo no.

Ojo con las comillas: el directorio se llama `Proyectos Git ` **con un espacio
al final**, así que sin comillas bash parte la ruta en dos.

Este script reemplaza a las auditorías para la pregunta "¿qué me falta?": no
depende de ninguna lista escrita a mano. Las auditorías siguen sirviendo para
pgAdmin y para la prioridad de los índices, pero su inventario hay que
mantenerlo cuando `database.sql` sume algo.

## Por qué `database.sql` es la referencia

No hay runner de migraciones: cada fase se aplicó a mano con `ALTER`/`CREATE`
sueltos. Hasta el 2026-09-09 el archivo ni siquiera corría desde cero (moría
contra sus propias secuencias legacy). cmiche lo arregló y lo dejó idéntico a su
base de desarrollo —`36b5418`, `fc52386`, `33b24c8`—, y la suite del backend
(399 tests) corre contra una base recreada desde él. Desde ahí, **lo que dice
`database.sql` es lo que el código espera.**

`MIGRATION.md` del frontend no sirve como inventario: le faltan tablas.

Dos trampas al adaptar estas consultas:

- **No uses `conrelid::regclass::text` para nombrar tablas.** Incluye el esquema
  o no según el `search_path` de la conexión, y un join contra una lista de
  nombres falla en silencio. Usá `pg_class.relname`.
- **`\echo` y varios `SELECT` seguidos no sirven en pgAdmin.** Es meta-comando de
  psql, y las GUI muestran solo la última grilla. Por eso hay dos auditorías.

## Quién agregó qué

```bash
./docs/db/revisar-historial-backend.sh "/Users/joseaurelioporras/Documents/Proyectos Git /ecommerceGTBackEnd"
```

**No le pases `git fetch --depth=N`**: sobre un clon completo eso lo vuelve
shallow y trunca el historial. El script detecta el caso y avisa.

Sobre el historial completo (2026-02-18 → 2026-09-10, `techmindsgt`):

- **cmiche** creó `database.sql` el 24-abr (`3190aae`) con las 19 tablas
  fundacionales. Volvió a él en agosto: `publications_images_glb` (29-may),
  `stories` y `story_views` (4-ago), `pub_origin` (11-ago), plan por empresa y
  `v_plan_efectivo` (3/4-sep), y la tanda del 9-sep que hizo que el archivo
  corra desde cero y cargó El Salvador.
- **Aurelio** agregó las otras 24 tablas entre el 29-abr y el 13-jun:
  mensajería, comentarios, reseñas, notificaciones, seguidores, empresa,
  verificación, soporte, pauta, auditoría, pagos, amenidades, recuperación de
  contraseña y referidos.
- **julio (jcgomez96)** nunca tocó `database.sql`.
- **Ninguna tabla huérfana**: todo lo que el código consulta está definido en el
  archivo.
- El commit `01096d7` anuncia el índice `idx_messages_pub_id`, que **nunca se
  escribió**. Por eso `messages` no tiene un solo índice fuera de la PK, y es la
  tabla del inbox y del contador de no leídos. `idx_messages_conversation`, en
  `indices-recomendados.sql`, lo cubre.

Dos arreglos del 2026-09-10 al script: la sección 2 no rastreaba ninguna tabla
porque el git de macOS no soporta `\b` en `-G`, y la sección 3 listaba palabras
de comentarios ("con", "de", "contra") como tablas faltantes y no reconocía
vistas ni CTEs.

## Índices de rendimiento

`indices-recomendados.sql` trae los 9 que siguen haciendo falta según las queries
**actuales** de `connPostgresDB.js`: 4 de `messages`, 2 de
`publications_favorites`, `publications (cus_id, pub_create_date)`,
`seller_ratings (seller_id)` y `publications_detail (tow_id)`.

**`CREATE INDEX CONCURRENTLY` no corre dentro de una transacción.** Con
`psql -f` anda, porque psql manda cada sentencia por separado. En pgAdmin **no**:
el Query Tool manda todo el texto de una vez, Postgres lo trata como una
transacción implícita y falla con *"cannot run inside a transaction block"*
—verificado—. Ahí va de a una sentencia: seleccionarla y F5.

Estos índices no están en `database.sql`, así que si los creás solo en tu base,
`comparar-con-database-sql.sh` los va a marcar con `>` hasta que entren al
archivo. Lo que corresponde es sumarlos a `database.sql` del backend para que
los tengan todas las bases. Está anotado en `docs/PENDIENTES.md`.

Aparte: `idx_publications_pub_slug` sobra. `pub_slug` es `UNIQUE`, así que
`publications_pub_slug_key` ya es un índice idéntico, y cada INSERT mantiene dos.

> `getPublications` ya pagina server-side (`b6b23e2`), así que la advertencia
> anterior sobre listar todo sin `LIMIT` no aplica más.

## Lo que falta para USD y Centroamérica

Verificado contra el código el 2026-09-10.

**Ya está:**

- `pubdet_currency` (Fase 5) y el precio dual `pubdet_price_alt` /
  `pubdet_currency_alt` (Aurelio, `964ae3c`, 12-jun). El backend los guarda y
  los devuelve como `priceAlt`/`currencyAlt`. Los comentarios "PENDIENTE
  BACKEND" de `src/types/api.ts` están desactualizados.
- El Salvador en el catálogo del backend (`cou_id = 503`, USD), con 14
  departamentos y 262 municipios. Tu base lo tiene después de la migración.
- `customer.cou_id`: el país del perfil.

**Falta:**

- `subscriptions.sub_price` no dice en qué moneda está. El símbolo que muestra el
  web sale de `platform_config.plans_currency`, que cambia cómo se ve, no lo que
  vale.
- Pauta sin moneda: `ad_campaigns.budget`, `spent` y `customer.cus_ad_credit`
  son `NUMERIC(10,2)` pelados, y las tarifas de `platform_config` dicen "Q por
  impresión" en prosa, dentro de `description`. Un crédito acumulado en Q y
  gastado en US$ vale 7.8 veces de más.
- El filtro de precio (`priceMin`/`priceMax`) compara `pubdet_price` sin mirar
  la moneda: mezcla Q 1,000,000 con US$ 1,000,000.
- En el web, `502` está hardcodeado en `PublicationsBar`, `PublicationsMain`,
  `PautaMain` y `PersonalInfoTab`, y el mapa depende de
  `src/utils/gtMunicipalityCoords.ts`, que solo trae municipios de Guatemala.

`numeric(10,2)` topa en 99,999,999.99: alcanza para inmuebles en ambas monedas.
