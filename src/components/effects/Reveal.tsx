'use client';

import { createElement, useEffect, useRef, type ReactNode } from 'react';

/** HTML is visible by default. Motion enhances below-the-fold content only. */
function useReveal(delay: number, stagger?: number) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!element || preference.matches || !('IntersectionObserver' in window) || !element.animate) return;
    const animations: Animation[] = [];
    let firstObservation = true;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      if (firstObservation) {
        firstObservation = false;
        // The observer supplies layout measurements in a batch. Do not force
        // a synchronous layout for every reveal during hydration, or animate
        // content that was already visible when its observer became ready.
        if (entry.boundingClientRect.top < window.innerHeight) {
          observer.disconnect();
          return;
        }
      }
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (preference.matches) return;
      const targets = stagger === undefined
        ? [element]
        : Array.from(element.querySelectorAll<HTMLElement>('[data-reveal-item]'));
      targets.forEach((target, index) => {
        animations.push(target.animate([
          { opacity: 0, transform: 'translateY(18px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], {
          duration: 500,
          delay: Math.min(300, Math.max(0, (delay + index * (stagger ?? 0)) * 1000)),
          easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
          fill: 'backwards',
        }));
      });
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    const stop = () => { if (preference.matches) animations.forEach((animation) => animation.cancel()); };
    preference.addEventListener('change', stop);
    observer.observe(element);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', stop);
      animations.forEach((animation) => animation.cancel());
    };
  }, [delay, stagger]);
  return ref;
}

export function Reveal({ children, delay = 0, className, as = 'div' }: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'aside' | 'p';
}) {
  const ref = useReveal(delay);
  return createElement(as, { ref, className }, children);
}

export function RevealGroup({ children, stagger = 0.08, className }: {
  children: ReactNode;
  stagger?: number;
  className?: string;
}) {
  const ref = useReveal(0, stagger);
  return <div ref={ref} className={className}>{children}</div>;
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div data-reveal-item className={className}>{children}</div>;
}
