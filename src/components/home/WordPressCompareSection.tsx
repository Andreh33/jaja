'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Check, Code2, Puzzle, X } from 'lucide-react';
import Link from 'next/link';

function Plugin({ label, index, progress }: { label: string; index: number; progress: ReturnType<typeof useScroll>['scrollYProgress'] }) {
  const reduce = useReducedMotion();
  const direction = index % 2 ? 1 : -1;
  const transform = useTransform(progress, [0, 0.3, 0.85], [`translate(${direction * 25}px, 0px) rotate(${direction * 3}deg)`, `translate(${direction * 10}px, 0px) rotate(0deg)`, `translate(${direction * (160 + index * 24)}px, ${index * 25 - 30}px) rotate(${direction * 28}deg)`]);
  const opacity = useTransform(progress, [0, 0.45, 0.85], [1, 1, 0.1]);
  return <motion.div className={`plugin-card plugin-${index}`} style={{ transform: reduce ? undefined : transform, opacity: reduce ? 0.65 : opacity }}><Puzzle size={16} /><span>{label}</span><X size={13} /></motion.div>;
}

export default function WordPressCompareSection() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const core = useTransform(scrollYProgress, [0, 0.45, 0.8], ['scale(0.75) rotate(-10deg)', 'scale(1) rotate(0deg)', 'scale(1.12) rotate(5deg)']);
  return <section ref={ref} className="wordpress-battle" id="sin-wordpress">
    <div className="battle-sticky site-container">
      <div className="battle-copy"><p className="eyebrow">02 / DECLARACIÓN DE INDEPENDENCIA</p><h2>Tu negocio<br />no es<br /><span>un plugin.</span></h2><p>WordPress tiene su sitio.<br /><strong>Tu ambición merece el suyo.</strong></p><p className="battle-description">Diseñamos y programamos a medida con Next.js. Sin pelear con una plantilla, sin encadenar plugins para conseguir lo que imaginaste.</p><Link href="/tienda/calculadora" className="text-button">Me paso al otro lado <ArrowUpRight size={18} /></Link></div>
      <div className="battle-stage" aria-hidden="true"><div className="battle-orbit" /><div className="battle-orbit orbit-inner" /><span className="battle-old-mark">W</span>{['Constructor visual', 'Plugin del plugin', 'Otra licencia', 'Tema premium', 'Más dependencias', 'Un parche más'].map((label, index) => <Plugin key={label} label={label} index={index} progress={scrollYProgress} />)}<motion.div className="battle-core" style={{ transform: reduce ? undefined : core }}><Code2 size={48} strokeWidth={1} /><span>LATECH</span><small>CÓDIGO PROPIO. LIBERTAD REAL.</small></motion.div><div className="battle-stamp">BUILT DIFFERENT.</div></div>
      <div className="battle-facts"><p><Check size={16} /> Diseño sin límites de plantilla</p><p><Check size={16} /> Solo el código que necesitas</p><p><Check size={16} /> Evolución a medida</p><p><Check size={16} /> Un equipo que responde</p></div>
    </div>
  </section>;
}
