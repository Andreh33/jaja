# Transparent favicon and iOS Studio mark

## Scope

The favicon is a clean, self-contained vector adaptation of the supplied LA mark, with no background rectangle. The same master generates a transparent 512px PNG and an ICO containing native 16, 32, 48, 64, 128 and 256px images. The existing `/icon.png` URL remains available for structured-data consumers. The separate Apple home-screen icon is opaque navy because iOS applies its own mask; it is not the browser-tab favicon.

The user's screenshot also exposed the Studio laboratory `✳` pseudo-element rendering as a large green platform emoji on iPhone. It is now a decorative, non-focusable SVG with a transparent background. Its colour and placement remain in the existing CSS Module; navigation is unchanged.

## Design and review

Web Design Director and Emil's detail/consistency criteria informed the change: preserve the supplied brand and remove platform-dependent rendering. `21st whoami` was unauthenticated. [FoxyHero's separate SVG brand mark](https://21st.dev/@dhileepkumargm/components/foxy-hero) was inspected in the public catalogue as a reference only; no component, dependency or third-party artwork was installed or copied. The favicon and laboratory symbol are local vectors. Next's installed app-icons guide was used for the file-based metadata conventions.

| Before | After | Why |
| --- | --- | --- |
| Raster favicon with an inconsistent dark tile | Transparent SVG, PNG and multi-size ICO | Clean edges on light and dark tab backgrounds |
| Laboratory symbol supplied by the platform emoji font | Decorative inline SVG | No green iOS square or accessible-name noise |

Code review covered file-convention metadata, the generator's ICO offsets and dimensions, existing logo URL consumers, CSS positioning and button navigation. No remaining reachable blocking defect found in the scoped change. No animation, authentication, database or payment changes.

## Verification

- Diff whitespace, lint, typecheck, all 196 tests and production build passed; 189 static pages generated (two additional icon assets).
- Five focused tests cover SVG self-containment, pixel alpha outside the PNG mark, six valid ICO entries, opaque Apple output and removal of the emoji pseudo-element.
- Compiled production-mode WebKit at 390px: all four icon metadata URLs responded 200. The laboratory SVG had transparent computed background and the old `::after` content was absent. Button navigation reached the laboratory; no page horizontal overflow.
- SVG visually checked at 16, 32, 48 and 128px on white and navy, plus the Studio mobile layout. Screenshots in local `output/playwright/favicon-*`; this is browser emulation, not a physical iPhone test.
- Local-only Vercel analytics 404 and pre-existing unused Lab CSS preload warning were observed; no new application exception. An initial generator invocation needed the `.mts` extension for top-level await. A browser test used an unavailable sandbox `URL` constructor and was rerun with the known local origin. File-protocol preview was unsupported; final visual verification used the running local app assets.
- Reproduce generated assets: `npx tsx scripts/generate-favicons.mts`. No new dependencies.

Publication evidence is recorded in the operational checkpoint after push and deployment verification.
