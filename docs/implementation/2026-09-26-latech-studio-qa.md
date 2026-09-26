# Latech Studio — evolution and QA

## Scope and direction

The rejected chain-release button and its state/styles are removed. The WordPress positioning remains, without the chain metaphor. The hero grid now carries four blue light traces, aligned to its geometry. A visible pause control, offscreen/tab visibility suspension and reduced-motion fallback keep the effect optional.

The tilted light experience is now named **Latech Studio** throughout the public UI and accessible labels. It contains seven views: Inicio, Proyectos, Tu marca, Sin gravedad, Servicios, El estudio, Hablemos. It remains a real local interactive interface, not a screenshot or nested iframe.

- Shared navigation history, project and creative settings survive opening/closing the larger window.
- Layered 3D-style CSS sculpture responds to the inner scroll and can be separated/reassembled.
- Monkey, Zona Sport and French Tacos each have their own visual treatment and real destination.
- Creative controls change business name, sector, art direction and accent. Three directions use different typography, composition and geometric forms.
- A design anatomy view explains hierarchy, character and the contact action.
- User-triggered PNG poster export is 1600×2000; share links serialize bounded, validated state in the browser fragment, not a server query. Existing analytics URL sanitation removes fragments.
- Personalized contact links carry a prepared brief; QA does not send a message.
- A lazily loaded canvas experiment supports piece dragging, bounded collisions, impulse, gravity, reset and pause. It suspends offscreen, under the expanded instance, on hidden tabs and for reduced motion.
- Expanded window supports bounded pointer drag, arrow-key movement, Home to center, resize recentering and Escape/focus return.
- Services, process, studio and contact content are substantially expanded. The €800 creation price remains separate from maintenance and VAT.

No backend, dependency, authentication, checkout or database schema changes. Cross-device QR control is not included; this iteration is self-contained in the visitor's browser.

## References and skills

21st CLI reports not authenticated. Consulted the official public [Ripple Grid by Ali Imam](https://21st.dev/community/components/aliimam/ripple-grid/default); no registry code installed or copied. Direction adapted to the existing navy/ice/orange identity.

Web Design Director, Scroll Storytelling, Emil design engineering and Animate guided composition, native scroll, light-weight motion and touch/reduced-motion alternatives. Agency QA, Playwright, code review and animation review guide the release checks. Only the main agent worked on this revision.

## Browser checks completed in development

- 1440×900 and 1440×650 desktop; 320×780 and 390×844 responsive checks.
- Hero primary CTA remains visible at 650px height (y544–598).
- All seven Studio views navigated using real pointer actions in both tilted and expanded presentation at 320px.
- All three project destinations verified; no text overflow in project views after sizing fixes.
- All three art directions fit the narrowest frame; name and style preserved across expand/close.
- Poster downloaded and visually inspected. Share link reload reconstructs name, sector, style and accent; prepared WhatsApp link contains the selected brief.
- Gravity canvas visibly changes during play; image remains stable when paused and under reduced motion.
- Grid trace animation runs and pauses with its control; reduced motion reports no animation.
- Keyboard navigation focuses the page heading; Escape restores the expand trigger.
- Expanded window moves with mouse and arrows; Home centers it. Resize returns it inside the mobile viewport (x10, width300 at 320px).
- Final normal and reduced-motion development reloads: no JavaScript console errors. Motion's development-only reduced-motion warning is expected.

## Review findings addressed

| Before | After | Why |
| --- | --- | --- |
| Motion preference changed initial inline markup between server/client | Stable initial styles with CSS reduced-motion overrides | Eliminate hydration mismatches without a visual motion flash |
| Wide display type exceeded the smallest tilted frame | Container-sized typography and narrow-layout navigation | The interactive preview must remain usable at 320px |
| Separate preview instances lost the user's current creative choices | Shared controlled state | Expansion is continuation, not a reset |
| Expanded window could retain a desktop drag offset after resizing | Recenter on resize, bound every move | Keep close/navigation controls reachable |
| A canvas loop could run behind another view | Visibility/active ownership and reduced-motion suspension | Avoid duplicating continuous work |

Motion verdict: approve after the above corrections and browser checks. The grid uses four SVG dash traces (a deliberately bounded paint operation), not thousands of animated cells. No measured field-performance, award or conversion claim is made.

## Validation status

- Initial lint and typecheck: passed.
- Initial unit suite: 177 passed, 0 failed.
- A typecheck while the dev server regenerated its route validator hit a transient generated-file parse error. The final checks are run sequentially with the dev server stopped; no application source was changed to suppress the error.
- Final sequential lint, typecheck and tests: passed; **177 tests, 0 failed**.
- Initial isolated build found the local QA database missing. `npm run qa:prepare` created only the file-backed historical fixture; no external services contacted and no developer environment file overwritten.
- Final production build: passed, **187 generated pages with the 76-post historical QA fixture**. This count is fixture-specific, not evidence of deleted production content (no blog data/source changes in this revision).
- Final production-mode touch smoke: passed with a touch-enabled Chrome context (`maxTouchPoints=1`). Expanded Studio, business input, sector, direction/accent, gravity/impulse/pause and close all worked; one main h1, no horizontal overflow, no application JavaScript errors. Local Vercel Analytics script loading returns an expected 404 outside Vercel; an unused CSS preload warning was also observed.
- Production-mode JavaScript-disabled check: main heading, primary CTA and calculator link remain present; no blocking intro dialog or horizontal overflow.
- Git publication is gated on these checks; the release commit and CI/deployment state are recorded in the delivery checkpoint.

Artifacts are retained locally under `output/playwright/studio-*`; no screenshots containing test business names are shipped as site assets.
