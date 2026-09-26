'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Globe2, Maximize2, RotateCcw } from 'lucide-react';
import { featuredProjects } from './featured-projects';
import { studioBrowserProject } from './studio-browser-model';
import styles from './StudioBrowser.module.css';

export default function StudioBrowser({ project, active, expanded, onProject, onClose, onExpand }: {
  project: number;
  active: boolean;
  expanded: boolean;
  onProject: (project: number) => void;
  onClose: () => void;
  onExpand: () => void;
}) {
  const { project: selected, hostname, embeddable, frameUrl } = studioBrowserProject(project);
  const [reload, setReload] = useState(0);
  const [loadedKey, setLoadedKey] = useState('');
  const [help, setHelp] = useState(false);
  const close = useRef<HTMLButtonElement>(null);
  const frameKey = `${project}-${reload}`;
  const restricted = !embeddable;
  const loaded = loadedKey === frameKey;

  useEffect(() => { if (active) close.current?.focus({ preventScroll: true }); }, [active]);

  return <section className={styles.browser} aria-label={`Navegador de proyectos: ${selected.name}`}>
    <div className={styles.tabs} aria-label="Proyectos abiertos">
      {featuredProjects.map((item, index) => <button type="button" key={item.name} aria-pressed={project === index} onClick={() => { onProject(index); setHelp(false); }}><span aria-hidden="true">{item.name.charAt(0)}</span>{item.name}</button>)}
    </div>
    <div className={styles.toolbar}>
      <button ref={close} type="button" onClick={onClose} aria-label="Volver a Latech Studio" title="Volver a Latech Studio"><ArrowLeft size={16} /></button>
      <div className={styles.address} title={`Origen del proyecto: ${selected.url}`}><Globe2 size={13} aria-hidden="true" /><span>{hostname}</span></div>
      {!restricted && <button type="button" onClick={() => { setReload(value => value + 1); setHelp(false); }} aria-label={`Recargar el inicio de ${selected.name}`} title="Volver a cargar el inicio"><RotateCcw size={15} /></button>}
      {!expanded && <button type="button" onClick={onExpand} aria-label="Ampliar navegador de proyectos" title="Ampliar"><Maximize2 size={15} /></button>}
    </div>
    <div className={styles.viewport}>
      {restricted ? <div className={styles.restricted}>
        <div><span className={styles.eyebrow}>VISTA DEL PROYECTO</span><h3>{selected.name}</h3><p>Esta web protege su navegación y no permite abrirse dentro de otra. Aquí puedes ver su diseño sin salir de Studio.</p></div>
        <Image src={selected.image} alt="Vista del diseño de Zona Sport" width={1200} height={900} sizes="(max-width: 767px) 400px, 960px" />
      </div> : active ? <>
        {!loaded && <div className={styles.loading} role="status"><Globe2 size={24} /><strong>Entrando en {selected.name}…</strong><span>La web real, dentro de Latech Studio.</span></div>}
        <iframe key={frameKey} src={frameUrl} title={`Web de ${selected.name}: navegación interactiva`} className={styles.frame}
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoadedKey(frameKey)} onError={() => setHelp(true)} />
      </> : <div className={styles.loading}><strong>El proyecto está abierto en la ventana ampliada.</strong></div>}
    </div>
    <div className={styles.footer}><span>{restricted ? 'Vista del diseño · dentro de Studio' : 'Navegación limitada al dominio de este proyecto'}</span>{!restricted && <button type="button" aria-expanded={help} onClick={() => setHelp(value => !value)}>¿No carga?</button>}</div>
    {help && <div className={styles.help} role="status"><p>La web puede bloquear esta vista o tardar en responder. Puedes recargar su inicio o volver a Studio con la flecha superior.</p><button type="button" onClick={() => { setReload(value => value + 1); setHelp(false); }}>Recargar el proyecto</button><button type="button" onClick={() => setHelp(false)}>Cerrar aviso</button></div>}
  </section>;
}
