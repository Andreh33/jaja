# Desktop home composition

## Scope and direction

Hide the two requested secondary labels on desktop while making the headline and interactive Studio larger. Keep the navy/blue/white palette, orange scroll accent, exact company motto, typefaces and existing motion. Give the two primary elements an equal-width stage; retain the separate mobile composition and the short-laptop adaptation. No dependencies or interaction logic changed.

Web Design Director and Emil guided hierarchy, optical sizing and safe frame margins. `21st whoami` was unauthenticated. [Classy Hero by Jatin Yadav](https://21st.dev/@jatin-yadav05/components/classy-hero/classy-hero) was consulted in the public catalogue for typographic emphasis only (MIT; no code installed).

| Before | After | Why |
| --- | --- | --- |
| Two secondary desktop labels | Hidden from768px, mobile preserved | Requested simpler first impression |
|1320px maximum composition |1680px maximum, balanced columns | More presence on wide screens |
| Headline sized against the viewport | Container-relative desktop type, capped at180px | Larger without overflowing its column |
| Tilted frame near the right edge | Reserved32px depth margin and inset annotation | Keep the enlarged interactive frame on screen |

## Verified

- `git diff --check`, ESLint, TypeScript and200 tests passed. The final production build generated189 static pages. Four focused brand/viewport tests include desktop-only label hiding and the retained pulse control.
- Chromium at320×568,390×844,768×1024,1280×720,1366×768,1440×900 and1920×1080: no horizontal page overflow or heading overflow. Both labels are absent at desktop widths and retained on mobile.
- At1280×720, heading100.8→115.2px; Studio449→532px wide, content390→420px high. At1440×900, heading138.24→146.96px; Studio562→609px, content500→540px. At1920×1080, heading180px, Studio762px, content605px.
- Mobile measurements match the previous build:320px viewport gives heading65px, Studio256px/content420px;390px gives heading77.025px, Studio320px/content523px. Navigation opacity is untouched.
- Normal-motion screenshots at1366px and1440px inspected. The tilted Studio frame stays within the viewport. Reduced-motion responsive sweep passed. Screenshots saved locally under `output/playwright/desktop-hero-*`.
- Keyboard expansion, Studio project navigation, Escape and focus restoration passed. Expanded dialog960px wide fits1366×768.
- Local console only reported the expected Vercel analytics script404 outside Vercel and existing unused stylesheet preload warnings. No new application exception observed.
- Scoped high-signal review found no remaining regression in the diff; no data, auth, payment or external-navigation changes. Browser emulation is not a physical-device test.
