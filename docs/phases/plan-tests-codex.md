# Plan de automatización de pruebas — para Codex

> **Para quién es.** Codex (u otro agente) implementa esto por hitos. Aurelio
> revisa al final de cada hito; la revisión técnica final la hace Claude.
>
> **Regla que manda sobre todo lo demás:** un test que pasa siempre no vale
> nada. **Antes de dar por bueno cualquier test, rompé a propósito el código que
> prueba y confirmá que se pone rojo.** En este proyecto ya hubo tres
> verificaciones falsas (un grep que devolvió cero por un patrón mal armado, un
> test anti-spoofing que no simulaba proxy, y un "borré la fila y el test siguió
> verde" porque el esquema se recargaba solo). Si no viste el test en rojo, no
> sabés qué prueba.

---

## Punto de partida (verificado 2026-08-13)

| | Backend | Frontend |
| --- | --- | --- |
| Framework | Vitest + Supertest | **nada** |
| Archivos de spec | 24 | 0 |
| Tests | 240 en verde | 0 |
| Rutas / componentes | 156 rutas, ~21 áreas cubiertas | ~250 componentes |

El backend tiene una base sólida y **sus convenciones son el modelo a seguir**.
El frontend arranca de cero.

---

## Cómo se escribe un test acá

Leé primero dos specs del backend, que son el estándar de la casa:

- `tests/api/publications/paginacion.spec.js`
- `tests/api/security/sesion-y-empresa.spec.js`

Lo que hay que copiar de ellos:

1. **Cabecera que explica QUÉ defecto previene**, no qué función llama. Si no
   podés nombrar el bug, probablemente el test no valga la pena.
2. **Nombres de test en español**, describiendo comportamiento observable:
   `'mandar el busid de OTRA empresa no la toca'`, no `'test changeInfoC 403'`.
3. **Marcar el test que importa.** En un archivo de ocho, uno o dos son la
   razón de existir; el resto cuida el contrato. Señalalos
   (`// ── EL TEST QUE IMPORTA ──`).
4. **Aislamiento total**: `resetDb()` completo en `beforeEach`. Limpiar
   parcialmente entre casos ya causó fallos intermitentes que costaron horas de
   diagnóstico (ver `MIGRATION.md` §7.1).
5. **Comentarios en español** explicando el porqué, no el qué.

**Prohibido:** bajar una aserción para que un test pase. Si un test se pone
rojo, se investiga; si el comportamiento correcto cambió, se cambia el test **y
se explica por qué en el commit**.

---

## Hito 1 · Infraestructura del frontend

**Objetivo:** poder correr un test. Nada más.

- Vitest + React Testing Library + `jsdom`. Vitest porque el backend ya lo usa:
  un solo runner en el monorepo, mismas convenciones.
- `npm test`, `npm run test:watch`, `npm run test:coverage` en `package.json`,
  con los mismos nombres que el backend.
- Setup con los mocks que **todo** componente de esta app necesita, o cada test
  los va a re-inventar:
  - `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`)
  - `next-intl` (`useTranslations` → devolver la clave tal cual)
  - `next/image`
  - un `QueryClientProvider` con `retry: false`
  - `AuthProvider` con un usuario configurable
- Un helper `renderConProviders(ui, { user })` que envuelva todo eso. **Si cada
  test arma sus providers a mano, nadie escribe tests.**

**Terminado cuando:** un test tonto (`expect(true).toBe(true)`) corre, y un
componente real con `useTranslations` y React Query renderiza sin explotar.

---

## Hito 2 · Utilidades puras del frontend

Lo más barato y con mejor relación valor/esfuerzo. Sin DOM, sin mocks.

| Archivo | Qué probar |
| --- | --- |
| `src/utils/imageVariants.ts` | la cadena variante → original → placeholder |
| `src/components/publications/publicationUtils.ts` | `formatNumberValue`, resolución de imágenes, `isLandCategory` |
| `src/utils/publicationUrl.ts` | slug vs id numérico |
| `src/utils/backendUrl.ts` | paths absolutos vs relativos |
| `src/utils/avatarUtils.ts` | iniciales, incluidos nombres vacíos y con acentos |

**Casos borde obligatorios**, porque son los que aparecen en producción:
`null`, `undefined`, `""`, `"0"`, y **strings donde el tipo dice `number`**.
Esto último no es hipotético: el backend manda `pub_id` e `id` como string
porque son `numeric` en Postgres, y eso ya causó un bug real de favoritos.

---

## Hito 3 · Componentes de alto riesgo

No cubrir todo. Cubrir donde un fallo se nota y cuesta.

1. **`PublicationCard`** — precio y moneda; parqueos solo si hay ≥1 y no es
   terreno; corazón de favorito según `isFavorite`; fallback de imagen.
2. **`useFavorites`** — el optimista y su reversión al fallar. Este hook ya se
   rompió dos veces: una por usar `getQueryData` (exacto) en vez de
   `getQueriesData` (por prefijo), otra por comparar ids con `===` entre string
   y número. **Los dos casos tienen que estar cubiertos.**
3. **`HeaderSearch`** — que **no** dispare consulta con menos de 2 caracteres, y
   que no vuelva a pedir el catálogo completo. Un test que afirme que la URL
   llamada lleva `limit`.
4. **`PautaMain`** — que las vendidas y pausadas no aparezcan en el selector.
5. **Formularios de auth** — validación de Formik, estados de error, y que la
   contraseña nunca se loguee ni aparezca en el DOM.

---

## Hito 4 · Huecos del backend

Comparar `git grep -E "^app\.(get|post|put|delete)" server.js` contra los specs
existentes. Priorizar por **daño si falla**, no por facilidad:

1. **Dinero** — `/campaigns` (crédito, presupuesto, devoluciones),
   `/getplans`, suscripciones. Errores acá se pagan literalmente.
2. **Permisos** — para cada endpoint autenticado: sin sesión → 401; con la
   sesión de otro → no toca lo ajeno. Ya aparecieron **dos** IDOR de esta forma
   (`/my-publications` de lectura, `/changeinfoc` de escritura). **Asumir que
   hay más.**
3. **Subidas** — límites de tamaño, tipos rechazados, HEIC, y que la cola no
   pierda trabajo bajo presión.
4. **Mensajería y notificaciones.**

**Para cada endpoint autenticado, escribir siempre estos tres:** sin sesión,
con sesión ajena, con sesión propia.

---

## Hito 5 · End-to-end

Recién cuando 1–4 estén hechos. Playwright, contra el backend real con base de
prueba.

**Cinco flujos, no más.** Los E2E son caros de mantener y frágiles; que cubran
lo que de verdad no puede romperse:

1. Registro → verificación → login → logout
2. Publicar una propiedad con fotos → verla en el listado → abrir el detalle
3. Buscar y filtrar → paginar → guardar favorito → verlo en favoritos
4. Crear campaña de pauta → aparece en destacados → vender → desaparece
5. Cerrar sesión y confirmar que **la sesión quedó cerrada de verdad**

---

## Hito 6 · CI

- GitHub Actions: backend y frontend en jobs separados.
- **Node 22.** El CI está en Node 20, que ya es EOL, y esa diferencia viene
  causando desincronizaciones del `package-lock.json` entre npm 10 y npm 11
  (`ecommerceGTBackEnd` lo sufrió varias veces).
- Servicio de Postgres para los tests del backend.
- Correr en cada PR. **No** bloquear el merge todavía: primero estabilizar.

---

## Reglas de convivencia

- **Una rama y un PR por hito.** No un PR gigante.
- **No tocar código de producción** salvo que un test descubra un bug real. Si
  lo descubre: arreglarlo en un commit **aparte**, con el test que lo demuestra.
- **No bajar coberturas ni saltar tests** (`.skip`, `.only`) en lo que se
  entregue.
- Si un test resulta intermitente, **no reintentarlo**: encontrar la causa. En
  este proyecto la causa fue siempre estado compartido entre specs.

---

## Definición de terminado, por hito

1. Los tests del hito pasan **tres corridas seguidas** de la suite completa.
   Una sola corrida verde no distingue "pasa" de "pasa a veces".
2. Cada test nuevo se vio **en rojo** al romper a propósito lo que prueba.
3. El PR dice, para cada archivo, **qué defecto previene**.
4. Los 240 tests que ya existían siguen verdes.

---

## Qué reviso yo al final

- Que los tests **fallen** cuando deben: voy a romper código a propósito y
  correrlos.
- Que no haya aserciones de adorno (`expect(res.status).toBe(200)` y nada más).
- Que el aislamiento sea real: voy a correr la suite varias veces y en distinto
  orden.
- Que ningún test dependa de datos que otro spec dejó.
- Que los tres casos de permisos estén en **todos** los endpoints autenticados.
