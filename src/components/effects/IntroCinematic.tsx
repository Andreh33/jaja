'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import styles from './IntroCinematic.module.css';

const SEEN_KEY = 'latech-brand-opening-v2';

/** A first-visit brand opening, never a fake loading screen. Content is SSR-visible. */
export default function IntroCinematic() {
  const [show, setShow] = useState(false);
  const dismiss = useCallback(() => setShow(false), []);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || window.location.hash || window.scrollY > 20) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
    } catch { return; }
    const frame = requestAnimationFrame(() => {
      try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { return; }
      setShow(true);
    });
    const timeout = setTimeout(dismiss, 1800);
    const changed = () => { if (preference.matches) dismiss(); };
    preference.addEventListener('change', changed);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
      preference.removeEventListener('change', changed);
    };
  }, [dismiss]);

  return <Dialog.Root open={show} onOpenChange={(open) => { if (!open) dismiss(); }}>
    <Dialog.Portal>
      <Dialog.Content className={styles.opening} onCloseAutoFocus={(event) => {
        event.preventDefault();
        document.getElementById('main-content')?.focus({ preventScroll: true });
      }}>
        <Dialog.Title className="sr-only">Latech. Fuera del molde.</Dialog.Title>
        <Dialog.Description className="sr-only">Una breve presentación de nuestra marca. Puedes saltarla o pulsar Escape.</Dialog.Description>
        <div className={styles.stage} aria-hidden="true">
          {['left', 'right'].map((side) => <div key={side} className={`${styles.curtain} ${styles[side]}`}
            onAnimationEnd={side === 'right' ? (event) => { if (event.target === event.currentTarget) dismiss(); } : undefined}>
            <div className={styles.grid} />
            <span className={styles.wordmark}>LATECH</span>
            <div className={styles.emblem}><Image src="/brand/latech-logo.webp" alt="" width={512} height={264} unoptimized loading="eager" /><span>FUERA DEL MOLDE.</span></div>
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
