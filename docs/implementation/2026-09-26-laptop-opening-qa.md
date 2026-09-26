# Laptop composition and illuminated brand opening

## Device evidence and design

The local display reports1600×900 at60Hz on the integrated eDP-1 panel. Browser zoom and the user's actual browser content height were not directly read. The layout therefore targets the real width with responsive height handling, checked at both1600×780 and1600×900, rather than assuming the whole screen is web content.

Web Design Director and Emil guided the composition; Animate guided a first-visit brand-delight sequence using existing CSS easing tokens, transform and opacity. [GlassRefractionHero by Dhileep Kumar GM](https://21st.dev/@dhileepkumargm/components/glass-refraction-hero) was consulted for blue light/depth direction.21st CLI was unauthenticated; public catalogue only, no installed component, new asset or dependency.

| Before | After | Why |
| --- | --- | --- |
|40px desktop left margin at1600px |104px, with fluid margins at adjacent widths | Keep the main message away from the edge |
| Generic wide-desktop vertical sizing | Laptop-height-aware headline and Studio | Keep the CTA and Studio controls comfortably visible |
| Restrained logo shadow | Real logo, static blue/ice glow, masked shine and one soft blue flare | Make the opening distinctly branded without raster editing |
|1500ms opening |2500ms, plus2800ms safety deadline started after mounting | Add one second without hydration eating the animation time |
| Reduced motion suppressed the opening | Explicit owner-requested exception for this opening only | Honor the latest instruction; retain Skip/Escape and once-per-session behavior |

## Verification

- Full lint/typecheck and205 tests passed; focused lint and9 brand/opening tests passed after the timer refinement.
- Responsive Chromium checks at320×568,390×844,768×1024,1101×780,1280×720,1366×768,1440×900,1600×780,1600×900 and1920×1080 found no page or heading overflow.
- At1600px width, headline starts104px from the edge; headline124.8px at780px high and144px at900px high. Studio624px wide, with400/500px content height respectively. Mobile measurements unchanged from the prior release.
- Normal-motion screenshots of both laptop heights and a live opening frame inspected. Assets under `output/playwright/laptop-*` remain local.
- The initial cold-load timing check exposed the old fallback starting before the dialog appeared (2385ms visible despite a2500ms CSS duration). The fallback was moved to an effect gated on the mounted/open state. Final runtime checks showed2500ms CSS duration, with total dialog residency around2763–2840ms under browser load. The2800ms fallback also released the dialog when curtain animations were deliberately disabled.
- Both normal and reduced-motion modes show the opening. Under reduced motion the curtain remains2500ms and shine1500ms, while the home artwork still computes `transform:none`: the exception does not leak to the rest of the site.
- Escape and keyboard activation of Skip close the introduction and restore focus to `main-content`. The first Skip measurement ran before Radix completed focus restoration; waiting for the settled focus confirmed it. A repeat visit in the same session and a fresh anchored navigation did not open the introduction.
- Mobile opening and home screenshots inspected at390×844. No overflow; the prior77.025px heading remains unchanged. Browser console showed only the expected local Vercel analytics404 and known CSS preload warnings.
- The build after the timer refinement generated all189 pages but the process reported exit143 after finalization. A clean isolated rebuild then passed with exit0 and189 pages; no compile/type error appeared.

## Review scope

The introduction is a rare, one-time marketing animation, not a fake loading progress display. Predetermined motion uses CSS; gradients, logo masks and shadows remain static while their layers move/fade. The modal, Escape, skip button and focus return use the existing Radix behavior. No global reduced-motion rule is removed; the intentional opening-only exception is an accessibility tradeoff explicitly requested by the user. No data, payment, authentication or external-navigation changes.

Motion review: approved within the explicit opening-only reduced-motion exception. No animated layout/filter properties, repeated flashes, new dependencies or verified functional regression found. High-signal review included the duration/fallback contract and the shared Studio viewport variable; expanded Studio retains its more-specific viewport override.
