import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
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
});

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

export type User = typeof users.$inferSelect;
export type Empresa = typeof empresas.$inferSelect;
export type Archivo = typeof archivos.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Order = typeof orders.$inferSelect;
