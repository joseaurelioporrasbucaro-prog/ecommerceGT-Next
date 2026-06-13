# Kiosqui — Feedback para Claude Design (Fase 17)

> **Canal de ida y vuelta con Claude Design.** Las IA ejecutoras (Codex / Claude
> Code) **AGREGAN** en §2 cualquier hueco que encuentren (pantalla/estado sin
> diseño, token que tendrían que inventar, decisión de producto sin resolver) y lo
> marcan `TODO(design)` en el código. Aurelio lo manda a Claude Design **en lote**,
> no fase por fase.
>
> Este archivo también ES el mensaje pendiente a Claude Design: la §1 responde lo
> que pidió en el handoff #2 (§3).

## 1. Respuestas a las 5 preguntas del handoff #2 (§3)

1. **¿bridge.css aguanta los re-skins?** Sí para color/tokens. Para markup/layout
   nuevo se usa **SCSS dedicado por feature** (`_pub-card.scss`, `_header-kq.scss`,
   `_property-detail.scss`, `_publish-flow.scss`) + primitivas de `components.css`.
   El bridge = capa de color; los partials = estructura.
2. **Componentes de alta complejidad lógica (requieren diseño extra):** `Upload/`
   (wizard + Formik/Yup + subida de imágenes/visor 3D), `AdvancedFiltersPanel`
   (estado de filtros), `PublicationContent` (galería + visor 3D + tarjeta de
   agente), `MessagesMain` (no está en el kit).
3. **Pantallas SIN referencia visual** (que Claude Design debería diseñar):
   `/messages`, `/admin`, `/soporte`, `/forum`, `/contact`, `/faq`,
   `/creator-profile*`, `/company`, `/empresa`, auth (`/login` `/register`
   `/forgot` `/verify`), legales (`/terminos` `/privacidad` `/terms`),
   `/activity`, `/invite`, `/survey`, `/pauta`. Reutilizan pub-card: `/favorites`,
   `/my-publications`. Legacy a decidir (rebrand o retiro): `/art-ranking`,
   `/wallet-connect`, `/explore-arts`, `/home-two`.
4. **Decisiones de producto:** moneda de planes → se mantiene `$` (`subscriptions.
   sub_price` no tiene columna de moneda y los seeds leen como USD; no se toca
   backend) → `TODO(currency-plan)`. Plan recomendado → `RECOMMENDED_PLAN_ID = 3`
   (frontend, sin backend).
5. **Tokens inventados localmente:** ninguno fuera del sistema. Se formaliza
   `--rating` (green-600 / green-400) en F0.2. Si un WP necesita un gris/radius
   nuevo, se agrega a `colors_and_type.css` (no local) y se reporta en §2.

## 2. Gaps nuevos encontrados durante la ejecución

> Las IA ejecutoras agregan acá. Formato:
> `- [WP-N] <hueco> — dónde: <archivo/pantalla> — qué se necesita de diseño.`

### Del handoff #3 (2026-06-10, Claude Code)

- [H3] **El ítem "Vendedores" del §3 ya no existe como ruta**: la Fase 24
  (producto) unificó Directorio+Ranking en `/ranking` con tabs. El drawer quedó
  con 6 ítems (Inicio, Propiedades, Ranking, Pauta·auth, Planes, Contacto).
  Si diseño quiere "Vendedores" como entrada aparte, hay que decidirlo con
  producto.
- [H3] **`PublicCategoriesSidebar` quedó sin disparador**: el handoff define el
  avatar (solo logueado) como único botón izquierdo, así que el panel de
  categorías para visitantes ya no se puede abrir (antes era riel fijo ≥1400px).
  Su contenido (categorías + CTA registro) está cubierto por los chips del hero
  y el CTA del drawer — pero si se quiere conservar, necesita diseño.
- [H3] **/messages (HeaderOne) sin acceso al drawer de cuenta**: HeaderOne no
  tiene avatar de perfil y perdió el riel derecho. Falta diseño de HeaderOne
  (¿mismo patrón avatar + buscador?). TODO(design) en DefaultWrapper.
- [H3] **Estados Vendida/Borrador/Anulada como badge de esquina**: no están en
  el §6 (solo Destacado/Nuevo). Se aplicó el estilo "frosted" con punto de
  color del estado (el que landing.html reserva para estados neutros), en ambos
  temas (el "verde sólido en dark" de la referencia asume estados positivos
  tipo "En renta", no aplica a "Vendida"). Validar con diseño.
- [H3] **LanguageSwitcher no existe en el prototipo del header**: se mantuvo
  (funcionalidad i18n de Fase 14), junto al theme toggle. Si molesta
  visualmente, decidir dónde vive (¿drawer?).
- [H3] **Footer**: solo se cambió el logo (transparente). El re-skin completo
  del footer (fondo ink-900, 4 columnas, "Hecho en Guatemala") sigue pendiente
  del handoff #2 §2.6 — el copy actual aún dice "Designed by BDevs".

### Del handoff #4/#5 + pulido (2026-06-10, Claude Code)

- [H5] **/verify es por LINK con token, no OTP**: el flujo real hace POST
  /verify/:token automático al abrir el enlace del correo. La pantalla de
  4 cajas de código de la referencia requeriría que backend emita códigos
  cortos (fuera de alcance sin tocar backend). Se aplicó el AuthShell con
  estados spinner/éxito/error. Decidir si se cambia el flujo a OTP a futuro.
- [H5] **/register perdió el bloque "registrarse con redes"**: eran links
  muertos del template (href="#", sin OAuth detrás). Si se quiere social
  login real, es feature de backend + diseño.
- [H5] **Auth sin theme toggle**: el ThemeChanger flotante del template se
  retiró de /login y /register (el shell no lo contempla). El tema se cambia
  desde el header del resto de la app.
- [H5] **/messages**: re-skin aplicado sobre la estructura existente
  (burbujas, composer, inbox). Pendiente del prototipo: barra de contexto de
  propiedad arriba del hilo con thumb + botón "Modelo 3D" (la estructura
  actual muestra el contexto de otra forma) y patrón lista→hilo apilado en
  mobile. Iterar en el próximo batch si hace falta.
- [Pulido] **La sección de precios de landing.html no está en la home real**:
  el pricing vive en /pricing-plan (re-skineado en handoff #1). Confirmar si
  diseño quiere ADEMÁS una sección de planes en la home.
- [WP-2] **`/my-publications` no reutiliza `PublicationCard` en el código actual**:
  la ruta monta `MyPublicationsMain`, que usa filas propias con acciones de
  propietario (editar, pautar, cerrar venta, eliminar). El re-skin `.pub-card`
  cubre `/publications`, `/favorites` y la home vía `FeaturedPublicationsSection`;
  si `/my-publications` debe adoptar cards, hace falta un diseño específico para
  esas acciones. `TODO(design)`
- [WP-3] **El chip "Oficina" no aparece si el catálogo no lo devuelve**:
  los chips de `/publications` consumen `usePublicationCategories()` para no
  hardcodear tipos. En el smoke local se renderizaron Todas/Casa/Apartamento/
  Terreno. Confirmar si "Oficina" debe existir como categoría real o si diseño
  lo trató solo como ejemplo visual. `TODO(design)`

### Del Batch B (2026-06-11, Claude Code)

- [B] **Stat "Vendidas" del perfil**: el backend no expone vendidas por
  vendedor (SellerInfo trae publicaciones/vistas/likes/followers/rating).
  La card de identidad usa las stats reales. Si "Vendidas" importa, es
  cambio de backend.
- [B] **Tab Reseñas**: sin artboard — se aplicó el lenguaje de cards del
  sistema (summary verde con score display + cards con avatar navy).
  Validar si quieren diseño detallado.
- [B] **/soporte "n guías"**: no existen guías como contenido; las topic
  cards aterrizan en las categorías reales del FAQ (?cat=) y en
  /pricing-plan. Si se quieren guías reales, es contenido nuevo.
- [B] **/contact correos**: soporte@kiosqui.gt y pauta@kiosqui.gt del mock
  quedaron con TODO(copy) — confirmar correos reales.
- [B] **Mapa de Google del template retirado** de /contact (apuntaba a
  Nueva York; sin equivalente en el diseño).

### Iteración de PublicationCard (2026-06-12, feedback de Aurelio tras ver datos reales)

> Contexto: con fotos reales cargadas, la card re-skineada (WP-2) muestra estos
> problemas. **Pedido concreto: una propuesta de card v2 donde la FOTO sea la
> protagonista** — la gente tiene que poder ver la propiedad cómodamente desde
> el listado.

- [CARD-1] **La foto queda tapada/chica**: el badge de esquina (Destacado/
  Patrocinado), el corazón de favorito y el stack de estados ocupan demasiado
  de la imagen visible. Propuestas posibles a evaluar por diseño: badges más
  compactos (solo punto+texto chico), overlay inferior en vez de superior,
  o foto más alta dentro de la card.
- [CARD-2] **Ratio de la foto — implica BACKEND**: hoy el variant `card` que
  genera el backend (sharp, en POST /upload) es **800×800 cuadrado** (q72;
  también existen thumb 200×150 y detail 1600×900). Si la propuesta cambia el
  ratio (ej. 4:3 u 3:2 panorámico para ver mejor las propiedades), hay que:
  (a) agregar un variant nuevo al pipeline del backend (requiere autorización
  de Aurelio + bloque Codigo Aurelio), y (b) decidir el fallback para las
  fotos ya subidas (usar `detail` 1600×900 recortado por CSS es una opción
  sin backend). **Diseño decide el ratio primero; nosotros dimensionamos el
  cambio después.**
- [CARD-3] **CTA "Enviar mensaje" en cards patrocinadas se ve fuera de
  sistema**: es el `ctaOverride` dorado de Fase 10.4 dentro de la card nueva
  (ver screenshot de Aurelio). Falta diseño del estado "patrocinada con CTA":
  ¿pill verde del sistema? ¿link lavanda? ¿solo el badge y el contacto vive
  en el detalle?
- [CARD-4] **Redundancia "Patrocinado"**: la sección de la home ya titula
  "Patrocinado" y cada card repite el badge — definir jerarquía (¿badge solo
  cuando la card aparece fuera de la sección patrocinada?).

### Del handoff #8 — PublicationCard v2.1 implementada (2026-06-12, Claude Code)

> Aplicado en `design/kiosqui-system` siguiendo `kiosqui-design-handoff/08-HANDOFF-CARD-V21.md`
> (canvas `Card v2 - Foto protagonista.html` §Card v2.1, CTA opción 1 verde).
> Resueltos del feedback anterior: CARD-1/CARD-3/CARD-4. CARD-2 cerrado SIN
> backend (variant `detail` 16:9 recortado a 3:2 con object-fit:cover).

- [H8-1] **Switch de divisa = doble valor REAL, NO conversión** (decisión de
  Aurelio 2026-06-12): el switch Q ⇄ US$ NO debe inventar una tasa. Se quitó la
  conversión con rate fijo (7.8) de mi v2.1. Ahora el switch **solo alterna si la
  publicación trae los dos precios reales cargados** por el dueño; con una sola
  moneda muestra ese precio estático. Esto **requiere BACKEND** (Fase 17
  dual-divisa, pendiente autorización + `Codigo Aurelio`):
  - Al publicar (`/upload`): dos campos de precio (Q y US$), **ambos opcionales
    pero al menos uno obligatorio**.
  - DB + `/savepubl` + `/publications`: persistir el segundo precio/moneda.
  - Frontend YA listo: tipos `priceAlt`/`currencyAlt` en `PublicationListItem`
    y la card los lee defensivamente (mientras el backend no los provea, cada
    card muestra una sola moneda — comportamiento correcto y seguro).
- [H8-2] **Métricas en /my-publications no existen en el endpoint**: el
  handoff §3 pidió vistas/favoritos/consultas reales en cada `OwnerRow`. El
  endpoint `GET /my-publications/:cus_id` devuelve solo `MyPublicationItem`
  (sin contadores). Quedaron con `—` y `// TODO(metrics)`. **Decisión pedida**:
  ¿extender el endpoint con contadores agregados, o agregar 3 endpoints
  separados? Implica backend → autorización + `Codigo Aurelio`.
- [H8-3] **Mobile del OwnerRow — no hice menú "⋯"**: el handoff §3 pidió
  "colapsar secundarias en menú '⋯'" en mobile. Quedó como wrap normal (las
  acciones se apilan abajo del body). Implementar dropdown ⋯ requiere otro
  componente y semántica de accesibilidad — lo dejo para una iteración con
  diseño explícito del estado abierto.
- [H8-4] **Correos `privacidad@` y `seguridad@` siguen en `kiosqui.gt`**: el
  handoff §4 confirmó `soporte@` y `ventas@` en `.com`, pero los correos
  legales de `PrivacyMain.tsx` y `messages/*/legal.json` siguen en `.gt`.
  Asumo que también van a `.com` pero NO lo cambié sin confirmación explícita
  — **¿confirmás los 4 correos como `.com`?**
- [H8-5] **Sufijo `/mes` en rentas no implementado**: el handoff §2 lo
  describe (rentas muestran "Q 4,200 /mes"). Nuestro modelo de datos no
  tiene un campo claro `is_rent` en `AnyPublicationListItem` — el
  `pubtra_id` indica venta/renta pero no es trivial de mapear sin abrir el
  catálogo. Quedó SIN sufijo. **Decisión pedida**: ¿cuál es el contrato del
  campo de "tipo de transacción"? Si se confirma, lo cableamos.
- [H8-6] **`ThemeChanger` flotante retirado de `MyPublicationsMain`** — el
  header de Kiosqui ya tiene el toggle de tema, lo dejé fuera (consistente con
  lo que se hizo en otras páginas re-skineadas del Batch B).
- [H8-7] **`isFeatured`/"Destacado" + `inSponsoredSection`**: el badge ahora se
  suprime en la home (sección rotulada). Para listados mezclados (/publications,
  búsqueda) sigue apareciendo. Nuestro modelo de datos tiene un solo flag
  (`/featured-publications` = paid pauta) — no distinguimos "Destacado" lavanda
  vs "Patrocinado" navy del canvas v2.1. **¿Es correcto usar siempre el badge
  lavanda, o querés que las cards de campañas de tipo "mensajes" usen el badge
  navy "Patrocinado" en cambio?**

### Del WP-7 — Pricing voseo + plan recomendado (2026-06-13, Claude Code)

- [WP7-1] **"Plan recomendado" es HEURÍSTICO en el front** (no hay flag en
  backend). Hoy se resalta (anillo + badge lavanda "Recomendado") el plan **pago,
  no personalizado, con mayor `pubPerUser`** del intervalo visible (desempate por
  precio); no se marca si es el plan actual del usuario. **Decisión pedida**: lo
  ideal es un campo `recommended`/`popular` en `subscriptions` (backend) para
  controlarlo desde datos en vez de adivinar. Implica backend → autorización +
  `Codigo Aurelio`. Mientras tanto la heurística es razonable pero arbitraria.
- [WP7-2] **Moneda de planes queda en `$` (USD)**: `subscriptions.sub_price` no
  tiene columna de moneda y los seeds son USD. A diferencia de las propiedades
  (que ya son Q/US$ por listing), los planes se muestran en `$`. Si la marca
  quiere planes en Q, requiere precio/moneda en el modelo de suscripciones
  (backend) — pendiente de decisión.
- [WP7-3] **Pricing no usa i18n (`t()`)**: el copy está hardcodeado en español
  (ahora voseo). La versión EN no aplica acá hasta Fase 14 (i18n). Solo se anota.
- [WP7-4] **Moneda de planes configurable desde admin (REQUIERE BACKEND)**:
  pedido de Aurelio — poder elegir desde `/admin/config` si los planes se
  muestran en Q o US$. Frontend LISTO: `plansCurrency` en `usePricingConfig`,
  toggle en `AdminConfigMain`, símbolo dinámico en el pricing. Como
  `platform_config.config_value` es NUMERIC, la clave se codifica `0=US$ / 1=Q`.
  **Backend pendiente (3 cambios)**: (a) seed `plans_currency`=0 en
  platform_config; (b) `getPricingConfig` devuelve `plansCurrency:'GTQ'|'USD'`
  (mapeando 0/1); (c) `updatePlatformConfig` acepta la key `plans_currency`.
  Hasta que exista, el toggle guarda pero el read cae a 'USD' (degrada sin romper).
  ⚠️ El toggle cambia solo el SÍMBOLO; para que los MONTOS en Q sean reales (no
  el número USD con símbolo Q) conviene un `sub_price_gtq` por plan — el front ya
  lee `priceGtq` opcional si el backend lo provee.
