# Activa Latech — design and QA

## Scope and visual contract

Add the approved interactive transformation to Latech Studio, without replacing existing projects, brand creator or games. The visitor selects a restaurant, shop or company, reveals a designed version of the same content, then explores a functioning concept. Navy, ice blue and white retain Latech's identity; the restaurant uses editorial serif type, the shop focuses on objects, and the company uses architectural illustration. All three businesses, products and displayed product prices are explicitly fictional demonstrations.

The native range control reveals actual HTML, not screenshots. The completed concept has internal navigation and a complete safe demonstration path: menu to booking confirmation, product to bag, or services to inquiry confirmation. These are local reducer state changes, never a real booking, order, payment or message. There are no contact-data inputs, external links, network requests or persistence in the new feature. A separate CTA returns to Studio's existing contact page; it does not send anything.

## Reference and implementation

Web Design Director and Emil Design Engineering guided composition, interaction feedback and explicit mobile layout. `21st whoami` reported unauthenticated. [Compare by Manu Arora](https://21st.dev/@manuarora700/components/compare) was consulted through the public catalogue (MIT, Motion/Tabler dependencies); no third-party component code or dependencies were installed. The visual-reference pattern was adapted into original HTML, CSS Modules and original SVG artwork with unique IDs.

The feature loads on demand using the existing Next dynamic import pattern. Its reducer lives in the shared Studio experience so expansion/collapse does not reset the selected concept, bag or demonstration route. Selecting the current business is a no-op; choosing a different one resets its simulated transaction state. Quantities are bounded and money is calculated in integer cents from the fixed fictional catalogue.

## Motion review

| Before / initial iteration | After | Why |
| --- | --- | --- |
| Static visual reference comparing images | Native range drives an HTML clip and transform-only scanline | Direct manipulation; real usable result |
| Wide display headline wrapped into three mobile lines | Sector-appropriate narrower headline, smaller artwork and protected footer | Keep copy readable and prevent collisions |
| Pointer and keyboard button presses shared a transform | Keyboard focus disables press movement; pointer feedback uses 160ms existing ease-out token | Immediate keyboard interaction without decorative motion |
| Interaction only in the small Studio viewport | Explicit enlargement control and shared state | Make detailed demos usable without losing context |

Purpose: explanation, at the visitor's pace; no autoplay or continuous animation. The slider responds without delayed tweening. Existing CSS tokens supply press feedback; reduced motion removes rotation/press motion and glow. Hover styles are pointer-gated. Motion verdict: approve after mobile/desktop visual checks and computed reduced-motion verification.

## Verification

- Initial model/SSR tests: 8 passed. Lint and typecheck passed.
- Mobile Chrome: native keyboard Home/Right produced 1%; real touch events dragged to 90%. A vertical gesture over the comparison advanced the Studio scroll position from 78 to 193px, preserving page scrolling.
- Chrome completed all three flows. Booking choices appeared correctly in a clearly simulated confirmation; adding two lamps and removing one produced a 89 EUR example total; the company selector produced the correct inquiry summary. Zero non-GET requests were observed through these demonstration actions.
- Collapsing and enlarging Studio preserved the bag route and its one-item quantity. Choosing the same business is non-destructive; switching business resets its demo data.
- Mobile WebKit at 320px: touching the comparison at 72% produced 72%; End unlocked the experience; booking confirmation and the vase-to-bag flow passed (42 EUR example total). Reduced motion yielded an artwork transform of `none`; the contact CTA reached Studio's contact page and Escape closed the enlarged window. No horizontal dialog overflow.
- Chrome desktop layout at 1440px: comparison, live shop hero, three-column catalogue and product detail inspected. PageUp keyboard increments reached 50%. Mobile compositions were iterated to remove a headline/artwork collision. Decorative selector indices are hidden from the accessibility tree so control names remain stable across widths.
- An initial test locator used an exact implicit-label match including option descendants; the actual combobox accessible names were correct. The test was corrected to query the combobox role. A second selector matched the decorative arrow as well as artwork; narrowed to the artwork viewBox. These were test-locator issues, not runtime application failures.
- Full final validation: `git diff --check`, lint, typecheck, 191 tests (zero failures), and production build passed. Build generated 187 static pages, with no route changes.
- Compiled local production smoke in desktop Chrome: real mouse drag reached 78%, keyboard End unlocked the concept, the restaurant confirmation passed, and the existing Monkey project browser still used `/studio-browser/monkey` in the same tab. No application exception. Local-only analytics script 404 was expected; preload warnings concerned the existing Lab CSS chunk and an image inside Monkey, not the new feature.
- GitHub account and effective author/committer were verified as Andreh33, and the remote branch matched the starting commit before release. Publication evidence is recorded in the operational checkpoint after the final production-mode smoke.

No changes to dependencies, database, authentication, payments, external-site settings or the origin-restricted project browser. Evidence screenshots are local in `output/playwright/activa-*` and are not shipped.
