# Latech international SEO implementation plan

**Goal:** Six language journeys, 54 articles, localized WhatsApp, lighter blue, publication and Google/Bing discovery.
**Architecture:** Static root layouts: existing routes grouped under `(es)` without URL changes; `[locale]` owns its HTML language and statically enumerated commercial/blog paths. Versioned JSON dictionaries provide full text; the nine Spanish articles join the current public blog.
**Stack:** Existing Next.js 16.3.6 / React 19 / TypeScript, no new production dependencies.
**Spec:** ../specs/2026-10-25-international-seo-design.md — approved 25/10/2026, with subsequent explicit authorization to publish and submit to Google/Bing.

## Constraints and review focus
Keep current URLs, real business facts, protected routes and account flows. No fabricated locations, guarantees, prices or language support promises. Each page has its own canonical; only real equivalent pages share reciprocal hreflang. Static HTML must contain the correct language. Reject unknown locales/slugs. Track contact clicks without query/PII. Google submission is not proof of indexing.

## Task 1 — Versioned international content
- [x] Author `src/content/international/{es,en,fr,de,pt,it}.json`, nine substantial, distinct practical articles each, plus five localized commercial journeys. Independent language work may be delegated through subagent-driven-development.
- [x] Validate counts, topic IDs, slugs, substantive content, link destinations and absence of placeholder copy in `tests/international-seo.test.ts`.

## Task 2 — Routes and SEO
- [x] First test `src/lib/international.ts` contracts: locales, route resolution, cross-language equivalents, Spanish articles and sitemap entries; watch initial failure.
- [x] Implement data types, route registry, localized metadata and sitemap with canonical/hreflang/x-default.
- [x] Move existing UI routes into `(es)` with import/test path adjustments; keep API and metadata endpoints at root. Use shared document with fonts, analytics and existing Spanish controls; localized document uses translated controls and server language.
- [x] Render translated home/services/about/projects/contact/blog/article pages using existing assets and portfolio, with contextual WhatsApp CTAs. Add switcher to Spanish navigation/footer and article equivalents.
- [x] Extend conversion measurement for enumerated localized public routes only. Test unknown routes and private routing regressions.

## Task 3 — Visual refinement and verification
- [x] Slightly lighten central blue/surface tokens; retain dark identity and text contrast.
- [x] Run focused tests, full suite, lint, typecheck and production build. Review rendered home, commercial pages and articles at mobile/desktop, all locales, language switching and WhatsApp. Run Impeccable detector once.
- [x] Fresh review of implementation and content; address material findings.

## Task 4 — Publish and submit
- [x] Commit/publish to the existing Latech project after verification, using current authorized Git identity. Verify production pages/sitemap/robots.
- [x] Inspect existing authorized Search Console/Bing workflows without exposing credentials. Submit new URLs/sitemap to Google and Bing/IndexNow within available access/quota; record receipts, actual status and any blocker in `docs/international-seo-release-20261025.md`.

## Execution ledger
25/10: source and production baseline 376adf2, clean tracked tree. Implement on `feat/international-seo-20261025`; ruling: use this clean checkout on an isolated feature branch to reuse the large local QA runtime/assets and avoid interfering with other projects. Source approval includes the whole pack and Google/Bing submission; no additional publication approval required.

Completion: all four tasks delivered. Independent content and implementation reviews completed and actionable findings corrected. Production release f69d58f verified (108/108 HTTP audit); Google sitemap accepted with 108 discovered URLs, Bing sitemap received/processing, IndexNow batch HTTP200. Additional manual Google request failed due to Google's reCAPTCHA connectivity; no retry or indexing claim. See docs/international-seo-release-20261025.md for receipts and the Windows-only fixture cleanup limitation.
