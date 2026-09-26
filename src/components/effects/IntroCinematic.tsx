'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import styles from './IntroCinematic.module.css';
import { crtCameraFrames } from './crt-projection';

const SEEN_KEY = 'latech-brand-opening-v4';
const OPENING_DURATION_MS = 2500;
const PRELOAD_DEADLINE_MS = 4200;
const CAMERA_DURATION_MS = 1250;

/** First-visit, real asset warm-up. Mobile keeps its curtains; desktop exits the CRT. */
export default function IntroCinematic() {
  const [show, setShow] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const [ready, setReady] = useState(false);
  const [resources, setResources] = useState({ done: 0, total: 0 });
  const screen = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const dismiss = useCallback(() => setShow(false), []);

  useEffect(() => {
    if (window.location.hash || window.scrollY > 20) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
    } catch { return; }
    const frame = requestAnimationFrame(() => {
      try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { return; }
      setDesktop(window.matchMedia('(min-width:768px)').matches);
      setShow(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Real resource completion gates the exit. Network failure can never trap the visitor.
  useEffect(() => {
    if (!show) return;
    let active = true;
    let release: () => void;
    const started = performance.now();
    const animations: Animation[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    const urls = new Set(['/brand/latech-logo.webp']);
    if (desktop) urls.add('/textures/crt-aged-plastic.webp');
    document.querySelectorAll<HTMLImageElement>('main img').forEach(image => {
      const url = image.currentSrc || image.src;
      if (url && new URL(url, location.href).origin === location.origin) urls.add(url);
    });
    const total = urls.size + 1;
    let done = 0;
    const settled = () => { done++; if (active) setResources({ done, total }); };
    const warmImages = [...urls].map(url => new Promise<void>(resolve => {
      const image = new window.Image();
      image.onload = () => { image.decode().catch(() => {}).finally(resolve); };
      image.onerror = () => resolve();
      image.src = url;
    }).finally(settled));
    const fonts = document.fonts.ready.then(() => {}).finally(settled);
    const deadline = new Promise<void>(resolve => { release = resolve; timers.push(setTimeout(resolve, PRELOAD_DEADLINE_MS)); });
    const minimum = new Promise<void>(resolve => { timers.push(setTimeout(resolve, desktop ? 2200 : 0)); });

    async function enter() {
      await Promise.all([Promise.race([Promise.allSettled([...warmImages, fonts]), deadline]), minimum]);
      if (!active) return;
      setReady(true);
      if (!desktop) return;
      const corners = [...document.querySelectorAll<HTMLElement>('[data-crt-corner]')].map(element => {
        const rect = element.getBoundingClientRect();
        return { x: rect.x, y: rect.y };
      });
      const frames = crtCameraFrames(window.innerWidth, window.innerHeight, corners);
      if (!screen.current || !frames) { dismiss(); return; }
      const flight = screen.current.animate(frames, { duration: CAMERA_DURATION_MS, easing: 'cubic-bezier(.77,0,.175,1)', fill: 'forwards' });
      animations.push(flight);
      if (backdrop.current) animations.push(backdrop.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CAMERA_DURATION_MS * .65, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' }));
      try { await flight.finished; if (active) dismiss(); } catch { /* Skip, resize or route unmount. */ }
    }
    void enter();
    timers.push(setTimeout(dismiss, PRELOAD_DEADLINE_MS + OPENING_DURATION_MS + 300));
    const onResize = () => { if (performance.now() - started > 80) dismiss(); };
    window.addEventListener('resize', onResize);
    return () => { active = false; release?.(); timers.forEach(clearTimeout); animations.forEach(animation => animation.cancel()); window.removeEventListener('resize', onResize); };
  }, [show, desktop, dismiss]);

  return <Dialog.Root open={show} onOpenChange={(open) => { if (!open) dismiss(); }}>
    <Dialog.Portal>
      <Dialog.Content className={styles.opening} data-desktop={desktop} data-ready={ready} style={{ '--opening-duration': `${OPENING_DURATION_MS}ms` } as CSSProperties} onCloseAutoFocus={(event) => {
        event.preventDefault();
        document.getElementById('main-content')?.focus({ preventScroll: true });
      }}>
        <Dialog.Title className="sr-only">Latech. Tu imaginación es nuestro límite.</Dialog.Title>
        <Dialog.Description className="sr-only">Preparando las imágenes y fuentes del inicio. Una breve presentación de nuestra marca que puedes saltar o cerrar con Escape.</Dialog.Description>
        <div className={styles.stage} aria-hidden="true">
          {desktop && <div ref={backdrop} className={styles.cameraBackdrop} />}
          {(desktop ? ['camera'] : ['left', 'right']).map((side) => <div key={side} ref={side === 'camera' ? screen : undefined} className={side === 'camera' ? styles.cameraScreen : `${styles.curtain} ${styles[side]}`}
            onAnimationEnd={side === 'right' ? (event) => { if (event.target === event.currentTarget) dismiss(); } : undefined}>
            <div className={styles.halo} />
            <div className={styles.grid} />
            <div className={styles.flare} />
            <span className={styles.wordmark}>LATECH</span>
            <div className={styles.emblem}>
              <div className={styles.logo}>
                <Image src="/brand/latech-logo.webp" alt="" width={512} height={264} unoptimized loading="eager" />
                <div className={styles.logoShine} />
              </div>
              <span>Tu imaginación es nuestro límite.</span>
            </div>
            <span className={styles.coordinate}>DISEÑADO PARA DEJAR HUELLA.</span>
            <span className={styles.signature}>ESTUDIO DIGITAL / ESPAÑA</span>
            {desktop && <><div className={styles.tubeLines} /><div className={styles.tubeBeam} /><div className={styles.tubeVignette} /></>}
          </div>)}
          {!desktop && <div className={styles.cut} />}
        </div>
        {desktop && <div className={styles.preload} role="status"><i aria-hidden="true" /><span>{ready ? 'ENTRANDO EN EL ESTUDIO' : 'PREPARANDO LA EXPERIENCIA'}</span>{!ready && resources.total > 0 && <span aria-hidden="true">{resources.done} / {resources.total}</span>}</div>}
        <Dialog.Close className={styles.skip}>Saltar entrada <span aria-hidden>↗</span></Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
