# Fase 0 — Cimientos + PWA · Diseño

**Fecha:** 2026-05-27
**Proyecto:** Latech (serviciosonlineweb.com)
**Stack:** Next.js 16.2 · React 19.2 · Tailwind 4 · Framer Motion 12 · GSAP 3.15

## Contexto y objetivo

La web de Latech ya está pulida (Framer Motion en entradas, `AuroraBackground`, `MouseGlow`,
`GradientText`, `MagneticButton`, `NumberFlow`, `CustomCursor`, `ScrollProgress`…). Antes de
añadir scroll-storytelling, fondos WebGL y 3D (fases 1-4), esta Fase 0 sienta los **cimientos
de calidad** que evitan que esas capas queden inconsistentes ("cutre"), arregla un defecto
visible en móvil, y entrega la **PWA instalable** con su emergente de instalación (dirección B,
ya aprobada visualmente).

El listón es premium: nada a medias, móvil tan cuidado como desktop.

## Alcance

### Dentro
1. **Fix del cursor en móvil** (defecto reportado).
2. **Sistema de movimiento** (tokens compartidos) + `MotionConfig` global.
3. **Scroll suave (Lenis)** — solo desktop, móvil nativo.
4. **Degradación y accesibilidad** — `prefers-reduced-motion`, `save-data`, gating táctil.
5. **PWA**: manifest + iconos + service worker mínimo + emergente de instalación (dirección B).
6. **Open Graph**: OG por defecto (raíz) + OG dinámica por post de blog + OG de la página `/proyectos`.

### Fuera (fases futuras)
- Push notifications (VAPID/backend).
- Offline caching avanzado (Serwist — requiere webpack, incompatible con Turbopack actual).
- Scroll-storytelling, WebGL/shaders, 3D, transiciones de página (fases 1-4).
- OG por proyecto individual (requiere crear rutas de detalle `/proyectos/[slug]`, previstas en Fase 1).

## Decisiones

| Decisión | Elección | Motivo |
|---|---|---|
| Scroll suave | **Lenis**, solo desktop | Ligero (~2kb), integra con GSAP/Framer. Móvil usa scroll nativo (mejor inercia, sin riesgo de tirones). Locomotive manipula el DOM y rompe sticky. |
| Service worker | **`public/sw.js` propio y mínimo** | Turbopack-safe. Serwist necesita webpack. Solo instalabilidad + shell offline. |
| Sistema de movimiento | **`lib/motion.ts` + `<MotionConfig reducedMotion="user">`** | Easing/duración coherentes en toda la web; Framer respeta reduced-motion automáticamente. |
| OG images | **`opengraph-image.tsx` con `next/og`** | Imagen de marca al compartir. Hoy no existe ninguna. |
| Prompt instalación | **`beforeinstallprompt` (Chromium) + instrucciones (iOS)** | Mejora progresiva con fallback; Next avisa de no depender solo del evento. |

## Arquitectura

Cada unidad tiene un propósito único y se puede entender/probar por separado.

### Archivos nuevos

| Archivo | Propósito | Interfaz / depende de |
|---|---|---|
| `src/lib/motion.ts` | Tokens de animación: `EASE_OUT_EXPO = [0.16,1,0.3,1]`, duraciones, variantes Framer (`fadeUp`, `stagger`). | Módulo puro. Consumido por componentes Framer y defaults de GSAP. |
| `src/lib/device.ts` | Funciones puras `prefersReducedMotion()`, `prefersReducedData()`, `isFinePointer()`, `isLowEndDevice()` + hook `useDeviceCapability()`. | `matchMedia`, `navigator`. Sin estado global. |
| `src/lib/install-prompt.ts` | Lógica **pura** `shouldShowPrompt(state)` + tipos. Aísla la regla de negocio del prompt para testearla. | Sin DOM. Ver firma abajo. |
| `src/components/providers/MotionProvider.tsx` | `<MotionConfig reducedMotion="user">` global. | Framer Motion. Envuelve `children` en layout. |
| `src/components/providers/SmoothScroll.tsx` | Inicializa Lenis en rutas públicas; desactivado en táctil y reduced-motion. | `lenis`, `usePathname`, `useDeviceCapability`. |
| `src/components/pwa/ServiceWorkerRegister.tsx` | Registra `/sw.js` (`scope:'/'`, `updateViaCache:'none'`) con try/catch. | `navigator.serviceWorker`. Falla en silencio controlado (`console.warn`). |
| `src/components/pwa/InstallPrompt.tsx` | Emergente dirección B. Desktop esquina / móvil bottom-sheet / iOS instrucciones. | `lib/install-prompt`, `lib/device`, `localStorage`, `@vercel/analytics`. |
| `src/app/manifest.ts` | Web App Manifest (`MetadataRoute.Manifest`). | Next 16 nativo. |
| `public/sw.js` | SW mínimo: precache de app shell + `/offline`, `fetch` handler (cumple instalabilidad). | Sin push (fuera de alcance). |
| `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Iconos del manifest. Generados desde `src/app/icon.svg` con `sharp` (maskable con padding seguro ~20%). | Asset task. |
| `src/app/opengraph-image.tsx` | OG de marca por defecto (1200×630, `next/og`). | `next/og` `ImageResponse`. |
| `src/app/blog/[slug]/opengraph-image.tsx` | OG dinámica por post (título sobre fondo de marca). | `next/og`, `lib/posts`. |
| `src/app/proyectos/opengraph-image.tsx` | OG de la página de proyectos. | `next/og`. |
| `src/app/offline/page.tsx` | Página offline simple servida por el SW. | — |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/components/effects/CustomCursor.tsx` | **Devuelve `null`** si no es puntero fino (fix bug móvil). Estado tras montaje + re-evalúa con listener de `matchMedia`. No renderiza los `<div>` en táctil. |
| `src/components/effects/MouseGlow.tsx` | No se monta en táctil ni con reduced-motion. |
| `src/components/effects/AuroraBackground.tsx` | Respeta `reduced-motion`/`save-data`; baja intensidad y pausa animación en gama baja/móvil. |
| `src/app/globals.css` | Bloque global `@media (prefers-reduced-motion: reduce)` (corta animaciones/transiciones) + utilidades `safe-area` (`env(safe-area-inset-*)`). |
| `src/app/layout.tsx` | Montar `MotionProvider`, `SmoothScroll`, `ServiceWorkerRegister`, `InstallPrompt`; `export const viewport` (themeColor `#0a0813`, `colorScheme:'dark'`); `metadata.openGraph.images`/`twitter` por defecto. |
| `next.config` (o `vercel.ts`) | `Cache-Control: no-cache` para `/sw.js`. |

## Lógica pura del prompt (testeable)

```ts
// src/lib/install-prompt.ts
export type Platform = 'ios' | 'chromium' | 'unsupported';

export interface PromptEligibility {
  installed: boolean;          // display-mode: standalone || navigator.standalone (iOS)
  platform: Platform;
  hasDeferredPrompt: boolean;  // beforeinstallprompt capturado (solo chromium)
  lastDismissedAt: number | null; // epoch ms desde localStorage
  now: number;                 // epoch ms
}

export const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 días

export function shouldShowPrompt(s: PromptEligibility): boolean;
```

Reglas:
- `installed` → `false`.
- `platform === 'unsupported'` → `false`.
- Cerrado hace < 14 días (`now - lastDismissedAt < DISMISS_COOLDOWN_MS`) → `false`.
- `platform === 'chromium'` y `!hasDeferredPrompt` → `false` (sin evento no hay instalación de 1 clic; se espera al evento).
- `platform === 'ios'` → `true` (muestra instrucciones).
- Resto → `true`.

`shouldShowPrompt` decide **elegibilidad**. La aparición diferida (tras ~8s o scroll) es responsabilidad de la UI en `InstallPrompt.tsx`, no de la regla pura.

Clave localStorage: `latech.pwa.dismissedAt`. Eventos Analytics: `pwa_prompt_shown`, `pwa_prompt_installed`, `pwa_prompt_dismissed`.

## Manifest

`name: 'Latech'`, `short_name: 'Latech'`, `description`, `start_url:'/'`, `display:'standalone'`,
`background_color:'#0a0813'`, `theme_color:'#0a0813'`, `icons` (192, 512, maskable 512), `lang:'es'`,
`categories`. theme-color del navegador vía `export const viewport`.

## Service worker (mínimo)

`public/sw.js`: en `install` precachea app shell mínimo (`/`, `/offline`, iconos); `activate` limpia
caches viejas; `fetch` responde de red con fallback a cache y, para navegaciones fallidas, a `/offline`.
Sin `push` (fuera de alcance). Registro en cliente con manejo de error que no rompe la página.

## Open Graph

- `src/app/opengraph-image.tsx`: OG de marca (logo + tagline "Webs que convierten visitas en clientes").
- `src/app/blog/[slug]/opengraph-image.tsx`: título del post sobre fondo de marca.
- `src/app/proyectos/opengraph-image.tsx`: OG de la sección proyectos.
- `layout.tsx`: imagen OG/twitter por defecto para el resto de rutas.

## Degradación y accesibilidad
- `prefers-reduced-motion`: Framer (automático vía `MotionConfig`) + CSS global. Lenis desactivado.
- `save-data` / gama baja: fondos ligeros, Aurora atenuada.
- Táctil: sin cursor personalizado ni mouse-glow; bottom-sheet en vez de esquina para el prompt.
- `safe-area` para elementos fijos (Navbar, WhatsAppFloat, InstallPrompt, Toaster) en móviles con notch.

## Rendimiento
60fps objetivo. Lenis con un único `requestAnimationFrame`. SW sin sobre-cachear. Iconos/OG
optimizados. No tocar el LCP del Hero (sin diferir su render).

## Testing
- **Unit** (`tsx --test`): `shouldShowPrompt` (instalado, cooldown, plataformas, sin deferred) y
  detección de plataforma de `lib/device`/`install-prompt` (lógica pura).
- **Visual / manual** (Playwright MCP): emergente en desktop/Android/iOS; cursor ausente en táctil;
  reduced-motion corta animaciones. SW requiere HTTPS local: `next dev --experimental-https`.

## Riesgos
- Lenis vs `Radix ScrollArea` (dashboard/admin): mitigado restringiendo Lenis a rutas públicas y
  marcando contenedores internos con `data-lenis-prevent`.
- Iconos maskable mal recortados → usar padding seguro y verificar en maskable.app.
- SW cacheando contenido desactualizado → `no-cache` en `/sw.js` y versionado de cache.

## Necesidades de assets
- Marca/logo fuente para generar iconos PWA (a partir de `src/app/icon.svg`).
- Confirmar `theme_color`/`background_color` `#0a0813` (fondo actual del sitio).
