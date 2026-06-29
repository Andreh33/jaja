# Diseño — Push SEO Latech (junio 2026)

**Fecha:** 2026-06-29
**Dominio:** https://serviciosonlineweb.com
**Rama de trabajo:** `seo/push-nacional` (NADA a producción sin OK expreso del usuario)

---

## 1. Objetivo y encuadre honesto

El usuario quiere "ir a por el top 1". Encuadre realista acordado:

- **"Top 1 de todo" no existe a corto plazo.** Términos nacionales genéricos ("diseño web", "tienda online") son guerras de 12+ meses que se ganan con **autoridad y backlinks**, no con más páginas.
- **Top 1 SÍ es alcanzable** donde el sitio ya asoma: **local** (1-3 meses) y **long-tail de blog** (2-4 meses).

Objetivo del push: **maximizar superficie indexable de alta intención y baja competencia** (local + long-tail) con calidad que Google premie, sin caer en contenido fino/doorway que penalice el sitio entero.

## 2. Estado actual (datos reales GSC, 3 meses)

- 29 clics · 144 impresiones · CTR 20,1% · posición media 10,8.
- 19 consultas con impresiones: marca ("latech") + locales Extremadura ("diseño web mérida", "desarrollo web extremadura").
- 29 páginas indexadas / 71 descubiertas (sitemap reenviado hoy). Posts del blog **aún no rastreados**.
- Base técnica sólida: PageSpeed móvil 89/94/100/92, JSON-LD, sitemap dinámico, metadata correcta.
- Dominio **joven y de baja autoridad** → Google racionaliza rastreo e indexación.

## 3. Targets ganables (prioridad)

| Terreno | Top 1 realista | Plazo |
|---|---|---|
| Local ciudad×servicio | ✅ | 1-3 meses |
| Long-tail de blog (clusters) | ✅ | 2-4 meses |
| Nacional genérico | 🔴 a corto | 12+ meses (necesita backlinks) |

## 4. Alcance (acordado con el usuario)

Tres workstreams **en paralelo** ("todo a la vez"), con varios subagentes Opus 4.8 (1M context) + ultrathink (esfuerzo alto) generando contenido.

### Workstream A — Landing pages locales (centro del push)

**Arquitectura de rutas** (segmentos aislados, NO un comodín raíz que intercepte otras rutas):
```
src/app/diseno-web/[ciudad]/page.tsx     → /diseno-web/madrid
src/app/tienda-online/[ciudad]/page.tsx  → /tienda-online/barcelona
src/app/agente-ia/[ciudad]/page.tsx      → /agente-ia/sevilla
src/app/(hub)/diseno-web-espana/page.tsx → hub que enlaza a todas (reparte autoridad)
```
- Estáticas vía `generateStaticParams` (Next 16; `params` es `Promise`, se hace `await`).
- `generateMetadata` por página (title/description/canonical/OG únicos por ciudad+servicio).

**15 ciudades/provincias (fase 1):** Madrid, Barcelona, Valencia, Sevilla, Málaga, Zaragoza, Murcia, Bilbao, Alicante, Córdoba, Valladolid, Vigo, Granada, A Coruña, Badajoz.
→ 15 × 3 servicios = **45 páginas** + hub.

**Anatomía de cada página (anti-doorway — contenido único por ciudad):**
- `intro` única ligada al tejido económico real de la zona.
- `sectores[]` locales (3-5, con gancho propio).
- Bloque de oferta del servicio (reutiliza componentes/copy de `/tienda/web|online|agente-ia`).
- Ángulo honesto: "agencia remota de Extremadura para toda España, entrega 24-48h, sin permanencia" (convierte la no-presencia física en argumento; NO se inventa oficina local).
- `faq[]` específica de la ciudad (4-6 preguntas).
- Enlaces internos: servicio matriz + 2-3 posts del cluster + 2-3 ciudades cercanas + hub.
- Schema: `Service` + `areaServed` (ciudad/provincia) + `FAQPage` + `BreadcrumbList`.

**Modelo de datos:** ficheros TypeScript versionados en git (no DB en runtime), p. ej. `src/content/local/[servicio].ts` exportando un array de objetos `{ ciudad, provincia, slug, intro, sectores[], faq[], bodyMarkdown, ... }`. La plantilla renderiza con `renderMarkdown` + `.prose-latech` + componentes existentes (Aurora, Navbar, Footer, MagneticButton, Reveal, JsonLd) → diseño idéntico al resto del sitio.

**Integración:** añadir las 45 URLs + hub a `src/app/sitemap.ts`.

**Publicación por tandas** (anti-spam de un dominio joven; el código se construye entero, solo se escalona `published`):
- Tanda 1: 5 ciudades top × 3 servicios (15 págs) + hub → publicar + solicitar indexación.
- Tanda 2 (~5-7 días): siguientes 15.
- Tanda 3 (~5-7 días): últimas 15.

### Workstream B — Blog en clusters

Reorganizar/ampliar el blog en **clusters temáticos** (pilar + satélites interenlazados):
- Cluster Diseño web · Cluster Tienda online/e-commerce · Cluster Agentes IA/automatización · Cluster SEO/aparecer en Google.
- Primera tanda: **~20 posts nuevos** de alta intención que completen clusters (calidad como la actual: 1.500+ palabras, datos reales, enlaces internos, portada SVG en estilo existente `public/og/post-N.svg`).
- Almacenamiento: igual que los posts actuales (Turso, seed idempotente por slug vía `scripts/posts-data/seo-batch-*.ts` + `npm run db:seed-posts-seo`).
- Cadencia: ~5/semana (NO 200 ni 20 de golpe).

### Workstream C — Optimización on-page de lo existente

- Revisar `title`/`description` de páginas actuales hacia keywords reales (incluir España + intención de compra).
- Enlazado interno: desde páginas de servicio y posts hacia las nuevas landing locales y hub.
- Auditar encabezados (un solo H1, jerarquía correcta) y `aria-label`/accesibilidad (fix "Empezar" ya aplicado y desplegado).

## 5. Generación de contenido (subagentes)

- Subagentes **Opus 4.8 (1M) + ultrathink**, en paralelo, uno por lote de ciudades/posts.
- Cada subagente recibe: tono de marca, datos verificables del sector regional, estructura anti-doorway, y la obligación de NO inventar datos ni presencia física falsa.
- Salida estructurada (objeto de datos por ciudad / post) para revisión humana antes de publicar.

## 6. Guardarraíles de calidad (innegociables)

1. **Anti-doorway:** cada página con prosa genuinamente única (tejido económico real), no plantilla con ciudad cambiada.
2. **Anti-spam de velocidad:** publicación por tandas, nunca 45 páginas / 20 posts el mismo día.
3. **Honestidad:** sin oficinas inventadas, sin datos falsos, sin reseñas falsas. La no-presencia física se enmarca como ventaja real (remoto, 24-48h).
4. **Diseño:** reutilizar componentes existentes; el usuario rechaza rediseños efectistas. Mejoras additivas y verificadas.
5. **Sin canibalización:** una intención de búsqueda por página; clusters interenlazados, no posts solapados compitiendo.
6. **Revisión humana** antes de cada publicación; nada a producción sin OK expreso.

## 7. Fuera de alcance (no en este push)

- **Backlinks y Google Business Profile:** son la palanca real para lo nacional, pero son trabajo del usuario (no código). Opcional: documento-playbook aparte (el usuario no lo seleccionó como prioridad).
- Términos nacionales genéricos como objetivo de top 1 a corto plazo.
- Cobertura de las ~50 provincias completas (fase posterior si la fase 1 valida el modelo).

## 8. Métricas de éxito (revisión a 30 y 60 días en GSC)

- Impresiones totales: de 144 (3 meses) a **varios cientos/mes**.
- Páginas indexadas: de 29 hacia **80-120+**.
- Aparición y subida de posición en consultas locales ciudad×servicio y long-tail de blog.
- Mantener/mejorar PageSpeed (no degradar Core Web Vitals con las nuevas páginas).

## 9. Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Contenido fino → penalización Helpful Content | Contenido único por zona + revisión humana |
| Velocidad de publicación → señal spam | Tandas escalonadas |
| Páginas nuevas no se indexan (dominio joven) | Sitemap + solicitar indexación por tandas (cuota ~10-12/día) |
| Canibalización entre landing y posts | Una intención por URL + enlazado en cluster |
| Degradar diseño/rendimiento | Reutilizar componentes; estáticas; verificar PageSpeed |

## 10. Secuencia de implementación (todo en paralelo, ordenado para revisar)

1. Andamiaje rutas + modelo de datos + plantilla de landing (1 página piloto verificada).
2. Subagentes Opus 4.8 + ultrathink generan contenido de las 15 ciudades × 3 servicios (en lotes).
3. Hub + sitemap + enlazado interno.
4. En paralelo: subagentes generan los ~20 posts de clusters (seed batches).
5. En paralelo: optimización on-page de páginas existentes.
6. Verificación (type-check, build, PageSpeed de muestras) → revisión del usuario → publicación por tandas con su OK.
