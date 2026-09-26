# Server atmosphere and living CRT

## Direction and constraints

The server film is decorative atmosphere, not a claim that Latech owns a data centre. Preserve the existing first-visit desktop camera opening, mobile curtains, animated PulseGrid, pointer-following light, scrolling grid, orange-to-blue headline, television angle and hero text coordinates. A single agent implemented the work. No new runtime dependency.

Web Design Director and Emil Design Engineering informed the visual hierarchy; Animate informed the interruptible reflections and channel feedback. 21st CLI was not authenticated. Public read-only reference: [Hero Section 5 by Méschac Irung / Tailark](https://21st.dev/@meschacirung/components/hero-section-5), MIT, Motion and Lucide dependencies. No code or dependency from it was installed.

## Film provenance

- Source: [Close Up of a CPU, Pexels video 7140928](https://www.pexels.com/video/close-up-of-a-cpu-7140928/).
- Creator: MrColo, credited on the source page.
- [Pexels license](https://www.pexels.com/license/), checked 2026-09-26: free website use and modification, attribution appreciated but not required; no implied endorsement or redistribution as stock.
- Observed source: 3840×2160, 24fps, H.264 plus audio, 9.386667 seconds, 26,407,412 bytes.
- Source file is retained only in ignored/untracked local output, not shipped.
- Derived first-party assets: `public/video/server-atmosphere-4k.mp4`, `server-atmosphere-1080.mp4`, `server-atmosphere-720.mp4`, `server-atmosphere-poster.webp`.
- Treatment: removed audio; 0.8-second end/start crossfade with matching loop boundary; mild desaturation and lifted midtones; H.264/yuv420p with fast-start. No logos or ownership claims added.

## Implementation

- The video layer sits behind the existing grid and light at 27% opacity. Local dark gradients protect text contrast and blend the bottom edge.
- Source selected once per mount: 720p for mobile, 1080p for ordinary desktop, 4K for desktop with at least 2560 effective horizontal pixels. No redundant downloads on resize.
- Initial reduced-motion or data-saving preference gets the poster without a video source. Playback pauses when offscreen, hidden, expanded or explicitly paused through the existing pulse button. Autoplay failure retains the poster.
- The intro preloads the poster and optionally waits for the first decoded frame, bounded to 1200ms, within the existing 4200ms preload deadline and 7000ms fail-safe. It never waits for the entire film.
- The existing camera/curtain choreography reveals the atmosphere and halo. A temporary root attribute is removed on every dismiss/unmount path.
- Halo follows actual Studio navigation and project tabs: cool blue home, cyan portfolio/services, amber studio/contact/selected projects, green laboratory; brand customization follows the chosen accent. No cross-origin pixel sampling.
- Four stable light layers crossfade via opacity; interactive controls remain immediately usable.
- Glass highlight follows a fine pointer using the existing hero spring, with the complete transform string. Reduced motion, touch and pause disable tracking.
- CRT texture is lighter through the centre for readable content. Original case texture remains; edge abrasion is toned down and fine wear added near controls.
- A short CH/AV readout confirms the actual channel. It uses interruptible transitions and a cleaned-up timer; keyboard, reduced motion and pause suppress this decorative feedback.

## Review

| Before | After | Why |
| --- | --- | --- |
| A new background could compete with the grid | Film behind the existing grid and moving light, exactly 27% opacity | Preserves the owner's approved visual signature |
| One continuous CRT surface texture | Central mask softens phosphor and scanlines, edges retain the effect | Improves text clarity without losing the tube aesthetic |
| Fixed blue halo | Stable blue/cyan/amber/green layers crossfade on actual channel state | Connects the navigable content and its physical surround |
| Fixed glass reflection | Small spring-interpolated pointer reflection | Adds material depth without moving the clickable screen |
| A full-film preload could hold the opening | First-frame-only gate with 1200ms bound, poster fallback | Keeps the existing fail-safe and Skip/Escape behavior |

Motion review: approved in the scoped implementation. Decorative reflection uses the existing spring and full transform; transient readout uses interruptible 160ms transform/opacity transitions; halo uses 250ms opacity transitions. Pause, pointer gating and reduced motion are present. The slow film and one-time reveal are marketing atmosphere, not delays on functional controls.

Code review: no remaining reachable defect found in the reviewed scope. Resource listeners, animation timers and observer lifetimes are cleaned up. A draft readout implementation that could leave a timer cancelled on input-mode changes was corrected before browser verification. No changes to authentication, project-origin isolation, payments or database contracts.

## Verification

- Full ESLint and typecheck passed.
- Full suite: 219/219 tests across 42 suites passed. Focused tests14/14 passed again after the final handler cleanup.
- Desktop1600×900: video1920×1080 playing, film opacity0.27, no horizontal overflow. Headline x104/y233.4375/684×398.859375 exactly matches the prior version.
- Desktop2560×1440: browser decoded the native3840×2160 file successfully.
- Mobile390×844:720p film, mobile curtains retained, Skip restores main-content focus, CRT wrapper display:contents and controls hidden.320px width also has no horizontal overflow. Desktop/mobile screenshots visually inspected under local output/playwright.
- Existing pulse control pauses the film. Scrolling out of the hero pauses it; scrolling back resumes it. Pointer movement changes the glass reflection transform.
- Physical channels and contained project tabs: projects cyan, Monkey amber, Zona Sport cyan, laboratory green, home blue. Readout CH02 confirmed. Keyboard navigation hides the decorative readout and keeps functional navigation immediate.
- Initial reduced motion: video has no src, moving reflection and sweep hidden.
- Forced video request failure: poster remains, ready=false, first-visit intro exits after6103ms under local load, root reveal attribute removed and main-content focus restored. No full-film wait.
- Initial dev navigation exceeded60sec while the server compiled for67sec; subsequent navigation passed. One intro visibility observation missed a short-lived dialog; repeating with explicit first-visit initialization passed. Those timeouts are not counted as successful checks.
- Console has no application exception; deliberately aborted video requests in the failure test and one CSS-preload warning are explained. Mobile is emulated, not a physical iPhone.
- Production build passed, exit0:189 pages generated against the isolated local QA database. Deployment status is recorded in the operational checkpoint after push.
- Compiled production smoke passed: video plays, opacity0.27, physical channel turns the halo cyan, shared pause stops playback, no pageerror events. Final production screenshot inspected. Local Vercel Analytics script404 and CSS-preload warnings are non-blocking hosting/development differences.
