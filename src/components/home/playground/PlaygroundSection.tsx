'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { suspendGames } from './game-session';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Gamepad2, Pencil, Maximize2, Code2, ScanLine } from 'lucide-react';
import { Reveal } from '../../effects/Reveal';

const loading = () => <p className="grid h-full place-items-center text-sm text-blue-200" role="status">Preparando el laboratorio…</p>;
const DrawingBoard = dynamic(() => import('./DrawingBoard'), { ssr: false, loading });
const StumbleRunner = dynamic(() => import('./StumbleRunner'), { ssr: false, loading });
const EscapeGame = dynamic(() => import('./EscapeGame'), { ssr: false });
const HoodReveal = dynamic(() => import('./HoodReveal'), { ssr: false });
const XRayMode = dynamic(() => import('../../effects/XRayMode'), { ssr: false });

function DeferredDemo({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) { queueMicrotask(() => setReady(true)); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setReady(true); observer.disconnect(); }
    }, { rootMargin: '240px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="h-full min-h-0">{ready ? children : <p className="grid h-full place-items-center text-center text-sm text-blue-200">La demo se prepara al acercarte.</p>}</div>;
}

export default function PlaygroundSection() {
  const [tab, setTab] = useState('runner');
  const [drawingVisited, setDrawingVisited] = useState(false);
  const [escape, setEscape] = useState(false);
  const [hood, setHood] = useState(false);
  const [xray, setXray] = useState(false);
  return <section id="laboratorio" className="lab-section section-space">
    <div className="site-container">
      <Reveal><div className="section-heading">
        <div><p className="eyebrow"><span className="status-dot" /> 05 / El laboratorio</p><h2>Aquí se viene<br /><span className="muted-heading">a jugar.</span></h2></div>
        <p className="max-w-sm text-sm leading-relaxed text-[#8ba3be]">Esto no es una maqueta. Es código vivo.<br />Toca, salta, dibuja. Y luego imagina tu negocio aquí.</p>
      </div></Reveal>
      <Tabs.Root value={tab} onValueChange={(value) => { setTab(value); if (value === 'drawing') setDrawingVisited(true); }}>
        <Tabs.List className="lab-tabs" aria-label="Elige una experiencia">
          <Tabs.Trigger value="runner"><Gamepad2 size={16} /> Orbit Runner</Tabs.Trigger>
          <Tabs.Trigger value="drawing"><Pencil size={16} /> Lienzo libre</Tabs.Trigger>
        </Tabs.List>
        <div className="lab-frame" data-escape-origin>
          <div className="lab-frame-header"><span>LATECH / PLAYGROUND_01</span><span>100% INTERACTIVO · 0 PLANTILLAS</span></div>
          <Tabs.Content value="runner" forceMount hidden={tab !== 'runner'} className="lab-frame-body"><DeferredDemo><StumbleRunner /></DeferredDemo></Tabs.Content>
          <Tabs.Content value="drawing" forceMount hidden={tab !== 'drawing'} className="lab-frame-body">{drawingVisited && <DrawingBoard />}</Tabs.Content>
        </div>
      </Tabs.Root>
      <div className="lab-controls">
        <button onClick={() => { suspendGames(); setEscape(true); }}><Maximize2 size={15} /> Romper la cuarta pared</button>
        <button onClick={() => { suspendGames(); setHood(true); }}><Code2 size={15} /> Abrir el capó</button>
        <button onClick={() => { suspendGames(); setXray(true); }}><ScanLine size={15} /> Visión de rayos X</button>
      </div>
      <p className="lab-hint">Sí, el juego puede escaparse de su caja. Dale a «Romper la cuarta pared».</p>
      <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3"><Link href="/lab" className="text-button">Laboratorio completo ↗</Link><Link href="/lab/trazo" className="text-button">Tu trazo, un mundo ↗</Link><Link href="/lab/misterios" className="text-button">Los tres misterios ↗</Link></div>
    </div>
    {escape && <EscapeGame open onClose={() => setEscape(false)} />}
    {hood && <HoodReveal open onClose={() => setHood(false)} />}
    {xray && <XRayMode open onClose={() => setXray(false)} />}
  </section>;
}
