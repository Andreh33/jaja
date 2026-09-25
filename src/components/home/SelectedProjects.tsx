'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '../effects/Reveal';

const projects = [
  { name: 'Panelex', category: 'INDUSTRIA · ESTRATEGIA DIGITAL', image: '/proyectos/panelex.webp', url: 'https://panelexpanelsandwich.com/', caption: 'La industria también puede tener una presencia extraordinaria.', color: '#8bbce7' },
  { name: 'Zona Sport', category: 'RETAIL · CATÁLOGO ONLINE', image: '/proyectos/zonasport.jpg', url: 'https://zonasport.vercel.app/', caption: 'Toda la energía del deporte, llevada a la pantalla.', color: '#c1ddff' },
  { name: 'Toldos Noa', category: 'SERVICIOS · CAPTACIÓN', image: '/proyectos/toldos-noa.png', url: 'https://toldosnoa.com/', caption: 'Una web que acerca cada proyecto a su próximo cliente.', color: '#559cff' },
];

function Project({ project, index }: { project: typeof projects[number]; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const transform = useTransform(scrollYProgress, [0, 0.48, 1], ['perspective(1400px) rotateX(12deg) scale(0.94)', 'perspective(1400px) rotateX(0deg) scale(1)', 'perspective(1400px) rotateX(-3deg) scale(0.97)']);
  const imageTransform = useTransform(scrollYProgress, [0, 1], ['translateY(0%) scale(1.03)', 'translateY(-8%) scale(1.03)']);
  return <motion.article ref={ref} className="selected-project" style={{ transform: reduce ? 'none' : transform }}>
    <a href={project.url} target="_blank" rel="noopener noreferrer" className="project-image-link" aria-label={`Visitar ${project.name} en una pestaña nueva`}>
      <div className="project-browser-bar"><span><i /><i /><i /></span><span>{new URL(project.url).hostname}</span><ArrowUpRight size={14} /></div>
      <div className="project-image-viewport"><motion.div className="project-image-inner" style={{ transform: reduce ? 'none' : imageTransform }}><Image src={project.image} alt={`Diseño de la web de ${project.name}`} fill sizes="(max-width: 767px) 92vw, 78vw" className="object-cover object-top" /></motion.div></div>
      <span className="project-visit">Explorar proyecto <ArrowUpRight size={20} /></span>
    </a>
    <div className="project-caption"><div><span className="eyebrow">0{index + 1} / {project.category}</span><h3>{project.name}<span style={{ color: project.color }}>.</span></h3></div><p>{project.caption}</p></div>
  </motion.article>;
}

export default function SelectedProjects() {
  return <section id="proyectos" className="selected-work section-space"><div className="site-container">
    <Reveal className="section-heading"><div><p className="eyebrow">01 / TRABAJO SELECCIONADO</p><h2>Menos promesas.<br /><span className="muted-heading">Más «¿quién hizo esto?»</span></h2></div><Link href="/proyectos" className="text-button">Todos los proyectos <ArrowUpRight size={18} /></Link></Reveal>
    <div className="selected-projects">{projects.map((project, index) => <Project key={project.name} project={project} index={index} />)}</div>
  </div></section>;
}
