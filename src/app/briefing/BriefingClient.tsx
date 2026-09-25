'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { track } from '@vercel/analytics';
import { ArrowRight, Check, Copy, MessageCircle, Printer, RotateCcw } from 'lucide-react';
import {
  applyArticleDecision, BRIEFING_KEY, briefingText, briefingWhatsApp, buildBriefing,
  chooseProject, clearBriefing, EMPTY_BRIEFING, FEATURES, getArticleDecision,
  INTEGRATIONS, MATERIALS, PROJECT_TYPES, readBriefing, relevantMaterials, saveBriefing,
  type BriefingState, type Feature, type Integration, type MaterialStatus,
} from '@/lib/briefing';
import styles from './briefing.module.css';

export default function BriefingClient({ decisionId }: { decisionId?: string }) {
  const [state, setState] = useState<BriefingState>(EMPTY_BRIEFING);
  const [ready, setReady] = useState(false);
  const [persist, setPersist] = useState(false);
  const [notice, setNotice] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [copyFallback, setCopyFallback] = useState(false);
  const [appliedDecision, setAppliedDecision] = useState('');
  const [externalAvailable, setExternalAvailable] = useState(false);
  const reportRef = useRef<HTMLElement>(null);
  const completionTracked = useRef(false);
  const decision = getArticleDecision(decisionId);
  const report = buildBriefing(state);
  const text = briefingText(state);

  useEffect(() => {
    // Recover browser-only, opt-in progress before any persistence effect can run.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const restored = readBriefing(window.localStorage);
      if (restored) { setState(restored); setPersist(true); }
    } catch { setNotice('El almacenamiento no está disponible. Puedes completar y exportar el briefing en esta página.'); }
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const sync = (event: StorageEvent) => {
      if (event.key !== BRIEFING_KEY && event.key !== null) return;
      try {
        const restored = readBriefing(window.localStorage);
        // Another tab must never overwrite this tab's unsaved answers. Pause autosave
        // and let the person choose which copy to keep.
        setPersist(false); setExternalAvailable(Boolean(restored));
        setNotice(restored ? 'Hay otra copia guardada desde una pestaña diferente. Tus respuestas actuales se conservan. Puedes cargar esa copia o guardar las de esta página para sustituirla.' : 'La copia guardada se ha borrado desde otra pestaña. Tus respuestas actuales se conservan aquí, sin guardado automático.');
      } catch { /* A blocked storage API must never prevent editing. */ }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  useEffect(() => {
    if (!ready || !persist) return;
    try { if (saveBriefing(window.localStorage, state)) return; } catch { /* Fall through to the recoverable notice. */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotice('No se ha podido guardar el progreso. Conserva una copia antes de cerrar esta página.');
  }, [state, persist, ready]);
  useEffect(() => {
    if (report.complete && !completionTracked.current) {
      completionTracked.current = true;
      track('briefing_ready', { project: state.project });
    }
  }, [report.complete, state.project]);

  const toggleFeature = (value: Feature) => setState(previous => ({ ...previous, features: previous.features.includes(value) ? previous.features.filter(v => v !== value) : [...previous.features, value] }));
  const toggleIntegration = (value: Integration) => setState(previous => ({ ...previous, integrations: previous.integrations.includes(value) ? previous.integrations.filter(v => v !== value) : [...previous.integrations, value] }));
  const togglePersistence = (enabled: boolean) => {
    try {
      const succeeded = enabled ? saveBriefing(window.localStorage, state) : clearBriefing(window.localStorage);
      if (!succeeded) throw new Error('storage unavailable');
      setPersist(enabled); setExternalAvailable(false);
      setNotice(enabled ? 'Progreso guardado en este navegador. Puedes desactivarlo o borrarlo cuando quieras.' : 'Copia guardada eliminada. Puedes seguir trabajando sin guardar.');
    } catch { setNotice('El navegador no permite cambiar el guardado. Puedes seguir trabajando y exportar una copia.'); }
  };
  const reset = () => {
    let cleared = true;
    try { cleared = clearBriefing(window.localStorage); } catch { cleared = false; }
    setState(EMPTY_BRIEFING); setPersist(false); setConfirmReset(false); setCopyFallback(false); setAppliedDecision(''); setExternalAvailable(false); completionTracked.current = false;
    setNotice(cleared ? 'Briefing reiniciado y copia guardada eliminada.' : 'Briefing reiniciado en esta página. El navegador ha impedido borrar la copia guardada; revisa los datos del sitio en sus ajustes.');
  };
  const loadExternal = () => {
    try {
      const restored = readBriefing(window.localStorage);
      if (!restored) { setExternalAvailable(false); setNotice('Esa copia ya no está disponible. Conservamos tus respuestas actuales.'); return; }
      setState(restored); setPersist(true); setExternalAvailable(false);
      setNotice('Copia de la otra pestaña cargada. El guardado vuelve a estar activado.');
    } catch { setNotice('No pudimos recuperar la copia. Tus respuestas actuales siguen aquí.'); }
  };
  const incorporate = () => {
    if (!decision) return;
    setState(previous => applyArticleDecision(previous, decision)); setAppliedDecision(decision.id);
    setNotice('Decisión incorporada. Puedes cambiarla en los apartados siguientes.');
    track('briefing_decision_added', { decision: decision.id });
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setNotice('Briefing copiado. No se ha enviado a Latech.'); setCopyFallback(false); track('briefing_copy', { project: state.project }); }
    catch { setCopyFallback(true); setNotice('No pudimos acceder al portapapeles. Selecciona y copia el texto del cuadro.'); }
  };

  return (
    <main id="main-content" tabIndex={-1} data-briefing-root className={styles.root}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Una idea clara empieza antes del diseño</p>
        <h1 className={styles.title}>Tu proyecto,<br /><span>sin puntos ciegos.</span></h1>
        <p>Convierte lo que necesitas en un documento que puedas discutir y comprobar. Completa solo lo que sepas; las decisiones pendientes también forman parte de un buen briefing.</p>
      </div>
      <noscript><p className={styles.status}>Active JavaScript para completar y conservar el briefing en este navegador. También puedes consultar las guías del blog y preparar tu proyecto por escrito.</p></noscript>
      <div className={styles.layout}>
        <div className={styles.controls}>
          {decision && appliedDecision !== decision.id && (
            <section className={`${styles.panel} ${styles.decision}`} aria-labelledby="briefing-decision-title">
              <p className={styles.eyebrow}>Una decisión desde el blog</p>
              <h2 id="briefing-decision-title" className="mt-3 font-display text-xl font-bold">{decision.title}</h2>
              <p className={`${styles.help} mt-3`}>{decision.text}</p>
              {state.project && state.project !== decision.project && <p className={`${styles.status} mt-3`}>Esta idea cambia el tipo a «{PROJECT_TYPES.find(p => p.value === decision.project)!.label}». Se conservarán tus textos y materiales; se retirarán las funciones que no correspondan a ese tipo.</p>}
              <button type="button" onClick={incorporate} disabled={!ready} className={`${styles.button} ${styles.primary} mt-4`}>Incorporar esta decisión <ArrowRight size={15} /></button>
              <p className={`${styles.help} mt-3`}>Nada se incorpora hasta que pulses. También puedes continuar sin añadirlo.</p>
            </section>
          )}
          <fieldset className={styles.panel} disabled={!ready}>
            <legend>01. Qué vas a construir</legend>
            <div>{PROJECT_TYPES.map(project => <label key={project.value} className={styles.choice}><input name="briefing-project" type="radio" value={project.value} checked={state.project === project.value} onChange={() => setState(previous => chooseProject(previous, project.value))} /><span><strong>{project.label}</strong><small>{project.description}</small></span></label>)}</div>
            <label className={styles.field}><span className={styles.label}>¿Qué debería conseguir este proyecto?</span><textarea className={styles.input} rows={3} value={state.objective} maxLength={240} onChange={event => setState(previous => ({ ...previous, objective: event.target.value }))} placeholder="Por ejemplo: recibir solicitudes con la información necesaria para preparar una propuesta." /></label>
            <label className={styles.field}><span className={styles.label}>¿Quién lo usará?</span><input className={styles.input} value={state.audience} maxLength={180} onChange={event => setState(previous => ({ ...previous, audience: event.target.value }))} placeholder="Describe a tu público, sin datos personales." /></label>
          </fieldset>
          <fieldset className={styles.panel} disabled={!ready || !state.project}>
            <legend>02. Funciones e integraciones</legend>
            <p className={styles.help}>{state.project ? 'Marca lo que quieres estudiar. La compatibilidad, el alcance y el coste se confirmarán al revisar tu proyecto.' : 'Elige un tipo de proyecto para ver sus decisiones.'}</p>
            {FEATURES.filter(feature => feature.types.some(type => type === state.project)).map(feature => <label key={feature.value} className={styles.choice}><input type="checkbox" checked={state.features.includes(feature.value)} onChange={() => toggleFeature(feature.value)} /><span><strong>{feature.label}</strong></span></label>)}
            <p className={`${styles.label} mt-6`}>¿Debe conectarse con otra herramienta?</p>
            {INTEGRATIONS.map(integration => <label key={integration.value} className={styles.choice}><input type="checkbox" checked={state.integrations.includes(integration.value)} onChange={() => toggleIntegration(integration.value)} /><span><strong>{integration.label}</strong></span></label>)}
            <p className={`${styles.help} mt-4`}>Aquí solo defines necesidades. Nunca introduzcas contraseñas, claves API ni información de tus clientes.</p>
          </fieldset>
          <fieldset className={styles.panel} disabled={!ready || !state.project}>
            <legend>03. Lo que hay que preparar</legend>
            <div>{relevantMaterials(state.project).map(value => <label key={value} className={styles.field}><span className={styles.label}>{MATERIALS.find(material => material.value === value)!.label}</span><select className={styles.input} value={state.materials[value]} onChange={event => setState(previous => ({ ...previous, materials: { ...previous.materials, [value]: event.target.value as MaterialStatus } }))}><option value="">Todavía no lo he revisado</option><option value="ready">Lo tengo disponible</option><option value="pending">Tengo que prepararlo</option><option value="help">Necesito ayuda</option></select></label>)}</div>
            <label className={styles.field}><span className={styles.label}>¿Quién mantendrá el contenido o las respuestas?</span><select className={styles.input} value={state.owner} onChange={event => setState(previous => ({ ...previous, owner: event.target.value as BriefingState['owner'] }))}><option value="">Sin responder</option><option value="team">Nuestro equipo</option><option value="provider">El proveedor, pendiente de acordar</option><option value="undecided">Necesito decidirlo</option></select></label>
            <label className={styles.field}><span className={styles.label}>¿Cómo planteas el calendario?</span><select className={styles.input} value={state.launch} onChange={event => setState(previous => ({ ...previous, launch: event.target.value as BriefingState['launch'] }))}><option value="">Sin responder</option><option value="flexible">Podemos acordarlo al revisar el alcance</option><option value="urgent">Necesitamos una primera entrega cuanto antes</option></select></label>
            <label className={styles.field}><span className={styles.label}>Algo más que debamos contemplar · opcional</span><textarea className={styles.input} rows={4} maxLength={600} value={state.notes} onChange={event => setState(previous => ({ ...previous, notes: event.target.value }))} placeholder="Por ejemplo, idiomas deseados o el nombre de la herramienta que ya utilizas. Sin datos privados." /></label>
          </fieldset>
          <section className={styles.panel} aria-label="Control de tu progreso">
            <label className="flex items-start gap-3"><input type="checkbox" checked={persist} disabled={!ready} onChange={event => togglePersistence(event.target.checked)} className={styles.check} /><span><span className={styles.label}>Guardar mi progreso en este navegador</span><span className={styles.help}>Es opcional. La copia incluye lo que escribas, permanece en este dispositivo y no se sincroniza con una cuenta. Al desactivar se elimina la copia guardada.</span></span></label>
            <p className={`${styles.help} mt-4`}>Tus respuestas no se envían a Latech mientras completas el briefing. Medimos acciones generales como copiar o abrir WhatsApp, sin incluir tus textos.</p>
            <div className={styles.actions}><button type="button" className={styles.button} onClick={() => { reportRef.current?.focus(); reportRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); }}>Revisar mi briefing <ArrowRight size={15} /></button><button type="button" className={styles.button} onClick={() => setConfirmReset(true)} disabled={!ready}><RotateCcw size={15} />Reiniciar</button></div>
            {confirmReset && <div className="mt-5 border-t border-white/15 pt-4"><p className={styles.help}>Se borrarán todas las respuestas y la copia de este navegador.</p><div className={styles.actions}><button type="button" className={styles.button} onClick={() => setConfirmReset(false)}>Conservar</button><button type="button" className={`${styles.button} ${styles.primary}`} onClick={reset}>Borrar mi briefing</button></div></div>}
            <p role="status" className={styles.status}>{notice}</p>
            {externalAvailable && <div><p className={styles.help}>Cargar la otra copia sustituirá las respuestas de esta página. Puedes copiar tu documento antes de cambiar.</p><button type="button" className={`${styles.button} mt-3`} onClick={loadExternal}>Cargar la copia de la otra pestaña</button></div>}
          </section>
        </div>
        <section ref={reportRef} tabIndex={-1} data-briefing-report className={`${styles.report} scroll-mt-28 outline-none focus-visible:ring-2 focus-visible:ring-purple-300`} aria-labelledby="briefing-report-title">
          <p className={styles.eyebrow}>Mi briefing · Latech</p>
          <h2 id="briefing-report-title">{report.project}</h2>
          <p className={styles.help}>Documento de trabajo. Las funciones, el presupuesto y el calendario están pendientes de confirmar.</p>
          <p className={styles.progress}>{report.complete ? <><Check size={14} className="mr-1 inline" /> Listo para una primera conversación</> : `${report.answered} de ${report.total} decisiones respondidas · puedes exportarlo aunque falte información.`}</p>
          {report.sections.map(section => <section key={section.title}><h3>{section.title}</h3><ul>{section.items.map((item, index) => <li key={index}>{item}</li>)}</ul></section>)}
          {report.warnings.length > 0 && <section className={styles.warnings}><h3>Puntos que conviene resolver</h3><ul>{report.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul></section>}
          <div className={styles.actions}>
            <button type="button" onClick={() => { track('briefing_print_open', { project: state.project }); window.print(); }} disabled={!ready} className={`${styles.button} ${styles.primary}`}><Printer size={16} />Imprimir o guardar PDF</button>
            <button type="button" onClick={copy} disabled={!ready} className={styles.button}><Copy size={16} />Copiar texto</button>
            <a href={briefingWhatsApp(state)} target="_blank" rel="noopener noreferrer" onClick={() => track('briefing_whatsapp_open', { project: state.project })} className={styles.button}><MessageCircle size={16} />Compartir por WhatsApp</a>
          </div>
          {copyFallback && <label className={`${styles.field} ${styles.noPrint}`}><span className={styles.label}>Selecciona y copia tu briefing</span><textarea readOnly rows={10} value={text} className={styles.input} onFocus={event => event.currentTarget.select()} /></label>}
          <p className={`${styles.help} ${styles.noPrint} mt-4`}>Imprimir o copiar no envía el documento. WhatsApp abre un mensaje para que lo revises y decidas si enviarlo.</p>
          <div className={`${styles.noPrint} mt-7 border-t border-white/15 pt-5`}><p className={styles.help}>¿Quieres estudiar también el precio? El briefing define lo que necesitas; el configurador prepara un presupuesto orientativo de web y extras.</p><Link href="/tienda/calculadora" className={`${styles.button} mt-4`}>Abrir la calculadora <ArrowRight size={15} /></Link></div>
          <p className={styles.printFooter}>Creado con serviciosonlineweb.com/briefing. Compartir este documento no confirma una contratación ni una fecha de entrega.</p>
        </section>
      </div>
    </main>
  );
}
