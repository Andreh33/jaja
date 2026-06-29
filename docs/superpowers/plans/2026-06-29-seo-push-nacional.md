# Push SEO Nacional — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir 45 landing pages locales (15 ciudades × 3 servicios) + hub, ~20 posts de blog en clusters, y optimizar on-page lo existente, para ganar top 1 en búsquedas locales y long-tail.

**Architecture:** Landing pages estáticas (Next 16 `generateStaticParams`) generadas desde ficheros de datos TypeScript versionados; una plantilla compartida `LandingTemplate` reutiliza los componentes de diseño existentes. Contenido único por ciudad generado por subagentes Opus 4.8 + ultrathink. Posts de blog vía el mecanismo de seed existente (Turso, idempotente por slug). Publicación escalonada por tandas.

**Tech Stack:** Next.js 16.2.4 (App Router), React 19.2.4, TypeScript, Drizzle + Turso (libSQL), `@/lib/markdown` (renderMarkdown), Tailwind, framer-motion.

## Global Constraints

- NADA a producción sin OK expreso del usuario. Trabajo en rama `seo/push-nacional`.
- Reutilizar componentes de diseño existentes (Navbar, Footer, AuroraBackground, MouseGlow, MagneticButton, Reveal, JsonLd, SignatureMarquee). No rediseñar.
- Contenido **único por ciudad** (anti-doorway): prohibido plantilla con ciudad cambiada. Prohibido inventar oficinas físicas, datos o reseñas.
- `params` es `Promise` en Next 16 → siempre `await params`.
- Dominio del sitio: `https://serviciosonlineweb.com` (constante `SITE_URL`).
- Servicios y slugs: `diseno-web`, `tienda-online`, `agente-ia`.
- Publicación por tandas (nunca 45 páginas / 20 posts el mismo día).
- Verificar `npx tsc --noEmit` y `npm run build` verdes antes de cualquier publicación.

---

### Task 1: Modelo de datos y registro de ciudades

**Files:**
- Create: `src/content/local/types.ts`
- Create: `src/content/local/cities.ts`
- Create: `src/content/local/index.ts`

**Interfaces:**
- Produces:
  - `type Service = 'diseno-web' | 'tienda-online' | 'agente-ia'`
  - `interface City { slug: string; name: string; provincia: string; region: string; nearby: string[] }`
  - `interface LocalLanding { service: Service; citySlug: string; title: string; description: string; h1: string; intro: string; sectores: { nombre: string; gancho: string }[]; faq: { q: string; a: string }[]; bodyMarkdown: string }`
  - `CITIES: City[]` (15 entradas)
  - `getCity(slug: string): City | undefined`

- [ ] **Step 1: Crear los tipos** en `src/content/local/types.ts`

```ts
export type Service = 'diseno-web' | 'tienda-online' | 'agente-ia';

export const SERVICE_LABEL: Record<Service, string> = {
  'diseno-web': 'Diseño web',
  'tienda-online': 'Tienda online',
  'agente-ia': 'Agente de IA',
};

export interface City {
  slug: string;        // 'madrid'
  name: string;        // 'Madrid'
  provincia: string;   // 'Madrid'
  region: string;      // 'Comunidad de Madrid'
  nearby: string[];    // slugs de ciudades cercanas
}

export interface LocalLanding {
  service: Service;
  citySlug: string;
  title: string;        // <title> (<=60 chars ideal)
  description: string;  // meta description (<=155 chars)
  h1: string;
  intro: string;        // párrafo único ligado al tejido económico local
  sectores: { nombre: string; gancho: string }[]; // 3-5
  faq: { q: string; a: string }[];                // 4-6
  bodyMarkdown: string; // cuerpo en markdown (renderMarkdown)
}
```

- [ ] **Step 2: Crear el registro de 15 ciudades** en `src/content/local/cities.ts`

```ts
import type { City } from './types';

export const CITIES: City[] = [
  { slug: 'madrid', name: 'Madrid', provincia: 'Madrid', region: 'Comunidad de Madrid', nearby: ['valladolid', 'zaragoza'] },
  { slug: 'barcelona', name: 'Barcelona', provincia: 'Barcelona', region: 'Cataluña', nearby: ['valencia', 'zaragoza'] },
  { slug: 'valencia', name: 'Valencia', provincia: 'Valencia', region: 'Comunidad Valenciana', nearby: ['alicante', 'barcelona'] },
  { slug: 'sevilla', name: 'Sevilla', provincia: 'Sevilla', region: 'Andalucía', nearby: ['cordoba', 'malaga'] },
  { slug: 'malaga', name: 'Málaga', provincia: 'Málaga', region: 'Andalucía', nearby: ['granada', 'cordoba'] },
  { slug: 'zaragoza', name: 'Zaragoza', provincia: 'Zaragoza', region: 'Aragón', nearby: ['madrid', 'barcelona'] },
  { slug: 'murcia', name: 'Murcia', provincia: 'Murcia', region: 'Región de Murcia', nearby: ['alicante', 'granada'] },
  { slug: 'bilbao', name: 'Bilbao', provincia: 'Vizcaya', region: 'País Vasco', nearby: ['valladolid', 'zaragoza'] },
  { slug: 'alicante', name: 'Alicante', provincia: 'Alicante', region: 'Comunidad Valenciana', nearby: ['valencia', 'murcia'] },
  { slug: 'cordoba', name: 'Córdoba', provincia: 'Córdoba', region: 'Andalucía', nearby: ['sevilla', 'malaga'] },
  { slug: 'valladolid', name: 'Valladolid', provincia: 'Valladolid', region: 'Castilla y León', nearby: ['madrid', 'bilbao'] },
  { slug: 'vigo', name: 'Vigo', provincia: 'Pontevedra', region: 'Galicia', nearby: ['a-coruna'] },
  { slug: 'granada', name: 'Granada', provincia: 'Granada', region: 'Andalucía', nearby: ['malaga', 'cordoba'] },
  { slug: 'a-coruna', name: 'A Coruña', provincia: 'A Coruña', region: 'Galicia', nearby: ['vigo'] },
  { slug: 'badajoz', name: 'Badajoz', provincia: 'Badajoz', region: 'Extremadura', nearby: ['sevilla', 'cordoba'] },
];
```

- [ ] **Step 3: Crear helpers** en `src/content/local/index.ts`

```ts
import type { City, Service, LocalLanding } from './types';
import { CITIES } from './cities';
import { landings as disenoWeb } from './diseno-web';
import { landings as tiendaOnline } from './tienda-online';
import { landings as agenteIa } from './agente-ia';

export * from './types';
export { CITIES };

const BY_SERVICE: Record<Service, LocalLanding[]> = {
  'diseno-web': disenoWeb,
  'tienda-online': tiendaOnline,
  'agente-ia': agenteIa,
};

export function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function getLanding(service: Service, citySlug: string): LocalLanding | undefined {
  return BY_SERVICE[service].find((l) => l.citySlug === citySlug);
}

export function landingsFor(service: Service): LocalLanding[] {
  return BY_SERVICE[service];
}

export function allLandings(): LocalLanding[] {
  return [...disenoWeb, ...tiendaOnline, ...agenteIa];
}
```

- [ ] **Step 4: Crear stubs de datos** (una ciudad piloto cada uno, resto en Task 4) en `src/content/local/diseno-web.ts`, `tienda-online.ts`, `agente-ia.ts`

```ts
// src/content/local/diseno-web.ts (stub piloto; Task 4 completa las 15)
import type { LocalLanding } from './types';

export const landings: LocalLanding[] = [
  {
    service: 'diseno-web',
    citySlug: 'madrid',
    title: 'Diseño web en Madrid · entrega 24-48h | Latech',
    description: 'Diseño web profesional para empresas de Madrid: webs rápidas, optimizadas para Google y sin permanencia. Entrega en 24-48h por videollamada.',
    h1: 'Diseño web profesional en Madrid',
    intro: 'PLACEHOLDER_PILOTO — reemplazado en Task 4 por contenido único.',
    sectores: [{ nombre: 'Comercio', gancho: 'placeholder' }],
    faq: [{ q: '¿Trabajáis con empresas de Madrid en remoto?', a: 'placeholder' }],
    bodyMarkdown: '## Placeholder piloto\n\nReemplazado en Task 4.',
  },
];
```
(Repetir con `landings: LocalLanding[] = []` vacío para `tienda-online.ts` y `agente-ia.ts` — se rellenan en Task 4.)

- [ ] **Step 5: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: PASS (sin errores).

- [ ] **Step 6: Commit**

```bash
git add src/content/local/
git commit -m "feat(seo): modelo de datos y registro de ciudades para landing locales"
```

---

### Task 2: Plantilla de landing + helper de schema

**Files:**
- Create: `src/components/local/LandingTemplate.tsx`
- Modify: `src/lib/seo.ts` (añadir `localServiceJsonLd`)

**Interfaces:**
- Consumes: `LocalLanding`, `City`, `getCity` (Task 1); `renderMarkdown` (`@/lib/markdown`); `faqJsonLd`, `breadcrumbJsonLd` (`@/lib/seo`).
- Produces: `export default function LandingTemplate({ landing }: { landing: LocalLanding })`; `localServiceJsonLd(opts)`.

- [ ] **Step 1: Añadir helper de schema** en `src/lib/seo.ts` (al final, antes de cierre)

```ts
export function localServiceJsonLd(opts: {
  serviceName: string;
  description: string;
  path: string;
  city: string;
  region: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.serviceName,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: { '@type': 'City', name: opts.city, containedInPlace: { '@type': 'AdministrativeArea', name: opts.region } },
  };
}
```

- [ ] **Step 2: Crear la plantilla** en `src/components/local/LandingTemplate.tsx` (reutiliza el patrón de `src/app/blog/[slug]/page.tsx`)

```tsx
import Link from 'next/link';
import { ArrowRight, MessageCircle, MapPin } from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import { SignatureMarquee } from '@/components/effects/Marquee';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MagneticButton from '@/components/effects/MagneticButton';
import { Reveal } from '@/components/effects/Reveal';
import JsonLd from '@/components/seo/JsonLd';
import { renderMarkdown } from '@/lib/markdown';
import { whatsappLink } from '@/lib/stripe-links';
import { localServiceJsonLd, faqJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { getCity, SERVICE_LABEL, type LocalLanding } from '@/content/local';

const SERVICE_CTA: Record<string, string> = {
  'diseno-web': '/tienda/web',
  'tienda-online': '/tienda/online',
  'agente-ia': '/tienda/agente-ia',
};

export default function LandingTemplate({ landing }: { landing: LocalLanding }) {
  const city = getCity(landing.citySlug)!;
  const path = `/${landing.service}/${landing.citySlug}`;
  const html = renderMarkdown(landing.bodyMarkdown);
  const label = SERVICE_LABEL[landing.service];

  return (
    <>
      <JsonLd data={localServiceJsonLd({ serviceName: `${label} en ${city.name}`, description: landing.description, path, city: city.name, region: city.region })} />
      <JsonLd data={faqJsonLd(landing.faq)} />
      <JsonLd data={breadcrumbJsonLd([{ name: 'Inicio', path: '/' }, { name: label, path: SERVICE_CTA[landing.service] }, { name: city.name, path }])} />
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground intensity="subtle" />
      <MouseGlow />
      <main className="relative z-10">
        <section className="pt-44 pb-10">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal>
              <span className="inline-flex items-center gap-2 text-xs text-white/55"><MapPin size={12} /> {city.name} · {city.region}</span>
              <h1 className="mt-5 font-display text-balance text-4xl md:text-6xl" style={{ letterSpacing: '-0.04em', fontWeight: 800, lineHeight: 1.05 }}>{landing.h1}</h1>
              <p className="mt-6 text-lg leading-relaxed text-white/65">{landing.intro}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <MagneticButton href={SERVICE_CTA[landing.service]}>Ver planes <ArrowRight size={14} /></MagneticButton>
                <MagneticButton href={whatsappLink(`Hola, soy de ${city.name} y me interesa ${label.toLowerCase()}`)} target="_blank" rel="noreferrer" variant="secondary"><MessageCircle size={14} /> Hablar</MagneticButton>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="pb-10">
          <div className="mx-auto max-w-3xl px-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {landing.sectores.map((s) => (
                <div key={s.nombre} className="rounded-2xl glass p-5">
                  <h3 className="font-display text-lg text-white">{s.nombre}</h3>
                  <p className="mt-2 text-sm text-white/60">{s.gancho}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-14">
          <div className="mx-auto max-w-3xl px-6">
            <div className="prose-latech" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display text-3xl mb-6" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>Preguntas frecuentes</h2>
            <div className="flex flex-col gap-3">
              {landing.faq.map((f) => (
                <details key={f.q} className="rounded-2xl glass p-5">
                  <summary className="cursor-pointer font-medium text-white">{f.q}</summary>
                  <p className="mt-3 text-sm text-white/60">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-3xl px-6 text-sm text-white/55">
            <span>También damos servicio en: </span>
            {city.nearby.map((n, i) => (
              <span key={n}>{i > 0 && ' · '}<Link href={`/${landing.service}/${n}`} className="text-white/70 underline hover:text-white">{n}</Link></span>
            ))}
            {' · '}<Link href="/cobertura" className="text-white/70 underline hover:text-white">toda España</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/local/LandingTemplate.tsx src/lib/seo.ts
git commit -m "feat(seo): plantilla LandingTemplate + schema localService"
```

---

### Task 3: Rutas estáticas de los 3 servicios

**Files:**
- Create: `src/app/diseno-web/[ciudad]/page.tsx`
- Create: `src/app/tienda-online/[ciudad]/page.tsx`
- Create: `src/app/agente-ia/[ciudad]/page.tsx`

**Interfaces:**
- Consumes: `landingsFor`, `getLanding`, `getCity`, `SERVICE_LABEL`, `LandingTemplate`, `SITE_URL`.

- [ ] **Step 1: Crear la ruta de diseño web** en `src/app/diseno-web/[ciudad]/page.tsx`

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LandingTemplate from '@/components/local/LandingTemplate';
import { landingsFor, getLanding } from '@/content/local';
import { SITE_URL } from '@/lib/seo';

const SERVICE = 'diseno-web' as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return landingsFor(SERVICE).map((l) => ({ ciudad: l.citySlug }));
}

export async function generateMetadata({ params }: { params: Promise<{ ciudad: string }> }): Promise<Metadata> {
  const { ciudad } = await params;
  const l = getLanding(SERVICE, ciudad);
  if (!l) return { title: 'No encontrado' };
  const url = `${SITE_URL}/${SERVICE}/${ciudad}`;
  return {
    title: l.title,
    description: l.description,
    alternates: { canonical: url },
    openGraph: { title: l.title, description: l.description, url, siteName: 'Latech', locale: 'es_ES', type: 'website' },
  };
}

export default async function Page({ params }: { params: Promise<{ ciudad: string }> }) {
  const { ciudad } = await params;
  const l = getLanding(SERVICE, ciudad);
  if (!l) notFound();
  return <LandingTemplate landing={l} />;
}
```

- [ ] **Step 2: Crear `tienda-online` y `agente-ia`** iguales, cambiando solo `const SERVICE` a `'tienda-online'` y `'agente-ia'` respectivamente.

- [ ] **Step 3: Verificar build (genera las rutas estáticas del piloto)**

Run: `npm run build`
Expected: build OK; en la salida aparece `/diseno-web/madrid` como ruta estática (●/○). `tienda-online` y `agente-ia` sin rutas aún (arrays vacíos) — correcto.

- [ ] **Step 4: Commit**

```bash
git add src/app/diseno-web src/app/tienda-online src/app/agente-ia
git commit -m "feat(seo): rutas estáticas [ciudad] para los 3 servicios"
```

---

### Task 4: Generar contenido único de las 45 landing (subagentes)

**Files:**
- Modify: `src/content/local/diseno-web.ts`, `tienda-online.ts`, `agente-ia.ts` (rellenar las 15 ciudades cada uno)
- Create: `scripts/check-landing-uniqueness.ts`

**Interfaces:**
- Consumes: tipos de Task 1. Produces: 45 objetos `LocalLanding`.

- [ ] **Step 1: Despachar subagentes** Opus 4.8 (1M) + ultrathink, en paralelo, **uno por servicio** (o por lotes de 5 ciudades si se prefiere granularidad). Prompt para cada uno:

> Eres redactor SEO senior de Latech (agencia de Extremadura que trabaja para toda España, remoto, entrega 24-48h, sin permanencia). Genera un objeto `LocalLanding` (ver tipo) para el servicio **[SERVICE]** en cada una de estas ciudades: [LISTA]. Reglas innegociables: (1) `intro` y `bodyMarkdown` ÚNICOS por ciudad, anclados al **tejido económico real** de esa zona (sectores que de verdad la mueven). (2) Prohibido inventar oficinas físicas, datos o reseñas. (3) Enmarca la no-presencia física como ventaja (remoto, 24-48h, sin sobrecoste de oficina). (4) `title` <=60 chars, `description` <=155. (5) 3-5 `sectores` con gancho propio, 4-6 `faq` específicas de la ciudad. (6) `bodyMarkdown` 500-800 palabras con H2/H3, 1-2 enlaces internos a `/tienda/[servicio]` y a un post relevante. Devuelve SOLO el array TypeScript válido.

- [ ] **Step 2: Integrar la salida** en los tres ficheros de datos (sustituye el stub piloto de Madrid por el contenido real).

- [ ] **Step 3: Crear guard anti-doorway** en `scripts/check-landing-uniqueness.ts`

```ts
import { allLandings } from '../src/content/local';

const items = allLandings();
const intros = new Map<string, string>();
let fail = false;

for (const l of items) {
  const key = l.intro.trim().toLowerCase().slice(0, 120);
  if (intros.has(key)) { console.error(`❌ Intro duplicada: ${l.service}/${l.citySlug} ≈ ${intros.get(key)}`); fail = true; }
  intros.set(key, `${l.service}/${l.citySlug}`);
  if (l.intro.includes('PLACEHOLDER') || l.bodyMarkdown.includes('Placeholder')) { console.error(`❌ Placeholder sin reemplazar: ${l.service}/${l.citySlug}`); fail = true; }
  if (l.bodyMarkdown.split(/\s+/).length < 350) { console.error(`⚠️  Cuerpo corto (<350 palabras): ${l.service}/${l.citySlug}`); }
}
console.log(`${items.length} landings revisadas.`);
process.exit(fail ? 1 : 0);
```

- [ ] **Step 4: Ejecutar el guard**

Run: `npx tsx scripts/check-landing-uniqueness.ts`
Expected: "45 landings revisadas." y exit 0 (sin duplicados ni placeholders).

- [ ] **Step 5: Verificar build completo (45 rutas)**

Run: `npm run build`
Expected: build OK; 45 rutas estáticas `/diseno-web/*`, `/tienda-online/*`, `/agente-ia/*`.

- [ ] **Step 6: Commit**

```bash
git add src/content/local scripts/check-landing-uniqueness.ts
git commit -m "feat(seo): contenido único de las 45 landing locales + guard anti-doorway"
```

---

### Task 5: Hub + sitemap + enlazado interno

**Files:**
- Create: `src/app/cobertura/page.tsx`
- Modify: `src/app/sitemap.ts`
- Modify: páginas de servicio (`src/app/tienda/web/page.tsx`, `tienda/online/page.tsx`, `tienda/agente-ia/page.tsx`) — añadir enlaces a las landing por ciudad.

- [ ] **Step 1: Crear el hub** `/cobertura` en `src/app/cobertura/page.tsx` con metadata propia, listando las 45 landing agrupadas por servicio y ciudad (links a cada `/${service}/${citySlug}`), reutilizando Navbar/Footer/Aurora. (Genera la lista desde `allLandings()`.)

- [ ] **Step 2: Añadir al sitemap** en `src/app/sitemap.ts`: importar `allLandings` y `CITIES`, añadir `/cobertura` a `fixed`, y un bloque `landingEntries` con `url: ${base}/${l.service}/${l.citySlug}`, `changeFrequency: 'monthly'`, `priority: 0.7`.

- [ ] **Step 3: Enlazado interno** — en cada página de servicio añadir una sección "¿Dónde trabajamos?" con enlaces a 4-5 ciudades de ese servicio + enlace al hub.

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS; `/cobertura` y las 45 landing en el build.

- [ ] **Step 5: Verificar sitemap en local**

Run: `npm run dev` y abrir `http://localhost:3000/sitemap.xml` (o build+start); confirmar que aparecen las 45 URLs + `/cobertura`.
Expected: las URLs presentes.

- [ ] **Step 6: Commit**

```bash
git add src/app/cobertura src/app/sitemap.ts src/app/tienda
git commit -m "feat(seo): hub /cobertura + sitemap + enlazado interno a landing locales"
```

---

### Task 6: Blog en clusters (~20 posts)

**Files:**
- Create: `scripts/posts-data/seo-batch-6.ts`, `scripts/posts-data/seo-batch-7.ts`
- Modify: `scripts/seed-posts-seo.ts` (importar batches 6 y 7)
- Create: portadas `public/og/post-N.svg` para los nuevos posts (estilo existente)

**Interfaces:** mismos campos que los posts existentes (`slug, title, category, excerpt, cover, readingMinutes, content`).

- [ ] **Step 1: Definir el mapa de clusters** (pilar + satélites) para los 4 clusters (Diseño web, Tienda online, Agentes IA, SEO) e identificar los ~20 huecos de alta intención que faltan (evitar solapamiento con los slugs ya existentes en batches 1-5).

- [ ] **Step 2: Despachar subagentes** Opus 4.8 + ultrathink (uno por cluster) para redactar los posts con el mismo nivel que los existentes (1.500+ palabras, datos reales, H2/H3, 2-3 enlaces internos al pilar/landing/servicio, excerpt, readingMinutes). Devolver el array TS de cada batch.

- [ ] **Step 3: Crear `seo-batch-6.ts` y `seo-batch-7.ts`** con esos posts (~10 cada uno) y portadas SVG.

- [ ] **Step 4: Importar batches** en `scripts/seed-posts-seo.ts` (añadir `import { posts as batch6 } ...` y `batch7`, e incluirlos en `ALL`).

- [ ] **Step 5: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit** (sin sembrar todavía a producción)

```bash
git add scripts/posts-data/seo-batch-6.ts scripts/posts-data/seo-batch-7.ts scripts/seed-posts-seo.ts public/og
git commit -m "feat(seo): 20 posts nuevos en clusters (batches 6-7)"
```

---

### Task 7: Optimización on-page de lo existente

**Files:**
- Modify: metadata de páginas existentes (`src/app/tienda/web/page.tsx`, `tienda/online/page.tsx`, `tienda/agente-ia/page.tsx`, `proyectos/page.tsx`, `sobre-nosotros/page.tsx`).

- [ ] **Step 1: Revisar `title`/`description`** de cada página hacia keywords reales (incluir intención + España donde aplique), sin duplicar entre páginas, respetando longitudes (<=60 / <=155).
- [ ] **Step 2: Verificar un solo H1** por página y jerarquía de encabezados correcta.
- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app
git commit -m "feat(seo): optimización on-page de metadata y encabezados existentes"
```

---

### Task 8: Verificación final y publicación por tandas

- [ ] **Step 1: Verificación global**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS, sin warnings nuevos relevantes.

- [ ] **Step 2: Revisión del usuario** del contenido generado (muestras de landing y posts) → OK expreso.

- [ ] **Step 3: Tanda 1 — publicar** (merge a `main` / deploy con OK del usuario): 5 ciudades top × 3 servicios + hub. Sembrar batch 6 a Turso (`npm run db:seed-posts-seo`). Solicitar indexación en GSC de las URLs nuevas (cuota ~10-12/día).

- [ ] **Step 4: PageSpeed de muestra** de 1-2 landing nuevas (móvil) → confirmar que no se degrada (objetivo >=85).

- [ ] **Step 5: Tanda 2 (~5-7 días)**: siguientes 15 landing + sembrar batch 7 + solicitar indexación.

- [ ] **Step 6: Tanda 3 (~5-7 días)**: últimas 15 landing + solicitar indexación.

- [ ] **Step 7: Revisión a 30 días** en GSC (impresiones, páginas indexadas, posiciones locales/long-tail) y ajustar.

---

## Self-Review

- **Spec coverage:** Workstream A (Tasks 1-5), Workstream B (Task 6), Workstream C (Task 7), generación con subagentes (Tasks 4 y 6), guardarraíles (guard anti-doorway Task 4, publicación por tandas Task 8), métricas (Task 8 Step 7). Cubierto.
- **Placeholder scan:** el único "PLACEHOLDER" es intencional (stub piloto reemplazado en Task 4 y verificado por el guard). Sin TODOs colgados.
- **Type consistency:** `LocalLanding`, `Service`, `City`, `getLanding`, `landingsFor`, `allLandings`, `getCity` usados de forma consistente entre tasks.
- **Escalonado de fechas de posts:** `seed-posts-seo.ts` re-estampa fechas en cada run (comportamiento existente, aceptable). Para escalonar publicación real, sembrar batch 6 en tanda 1 y batch 7 en tanda 2 (Task 8).
