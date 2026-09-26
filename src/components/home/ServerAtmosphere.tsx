'use client';

import { useEffect, useRef } from 'react';
import { SERVER_POSTER, serverVideoSource } from './server-atmosphere';
import styles from './ServerAtmosphere.module.css';

/** A decorative, first-party film. Never gates navigation or downloads on reduced motion. */
export default function ServerAtmosphere({ paused }: { paused: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const pauseRequested = useRef(paused);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let inView = false;
    let disposed = false;
    let failed = false;
    const sync = () => {
      const shouldPlay = inView && !document.hidden && !pauseRequested.current && !reduce.matches && !connection?.saveData && !failed;
      if (!shouldPlay) { element.pause(); return; }
      if (!element.getAttribute('src')) {
        const source = serverVideoSource(window.innerWidth, window.devicePixelRatio, connection?.saveData, reduce.matches);
        if (!source) return;
        element.src = source;
      }
      void element.play().then(() => {
        if (disposed || !inView || document.hidden || pauseRequested.current || reduce.matches) element.pause();
      }).catch(() => { /* Browser policy or network: keep the poster, never block the hero. */ });
    };
    const ready = () => { if (!disposed) element.dataset.ready = 'true'; };
    const fail = () => { failed = true; element.dataset.ready = 'false'; element.pause(); };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
    observer.observe(element);
    element.addEventListener('playing', ready);
    element.addEventListener('error', fail);
    element.addEventListener('atmosphere-pause-change', sync);
    document.addEventListener('visibilitychange', sync);
    reduce.addEventListener('change', sync);
    return () => {
      disposed = true; observer.disconnect(); element.pause();
      element.removeEventListener('playing', ready);
      element.removeEventListener('error', fail);
      element.removeEventListener('atmosphere-pause-change', sync);
      document.removeEventListener('visibilitychange', sync);
      reduce.removeEventListener('change', sync);
      element.removeAttribute('src'); element.load();
    };
  }, []);

  useEffect(() => {
    pauseRequested.current = paused;
    video.current?.dispatchEvent(new Event('atmosphere-pause-change'));
  }, [paused]);

  return <div className={styles.atmosphere} aria-hidden="true" data-server-atmosphere>
    <div className={styles.film}>
      <video ref={video} data-hero-server-video className={styles.video} poster={SERVER_POSTER}
        width={3840} height={2160} muted loop playsInline preload="metadata" disablePictureInPicture tabIndex={-1} />
    </div>
    <div className={styles.shade} />
  </div>;
}
