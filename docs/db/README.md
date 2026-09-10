# Revisión de esquema — qué hay acá y cómo usarlo

Dos scripts que no modifican nada por sí solos y un registro de lo que salió al
revisar la base para el salto a Centroamérica.

| Archivo | Qué hace | Dónde corre |
|---|---|---|
| `auditoria-pgadmin.sql` | Misma auditoría en **una sola consulta**. | pgAdmin, DBeaver, cualquier GUI |
| `auditoria-esquema.sql` | Le pregunta a la BD qué tablas e índices le faltan. Seis `SELECT`. | solo `psql -f` |
| `indices-recomendados.sql` | Los `CREATE INDEX CONCURRENTLY` para lo que salga ALTA. | ambos |
| `revisar-historial-backend.sh` | Quién agregó cada tabla al `database.sql`, y qué se quedó afuera. | clon del backend |

**Desde pgAdmin:** abrí el Query Tool, pegá `auditoria-pgadmin.sql` completo y
ejecutá (F5). Todo sale en una grilla, ordenado por prioridad.

**Desde la terminal:**

```bash
psql "$DATABASE_URL" -f docs/db/auditoria-esquema.sql        # diagnóstico
psql "$DATABASE_URL" -f docs/db/indices-recomendados.sql     # solo lo que salga faltando
```

Las dos auditorías son de solo lectura: consultan los catálogos del sistema y no
tocan ninguna tabla.

Hay dos versiones porque `auditoria-esquema.sql` usa `\echo`, que es un
meta-comando de psql y en pgAdmin da error; y porque las GUI muestran nada más
la última grilla cuando mandás varios `SELECT` de una, así que las primeras
cinco secciones se perderían sin que nadie lo note.

Todo quedó probado contra PostgreSQL 16 cargando el `database.sql` del backend:
las auditorías corren limpias y los 12 índices de prioridad alta se crean y
desaparecen del reporte al repetirlo.

> Ninguna de las dos usa `regclass::text` para nombrar tablas. Ese cast incluye
> el esquema o no según el `search_path` de la conexión, así que el join contra
> la lista de columnas calientes fallaba en silencio y marcaba **todo** como
> prioridad baja — `messages.receiver_id` incluido. Ahora se resuelve por
> `pg_class.relname`, que no depende de la conexión. Si adaptás estas consultas,
> no vuelvas a `regclass`.

## Por qué hace falta preguntarle a la BD

No hay runner de migraciones. Cada fase se aplicó a mano con `ALTER`/`CREATE`
sueltos anotados en `MIGRATION.md`, y ese registro **no está completo**:
`referrals` y `ad_credit_movements` existen en la base viva —`docs/PENDIENTES.md`
§B5 razona sobre sus columnas— pero no aparecen en ningún bloque SQL de
`MIGRATION.md`. Si dos tablas se escaparon del registro, puede haber más.

Por eso la sección 2 de la auditoría lista **tablas que están en la BD y no
figuran en ninguna documentación**. Esa consulta es la que contesta "¿qué creó
otro dev que yo no tengo anotado?", y no depende de que mi inventario esté
completo.

## Quién agregó qué

`revisar-historial-backend.sh` se corre sobre un clon del backend, no sobre la
base:

```bash
git fetch --depth=1000 origin master     # si el clon es shallow
./docs/db/revisar-historial-backend.sh /ruta/a/ecommerceGTBackEnd
```

Contesta cuatro cosas que el estado final del archivo no dice: quién tocó
`database.sql`, qué commit introdujo cada tabla, qué tablas consulta el código
sin que el script las defina —esas existen solo en la base de quien las creó a
mano y se pierden al instalar en limpio— y qué índices se prometieron en un
mensaje de commit sin llegar nunca al archivo.

Sobre el historial que llega hasta el 2026-05-12 (remote personal viejo):

- **cmiche (Cristóbal Miche)** creó `database.sql` completo el 24-abr en un solo
  commit (`3190aae`): las 19 tablas fundacionales — catálogos, `customer`,
  `business`, `publications`, `subscriptions`. **No volvió a tocar el archivo.**
- **Aurelio** agregó las 5 siguientes entre el 29-abr y el 12-may:
  `messages`, `publications_comments`, `comment_reports`, `seller_ratings`,
  `comment_likes`.
- **julio (jcgomez96)** nunca tocó `database.sql`.
- Ningún DDL escondido en `.js`, y `database.sql` fue siempre el único `.sql`.

El commit `01096d7` anuncia en su mensaje "Inclusión del índice
`idx_messages_pub_id`". `git log -S` sobre todo el historial confirma que ese
índice **nunca se escribió**. Es la razón concreta por la que `messages` no
tiene un solo índice hoy: se dio por hecho.

## Inventario esperado

42 tablas en el esquema `ecom`: 24 del `database.sql` original, 16 agregadas
entre las fases 6 y 22, y 2 (`referrals`, `ad_credit_movements`) que solo
aparecen en `PENDIENTES.md`. La auditoría trae la lista con la fase que creó
cada una.

## Índices que faltan sin importar el estado de la BD

Postgres **no** indexa la columna que referencia en una llave foránea. Solo el
lado referenciado necesita un índice único; el que apunta queda sin nada salvo
que se cree a mano. Ninguna de las FK del `database.sql` original lo tiene.

Las que pesan, verificadas contra las queries de `connPostgresDB.js`:

- **`messages`** — sin un solo índice. `getUnreadCount` (`WHERE receiver_id = $1
  AND is_read = false`) corre en cada poll del globito rojo y hoy es un scan
  secuencial completo. `getInbox` filtra `sender_id = $1 OR receiver_id = $1` y
  además corre una subconsulta correlacionada por conversación: varios scans de
  la tabla entera por cada carga de la bandeja.
- **`publications_favorites`** — `getPublications` resuelve `isFavorite` con una
  subconsulta correlacionada que se ejecuta **una vez por fila del listado**. El
  costo crece con el producto de las dos tablas, no con la suma.
- **`publications_images.pub_id`** — `INNER JOIN` en todo listado, más la
  subconsulta de imagen principal.
- **`publications.cus_id`**, **`publications_detail.cit_id`/`tow_id`**,
  **`publications_comments.cus_id`**, **`seller_ratings.seller_id`/`pub_id`**.

Hoy no se nota porque el volumen es chico. Son scans: el tiempo crece con las
filas, y se nota justo cuando entra tráfico.

> Aparte, `getPublications` trae **todas** las publicaciones sin `LIMIT` ni
> paginación (`ORDER BY p.pub_id`, sin corte). Los índices ayudan a los JOIN,
> pero el listado completo en cada carga es un problema de la query, no del
> esquema. Paginar es lo que de verdad lo arregla.

## Lo que falta para USD y Centroamérica

**Moneda.** `publications_detail.pubdet_currency varchar(3) DEFAULT 'GTQ'` se
agregó en la Fase 5 y el frontend ya la respeta (`formatPrice(price, currency)`).
Lo que no existe todavía:

- `pubdet_price_alt` / `pubdet_currency_alt` — precio dual Q ⇄ US$. Los tipos del
  frontend ya los declaran (`src/types/api.ts`, `priceAlt`/`currencyAlt`) y están
  marcados **PENDIENTE en backend**. Hoy se leen defensivamente y siempre vienen
  vacíos.
- `subscriptions.sub_currency` — `sub_price numeric(10,2)` no dice en qué moneda
  está. Los planes se muestran con `$` en el frontend por decisión de UI
  (`TODO(currency-plan)`), no porque la BD diga USD. El admin ya puede cambiar el
  símbolo con la key `plans_currency` de `platform_config`, pero eso cambia cómo
  se ve, no lo que vale.
- Pauta — `ad_campaigns.budget`, `spent` y `customer.cus_ad_credit` son
  `NUMERIC(10,2)` sin moneda. Las tarifas de `platform_config`
  (`ad_impression_cost`, `ad_click_cost`, `ad_min_budget`) están descritas en
  quetzales en su propio campo `description`. Un crédito de pauta acumulado en Q
  y gastado en US$ vale 7.8 veces de más.

**Geografía.** `cat_country` tiene una sola fila: Guatemala (`cou_id = 502`,
`GTQ`), con 22 departamentos y 330 municipios colgando. La estructura ya soporta
más países —`cat_city.cou_id` es FK a `cat_country`— pero no hay datos de
ninguno, y `502` está hardcodeado en al menos cuatro componentes del frontend
(`PublicationsBar`, `PublicationsMain`, `PautaMain`, `PersonalInfoTab`). El mapa
depende de `src/utils/gtMunicipalityCoords.ts`, que solo trae coordenadas de
municipios guatemaltecos.

**Precisión.** `numeric(10,2)` tope en 99,999,999.99. Alcanza para inmuebles en
ambas monedas; no es un bloqueante.

## Lo que esta revisión no pudo ver

El esquema autoritativo vive en `techmindsgt/ecommerceGTBackEnd`
(`database.sql` + `docs/SCHEMA.md`), que esta sesión no alcanza. Lo de acá se
reconstruyó desde `MIGRATION.md`, `docs/PENDIENTES.md`, los tipos del frontend y
el `database.sql` del remote personal viejo, congelado en la Fase 4.4 (mayo
2026) — 24 tablas y 4 índices, sin nada de la Fase 6 en adelante.

Nada de esto afirma qué le falta a tu base concreta. Eso lo contesta la
auditoría corriendo contra ella.
