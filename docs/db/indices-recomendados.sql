-- ============================================================================
-- Índices recomendados — KIOSQUI / ecommerceGT
-- ============================================================================
-- ANTES DE CORRER ESTO: pasá docs/db/auditoria-esquema.sql y creá SOLO lo que
-- la sección 4 marque como ALTA y siga faltando. Crear un índice que ya existe
-- con otro nombre es peso muerto: ocupa disco y encarece cada INSERT.
--
-- Todos usan CONCURRENTLY para no bloquear escrituras en producción. Eso obliga
-- a correrlos FUERA de una transacción: pasalos con `psql -f`, uno por uno, no
-- dentro de BEGIN/COMMIT. Si uno falla queda en estado INVALID: se borra con
-- DROP INDEX y se reintenta.
--
-- El motivo de cada uno sale de las queries reales de connPostgresDB.js, no de
-- una regla general. Si la query cambia, el índice deja de servir.
-- ============================================================================

-- ── Mensajería ──────────────────────────────────────────────────────────────
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

-- getConversation: WHERE m.pub_id = $1 AND (par de participantes).
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation
    ON ecom.messages (pub_id, sender_id, receiver_id);

-- ── Listado de publicaciones ────────────────────────────────────────────────
-- getPublications resuelve isFavorite con una subconsulta correlacionada que se
-- ejecuta UNA VEZ POR FILA del listado. Sin índice eso es un scan de favoritos
-- por cada publicación mostrada: el costo crece con el producto de las dos
-- tablas, no con la suma.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pubfav_cus_pub
    ON ecom.publications_favorites (cus_id, pub_id);

-- Contador de favoritos por publicación (handle público, Fase 4).
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pubfav_pub
    ON ecom.publications_favorites (pub_id);

-- INNER JOIN en todo listado, más la subconsulta de imagen principal
-- (SELECT pubima_url ... WHERE a.pub_id = p.pub_id LIMIT 1).
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pubimg_pub
    ON ecom.publications_images (pub_id);

-- getMyPublications: WHERE p.cus_id = $1 ORDER BY p.pub_create_date DESC.
-- Compuesto para que el ORDER BY salga del índice y no de un sort en memoria.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_publications_cus_fecha
    ON ecom.publications (cus_id, pub_create_date DESC);

-- ── Búsqueda por ubicación (Fase 19) ────────────────────────────────────────
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pubdet_cit
    ON ecom.publications_detail (cit_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pubdet_tow
    ON ecom.publications_detail (tow_id);

-- Rango de precio: el filtro más usado del buscador. Incluye la moneda porque
-- con USD y GTQ conviviendo, comparar precios sin discriminar moneda mezcla
-- Q 1,000,000 con US$ 1,000,000. Solo crealo si pubdet_currency ya existe.
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pubdet_moneda_precio
--     ON ecom.publications_detail (pubdet_currency, pubdet_price);

-- ── Social ──────────────────────────────────────────────────────────────────
-- JOIN al autor en cada hilo de comentarios.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pubcom_cus
    ON ecom.publications_comments (cus_id);

-- Perfil público del vendedor: promedio de estrellas y conteo de reseñas.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_ratings_seller
    ON ecom.seller_ratings (seller_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_ratings_pub
    ON ecom.seller_ratings (pub_id);

-- ── Documentado en MIGRATION.md pero verificá que exista (Fase 22) ──────────
-- URLs canónicas con slug: se resuelve por slug en cada detalle de publicación.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_publications_pub_slug
    ON ecom.publications (pub_slug);
