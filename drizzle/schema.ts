import { sqliteTable, text, integer, index, uniqueIndex, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * NOTAS sobre convenciones que NO se pueden cambiar sin reproducir bugs de
 * drizzle-kit 0.31.x con dialect:'turso':
 *
 * 1. uniqueIndex() explícito en CALLBACK DE ARRAY: `(t) => [ uniqueIndex(...) ]`.
 *    NO usar `.unique()` inline ni callback de objeto `(t) => ({...})` — drizzle
 *    no los parsea correctamente y emite DROP/CREATE INDEX cíclico en cada push.
 *
 * 2. Defaults timestamp con paréntesis: `sql\`(CURRENT_TIMESTAMP)\``. Drizzle escribe
 *    los defaults a libsql/turso con paréntesis; la comparación contra la BBDD live
 *    requiere que la declaración matchee exactamente o emite ALTER COLUMN cíclico.
 *
 * Ver docs/MIGRATION_NOTES.md.
 */

const NOW = sql`(CURRENT_TIMESTAMP)`;

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull(),
  password: text('password').notNull(),
  name: text('name'),
  phone: text('phone'),
  role: text('role', { enum: ['CLIENT', 'ADMIN'] }).default('CLIENT').notNull(),
  emailVerified: integer('email_verified', { mode: 'timestamp' }),
  // Stripe customer (calculator wizard). Null hasta que el usuario hace su primer checkout.
  stripeCustomerId: text('stripe_customer_id'),
  // Flag manual para aprovisionar número virtual Twilio/Telnyx tras primer pago del agente teléfono.
  phoneAgentPendingProvision: integer('phone_agent_pending_provision', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(NOW),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(NOW),
}, (t) => [
  uniqueIndex('users_email_unique').on(t.email),
]);

export const empresas = sqliteTable('empresas', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  nombre: text('nombre'),
  cif: text('cif'),
  sector: text('sector'),
  telefono: text('telefono'),
  email: text('email'),
  direccion: text('direccion'),
  ciudad: text('ciudad'),
  cp: text('cp'),
  horarios: text('horarios'),
  redes: text('redes', { mode: 'json' }),
  descripcion: text('descripcion'),
  serviciosContratados: text('servicios_contratados', { mode: 'json' }),
  notasInternas: text('notas_internas'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(NOW),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(NOW),
}, (t) => [
  uniqueIndex('empresas_user_id_unique').on(t.userId),
]);

export const archivos = sqliteTable('archivos', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  storedAs: text('stored_as').notNull(),
  mimeType: text('mime_type'),
  size: integer('size'),
  category: text('category', { enum: ['logo', 'foto', 'video', 'documento', 'otro'] }).default('otro'),
  url: text('url').notNull(),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).default(NOW),
});

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  cover: text('cover'),
  category: text('category'),
  author: text('author').default('Equipo Latech'),
  published: integer('published', { mode: 'boolean' }).default(true),
  publishedAt: integer('published_at', { mode: 'timestamp' }).default(NOW),
  readingMinutes: integer('reading_minutes').default(5),
}, (t) => [
  uniqueIndex('posts_slug_unique').on(t.slug),
]);

export const contactMessages = sqliteTable('contact_messages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  service: text('service'),
  message: text('message').notNull(),
  read: integer('read', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(NOW),
});

export const passwordResets = sqliteTable('password_resets', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
}, (t) => [
  uniqueIndex('password_resets_token_unique').on(t.token),
]);

/**
 * Suscripciones Stripe (calculator wizard).
 * IMPORTANTE: current_period_start / current_period_end en UNIX SECONDS (no ms).
 * Stripe devuelve seconds; en JS convertir con `new Date(seconds * 1000)`.
 */
export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: text('stripe_subscription_id').notNull(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  status: text('status').notNull(), // active|past_due|canceled|incomplete|trialing|...
  cadence: text('cadence', { enum: ['monthly', 'yearly'] }).notNull(),
  // JSON: [{ catalog_id: string, quantity: number }] — fuente de verdad real es Stripe.
  items: text('items', { mode: 'json' }).notNull(),
  // Unix SECONDS (Stripe). Convertir con new Date(s * 1000).
  currentPeriodStart: integer('current_period_start'),
  currentPeriodEnd: integer('current_period_end'),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(NOW),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(NOW),
}, (t) => [
  uniqueIndex('subscriptions_stripe_subscription_id_unique').on(t.stripeSubscriptionId),
]);

/**
 * Pedidos one-time (logo, web creation, horas SEO).
 * Las suscripciones recurrentes viven en `subscriptions`.
 */
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripeSessionId: text('stripe_session_id').notNull(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeCustomerId: text('stripe_customer_id'),
  amountTotal: integer('amount_total').notNull(), // cents
  currency: text('currency').default('eur').notNull(),
  status: text('status').notNull(), // paid|pending|failed
  // JSON: [{ catalog_id, quantity, amount_subtotal }]
  lineItems: text('line_items', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(NOW),
}, (t) => [
  uniqueIndex('orders_stripe_session_id_unique').on(t.stripeSessionId),
]);

/**
 * Tabla de idempotencia para webhooks de Stripe.
 * PK = event.id (estable y único en Stripe). Inserción al inicio del handler:
 * si choca por PK → evento ya procesado → return 200 inmediato.
 *
 * Retención: la tabla crece indefinidamente. Para limpieza periódica:
 *   DELETE FROM webhook_events WHERE received_at < (unixepoch() - 30*24*3600);
 * (No automatizado; ejecutar manualmente o programar en otra fase.)
 */
export const webhookEvents = sqliteTable('webhook_events', {
  // event.id de Stripe (ej. evt_1ABC...).
  eventId: text('event_id').primaryKey(),
  type: text('type').notNull(),
  receivedAt: integer('received_at', { mode: 'timestamp' }).default(NOW),
}, (t) => [
  index('idx_webhook_events_received_at').on(t.receivedAt),
]);

/**
 * Datos editables solo por admin (separados de `empresas` para no mezclar
 * info que el cliente rellena con anotaciones internas del equipo).
 *
 * Notas:
 *   - `notas_internas` NO vive aquí: ya existe en `empresas.notas_internas`
 *     y la ficha admin lo edita en su sitio actual.
 *   - `tareas_pendientes` es texto plano multi-línea (lista informal). Si
 *     en el futuro se quiere TODO estructurado, migrar a JSON aparte.
 *   - UNIQUE(user_id) para upserts limpios desde el endpoint admin.
 */
export const adminClientData = sqliteTable('admin_client_data', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  comercialQueVendio: text('comercial_que_vendio'),
  dominioElegido: text('dominio_elegido'),
  tareasPendientes: text('tareas_pendientes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(NOW),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(NOW),
}, (t) => [
  uniqueIndex('admin_client_data_user_id_unique').on(t.userId),
]);

/* =========================================================================
 * Portal de empleo
 * ========================================================================= */

/**
 * Ofertas de empleo publicadas por la empresa.
 *
 * - `slug` UNIQUE — URL pública /empleo/[slug].
 * - `status` controla visibilidad pública: 'borrador' (oculto),
 *   'publicada' (formulario abierto), 'cerrada' (visible pero sin form).
 * - CHECK constraints en BBDD como red de seguridad por si la app valida mal.
 */
export const jobOffers = sqliteTable('job_offers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  contractType: text('contract_type', { enum: ['indefinido', 'temporal', 'practicas', 'freelance'] }),
  schedule: text('schedule', { enum: ['completa', 'parcial', 'flexible'] }),
  salary: text('salary'),
  experienceRequired: text('experience_required'),
  languages: text('languages'),
  extras: text('extras'),
  requiresComputer: text('requires_computer', { enum: ['si', 'no', 'depende'] }).notNull(),
  positionsCount: integer('positions_count').notNull().default(1),
  status: text('status', { enum: ['borrador', 'publicada', 'cerrada'] }).notNull().default('borrador'),
  // Unix seconds (nullable hasta que la oferta se publica/cierra).
  publishedAt: integer('published_at'),
  closedAt: integer('closed_at'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(NOW),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(NOW),
}, (t) => [
  uniqueIndex('job_offers_slug_unique').on(t.slug),
  check(
    'job_offers_contract_type_check',
    sql`${t.contractType} IS NULL OR ${t.contractType} IN ('indefinido','temporal','practicas','freelance')`,
  ),
  check(
    'job_offers_schedule_check',
    sql`${t.schedule} IS NULL OR ${t.schedule} IN ('completa','parcial','flexible')`,
  ),
  check(
    'job_offers_requires_computer_check',
    sql`${t.requiresComputer} IN ('si','no','depende')`,
  ),
  check(
    'job_offers_status_check',
    sql`${t.status} IN ('borrador','publicada','cerrada')`,
  ),
]);

/**
 * Candidaturas recibidas a través del portal público.
 *
 * - `jobOfferId` con ON DELETE SET NULL: si se borra la oferta, la
 *   candidatura sobrevive como "espontánea". Los snapshots permiten al
 *   admin ver a qué oferta original aplicó aunque la oferta haya cambiado
 *   o desaparecido.
 * - `gdprConsentAt` registra el momento del consentimiento — usado por el
 *   cron de retención (30 días para no contratados).
 * - CV almacenado en Vercel Blob; aquí guardamos URL + metadata.
 */
export const jobApplications = sqliteTable('job_applications', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobOfferId: text('job_offer_id').references(() => jobOffers.id, { onDelete: 'set null' }),
  // Snapshots del estado de la oferta en el momento de aplicar.
  offerTitleSnapshot: text('offer_title_snapshot'),
  offerDescriptionSnapshot: text('offer_description_snapshot'),
  offerSalarySnapshot: text('offer_salary_snapshot'),
  offerSlugSnapshot: text('offer_slug_snapshot'),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  city: text('city').notNull(),
  message: text('message'),
  // null si la oferta no requiere ordenador (no se preguntó).
  hasComputer: text('has_computer', { enum: ['si', 'no'] }),
  cvBlobUrl: text('cv_blob_url').notNull(),
  cvFilename: text('cv_filename').notNull(),
  cvSizeBytes: integer('cv_size_bytes').notNull(),
  status: text('status', { enum: ['pendiente', 'contactado', 'descartado', 'contratado'] }).notNull().default('pendiente'),
  adminNotes: text('admin_notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(NOW).notNull(),
  // Unix seconds del consentimiento GDPR.
  gdprConsentAt: integer('gdpr_consent_at').notNull(),
}, (t) => [
  index('idx_job_applications_job_offer_id').on(t.jobOfferId),
  index('idx_job_applications_status').on(t.status),
  check(
    'job_applications_has_computer_check',
    sql`${t.hasComputer} IS NULL OR ${t.hasComputer} IN ('si','no')`,
  ),
  check(
    'job_applications_status_check',
    sql`${t.status} IN ('pendiente','contactado','descartado','contratado')`,
  ),
]);

export type User = typeof users.$inferSelect;
export type Empresa = typeof empresas.$inferSelect;
export type AdminClientData = typeof adminClientData.$inferSelect;
export type Archivo = typeof archivos.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type JobOffer = typeof jobOffers.$inferSelect;
export type JobApplication = typeof jobApplications.$inferSelect;
