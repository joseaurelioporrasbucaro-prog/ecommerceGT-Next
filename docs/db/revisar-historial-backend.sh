#!/usr/bin/env bash
# ============================================================================
# Quién agregó qué tabla al database.sql del backend, y qué se quedó afuera.
# ============================================================================
# Uso:  ./docs/db/revisar-historial-backend.sh /ruta/al/clon/de/ecommerceGTBackEnd
#
# Si tu clon del backend es completo (el normal de trabajo), no hace falta nada
# antes. NO le pases 'git fetch --depth=N': sobre un clon completo eso lo vuelve
# shallow y te trunca el historial. El script avisa si detecta un clon shallow.
#
# Contesta cuatro cosas que el estado final del archivo no dice:
#   1. Quién tocó database.sql y cuándo.
#   2. Qué commit introdujo cada tabla, y de quién es.
#   3. Tablas que el código consulta y el script no define — las que existen
#      solo en la base de alguien y se pierden al instalar en limpio.
#   4. Índices prometidos en un mensaje de commit que nunca llegaron al archivo.
#
# Es de solo lectura sobre el repo. No toca la base de datos.
# ============================================================================
set -uo pipefail
REPO="${1:-.}"
cd "$REPO" || { echo "No existe el repo: $REPO"; exit 1; }
[ -f database.sql ] || { echo "No hay database.sql en $REPO"; exit 1; }

echo "== Repo: $(pwd)"
echo "== Rango del historial local: $(git log --format='%ad' --date=short | tail -1) → $(git log --format='%ad' --date=short | head -1)"
if [ "$(git rev-parse --is-shallow-repository 2>/dev/null)" = "true" ]; then
  echo ""
  echo "   !! CLON SHALLOW — el historial está truncado y este reporte va a mentir."
  echo "      Corré primero:  git fetch --depth=1000 origin master"
else
  echo "   Clon completo. NO uses 'git fetch --depth=N' acá: sobre un clon completo"
  echo "   lo vuelve shallow y te trunca el historial. Con 'git fetch origin master' basta."
fi
echo ""

echo "=== 1. QUIÉN TOCÓ database.sql ============================================"
git log --follow --format='%h  %<(18)%an %ad  %s' --date=short -- database.sql
echo ""

echo "=== 2. QUÉ COMMIT INTRODUJO CADA TABLA ===================================="
printf '%-34s %-9s %-18s %s\n' TABLA COMMIT AUTOR FECHA
grep -ioE "CREATE TABLE +(IF NOT EXISTS +)?(ecom\.)?[a-zA-Z_]+" database.sql \
  | sed -E 's/CREATE TABLE +//I; s/IF NOT EXISTS +//I; s/ecom\.//' \
  | tr 'A-Z' 'a-z' | sort -u \
  | while read -r t; do
      info=$(git log --reverse --format='%h|%an|%ad' --date=short \
             -G"CREATE TABLE( IF NOT EXISTS)?( ecom\.)? *$t\b" -- database.sql 2>/dev/null | head -1)
      if [ -n "$info" ]; then
        printf '%-34s %-9s %-18s %s\n' "$t" "${info%%|*}" \
          "$(echo "$info" | cut -d'|' -f2)" "$(echo "$info" | cut -d'|' -f3)"
      else
        printf '%-34s %s\n' "$t" "(no se pudo rastrear)"
      fi
    done
echo ""

echo "=== 3. TABLAS QUE EL CÓDIGO CONSULTA Y EL SCRIPT NO DEFINE ================"
echo "(cada una existe solo en la base de quien la creó a mano)"
python3 - <<'PY'
import re, glob, os
sql = open('database.sql').read()
defined = set(m.lower() for m in re.findall(
    r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:ecom\.)?([a-zA-Z_]+)', sql, re.I))
code = ''
for f in glob.glob('**/*.js', recursive=True):
    if 'node_modules' in f: continue
    try: code += open(f, encoding='utf-8', errors='ignore').read()
    except OSError: pass
ruido = {'select','where','set','values','a','b','c','d','p','m','u','pi','pd','sub',
         'only','lateral','unnest','generate_series','json_build_object','table',
         'distinct','dual','t','x','e','cte'}
refs = {}
for m in re.finditer(r'\b(?:FROM|JOIN|INTO|UPDATE|DELETE\s+FROM)\s+(?:ecom\.)?([a-zA-Z_][a-zA-Z0-9_]*)', code, re.I):
    t = m.group(1).lower()
    if t in ruido or t in defined: continue
    refs[t] = refs.get(t, 0) + 1
if refs:
    for t, n in sorted(refs.items(), key=lambda x: -x[1]):
        print(f"  FALTA EN EL SCRIPT: {t:32s} ({n} referencias en el código)")
else:
    print("  (ninguna — el script cubre todo lo que el código consulta)")
PY
echo ""

echo "=== 4. ÍNDICES PROMETIDOS EN COMMITS QUE NO ESTÁN EN EL ARCHIVO ==========="
git log --format='%h|%an|%s%n%b' | grep -ioE "idx_[a-z0-9_]+" | sort -u \
  | while read -r idx; do
      if ! grep -qi "$idx" database.sql; then
        c=$(git log --format='%h  %an  %ad' --date=short --grep="$idx" | head -1)
        echo "  NUNCA SE ESCRIBIÓ: $idx"
        [ -n "$c" ] && echo "                     anunciado en $c"
      fi
    done
echo "  (si no hay líneas arriba, todo índice mencionado existe)"
