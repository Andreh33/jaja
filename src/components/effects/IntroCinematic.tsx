'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import styles from './IntroCinematic.module.css';

const SEEN_KEY = 'latech-brand-opening-v3';
const OPENING_DURATION_MS = 2500;

/** A first-visit brand opening, never a fake loading screen. Content is SSR-visible. */
export default function IntroCinematic() {
  const [show, setShow] = useState(false);
  const dismiss = useCallback(() => setShow(false), []);

  useEffect(() => {
    if (window.location.hash || window.scrollY > 20) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
    } catch { return; }
    const frame = requestAnimationFrame(() => {
      try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { return; }
      setShow(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Start the safety deadline only after the dialog mounts, not during hydration.
  useEffect(() => {
    if (!show) return;
    const timeout = setTimeout(dismiss, OPENING_DURATION_MS + 300);
    return () => clearTimeout(timeout);
  }, [show, dismiss]);

  return <Dialog.Root open={show} onOpenChange={(open) => { if (!open) dismiss(); }}>
    <Dialog.Portal>
      <Dialog.Content className={styles.opening} style={{ '--opening-duration': `${OPENING_DURATION_MS}ms` } as CSSProperties} onCloseAutoFocus={(event) => {
        event.preventDefault();
        document.getElementById('main-content')?.focus({ preventScroll: true });
      }}>
        <Dialog.Title className="sr-only">Latech. Tu imaginación es nuestro límite.</Dialog.Title>
        <Dialog.Description className="sr-only">Una breve presentación de nuestra marca. Puedes saltarla o pulsar Escape.</Dialog.Description>
        <div className={styles.stage} aria-hidden="true">
          {['left', 'right'].map((side) => <div key={side} className={`${styles.curtain} ${styles[side]}`}
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
          </div>)}
          <div className={styles.cut} />
        </div>
        <Dialog.Close className={styles.skip}>Saltar entrada <span aria-hidden>↗</span></Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
