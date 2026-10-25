'use client';

import { useId, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

type SceneProject = { id: string; name: string; image: string; url: string; domain: string };

/** Only thin, public portfolio props cross the server boundary. */
export default function PortfolioScene({ projects, label }: { projects: SceneProject[]; label: string }) {
  const [active, setActive] = useState(0);
  const sceneId = useId();
  const project = projects[active];
  if (!project) return null;
  return <div className="intl-scene">
    <div className="intl-scene-back" aria-hidden="true"><Image src={projects[(active + 1) % projects.length].image} alt="" width={700} height={450} sizes="(max-width: 800px) 80vw, 40vw" /></div>
    <a className="intl-scene-window" href={project.url} target="_blank" rel="noreferrer" id={sceneId} aria-label={`${project.name} · ${project.domain}`}>
      <div className="intl-browser-chrome"><span aria-hidden="true"><i /><i /><i /></span><span>{project.domain}</span><ArrowUpRight size={15} aria-hidden="true" /></div>
      <div className="intl-scene-image"><Image key={project.id} src={project.image} alt={project.name} width={1000} height={700} priority sizes="(max-width: 800px) 90vw, 48vw" /></div>
      <div className="intl-scene-caption"><strong>{project.name}</strong><ArrowUpRight size={22} aria-hidden="true" /></div>
    </a>
    <div className="intl-scene-switcher" role="group" aria-label={label}>{projects.map((p, index) => <button type="button" key={p.id} onClick={() => setActive(index)} aria-pressed={active === index} aria-controls={sceneId}>{p.name}</button>)}</div>
  </div>;
}
