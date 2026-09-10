# Revisión de esquema — qué hay acá y cómo usarlo

Dos scripts que no modifican nada por sí solos y un registro de lo que salió al
revisar la base para el salto a Centroamérica.

| Archivo | Qué hace |
|---|---|
| `auditoria-esquema.sql` | Le pregunta a la BD viva qué tablas e índices le faltan. Seis `SELECT`, cero escrituras. |
| `indices-recomendados.sql` | Los `CREATE INDEX CONCURRENTLY` para lo que la auditoría marque ALTA. |

```bash
psql "$DATABASE_URL" -f docs/db/auditoria-esquema.sql        # diagnóstico
psql "$DATABASE_URL" -f docs/db/indices-recomendados.sql     # solo lo que salga faltando
```

Ambos quedaron probados contra PostgreSQL 16 cargando el `database.sql` del
backend: la auditoría corre limpia y los índices se crean sin error.

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
