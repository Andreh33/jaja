# Migration notes (BBDD)

Convenciones y peculiaridades del flujo de migración con `drizzle-kit` 0.31.x +
`drizzle-orm` 0.45.x sobre Turso (libsql). Lectura obligatoria antes de tocar
`drizzle/schema.ts` o ejecutar `db:push`.

---

## Cómo se hacen las migraciones aquí

- Fuente única de verdad: `drizzle/schema.ts`.
- Aplicación: `npm run db:push` (NO `npx drizzle-kit push` directo — ver más
  abajo). El hook `predb:push` ejecuta `scripts/verify-uniques.ts` antes para
  abortar si algún UNIQUE INDEX crítico ha desaparecido.
- Inspección: `npx tsx scripts/verify-schema.ts` lista tablas, columnas,
  índices y conteos.
- Reparación de UNIQUE: `npx tsx scripts/fix-missing-indexes.ts` reaplica
  los índices nombrados con `IF NOT EXISTS` (idempotente).

---

## ⚠️ Convenciones obligatorias en `drizzle/schema.ts`

Estas convenciones existen para evitar drift cíclico que drizzle-kit 0.31.x
genera en cada `db:push` cuando se declara de otra forma. Cambiarlas reabre
los bugs.

### 1. UNIQUE → siempre `uniqueIndex()` en callback de array

**Sí**:
```ts
sqliteTable('users', {
  email: text('email').notNull(),
}, (t) => [
  uniqueIndex('users_email_unique').on(t.email),
]);
```

**NO** (reabre el drift):
- `text('email').notNull().unique()` inline.
- `(t) => ({ key: uniqueIndex(...) })` con callback de objeto.

El nombre del índice debe ser `<table>_<column>_unique` para mantener
consistencia con los índices ya existentes en BBDD.

### 2. Defaults `CURRENT_TIMESTAMP` con paréntesis

**Sí**:
```ts
const NOW = sql`(CURRENT_TIMESTAMP)`;
createdAt: integer('created_at', { mode: 'timestamp' }).default(NOW),
```

**NO** (reabre drift de `ALTER COLUMN`):
- `sql\`CURRENT_TIMESTAMP\`` sin paréntesis.

Drizzle escribe los defaults a la BBDD ya envueltos en paréntesis; cuando
introspecciona vuelve a leerlos con paréntesis. Si la declaración no matchea,
genera un `ALTER COLUMN ... TO ... DEFAULT ...` redundante en cada push.

---

## SIEMPRE usar `npm run db:push` (NUNCA el binario directo)

`npm run db:push` ejecuta el hook `predb:push` que lanza
`scripts/verify-uniques.ts`. Este verifica que los 5 UNIQUE INDEX críticos
están presentes ANTES del push y aborta con exit code 1 si falta alguno.

Ejecutar `npx drizzle-kit push` directamente **salta el hook** y deja la BBDD
expuesta a que un siguiente push corrupto pase desapercibido.

UNIQUE indexes críticos vigilados:
- `users_email_unique`
- `posts_slug_unique`
- `password_resets_token_unique`
- `subscriptions_stripe_subscription_id_unique`
- `orders_stripe_session_id_unique`
- `empresas_user_id_unique`
- `admin_client_data_user_id_unique`
- `job_offers_slug_unique`

---

## Known schema drifts

### ✅ RESUELTO — Drift de UNIQUE INDEX cíclico

**Síntoma**: `db:push` planeaba `DROP INDEX` + `CREATE UNIQUE INDEX` para los
5 índices únicos en cada ejecución, aunque la BBDD ya los tuviera correctos.

**Root cause**: drizzle-kit 0.31.x con `dialect: 'turso'` no parseaba la
sintaxis `(t) => ({ ... })` de callback de tabla con objeto. Tampoco
reconciliaba los `.unique()` inline contra los UNIQUE INDEX nombrados que
existen en BBDD.

**Fix aplicado** (commit que introduce este documento): migrar las 5
declaraciones a `uniqueIndex()` explícito en callback de **array**.

**Verificación**: `echo n | npx drizzle-kit push --strict --verbose` devuelve
`[i] No changes detected` cuando schema y BBDD coinciden.

### ✅ RESUELTO — Drift de `ALTER COLUMN ... DEFAULT CURRENT_TIMESTAMP`

**Síntoma**: cada `db:push` planeaba 7 sentencias `ALTER COLUMN` redundantes
sobre todas las columnas timestamp con `DEFAULT CURRENT_TIMESTAMP`.

**Root cause**: drizzle-kit normaliza el default a `(CURRENT_TIMESTAMP)` al
escribirlo a la BBDD, pero comparaba contra `CURRENT_TIMESTAMP` (sin
paréntesis) en el schema, marcando divergencia falsa.

**Fix aplicado**: declarar el default con paréntesis,
`sql\`(CURRENT_TIMESTAMP)\``.

---

## Bug histórico de drizzle-kit ya superado

Durante la primera migración de Stripe, drizzle-kit emitió `CREATE UNIQUE
INDEX` seguido de `DROP INDEX` para los **mismos** 2 índices nuevos
(`subscriptions_stripe_subscription_id_unique`,
`orders_stripe_session_id_unique`), dejando las tablas sin unicidad. Se
recreó manualmente con `scripts/fix-missing-indexes.ts`. El fix de schema
descrito arriba previene la recurrencia, pero el script queda como red de
seguridad si reaparece.

---

## Cuándo considerar upgrade a drizzle-kit 1.0

Hoy estamos en 0.31.10 (latest stable). Existe `drizzle-kit@1.0.0-rc.2`.
El upgrade no es urgente porque los drifts críticos están resueltos por
las convenciones documentadas arriba.

Considerar upgrade si:
- Alguna tabla supera ~10k filas y los `ALTER COLUMN` (cuando aparezcan)
  empiezan a costar tiempo real.
- Drizzle 1.0 alcanza estable y trae mejoras de introspección libsql.
- Aparece un drift nuevo no resuelto por las convenciones de este doc.

Antes de upgradear: hacer snapshot Turso, leer changelog completo, probar
en rama y verificar que los 5 UNIQUE siguen presentes.

---

## Admin schema additions

Tabla `admin_client_data` y UNIQUE en `empresas.user_id` añadidos en el
commit `chore(db): add admin_client_data table + empresas user_id UNIQUE`.

### Decisión: tabla nueva en lugar de extender `empresas`

Los campos editables solo por admin (`comercial_que_vendio`,
`dominio_elegido`, `tareas_pendientes`) viven en una tabla dedicada
`admin_client_data` con `user_id UNIQUE` (FK `users` ON DELETE CASCADE).
Razones:

- **Separación semántica**: `empresas` es info que el cliente rellena en
  su dashboard (`EmpresaForm.tsx`). `admin_client_data` es solo para
  notas operativas internas.
- **Cero riesgo a `empresas` existentes**: la tabla `empresas` no tenía
  UNIQUE sobre `user_id` y se desconocía si existían duplicados. Antes
  del push se ejecutó `SELECT user_id, COUNT(*) c FROM empresas GROUP
  BY user_id HAVING c > 1` → 0 filas (5 filas totales, 5 distinct
  user_ids), por lo que el UNIQUE se añadió de paso.
- `notas_internas` **se queda en `empresas`** donde ya existía. No se
  duplica.

### Estructura

```sql
CREATE TABLE admin_client_data (
  id text PRIMARY KEY NOT NULL,
  user_id text NOT NULL,
  comercial_que_vendio text,
  dominio_elegido text,
  tareas_pendientes text,             -- texto plano multi-línea
  created_at integer DEFAULT (CURRENT_TIMESTAMP),
  updated_at integer DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX admin_client_data_user_id_unique ON admin_client_data (user_id);
CREATE UNIQUE INDEX empresas_user_id_unique ON empresas (user_id);
```

`tareas_pendientes` se almacena como **texto plano** (saltos de línea
para listar). Si en el futuro se quiere TODO estructurado, se migrará a
`text(json)` aparte y se añadirá un editor de checklist.

### Rollback

Bloque añadido al final de `scripts/rollback-stripe-schema.sql` —
revierte solo estas adiciones sin tocar las tablas Stripe.

---

## Job portal schema

Tablas `job_offers` y `job_applications` añadidas en el commit
`chore(db): add job_offers and job_applications tables for job portal`.

### Estructura

- **`job_offers`**: ofertas de empleo publicadas. `slug` UNIQUE
  (URL pública `/empleo/[slug]`), `status` controla visibilidad
  (`borrador`/`publicada`/`cerrada`). `published_at` y `closed_at`
  se rellenan al transicionar de estado. Campos opcionales para
  contract_type, schedule, salary, languages, experience, extras.
- **`job_applications`**: candidaturas recibidas vía portal público.
  `job_offer_id` FK a `job_offers` con **ON DELETE SET NULL** —
  si la oferta se borra, la candidatura sobrevive como espontánea.
  CV almacenado en Vercel Blob; aquí se guarda URL + filename + tamaño.

### Snapshots de la oferta en el momento de aplicar

`job_applications` guarda 4 columnas snapshot (todas nullable):
`offer_title_snapshot`, `offer_description_snapshot`,
`offer_salary_snapshot`, `offer_slug_snapshot`. Permiten al admin
ver la oferta original incluso si la oferta cambió o desapareció.
Si la candidatura es espontánea (sin oferta), las 4 quedan NULL.

### CHECK constraints (defensa en profundidad)

Aunque la app valide los enums vía zod, la BBDD también lo hace
con CHECK constraints sobre las columnas:

- `job_offers_contract_type_check`: contract_type IN
  ('indefinido','temporal','practicas','freelance') o NULL.
- `job_offers_schedule_check`: schedule IN
  ('completa','parcial','flexible') o NULL.
- `job_offers_requires_computer_check`: requires_computer IN
  ('si','no','depende').
- `job_offers_status_check`: status IN
  ('borrador','publicada','cerrada').
- `job_applications_has_computer_check`: has_computer IN
  ('si','no') o NULL.
- `job_applications_status_check`: status IN
  ('pendiente','contactado','descartado','contratado').

### Retention policy GDPR

Candidaturas con `status != 'contratado'` se eliminan a los 30 días
desde `created_at` por un cron job (ver commit `feat(jobs): GDPR
cleanup cron for old applications and CVs`). El CV en Vercel Blob
se borra simultáneamente. Las contratadas se conservan
indefinidamente como parte de la relación laboral.

### ⚠️ Drift falso de drizzle-kit detectado en este commit

Tras crear las dos tablas con `check()` constraints, ejecutar
`drizzle-kit push --strict --verbose` por segunda vez muestra un
plan que propone **recrear las 12 tablas existentes** con el
patrón `CREATE TABLE __new_X` + `INSERT INTO __new_X SELECT ...`
+ `DROP TABLE X` + `RENAME __new_X TO X`. Esto es un **drift
falso del comparador** de drizzle-kit 0.31.x — los datos en BBDD
están correctos, las definiciones de schema también, pero el
parser introspecta diferente al añadir `check()`.

**NO ejecutar `npm run db:push` aceptando el plan sin auditar
qué statements aplicaría.** Si el plan incluye CREATE TABLE
`__new_*` para tablas que ya existen, abortar con `n` y
revisar manualmente.

Verificación tras el push aplicado: `verify-schema.ts` confirma
que las 12 tablas tienen sus columnas, defaults y NOT NULLs
intactos; los counts de filas se preservan (subscriptions=1,
users=9, etc. tras el push).

Mitigación futura: considerar upgrade de drizzle-kit a una versión
que no muestre este drift falso, o añadir un script `db:push:safe`
que aborte automáticamente si detecta `__new_*` en el plan.

---

## Stripe API version pinning

**Pin actual** (`src/lib/stripe.ts`): `2026-04-22.dahlia`.

Stripe re-entrega webhooks usando la `apiVersion` del evento original, así
que en producción pueden llegar tanto eventos de la versión pinned como
re-entregas con shapes anteriores. Los handlers tienen que tolerar ambos.

### Cambios de shape relevantes en 2026-04-22.dahlia

| Antes (root) | Ahora |
| --- | --- |
| `invoice.subscription` | `invoice.parent.subscription_details.subscription` |
| `subscription.current_period_start` | `subscription.items.data[].current_period_start` |
| `subscription.current_period_end` | `subscription.items.data[].current_period_end` |

### Cómo lo manejamos

`src/lib/webhook-handlers.ts` exporta dos helpers que leen del path nuevo
con fallback al root:

- `extractInvoiceSubscriptionId(invoice)` — usado en `handleInvoicePaid` y
  `handleInvoicePaymentFailed`.
- `extractSubscriptionPeriods(sub)` — usado en
  `handleCustomerSubscriptionUpdated` y en `scripts/reconcile-subscriptions.ts`.

`tests/webhook-handlers.test.ts` cubre ambos shapes (modern + legacy) y
verifica que los helpers eligen el path correcto cuando coexisten. Correr
con `npm test`.

### Antes de bumpear `apiVersion`

1. Leer el changelog del release de Stripe entre el pin actual y el nuevo.
2. Identificar qué campos cambian de path en `Invoice`, `Subscription`,
   `Charge`, `PaymentIntent` y `Customer`.
3. Para cada cambio, **añadir el path nuevo al helper correspondiente y
   mantener el fallback al path anterior** (no eliminar el viejo — sigue
   llegando vía redelivery).
4. Añadir un test de regresión con el shape nuevo.
5. Ejecutar `npx tsx scripts/reconcile-subscriptions.ts --all` después del
   deploy para resincronizar cualquier dato escrito por handlers viejos
   contra el shape nuevo.

### Reconciliación

`scripts/reconcile-subscriptions.ts` es la red de seguridad cuando un
handler falla silenciosamente o un evento se pierde. Compara cada
`subscriptions` row local contra `stripe.subscriptions.retrieve()` y
actualiza si difieren. Idempotente: re-ejecutarlo es seguro.

- Sin flags: solo filas con `status='incomplete'` o `current_period_end IS NULL`.
- `--all`: barre toda la tabla.

Pensado para reusarse en un job nightly futuro.

---

## Rollback

Si una migración futura sale mal, hay dos vías:

1. **Rollback granular del schema Stripe** — `scripts/rollback-stripe-schema.sql`
   (drop de tablas y columnas añadidas en la fase Stripe).
2. **Restore completo** — snapshot de Turso desde el dashboard.

Documentar siempre cualquier nueva migración aquí antes de pushearla.
