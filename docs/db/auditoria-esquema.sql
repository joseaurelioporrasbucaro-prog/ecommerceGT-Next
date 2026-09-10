-- ============================================================================
-- Auditoría de esquema — KIOSQUI / ecommerceGT
-- ============================================================================
-- Uso:
--   psql "$DATABASE_URL" -f docs/db/auditoria-esquema.sql
--
-- Qué hace: compara la BD viva contra el inventario de tablas e índices del
-- database.sql de backend master. No modifica nada. Solo seis SELECT.
--
-- Por qué existe: no hay runner de migraciones. Cada fase se aplicó a mano con
-- ALTER/CREATE sueltos, así que la única forma de saber qué le falta a una BD
-- concreta (dev, staging, prod) es preguntárselo.
--
-- Inventario (2026-09-10): desde el 2026-09-09 database.sql corre entero desde
-- cero y da el mismo esquema que la base de desarrollo, así que es la fuente de
-- verdad. MIGRATION.md no lo es: le faltan tablas. Si database.sql suma una
-- tabla o un índice, agregalo acá y en auditoria-pgadmin.sql.
-- ============================================================================

\echo ''
\echo '=== 1. TABLAS ESPERADAS QUE NO EXISTEN ====================================='

WITH esperadas(tabla, fase) AS (VALUES
    -- Núcleo original (cmiche, 3190aae)
    ('cat_country','base'), ('cat_city','base'), ('cat_town','base'),
    ('cat_gender','base'), ('cat_password_status','base'), ('cat_business_status','base'),
    ('cat_publication_status','base'), ('cat_publication_gender','base'),
    ('cat_publication_transac','base'), ('cat_publication_transac_x_gender','base'),
    ('cat_login_type','base'), ('subscriptions','base'), ('business','base'),
    ('customer','base'), ('customer_subscription','base'), ('publications','base'),
    ('publications_detail','base'), ('publications_images','base'),
    ('publications_favorites','base'),
    -- Agregadas por fase
    ('seller_ratings','7'), ('publications_comments','4.2'), ('comment_reports','8.4'),
    ('comment_likes','4.3'), ('messages','6.1'), ('password_reset_tokens','8.3.5'),
    ('customer_follows','7.2'), ('notifications','6.3.1'), ('message_reactions','6.2'),
    ('message_reports','6.2'), ('verification_requests','8.1'), ('ad_campaigns','10'),
    ('platform_config','10.7'), ('cat_amenities','19.5'), ('publications_amenities','19.5'),
    ('site_assets','15'), ('customer_audit_log','12.2'), ('customer_payment_methods','11'),
    ('publication_reports','8.4'), ('tickets','8.5'), ('ticket_messages','8.5'),
    ('referrals','referidos'), ('ad_credit_movements','referidos'),
    ('company_invitations','8'), ('publications_images_glb','visor GLB'),
    ('stories','historias'), ('story_views','historias'),
    ('v_plan_efectivo','plan por empresa (VISTA)')
)
SELECT e.tabla, e.fase AS "fase que la creó"
FROM esperadas e
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables t
    WHERE t.table_schema = 'ecom' AND t.table_name = e.tabla
)
ORDER BY e.tabla;

\echo ''
\echo '=== 2. TABLAS EN LA BD QUE NO ESTÁN EN database.sql ======================='
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
    ('referrals'),('ad_credit_movements'),('company_invitations'),
    ('publications_images_glb'),('stories'),('story_views')
)
SELECT t.table_name AS tabla,
       pg_size_pretty(pg_total_relation_size(format('ecom.%I', t.table_name)::regclass)) AS peso
FROM information_schema.tables t
WHERE t.table_schema = 'ecom'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT IN (SELECT tabla FROM esperadas)
ORDER BY pg_total_relation_size(format('ecom.%I', t.table_name)::regclass) DESC;

\echo ''
\echo '=== 3. ÍNDICES DE database.sql QUE NO EXISTEN =============================='

-- Todos los índices con nombre propio de database.sql (los que no respaldan
-- una PK o un UNIQUE de columna).
WITH esperados(indice, tabla) AS (VALUES
    ('idx_ad_campaigns_cus','ad_campaigns'), ('idx_ad_campaigns_status','ad_campaigns'),
    ('idx_ad_credit_movements_cus','ad_credit_movements'),
    ('idx_comment_likes_comment_id','comment_likes'),
    ('idx_company_invite_invitee','company_invitations'), ('uq_company_invite_pending','company_invitations'),
    ('customer_handle_unique','customer'), ('customer_referral_code_unique','customer'),
    ('idx_audit_dpi_hash','customer_audit_log'), ('idx_audit_email_hash','customer_audit_log'),
    ('idx_audit_fraud_flag','customer_audit_log'), ('idx_audit_phone_hash','customer_audit_log'),
    ('idx_follows_followed','customer_follows'), ('idx_follows_follower','customer_follows'),
    ('idx_pm_cus_id_active','customer_payment_methods'), ('idx_pm_one_default_per_user','customer_payment_methods'),
    ('idx_message_reactions_message_id','message_reactions'),
    ('idx_message_reports_message_id','message_reports'),
    ('idx_notifications_recipient_unread','notifications'),
    ('idx_prt_cus_id_expires','password_reset_tokens'), ('idx_prt_token_hash','password_reset_tokens'),
    ('idx_publication_reports_status','publication_reports'),
    ('idx_publications_activas','publications'), ('idx_publications_cuota','publications'),
    ('idx_publications_pub_slug','publications'),
    ('idx_pub_amen_amen_id','publications_amenities'),
    ('idx_publications_comments_parent_id','publications_comments'),
    ('idx_publications_comments_pub_id','publications_comments'),
    ('idx_pub_detail_cit_tow','publications_detail'), ('idx_pub_detail_precio_orden','publications_detail'),
    ('idx_pub_detail_price','publications_detail'),
    ('idx_pub_images_pub_id','publications_images'), ('idx_pub_images_glb_pub_id','publications_images_glb'),
    ('idx_referrals_referred_status','referrals'), ('idx_referrals_referrer_status','referrals'),
    ('idx_stories_cus','stories'), ('idx_stories_vigentes','stories'),
    ('idx_story_views_cus','story_views'),
    ('idx_ticket_messages_ticket','ticket_messages'),
    ('idx_tickets_assigned','tickets'), ('idx_tickets_cus','tickets'), ('idx_tickets_status','tickets'),
    ('uq_verification_pending_business','verification_requests'),
    ('uq_verification_pending_personal','verification_requests')
)
SELECT e.indice, e.tabla,
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
\echo ' reales de connPostgresDB.js, no del tamaño de la tabla. Los ALTA se crean'
\echo ' con docs/db/indices-recomendados.sql.)'

-- Revisado contra connPostgresDB.js de backend master (ee9df52).
WITH calientes(tabla, columna, motivo) AS (VALUES
    ('messages','receiver_id',  'getUnreadCount: WHERE receiver_id AND is_read=false, en cada poll'),
    ('messages','sender_id',    'getInbox: WHERE sender_id=$1 OR receiver_id=$1'),
    ('messages','pub_id',       'getConversation: WHERE m.pub_id=$1 AND par de participantes'),
    ('publications_favorites','cus_id','columnasListado: isFavorite correlacionado por CADA fila'),
    ('publications_favorites','pub_id','favoritesCount por publicacion'),
    ('publications_images','pub_id',   'INNER JOIN en todo listado + subconsulta de imagen principal'),
    ('publications','cus_id',          'getMyPublications: WHERE p.cus_id=$1 ORDER BY fecha, todos los estados'),
    ('publications_detail','cit_id',   'filtro cityId (departamento)'),
    ('publications_detail','tow_id',   'filtro townId (municipio), puede venir solo'),
    ('seller_ratings','seller_id',     'reseñas y promedio del perfil del vendedor')
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
  -- Un índice parcial no cuenta: cubre solo una parte de las filas
  -- (idx_publications_cuota excluye vendidas y anuladas).
  AND NOT EXISTS (
      SELECT 1 FROM pg_index i
      WHERE i.indrelid = c.conrelid
        AND i.indkey[0] = c.conkey[1]
        AND i.indpred IS NULL
  )
ORDER BY prioridad, pg_total_relation_size(cl.oid) DESC, tabla, columna;

\echo '=== 5. COLUMNAS DE MONEDA (listo para USD / Centroamérica) ================='

WITH necesarias(tabla, columna, para_que) AS (VALUES
    ('publications_detail','pubdet_currency',   'moneda del precio principal (Fase 5)'),
    ('publications_detail','pubdet_price_alt',  'precio dual Q/US$ (Aurelio, 964ae3c, 2026-06-12)'),
    ('publications_detail','pubdet_currency_alt','moneda del precio alterno (Aurelio, 964ae3c, 2026-06-12)'),
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
