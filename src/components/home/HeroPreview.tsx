'use client';

import { useId, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Menu, X } from 'lucide-react';
import { featuredProjects } from './featured-projects';
import styles from './HeroPreview.module.css';

const pages = [
  { id: 'home', label: 'Inicio' }, { id: 'projects', label: 'Proyectos' },
  { id: 'services', label: 'Servicios' }, { id: 'studio', label: 'Estudio' },
  { id: 'contact', label: 'Hablemos' },
] as const;
type PreviewPage = (typeof pages)[number]['id'];

/** An isolated, usable light edition; no iframe, recursion, or duplicate game engines. */
export default function HeroPreview({ blueprint, expanded = false }: { blueprint: boolean; expanded?: boolean }) {
  const menuId = useId();
  const [page, setPage] = useState<PreviewPage>('home');
  const [menu, setMenu] = useState(false);
  const [project, setProject] = useState(0);
  const [liked, setLiked] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [history, setHistory] = useState<PreviewPage[]>([]);
  const viewport = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const selected = featuredProjects[project];

  function navigate(next: PreviewPage, keyboard = false) {
    setKeyboardNavigation(keyboard);
    if (next !== page) { setHistory(previous => [...previous, page]); setPage(next); }
    setMenu(false);
    viewport.current?.scrollTo({ top: 0, behavior: 'instant' });
    if (keyboard) requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  function back() {
    const previous = history.at(-1);
    if (!previous) return;
    setHistory(history.slice(0, -1)); setPage(previous); setMenu(false);
    viewport.current?.scrollTo({ top: 0, behavior: 'instant' });
  }

  return <div className={styles.preview} data-live-preview data-blueprint={blueprint} data-expanded={expanded} role="region" aria-label="Miniweb interactiva de Latech, edición clara">
    <div className={styles.toolbar}>
      <button type="button" onClick={back} disabled={!history.length} aria-label="Atrás en la miniweb"><ArrowLeft size={12} /></button>
      <span>latech / {pages.find(item => item.id === page)?.label.toLowerCase()}</span>
      <span className={styles.live}><i /> EN VIVO</span>
    </div>
    <div className={styles.nav}>
      <button className={styles.brand} type="button" onClick={event => navigate('home', event.detail === 0)} aria-label="Inicio de la miniweb"><Image src="/brand/latech-logo.webp" alt="" width={42} height={22} /><span>LATECH</span></button>
      <nav aria-label="Navegación de la miniweb">{pages.slice(1, 3).map(item => <button key={item.id} type="button" onClick={event => navigate(item.id, event.detail === 0)} aria-current={page === item.id ? 'page' : undefined}>{item.label}</button>)}</nav>
      <button ref={menuButton} type="button" className={styles.menuButton} aria-label={menu ? 'Cerrar menú de la miniweb' : 'Abrir menú de la miniweb'} aria-expanded={menu} aria-controls={menuId} onClick={() => setMenu(value => !value)}>{menu ? <X size={14} /> : <Menu size={14} />}</button>
    </div>
    {menu && <nav id={menuId} aria-label="Todas las páginas de la miniweb" className={styles.menu} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); setMenu(false); menuButton.current?.focus(); } }}>
      {pages.map((item, index) => <button type="button" key={item.id} onClick={event => navigate(item.id, event.detail === 0)}><small>0{index + 1}</small>{item.label}<ArrowUpRight size={14} /></button>)}
    </nav>}
    <div ref={viewport} className={styles.screen} inert={menu} tabIndex={0} aria-label="Contenido desplazable de la miniweb">
      <div key={page} className={styles.content} data-keyboard={keyboardNavigation}>
        {page === 'home' && <>
          <p className={styles.eyebrow}>UNA MARCA. OTRA PERSPECTIVA.</p>
          <h3 ref={heading} tabIndex={-1}>Rompe<br />el <em>molde.</em></h3>
          <p className={styles.copy}>Diseño que se siente.<br />Experiencias que se recuerdan.</p>
          <button type="button" className={styles.cta} onClick={event => navigate('projects', event.detail === 0)}>Mira lo que hacemos <ArrowUpRight size={13} /></button>
          <div className={styles.sculpture} aria-hidden="true"><i /><i /><i /><i /><span>IDEAS<br />SIN MOLDE.</span></div>
          <div className={styles.sectionTitle}><span>TRABAJO REAL</span><button type="button" onClick={event => navigate('projects', event.detail === 0)}>Explorar ↗</button></div>
          <button className={styles.feature} type="button" onClick={event => navigate('projects', event.detail === 0)}><Image src={featuredProjects[0].image} alt="Vista de la web de Monkey" width={480} height={270} sizes="(max-width: 767px) 260px, 400px" /><span>Monkey <ArrowUpRight size={17} /></span></button>
          <p className={styles.note}>Sí, puedes navegar aquí dentro.</p>
        </>}
        {page === 'projects' && <>
          <p className={styles.eyebrow}>DISEÑO QUE YA ESTÁ AHÍ FUERA.</p><h3 ref={heading} tabIndex={-1} className={styles.compact}>No lo imagines.<br /><em>Míralo.</em></h3>
          <div className={styles.projectTabs} aria-label="Elegir proyecto en la miniweb">{featuredProjects.map((item,index) => <button type="button" key={item.name} aria-pressed={project === index} onClick={() => setProject(index)}>{item.name}</button>)}</div>
          <a className={styles.feature} href={selected.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir la web de ${selected.name} en otra pestaña`}><Image src={selected.image} alt={`Vista de ${selected.name}`} width={480} height={270} sizes="(max-width: 767px) 260px, 400px" /><span>{selected.name}<ArrowUpRight size={17} /></span></a>
          <p className={styles.copy}>{selected.caption}</p><p className={styles.note}>{selected.detail}</p>
          <Link className={styles.textLink} href="/proyectos">Ver el portfolio completo <ArrowUpRight size={13} /></Link>
        </>}
        {page === 'services' && <>
          <p className={styles.eyebrow}>TU IDEA. BIEN HECHA.</p><h3 ref={heading} tabIndex={-1} className={styles.compact}>Mucho más<br />que <em>bonito.</em></h3>
          {[['01','Webs con carácter.','Identidad, movimiento y cada detalle a medida.','/tienda/web'],['02','Tiendas que invitan.','Del primer vistazo al último paso de la compra.','/tienda/online'],['03','Tiempo para ti.','Asistentes que atienden y simplifican tareas.','/tienda/agente-ia']].map(([number,title,copy,href]) => <Link key={href} className={styles.service} href={href}><small>{number}</small><div><h4>{title}</h4><p>{copy}</p></div><ArrowUpRight size={14} /></Link>)}
          <button type="button" className={styles.cta} onClick={event => navigate('contact', event.detail === 0)}>Hablemos de tu idea <ArrowUpRight size={13} /></button>
        </>}
        {page === 'studio' && <>
          <p className={styles.eyebrow}>UN EQUIPO. MUCHAS POSIBILIDADES.</p><h3 ref={heading} tabIndex={-1} className={styles.compact}>Cerca de ti.<br /><em>Lejos de lo normal.</em></h3><p className={styles.copy}>Escuchamos tu idea, cuestionamos lo obvio y cuidamos lo que otros dan por terminado. Desde Badajoz, para marcas de toda España.</p>
          <ol className={styles.process}><li>Entender tu mundo.</li><li>Diseñar tu diferencia.</li><li>Darle vida.</li><li>Seguir a tu lado.</li></ol>
          <button type="button" className={styles.reaction} aria-pressed={liked} onClick={() => setLiked(value => !value)}>{liked ? '♥ Nos gusta tu actitud.' : '♡ Esto sí va conmigo.'}</button>
          <Link className={styles.textLink} href="/sobre-nosotros">Conoce al equipo <ArrowUpRight size={13} /></Link>
        </>}
        {page === 'contact' && <>
          <p className={styles.eyebrow}>EL SIGUIENTE PASO ES TUYO.</p><h3 ref={heading} tabIndex={-1} className={styles.compact}>Vamos a<br /><em>hacerlo real.</em></h3><p className={styles.copy}>Una web con personalidad empieza con una buena conversación. Cuéntanos qué tienes en mente.</p>
          <Link href="/tienda/calculadora" className={styles.cta}>Calcular mi proyecto <ArrowUpRight size={13} /></Link><Link href="/contacto" className={styles.textLink}>Prefiero hablar con vosotros <ArrowUpRight size={13} /></Link>
          <p className={styles.note}>Elige cómo empezar: presupuesto o conversación. Los enlaces te llevan a nuestros servicios reales.</p>
        </>}
        <div className={styles.miniFooter}><span>LATECH</span><button type="button" onClick={event => navigate('contact', event.detail === 0)}>Tu idea empieza aquí ↗</button></div>
      </div>
    </div>
  </div>;
}
