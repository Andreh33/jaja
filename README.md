# Latech · Servicios Tecnológicos Premium

Plataforma web premium para Latech (Badajoz) — diseño web, tiendas online y agentes de IA con n8n.

## ⚠️ AVISO DE SEGURIDAD

El token de Turso (`TURSO_AUTH_TOKEN`) se compartió por canales no cifrados durante la creación del proyecto.
**Antes de pasar a producción, ROTA EL TOKEN:**

```bash
turso db tokens create latech-andreh
```

Luego sustituye el valor en `.env.local` y en las variables de entorno de Vercel.

---

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** con CSS variables (sistema de diseño Latech)
- **Framer Motion** + **GSAP** para animaciones
- **Drizzle ORM** + **Turso (libSQL)** para BBDD
- **NextAuth v5** (credentials + JWT) para autenticación
- **Stripe Payment Links** para pagos
- **Sharp** para optimización de imágenes
- **Leaflet** para mapas (CartoDB Dark)
- **React Hook Form + Zod** para formularios
- **Sonner** para toasts

## Estructura

```
latech/
├── drizzle/
│   └── schema.ts                  # Schema Turso/SQLite
├── public/
│   ├── audio/                     # Demo del agente IA
│   ├── documentos/                # PDFs (términos, privacidad)
│   └── uploads/clientes/          # Archivos por cliente
├── scripts/seed.ts                # Seed admin + posts
└── src/
    ├── app/
    │   ├── (publicas)            # Home, sobre nosotros, blog, tienda, contacto
    │   ├── login/, registro/, recuperar/
    │   ├── dashboard/             # Panel cliente (protected)
    │   ├── admin/                 # Panel admin (route group)
    │   │   ├── login/             # Login admin (público)
    │   │   └── (protected)/       # Dashboard, clientes, posts, mensajes
    │   └── api/                   # Route handlers
    ├── components/
    │   ├── effects/               # Cursor, MouseGlow, Aurora, Marquee, Reveal,
    │   │                          # MagneticButton, GradientText, TiltCard,
    │   │                          # BeamBorder, Holographic, NumberFlow,
    │   │                          # ScrollProgress
    │   ├── layout/                # Navbar, Footer, Logo
    │   ├── home/                  # Hero, Services, Stats, FAQ, etc.
    │   ├── shop/                  # PlanCard
    │   ├── shared/                # AudioPlayer, BlogCard, Map, PDFViewer
    │   ├── dashboard/             # Sidebar, EmpresaForm, FileUploader, FileGallery
    │   └── admin/                 # PostEditor
    ├── lib/                       # auth, db, posts, markdown, stripe-links, utils
    └── proxy.ts                   # Auth/role-based route protection (Next 16)
```

## Credenciales seed

```
Admin   admin@latech.es / LatechAdmin2026!
Cliente demo@cliente.es / demo1234
```

## Setup local

```bash
npm install
npm run db:push     # aplica schema en Turso
npm run db:seed     # crea admin + 6 posts iniciales
npm run dev         # http://localhost:3000
```

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena:

```bash
TURSO_DATABASE_URL=libsql://....turso.io
TURSO_AUTH_TOKEN=...

# Genera con: openssl rand -base64 32
NEXTAUTH_SECRET=...
AUTH_SECRET=...   # mismo valor
NEXTAUTH_URL=http://localhost:3000   # producción: https://tudominio.es
AUTH_TRUST_HOST=true

ADMIN_EMAIL=admin@latech.es
ADMIN_PASSWORD=LatechAdmin2026!

STRIPE_LINK_PLAN_WEB=https://buy.stripe.com/dRmaEQd0sfAKaWFgpn9ws0e
STRIPE_LINK_PLAN_TIENDA=https://buy.stripe.com/5kQ8wI9Og74ed4N0qp9ws0k
STRIPE_LINK_PLAN_IA=                # cuando exista, si no usa WhatsApp como fallback

NEXT_PUBLIC_WHATSAPP_NUMBER=34684739091
WHATSAPP_NUMBER=34684739091
```

## Scripts

| Comando | Acción |
|---------|--------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Lint con ESLint |
| `npm run db:push` | Aplicar schema a Turso |
| `npm run db:generate` | Generar migraciones SQL |
| `npm run db:studio` | Drizzle Studio (UI BBDD) |
| `npm run db:seed` | Seed de datos iniciales |

## Funcionalidades clave

### Públicas
- **Home** — hero monumental, servicios, proceso, stats, testimonios, FAQ, CTA
- **Sobre nosotros** — texto extenso, valores, stack tecnológico
- **Blog** — listado con filtros + detalle con TOC + posts relacionados
- **Tienda** — overview + 3 detalles (web/online/agente-ia) con su acento
- **Agente IA** — incluye player de audio con waveform en vivo
- **Contacto** — formulario + info + mapa Leaflet en tema oscuro
- **Términos / Privacidad** — render embebido de PDFs
- **404** — pantalla premium con aurora

### Auth
- **Login con 2 portales (Negocios / Trabajadores)** con animación spring
- Trabajadores redirige a `https://hh-gamma.vercel.app/dashboard`
- Registro, recuperación de contraseña con token de 1h

### Dashboard cliente (`/dashboard`)
- Inicio con welcome banner dismissable + KPIs + checklist
- **Mi empresa** con autoguardado cada 2s (formulario completo)
- **Mis archivos** drag & drop con `react-dropzone`, optimización con Sharp, categorías
- Perfil, Seguridad (cambio password), Facturación

### Admin (`/admin`)
- Dashboard con KPIs holográficos
- **Clientes** — listado tabular + vista detalle con explorador de archivos
- **Descarga ZIP** de todos los archivos de un cliente vía streaming archiver
- **Posts** — editor markdown con preview en tiempo real
- **Mensajes** — bandeja con marcar leído/no leído, eliminar, responder por WhatsApp/email

## Sistema de diseño

CSS variables en `src/app/globals.css`:

- **Identidad** — paleta morada, gradiente firma `linear-gradient(135deg, #8B5CF6, #C084FC, #F97316, #FBBF24)`
- **Acentos por sección** — azul (web), naranja (shop), verde (IA)
- **Tipografía** — Syne (display), Geist (sans), Geist Mono
- **Glassmorphism** — `backdrop-filter: blur(24px) saturate(180%)`
- **Beam border** animado con conic-gradient
- **Holographic surface** con shimmer diagonal
- **Mouse spotlight** dinámico vía CSS variables

## Cómo añadir el primer post desde admin

1. Login en `/admin/login` con credenciales admin
2. Ir a `/admin/posts` → "Nuevo post"
3. Rellenar título, slug (autogenerado), categoría, extracto y contenido en markdown
4. Toggle preview para previsualizar
5. Guardar publicado o como borrador

Markdown soportado: `## H2`, `### H3`, párrafos, listas (`- ` y `1. `), `**bold**`, `*italic*`, `[link](url)`, `> blockquote`, ` `inline code` `.

## Cómo gestionar archivos de clientes desde admin

1. `/admin/clientes` lista todos los clientes
2. Click en una fila → `/admin/clientes/[id]`
3. Sidebar con info del cliente + acciones (WhatsApp, email)
4. Centro: explorador con archivos por categoría
5. **"Descargar todo (.zip)"** genera ZIP en streaming con todos los archivos

## Configurar el link de Stripe del agente IA

Cuando tengas el Payment Link de Stripe del plan IA:

1. Crea una variable en Vercel: `STRIPE_LINK_PLAN_IA=https://buy.stripe.com/...`
2. Redeploy

Mientras esté vacío, el botón "Solicitar demo personalizada" lleva a WhatsApp pre-rellenado.

## Deploy a Vercel

### 1. Linkea el proyecto

```bash
npm i -g vercel
vercel login
vercel link
```

### 2. Configura variables de entorno

En **Vercel Dashboard → Settings → Environment Variables** añade todas las del `.env.local` para los entornos `Production`, `Preview` y `Development`. **Recuerda rotar el token de Turso antes**.

`NEXTAUTH_URL` debe apuntar a tu URL de producción (sin `/` final).

### 3. Push y deploy

```bash
git push origin main
vercel --prod
```

> ⚠️ Las subidas de archivos en `public/uploads/clientes/` **no persisten en Vercel** entre deploys. Para producción seria, conviene migrar a un blob storage (Vercel Blob, R2, S3) — el código actual asume sistema de ficheros local, ideal para desarrollo y para hostings con disco persistente.

## Roadmap futuro

- [ ] Integración completa con Stripe API (no solo Payment Links): facturas automáticas con IVA, gestión de suscripciones, portal cliente
- [ ] Emails transaccionales con Resend (verificación, recuperación, notificaciones admin)
- [ ] Vercel Blob para uploads en producción
- [ ] Métricas reales de cliente en `/dashboard/facturacion`
- [ ] CMS visual para los posts (Sanity / Tina)
- [ ] Internacionalización ES/EN
- [ ] PWA con notificaciones para admin
- [ ] Tests E2E con Playwright

## Licencia

Proprietario · Latech · 2026
