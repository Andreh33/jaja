# Mirrored server background

## Approved scope

Replace the previous Pexels close-up with option 2 from the free shortlist, reflected horizontally. The user's subsequent instruction sets the film opacity to **24%**, replacing the earlier 27%. Preserve the CRT, grid, moving light, opening sequence, text layout, mobile choreography and playback safeguards. Single-agent implementation; no dependencies added.

## Source and rights

- [Server, Computer, Network — Pixabay 240062](https://pixabay.com/videos/server-computer-network-cloud-240062/), by olenchic; the source page labels the video as AI generated.
- [Pixabay Content License](https://pixabay.com/service/license-summary/), checked 2026-09-26. Free use and modification without required attribution, subject to the license's prohibited uses. This is decorative media integrated into a website, not standalone stock redistribution or an ownership/endorsement claim.
- Source observed in the public video player: `https://cdn.pixabay.com/video/2024/11/05/240062_large.mp4`.
- Download verified: H.264, 1920×1080, 30000/1001 fps, 9.876533 seconds, 4,696,683 bytes, no audio stream.
- The original remains in untracked local output. Only processed web assets are shipped.

## Treatment

- Horizontal reflection is baked into the video and matching poster using FFmpeg `hflip`; no UI or text is mirrored.
- Eight-second silent loop at 30fps, with a 0.8-second tail-to-head crossfade; H.264/yuv420p, fast-start.
- Native 1080p desktop version and reduced 720p mobile version. No artificial 4K upscaling; the previous 4K source is no longer selected.
- Version-specific filenames prevent an old cached video/poster from appearing alongside the new assets.
- Opacity is exactly 0.24 on the shared film layer, so video and poster receive the same treatment. Existing shade gradients remain unchanged.

## Design and review

Web Design Director scoped the change to the existing composition. The 21st CLI was not authenticated; the public [Tailark Hero Section 5](https://21st.dev/@meschacirung/components/hero-section-5) was consulted read-only. No component or package was installed. Emil's consistency guidance informs using the identical mirrored frame for the loading/reduced-motion poster.

| Before | After | Why |
| --- | --- | --- |
| Previous source at 27% | User-selected mirrored source at 24% | Applies the latest explicit choice |
| 4K selection for high-DPI desktop | Native 1080p desktop ceiling | Avoids unnecessary upscaling and bandwidth |
| Old static asset URLs | New matching video and poster URLs | Prevents mixed cached versions |

## Verification

- Full ESLint and TypeScript checks passed. Focused atmosphere and intro suites: 10/10 tests passed. `git diff --check` passed.
- Production build passed against the isolated local QA database: 189 pages generated. No production database, payment or account mutation.
- FFprobe confirms both derived videos are eight seconds, 30fps, H.264 and silent. Desktop: 1920×1080, 2,716,774 bytes; mobile: 1280×720, 1,148,529 bytes.
- The mirrored poster was visually checked against the source: the large foreground racks now sit on the left, with the perspective receding to the right.
- Compiled local production app in Chrome at 1600×900: native 1080p video playing, computed film opacity `0.24`, no horizontal overflow. Desktop opening completes and removes its temporary root attribute. Screenshot inspected; CRT, grid and headline composition preserved.
- The existing pulse control pauses and resumes the video successfully.
- Mobile viewport 390×844: 720p video playing, computed opacity `0.24`, no horizontal overflow; screenshot inspected. At 320×844, no horizontal overflow and the 720p asset remains selected. These are responsive Chrome checks, not a physical iPhone test.
- Captured mobile console warning/error log is empty.
- Full scoped diff reviewed with High-Signal Code Review: helper signature and every caller agree; intro and CSS reference the new poster; reduced-motion/data-saving guards remain; no references to removed files remain in source/tests. No remaining reachable defect found in this scope.
