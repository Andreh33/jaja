'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, useScroll } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Braces, Maximize2, Pause, Play, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import { whatsappLink } from '@/lib/stripe-links';
import styles from './Hero.module.css';
import HeroPreview from './HeroPreview';
import PulseGrid from './PulseGrid';
import { useStudioExperience } from './useStudioExperience';
import StudioWindowHandle from './StudioWindowHandle';

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [blueprint, setBlueprint] = useState(false);
  const [pulsePaused, setPulsePaused] = useState(false);
  const studio = useStudioExperience();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 90, damping: 22 });
  const y = useSpring(pointerY, { stiffness: 90, damping: 22 });
  const lightTransform = useTransform(() => `translate3d(${x.get()}px, ${y.get()}px, 0)`);
  const objectTransform = useTransform(() => `perspective(1200px) rotateX(${y.get() * -.009}deg) rotateY(${x.get() * .009 - 12}deg) rotateZ(-5deg)`);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const backgroundTransform = useTransform(scrollYProgress, [0, 1], ['translateY(0px)', 'translateY(110px)']);
  const warmColor = useTransform(scrollYProgress, [0, .45, 1], ['#ff9853', '#ffd0a1', '#9ed6ff']);
  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (reduce || event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if ((event.target as HTMLElement).closest('[data-live-preview]')) { pointerX.set(0); pointerY.set(0); return; }
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(event.clientX - bounds.left - bounds.width / 2);
    pointerY.set(event.clientY - bounds.top - bounds.height / 2);
  }
  return (
    <section ref={ref} className={styles.hero} aria-labelledby="hero-title" onPointerMove={onPointerMove} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}>
      <motion.div className={styles.grid} aria-hidden="true" style={{ transform: backgroundTransform }}><PulseGrid paused={pulsePaused || studio.expanded} /></motion.div>
      <motion.div className={styles.light} aria-hidden="true" style={{ transform: lightTransform }} />
      <div className={`site-container ${styles.meta}`}><span>ESTUDIO DIGITAL INDEPENDIENTE</span><button type="button" className={styles.pulseControl} aria-label={pulsePaused ? 'Activar pulso de la cuadrícula' : 'Pausar pulso de la cuadrícula'} aria-pressed={!pulsePaused} onClick={() => setPulsePaused(value => !value)}>{pulsePaused ? <Play size={11} /> : <Pause size={11} />}<span>PULSO {pulsePaused ? 'OFF' : 'ON'}</span></button></div>
      <div className={`site-container ${styles.composition}`}>
        <div className={styles.copy}>
          <p className="eyebrow"><span className="status-dot" /> Tu próxima ventaja empieza aquí.</p>
          <h1 id="hero-title" className={styles.heading}><span className={styles.lead}>Diseño web.</span>{' '}Rompe{' '}<br /><motion.span style={{ color: warmColor }} className={styles.warm}>el molde<span className={styles.fullStop}>.</span></motion.span></h1>
          <p className={styles.description}>Tu negocio no nació para parecerse a los demás.<br className={styles.desktopBreak} /> Tu web tampoco. Diseño a medida, animaciones que<br className={styles.desktopBreak} /> sorprenden y una experiencia que deja huella.</p>
          <div className={styles.actions}>
            <Link href="/tienda/calculadora" className={styles.primary}>Vamos a crear algo <ArrowUpRight size={19} /></Link>
            <a href={whatsappLink('Hola, quiero una web fuera de lo normal')} className="text-button" target="_blank" rel="noopener noreferrer">Hablemos <ArrowUpRight size={17} /></a>
          </div>
        </div>
        <div className={styles.visual}>
          <div className={styles.visualCaption}><span>LA MISMA MARCA. OTRO MUNDO.</span><span>ENTRA EN LATECH STUDIO ↘</span></div>
          <div className={styles.orbitLines} aria-hidden="true"><i /><i /><i /></div>
          <motion.div className={`${styles.artwork} ${blueprint ? styles.blueprint : ''}`} style={{ transform: objectTransform }}>
            <div className={styles.backPlate} aria-hidden="true" /><div className={styles.middlePlate} aria-hidden="true" />
            <div className={styles.browser} onFocus={() => { pointerX.set(0); pointerY.set(0); }}><HeroPreview blueprint={blueprint} studio={studio} active={!studio.expanded} /></div>
            <div className={styles.codeTag} aria-hidden="true"><b>No es una imagen.</b><br />Toca. Explora. Haz clic.</div>
          </motion.div>
          <div className={styles.previewTools}>
            <button type="button" className={styles.viewToggle} aria-pressed={blueprint} onClick={() => setBlueprint(value => !value)}><Braces size={15} />{blueprint ? 'Volver al diseño' : 'Mira bajo la superficie'}<span>↗</span></button>
            <Dialog.Root open={studio.expanded} onOpenChange={studio.setExpanded}><Dialog.Trigger className={styles.expand} aria-label="Ampliar Latech Studio"><Maximize2 size={15} /></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className={styles.previewOverlay} /><Dialog.Content data-studio-window className={styles.previewDialog}><div className={styles.previewDialogHeader}><Dialog.Title>Latech Studio</Dialog.Title><StudioWindowHandle /><Dialog.Close aria-label="Volver a la web"><X size={19} /></Dialog.Close></div><Dialog.Description className="sr-only">Explora, crea tu marca y juega. La barra superior permite mover la ventana con el ratón o las flechas del teclado. Escape vuelve a la web.</Dialog.Description><HeroPreview blueprint={false} expanded studio={studio} /></Dialog.Content></Dialog.Portal></Dialog.Root>
          </div>
        </div>
      </div>
      <div className={`site-container ${styles.baseline}`}><a href="#proyectos"><ArrowDown size={17} /><span>HAZ SCROLL. SAL DEL MOLDE.</span></a><span>NI PLANTILLAS.<br />NI MEDIAS TINTAS.</span><span>WEB · ECOMMERCE · IA</span></div>
    </section>
  );
}
