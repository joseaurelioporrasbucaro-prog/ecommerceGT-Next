-- ============================================================================
-- Auditoría de esquema — KIOSQUI / ecommerceGT
-- ============================================================================
-- Uso:
--   psql "$DATABASE_URL" -f docs/db/auditoria-esquema.sql
--
-- Qué hace: compara la BD viva contra el inventario de tablas e índices que
-- documentan MIGRATION.md, docs/PENDIENTES.md y el database.sql del backend.
-- No modifica nada. Solo seis SELECT.
--
-- Por qué existe: no hay runner de migraciones. Cada fase se aplicó a mano con
-- ALTER/CREATE sueltos, así que la única forma de saber qué le falta a una BD
-- concreta (dev, staging, prod) es preguntárselo.
-- ============================================================================

\echo ''
\echo '=== 1. TABLAS ESPERADAS QUE NO EXISTEN ====================================='

WITH esperadas(tabla, fase, origen) AS (VALUES
    -- Núcleo original (database.sql)
    ('cat_country','base','database.sql'),
    ('cat_city','base','database.sql'),
    ('cat_town','base','database.sql'),
    ('cat_gender','base','database.sql'),
    ('cat_password_status','base','database.sql'),
    ('cat_business_status','base','database.sql'),
    ('cat_publication_status','base','database.sql'),
    ('cat_publication_gender','base','database.sql'),
    ('cat_publication_transac','base','database.sql'),
    ('cat_publication_transac_x_gender','base','database.sql'),
    ('cat_login_type','base','database.sql'),
    ('subscriptions','base','database.sql'),
    ('business','base','database.sql'),
    ('customer','base','database.sql'),
    ('customer_subscription','base','database.sql'),
    ('publications','base','database.sql'),
    ('publications_detail','base','database.sql'),
    ('publications_images','base','database.sql'),
    ('publications_favorites','base','database.sql'),
    ('seller_ratings','7','database.sql'),
    ('publications_comments','4.2','database.sql'),
    ('comment_reports','8.4','database.sql'),
    ('comment_likes','4.3','database.sql'),
    ('messages','6.1','database.sql'),
    -- Agregadas después del corte de database.sql (MIGRATION.md)
    ('password_reset_tokens','8.3.5','MIGRATION.md'),
    ('customer_follows','9','MIGRATION.md'),
    ('notifications','6.3.1','MIGRATION.md'),
    ('message_reactions','6.2','MIGRATION.md'),
    ('message_reports','6.2','MIGRATION.md'),
    ('verification_requests','8.1','MIGRATION.md'),
    ('ad_campaigns','10','MIGRATION.md'),
    ('platform_config','10.7','MIGRATION.md'),
    ('cat_amenities','19.5','MIGRATION.md'),
    ('publications_amenities','19.5','MIGRATION.md'),
    ('site_assets','15','MIGRATION.md'),
    ('customer_audit_log','12.2','MIGRATION.md'),
    ('customer_payment_methods','11','MIGRATION.md'),
    ('publication_reports','8.4','MIGRATION.md'),
    ('tickets','8.5','MIGRATION.md'),
    ('ticket_messages','8.5','MIGRATION.md'),
    -- Existen en la BD viva pero NO están en MIGRATION.md (PENDIENTES.md B5)
    ('referrals','referidos','PENDIENTES.md'),
    ('ad_credit_movements','referidos','PENDIENTES.md')
)
SELECT e.tabla, e.fase AS "fase que la creó", e.origen AS "documentada en"
FROM esperadas e
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables t
    WHERE t.table_schema = 'ecom' AND t.table_name = e.tabla
)
ORDER BY e.origen, e.tabla;

\echo ''
\echo '=== 2. TABLAS EN LA BD QUE NADIE DOCUMENTÓ ================================='
\echo '(lo que otro dev creó sin anotarlo — revisar antes de asumir que sobra)'

WITH esperadas(tabla) AS (VALUES
    ('cat_country'),('cat_city'),('cat_town'),('cat_gender'),('cat_password_status'),
    ('cat_business_status'),('cat_publication_status'),('cat_publication_gender'),
    ('cat_publication_transac'),('cat_publication_transac_x_gender'),('cat_login_type'),
    ('subscriptions'),('business'),('customer'),('customer_subscription'),
    ('publications'),('publications_detail'),('publications_images'),
    ('publications_favorites'),('seller_ratings'),('publications_comments'),
    ('comment_reports'),('comment_likes'),('messages'),('password_reset_tokens'),
    ('customer_follows'),('notifications'),('message_reactions'),('message_reports'),
    ('verification_requests'),('ad_campaigns'),('platform_config'),('cat_amenities'),
    ('publications_amenities'),('site_assets'),('customer_audit_log'),
    ('customer_payment_methods'),('publication_reports'),('tickets'),('ticket_messages'),
    ('referrals'),('ad_credit_movements')
)
SELECT t.table_name AS tabla,
       pg_size_pretty(pg_total_relation_size(format('ecom.%I', t.table_name)::regclass)) AS peso
FROM information_schema.tables t
WHERE t.table_schema = 'ecom'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT IN (SELECT tabla FROM esperadas)
ORDER BY pg_total_relation_size(format('ecom.%I', t.table_name)::regclass) DESC;

\echo ''
\echo '=== 3. ÍNDICES ESPERADOS QUE NO EXISTEN ===================================='

WITH esperados(indice, tabla, fase) AS (VALUES
    ('customer_handle_unique','customer','4'),
    ('idx_publications_comments_pub_id','publications_comments','4.2'),
    ('idx_publications_comments_parent_id','publications_comments','4.2'),
    ('idx_comment_likes_comment_id','comment_likes','4.3'),
    ('idx_prt_token_hash','password_reset_tokens','8.3.5'),
    ('idx_prt_cus_id_expires','password_reset_tokens','8.3.5'),
    ('customer_follows_followed_idx','customer_follows','9'),
    ('idx_notifications_recipient_unread','notifications','6.3.1'),
    ('idx_message_reactions_message_id','message_reactions','6.2'),
    ('idx_message_reports_message_id','message_reports','6.2'),
    ('uq_verification_pending_personal','verification_requests','8.1'),
    ('uq_verification_pending_business','verification_requests','8.1'),
    ('idx_ad_campaigns_status','ad_campaigns','10'),
    ('idx_ad_campaigns_cus','ad_campaigns','10'),
    ('idx_pub_amen_amen_id','publications_amenities','19.5'),
    ('idx_publications_pub_slug','publications','22'),
    ('idx_audit_email_hash','customer_audit_log','12.2'),
    ('idx_audit_dpi_hash','customer_audit_log','12.2'),
    ('idx_audit_phone_hash','customer_audit_log','12.2'),
    ('idx_audit_fraud_flag','customer_audit_log','12.2'),
    ('idx_pm_one_default_per_user','customer_payment_methods','11'),
    ('idx_publication_reports_status','publication_reports','8.4'),
    ('idx_tickets_status','tickets','8.5'),
    ('idx_tickets_assigned','tickets','8.5')
)
SELECT e.indice, e.tabla, e.fase,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.tables t
           WHERE t.table_schema='ecom' AND t.table_name = e.tabla
       ) THEN 'la tabla existe — falta solo el índice'
         ELSE 'falta la tabla entera'
       END AS diagnostico
FROM esperados e
WHERE NOT EXISTS (
    SELECT 1 FROM pg_indexes i
    WHERE i.schemaname = 'ecom' AND i.indexname = e.indice
)
ORDER BY e.tabla, e.indice;

\echo ''
\echo '=== 4. LLAVES FORÁNEAS SIN ÍNDICE =========================================='
\echo '(Postgres NO indexa el lado que referencia. La prioridad sale de las queries'
\echo ' reales de connPostgresDB.js, no del tamaño de la tabla.)'

WITH calientes(tabla, columna, motivo) AS (VALUES
    ('messages','receiver_id',  'getUnreadCount: WHERE receiver_id AND is_read=false, en cada poll'),
    ('messages','sender_id',    'getInbox: WHERE sender_id=$1 OR receiver_id=$1'),
    ('messages','pub_id',       'getConversation: WHERE m.pub_id=$1 + JOIN por conversacion'),
    ('publications_favorites','cus_id','getPublications: subconsulta correlacionada por CADA fila'),
    ('publications_favorites','pub_id','misma subconsulta; el par (cus_id,pub_id) es el que sirve'),
    ('publications_images','pub_id',   'INNER JOIN en todo listado + subconsulta de imagen principal'),
    ('publications','cus_id',          'getMyPublications: WHERE p.cus_id=$1 ORDER BY fecha'),
    ('publications_detail','cit_id',   'filtros de busqueda por departamento (Fase 19)'),
    ('publications_detail','tow_id',   'filtros de busqueda por municipio (Fase 19)'),
    ('publications_comments','cus_id', 'JOIN al autor en cada hilo de comentarios'),
    ('seller_ratings','seller_id',     'perfil publico del vendedor: promedio y conteo'),
    ('seller_ratings','pub_id',        'estado de calificacion por publicacion')
)
SELECT CASE WHEN h.motivo IS NOT NULL THEN 'ALTA' ELSE 'baja' END AS prioridad,
       cl.relname AS tabla,
       a.attname  AS columna,
       COALESCE(h.motivo, 'FK de catalogo o columna de baja cardinalidad') AS motivo,
       pg_size_pretty(pg_total_relation_size(cl.oid)) AS peso_tabla
FROM pg_constraint c
JOIN pg_class cl ON cl.oid = c.conrelid
JOIN pg_attribute a
  ON a.attrelid = c.conrelid
 AND a.attnum   = c.conkey[1]
LEFT JOIN calientes h
  ON h.tabla   = cl.relname
 AND h.columna = a.attname
WHERE c.contype = 'f'
  AND cl.relnamespace = 'ecom'::regnamespace
  AND NOT EXISTS (
      SELECT 1 FROM pg_index i
      WHERE i.indrelid = c.conrelid
        AND i.indkey[0] = c.conkey[1]
  )
ORDER BY prioridad, pg_total_relation_size(cl.oid) DESC, tabla, columna;

\echo '=== 5. COLUMNAS DE MONEDA (listo para USD / Centroamérica) ================='

WITH necesarias(tabla, columna, para_que) AS (VALUES
    ('publications_detail','pubdet_currency',   'moneda del precio principal (Fase 5)'),
    ('publications_detail','pubdet_price_alt',  'precio dual Q/US$ (Fase 17 — PENDIENTE backend)'),
    ('publications_detail','pubdet_currency_alt','moneda del precio alterno (Fase 17 — PENDIENTE backend)'),
    ('subscriptions','sub_currency',            'moneda del plan — hoy sub_price no dice en qué moneda está'),
    ('ad_campaigns','camp_currency',            'moneda del presupuesto de pauta'),
    ('customer','cus_ad_credit_currency',       'moneda del crédito de pauta'),
    ('customer_payment_methods','pm_currency',  'moneda del método de pago')
)
SELECT n.tabla, n.columna, n.para_que,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns col
           WHERE col.table_schema='ecom' AND col.table_name=n.tabla
             AND col.column_name=n.columna
       ) THEN 'OK' ELSE 'FALTA' END AS estado
FROM necesarias n
ORDER BY estado DESC, n.tabla, n.columna;

\echo ''
\echo '=== 6. CATÁLOGO GEOGRÁFICO (cobertura Centroamérica) ======================='

SELECT co.cou_id, co.cou_description AS pais, co.cou_code, co.cou_currency AS moneda,
       (SELECT count(*) FROM ecom.cat_city ci WHERE ci.cou_id = co.cou_id)  AS departamentos,
       (SELECT count(*) FROM ecom.cat_town  tw
          JOIN ecom.cat_city ci2 ON ci2.cit_id = tw.cit_id
        WHERE ci2.cou_id = co.cou_id)                                        AS municipios
FROM ecom.cat_country co
ORDER BY co.cou_id;

\echo ''
\echo '=== fin ==================================================================='
