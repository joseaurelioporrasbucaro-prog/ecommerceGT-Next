# Guía de Git para el equipo — KIOSQUI / ecommerceGT

Esta guía aplica a **ambos repos**:

- `ecommerceGT-Next` (frontend Next.js) — ramas `main` y `develop`
- `ecommerceGTBackEnd` (backend Node/Express) — ramas `master` y `develop`

> Convención: en frontend la rama de producción es `main`, en backend es `master`. La rama de integración es `develop` en ambos.

---

## Setup inicial (una sola vez)

Cada uno debería tener configurado su nombre/email en git:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@gmail.com"
```

Verificá con:

```bash
git config --global --list | grep user
```

---

## A) Empezar a trabajar — sincronizar develop con producción

> ⚠️ **Aviso especial del 3 de junio de 2026:** ese día se force-pusheó `develop` en el frontend. La PRIMERA vez después de esa fecha, hay que correr el reset hard de abajo. Las siguientes veces basta con pull normal.

### Backend (`ecommerceGTBackEnd`)

```bash
cd ~/ecommerceGTBackEnd
git fetch origin
git checkout develop
git pull origin develop          # actualizar develop con el remoto
git merge origin/master          # traer cambios de master a develop
# Si hay conflictos: resolver manualmente, después git add . && git commit
git push origin develop
```

### Frontend (`ecommerceGT-Next`)

**PRIMERA vez después del 3-jun-2026** (porque hicimos force-push):

```bash
cd ~/ecommerceGT-Next
git fetch origin
git checkout develop
git reset --hard origin/develop  # ← alinear forzosamente con el remoto
```

⚠️ Este comando **borra cualquier cambio local sin commitear y cualquier commit local en develop que no esté en origin/develop**. Si tenían trabajo pendiente ahí, guárdenlo en otra rama antes:

```bash
git stash                                   # guarda cambios sin commitear
# o
git branch backup-develop-$(date +%Y%m%d)   # guarda los commits locales en una rama de respaldo
```

**Siguientes veces** (cuando ya estén al día), es el mismo flujo que el backend:

```bash
cd ~/ecommerceGT-Next
git fetch origin
git checkout develop
git pull origin develop
git merge origin/main
git push origin develop
```

---

## B) Trabajar en un feature

**Regla general: NO commitear directamente a `develop`, `main` o `master`.** Abrir siempre una rama por feature.

```bash
# Backend o frontend, mismo flujo
git checkout develop
git pull origin develop                          # asegurar que develop esté al día
git checkout -b feat/lo-que-estoy-haciendo       # nueva rama desde develop
# ... trabajar ...
git add .
git commit -m "feat: descripción corta de lo que hice"
git push origin feat/lo-que-estoy-haciendo
```

Después, abrir un **Pull Request en GitHub** apuntando a `develop` y pedir review.

### Convenciones de nombres de rama

| Tipo | Prefijo | Ejemplo |
|---|---|---|
| Feature nueva | `feat/` | `feat/login-google` |
| Bugfix | `fix/` | `fix/email-validacion` |
| Refactor sin cambio de comportamiento | `refactor/` | `refactor/extraer-hook-pagination` |
| Chore (tooling, deps, configs) | `chore/` | `chore/upgrade-next-14` |
| Hotfix urgente sobre prod | `hotfix/` | `hotfix/payment-bug-prod` |

### Mensajes de commit

Formato sugerido (Conventional Commits):

```
tipo(scope): descripción corta en presente

Cuerpo opcional con más detalle.
```

Ejemplos buenos:

```
feat(auth): agregar login con Google
fix(form): validación de email vacío
refactor(hooks): consolidar useSubscription
docs(readme): actualizar instrucciones de setup
```

Ejemplos malos:

```
cambios
update
fix
asdasd
```

---

## C) Cuando un feature de develop está listo para producción

Esto lo hace **el maintainer** (Aurelio), no cada desarrollador. Pero para referencia:

```bash
# Frontend
cd ~/ecommerceGT-Next
git checkout main
git pull origin main
git merge origin/develop       # mergear develop a main
# Resolver conflictos si hay
git push origin main

# Backend
cd ~/ecommerceGTBackEnd
git checkout master
git pull origin master
git merge origin/develop
git push origin master
```

---

## D) Qué hacer si tu branch "divergió"

Si después de un `git pull` aparece:

```
Your branch and 'origin/develop' have diverged,
and have N and M different commits each, respectively.
```

Significa que ambos lados tienen commits que el otro no tiene. Dos caminos:

### Opción suave (preserva historia)

```bash
git pull --no-rebase origin develop    # crea un merge commit
# resolver conflictos si hay
git push origin develop
```

### Opción limpia (rebase, requiere force push)

```bash
git pull --rebase origin develop       # reescribe tus commits encima del remoto
# resolver conflictos en cada commit si hay
git push --force-with-lease origin develop
```

> ⚠️ **Force-with-lease solo en ramas personales o de feature, NUNCA en main/master/develop sin avisar al equipo.**

---

## E) Reglas de oro

| ✅ Hacer | ❌ Evitar |
|---|---|
| `git pull` antes de empezar a trabajar | Editar y commitear sin pull primero |
| Crear ramas `feat/...` por feature | Commitear directo a main/master/develop |
| Commits pequeños con mensaje claro | Commits gigantes con mensaje "cambios" |
| Pull requests para review | Mergear directamente sin review |
| `git status` con frecuencia | Asumir el estado del repo |
| Force-push **solo** en ramas personales con `--force-with-lease` | Force-push a main/master sin avisar |
| Verificar `package-lock.json` al instalar deps nuevas | Borrar el `package-lock.json` "porque sí" |

---

## F) Comandos salvavidas — "no sé en qué estado estoy"

```bash
git status                  # qué archivos cambiaron
git log --oneline -10       # últimos 10 commits
git branch -a               # qué ramas hay (local y remotas)
git fetch origin            # actualiza info del remoto sin tocar archivos
git diff origin/develop     # diferencia entre tu rama actual y origin/develop
git remote -v               # ver qué remotos están configurados
```

Si pasan algo raro y quieren ayuda, copien la salida de `git status` + `git log --oneline -5` + `git branch -a` y compártanla — ese contexto suele bastar para diagnosticar.

---

## G) Operaciones más comunes — receta rápida

### Descartar cambios locales en un archivo (sin commitear todavía)

```bash
git restore archivo.tsx
```

### Descartar TODOS los cambios locales sin commitear

```bash
git restore .          # solo archivos modificados
git clean -fd          # también borra archivos nuevos (los untracked)
```

⚠️ Esto NO se puede deshacer. Antes de correrlo: `git status` para confirmar que no perderás nada importante.

### Deshacer el último commit pero mantener los cambios en el working tree

```bash
git reset --soft HEAD~1
# Ahora podés re-editar y volver a commitear
```

### Deshacer el último commit Y descartar sus cambios

```bash
git reset --hard HEAD~1   # ⚠️ destructivo
```

### Cambiar de rama sin perder cambios sin commitear

```bash
git stash               # guarda tus cambios
git checkout otra-rama
# hacer lo que necesitás
git checkout tu-rama-original
git stash pop           # restaura tus cambios
```

### Ver quién modificó cada línea de un archivo

```bash
git blame archivo.tsx
```

### Ver el historial de un archivo

```bash
git log --oneline archivo.tsx
```

---

## H) Antes de pedir review

Checklist mental antes de abrir un PR:

- [ ] `git pull origin develop` y resolví conflictos si había
- [ ] El código compila (`npm run build` o `npm run dev` sin errores)
- [ ] No hay `console.log` ni código de debug olvidado
- [ ] No hay credenciales hardcodeadas (claves, tokens, passwords)
- [ ] Si toqué la BD, leí AGENTS.md §12 y respeté las reglas
- [ ] Si agregué un endpoint, verifiqué que tenga `authMiddleware` cuando corresponde
- [ ] Mensaje de commit descriptivo (no "cambios" o "fix")
- [ ] Hice un `git diff` rápido para ver qué exactamente estoy pidiendo que mergen

---

## I) Recursos

- [AGENTS.md](../AGENTS.md) — reglas inmutables del proyecto (incluye §12 sobre BD)
- [MIGRATION.md](../MIGRATION.md) — estado actual de las fases del proyecto
- [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/)
- [Atlassian — Aprender Git](https://www.atlassian.com/es/git/tutorials)

Si tienen dudas, preguntar a Aurelio antes de ejecutar comandos destructivos (`reset --hard`, `push --force`, `clean -fd`).
