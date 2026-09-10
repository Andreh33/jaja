'use client';

import { useCallback, useEffect, useRef, type ReactNode, type RefObject } from 'react';

type ScrollRender = (rect: DOMRect, viewportHeight: number) => void;
const visible = new Map<HTMLElement, ScrollRender>();
let frame = 0;

/** One read batch, then one write batch, and no perpetual frame loop. */
function updateVisible() {
  if (frame || document.hidden) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    const viewportHeight = window.innerHeight;
    const measured = [...visible].map(([element, render]) => ({ rect: element.getBoundingClientRect(), render }));
    measured.forEach(({ rect, render }) => render(rect, viewportHeight));
  });
}
function watch(element: HTMLElement, render: ScrollRender) {
  if (!visible.size) {
    window.addEventListener('scroll', updateVisible, { passive: true });
    window.addEventListener('resize', updateVisible, { passive: true });
  }
  visible.set(element, render);
  updateVisible();
}
function unwatch(element: HTMLElement) {
  visible.delete(element);
  if (!visible.size) {
    window.removeEventListener('scroll', updateVisible);
    window.removeEventListener('resize', updateVisible);
    cancelAnimationFrame(frame);
    frame = 0;
  }
}

/** Mobile/reduced-motion keep the fully visible server layout without scroll subscriptions. */
export function useDesktopScrollEffect(
  ref: RefObject<HTMLElement | null>,
  render: ScrollRender,
  reset: () => void,
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let observer: IntersectionObserver | undefined;
    const configure = () => {
      observer?.disconnect();
      unwatch(element);
      reset();
      if (!media.matches || !('IntersectionObserver' in window)) return;
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) watch(element, render);
        else unwatch(element);
      });
      observer.observe(element);
    };
    configure();
    media.addEventListener('change', configure);
    return () => {
      observer?.disconnect();
      unwatch(element);
      media.removeEventListener('change', configure);
      reset();
    };
  }, [ref, render, reset]);
}

export default function Breathe({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const render = useCallback((rect: DOMRect, height: number) => {
    const progress = Math.max(0, Math.min(1, (height - rect.top) / (height + rect.height)));
    const scale = progress < .5 ? .986 + progress * .028 : 1 - (progress - .5) * .016;
    if (ref.current) {
      ref.current.style.transition = 'transform 220ms cubic-bezier(.23,1,.32,1)';
      ref.current.style.transform = `scale(${scale.toFixed(4)})`;
    }
  }, []);
  const reset = useCallback(() => {
    ref.current?.style.removeProperty('transform');
    ref.current?.style.removeProperty('transition');
  }, []);
  useDesktopScrollEffect(ref, render, reset);
  return <div ref={ref} className={`relative breathe-section ${className ?? ''}`}>{children}</div>;
}
