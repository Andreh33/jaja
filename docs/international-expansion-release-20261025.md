# International expansion release ledger — 25 October 2026

This document records the release scope and verification evidence. Publication, production verification and search-engine submissions are complete. Search-engine processing and indexing remain asynchronous; submission receipts do not prove indexing.

## Scope

- 13 versions: es, en, fr, de, pt, it, nl, pl, sv, da, ro, us, latam. Spanish uses the site root.
- Nine commercial pages and 19 articles per version: 364 audited release URLs and 247 articles.
- The original six versions retain their original nine articles, including AI automation. The seven new versions substitute market-entry SEO for that topic. Ten new SEO topics are shared; the combined topic registry contains 20 IDs.
- Canonicals and hreflang link actual equivalents only. HTML language tags use es-ES, en-US and es-419; Google hreflang uses es-ES, en-US and es for those versions. Topic x-default falls back from Spanish to US, English and then the first available version.
- All 13 real projects appear on international home/project pages and Spanish home. Real project images form the interactive layered scene. FAQs and localized summaries remain native HTML.
- Obsolete Latech email contacts are replaced by existing WhatsApp/telephone channels. No overseas offices, guaranteed rankings or invented contact details are authorized. The brand motto is subjective positioning.
- The user's latest instruction excludes reduced-motion conditions from this work.

## Independent integration review evidence

Reviewed route helpers, localized metadata/layout/page resolution, sitemap generation, measurement sanitization, language switchers, article navigation, international server rendering, the thin client portfolio component and audit/submission scripts.

On the current working tree, the following command passed all four tests with zero failures:

```powershell
npx tsx --require ./tests/register-assets.cjs --test tests/international-ui.test.ts
```

The tests cover all 13 projects on every international home/project rendering, translation-aware AI article language navigation, commercial SEO guide priorities and related-guide coverage without self-links.

The global 404 recovery navigation now uses the lightweight locale registry for all 13 home links. Direct Node HTTP assertions against http://127.0.0.1:3012 verified each of `/xx`, `/latam/dashboard` and `/us/blog/not-a-real-article`: HTTP 404, robots noindex, HTML es-ES and the exact 13 recovery destinations.

These checks ran during content authoring. They do not establish final dictionary completeness or replace the final build and complete HTTP audit.

Final independent content review on 26 October: all 13 locales each pass 19 unique article IDs/slugs, at least 500 words per article, nine distinct page titles/descriptions, description lengths of 140–160 characters, 13 project summaries and four FAQs. All 54 original article objects still match revision `4d593cc` exactly. The lightweight registry contains 20 topics and 247 locale slugs. NL/PL final body rewrites are independently reviewed and closed. No release-blocking content defect was identified. Final checklist handoff is complete. Independent post-freeze recheck confirms all 54 original article objects unchanged and 52 unique topic-specific checklists across ES/EN/FR/NL/PL; no long sentence repeats across five of those guides, including checklists. Focused SEO/UI tests were rerun after freeze: 14 passed, zero failed. Frozen final build completed successfully (exit 0).

The earlier repeated-body and US/LATAM description findings are resolved across all 13 reviewed versions. No body sentence longer than 40 characters repeats across five or more new SEO articles in a single reviewed version. Final checklists are specific to each topic. Sampled revised explanations give topic-specific checks and examples, preserve the distinction between crawl permission/noindex/canonical, and avoid interpreting Search Console as individual customer attribution. Regional US/LATAM copy retains the real Spanish operating base and appropriate market distinctions. A fresh server rendering of the actual Spanish-home SelectedProjects component confirms all 13 catalog project URLs and names.

The focused final command below passed 14 tests with zero failures. It covers routing, 247 articles, metadata, sitemap, portfolio/related-guide rendering, privacy, original dates for 54 articles and release-day dates for 193 new articles, including visible/schema consistency:

```powershell
npx tsx --require ./tests/register-assets.cjs --test tests/international-seo.test.ts tests/international-ui.test.ts
```

Detailed independent content evidence: `H:/Proyectos/seo-20261012/evidence/latech-expansion-20261025/content-independent-audit.json` and `.md`. The final production build and both local/production HTTP audits are complete, as recorded below.

Additional release evidence inspected: `local-audit.json` records 364 checked local URLs and zero failures; `.superpowers/expansion-nonfixture-tests.log` records 299 passed, zero failed; `.superpowers/expansion-final-design-detector.json` contains `[]`. Root reports the final full suite as 319 tests, 304 passed and 15 known Windows EPERM fixture-cleanup failures; the log contains those cleanup errors. Root also reports lint exit 0 and build exit 0 with 574 static pages. The final build was repeated successfully after the definitive content freeze. These broader commands were run by the release orchestrator, not independently rerun by this reviewer.

## Completed release evidence

- [Complete] Frozen final build and lint both exited 0; final nonfixture suite passed 299/299; focused post-freeze contracts passed 14/14.
- [Complete] Final content/SEO contracts, typecheck, lint, full test suite and production build; baseline Windows cleanup failures recorded separately.
- [Complete] Final local audit covered all 364 release URLs, canonical/hreflang/HTML language metadata, both sitemaps and representative unknown-route 404s with zero failures.
- [Complete] Visual review across locales and representative mobile/desktop widths; no mobile overflow in recorded checks.
- [Complete] Published code revision `d315ff17b9f8bad87c9d417ea1ebbd922bf08432` to GitHub main and verified production at https://serviciosonlineweb.com.
- [Complete] Publication, production audit and search submission evidence recorded in `H:/Proyectos/seo-20261012/evidence/latech-expansion-20261025`.
- The expansion IndexNow script requires a clean production audit and creates a distinct receipt before sending. An accepted submission receipt is evidence of submission only; it does not prove indexing.

Publication, production audit and search submission receipts: complete. Search-engine processing/indexing is pending externally, not unfinished release work.

Final frozen-release evidence inspected: `.superpowers/expansion-build-final.log` (build exit 0, confirmed by root), `.superpowers/expansion-lint-final.log` (lint exit 0, confirmed by root), `.superpowers/expansion-nonfixture-tests-final.log` (299 passed, zero failed) and `local-audit-final.json` (364 URLs, failures []). Content, build, local HTTP and visual checks are complete. Publication, production verification and search submissions are complete, with receipts below.

## Cierre de publicación — 26 de octubre de 2026

Publicado el código `d315ff17b9f8bad87c9d417ea1ebbd922bf08432` en main de GitHub. Vercel confirmó READY en producción para `dpl_2tfvHC9U5LpBPXeJPbP458h2ETY4`: https://latech-qhxwzzkph-latech767-8157s-projects.vercel.app, con alias https://serviciosonlineweb.com verificado. Captura publicada: `production-us-desktop.png`.

La auditoría de producción `production-audit.json` comprobó las 364 URLs sin fallos. IndexNow aceptó las 364 URLs con HTTP 200; recibo: `indexnow-expansion-receipt.json`.

Google recibió de nuevo ambos sitemaps el 26 de octubre: `google-international-submitted.png/.txt` y `google-main-submitted.png/.txt`. La vista final `google-final-sitemaps.png/.txt` muestra el internacional Correcto, 364 URLs descubiertas y última lectura del 26 de octubre. El principal figura Correcto pero conserva 186 URLs de la lectura anterior del 21 de octubre; el XML servido por HTTP contiene 533 URLs y su recuento en consola espera actualización.

Bing aceptó el reenvío de ambos sitemaps y los muestra Processing: `bing-international-processing.png/.txt` y `bing-main-processing.png/.txt`. Los recuentos visibles 108/186 siguen siendo anteriores. No se han solicitado indexaciones manuales de URLs ni se ha usado CAPTCHA en esta entrega.

El trabajo autorizado de publicación y envío está completo. Los estados de procesamiento y la indexación dependen de los buscadores; ninguno de estos recibos demuestra que todas las URLs estén indexadas. No se ha creado ninguna programación.
