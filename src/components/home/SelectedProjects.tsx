'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import styles from './SelectedProjects.module.css';
import { featuredProjects as projects } from './featured-projects';

export default function SelectedProjects() {
  const ref = useRef<HTMLElement>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [active, setActive] = useState(0);
  const [intro, setIntro] = useState(true);
  const firstProject = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // Explicit piecewise transforms keep the intro clamped when the viewport resizes.
  const upper = useTransform(() => `translateX(${-110 * Math.min(1, scrollYProgress.get() / .22)}%)`);
  const lower = useTransform(() => `translateX(${110 * Math.min(1, scrollYProgress.get() / .22)}%)`);
  const track = useTransform(() => `translateX(${-160 * Math.max(0, Math.min(1, (scrollYProgress.get() - .2) / .74))}vw)`);
  const reveal = useTransform(() => { const p = Math.min(1, scrollYProgress.get() / .2); return `perspective(1400px) rotateX(${16 * (1 - p)}deg) scale(${.8 + .2 * p})`; });
  const line = useTransform(scrollYProgress, [0, 1], ['scaleX(0)', 'scaleX(1)']);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 900px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)');
    const sync = () => setEnhanced(media.matches);
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  useMotionValueEvent(scrollYProgress, 'change', progress => {
    setActive(progress < .385 ? 0 : progress < .755 ? 1 : 2);
    setIntro(progress < .2);
  });

  function selectProject(index: number, keyboard = false) {
    const element = ref.current;
    if (!element) return;
    const start = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: start + Math.max(0, element.offsetHeight - window.innerHeight) * [.22, .57, .94][index], behavior: keyboard ? 'instant' : 'smooth' });
  }

  return <section ref={ref} id="proyectos" className={styles.section} data-enhanced={enhanced} aria-labelledby="work-heading">
    <div className={styles.sticky}>
      <div className={styles.topline} inert={enhanced && intro}><div><p className="eyebrow">01 / TRABAJO SELECCIONADO</p><h2 id="work-heading">No lo imagines. <span>Míralo.</span></h2></div><Link href="/proyectos" className="text-button">Todos los proyectos <ArrowUpRight size={17} /></Link></div>
      <motion.div className={styles.viewport} inert={enhanced && intro} style={{ transform: enhanced ? reveal : 'none' }}>
        <motion.div className={styles.track} style={{ transform: enhanced ? track : 'none' }}>
          {projects.map((project, index) => <article key={project.name} className={styles.project}>
            <a ref={index === 0 ? firstProject : undefined} href={project.url} target="_blank" rel="noopener noreferrer" className={styles.imageLink} tabIndex={enhanced && active !== index ? -1 : 0} aria-label={`Visitar ${project.name} en una pestaña nueva`}>
              <div className={styles.browserBar}><span><i /><i /><i /></span><span>{new URL(project.url).hostname}</span><ArrowUpRight size={13} /></div>
              <div className={styles.image}><Image src={project.image} alt={`Web de ${project.name}, proyecto de Latech`} fill sizes="(min-width: 900px) 74vw, 92vw" className="object-cover object-top" /></div>
              <span className={styles.visit}>Entrar en su mundo <ArrowUpRight size={20} /></span>
            </a>
            <div className={styles.caption}><div><p className="eyebrow">0{index + 1} / {project.category}</p><h3>{project.name}<span style={{ color: project.color }}>↗</span></h3></div><div><p>{project.caption}</p><span>{project.detail}</span></div></div>
          </article>)}
        </motion.div>
      </motion.div>
      {enhanced && <>
        <div className={styles.controls} inert={intro} aria-label="Seleccionar proyecto destacado">{projects.map((project, index) => <button type="button" key={project.name} onClick={event => selectProject(index, event.detail === 0)} aria-current={active === index ? 'true' : undefined}><span>0{index + 1}</span>{project.name}</button>)}<span className={styles.scrollLabel}>SIGUE EXPLORANDO <ArrowDown size={13} /></span></div>
        <div className={styles.progress} aria-hidden="true"><motion.div style={{ transform: line }} /></div>
        <div className={styles.shutters} aria-hidden="true"><motion.div className={styles.upper} style={{ transform: upper }}><span>FUERA</span></motion.div><motion.div className={styles.lower} style={{ transform: lower }}><span>DEL MOLDE<span className={styles.dot}>.</span></span><small>SCROLL PARA ROMPERLO ↘</small></motion.div></div>
        {intro && <button className={styles.skip} type="button" onClick={event => { const keyboard = event.detail === 0; selectProject(0, keyboard); if (keyboard) { setIntro(false); requestAnimationFrame(() => firstProject.current?.focus({ preventScroll: true })); } }}>Ver los proyectos <ArrowUpRight size={15} /></button>}
      </>}
    </div>
  </section>;
}
