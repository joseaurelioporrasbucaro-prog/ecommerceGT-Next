-- ============================================================================
-- Migración: pone una base existente al día con database.sql (backend master)
-- ============================================================================
-- Generada el 2026-09-10 comparando la base local de Aurelio (ecommercedb)
-- contra una base creada desde cero con el database.sql de
-- techmindsgt/ecommerceGTBackEnd @ ee9df52. Todo lo de acá sale de ese archivo
-- o de docs/sql/ del backend: no hay nada inventado.
--
-- QUÉ ARREGLA, por bloque (el orden respeta las dependencias de las FK):
--
--   A. URGENTE — código que HOY falla contra tu base:
--      A1 publications.pub_origin     savePublication (crear publicación)
--      A2 customer.cou_id             updateMyBasics, changeInfoB (editar perfil)
--      A3 business.sub_id + backfill  changeSubscription, addEmployee,
--                                     inviteExistingUser, respondInvitation,
--                                     removeEmployee
--      A4 v_plan_efectivo             checkerpub (gate de Subir), savePublication,
--                                     updatePublication, getMySubscription,
--                                     getCompanyTeam
--      A5 stories, story_views        /stories — solo la app mobile; el web no
--                                     las usa
--
--   B. ALINEAR — no rompe nada hoy, pero tu base difiere del archivo:
--      B1 las 7 FK a customer/publications pasan de INTEGER a BIGINT
--      B2 NOT NULL que el archivo declara y tu base no
--      B3 tres FK que faltan (customer.cit_id/tow_id, comment_reports.resolved_by)
--      B4 DEFAULT 0 de customer.cus_password_fail_count
--      B5 cuatro índices que el archivo define y tu base no tiene
--
--   C. DATOS — El Salvador (1 país, 14 departamentos, 262 municipios) y el
--      typo 'Bloqueda' → 'Bloqueado'.
--
-- Es IDEMPOTENTE: se puede correr dos veces sin error y sin duplicar nada.
-- Corre en UNA transacción: si algo falla, no queda nada a medias.
--
-- CÓMO CORRERLO:
--   pgAdmin: Query Tool → pegar el archivo entero → F5.
--   psql:    psql -d ecommercedb -f docs/db/migracion-2026-09-10.sql
--
-- NO incluye los índices de rendimiento de indices-recomendados.sql: esos van
-- con CREATE INDEX CONCURRENTLY, que no puede correr dentro de una
-- transacción. Están en docs/db/indices-recomendados.sql, para correrlos aparte.
-- ============================================================================

BEGIN;

-- Ayudante de esta sesión: ¿la columna ya tiene una FK, se llame como se llame?
-- Así, en una base donde la FK exista con otro nombre, no se duplica. Vive en
-- pg_temp: desaparece al desconectarse y no queda nada en tu esquema.
CREATE OR REPLACE FUNCTION pg_temp.tiene_fk(tabla regclass, columna name)
RETURNS boolean LANGUAGE sql AS $$
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
    WHERE c.conrelid = tabla AND c.contype = 'f' AND a.attname = columna)
$$;

-- ── A1. publications.pub_origin ─────────────────────────────────────────────
-- cmiche, d1d0742 (2026-08-11). savePublication lo inserta siempre: sin la
-- columna, crear una publicación da error 500. Las filas existentes quedan en
-- 'web' por el DEFAULT, igual que en la base de él.
ALTER TABLE ecom.publications
    ADD COLUMN IF NOT EXISTS pub_origin VARCHAR(10) NOT NULL DEFAULT 'web';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'publications_origin_check'
                   AND conrelid = 'ecom.publications'::regclass) THEN
    ALTER TABLE ecom.publications
      ADD CONSTRAINT publications_origin_check CHECK (pub_origin IN ('web', 'mobile'));
  END IF;
END $$;

-- ── A2. customer.cou_id ─────────────────────────────────────────────────────
-- cmiche, 9532e41 (2026-09-09). Nullable y sin default, como cit_id y tow_id.
-- En una base existente el ALTER la agrega al FINAL de la tabla y no antes de
-- cit_id; no importa salvo para algo que dependa de la posición ordinal.
ALTER TABLE ecom.customer
    ADD COLUMN IF NOT EXISTS cou_id INT;

DO $$ BEGIN
  IF NOT pg_temp.tiene_fk('ecom.customer', 'cou_id') THEN
    ALTER TABLE ecom.customer
      ADD CONSTRAINT customer_cou_id_fkey FOREIGN KEY (cou_id) REFERENCES ecom.cat_country(cou_id);
  END IF;
END $$;

-- ── A3. business.sub_id ─────────────────────────────────────────────────────
-- cmiche, 299c1eb (2026-09-03). El plan pasa a vivir en la empresa. Antes de
-- escribir esto se verificó que cada una de tus 3 empresas tiene exactamente un
-- admin con suscripción, así que el backfill es inequívoco.
ALTER TABLE ecom.business
    ADD COLUMN IF NOT EXISTS sub_id INT NULL;

DO $$ BEGIN
  IF NOT pg_temp.tiene_fk('ecom.business', 'sub_id') THEN
    ALTER TABLE ecom.business
      ADD CONSTRAINT business_sub_id_fkey FOREIGN KEY (sub_id) REFERENCES ecom.subscriptions(sub_id);
  END IF;
END $$;

-- Cada empresa arranca con el plan que hoy tiene su admin (idéntico al UPDATE
-- de database.sql). El `sub_id IS NULL` lo hace inofensivo al repetirlo.
UPDATE ecom.business b
   SET sub_id = cs.sub_id
  FROM ecom.customer c
  JOIN ecom.customer_subscription cs ON cs.cus_id = c.cus_id
 WHERE c.bus_id = b.bus_id
   AND c.cus_is_admin
   AND b.sub_id IS NULL;

-- ── A4. v_plan_efectivo ─────────────────────────────────────────────────────
-- cmiche, 299c1eb + 41bfb91 (docs/sql/2026-09-04-cuota-por-activas.sql). Es la
-- versión FINAL: pubcount = publicaciones activas, no el acumulado. Depende de
-- business.sub_id (A3), por eso va después.
CREATE INDEX IF NOT EXISTS idx_publications_cuota
    ON ecom.publications(cus_id)
    WHERE pubsta_id NOT IN (3, 4);

CREATE OR REPLACE VIEW ecom.v_plan_efectivo AS
SELECT c.cus_id,
       s.sub_id,
       s.sub_description,
       s.sub_interval,
       s.sub_price,
       s.sub_users,
       s.sub_pubperuser,
       s.sub_active,
       (SELECT COUNT(*)::int
          FROM ecom.publications p
         WHERE p.cus_id = c.cus_id
           AND p.pubsta_id NOT IN (3, 4))              AS pubcount,
       COALESCE(cs.cussub_pub_limit, s.sub_pubperuser) AS limite_efectivo,
       (c.bus_id IS NOT NULL AND NOT c.cus_is_admin)   AS lo_administra_la_empresa
  FROM ecom.customer c
  LEFT JOIN ecom.customer_subscription cs ON cs.cus_id = c.cus_id
  LEFT JOIN ecom.business b ON b.bus_id = c.bus_id
  JOIN ecom.subscriptions s ON s.sub_id = COALESCE(b.sub_id, cs.sub_id, 1000);

-- ── A5. stories + story_views ───────────────────────────────────────────────
-- cmiche, 39c4d51 (2026-08-04). Historias efímeras de la app mobile. El web no
-- llama a /stories, así que esto no bloquea el web; sí la app si la apuntás a
-- tu backend local.
CREATE TABLE IF NOT EXISTS ecom.stories (
    sto_id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cus_id         BIGINT NOT NULL REFERENCES ecom.customer(cus_id) ON DELETE CASCADE,
    pub_id         BIGINT NULL REFERENCES ecom.publications(pub_id) ON DELETE SET NULL,
    sto_media_url  VARCHAR(255) NOT NULL,
    sto_media_type VARCHAR(10) NOT NULL DEFAULT 'image',
    sto_duration   INT NOT NULL DEFAULT 5,
    sto_caption    VARCHAR(180) NULL,
    sto_views      BIGINT NOT NULL DEFAULT 0,
    sto_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP + INTERVAL '24 hours',
    CONSTRAINT stories_media_type_check CHECK (sto_media_type IN ('image', 'video')),
    CONSTRAINT stories_duration_check CHECK (sto_duration BETWEEN 3 AND 30)
);

CREATE INDEX IF NOT EXISTS idx_stories_vigentes
    ON ecom.stories(expires_at, sto_active);

CREATE INDEX IF NOT EXISTS idx_stories_cus
    ON ecom.stories(cus_id, created_at DESC);

CREATE TABLE IF NOT EXISTS ecom.story_views (
    sto_id     BIGINT NOT NULL REFERENCES ecom.stories(sto_id) ON DELETE CASCADE,
    cus_id     BIGINT NOT NULL REFERENCES ecom.customer(cus_id) ON DELETE CASCADE,
    viewed_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sto_id, cus_id)
);

CREATE INDEX IF NOT EXISTS idx_story_views_cus
    ON ecom.story_views(cus_id);

-- ── B1. FK a customer/publications: INTEGER → BIGINT ────────────────────────
-- cmiche, fc52386 (2026-09-09). Los padres son BIGINT; estas siete eran
-- INTEGER. Reescribe las tablas con lock exclusivo, pero en tu base son 39 + 3
-- + 3 filas. Si la columna ya es BIGINT, Postgres no reescribe nada.
ALTER TABLE ecom.messages
    ALTER COLUMN sender_id   TYPE BIGINT,
    ALTER COLUMN receiver_id TYPE BIGINT,
    ALTER COLUMN pub_id      TYPE BIGINT;

ALTER TABLE ecom.seller_ratings
    ALTER COLUMN seller_id TYPE BIGINT,
    ALTER COLUMN buyer_id  TYPE BIGINT,
    ALTER COLUMN pub_id    TYPE BIGINT;

ALTER TABLE ecom.comment_reports
    ALTER COLUMN cus_id TYPE BIGINT;

-- ── B2. NOT NULL que declara el archivo ─────────────────────────────────────
-- Verificado antes: 0 filas con NULL en cualquiera de estas cinco columnas.
ALTER TABLE ecom.messages
    ALTER COLUMN sender_id   SET NOT NULL,
    ALTER COLUMN receiver_id SET NOT NULL,
    ALTER COLUMN pub_id      SET NOT NULL;

ALTER TABLE ecom.publications_comments
    ALTER COLUMN cus_id SET NOT NULL,
    ALTER COLUMN pub_id SET NOT NULL;

-- ── B3. FK que faltan ───────────────────────────────────────────────────────
-- Verificado antes: 0 huérfanos en customer.cit_id, customer.tow_id y
-- comment_reports.resolved_by.
DO $$ BEGIN
  IF NOT pg_temp.tiene_fk('ecom.customer', 'cit_id') THEN
    ALTER TABLE ecom.customer
      ADD CONSTRAINT customer_cit_id_fkey FOREIGN KEY (cit_id) REFERENCES ecom.cat_city(cit_id);
  END IF;
  IF NOT pg_temp.tiene_fk('ecom.customer', 'tow_id') THEN
    ALTER TABLE ecom.customer
      ADD CONSTRAINT customer_tow_id_fkey FOREIGN KEY (tow_id) REFERENCES ecom.cat_town(tow_id);
  END IF;
  IF NOT pg_temp.tiene_fk('ecom.comment_reports', 'resolved_by') THEN
    ALTER TABLE ecom.comment_reports
      ADD CONSTRAINT comment_reports_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES ecom.customer(cus_id);
  END IF;
END $$;

-- ── B4. DEFAULT de cus_password_fail_count ──────────────────────────────────
-- Sin default, un INSERT que omita la columna deja NULL, y NULL + 1 sigue
-- siendo NULL: el conteo de intentos fallidos nunca llegaría al bloqueo.
-- Hoy ninguna fila está en NULL; esto evita que empiece a pasar.
ALTER TABLE ecom.customer
    ALTER COLUMN cus_password_fail_count SET DEFAULT 0;

-- ── B5. Índices que database.sql define y tu base no tiene ──────────────────
-- Sin CONCURRENTLY a propósito: van dentro de la transacción y las tablas son
-- chicas. En una base con tráfico real, pasalos a la sección del final.
CREATE INDEX IF NOT EXISTS idx_publications_comments_pub_id
    ON ecom.publications_comments(pub_id);
CREATE INDEX IF NOT EXISTS idx_publications_comments_parent_id
    ON ecom.publications_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_publication_reports_status
    ON ecom.publication_reports(report_status);
CREATE INDEX IF NOT EXISTS idx_tickets_cus
    ON ecom.tickets(cus_id);

-- ── C1. Typo de catálogo ────────────────────────────────────────────────────
-- cmiche, b66ed1c. Solo se muestra; nadie compara contra este texto.
UPDATE ecom.cat_password_status
   SET passta_description = 'Bloqueado'
 WHERE passta_id = 2 AND passta_description <> 'Bloqueado';

-- ── C2. El Salvador ─────────────────────────────────────────────────────────
-- cmiche, 931d6a8 + 07e7d67 (2026-09-09). Filas copiadas tal cual de
-- database.sql: departamentos de mil en mil desde 23000 y municipios como
-- cit_id + posición. Son los 262 municipios tradicionales, no los 44 de la
-- reforma de 2023 (decisión documentada en el commit).
INSERT INTO ecom.cat_country (cou_id, cou_description, cou_code, cou_currency, cou_status) VALUES
    (503, 'El Salvador', 'es-SV', 'USD', true) ON CONFLICT (cou_id) DO NOTHING;

INSERT INTO ecom.cat_city (cit_id, cou_id, cit_description) VALUES
    (23000, 503, 'Ahuachapán'),
    (24000, 503, 'Santa Ana'),
    (25000, 503, 'Sonsonate'),
    (26000, 503, 'Chalatenango'),
    (27000, 503, 'La Libertad'),
    (28000, 503, 'San Salvador'),
    (29000, 503, 'Cuscatlán'),
    (30000, 503, 'La Paz'),
    (31000, 503, 'Cabañas'),
    (32000, 503, 'San Vicente'),
    (33000, 503, 'Usulután'),
    (34000, 503, 'San Miguel'),
    (35000, 503, 'Morazán'),
    (36000, 503, 'La Unión')
ON CONFLICT (cit_id) DO NOTHING;

INSERT INTO ecom.cat_town (tow_id, cit_id, tow_description) VALUES
    (23001, 23000, 'Ahuachapán'),
    (23002, 23000, 'Apaneca'),
    (23003, 23000, 'Atiquizaya'),
    (23004, 23000, 'Concepción de Ataco'),
    (23005, 23000, 'El Refugio'),
    (23006, 23000, 'Guaymango'),
    (23007, 23000, 'Jujutla'),
    (23008, 23000, 'San Francisco Menéndez'),
    (23009, 23000, 'San Lorenzo'),
    (23010, 23000, 'San Pedro Puxtla'),
    (23011, 23000, 'Tacuba'),
    (23012, 23000, 'Turín'),
    (24001, 24000, 'Candelaria de la Frontera'),
    (24002, 24000, 'Chalchuapa'),
    (24003, 24000, 'Coatepeque'),
    (24004, 24000, 'El Congo'),
    (24005, 24000, 'El Porvenir'),
    (24006, 24000, 'Masahuat'),
    (24007, 24000, 'Metapán'),
    (24008, 24000, 'San Antonio Pajonal'),
    (24009, 24000, 'San Sebastián Salitrillo'),
    (24010, 24000, 'Santa Ana'),
    (24011, 24000, 'Santa Rosa Guachipilín'),
    (24012, 24000, 'Santiago de la Frontera'),
    (24013, 24000, 'Texistepeque'),
    (25001, 25000, 'Acajutla'),
    (25002, 25000, 'Armenia'),
    (25003, 25000, 'Caluco'),
    (25004, 25000, 'Cuisnahuat'),
    (25005, 25000, 'Izalco'),
    (25006, 25000, 'Juayúa'),
    (25007, 25000, 'Nahuizalco'),
    (25008, 25000, 'Nahulingo'),
    (25009, 25000, 'Salcoatitán'),
    (25010, 25000, 'San Antonio del Monte'),
    (25011, 25000, 'San Julián'),
    (25012, 25000, 'Santa Catarina Masahuat'),
    (25013, 25000, 'Santa Isabel Ishuatán'),
    (25014, 25000, 'Santo Domingo de Guzmán'),
    (25015, 25000, 'Sonsonate'),
    (25016, 25000, 'Sonzacate'),
    (26001, 26000, 'Agua Caliente'),
    (26002, 26000, 'Arcatao'),
    (26003, 26000, 'Azacualpa'),
    (26004, 26000, 'Cancasque'),
    (26005, 26000, 'Chalatenango'),
    (26006, 26000, 'Citalá'),
    (26007, 26000, 'Comalapa'),
    (26008, 26000, 'Concepción Quezaltepeque'),
    (26009, 26000, 'Dulce Nombre de María'),
    (26010, 26000, 'El Carrizal'),
    (26011, 26000, 'El Paraíso'),
    (26012, 26000, 'La Laguna'),
    (26013, 26000, 'La Palma'),
    (26014, 26000, 'La Reina'),
    (26015, 26000, 'Las Flores'),
    (26016, 26000, 'Las Vueltas'),
    (26017, 26000, 'Nombre de Jesús'),
    (26018, 26000, 'Nueva Concepción'),
    (26019, 26000, 'Nueva Trinidad'),
    (26020, 26000, 'Ojos de Agua'),
    (26021, 26000, 'Potonico'),
    (26022, 26000, 'San Antonio Los Ranchos'),
    (26023, 26000, 'San Antonio de la Cruz'),
    (26024, 26000, 'San Fernando'),
    (26025, 26000, 'San Francisco Lempa'),
    (26026, 26000, 'San Francisco Morazán'),
    (26027, 26000, 'San Ignacio'),
    (26028, 26000, 'San Isidro Labrador'),
    (26029, 26000, 'San Luis del Carmen'),
    (26030, 26000, 'San Miguel de Mercedes'),
    (26031, 26000, 'San Rafael'),
    (26032, 26000, 'Santa Rita'),
    (26033, 26000, 'Tejutla'),
    (27001, 27000, 'Antiguo Cuscatlán'),
    (27002, 27000, 'Chiltiupán'),
    (27003, 27000, 'Ciudad Arce'),
    (27004, 27000, 'Colón'),
    (27005, 27000, 'Comasagua'),
    (27006, 27000, 'Huizúcar'),
    (27007, 27000, 'Jayaque'),
    (27008, 27000, 'Jicalapa'),
    (27009, 27000, 'La Libertad'),
    (27010, 27000, 'Nuevo Cuscatlán'),
    (27011, 27000, 'Quezaltepeque'),
    (27012, 27000, 'Sacacoyo'),
    (27013, 27000, 'San José Villanueva'),
    (27014, 27000, 'San Juan Opico'),
    (27015, 27000, 'San Matías'),
    (27016, 27000, 'San Pablo Tacachico'),
    (27017, 27000, 'Santa Tecla'),
    (27018, 27000, 'Talnique'),
    (27019, 27000, 'Tamanique'),
    (27020, 27000, 'Teotepeque'),
    (27021, 27000, 'Tepecoyo'),
    (27022, 27000, 'Zaragoza'),
    (28001, 28000, 'Aguilares'),
    (28002, 28000, 'Apopa'),
    (28003, 28000, 'Ayutuxtepeque'),
    (28004, 28000, 'Cuscatancingo'),
    (28005, 28000, 'Delgado'),
    (28006, 28000, 'El Paisnal'),
    (28007, 28000, 'Guazapa'),
    (28008, 28000, 'Ilopango'),
    (28009, 28000, 'Mejicanos'),
    (28010, 28000, 'Nejapa'),
    (28011, 28000, 'Panchimalco'),
    (28012, 28000, 'Rosario de Mora'),
    (28013, 28000, 'San Marcos'),
    (28014, 28000, 'San Martín'),
    (28015, 28000, 'San Salvador'),
    (28016, 28000, 'Santiago Texacuangos'),
    (28017, 28000, 'Santo Tomás'),
    (28018, 28000, 'Soyapango'),
    (28019, 28000, 'Tonacatepeque'),
    (29001, 29000, 'Candelaria'),
    (29002, 29000, 'Cojutepeque'),
    (29003, 29000, 'El Carmen'),
    (29004, 29000, 'El Rosario'),
    (29005, 29000, 'Monte San Juan'),
    (29006, 29000, 'Oratorio de Concepción'),
    (29007, 29000, 'San Bartolomé Perulapía'),
    (29008, 29000, 'San Cristóbal'),
    (29009, 29000, 'San José Guayabal'),
    (29010, 29000, 'San Pedro Perulapán'),
    (29011, 29000, 'San Rafael Cedros'),
    (29012, 29000, 'San Ramón'),
    (29013, 29000, 'Santa Cruz Analquito'),
    (29014, 29000, 'Santa Cruz Michapa'),
    (29015, 29000, 'Suchitoto'),
    (29016, 29000, 'Tenancingo'),
    (30001, 30000, 'Cuyultitán'),
    (30002, 30000, 'El Rosario'),
    (30003, 30000, 'Jerusalén'),
    (30004, 30000, 'Mercedes La Ceiba'),
    (30005, 30000, 'Olocuilta'),
    (30006, 30000, 'Paraíso de Osorio'),
    (30007, 30000, 'San Antonio Masahuat'),
    (30008, 30000, 'San Emigdio'),
    (30009, 30000, 'San Francisco Chinameca'),
    (30010, 30000, 'San Juan Nonualco'),
    (30011, 30000, 'San Juan Talpa'),
    (30012, 30000, 'San Juan Tepezontes'),
    (30013, 30000, 'San Luis La Herradura'),
    (30014, 30000, 'San Luis Talpa'),
    (30015, 30000, 'San Miguel Tepezontes'),
    (30016, 30000, 'San Pedro Masahuat'),
    (30017, 30000, 'San Pedro Nonualco'),
    (30018, 30000, 'San Rafael Obrajuelo'),
    (30019, 30000, 'Santa María Ostuma'),
    (30020, 30000, 'Santiago Nonualco'),
    (30021, 30000, 'Tapalhuaca'),
    (30022, 30000, 'Zacatecoluca'),
    (31001, 31000, 'Cinquera'),
    (31002, 31000, 'Dolores'),
    (31003, 31000, 'Guacotecti'),
    (31004, 31000, 'Ilobasco'),
    (31005, 31000, 'Jutiapa'),
    (31006, 31000, 'San Isidro'),
    (31007, 31000, 'Sensuntepeque'),
    (31008, 31000, 'Tejutepeque'),
    (31009, 31000, 'Victoria'),
    (32001, 32000, 'Apastepeque'),
    (32002, 32000, 'Guadalupe'),
    (32003, 32000, 'San Cayetano Istepeque'),
    (32004, 32000, 'San Esteban Catarina'),
    (32005, 32000, 'San Ildefonso'),
    (32006, 32000, 'San Lorenzo'),
    (32007, 32000, 'San Sebastián'),
    (32008, 32000, 'San Vicente'),
    (32009, 32000, 'Santa Clara'),
    (32010, 32000, 'Santo Domingo'),
    (32011, 32000, 'Tecoluca'),
    (32012, 32000, 'Tepetitán'),
    (32013, 32000, 'Verapaz'),
    (33001, 33000, 'Alegría'),
    (33002, 33000, 'Berlín'),
    (33003, 33000, 'California'),
    (33004, 33000, 'Concepción Batres'),
    (33005, 33000, 'El Triunfo'),
    (33006, 33000, 'Ereguayquín'),
    (33007, 33000, 'Estanzuelas'),
    (33008, 33000, 'Jiquilisco'),
    (33009, 33000, 'Jucuapa'),
    (33010, 33000, 'Jucuarán'),
    (33011, 33000, 'Mercedes Umaña'),
    (33012, 33000, 'Nueva Granada'),
    (33013, 33000, 'Ozatlán'),
    (33014, 33000, 'Puerto El Triunfo'),
    (33015, 33000, 'San Agustín'),
    (33016, 33000, 'San Buenaventura'),
    (33017, 33000, 'San Dionisio'),
    (33018, 33000, 'San Francisco Javier'),
    (33019, 33000, 'Santa Elena'),
    (33020, 33000, 'Santa María'),
    (33021, 33000, 'Santiago de María'),
    (33022, 33000, 'Tecapán'),
    (33023, 33000, 'Usulután'),
    (34001, 34000, 'Carolina'),
    (34002, 34000, 'Chapeltique'),
    (34003, 34000, 'Chinameca'),
    (34004, 34000, 'Chirilagua'),
    (34005, 34000, 'Ciudad Barrios'),
    (34006, 34000, 'Comacarán'),
    (34007, 34000, 'El Tránsito'),
    (34008, 34000, 'Lolotique'),
    (34009, 34000, 'Moncagua'),
    (34010, 34000, 'Nueva Guadalupe'),
    (34011, 34000, 'Nuevo Edén de San Juan'),
    (34012, 34000, 'Quelepa'),
    (34013, 34000, 'San Antonio'),
    (34014, 34000, 'San Gerardo'),
    (34015, 34000, 'San Jorge'),
    (34016, 34000, 'San Luis de la Reina'),
    (34017, 34000, 'San Miguel'),
    (34018, 34000, 'San Rafael Oriente'),
    (34019, 34000, 'Sesori'),
    (34020, 34000, 'Uluazapa'),
    (35001, 35000, 'Arambala'),
    (35002, 35000, 'Cacaopera'),
    (35003, 35000, 'Chilanga'),
    (35004, 35000, 'Corinto'),
    (35005, 35000, 'Delicias de Concepción'),
    (35006, 35000, 'El Divisadero'),
    (35007, 35000, 'El Rosario'),
    (35008, 35000, 'Gualococti'),
    (35009, 35000, 'Guatajiagua'),
    (35010, 35000, 'Joateca'),
    (35011, 35000, 'Jocoaitique'),
    (35012, 35000, 'Jocoro'),
    (35013, 35000, 'Lolotiquillo'),
    (35014, 35000, 'Meanguera'),
    (35015, 35000, 'Osicala'),
    (35016, 35000, 'Perquín'),
    (35017, 35000, 'San Carlos'),
    (35018, 35000, 'San Fernando'),
    (35019, 35000, 'San Francisco Gotera'),
    (35020, 35000, 'San Isidro'),
    (35021, 35000, 'San Simón'),
    (35022, 35000, 'Sensembra'),
    (35023, 35000, 'Sociedad'),
    (35024, 35000, 'Torola'),
    (35025, 35000, 'Yamabal'),
    (35026, 35000, 'Yoloaiquín'),
    (36001, 36000, 'Anamorós'),
    (36002, 36000, 'Bolívar'),
    (36003, 36000, 'Concepción de Oriente'),
    (36004, 36000, 'Conchagua'),
    (36005, 36000, 'El Carmen'),
    (36006, 36000, 'El Sauce'),
    (36007, 36000, 'Intipucá'),
    (36008, 36000, 'La Unión'),
    (36009, 36000, 'Lislique'),
    (36010, 36000, 'Meanguera del Golfo'),
    (36011, 36000, 'Nueva Esparta'),
    (36012, 36000, 'Pasaquina'),
    (36013, 36000, 'Polorós'),
    (36014, 36000, 'San Alejo'),
    (36015, 36000, 'San José'),
    (36016, 36000, 'Santa Rosa de Lima'),
    (36017, 36000, 'Yayantique'),
    (36018, 36000, 'Yucuaiquín')
ON CONFLICT (tow_id) DO NOTHING;

COMMIT;

-- ============================================================================
-- Verificación — correla después. Cada fila debería decir 'ok'.
-- ============================================================================
SELECT 'A1 pub_origin' AS paso,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                         WHERE table_schema = 'ecom' AND table_name = 'publications'
                           AND column_name = 'pub_origin') THEN 'ok' ELSE 'FALTA' END AS estado
UNION ALL
SELECT 'A2 customer.cou_id',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                         WHERE table_schema = 'ecom' AND table_name = 'customer'
                           AND column_name = 'cou_id') THEN 'ok' ELSE 'FALTA' END
UNION ALL
SELECT 'A3 empresas sin plan',
       CASE WHEN count(*) = 0 THEN 'ok' ELSE count(*) || ' empresas con sub_id NULL' END
  FROM ecom.business WHERE sub_id IS NULL
UNION ALL
SELECT 'A4 v_plan_efectivo resuelve a todos',
       CASE WHEN (SELECT count(*) FROM ecom.v_plan_efectivo) = (SELECT count(*) FROM ecom.customer)
            THEN 'ok' ELSE 'hay usuarios sin plan efectivo' END
UNION ALL
SELECT 'A5 stories',
       CASE WHEN to_regclass('ecom.stories') IS NOT NULL
             AND to_regclass('ecom.story_views') IS NOT NULL THEN 'ok' ELSE 'FALTA' END
UNION ALL
SELECT 'B1 FK con tipo distinto al padre',
       CASE WHEN count(*) = 0 THEN 'ok' ELSE count(*) || ' FK disparejas' END
  FROM pg_constraint c
  JOIN pg_attribute a  ON a.attrelid = c.conrelid  AND a.attnum = c.conkey[1]
  JOIN pg_attribute af ON af.attrelid = c.confrelid AND af.attnum = c.confkey[1]
 WHERE c.contype = 'f' AND c.connamespace = 'ecom'::regnamespace
   AND a.atttypid <> af.atttypid
UNION ALL
SELECT 'C2 El Salvador',
       CASE WHEN (SELECT count(*) FROM ecom.cat_city WHERE cou_id = 503) = 14
             AND (SELECT count(*) FROM ecom.cat_town t JOIN ecom.cat_city c ON c.cit_id = t.cit_id
                   WHERE c.cou_id = 503) = 262 THEN 'ok' ELSE 'incompleto' END;

-- ============================================================================
-- Lo que queda distinto a propósito (cosmético, no hace falta tocarlo):
--   * publications_comments conserva el nombre de antes del rename
--     (publication_comments_pkey y publication_comments_comment_id_seq).
--   * messages conserva sus FK con nombre automático (messages_*_fkey) en vez
--     de fk_msg_*. La definición es la misma.
--   * customer_audit_log.created_at y platform_config.updated_at dicen now()
--     en vez de CURRENT_TIMESTAMP. Son la misma función.
--
-- Índices de rendimiento que NO están en database.sql: ver
-- docs/db/indices-recomendados.sql. Van con CREATE INDEX CONCURRENTLY, que
-- no puede correr dentro de BEGIN/COMMIT.
-- ============================================================================
