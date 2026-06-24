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

### Respuestas a las preguntas técnicas del Handoff #10 §4 (verificado en backend, 2026-06-13)

**Pauta / wallet:**
1. **No hay tabla de wallet con movimientos.** El saldo es UNA columna
   `customer.cus_ad_credit NUMERIC(10,2)` (Fase 10.2). Crece cuando una campaña
   expira con presupuesto no gastado y se consume al crear campañas. **No hay
   ledger** que distinga recarga vs referido vs gasto. Para "movimientos" (y para
   los Q50 de referidos con origen marcado) habría que crear una tabla
   `ad_credit_movements`. → cambio de backend.
2. **Recarga con tarjeta: NO existe** (no hay endpoint). Los métodos con tarjeta
   en /pauta ya son stub. Recargar saldo requiere pasarela real (misma que
   suscripciones, también stub) — decisión + backend. El botón "Recargar saldo"
   que agregué hoy es un stub (toast "próximamente").
3. **Costos de impresión/clic: reales y configurables** por admin
   (`platform_config` vía /admin/config). No son placeholder.
4. **Descuento de saldo: lazy, no tiempo real.** Se procesa al abrir /pauta
   (y en endpoints de campaña); no hay job en tiempo real por impresión/clic.
5. **Una pub = una campaña activa: confirmado.** El front bloquea pubs con
   campaña active/paused (`lockedPubIds`) y el backend valida igual. Es la regla.

**Referidos Q50 — NADA existe aún (es feature nueva de backend):**
6. **No hay tabla de referidos.** El único "invitation" es `company_invitations`
   (invitar miembro a una empresa, con token) — NO es referido. La pantalla
   `/invite/[token]` actual es esa aceptación de empresa, no el programa Q50.
7. **No hay evento que acredite Q50.** Habría que: webhook/transacción en la
   PRIMERA compra de pauta exitosa del invitado → acreditar Q50 a ambos
   (`cus_ad_credit += 50`), idempotente (marca para no duplicar).
8. **No hay código de referido por usuario** ni `invited_by` en el registro.
   Hay que generarlo (ej. `ANA2026`) y guardarlo al registrarse el invitado.
9. **Crédito sin tope/vencimiento:** hoy `cus_ad_credit` se gasta igual sin
   marca de origen. Si los Q50 deben ser "no reembolsables" o trazables, se
   necesita el ledger del punto 1.

**Conclusión H10 §2 (/invite Q50):** es **pantalla nueva + sistema de backend
completo** (tabla referidos + código por usuario + acreditación idempotente en
primera compra + opcional ledger de movimientos). Sin backend, el front solo
puede ser una **cáscara** (link de invitación derivado del usuario, progreso en
placeholder). Requiere autorización + diseño del esquema de referidos.

### Del handoff #10 — Pauta · /invite · /messages (2026-06-13, Claude Code)

Implementado: re-skin de `PautaMain` (saldo navy + objetivos lavanda), cáscara
`/invite`, y /messages responsive (hilo + inbox + info-panel a tokens, barra de
contexto de propiedad con botón 3D).

- [H10-1] **`/invite` choca con `/invite/[token]` (invite de empresa).** El enlace
  de referido que pide el diseño es `kiosqui.com/invite/CODE`, pero esa ruta ya es
  la aceptación de invitación de EMPRESA. La nueva pantalla de referidos quedó en
  `/invite` (índice), sin tocar `/invite/[token]`. **Falta decidir la ruta de canje
  del referido** (recomiendo `?ref=CODE` en registro, o `/r/CODE`). Está en el
  prompt de Codex (`docs/phases/codex-prompt-referrals-q50.md` §4).
- [H10-2] **`/invite` es cáscara honesta, no funcional.** Backend de referidos no
  existe (§4). El código/enlace es **vista previa** derivada del `handle`; Copiar y
  compartir muestran toast "próximamente" (mismo patrón que "Recargar saldo"); el
  progreso arranca en **cero**; el saldo sí es real (`useAdCredit`). No se inventan
  datos de referidos ni se reparte un enlace que aún no canjea. El prompt para Codex
  ya está listo para volverla funcional.
- [H10-3] **Barra de propiedad en /messages: sin precio ni imagen reales.** El
  `inbox` solo trae `contact_name`, `contact_image`, `pub_title` — **no** precio ni
  thumb de la publicación. Por eso la barra usa un **thumb placeholder navy** (igual
  que el reference de diseño) + título + accesos "Ver publicación" / "Modelo 3D".
  Si se quiere mostrar precio/foto reales en el hilo, el endpoint de inbox debería
  incluirlos (o el front haría un fetch extra del detalle). → posible cambio backend.
- [H10-4] **Botón "3D" siempre visible** aunque la publicación no tenga modelo GLB
  (el inbox no expone si hay GLB). El visor `/publications/:id/viewer` maneja su
  propio estado vacío. Si molesta, exponer un flag `hasGlb` en el inbox para ocultar
  el botón. → posible cambio backend.
- [H10-5] **Send del composer ahora es verde de marca** (reemplaza el degradado
  azul-morado de `.fill-btn`). Recordatorio del gap global ya listado: `.fill-btn`
  (header "Publicar", registros, etc.) **sigue** con el degradado Oction; falta el
  sistema de botón de marca para reemplazarlo en todos lados.

### Del handoff #11 — Decisiones de diseño (2026-06-13, Claude Code)

**CORRECCIÓN a [H10-5]:** el sistema de botón global YA estaba migrado en un WP
previo — `.fill-btn` en `_common.scss` es verde de marca y sus variantes lo
extienden; **no quedan gradientes Oction en los partials** (`_about/_art/_creator/
_footer/_custome`). El gap [H10-5] estaba desactualizado. La Prioridad #1 del #11
ya estaba cumplida (solo se verificó).

Aplicado en #11:
- **§3 Rating:** ya estaba en `--rating` (verde) en los componentes de estrellas
  (CreatorProfile `Stars`, Survey, TopSellers). El único `#f59e0b` restante era el
  marcador de fila "pautada" en soporte → pasado a lavanda.
- **§4 Badges:** chip/fila "pautada" (#fbbf24/#d97706/#f59e0b) → lavanda; precio
  dorado del visor 3D → `--fg-strong`; warning/danger de DangerZone → tokens
  `--warning`/`--danger`; avatares de iniciales (CreatorSingle/CompanyProfile) con
  gradiente morado Oction → gradiente navy de marca.
- **Leak nuevo encontrado y corregido:** `--tp-theme-1` (acento secundario Oction
  #6c5ce7) NO estaba remapeado en el bridge → ~12 usos (RegisterForm, sidebars,
  comentarios, like-buttons) renderizaban morado fijo en ambos temas. Remapeado a
  lavanda de marca en `bridge.css`.
- **§5 Logo:** `KiosquiLogo` ya hacía swap cream/navy por tema. Confirmado.
- **§6/§7 /messages:** **[RESUELVE H10-3 y H10-4].** La barra de propiedad ahora
  trae datos REALES (thumb, precio·zona) resolviendo el detalle de la pub vía
  `usePublicationDetail` (1 conversación = 1 fetch cacheado, sin tocar backend),
  con fallback al placeholder navy. El botón "Modelo 3D" ahora es condicional a
  `hasGlb`. El detalle ya gateaba el 3D; la pub-card no tiene acceso 3D.
- **§2 Invite:** **[RESUELVE H10-1].** Namespacing aplicado — empresa a
  `/invite/team/[token]`, referido personal en `/invite` (panel) + `/invite/[code]`
  (canje → `/register?ref=`). Banner "te invitaron" en el registro.

Gaps NUEVOS (fuera del scope de #11, para decisión de Design):
- [H11-1] **Dorado de "empresa verificada" (`#d4af37`→`#f1c75b`)** en `.cp-badge`,
  anillo de avatar de empresa y hover de cards (`CompanyMain`, `CompanyProfileMain`).
  No es leak Oction (no es azul/morado); es una identidad premium gold. **¿Se alinea
  a marca (verde/lavanda de "verificado") o se mantiene el oro premium?** No lo toqué.
- [H11-2] **Chips de categoría internos de soporte** (`.sr-chip-publication` ámbar,
  `.sr-chip-message` teal): leyenda categórica de una tabla admin interna, no badges
  de marca. Se mantienen como diferenciadores funcionales.
- [H11-3] **Banner "te invitó X" sin nombre/avatar:** sin backend de referidos no
  se resuelve el nombre del invitador desde el code. El banner muestra la versión
  genérica; necesita `GET /referrals/validate/:code` (ya en el prompt de Codex).
- [H11-PENDIENTE → HECHO] **§8 /pauta rediseño completo** — APLICADO (ver sección #12/#13).

### Del handoff #12 + #13 — Listado/Detalle/Comentarios · Favicon · 3D · Pauta (2026-06-14, Claude Code)

Aplicado vía 4 subagentes en paralelo (listado, detalle, comentarios, pauta) +
favicon. `tsc --noEmit` y `next build` limpios. La i18n se fusionó central
(deep-merge aditivo) para evitar colisiones en los JSON compartidos.

- **Favicon (#13 §1):** `metadata.icons` NO se aplicaba porque el archivo de
  convención `src/app/favicon.ico` (viejo) tiene precedencia. Solución: convención
  de archivos `src/app/icon.png` (512) + `apple-icon.png` (180), removido el ico
  viejo. (Es la alternativa que el propio handoff sugería.)
- **/pauta (#11 §8):** constructor ambicioso aplicado (slider + estimado en vivo +
  resumen sticky), lógica preservada.

Gaps NUEVOS / decisiones (para Design + equipo):
- [H12-1] ⚠️ **Listado: el fix real es BACKEND.** Se aplicó toda la UI (barra
  cohesiva, chips, estados, grid default, toggle+localStorage) PERO el filtrado/orden
  sigue **client-side** sobre el set cargado. El contador y la completitud reales
  necesitan el **endpoint de búsqueda server-side con filtros + paginación** (§1.0 del
  handoff). Marcado `// TODO(backend)`. Sin esto, los filtros se ven bien pero el bug
  de fondo persiste. → coordinar con `ecommerceGTBackEnd`.
- [H12-2] **Detalle: `PublicationContent.tsx` quedó huérfano.** El nuevo layout
  consolidó todo inline, así que ese componente ya no se renderiza (no se borró). Con
  él se dejaron de mostrar: las **tabs Info/Características** y los campos **frente/fondo
  de terreno**. Si se quieren conservar esos datos (sobre todo frente/fondo para
  TERRENOS, donde cuartos/baños no aplican y salen "no especificado"), hay que portarlos
  como tiles/condicionales. → decisión de Design.
- [H12-3] **Detalle sin badge "Destacado" ni rating numérico:** `PublicationDetail`
  (backend) no trae flag de destacado/pauta ni un rating numérico del vendedor. El badge
  Destacado se omitió y el "rating" usa la estrella verde con el **conteo de
  publicaciones** del vendedor (dato real) en vez de un "4.9" inventado. Para un rating
  real (ej. 4.9 ★) se necesita backend.
- [H12-4] **Fidelidad:** los handoffs #12/#13 + `batch_d/*.jsx` viven en el checkout
  principal (sin commitear), así que los subagentes de listado y comentarios no pudieron
  leerlos y trabajaron del brief `docs/phases/kiosqui-request-modern-views.md` + las
  specs del prompt. Cubre todos los requisitos, pero conviene un repaso visual fino
  contra los artboards de `Batch D` por si algún detalle de spacing/color difiere.
- [H12-5] **Detalle/Comentarios sin verificación visual con datos:** requieren auth +
  backend (CORS del backend solo permite :3000, no el preview :3117). Verificados por
  `tsc`/`build` + el listado/registro/favicon sí se vieron en preview.

### Del handoff #16 — Cuenta + Empresa (2026-06-17, Claude Code)

Aplicado vía workflow (5 agentes en paralelo, uno por archivo) con **verificación
adversarial por archivo** (lógica intacta + on-brand + sin bug de scope styled-jsx).
`tsc --noEmit` y `next build` limpios. Solo skin + markup; hooks/mutations/Formik/fetch
intactos. Cubre §1 (tabs DangerZone, Verificar cuenta, Métodos de pago, Configuración de
cuenta) y §2 (perfil público de empresa). El swap de logo del header (§0) ya estaba
correcto (`KiosquiLogo` con `useTheme()` en `HeaderTwo`).

Gaps NUEVOS / decisiones (para Design + backend):
- [H16-1] ⚠️ **Empresa: falta el stat "Calificación" (★ verde).** `CompanyProfileData`
  (`GET /company-profile/:id`) NO trae `rating`/`avgrating`, así que se omitió en vez de
  inventar un "4.8". Se dejaron los dos stats reales (Empleados, Publicaciones). → para
  el stat de rating se necesita **campo backend**.
- [H16-2] ⚠️ **Empresa: falta el badge "Admin" en empleados.** `CompanyProfileEmployee`
  expone solo `cusid/firstname/lastname/handle/imagenu`; el tipo dice explícitamente
  *"por seguridad NO se expone el rol de administrador en este endpoint"*. Sin `isAdmin`
  no se puede pintar el badge. → decidir si el rol es público; si sí, exponer flag.
- [H16-3] **Empresa: botón "Contactar" enlaza a `/messages` (bandeja), no abre chat con
  la empresa.** El perfil se identifica por `busid` (negocio), y `/messages?with=` espera
  un `cusid` (cliente); no hay forma de derivar el destinatario. El de vendedor sí usa
  `?pub=&with=${cus_id}`. → exponer el `cusid` de contacto de la empresa (o una ruta de
  contacto dedicada) para abrir conversación directa. Se i18n-keó `company.contact`.
- [H16-4] **Config de cuenta: se quitó la edición de PORTADA.** El mockup de cuenta usa
  franja uniforme navy→lavanda (sin imagen de portada subible), así que la subida de
  portada que existía ya no tiene UI. Si los usuarios deben poder cambiar su portada, hay
  que reubicar esa acción (¿perfil público `/creator-profile`?) o re-agregarla. → decisión
  de Design. (El avatar con badge de cámara sí se conservó.)
- [H16-5] **Pantallas de empresa del DUEÑO sin mockup en Batch E.** `CompanyMain`
  (`/company`, dashboard) y `CompanyTeamMain` (`/company/equipo`, gestión de equipo +
  invitaciones) son de gestión, NO el perfil público. Batch E solo trae el perfil público
  (`/empresa/[id]`). No se re-skinearon para no inventar un layout de gestión. → si se
  quieren on-brand, hace falta un artboard.
- [H16-6] **Fidelidad:** igual que [H12-4], `batch_e/*.jsx` + `16-HANDOFF` viven solo en
  el checkout principal (sin commitear), así que los agentes (que corren en el worktree) no
  los vieron y trabajaron del brief en prosa derivado de `CompanyScreen.jsx`. Conviene un
  repaso visual fino contra los artboards de `Batch E`.
- [H16-7] **Copy voseo en tabs de cuenta:** se pasó a voseo el texto **hardcodeado** (no
  i18n) que se tocó (`Usá una contraseña…`, `escribinos a soporte`, `no tenés…`). Queda
  copy tuteo pre-existente en `VerifyAccountTab` (`Verifica`, `Sube el RTU`, `Puedes
  corregir`) que NO se tocó por ser fuera de alcance del skin → pasarlo en un barrido de
  copy/i18n (Fase 14).

### Del handoff #17 — Portal de Soporte (staff) + Admin (Batch F) (2026-06-24, Claude Code)

Base compartida nueva (`StaffShell` sidebar + `DataTable`/`StatusChip`/`RoleBadge`/`Av`/
`FilterTabs` en `staffUi.tsx` + `staff.css`), aplicada a 8 pantallas vía workflow con
verificación adversarial por archivo. `batch_f/` + HTML + handoff **commiteados** primero
(la lección de Batch E aplicada → esta vez los agentes sí leyeron el mockup). `tsc` +
`next build` OK; medición sintética del shell (sidebar 240, activo navy, content min-width:0).

Gaps NUEVOS / decisiones (para Design + backend):
- [F-1] ⚠️ **Usuarios: faltan la columna "Pub." y el filtro "Staff" del mockup.**
  `SupportUserRow` no trae conteo de publicaciones y el estado de filtro es solo
  `''|active|suspended|banned` (sin `staff`). Se omitieron para no inventar dato/estado. →
  backend: exponer conteo de pubs por usuario; producto: decidir si se agrega agrupación "Staff".
- [F-2] ⚠️ **Admin · Configuración: el mockup tiene un "Guardar cambios" global; la pantalla
  real guarda POR CAMPO** (cada campo tiene su save + la moneda aplica al instante). No hay
  handler global, así que NO se agregó el botón del header (sería fabricar lógica). → decisión
  Design/backend: ¿unificar a guardado global (requiere hook/endpoint nuevo) o el mockup adopta
  el guardado por campo?
- [F-3] **Admin · Imágenes: no existe "dimensiones recomendadas" separadas** de las
  `width/height` ya almacenadas; la línea "recomendado" usa el tamaño real. Si las recomendadas
  deben diferir, backend debe exponer un campo aparte.
- [F-4] **Detalle de ticket lo ve el DUEÑO además del staff.** `/soporte/tickets/[id]` se abre
  desde "Mis tickets". Se hizo el `StaffShell` **condicional**: staff = sidebar; dueño = marco
  simple sin sidebar (siguiendo la regla de que no-staff no ve el portal staff). Los controles
  de estado/asignar/nota-interna ya estaban gateados por `viewerIsStaff`. → confirmar con Design
  que esa vista del dueño es la deseada.
- [F-5] **Denuncias: la pantalla real es un superset del mockup.** El mockup modela solo
  publicaciones; el real maneja 3 tipos (comentario/mensaje/publicación) con pill de tipo,
  badge de campaña "pautada", modal de conversación y 3 acciones (Descartar / Eliminar
  contenido / Sancionar autor) con reembolso de campaña. Se preservó todo lo real (no se
  colapsó al shape del mockup).
