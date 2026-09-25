'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Gamepad2, Pencil, Maximize2, Code2, ScanLine } from 'lucide-react';
import { Reveal } from '../../effects/Reveal';

const loading = () => <p className="grid h-full place-items-center text-sm text-blue-200" role="status">Preparando el laboratorio…</p>;
const DrawingBoard = dynamic(() => import('./DrawingBoard'), { ssr: false, loading });
const StumbleRunner = dynamic(() => import('./StumbleRunner'), { ssr: false, loading });
const EscapeGame = dynamic(() => import('./EscapeGame'), { ssr: false });
const HoodReveal = dynamic(() => import('./HoodReveal'), { ssr: false });
const XRayMode = dynamic(() => import('../../effects/XRayMode'), { ssr: false });

export default function PlaygroundSection() {
  const [tab, setTab] = useState('runner');
  const [drawingVisited, setDrawingVisited] = useState(false);
  const [escape, setEscape] = useState(false);
  const [hood, setHood] = useState(false);
  const [xray, setXray] = useState(false);
  const overlay = escape || hood || xray;
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
          <Tabs.Content value="runner" className="lab-frame-body">{!overlay && <StumbleRunner />}</Tabs.Content>
          <Tabs.Content value="drawing" forceMount hidden={tab !== 'drawing'} className="lab-frame-body">{drawingVisited && <DrawingBoard />}</Tabs.Content>
        </div>
      </Tabs.Root>
      <div className="lab-controls">
        <button onClick={() => setEscape(true)}><Maximize2 size={15} /> Romper la cuarta pared</button>
        <button onClick={() => setHood(true)}><Code2 size={15} /> Abrir el capó</button>
        <button onClick={() => setXray(true)}><ScanLine size={15} /> Visión de rayos X</button>
      </div>
      <p className="lab-hint">Sí, el juego puede escaparse de su caja. Dale a «Romper la cuarta pared».</p>
    </div>
    {escape && <EscapeGame open onClose={() => setEscape(false)} />}
    {hood && <HoodReveal open onClose={() => setHood(false)} />}
    {xray && <XRayMode open onClose={() => setXray(false)} />}
  </section>;
}
