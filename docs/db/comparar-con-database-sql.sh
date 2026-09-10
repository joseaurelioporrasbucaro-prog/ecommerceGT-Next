#!/usr/bin/env bash
# ============================================================================
# ¿Mi base está al día con database.sql? — la respuesta sin listas a mano.
# ============================================================================
# Uso:
#   ./docs/db/comparar-con-database-sql.sh "/ruta/al/ecommerceGTBackEnd" [commit]
#
#   commit: de qué versión del backend sacar database.sql. Por omisión
#           origin/master — hacé `git fetch origin master` en el backend antes.
#
# Qué hace:
#   1. Levanta un Postgres TEMPORAL (initdb en un directorio que se borra al
#      terminar, solo TCP en 127.0.0.1). No toca tu servidor.
#   2. Le carga database.sql igual que los tests del backend
#      (CREATE SCHEMA ecom; SET search_path TO ecom).
#   3. Saca una foto normalizada del esquema ecom de las dos bases —columnas,
#      tipos, defaults, NOT NULL, constraints, índices, vistas, funciones,
#      triggers— y de las filas de los catálogos, y hace diff.
#
# A tu base solo le hace SELECT sobre catálogos del sistema y tablas cat_*,
# en una sesión con default_transaction_read_only=on.
#
# Conexión a la base que se revisa: si están definidas PGHOST/PGDATABASE/...,
# usa esas. Si no, toma DB_HOST, DB_PORT, DB_DATABASE, DB_USER y DB_PASSWORD
# del .env del backend. La contraseña nunca se imprime.
#
# Salida: "<" = está en database.sql y le falta a tu base.
#         ">" = está en tu base y database.sql no lo tiene.
# Código de salida: 0 si no hay diferencias, 1 si las hay, 2 si algo falló.
# ============================================================================
set -uo pipefail

BACKEND="${1:-}"
REF="${2:-origin/master}"
[ -n "$BACKEND" ] && [ -d "$BACKEND/.git" ] || {
  echo "Uso: $0 \"/ruta/al/ecommerceGTBackEnd\" [commit]"; exit 2; }

# ── Binarios de Postgres ────────────────────────────────────────────────────
PG_BIN="${PG_BIN:-}"
if [ -z "$PG_BIN" ]; then
  for d in "$(dirname "$(command -v initdb 2>/dev/null || echo /nonexistent/x)")" \
           $(ls -d /Library/PostgreSQL/*/bin 2>/dev/null | sort -V -r) \
           $(ls -d /opt/homebrew/opt/postgresql@*/bin /usr/local/opt/postgresql@*/bin 2>/dev/null | sort -V -r) \
           /Applications/Postgres.app/Contents/Versions/latest/bin; do
    [ -x "$d/initdb" ] && [ -x "$d/pg_ctl" ] && [ -x "$d/psql" ] && { PG_BIN="$d"; break; }
  done
fi
[ -n "$PG_BIN" ] || { echo "No encontré initdb/pg_ctl/psql. Definí PG_BIN=/ruta/a/bin"; exit 2; }

# ── Conexión a la base que se revisa ────────────────────────────────────────
if [ -z "${PGHOST:-}${PGDATABASE:-}${DATABASE_URL:-}" ] && [ -f "$BACKEND/.env" ]; then
  getv() { grep -E "^$1=" "$BACKEND/.env" | head -1 | cut -d= -f2- \
           | sed -E "s/^[\"']//; s/[\"'][[:space:]]*$//; s/"$'\r'"$//"; }
  export PGHOST="$(getv DB_HOST)" PGPORT="$(getv DB_PORT)" \
         PGDATABASE="$(getv DB_DATABASE)" PGUSER="$(getv DB_USER)" \
         PGPASSWORD="$(getv DB_PASSWORD)"
fi
TARGET=()
[ -n "${DATABASE_URL:-}" ] && TARGET=("$DATABASE_URL")
echo "== Base revisada: ${PGUSER:-?}@${PGHOST:-?}:${PGPORT:-5432}/${PGDATABASE:-?}${DATABASE_URL:+ (DATABASE_URL)}"

# ── Postgres temporal con database.sql ──────────────────────────────────────
TMP="$(mktemp -d "${TMPDIR:-/tmp}/kq-ref.XXXXXX")"
PORT="${REF_PORT:-55439}"
cleanup() {
  "$PG_BIN/pg_ctl" -D "$TMP/data" -m fast stop >/dev/null 2>&1
  rm -rf "$TMP"
}
trap cleanup EXIT

git -C "$BACKEND" show "$REF:database.sql" > "$TMP/database.sql" 2>/dev/null \
  || { echo "No pude leer database.sql en $REF. ¿Hiciste git fetch en el backend?"; exit 2; }
echo "== database.sql de: $REF ($(git -C "$BACKEND" rev-parse --short "$REF"))"

"$PG_BIN/initdb" -D "$TMP/data" -U postgres -A trust -E UTF8 --locale=C >/dev/null 2>&1 \
  || { echo "initdb falló"; exit 2; }
"$PG_BIN/pg_ctl" -D "$TMP/data" -l "$TMP/pg.log" -w \
  -o "-p $PORT -c unix_socket_directories='' -c listen_addresses=127.0.0.1" start >/dev/null 2>&1 \
  || { echo "No arrancó el Postgres temporal en el puerto $PORT (¿ocupado? probá REF_PORT=55440)"; exit 2; }

# -h/-p/-U/-d explícitos: las PG* de arriba son de TU base y no deben llegarle
# al Postgres temporal.
REFPSQL=("$PG_BIN/psql" -X -q -h 127.0.0.1 -p "$PORT" -U postgres)
"${REFPSQL[@]}" -d postgres -c "CREATE DATABASE ref" >/dev/null \
  || { echo "No pude crear la base de referencia en el Postgres temporal"; exit 2; }
{ echo "CREATE SCHEMA ecom; SET search_path TO ecom;"; cat "$TMP/database.sql"; } > "$TMP/carga.sql"
if ! "${REFPSQL[@]}" -d ref -v ON_ERROR_STOP=1 -f "$TMP/carga.sql" >/dev/null 2>"$TMP/carga.err"; then
  echo "database.sql NO corre desde cero:"; grep -m3 ERROR "$TMP/carga.err"; exit 2
fi

# ── Foto normalizada ────────────────────────────────────────────────────────
# Normaliza lo que no es una diferencia real: now() = CURRENT_TIMESTAMP, el
# nombre de la secuencia detrás de un serial y el nombre de los índices que
# respaldan una PK/UNIQUE (su definición sí se compara).
cat > "$TMP/foto.sql" <<'SQL'
SET search_path TO ecom, public;
WITH tabs AS (
  SELECT c.oid, c.relname, c.relkind FROM pg_class c
  WHERE c.relnamespace = 'ecom'::regnamespace AND c.relkind IN ('r','v','m','p')
), lineas AS (
  SELECT 'OBJETO  ' || CASE WHEN relkind IN ('r','p') THEN 'TABLE ' ELSE 'VIEW ' END || relname AS l FROM tabs
  UNION ALL
  SELECT 'COLUMNA ' || t.relname || '.' || a.attname || ' :: ' || format_type(a.atttypid, a.atttypmod)
         || CASE WHEN a.attnotnull THEN ' NOT NULL' ELSE '' END
         || CASE WHEN a.attidentity <> '' THEN ' IDENTITY' ELSE '' END
         || COALESCE(' DEFAULT ' || regexp_replace(regexp_replace(pg_get_expr(d.adbin, d.adrelid),
              'nextval\(''[^'']+''::regclass\)', 'nextval(<secuencia>)'), '^now\(\)$', 'CURRENT_TIMESTAMP'), '')
  FROM tabs t JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum > 0 AND NOT a.attisdropped
  LEFT JOIN pg_attrdef d ON d.adrelid = t.oid AND d.adnum = a.attnum
  UNION ALL
  SELECT 'CONSTR  ' || t.relname || ' ' || c.contype::text || ' ' || pg_get_constraintdef(c.oid)
  FROM pg_constraint c JOIN tabs t ON t.oid = c.conrelid WHERE c.contype IN ('p','f','u','c','x')
  UNION ALL
  SELECT 'INDICE  ' || t.relname || ' ' || regexp_replace(pg_get_indexdef(i.indexrelid),
           '^CREATE (UNIQUE )?INDEX \S+ ON ', 'CREATE \1INDEX ON ')
  FROM pg_index i JOIN tabs t ON t.oid = i.indrelid
  UNION ALL
  SELECT 'NOMBRE  ' || t.relname || ' ' || ic.relname
  FROM pg_index i JOIN tabs t ON t.oid = i.indrelid JOIN pg_class ic ON ic.oid = i.indexrelid
  WHERE NOT EXISTS (SELECT 1 FROM pg_constraint k WHERE k.conindid = i.indexrelid)
  UNION ALL
  SELECT 'VISTA   ' || relname || ' md5=' || md5(regexp_replace(pg_get_viewdef(oid, true), '\s+', ' ', 'g'))
  FROM tabs WHERE relkind IN ('v','m')
  UNION ALL
  SELECT 'FUNCION ' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ') md5=' || md5(pg_get_functiondef(p.oid))
  FROM pg_proc p WHERE p.pronamespace = 'ecom'::regnamespace AND p.prokind IN ('f','p')
  UNION ALL
  SELECT 'TRIGGER ' || t.relname || ' ' || regexp_replace(pg_get_triggerdef(tg.oid), '^CREATE (CONSTRAINT )?TRIGGER \S+ ', '')
  FROM pg_trigger tg JOIN tabs t ON t.oid = tg.tgrelid WHERE NOT tg.tgisinternal
)
SELECT l FROM lineas ORDER BY l;
SQL

# Catálogos: las filas que siembra database.sql. platform_config solo por
# clave, porque sus valores se calibran en caliente desde el admin.
CATALOGOS=(cat_country cat_city cat_town cat_gender cat_password_status cat_business_status
           cat_publication_status cat_publication_gender cat_publication_transac
           cat_publication_transac_x_gender cat_login_type cat_amenities subscriptions)
{
  echo "SET search_path TO ecom, public;"
  for t in "${CATALOGOS[@]}"; do
    echo "SELECT 'DATO    $t ' || (to_jsonb(x) - 'created_at' - 'updated_at')::text FROM ecom.$t x;"
  done
  echo "SELECT 'DATO    platform_config ' || config_key FROM ecom.platform_config;"
} > "$TMP/datos.sql"

"${REFPSQL[@]}" -d ref -At -f "$TMP/foto.sql" -f "$TMP/datos.sql" | grep -v '^SET$' | sort > "$TMP/ref.txt"
if ! PGOPTIONS='-c default_transaction_read_only=on' "$PG_BIN/psql" -X -q -At -v ON_ERROR_STOP=1 \
       ${TARGET[@]+"${TARGET[@]}"} -f "$TMP/foto.sql" -f "$TMP/datos.sql" 2>"$TMP/tuya.err" \
       | grep -v '^SET$' | sort > "$TMP/tuya.txt"; then
  echo "No pude leer tu base:"; head -3 "$TMP/tuya.err"; exit 2
fi
[ -s "$TMP/tuya.txt" ] || { echo "Tu base no devolvió nada (¿existe el esquema ecom?)"; exit 2; }

# ── Resultado ───────────────────────────────────────────────────────────────
diff "$TMP/ref.txt" "$TMP/tuya.txt" | grep -E '^[<>]' > "$TMP/diff.txt"
faltan=$(grep -c '^<' "$TMP/diff.txt"); sobran=$(grep -c '^>' "$TMP/diff.txt")
echo ""
if [ "$faltan" -eq 0 ] && [ "$sobran" -eq 0 ]; then
  echo "✔ Tu base coincide con database.sql: mismo esquema y mismos catálogos."
  exit 0
fi
echo "Resumen por tipo (< le falta a tu base · > database.sql no lo tiene):"
awk '{print "  " $1, $2}' "$TMP/diff.txt" | sort | uniq -c
echo ""
echo "=== LE FALTA A TU BASE ($faltan) ============================================"
grep '^<' "$TMP/diff.txt" | grep -v '^< DATO    cat_town ' | cut -c3- | cut -c1-200
n=$(grep -c '^< DATO    cat_town ' "$TMP/diff.txt")
[ "$n" -gt 0 ] && echo "DATO    cat_town ... ($n municipios, no se listan)"
echo ""
echo "=== ESTÁ EN TU BASE Y NO EN database.sql ($sobran) ========================="
grep '^>' "$TMP/diff.txt" | cut -c3- | cut -c1-200
echo ""
echo "Una misma columna con distinto tipo o NOT NULL aparece en las dos listas:"
echo "la línea de arriba es lo que dice el archivo; la de abajo, lo que tiene tu base."
exit 1
