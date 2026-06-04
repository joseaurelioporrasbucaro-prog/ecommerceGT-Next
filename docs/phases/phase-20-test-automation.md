# Fase 20 — Infraestructura de tests automatizados

> **Para:** Codex / cualquier ejecutor.
> **De:** Claude (arquitecto).
> **Fecha:** 2026-06-04.
> **Repos involucrados:** `ecommerceGTBackEnd` (master) y `ecommerceGT-Next` (main).

## Objetivo

Poner en producción la infra que convierte `docs/TEST_PLAN.md` de checklist manual a tests automatizados que corren en CI. Esta fase NO automatiza todos los T-NN — solo monta el setup y automatiza 5 casos seleccionados como **smoke tests** que validan que la infra funciona end-to-end.

Los T-NN automatizados después de esta fase son:
- **T-01** — Login exitoso
- **T-02** — Login con password incorrecto (1-3 intentos)
- **T-03** — Login intento 4 (warning `nearLockout`)
- **T-04** — Login intento 5 (bloqueo `passwordLocked`)
- **T-22** — Desbloqueo de password vía `/support/users/:id/unlock-password`

El resto del TEST_PLAN.md se irá automatizando en fases posteriores conforme las features se modifiquen.

## Pre-requisitos

- Acceso a `git`, `npm`, `node ≥ 18`.
- **Docker Desktop instalado** (recomendado para la BD de tests). Si Codex detecta que no está instalado, ver D-1.
- Cuenta de GitHub con permisos de push a ambos repos (para CI).
- Conocimiento del schema actual en `database.sql` del backend.

## Inventario (estado actual)

### Backend (`ecommerceGTBackEnd`)
- `package.json`:
  - `type: "commonjs"` (sin "type" explícito = CJS)
  - Scripts: solo `"test": "echo error"` placeholder
  - Deps relevantes: `express`, `pg`, `bcrypt`, `jsonwebtoken`, `cookie-parser`, `cors`, `dotenv`
- `server.js`: usa `require()`, exporta vía `app.listen`. Sin export del `app` para tests.
- `config/connPostgresDB.js`: conecta con `process.env.HOSTDB / PORTDB / USERDB / PSWDDB / DATADB`. Singleton de `pool` exportado.
- `database.sql`: schema completo. Incluye seeds que el test setup necesitará.
- No tiene `.github/workflows/`.

### Frontend (`ecommerceGT-Next`)
- `package.json`:
  - `type: "module"` no especificado, asume CJS pero Next.js maneja todo internamente
  - Scripts: `dev`, `build`, `start`, `lint`. **Sin scripts de test.**
  - Deps: Next 13.4.6, React 18.2.0, TypeScript 5.1.3, @tanstack/react-query, formik, leaflet
- `tsconfig.json`: paths con alias `@/*` → `src/*`. Verificar antes de configurar vitest.
- No tiene `.github/workflows/`.
- No tiene `vitest.config.ts`, `playwright.config.ts`, ni `tests/`.

### Existing
- `docs/TEST_PLAN.md` con los T-NN ya documentados manualmente. T-01..T-04, T-30..T-32, T-36 ya marcados como PASS manual. Esta fase los pasa a 🤖 AUTOMATED.

## Cambios planificados

### Backend — `ecommerceGTBackEnd/`

#### Nuevos archivos
- `tests/setup.js` — global setup: conecta a BD de tests, corre `database.sql` para crearla limpia
- `tests/teardown.js` — global teardown: cierra pool
- `tests/helpers/db.js` — wrappers: `resetDb()`, `query(sql, params)`, `seedTestUser({email, password, role})`
- `tests/helpers/auth.js` — `loginAs({email, password})` → devuelve cookie JWT lista para usar en supertest
- `tests/helpers/app.js` — exporta el `app` de express SIN llamar a `listen()` (para que supertest le pegue directo)
- `tests/api/auth/login.spec.js` — T-01, T-02
- `tests/api/auth/lockout.spec.js` — T-03, T-04
- `tests/api/support/unlock-password.spec.js` — T-22
- `vitest.config.js` — config global

#### Modificaciones
- `server.js`:
  - Separar la creación del `app` (exportable) del `app.listen()` (solo si `require.main === module`).
  - Pattern típico:
    ```js
    // al final del archivo
    if (require.main === module) {
      app.listen(PORT, () => console.log(...));
    }
    module.exports = app;
    ```
- `package.json`:
  - Agregar `"test": "vitest run"`
  - Agregar `"test:watch": "vitest"`
  - Agregar devDeps: `vitest`, `supertest`, `@vitest/coverage-v8`
- `.env.test` (NO commiteado, agregar a `.gitignore` si no está):
  ```
  HOSTDB=localhost
  PORTDB=5432
  USERDB=usrecommerce
  PSWDDB=admin123
  DATADB=ecommercedb_test
  JWT_SECRET=test-secret-do-not-use-in-prod
  CRYPTO_SECRET=test-crypto-secret-do-not-use-in-prod
  ```
- `tests/.env.test.example` (SÍ commiteado) — template con valores ficticios.
- `.gitignore`: agregar `coverage/`, `.env.test`

### Frontend — `ecommerceGT-Next/`

Para esta fase, **NO tocamos frontend con tests**. La razón:
- Todos los tests críticos de auth son API-level (no requieren UI).
- Playwright + setup de Next.js dev server agrega complejidad que no aporta a los smoke tests iniciales.
- Frontend tests entran en una fase futura (`phase-21-frontend-tests.md`).

Lo único que toca al frontend:
- `docs/TEST_PLAN.md`: actualizar los T-NN marcando AUTOMATED y agregando `tests/api/.../*.spec.js` como referencia.
- `docs/MIGRATION.md`: cerrar Fase 20.

### Database

#### Estrategia (ver D-1)
BD dedicada para tests con docker-compose. Si docker no está, fallback a BD local con sufijo `_test`.

#### `tests/fixtures/init.sql`
- Carga el `database.sql` completo del backend
- Inserta usuarios de prueba con passwords bcrypt pre-hasheados:
  - `test-user@test.com` / `Test123!` — rol `user`, status `active`
  - `test-support@test.com` / `Test123!` — rol `support`
  - `test-admin@test.com` / `Test123!` — rol `admin`
- Cada test debe llamar `resetDb()` en `beforeEach()` para volver a este estado base.

#### `tests/helpers/db.js` interfaz
```js
// pseudocódigo
async function resetDb() {
  await query("TRUNCATE ecom.customer, ecom.publications, ... CASCADE");
  await loadSqlFile("tests/fixtures/init.sql");
}

async function query(sql, params) { ... }

async function seedTestUser({ email, password, role = 'user' }) {
  const hash = await bcrypt.hash(password, 10);
  await query("INSERT INTO ecom.customer ...");
}

async function getUserByEmail(email) { ... }

module.exports = { resetDb, query, seedTestUser, getUserByEmail };
```

### CI — GitHub Actions

`.github/workflows/test.yml` en **ambos repos**:

```yaml
name: Tests

on:
  pull_request:
    branches: [main, master, develop]
  push:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: usrecommerce
          POSTGRES_PASSWORD: admin123
          POSTGRES_DB: ecommercedb_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports: [5432:5432]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Load schema
        run: psql "postgresql://usrecommerce:admin123@localhost:5432/ecommercedb_test" -f database.sql
      - run: npm test
        env:
          HOSTDB: localhost
          PORTDB: 5432
          USERDB: usrecommerce
          PSWDDB: admin123
          DATADB: ecommercedb_test
          JWT_SECRET: ci-secret
          CRYPTO_SECRET: ci-crypto-secret
```

(Codex: el frontend NO necesita workflow en esta fase porque no tiene tests todavía. Crear solo el del backend.)

## Decisiones de diseño

### D-1: BD para tests local

- **Opción A — docker-compose dedicado.** `docker-compose.test.yml` levanta postgres limpio en puerto 5433. Cada vez que se corre `npm test`, el script verifica que esté arriba.
- **Opción B — BD local con sufijo `_test`.** `ecommercedb_test` en la misma instancia que `ecommercedb`. Requiere que el dev cree la BD manualmente la primera vez.
- **Opción C — Postgres in-memory (pglite/electric).** Más rápido pero algunas features de Postgres no funcionan idéntico.

**Recomendación:** **B** para arrancar (menor fricción, sin docker). En `package.json` agregar script `db:test:setup` que crea la BD y carga `database.sql` y `tests/fixtures/init.sql`. Documentar en README.

Razón: Aurelio ya tiene postgres local funcionando. Sumar docker es una capa extra de setup que no aporta para esta fase. CI sí usa servicio postgres (de hecho ya está en el workflow de arriba).

### D-2: Cleanup entre tests

- **Opción A — TRUNCATE + reload fixtures en cada `beforeEach`.** Lento (~500ms por test) pero garantiza aislamiento.
- **Opción B — Transacciones con ROLLBACK.** Cada test corre en una transacción que se hace rollback. Rápido (~50ms) pero requiere que el código bajo test no use sus propias transacciones (lo cual rompería el rollback).
- **Opción C — TRUNCATE solo de tablas tocadas + reload selectivo.** Intermedio.

**Recomendación:** **A** por simplicidad. Si en el futuro los tests se vuelven lentos, migramos a B. Tests de 50-100 corriendo en <30s es aceptable.

### D-3: Mock de bcrypt para velocidad

Bcrypt es lento por diseño. Cada `seedTestUser` con cost factor 10 toma ~100ms.

- **Opción A — Cost factor bajo en `.env.test` (cost=4).** Mantiene el flow real, solo más rápido.
- **Opción B — Mock completo (`vi.mock('bcrypt')`).** Ultra-rápido pero pierde verificación real.

**Recomendación:** **A**. Agregar `BCRYPT_ROUNDS=4` a `.env.test` y leer en el código backend (actualmente está hardcodeado a 10). **Esto requiere un cambio en `connPostgresDB.js`** que Codex debe hacer también — pero **cuidado**: el cambio debe respetar 10 en producción. Pattern: `const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;`

### D-4: Estructura de specs

- **Opción A — Un archivo por endpoint** (`tests/api/auth/login.spec.js`).
- **Opción B — Un archivo por T-NN** (`tests/api/T-01-login-success.spec.js`).
- **Opción C — Agrupado por feature** (`tests/api/auth.spec.js` con todos los T-NN de auth).

**Recomendación:** **A**. Cada archivo agrupa los T-NN relacionados a un endpoint específico. El comentario `// T-01` en cada `test()` mantiene trazabilidad.

```js
describe('POST /login', () => {
  test('T-01 — login exitoso con credenciales válidas', async () => { ... });
  test('T-02 — password incorrecto en intentos 1-3', async () => { ... });
  // etc
});
```

### D-5: Cobertura (coverage)

Por ahora **no enforce coverage thresholds**. La fase es montar la infra. Agregar `--coverage` flag opcional. Threshold mínimo lo decidimos en una fase posterior cuando haya volumen.

## Criterios de aceptación

Codex marca con `[x]` cuando completa cada uno:

### Setup local
- [ ] Existe `tests/` en backend con la estructura descrita
- [ ] Existe `vitest.config.js` en backend
- [ ] `package.json` tiene scripts `test`, `test:watch`, `db:test:setup`
- [ ] `.env.test.example` commiteado, `.env.test` en `.gitignore`
- [ ] `server.js` exporta el `app` y `app.listen()` está dentro de `if (require.main === module)`

### Tests automatizados
- [ ] `tests/api/auth/login.spec.js` contiene T-01 y T-02, ambos PASS
- [ ] `tests/api/auth/lockout.spec.js` contiene T-03 y T-04, ambos PASS
- [ ] `tests/api/support/unlock-password.spec.js` contiene T-22, PASS
- [ ] `npm test` en backend corre los 5 tests y devuelve exit code 0

### CI
- [ ] `.github/workflows/test.yml` en backend
- [ ] Push a `master` o PR a master dispara el workflow
- [ ] El workflow pasa en verde con los 5 tests

### Documentación
- [ ] `docs/TEST_PLAN.md` actualizado: T-01..T-04, T-22 marcados 🤖 AUTOMATED con ruta del spec
- [ ] `docs/MIGRATION.md` actualizado: sección "Fase 20" con bitácora
- [ ] README del backend documenta cómo correr tests localmente (1-2 párrafos)

### Quality bar
- [ ] Tests son DETERMINISTAS (mismo resultado 10 veces seguidas)
- [ ] Tests son AISLADOS (un test puede correr solo sin que falle)
- [ ] Tiempo total: `npm test` termina en <30s

## Riesgos / edge cases

| Riesgo | Mitigación |
|---|---|
| BD de tests contamina la BD de dev | Sufijo `_test` obligatorio; el helper `resetDb()` verifica que `DATADB` termine en `_test` y aborta si no. |
| Tests dejan procesos colgados | `afterAll()` cierra el `pool` de pg. Vitest tiene `--no-threads` si hay problemas. |
| `app.listen()` se ejecuta durante tests | El guard `require.main === module` lo previene. Verificar. |
| Bcrypt cost=4 se filtra a prod | Variable de entorno explícita en `.env.test`. Backend usa `|| 10` como fallback. **Codex: agregar test que verifica que en producción cost ≥ 10.** |
| Tests dependen del orden de ejecución | Vitest corre en orden indeterminado por default. `beforeEach(resetDb)` garantiza estado limpio. |
| CI lento por bcrypt | Cost=4 también en CI vía secret. |
| Workflow falla por permisos en GitHub | Push directo a master no dispara el workflow en PR; usar `push` event también. |

## Out of scope (NO hacer en esta fase)

- ❌ Tests de frontend (componentes, hooks, E2E) — fase futura
- ❌ Playwright / browser tests
- ❌ Cobertura mínima enforced
- ❌ Tests de performance / load
- ❌ Tests de migración SQL
- ❌ Linting / formatting setup (eslint/prettier)
- ❌ Cambiar el comportamiento de los endpoints (solo se testea lo que YA funciona)
- ❌ Refactorizar `connPostgresDB.js` más allá del cambio mínimo de `BCRYPT_ROUNDS`

## Estimación

- Setup + helpers: ~2h
- 5 tests automatizados: ~2h
- CI workflow + debug: ~1h
- Docs: ~30min

**Total: ~5-6h para Codex.** Si pasa de 8h, hay algo mal — escalar a Claude vía Aurelio.

## Apéndice — Ejemplos de tests

### `tests/api/auth/login.spec.js`

```js
const request = require('supertest');
const { describe, test, expect, beforeEach, afterAll } = require('vitest');
const { resetDb, seedTestUser, getUserByEmail } = require('../../helpers/db');
const { closePool } = require('../../helpers/db');
const app = require('../../helpers/app');

describe('POST /login', () => {
  beforeEach(async () => {
    await resetDb();
    await seedTestUser({
      email: 'tester@test.com',
      password: 'Test123!',
      role: 'user',
    });
  });

  afterAll(async () => {
    await closePool();
  });

  test('T-01 — login exitoso con credenciales válidas', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'tester@test.com', password: 'Test123!' });

    expect(res.status).toBe(200);
    expect(res.body.idpwd).toBe(1);
    expect(res.body.message).toMatch(/exitoso/i);
    // Cookie httpOnly presente
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toMatch(/token=/);

    // BD: el counter quedó en 0 (bugfix Fase 8.3.3)
    const user = await getUserByEmail('tester@test.com');
    expect(user.cus_password_fail_count).toBe(0);
  });

  test('T-02 — password incorrecto en intentos 1-3', async () => {
    for (let i = 1; i <= 3; i++) {
      const res = await request(app)
        .post('/login')
        .send({ email: 'tester@test.com', password: 'WrongPwd!' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/incorrecta/i);
      expect(res.body.nearLockout).toBeUndefined();
      expect(res.body.passwordLocked).toBeUndefined();

      const user = await getUserByEmail('tester@test.com');
      expect(user.cus_password_fail_count).toBe(i);
    }
  });
});
```

### `tests/api/auth/lockout.spec.js` (T-03, T-04)

```js
describe('POST /login — lockout escalonado', () => {
  beforeEach(async () => {
    await resetDb();
    await seedTestUser({ email: 'lockout@test.com', password: 'Test123!' });
  });

  test('T-03 — intento 4 devuelve nearLockout', async () => {
    // Pre-condición: 3 fallos ya acumulados
    await query(
      "UPDATE ecom.customer SET cus_password_fail_count = 3 WHERE cus_user_name = $1",
      ['lockout@test.com']
    );

    const res = await request(app)
      .post('/login')
      .send({ email: 'lockout@test.com', password: 'WrongPwd!' });

    expect(res.status).toBe(400);
    expect(res.body.nearLockout).toBe(true);
    expect(res.body.attemptsRemaining).toBe(1);
    expect(res.body.message).toMatch(/te queda 1 intento.*30 minutos/i);
  });

  test('T-04 — intento 5 bloquea por 30 minutos', async () => {
    await query(
      "UPDATE ecom.customer SET cus_password_fail_count = 4 WHERE cus_user_name = $1",
      ['lockout@test.com']
    );

    const res = await request(app)
      .post('/login')
      .send({ email: 'lockout@test.com', password: 'WrongPwd!' });

    expect(res.status).toBe(403);
    expect(res.body.passwordLocked).toBe(true);
    expect(res.body.minutesRemaining).toBe(30);

    const user = await getUserByEmail('lockout@test.com');
    expect(user.passta_id).toBe(2);
    expect(user.cus_banned_until).not.toBeNull();
    // Verificar que la fecha está ~30 min en el futuro (±1 min para timing)
    const banUntil = new Date(user.cus_banned_until);
    const expected = Date.now() + 30 * 60 * 1000;
    expect(banUntil.getTime()).toBeGreaterThan(expected - 60_000);
    expect(banUntil.getTime()).toBeLessThan(expected + 60_000);
  });
});
```

### `tests/api/support/unlock-password.spec.js` (T-22)

```js
const { loginAs } = require('../../helpers/auth');

describe('POST /support/users/:id/unlock-password', () => {
  beforeEach(async () => {
    await resetDb();
    await seedTestUser({ email: 'admin@test.com', password: 'Admin123!', role: 'admin' });
    await seedTestUser({
      email: 'locked@test.com',
      password: 'Test123!',
      role: 'user',
    });
    await query(
      `UPDATE ecom.customer
       SET passta_id = 2,
           cus_password_fail_count = 5,
           cus_banned_until = NOW() + INTERVAL '20 minutes'
       WHERE cus_user_name = $1`,
      ['locked@test.com']
    );
  });

  test('T-22 — admin desbloquea cuenta con passta_id=2', async () => {
    const cookie = await loginAs({ email: 'admin@test.com', password: 'Admin123!' });
    const locked = await getUserByEmail('locked@test.com');

    const res = await request(app)
      .post(`/support/users/${locked.cus_id}/unlock-password`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);

    const after = await getUserByEmail('locked@test.com');
    expect(after.passta_id).toBe(1);
    expect(after.cus_password_fail_count).toBe(0);
    expect(after.cus_banned_until).toBeNull();
  });

  test('T-22b — user normal NO puede desbloquear (rol denegado)', async () => {
    await seedTestUser({ email: 'normal@test.com', password: 'Test123!', role: 'user' });
    const cookie = await loginAs({ email: 'normal@test.com', password: 'Test123!' });
    const locked = await getUserByEmail('locked@test.com');

    const res = await request(app)
      .post(`/support/users/${locked.cus_id}/unlock-password`)
      .set('Cookie', cookie);

    expect(res.status).toBe(403);
  });
});
```

## Handshake — qué reportar al cerrar la fase

Codex commit message final:

```
feat(fase20): infra de tests automatizados + 5 smoke tests

- vitest + supertest configurados en backend
- 5 tests automatizados (T-01, T-02, T-03, T-04, T-22)
- CI con GitHub Actions corriendo en cada PR
- TEST_PLAN.md actualizado con flags 🤖 AUTOMATED
- MIGRATION.md cierra Fase 20

ref docs/phases/phase-20-test-automation.md

Tiempo: Xh
Decisiones aplicadas: D-1=B, D-2=A, D-3=A, D-4=A, D-5=skip
Bloqueos: ninguno / lista de cosas que requirieron decisión sobre la marcha
```

Eso le da a Claude el contexto para hacer el code review.
