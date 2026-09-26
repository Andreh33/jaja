# Studio project browser and mobile input QA

## Requested scope

- Simplify the unusual design inside Studio.
- Make Rank Rush dependable on mobile.
- Open real projects inside Studio, as a browser.
- Latest constraint: that browser must not navigate outside the selected project's domain.

## Implementation

The abstract blue sculpture is replaced by a real-project showcase. Its image has a small desktop scroll translation; mobile and reduced motion are static. The brand concept is a clearer webpage-like layout without decorative rings or the anatomy panel. Name, sector, style, accents, share and poster controls remain.

Studio's project cards open an internal browser with three project tabs, return, reload and enlarge controls. Only the active instance loads the external site. Monkey and French Tacos use their real pages, not screenshots. Zona Sport sends `X-Frame-Options: SAMEORIGIN`, so its design preview is shown without trying to bypass the policy.

The browser accepts no URL input and has no external-opening control. Each supported project uses a small same-origin document shell with its own `frame-src` CSP restricted to the project's exact origin. The nested site's sandbox excludes popups and top/ancestor navigation. The shell is not a proxy: it does not fetch, rewrite or strip the external site's headers. Unknown project slugs return 404; the restricted project returns 403. Shell documents are noindex/nofollow. External-navigation violations show a local explanation and a return-to-project button.

Rank Rush responds on pointer-down, with separate keyboard/assistive click handling to prevent compatibility clicks counting twice. The results panel is now a second large tap target. The pressure row reserves space before starting, keeping the main button stationary. Mobile controls have larger touch targets. The original user-specific failure was not reproduced in the available emulated devices: baseline Chrome and WebKit did count taps on the original button. This revision improves the input path and the previously noninteractive search-results area; it does not claim a physical-device diagnosis.

## References and review

`21st whoami` was unauthenticated. The public [Safari component by Ruixen](https://21st.dev/@ruixen.ui/components/safari-01) informed the compact browser chrome; no code or dependency was installed from it. The [MDN frame-src reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-src) was checked before implementing origin restriction.

Web Design Director and Emil criteria guided the simplified composition and controls. Animate/Scroll Storytelling limited movement to one image, driven by native scroll. Main-agent code and animation review used the high-signal and motion review checklists; no subagents were started.

| Before | After | Why |
| --- | --- | --- |
| Abstract rotating layers | Real projects with a small image-only desktop scroll offset | Tie the visual to the work being sold |
| Decorative concept shapes and anatomy panel | Clear hero, message, CTA and two structural sections | Make the concept read as a website |
| Click-only input and inert search results | Pointer-down input plus a full results tap target | Respond immediately and where visitors naturally tap |
| New pressure row after start | Reserved row before and during play | Keep the tap control under the finger |
| External project links | Isolated project browser with an exact-origin CSP | Stay inside Studio and the selected project |

Motion review: approve. No new timed entrance or continuous animation; native-scroll image transform only, disabled on mobile and reduced motion. Existing direct button feedback remains.

## Browser evidence

- Mobile Chrome and WebKit, including 320px narrow layout; desktop 1440px. No outer horizontal overflow in checked flows.
- WebKit: a complete rapid-touch game reached rank 1, with 95 touch events producing exactly 95 counted taps.
- Chrome: 20 touches yielded 20 taps; three keyboard presses yielded a total of 23. Pause remained stable and resume worked.
- Rank Rush button coordinates were unchanged before/after starting in the final WebKit input test.
- Actual Monkey and French Tacos pages rendered inside their browser shells. Actual Monkey navigation reached `/nosotros` while the outer page stayed on Latech.
- Zona Sport shows the explanatory design view with no iframe. Return to Studio preserves the parent page.
- Three brand directions fit at 320px. Desktop showcase inspected visually. Reduced-motion computed transform is `none` after the media change settles.
- Controlled browser fixtures exercise real security enforcement without contacting the outside destination. WebKit blocked external links, popups and top navigation. Chrome additionally blocked external redirects, script navigation and form navigation. Internal `/inside` navigation succeeded; zero requests reached the outside fixture and zero popups opened. The blocked-link explanation appeared.
- A WebKit stylesheet-policy warning was observed while screenshotting the live French Tacos embed in development; no outer-application JavaScript exception was observed. In the final production build, the same French Tacos shell loaded in mobile WebKit with zero console messages, errors or warnings (without screenshot injection). Intentional negative CSP tests produce expected browser policy errors.
- Final production-mode Chrome smoke: Monkey and French Tacos rendered real headings inside Studio; the outer page stayed on Latech with no horizontal overflow. Rank Rush counted 15 touches as 15 taps and paused correctly. The only local Chrome resource error was the expected unavailable local `/_vercel/insights/script.js` endpoint; no application exception was observed.

## Validation

- Targeted unit/SSR/route tests: 11 passed.
- `git diff --check`, lint and typecheck: passed.
- Full test suite: 183 passed, zero failures.
- Production build: passed, 187 static pages generated, plus the dynamic project-shell route. Rebuilt after the final showcase copy adjustment.
- GitHub authentication and effective author/committer verified as Andreh33 before release; remote matched the authorized repository and was not ahead of the local base. Release/CI/deployment evidence is recorded in the operational delivery checkpoint after publication.

Screenshots are retained locally under `output/playwright/studio-*`; no QA artifacts are shipped as application assets. No checkout, contact form, message, migration or external-site setting was changed.
