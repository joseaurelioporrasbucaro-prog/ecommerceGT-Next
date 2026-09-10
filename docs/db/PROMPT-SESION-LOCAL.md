# Prompt para una sesión local de Claude Code

> **Ya se ejecutó (2026-09-10).** El resultado y las herramientas corregidas
> están en [`README.md`](./README.md). Queda como registro de qué se pidió; para
> revisar la base de nuevo alcanza con `comparar-con-database-sql.sh`.

Copiá todo lo que está debajo de la línea y pegalo en una sesión nueva de Claude
Code corriendo en la Mac, con los dos repos accesibles.

---

Trabajo en KIOSQUI, un marketplace inmobiliario. Dos repos en la Mac:

- Frontend: `/Users/joseaurelioporras/Documents/Proyectos Git /ecommerceGT-Next`
- Backend: `/Users/joseaurelioporras/Documents/Proyectos Git /ecommerceGTBackEnd`

Ojo: el directorio se llama `Proyectos Git ` **con un espacio al final**. Citá
siempre las rutas o bash las parte en dos.

La base es PostgreSQL, esquema `ecom`, y la administro con pgAdmin. El backend
es Express y concentra las queries en `config/connPostgresDB.js`.

**Lo que necesito saber:** si mi base está al día respecto de lo que el código
espera, para seguir desarrollando tranquilo. Después viene sacar el producto a
Centroamérica con precios en dólares, pero eso es la fase siguiente.

## Contexto: qué ya se revisó y qué quedó pendiente

Una sesión anterior, corriendo en la nube, dejó cuatro herramientas en la rama
`claude/keen-tesla-ur22y5` del frontend, bajo `docs/db/`:

- `auditoria-pgadmin.sql` — auditoría completa en UNA consulta, para pgAdmin.
- `auditoria-esquema.sql` — la misma en seis `SELECT`, solo para `psql -f`.
- `indices-recomendados.sql` — los `CREATE INDEX CONCURRENTLY` que faltan.
- `revisar-historial-backend.sh` — quién agregó cada tabla al `database.sql`.

Empezá por traer esa rama:

```bash
cd "/Users/joseaurelioporras/Documents/Proyectos Git /ecommerceGT-Next"
git fetch origin claude/keen-tesla-ur22y5
git checkout claude/keen-tesla-ur22y5
cat docs/db/README.md
```

Lo que esa sesión **ya estableció** (no lo repitas):

- El backend vivió en dos remotes. El personal viejo
  (`joseaurelioporrasbucaro-prog/ecommerceGTBackEnd`) tiene la historia del
  2026-02-18 al 2026-05-12. Del 12-may en adelante todo está en
  `techmindsgt/ecommerceGTBackEnd`, que la sesión en la nube no podía alcanzar.
- En esa ventana Feb–May: **Cristóbal (cmiche, `cezequielmiche@gmail.com`) creó
  `database.sql` el 24-abr en un solo commit** (`3190aae`) con las 19 tablas
  fundacionales, y no volvió a tocarlo. Las 5 siguientes (`messages`,
  `publications_comments`, `comment_reports`, `seller_ratings`, `comment_likes`)
  son mías. Julio (`jcgomez96`) nunca lo tocó. Ninguna tabla huérfana: todo lo
  que el código consultaba estaba definido en el script.
- El commit `01096d7` anuncia en su mensaje el índice `idx_messages_pub_id`, y
  `git log -S` confirma que **nunca se escribió**. Por eso `messages` no tiene
  hoy un solo índice, y es la tabla del inbox y del contador de no leídos.
- **`MIGRATION.md` del frontend no es un inventario confiable.** `referrals` y
  `ad_credit_movements` existen en la base viva —`docs/PENDIENTES.md` §B5 razona
  sobre sus columnas— y no aparecen en ningún bloque SQL del registro. Si dos se
  escaparon, puede haber más. No asumas que ese archivo lista todo.

## Lo que te toca

**1. Cerrar el hueco del historial (12-may → hoy).**

```bash
cd "/Users/joseaurelioporras/Documents/Proyectos Git /ecommerceGTBackEnd"
git fetch origin master
cd "/Users/joseaurelioporras/Documents/Proyectos Git /ecommerceGT-Next"
./docs/db/revisar-historial-backend.sh "/Users/joseaurelioporras/Documents/Proyectos Git /ecommerceGTBackEnd"
```

**No le pases `git fetch --depth=N`.** Mi clon es completo; ese flag lo volvería
shallow y truncaría meses de historia. El script detecta el caso y avisa.

Quiero saber qué tablas nacieron después del 12-may, de quién son, y sobre todo
las dos secciones que de verdad encuentran cosas: tablas que el código consulta
sin que el script las defina, e índices prometidos en un commit que nunca
llegaron al archivo.

**2. Auditar mi base real.**

Corré `docs/db/auditoria-pgadmin.sql` contra la base. Es de solo lectura:
consulta catálogos del sistema, no toca ninguna tabla. Podés hacerlo con `psql`
tomando la conexión del `development.env` del backend (está en disco, fuera de
git). **No imprimas la contraseña ni la pegues en el chat.** Si preferís, te
paso yo la salida desde el Query Tool de pgAdmin.

**3. Cruzar las dos cosas y decirme si puedo seguir trabajando.**

El historial dice qué *debería* existir; la auditoría, qué *existe*. La
diferencia es la lista de trabajo. Quiero:

- Un sí o un no claro sobre si me falta alguna tabla que me bloquee.
- Si falta algo: el SQL de migración **en orden de dependencias** (las FK
  importan), marcando qué es urgente y qué puede esperar.
- Los índices de `docs/db/indices-recomendados.sql` que sigan faltando, con la
  advertencia de que `CONCURRENTLY` no corre dentro de una transacción.

## Dos trampas que ya costaron caro

- **No uses `conrelid::regclass::text` para nombrar tablas.** Ese cast incluye el
  esquema o no según el `search_path` de la conexión. Con el de pgAdmin devuelve
  `ecom.messages` en vez de `messages`, y un join contra una lista de nombres
  falla en silencio y clasifica mal todo sin dar error. Usá `pg_class.relname`.
- **`\echo` y varios `SELECT` seguidos no sirven en pgAdmin.** Es meta-comando de
  psql, y las GUI muestran solo la última grilla. Por eso hay dos versiones de
  la auditoría.

## Después, la fase de dólares

Cuando lo de arriba esté cerrado, lo que ya se detectó como faltante para
Centroamérica y USD:

- `pubdet_price_alt` / `pubdet_currency_alt` — precio dual Q ⇄ US$. Los tipos del
  frontend ya los declaran en `src/types/api.ts` y están marcados PENDIENTE en
  backend. `pubdet_currency` sí existe desde la Fase 5.
- `subscriptions.sub_price` no dice en qué moneda está.
- Pauta sin moneda: `ad_campaigns.budget`, `spent` y `customer.cus_ad_credit` son
  `NUMERIC(10,2)` pelados. Las tarifas de `platform_config` dicen "Q por
  impresión" en prosa, dentro del campo `description`.
- `cat_country` tiene una sola fila (Guatemala, `cou_id = 502`, GTQ), y ese 502
  está hardcodeado en `PublicationsBar`, `PublicationsMain`, `PautaMain` y
  `PersonalInfoTab`. El mapa depende de `src/utils/gtMunicipalityCoords.ts`, que
  solo trae municipios guatemaltecos.

No arranques con esto hasta que lo de la base esté resuelto.
