'use client';
/* eslint-disable @next/next/no-img-element -- In-memory photo, never a public URL. */
import {useEffect, useState} from 'react';
import styles from './TvPhotoScreen.module.css';

export default function TvPhotoScreen({photo, onClose}: {photo: {src: string; until: number}; onClose: () => void}) {
  const [seconds, setSeconds] = useState(60);
  useEffect(() => {
    const update = () => setSeconds(Math.max(0, Math.ceil((photo.until - Date.now()) / 1000)));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [photo.until]);
  return <section className={styles.screen} aria-label="Foto temporal en Latech TV">
    <img className={styles.photo} src={photo.src} alt="Foto que has enviado desde tu móvil" />
    <header><span>REC ● / VUESTRO MOMENTO</span><button onClick={onClose} aria-label="Quitar foto temporal">×</button></header>
    <footer>
      <img className={styles.camera} src="/arcade/instagram-classic.webp" alt="Instagram clásico" />
      <div><small>TU IMAGINACIÓN ES NUESTRO LÍMITE.</small><h3>Súbenos a Instagram.</h3><p>Haz una foto de la tele y comparte el momento.</p></div>
      <img className={styles.brandLogo} src="/brand/latech-logo.webp" alt="Latech" />
    </footer>
    <span className={styles.timer}>TEMPORAL · {seconds} S</span>
  </section>;
}
