'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, ArrowUpRight, Check, Download, Layers, Maximize2, Menu, Share2, X } from 'lucide-react';
import { whatsappLink } from '@/lib/stripe-links';
import { featuredProjects } from './featured-projects';
import { accents, directions, directionLabels, sectors, sectorCopy, studioBrief, studioHash, studioPages, type StudioPage } from './studio-model';
import type { StudioExperience } from './useStudioExperience';
import StudioSculpture from './StudioSculpture';
import styles from './HeroPreview.module.css';

const StudioGravity = dynamic(() => import('./StudioGravity'), { loading: () => <p className={styles.loading}>Preparando el escenario…</p> });
const projectStories = [
  ['Actitud en movimiento.', 'Una identidad directa, producto protagonista y un recorrido que invita a descubrir el catálogo.', 'Urbano', 'Producto', 'Ecommerce'],
  ['Toda la energía.', 'Un universo deportivo con el catálogo en primer plano y una presentación clara de sus especialidades.', 'Deporte', 'Catálogo', 'Identidad'],
  ['Primero entra por los ojos.', 'El sabor se convierte en lenguaje visual: una carta digital con personalidad y acceso a lo que importa.', 'Restauración', 'Carta digital', 'Marca'],
];
const services = [
  ['01', 'Webs con carácter.', 'Tu marca tiene algo que decir. Le damos una voz visual propia, una estructura clara y movimiento con intención.', '/tienda/web', 'Identidad · Animación · Experiencia móvil'],
  ['02', 'Tiendas que invitan.', 'Producto, confianza y una compra fácil de entender. Cuidamos el camino completo, desde descubrir hasta decidir.', '/tienda/online', 'Catálogo · Compra · Detalle de producto'],
  ['03', 'Más tiempo para ti.', 'Asistentes y automatizaciones que ayudan a atender consultas y simplificar tareas repetitivas de tu negocio.', '/tienda/agente-ia', 'Atención · Organización · Automatización'],
];

export default function HeroPreview({ blueprint, expanded = false, active = true, studio }: { blueprint: boolean; expanded?: boolean; active?: boolean; studio: StudioExperience }) {
  const id = useId();
  const { page, project, settings } = studio;
  const [menu, setMenu] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [liked, setLiked] = useState(false);
  const [status, setStatus] = useState('');
  const [exporting, setExporting] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [anatomy, setAnatomy] = useState(false);
  const [layer, setLayer] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const selected = featuredProjects[project];
  const copy = sectorCopy[settings.sector];

  useEffect(() => { viewport.current?.scrollTo({ top: 0, behavior: 'instant' }); }, [page]);

  function navigate(next: StudioPage, keyboardInput = false) {
    setKeyboard(keyboardInput); studio.navigate(next); setMenu(false); setStatus('');
    if (keyboardInput) requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  function back(keyboardInput: boolean) {
    setKeyboard(keyboardInput); studio.back(); setMenu(false);
    if (keyboardInput) requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  async function exportPoster() {
    setExporting(true); setStatus('Preparando tu póster…');
    try { const { downloadStudioPoster } = await import('./studio-poster'); await downloadStudioPoster(settings); setStatus('Tu póster está listo. Revisa las descargas.'); }
    catch { setStatus('No se pudo descargar. Puedes guardar el enlace de tu composición.'); }
    finally { setExporting(false); }
  }
  async function share() {
    const url = `${window.location.origin}/${studioHash(settings)}`;
    setShareUrl(url);
    try { await navigator.clipboard.writeText(url); setStatus('Enlace copiado. Quien lo abra verá esta composición.'); }
    catch { setStatus('Copia el enlace de abajo para compartir tu composición.'); }
  }
  const intro = (eyebrow: string, first: string, second: string) => <><p className={styles.eyebrow}>{eyebrow}</p><h3 ref={heading} tabIndex={-1} className={styles.compact}>{first}{' '}<br /><em>{second}</em></h3></>;

  return <div className={styles.preview} data-live-preview data-blueprint={blueprint} data-expanded={expanded} data-active={active} role="region" aria-label="Latech Studio, experiencia interactiva">
    <div className={styles.toolbar}>
      <button type="button" onClick={event => back(event.detail === 0)} disabled={!studio.history.length} aria-label="Atrás en Latech Studio"><ArrowLeft size={12} /></button>
      <span>latech / studio / {studioPages.find(item => item.id === page)?.label.toLowerCase()}</span>
      <span className={styles.live}><i /> INTERACTIVO</span>
    </div>
    <div className={styles.nav}>
      <button className={styles.brand} type="button" onClick={event => navigate('home', event.detail === 0)} aria-label="Inicio de Latech Studio"><Image src="/brand/latech-logo.webp" alt="" width={42} height={22} /><span>LATECH<small>STUDIO</small></span></button>
      <nav aria-label="Navegación de Latech Studio">{studioPages.slice(1, 3).map(item => <button key={item.id} type="button" onClick={event => navigate(item.id, event.detail === 0)} aria-current={page === item.id ? 'page' : undefined}>{item.label}</button>)}</nav>
      <button ref={menuButton} type="button" className={styles.menuButton} aria-label={menu ? 'Cerrar menú de Studio' : 'Abrir menú de Studio'} aria-expanded={menu} aria-controls={id} onClick={() => setMenu(value => !value)}>{menu ? <X size={16} /> : <Menu size={16} />}</button>
    </div>
    {menu && <nav id={id} aria-label="Todas las páginas de Latech Studio" className={styles.menu} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); setMenu(false); menuButton.current?.focus(); } }}>
      {studioPages.map((item, index) => <button type="button" key={item.id} aria-current={page === item.id ? 'page' : undefined} onClick={event => navigate(item.id, event.detail === 0)}><small>0{index + 1}</small>{item.label}<ArrowUpRight size={16} /></button>)}
    </nav>}
    <div ref={viewport} className={styles.screen} inert={menu || !active} tabIndex={0} aria-label="Contenido desplazable de Latech Studio">
      <div key={page} className={styles.content} data-keyboard={keyboard}>
        {page === 'home' && <>
          <p className={styles.eyebrow}>ESTO NO ES PARA MIRARLO DESDE FUERA.</p>
          <h3 ref={heading} tabIndex={-1}>Diseño que{' '}<br />se <em>siente.</em></h3>
          <p className={styles.copy}>Entra. Cambia las reglas. Pon tu marca aquí.{' '}<br />Esto es una pequeña muestra de lo que podemos crear contigo.</p>
          <div className={styles.actionRow}><button type="button" className={styles.cta} onClick={event => navigate('create', event.detail === 0)}>Hazlo tuyo <ArrowUpRight size={14} /></button><button type="button" className={styles.textLink} onClick={event => navigate('projects', event.detail === 0)}>Ver proyectos ↗</button></div>
          <StudioSculpture viewport={viewport} />
          <div className={styles.sectionTitle}><span>01 / TRABAJO REAL</span><button type="button" onClick={event => navigate('projects', event.detail === 0)}>Ver todos ↗</button></div>
          {featuredProjects.map((item, index) => <button key={item.name} className={styles.projectRow} type="button" onClick={event => { studio.setProject(index); navigate('projects', event.detail === 0); }}><Image src={item.image} alt="" width={150} height={100} sizes="100px" /><span><small>{item.category}</small><strong>{item.name}</strong></span><ArrowUpRight size={17} /></button>)}
          <button type="button" className={styles.labTeaser} onClick={event => navigate('play', event.detail === 0)}><span>02 / ENSAYO SIN LÍMITES</span><strong>Aquí, ni la gravedad{' '}<br />es obligatoria.</strong><span>Entra al laboratorio <ArrowUpRight size={16} /></span></button>
          <div className={styles.manifesto}><span>BUEN DISEÑO.</span><span>BUENAS IDEAS.</span><em>CERO INDIFERENCIA.</em></div>
        </>}
        {page === 'projects' && <>
          {intro('TRES MARCAS. TRES FORMAS DE SENTIR.', 'No lo imagines.', 'Míralo.')}
          <div className={styles.projectTabs} aria-label="Elegir proyecto en Studio">{featuredProjects.map((item,index) => <button type="button" key={item.name} aria-pressed={project === index} onClick={() => studio.setProject(index)}>{item.name}</button>)}</div>
          <div className={styles.projectWorld} data-world={project}>
            <div className={styles.worldHeading}><span>0{project + 1} / {selected.category}</span><strong>{selected.name}</strong><i aria-hidden="true">↗</i></div>
            <a className={styles.feature} href={selected.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir la web de ${selected.name} en otra pestaña`}><Image src={selected.image} alt={`Vista de ${selected.name}`} width={800} height={500} sizes="(max-width: 767px) 350px, 650px" /><span>Explorar la web real <ArrowUpRight size={17} /></span></a>
            <h4>{projectStories[project][0]}</h4><p>{projectStories[project][1]}</p>
            <div className={styles.tags}>{projectStories[project].slice(2).map(tag => <span key={tag}>{tag}</span>)}</div>
          </div>
          <p className={styles.copy}>Un mismo cuidado por el detalle. Una dirección distinta para cada negocio.</p>
          <Link className={styles.textLink} href="/proyectos">El portfolio completo <ArrowUpRight size={13} /></Link>
          <button type="button" className={styles.cta} onClick={event => navigate('create', event.detail === 0)}>Ahora imagina tu marca <ArrowUpRight size={13} /></button>
        </>}
        {page === 'create' && <>
          {intro('LA DIRECCIÓN CREATIVA, EN TUS MANOS.', 'Tu nombre.', 'Otra dimensión.')}
          <p className={styles.copy}>Prueba una dirección, cambia su carácter y llévate un póster. Es un concepto interactivo, no el diseño definitivo de tu web.</p>
          <div className={styles.creatorWorkspace}><div className={styles.creatorControls}>
            <label htmlFor={`${id}-name`}>01 / NOMBRE DE TU MARCA<input id={`${id}-name`} maxLength={36} value={settings.name} placeholder="Tu próxima gran idea" autoComplete="off" onChange={event => { studio.setSettings(value => ({ ...value, name: event.target.value })); setShareUrl(''); }} /></label>
            <label htmlFor={`${id}-sector`}>02 / TU MUNDO<select id={`${id}-sector`} value={settings.sector} onChange={event => { studio.setSettings(value => ({ ...value, sector: event.target.value as typeof value.sector })); setShareUrl(''); }}>{sectors.map(sector => <option key={sector}>{sector}</option>)}</select></label>
            <fieldset><legend>03 / CARÁCTER</legend><div className={styles.directionPicker}>{directions.map(direction => <button type="button" key={direction} aria-pressed={settings.direction === direction} onClick={() => { studio.setSettings(value => ({ ...value, direction })); setShareUrl(''); }}>{directionLabels[direction]}</button>)}</div></fieldset>
            <fieldset><legend>04 / ACENTO</legend><div className={styles.colorPicker}>{(Object.keys(accents) as (keyof typeof accents)[]).map(accent => <button type="button" key={accent} style={{ background: accents[accent] }} aria-label={`Acento ${accent === 'blue' ? 'azul' : accent === 'orange' ? 'naranja' : 'tinta'}`} aria-pressed={settings.accent === accent} onClick={() => { studio.setSettings(value => ({ ...value, accent })); setShareUrl(''); }}>{settings.accent === accent && <Check size={15} />}</button>)}</div></fieldset>
          </div>
          <div className={styles.brandConcept} data-direction={settings.direction} data-anatomy={anatomy} style={{ '--studio-accent': accents[settings.accent] } as CSSProperties}>
            <div className={styles.conceptNav}><strong>{settings.name || 'TU MARCA'}</strong><span>{settings.sector}</span></div>
            <div className={styles.conceptHero}><small>HECHO PARA DEJAR HUELLA.</small><h4>{copy[0]}{' '}<br /><em>{copy[1]}</em></h4><p>{copy[2]}</p><a href={whatsappLink(studioBrief(settings))} target="_blank" rel="noopener noreferrer">Hagámoslo real <ArrowUpRight size={14} /></a><div className={styles.conceptShape} aria-hidden="true"><i /><i /><i /></div></div>
            <div className={styles.conceptFoot}><span>UNA VOZ PROPIA.</span><span>{directionLabels[settings.direction].toUpperCase()} ↗</span></div>
          </div></div>
          <button className={styles.textLink} type="button" aria-pressed={anatomy} onClick={() => setAnatomy(value => !value)}><Layers size={14} />{anatomy ? 'Cerrar radiografía' : 'Ver la radiografía del diseño'}</button>
          {anatomy && <div className={styles.anatomy}><div className={styles.directionPicker}>{['Jerarquía', 'Carácter', 'Acción'].map((label, i) => <button key={label} type="button" aria-pressed={layer === i} onClick={() => setLayer(i)}>{label}</button>)}</div><p>{['Primero tu mensaje, después los detalles. El tamaño y el espacio ordenan la mirada sin pedir esfuerzo.', 'Tipografía, composición y color construyen una personalidad. No todo negocio debe hablar con la misma voz.', 'La invitación a hablar aparece después de entender la propuesta. Una acción clara, sin competir con diez botones.'][layer]}</p></div>}
          <div className={styles.exportRow}><button type="button" onClick={exportPoster} disabled={exporting}><Download size={15} />{exporting ? 'Creando…' : 'Guardar póster'}</button><button type="button" onClick={share}><Share2 size={15} />Copiar enlace</button></div>
          <p className={styles.note} role="status">{status || 'Tus cambios se quedan en este navegador. Solo se comparten cuando tú copias el enlace.'}</p>
          {shareUrl && <label className={styles.shareField}>Enlace de tu composición<input readOnly value={shareUrl} onFocus={event => event.currentTarget.select()} /></label>}
          <a className={styles.cta} href={whatsappLink(studioBrief(settings))} target="_blank" rel="noopener noreferrer">Quiero desarrollar esta idea <ArrowUpRight size={14} /></a>
        </>}
        {page === 'play' && <>
          {intro('LAS REGLAS TAMBIÉN SE DISEÑAN.', '¿Y si quitamos', 'la gravedad?')}
          <p className={styles.copy}>Mueve las piezas, aplica un impulso o devuelve la gravedad. Nada se rompe: puedes recomponerlo cuando quieras.</p>
          <StudioGravity active={active && !menu} />
          {!expanded && <button type="button" className={styles.textLink} onClick={() => studio.setExpanded(true)}><Maximize2 size={14} />Jugar a lo grande</button>}
          <div className={styles.sectionTitle}><span>EL LABORATORIO CONTINÚA</span></div>
          <Link className={styles.gameLink} href="/lab/rank-rush"><span>01</span><div><strong>Rank Rush</strong><p>Ritmo, presión y una carrera hasta arriba.</p></div><ArrowUpRight size={18} /></Link>
          <Link className={styles.gameLink} href="/lab"><span>02</span><div><strong>Más experimentos</strong><p>Juegos y experiencias para tocar, no solo mirar.</p></div><ArrowUpRight size={18} /></Link>
        </>}
        {page === 'services' && <>
          {intro('TU IDEA. BIEN HECHA.', 'Mucho más', 'que bonito.')}
          {services.map(([number,title,description,href,tags]) => <Link key={href} className={styles.service} href={href}><small>{number}</small><div><h4>{title}</h4><p>{description}</p><span>{tags}</span></div><ArrowUpRight size={16} /></Link>)}
          <div className={styles.priceNote}><span>CREACIÓN DE TU WEB</span><strong>Desde 800 €</strong><p>Mantenimiento aparte · IVA no incluido.<br />Configura las opciones y revisa el total antes de decidir.</p><Link href="/tienda/calculadora">Configurar mi proyecto <ArrowUpRight size={14} /></Link></div>
        </>}
        {page === 'studio' && <>
          {intro('CUIDAMOS LO QUE OTROS DAN POR TERMINADO.', 'Cerca de ti.', 'Lejos de lo normal.')}
          <p className={styles.copy}>Escuchamos tu idea, cuestionamos lo obvio y damos forma a una experiencia con personalidad. Desde Badajoz, para marcas de toda España.</p>
          <ol className={styles.process}>{[['Entender tu mundo.', 'Tu negocio, tus clientes y qué quieres cambiar.'], ['Diseñar tu diferencia.', 'Una dirección visual que tenga sentido para tu marca.'], ['Darle vida.', 'Interacciones, contenido y detalle, también en móvil.'], ['Seguir a tu lado.', 'Publicación, mantenimiento y próximos pasos.']].map(([title,description]) => <li key={title}><strong>{title}</strong><p>{description}</p></li>)}</ol>
          <blockquote className={styles.quote}>La diferencia está en todo lo que se siente, aunque no sepas ponerle nombre.</blockquote>
          <button type="button" className={styles.reaction} aria-pressed={liked} onClick={() => setLiked(value => !value)}>{liked ? '♥ Nos gusta tu actitud.' : '♡ Esto sí va conmigo.'}</button>
          <Link className={styles.textLink} href="/sobre-nosotros">Conoce al equipo <ArrowUpRight size={13} /></Link>
        </>}
        {page === 'contact' && <>
          {intro('DE LA PRUEBA A TU PRÓXIMO PROYECTO.', 'Vamos a', 'hacerlo real.')}
          <p className={styles.copy}>Una marca con personalidad empieza con una buena conversación. Cuéntanos qué quieres crear, para quién y qué debería sentirse al entrar.</p>
          {settings.name && <div className={styles.ideaReceipt}><small>LA IDEA QUE HAS EXPLORADO</small><strong>{settings.name}</strong><span>{settings.sector} · {directionLabels[settings.direction]}</span><button type="button" onClick={event => navigate('create', event.detail === 0)}>Seguir dándole forma ↗</button></div>}
          <a href={whatsappLink(studioBrief(settings))} className={styles.cta} target="_blank" rel="noopener noreferrer">Contaros mi idea <ArrowUpRight size={14} /></a>
          <Link href="/tienda/calculadora" className={styles.textLink}>Prefiero calcular mi proyecto <ArrowUpRight size={13} /></Link>
          <Link href="/contacto" className={styles.textLink}>Ver todas las formas de contacto <ArrowUpRight size={13} /></Link>
          <div className={styles.contactNotes}><p><Check size={14} /> Conversación directa con el equipo.</p><p><Check size={14} /> Alcance y precio claros antes de empezar.</p><p><Check size={14} /> Una dirección propia para tu negocio.</p></div>
        </>}
        <div className={styles.studioFooter}><span>LATECH<small>STUDIO / HECHO PARA EXPLORAR</small></span><button type="button" onClick={event => navigate('contact', event.detail === 0)}>Hablemos ↗</button></div>
      </div>
    </div>
  </div>;
}
