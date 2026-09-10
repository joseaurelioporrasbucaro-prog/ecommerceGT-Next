-- ============================================================================
-- Índices recomendados — KIOSQUI / ecommerceGT
-- ============================================================================
-- Estos NO están en database.sql: son de rendimiento, encima de lo que el
-- archivo define. Corré primero docs/db/migracion-2026-09-10.sql para dejar la
-- base al día con el archivo; esto va después.
--
-- Revisado el 2026-09-10 contra el connPostgresDB.js de backend master
-- (ee9df52) y contra una base ya migrada. Salieron de la lista original:
--   * idx_pubimg_pub            — ya existe como idx_pub_images_pub_id.
--   * idx_pubdet_cit            — lo cubre idx_pub_detail_cit_tow (cit_id va
--                                 primero en el compuesto).
--   * idx_publications_pub_slug — ya existe. Y sobra: la columna es UNIQUE, así
--                                 que publications_pub_slug_key ya es un índice
--                                 idéntico. Hoy cada INSERT mantiene dos.
--
-- ─── CONCURRENTLY NO CORRE DENTRO DE UNA TRANSACCIÓN ────────────────────────
-- Todos usan CONCURRENTLY para no bloquear escrituras. Eso tiene dos
-- consecuencias prácticas:
--
--   * psql: `psql -f docs/db/indices-recomendados.sql` funciona, porque psql
--     manda cada sentencia por separado en autocommit.
--   * pgAdmin: NO pegues el archivo entero y aprietes F5. El Query Tool manda
--     todo el texto en un solo envío, Postgres lo trata como una transacción
--     implícita y el primer CREATE INDEX CONCURRENTLY falla con "cannot run
--     inside a transaction block". Seleccioná UNA sentencia y ejecutá solo esa
--     (F5 sobre la selección), una por una.
--   * Nunca dentro de BEGIN/COMMIT.
--
-- Si uno falla a la mitad queda en estado INVALID: se borra con DROP INDEX y se
-- reintenta. Para ver si quedó alguno:
--   SELECT indexrelid::regclass FROM pg_index WHERE NOT indisvalid;
--
-- El motivo de cada uno sale de las queries reales de connPostgresDB.js. Si la
-- query cambia, el índice deja de servir.
-- ============================================================================

-- ── ALTA — Mensajería ───────────────────────────────────────────────────────
-- `messages` no tiene hoy un solo índice fuera de la PK.

-- getUnreadCount corre en cada poll del "globito rojo": WHERE receiver_id = $1
-- AND is_read = false. Parcial, porque los leídos no se consultan nunca y son
-- la mayoría — el índice se mantiene pequeño aunque la tabla crezca.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_receiver_unread
    ON ecom.messages (receiver_id) WHERE is_read = false;

-- getInbox filtra WHERE m.sender_id = $1 OR m.receiver_id = $1. Con los dos
-- índices sueltos Postgres arma un BitmapOr; con ninguno, scan secuencial de la
-- tabla entera en cada carga de la bandeja.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender
    ON ecom.messages (sender_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_receiver
    ON ecom.messages (receiver_id);

-- getConversation (WHERE m.pub_id = $1 AND par de participantes), más el join a
-- m_last y el conteo de no leídos por conversación de getInbox. Cubre también
-- el idx_messages_pub_id que anunció el commit 01096d7 y nunca se escribió:
-- pub_id va primero.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation
    ON ecom.messages (pub_id, sender_id, receiver_id);

-- ── ALTA — Listado de publicaciones ─────────────────────────────────────────
-- columnasListado resuelve isFavorite con una subconsulta correlacionada
-- (b.pub_id = p.pub_id AND b.cus_id = $1) que corre UNA VEZ POR FILA del
-- listado. El toggle de favorito busca por el mismo par.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pubfav_cus_pub
    ON ecom.publications_favorites (cus_id, pub_id);

-- Contador de favoritos por publicación (favoritesCount y el perfil público).
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pubfav_pub
    ON ecom.publications_favorites (pub_id);

-- getMyPublications: WHERE p.cus_id = $1 ORDER BY p.pub_create_date DESC, con
-- TODOS los estados. idx_publications_cuota no sirve acá: es parcial (excluye
-- vendidas y anuladas) y no trae la fecha para el ORDER BY.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_publications_cus_fecha
    ON ecom.publications (cus_id, pub_create_date DESC);

-- ── ALTA — Perfil del vendedor ──────────────────────────────────────────────
-- Reseñas del perfil (WHERE r.seller_id = $1 AND rating_status = 'COMPLETED')
-- y el promedio de estrellas por empresa (join por seller_id).
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_ratings_seller
    ON ecom.seller_ratings (seller_id);

-- ── MEDIA — Búsqueda por municipio ──────────────────────────────────────────
-- construirFiltrosPublicaciones acepta townId solo (pd.tow_id = $n). El
-- compuesto (cit_id, tow_id) no sirve para eso si no viene también el
-- departamento.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pubdet_tow
    ON ecom.publications_detail (tow_id);

-- ── BAJA — opcionales ───────────────────────────────────────────────────────
-- Ninguna query de hoy filtra por estas columnas. Solo aceleran el chequeo de
-- FK al borrar el padre (un customer o una publicación), que hoy recorre la
-- tabla hija entera. Crealos si alguna vez se borran filas de verdad en vez de
-- anonimizar o anular.
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pubcom_cus
--     ON ecom.publications_comments (cus_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_ratings_pub
--     ON ecom.seller_ratings (pub_id);

-- ── Para la fase de dólares ─────────────────────────────────────────────────
-- Rango de precio con USD y GTQ conviviendo: comparar precios sin discriminar
-- moneda mezcla Q 1,000,000 con US$ 1,000,000. Crealo cuando el filtro de
-- precio empiece a mirar pubdet_currency (hoy no lo hace).
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pubdet_moneda_precio
--     ON ecom.publications_detail (pubdet_currency, pubdet_price);
