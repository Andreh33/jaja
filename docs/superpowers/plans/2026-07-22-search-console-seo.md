# Search Console SEO Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recuperar clics en Badajoz y Bilbao, mejorar lastmod selectivo y completar canonicals legales.

**Architecture:** Los datos locales siguen centralizados en `src/content/local`. Se añade una fecha opcional por landing, consumida por sitemap, y se crean pruebas con node:test sobre datos y metadata.

**Tech Stack:** Next.js 16.2.4, React 19, TypeScript, node:test, tsx.

## Global Constraints

- Trabajar solo en `/home/andreh/.codex-worktrees/seo-2026-07-22/latech`.
- No tocar Vercel ni el checkout principal.
- No fingir presencia física en Bilbao.
- Seguir la documentación local de Next.js 16 para metadata y sitemap.

---

### Task 1: Pruebas locales en rojo

**Files:**
- Create: `tests/local-seo.test.ts`

**Interfaces:**
- Consumes: `getLanding` y metadata de páginas legales.
- Produces: regresiones para fragmentos, geografía, fecha y canonical.

- [ ] **Step 1: Escribir pruebas**

Exigir:
- Badajoz title `Diseño web en Badajoz desde 600 € | Latech`.
- Bilbao title `Diseño web en Bilbao desde 600 € | Latech`.
- Descripciones entre 120 y 155 caracteres que incluyan `600 €`.
- Bilbao incluye `en remoto`; Badajoz incluye `Extremadura`.
- Ambas landings tienen `updatedAt: "2026-07-22"`.
- Metadata de `/terminos` y `/privacidad` incluye canonical propio.

- [ ] **Step 2: Verificar RED**

Run: `npm test -- tests/local-seo.test.ts`  
Expected: FAIL por fragmentos, fecha y canonicals ausentes.

- [ ] **Step 3: Commit**

Run: `git add tests/local-seo.test.ts && git commit -m test-local-seo-recovery`.

### Task 2: Mejorar Badajoz y Bilbao

**Files:**
- Modify: `src/content/local/types.ts`
- Modify: `src/content/local/diseno-web.ts`

- [ ] **Step 1: Extender el tipo**

Añadir `updatedAt?: string` a `LocalLanding`.

- [ ] **Step 2: Fragmento de Badajoz**

Configurar title exacto de la prueba, description con precio, entrega y origen extremeño, y `updatedAt: "2026-07-22"`. Mantener la tabla de precios y la cercanía real.

- [ ] **Step 3: Fragmento de Bilbao**

Configurar title exacto, description con precio, entrega y trabajo remoto, `updatedAt: "2026-07-22"`, e incorporar al inicio del cuerpo una respuesta de precio: 600 € de creación + 60 €/mes, sin permanencia.

- [ ] **Step 4: Verificar datos**

Run: `npx tsx scripts/check-landing-uniqueness.ts`  
Expected: exit 0, sin intro duplicada ni placeholder.

### Task 3: Lastmod selectivo y canonicals

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/terminos/page.tsx`
- Modify: `src/app/privacidad/page.tsx`

- [ ] **Step 1: Sitemap**

Cambiar `lastModified: SITE_LAST_UPDATE` de landings por `lastModified: new Date(l.updatedAt ?? SITE_LAST_UPDATE)`.

- [ ] **Step 2: Canonicals**

Tipar metadata con `Metadata` y añadir `alternates: { canonical: "/terminos" }` y `alternates: { canonical: "/privacidad" }`.

- [ ] **Step 3: Verificar GREEN**

Run: `npm test`  
Expected: 58 pruebas o más, 0 fallos.

- [ ] **Step 4: Commit**

Run: `git add tests/local-seo.test.ts src/content/local/types.ts src/content/local/diseno-web.ts src/app/sitemap.ts src/app/terminos/page.tsx src/app/privacidad/page.tsx && git commit -m improve-local-search-intent`.

### Task 4: Verificación y publicación

- [ ] **Step 1:** Run `npm test`.
- [ ] **Step 2:** Run `npx eslint tests/local-seo.test.ts src/content/local/types.ts src/content/local/diseno-web.ts src/app/sitemap.ts src/app/terminos/page.tsx src/app/privacidad/page.tsx`.
- [ ] **Step 3:** Run `npm run build`; Expected: exit 0.
- [ ] **Step 4:** revisar diff y confirmar que solo aparecen archivos del plan.
- [ ] **Step 5:** empujar a `origin/main` si el remoto no cambió.
- [ ] **Step 6:** verificar producción, sitemap, canonical y JSON-LD; ejecutar IndexNow y reenviar sitemap en Google/Bing.
