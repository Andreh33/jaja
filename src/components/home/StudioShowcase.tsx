'use client';

import { useRef, useState, type RefObject } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { featuredProjects } from './featured-projects';
import styles from './StudioShowcase.module.css';

export default function StudioShowcase({ viewport, onOpen }: { viewport: RefObject<HTMLDivElement | null>; onOpen: (index: number) => void }) {
  const target = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(0);
  const project = featuredProjects[selected];
  const { scrollYProgress } = useScroll({ container: viewport, target, offset: ['start end', 'end start'] });
  const transform = useTransform(() => `translateY(${8 - scrollYProgress.get() * 16}px) scale(1.04)`);
  return <div ref={target} className={styles.showcase}>
    <div className={styles.caption}><span>DISEÑO EN EL MUNDO REAL</span><span>0{selected + 1} / 03</span></div>
    <div className={styles.choices} aria-label="Proyecto destacado en Studio">{featuredProjects.map((item, index) => <button type="button" key={item.name} aria-pressed={selected === index} onClick={() => setSelected(index)}>{item.name}</button>)}</div>
    <button type="button" className={styles.project} onClick={() => onOpen(selected)} aria-label={`Explorar ${project.name} en el navegador de Studio`}>
      <div className={styles.image}><motion.div style={{ transform }}><Image src={project.image} alt={`Diseño web de ${project.name}`} width={900} height={650} sizes="(max-width:767px) 400px, 750px" /></motion.div></div>
      <span className={styles.projectCaption}><span><strong>{project.name}</strong><small>{project.detail}</small></span><ArrowUpRight size={26} aria-hidden="true" /></span>
    </button>
    <p>Explora cada proyecto dentro de Studio. Todo, sin salir de aquí.</p>
  </div>;
}
