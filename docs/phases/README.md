# `docs/phases/` — Planes de fase

Cada archivo `phase-NN-<slug>.md` documenta una fase de trabajo **antes** de implementarla. Es el contrato entre el arquitecto (Claude) y el ejecutor (Codex u otro agente).

## Convención

- **Nombre:** `phase-<NN>-<kebab-case>.md` (ej. `phase-20-test-automation.md`)
- **Numeración:** continúa la serie de MIGRATION.md; sub-fases con `.1`, `.2`
- **Inmutable después de ejecutar:** una vez Codex commitea, el plan se vuelve histórico. Cambios posteriores van en una nueva fase.

## Estructura mínima de cada plan

```markdown
# Fase NN — Nombre

## Objetivo
Una frase clara. Por qué hacemos esto.

## Pre-requisitos
- Qué fases anteriores deben estar cerradas
- Qué herramientas externas hacen falta (docker, gh CLI, etc.)

## Inventario (estado actual)
- Archivos que se van a tocar (con sus paths actuales)
- Endpoints que se van a tocar
- Tablas/columnas relevantes

## Cambios planificados

### Backend
- archivo.js → modificar X
- nuevo endpoint POST /...

### Frontend
- archivo.tsx → modificar/crear

### Database
- ALTER/CREATE en database.sql (per AGENTS.md §12)
- SQL migración aparte (para BDs ya pobladas)

### Tests (T-NN del TEST_PLAN.md)
- T-XX: descripción

### CI / scripts
- npm scripts a agregar
- workflows de GitHub Actions

## Decisiones de diseño (con recomendación)

Cada decisión "rara" listada como:

**D-1: Título de la decisión**
- Opción A: ...
- Opción B: ...
- **Recomendación:** A porque ...

Codex puede ejecutar la recomendación sin preguntar. Solo levanta la mano si encuentra un blocker técnico.

## Criterios de aceptación

Checklist verificable. Ejemplo:
- [ ] `npm test` corre sin errores en backend
- [ ] T-01 automatizado pasa en CI
- [ ] Documentación actualizada en MIGRATION.md

## Riesgos / edge cases
Cosas que pueden romperse, mitigación.

## Out of scope
Qué NO se hace en esta fase (para evitar scope creep).

## Estimación
~Xh para Codex (rough). Ayuda al revisor a detectar si algo se fue de control.
```

## Flujo de trabajo

```
1. Claude crea phase-NN-<slug>.md y lo commitea en feature branch
2. Aurelio pasa el path a Codex: "implementá docs/phases/phase-NN-X.md"
3. Codex lee el archivo, implementa, commitea con
     "feat(fase NN): ... ref docs/phases/phase-NN-<slug>.md"
4. Codex actualiza criterios de aceptación marcando [x]
5. Claude (vía Aurelio) hace code review del commit
6. Claude actualiza TEST_PLAN.md con los T-NN nuevos (PASS/FAIL)
7. Claude actualiza MIGRATION.md cerrando la fase
```

## Naming de tests dentro de cada plan

Los tests siempre se referencian con su ID `T-NN` del `docs/TEST_PLAN.md`. Si la fase agrega tests nuevos, el plan los crea ahí también y los marca como `⚪ PENDING` hasta que Codex los implemente como automatizados.
