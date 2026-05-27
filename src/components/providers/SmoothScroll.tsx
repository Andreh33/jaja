'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type Lenis from 'lenis';

/**
 * Scroll suave cinematográfico (Lenis) sincronizado con GSAP ScrollTrigger.
 * Solo en desktop (puntero fino) y fuera de las zonas de app (admin/dashboard),
 * donde hay contenedores con scroll propio. El móvil usa su inercia nativa.
 *
 * Lenis y GSAP se cargan dinámicamente para no engordar el bundle inicial.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')) return;

    let lenis: Lenis | null = null;
    let tickerCb: ((time: number) => void) | null = null;
    let cancelled = false;

    (async () => {
      const [{ default: LenisCtor }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      lenis = new LenisCtor({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on('scroll', ScrollTrigger.update);

      tickerCb = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tickerCb);
      gsap.ticker.lagSmoothing(0);
    })();

    return () => {
      cancelled = true;
      lenis?.destroy();
      if (tickerCb) {
        import('gsap').then(({ gsap }) => gsap.ticker.remove(tickerCb!));
      }
    };
  }, [pathname]);

  return null;
}
