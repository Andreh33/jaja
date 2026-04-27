import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  phone: text('phone'),
  role: text('role', { enum: ['CLIENT', 'ADMIN'] }).default('CLIENT').notNull(),
  emailVerified: integer('email_verified', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

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
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
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
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  cover: text('cover'),
  category: text('category'),
  author: text('author').default('Equipo Latech'),
  published: integer('published', { mode: 'boolean' }).default(true),
  publishedAt: integer('published_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  readingMinutes: integer('reading_minutes').default(5),
});

export const contactMessages = sqliteTable('contact_messages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  service: text('service'),
  message: text('message').notNull(),
  read: integer('read', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const passwordResets = sqliteTable('password_resets', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export type User = typeof users.$inferSelect;
export type Empresa = typeof empresas.$inferSelect;
export type Archivo = typeof archivos.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
