# Home motto, typography and Studio scale

## Requested changes

- Exact company motto above the main heading: “Tu imaginación es nuestro límite.” The H1 still explains the service, “Diseño web”, and retains the existing orange-to-blue scroll treatment.
- Larger home type and a genuinely larger interactive Studio viewport, retaining the tilted composition and its controls. This is responsive layout sizing, not CSS zoom.
- Mobile navigation backgrounds are10% less opaque: the island shell0.93→0.837, expanded panel1→0.9, and overlay0.8→0.72. Text and controls keep opacity1; desktop navigation is unchanged.

Web Design Director and Emil guided brand consistency, responsive optical sizing and legibility. `21st whoami` was unauthenticated; [Classy Hero by Jatin Yadav](https://21st.dev/@jatin-yadav05/components/classy-hero/classy-hero) was consulted in the public catalogue for typographic hierarchy only. No code or dependencies installed. Existing fonts, colours, interactions and reduced-motion rules are retained.

## Review

| Before | After | Reason |
| --- | --- | --- |
| Generic introductory line | Exact supplied company motto in larger sentence-case type | Brand clarity |
| Studio425px high,365px on mobile | Shared responsive screen-height variable,500px on desktop and420–540px on mobile | More visible, usable content; project browser follows the same sizing contract |
| Mobile menu backgrounds nearly opaque | Background-only alpha reduction | Preserve label contrast and touch targets |
| Enlarged lead extended9px beyond its320px text column | Optical lead size below360px | Keep the whole title within its intended column |

At402×681, the H1 increased70.35→79.395px, Studio's CSS width285→331px and its content viewport365→422px. At390×844, the new frame is320px wide with523px visible content. The browser quantizes mobile shell alpha to approximately0.835. Viewport measurements at320,390,402,768,1280 and1440px found no page-level horizontal overflow. Desktop and mobile screenshots were inspected in WebKit; these are browser emulations, not physical-device tests.

## Verification

- `git diff --check`, lint, typecheck and199 tests passed. Three focused tests cover the exact motto/service heading, shared Studio/project-browser height and background-only mobile alpha.
- Existing navigation, expansion, project browsing, games and motion logic are unchanged by this diff. Shared height keeps project browsing from reverting to the old smaller frame.
- Initial dev-browser console had no errors. High-DPR WebKit screenshots at desktop width caused test-runner contention; that browser was closed, and remaining checks use one DPR1 browser. No extra agent or dependency was introduced.
- Production build passed with189 static pages. Final Chrome320px check found heading scrollWidth/clientWidth both280px, lead right293.77px inside its300px column edge, Studio256px wide and420px content height. Both visual captions stay inside the viewport. Reduced motion removes the frame transform.
- Mobile menu open/Escape passed and restored focus. Panel computed opacity is1 with background alpha0.9; its286px client and scroll widths match. Studio expansion/Escape passed with298px width and no horizontal overflow. Screenshot inspected.
- One initial Chromium measurement ran before responsive styles had settled after a viewport resize; the test was repeated after waiting for the computed mobile typography, producing the confirmed values above. Local production analytics404 and the pre-existing Lab stylesheet preload warning were observed, with no new application exception.
- Screenshots remain local in `output/playwright/hero-scale-*`. Final scoped review found no remaining blocking regression; no changes to libraries, data, authentication, payments or interaction logic.
