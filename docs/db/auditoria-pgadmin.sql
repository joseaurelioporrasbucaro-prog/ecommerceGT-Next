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
    ('password_reset_tokens','8.3.5','MIGRATION.md'), ('customer_follows','9','MIGRATION.md'),
    ('notifications','6.3.1','MIGRATION.md'), ('message_reactions','6.2','MIGRATION.md'),
    ('message_reports','6.2','MIGRATION.md'), ('verification_requests','8.1','MIGRATION.md'),
    ('ad_campaigns','10','MIGRATION.md'), ('platform_config','10.7','MIGRATION.md'),
    ('cat_amenities','19.5','MIGRATION.md'), ('publications_amenities','19.5','MIGRATION.md'),
    ('site_assets','15','MIGRATION.md'), ('customer_audit_log','12.2','MIGRATION.md'),
    ('customer_payment_methods','11','MIGRATION.md'), ('publication_reports','8.4','MIGRATION.md'),
    ('tickets','8.5','MIGRATION.md'), ('ticket_messages','8.5','MIGRATION.md'),
    ('referrals','referidos','PENDIENTES.md'), ('ad_credit_movements','referidos','PENDIENTES.md')
),
indices(indice, tabla, fase) AS (VALUES
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
),
calientes(tabla, columna, motivo) AS (VALUES
    ('messages','receiver_id',  'getUnreadCount: WHERE receiver_id AND is_read=false, en cada poll'),
    ('messages','sender_id',    'getInbox: WHERE sender_id=$1 OR receiver_id=$1'),
    ('messages','pub_id',       'getConversation: WHERE m.pub_id=$1'),
    ('publications_favorites','cus_id','getPublications: subconsulta correlacionada por CADA fila'),
    ('publications_favorites','pub_id','misma subconsulta'),
    ('publications_images','pub_id',   'INNER JOIN en todo listado'),
    ('publications','cus_id',          'getMyPublications: WHERE p.cus_id=$1 ORDER BY fecha'),
    ('publications_detail','cit_id',   'filtros de busqueda por departamento (Fase 19)'),
    ('publications_detail','tow_id',   'filtros de busqueda por municipio (Fase 19)'),
    ('publications_comments','cus_id', 'JOIN al autor en cada hilo'),
    ('seller_ratings','seller_id',     'perfil publico del vendedor'),
    ('seller_ratings','pub_id',        'estado de calificacion por publicacion')
),
monedas(tabla, columna, para_que) AS (VALUES
    ('publications_detail','pubdet_currency',   'moneda del precio principal (Fase 5)'),
    ('publications_detail','pubdet_price_alt',  'precio dual Q/US$ (Fase 17)'),
    ('publications_detail','pubdet_currency_alt','moneda del precio alterno (Fase 17)'),
    ('subscriptions','sub_currency',            'moneda del plan'),
    ('ad_campaigns','camp_currency',            'moneda del presupuesto de pauta'),
    ('customer','cus_ad_credit_currency',       'moneda del credito de pauta'),
    ('customer_payment_methods','pm_currency',  'moneda del metodo de pago')
)

-- 1) Tablas esperadas que no existen
SELECT 1 AS orden, 'TABLA FALTANTE' AS seccion,
       e.tabla AS item, ''::text AS columna,
       'la creo la fase ' || e.fase || ' — documentada en ' || e.origen AS detalle
FROM esperadas e
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables t
                  WHERE t.table_schema='ecom' AND t.table_name=e.tabla)

UNION ALL
-- 2) Tablas en la BD que nadie documentó
SELECT 2, 'TABLA SIN DOCUMENTAR',
       t.table_name, '',
       'existe en la BD y no figura en MIGRATION.md ni PENDIENTES.md — pesa ' ||
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
  AND NOT EXISTS (SELECT 1 FROM pg_index i
                  WHERE i.indrelid=c.conrelid AND i.indkey[0]=c.conkey[1])

UNION ALL
-- 4) Índices documentados que no existen
SELECT 4, 'INDICE DOCUMENTADO FALTANTE',
       x.indice, x.tabla,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables t
                         WHERE t.table_schema='ecom' AND t.table_name=x.tabla)
            THEN 'fase ' || x.fase || ' — la tabla existe, falta solo el indice'
            ELSE 'fase ' || x.fase || ' — falta la tabla entera' END
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
                  WHERE i.indrelid=c.conrelid AND i.indkey[0]=c.conkey[1])
  AND NOT EXISTS (SELECT 1 FROM calientes h
                  WHERE h.tabla=cl.relname AND h.columna=a.attname)

ORDER BY orden, item, columna;
