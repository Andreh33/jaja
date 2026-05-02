-- Rollback de la migración Stripe (calculator wizard).
-- Aplica este SQL si necesitas revertir los cambios de schema introducidos
-- por la Fase 2 de la calculadora.
--
-- IMPORTANTE: ejecuta esto MANUALMENTE en Turso (turso db shell <db>) solo
-- si has decidido revertir. Borra suscripciones y orders almacenados.

-- 1) Tablas nuevas (en orden inverso de creación por si en el futuro hay FKs).
--    webhook_events fue añadida después de orders/subscriptions, así que va primero.
DROP TABLE IF EXISTS webhook_events;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS subscriptions;

-- 2) Columnas añadidas a `users`
-- Nota: SQLite soporta DROP COLUMN desde 3.35 (2021). Turso (libSQL) lo soporta.
ALTER TABLE users DROP COLUMN phone_agent_pending_provision;
ALTER TABLE users DROP COLUMN stripe_customer_id;

-- Si tu motor no soporta DROP COLUMN, usa el snapshot de Turso para restaurar.

-- =====================================================================
-- Admin schema additions (commit chore(db): add admin_client_data ...)
-- Revertir solo estas adiciones sin tocar el bloque Stripe de arriba.
-- =====================================================================
DROP INDEX IF EXISTS admin_client_data_user_id_unique;
DROP TABLE IF EXISTS admin_client_data;
DROP INDEX IF EXISTS empresas_user_id_unique;

-- =====================================================================
-- Job portal additions (commit chore(db): add job_offers and job_applications)
-- Orden: PRIMERO job_applications porque tiene FK a job_offers.
-- =====================================================================
DROP INDEX IF EXISTS idx_job_applications_status;
DROP INDEX IF EXISTS idx_job_applications_job_offer_id;
DROP TABLE IF EXISTS job_applications;
DROP INDEX IF EXISTS job_offers_slug_unique;
DROP TABLE IF EXISTS job_offers;
