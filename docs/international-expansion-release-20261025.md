# International expansion release ledger — 25 October 2026

This document records the release scope and verification evidence. Publication and search-engine submission are authorized, but remain the release orchestrator's responsibility. A pending step below is not a publication or indexing claim.

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

Detailed independent content evidence: `H:/Proyectos/seo-20261012/evidence/latech-expansion-20261025/content-independent-audit.json` and `.md`. The final production build and complete local/production HTTP audits remain separate release requirements.

Additional release evidence inspected: `local-audit.json` records 364 checked local URLs and zero failures; `.superpowers/expansion-nonfixture-tests.log` records 299 passed, zero failed; `.superpowers/expansion-final-design-detector.json` contains `[]`. Root reports the final full suite as 319 tests, 304 passed and 15 known Windows EPERM fixture-cleanup failures; the log contains those cleanup errors. Root also reports lint exit 0 and build exit 0 with 574 static pages. The final build was repeated successfully after the definitive content freeze. These broader commands were run by the release orchestrator, not independently rerun by this reviewer.

## Remaining release evidence

- [Complete] Frozen final build and lint both exited 0; final nonfixture suite passed 299/299; focused post-freeze contracts passed 14/14.
- [Complete] Final content/SEO contracts, typecheck, lint, full test suite and production build; baseline Windows cleanup failures recorded separately.
- [Complete] Final local audit covered all 364 release URLs, canonical/hreflang/HTML language metadata, both sitemaps and representative unknown-route 404s with zero failures.
- [Complete] Visual review across locales and representative mobile/desktop widths; no mobile overflow in recorded checks.
- Publish the verified revision and run the full production audit against https://serviciosonlineweb.com.
- Record publication revision/deployment URL, production audit path and search submission receipt paths in the evidence folder `H:/Proyectos/seo-20261012/evidence/latech-expansion-20261025`.
- The expansion IndexNow script requires a clean production audit and creates a distinct receipt before sending. An accepted submission receipt is evidence of submission only; it does not prove indexing.

Publication receipt: pending. Production audit: pending. Search submission receipts: pending.

Final frozen-release evidence inspected: `.superpowers/expansion-build-final.log` (build exit 0, confirmed by root), `.superpowers/expansion-lint-final.log` (lint exit 0, confirmed by root), `.superpowers/expansion-nonfixture-tests-final.log` (299 passed, zero failed) and `local-audit-final.json` (364 URLs, failures []). Content, build, local HTTP and visual checks are complete. Only root publication, production verification and search submission receipts remain pending.
