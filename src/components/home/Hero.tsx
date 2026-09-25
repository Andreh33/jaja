'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Code2, Orbit } from 'lucide-react';
import Link from 'next/link';
import { whatsappLink } from '@/lib/stripe-links';

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const orbit = useTransform(scrollYProgress, [0, 1], ['rotate(-18deg) scale(1)', 'rotate(75deg) scale(0.78)']);
  const text = useTransform(scrollYProgress, [0, 1], ['translateY(0px)', 'translateY(100px)']);
  return (
    <section ref={ref} className="blue-hero" aria-labelledby="hero-title">
      <div className="hero-grid" aria-hidden="true" />
      <div className="site-container hero-meta"><span>ESTUDIO DIGITAL INDEPENDIENTE</span><span>ESPAÑA · SIN LÍMITES</span></div>
      <div className="site-container hero-composition">
        <motion.div className="hero-copy" style={{ transform: reduce ? 'none' : text }}>
          <p className="eyebrow"><span className="status-dot" /> Ideas ambiciosas. Código propio.</p>
          <h1 id="hero-title" className="hero-heading">Diseño web.{' '}<br />Fuera de{' '}<br /><span>lo normal.</span></h1>
          <p className="hero-description">Webs que se sienten. Tiendas que venden. IA que trabaja.<br className="hidden md:block" /> Llevamos tu negocio a un lugar donde las plantillas no llegan.</p>
          <div className="hero-actions">
            <Link href="/tienda/calculadora" className="blue-button">Construir mi proyecto <ArrowUpRight size={18} /></Link>
            <a href={whatsappLink('Hola, quiero una web fuera de lo normal')} className="text-button" target="_blank" rel="noopener noreferrer">Hablemos <ArrowUpRight size={17} /></a>
          </div>
        </motion.div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orbit-coordinate coordinate-top">LATECH / DIGITAL CORE</div>
          <motion.div className="orbital-scene" style={{ transform: reduce ? 'none' : orbit }}>
            <div className="orbital-halo" />
            <div className="orbital-ring ring-one" /><div className="orbital-ring ring-two" /><div className="orbital-ring ring-three" />
            <div className="orbital-core"><Code2 strokeWidth={1.1} /><span>LT<span className="core-dot">.</span></span></div>
            <div className="orbit-satellite satellite-one"><Orbit size={16} /> Next.js</div>
            <div className="orbit-satellite satellite-two">&lt;/&gt; CÓDIGO A MEDIDA</div>
            <div className="orbit-point point-one" /><div className="orbit-point point-two" />
          </motion.div>
          <div className="orbit-coordinate coordinate-bottom"><span>DISEÑO × TECNOLOGÍA</span><span>01 — ∞</span></div>
        </div>
      </div>
      <div className="site-container hero-baseline">
        <a href="#proyectos" className="scroll-invite"><ArrowDown size={16} /><span>BAJA. ESTO ACABA DE EMPEZAR.</span></a>
        <span>DESARROLLO A MEDIDA</span><span>SIN PERMANENCIA</span><span className="hero-baseline-last">CERO PLANTILLAS.</span>
      </div>
    </section>
  );
}
