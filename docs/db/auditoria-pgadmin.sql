-- ============================================================================
-- Auditoría de esquema — versión para pgAdmin / DBeaver / cualquier GUI
-- ============================================================================
-- Pegá TODO esto en el Query Tool de pgAdmin y ejecutá (F5). Devuelve UNA sola
-- grilla con todo: las GUI muestran nada más el último result set, así que la
-- versión de seis SELECT (auditoria-esquema.sql) solo sirve con `psql -f`.
--
-- Es de solo lectura: consulta los catálogos del sistema y no toca ninguna
-- tabla tuya. Ordenada por prioridad — lo de arriba es lo que importa.
--
-- Si tu esquema no se llama 'ecom', cambialo en los siete lugares donde aparece.
-- ============================================================================

-- Inventario (2026-09-10): el database.sql de backend master. Desde el
-- 2026-09-09 ese archivo corre entero desde cero y da el mismo esquema que la
-- base de desarrollo, así que es la fuente de verdad. MIGRATION.md no lo es:
-- le faltan tablas. Si database.sql suma una tabla o un índice, agregalo acá.
WITH
esperadas(tabla, fase, origen) AS (VALUES
    ('cat_country','base','database.sql'), ('cat_city','base','database.sql'),
    ('cat_town','base','database.sql'), ('cat_gender','base','database.sql'),
    ('cat_password_status','base','database.sql'), ('cat_business_status','base','database.sql'),
    ('cat_publication_status','base','database.sql'), ('cat_publication_gender','base','database.sql'),
    ('cat_publication_transac','base','database.sql'),
    ('cat_publication_transac_x_gender','base','database.sql'),
    ('cat_login_type','base','database.sql'), ('subscriptions','base','database.sql'),
    ('business','base','database.sql'), ('customer','base','database.sql'),
    ('customer_subscription','base','database.sql'), ('publications','base','database.sql'),
    ('publications_detail','base','database.sql'), ('publications_images','base','database.sql'),
    ('publications_favorites','base','database.sql'), ('seller_ratings','7','database.sql'),
    ('publications_comments','4.2','database.sql'), ('comment_reports','8.4','database.sql'),
    ('comment_likes','4.3','database.sql'), ('messages','6.1','database.sql'),
    ('password_reset_tokens','8.3.5','database.sql'), ('customer_follows','7.2','database.sql'),
    ('notifications','6.3.1','database.sql'), ('message_reactions','6.2','database.sql'),
    ('message_reports','6.2','database.sql'), ('verification_requests','8.1','database.sql'),
    ('ad_campaigns','10','database.sql'), ('platform_config','10.7','database.sql'),
    ('cat_amenities','19.5','database.sql'), ('publications_amenities','19.5','database.sql'),
    ('site_assets','15','database.sql'), ('customer_audit_log','12.2','database.sql'),
    ('customer_payment_methods','11','database.sql'), ('publication_reports','8.4','database.sql'),
    ('tickets','8.5','database.sql'), ('ticket_messages','8.5','database.sql'),
    ('referrals','referidos','database.sql'), ('ad_credit_movements','referidos','database.sql'),
    ('company_invitations','8','database.sql'), ('publications_images_glb','visor GLB','database.sql'),
    ('stories','historias','database.sql'), ('story_views','historias','database.sql'),
    ('v_plan_efectivo','plan por empresa (VISTA)','database.sql')
),
-- Todos los índices con nombre propio de database.sql (los que no respaldan
-- una PK o un UNIQUE de columna).
indices(indice, tabla) AS (VALUES
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
),
-- Revisado contra connPostgresDB.js de backend master (ee9df52).
calientes(tabla, columna, motivo) AS (VALUES
    ('messages','receiver_id',  'getUnreadCount: WHERE receiver_id AND is_read=false, en cada poll'),
    ('messages','sender_id',    'getInbox: WHERE sender_id=$1 OR receiver_id=$1'),
    ('messages','pub_id',       'getConversation: WHERE m.pub_id=$1 AND par de participantes'),
    ('publications_favorites','cus_id','columnasListado: isFavorite correlacionado por CADA fila'),
    ('publications_favorites','pub_id','favoritesCount por publicacion'),
    ('publications_images','pub_id',   'INNER JOIN en todo listado'),
    ('publications','cus_id',          'getMyPublications: WHERE p.cus_id=$1 ORDER BY fecha, todos los estados'),
    ('publications_detail','cit_id',   'filtro cityId (departamento)'),
    ('publications_detail','tow_id',   'filtro townId (municipio), puede venir solo'),
    ('seller_ratings','seller_id',     'reseñas y promedio del perfil del vendedor')
),
monedas(tabla, columna, para_que) AS (VALUES
    ('publications_detail','pubdet_currency',   'moneda del precio principal (Fase 5)'),
    ('publications_detail','pubdet_price_alt',  'precio dual Q/US$ (Aurelio, 964ae3c)'),
    ('publications_detail','pubdet_currency_alt','moneda del precio alterno (Aurelio, 964ae3c)'),
    ('subscriptions','sub_currency',            'moneda del plan'),
    ('ad_campaigns','camp_currency',            'moneda del presupuesto de pauta'),
    ('customer','cus_ad_credit_currency',       'moneda del credito de pauta'),
    ('customer_payment_methods','pm_currency',  'moneda del metodo de pago')
)

-- 1) Tablas esperadas que no existen
SELECT 1 AS orden, 'TABLA FALTANTE' AS seccion,
       e.tabla AS item, ''::text AS columna,
       'la creó la fase ' || e.fase || ' — documentada en ' || e.origen AS detalle
FROM esperadas e
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables t
                  WHERE t.table_schema='ecom' AND t.table_name=e.tabla)

UNION ALL
-- 2) Tablas en la BD que nadie documentó
SELECT 2, 'TABLA SIN DOCUMENTAR',
       t.table_name, '',
       'existe en la BD y no está en database.sql — pesa ' ||
       pg_size_pretty(pg_total_relation_size(format('ecom.%I', t.table_name)::regclass))
FROM information_schema.tables t
WHERE t.table_schema='ecom' AND t.table_type='BASE TABLE'
  AND t.table_name NOT IN (SELECT tabla FROM esperadas)

UNION ALL
-- 3) FK sin índice, prioridad alta
SELECT 3, 'INDICE FALTANTE (ALTA)',
       cl.relname, a.attname, h.motivo
FROM pg_constraint c
JOIN pg_class cl ON cl.oid=c.conrelid
JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=c.conkey[1]
JOIN calientes h ON h.tabla=cl.relname AND h.columna=a.attname
WHERE c.contype='f' AND cl.relnamespace='ecom'::regnamespace
  -- indpred IS NULL: un índice parcial no cuenta, porque cubre solo una parte
  -- de las filas (idx_publications_cuota excluye vendidas y anuladas).
  AND NOT EXISTS (SELECT 1 FROM pg_index i
                  WHERE i.indrelid=c.conrelid AND i.indkey[0]=c.conkey[1]
                    AND i.indpred IS NULL)

UNION ALL
-- 4) Índices de database.sql que no existen
SELECT 4, 'INDICE DE database.sql FALTANTE',
       x.indice, x.tabla,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables t
                         WHERE t.table_schema='ecom' AND t.table_name=x.tabla)
            THEN 'la tabla existe, falta solo el indice'
            ELSE 'falta la tabla entera' END
FROM indices x
WHERE NOT EXISTS (SELECT 1 FROM pg_indexes i
                  WHERE i.schemaname='ecom' AND i.indexname=x.indice)

UNION ALL
-- 5) Columnas de moneda que faltan
SELECT 5, 'COLUMNA DE MONEDA FALTANTE',
       m.tabla, m.columna, m.para_que
FROM monedas m
WHERE EXISTS (SELECT 1 FROM information_schema.tables t
              WHERE t.table_schema='ecom' AND t.table_name=m.tabla)
  AND NOT EXISTS (SELECT 1 FROM information_schema.columns col
                  WHERE col.table_schema='ecom' AND col.table_name=m.tabla
                    AND col.column_name=m.columna)

UNION ALL
-- 6) Cobertura geográfica
SELECT 6, 'PAIS EN CATALOGO',
       co.cou_description, COALESCE(co.cou_currency,'sin moneda'),
       (SELECT count(*) FROM ecom.cat_city ci WHERE ci.cou_id=co.cou_id)::text ||
       ' departamentos, ' ||
       (SELECT count(*) FROM ecom.cat_town tw
        JOIN ecom.cat_city ci2 ON ci2.cit_id=tw.cit_id
        WHERE ci2.cou_id=co.cou_id)::text || ' municipios'
FROM ecom.cat_country co

UNION ALL
-- 7) FK sin índice, prioridad baja (catálogos)
SELECT 7, 'indice faltante (baja)',
       cl.relname, a.attname,
       'FK de catalogo o columna de baja cardinalidad — probablemente no vale la pena'
FROM pg_constraint c
JOIN pg_class cl ON cl.oid=c.conrelid
JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=c.conkey[1]
WHERE c.contype='f' AND cl.relnamespace='ecom'::regnamespace
  AND NOT EXISTS (SELECT 1 FROM pg_index i
                  WHERE i.indrelid=c.conrelid AND i.indkey[0]=c.conkey[1]
                    AND i.indpred IS NULL)
  AND NOT EXISTS (SELECT 1 FROM calientes h
                  WHERE h.tabla=cl.relname AND h.columna=a.attname)

ORDER BY orden, item, columna;
