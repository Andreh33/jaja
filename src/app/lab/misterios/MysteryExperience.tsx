'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@vercel/analytics';
import { ArrowRight, Check, RotateCcw, Lightbulb } from 'lucide-react';
import { DEMO_BASKET, MYSTERY_PROGRESS_EVENT, MYSTERY_PROGRESS_KEY, parseMysteryProgress, searchDemoProducts, normalizeDemoSearch, type Mystery } from '@/lib/lab-mysteries';
import styles from './mysteries.module.css';

export default function MysteryExperience({ episode }: { episode: Mystery }) {
  const [encountered, setEncountered] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [hint, setHint] = useState(false);
  const [notice, setNotice] = useState('');
  const [service, setService] = useState('Corte y peinado');
  const [time, setTime] = useState('17:00');
  const [query, setQuery] = useState('cafe');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [showFees, setShowFees] = useState(false);
  const [saved, setSaved] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const isBooking = episode.slug === 'la-reserva-imposible';
  const isCart = episode.slug === 'el-carrito-sorpresa';

  useEffect(() => {
    if (completed || fixed || encountered) heading.current?.focus({ preventScroll: true });
  }, [completed, fixed, encountered]);

  function finish() {
    if (!fixed || completed) return;
    setCompleted(true);
    setNotice('Comprobado. La corrección permite completar la tarea.');
    try {
      const progress = parseMysteryProgress(localStorage.getItem(MYSTERY_PROGRESS_KEY));
      localStorage.setItem(MYSTERY_PROGRESS_KEY, JSON.stringify([...new Set([...progress, episode.slug])]));
      setSaved(true);
      window.dispatchEvent(new Event(MYSTERY_PROGRESS_EVENT));
    } catch { setSaved(false); }
    try { track('mystery_finish', { episode: episode.slug }); } catch { /* Analytics never blocks the exercise. */ }
  }
  function exposeProblem() {
    setEncountered(true);
    setNotice(isBooking ? 'La promoción tapa la confirmación. ¿Cómo le devolverías su espacio?' : isCart ? 'Aparecen 6 € de envío al final: el total pasa de 34 € a 40 €.' : 'El producto existe, pero «cafe» no coincide con «Café». Revisa la comparación.');
  }
  function choose(id: string) {
    const choice = episode.choices.find((item) => item.id === id);
    if (!choice) return;
    setNotice(choice.explanation);
    if (id === episode.correctChoice) { setFixed(true); setSubmittedQuery(null); }
  }
  function restart() {
    setEncountered(false); setFixed(false); setCompleted(false); setHint(false); setNotice('');
    setSubmittedQuery(null); setShowFees(false); setQuery('cafe');
  }
  const results = submittedQuery === null ? [] : searchDemoProducts(submittedQuery, fixed);

  return (
    <div className={styles.experiment}>
      <div className={styles.controls}>
        <div className={styles.steps} aria-label="Progreso del episodio"><span aria-current={!encountered ? 'step' : undefined}>01 · PRUEBA</span><span aria-current={encountered && !fixed ? 'step' : undefined}>02 · CORRIGE</span><span aria-current={fixed ? 'step' : undefined}>03 · COMPRUEBA</span></div>
        <h2 ref={heading} tabIndex={-1}>{completed ? 'Caso resuelto.' : fixed ? 'Vuelve a probar la tarea.' : encountered ? 'Elige una corrección.' : 'Ponte en el lugar del cliente.'}</h2>
        <p>{completed ? 'Has cambiado el comportamiento de la demo y verificado el resultado. La comprobación de debajo te sirve para revisar una web real.' : fixed ? isBooking ? 'La promoción ya no tapa el botón. Confirma la cita para comprobar el recorrido.' : isCart ? 'El desglose aparece antes de continuar. Revisa el total y confirma el pedido simulado.' : 'Busca «cafe» otra vez y selecciona el producto que ahora aparece.' : episode.objective}</p>
        {encountered && !fixed && <fieldset className="mt-5"><legend className="sr-only">Elige cómo corregir el problema</legend>{episode.choices.map((choice) => <button key={choice.id} type="button" className={`${styles.button} ${styles.choice}`} onClick={() => choose(choice.id)}>{choice.label}</button>)}</fieldset>}
        <div className={styles.actions}>
          {!completed && <button type="button" className={styles.button} aria-expanded={hint} onClick={() => setHint(!hint)}><Lightbulb size={16} aria-hidden /> {hint ? 'Ocultar pista' : 'Dame una pista'}</button>}
          <a className={styles.link} href="#aprendizaje">Ir a la explicación <ArrowRight size={15} aria-hidden /></a>
          {(encountered || completed) && <button type="button" className={styles.button} onClick={restart}><RotateCcw size={15} aria-hidden /> Repetir</button>}
        </div>
        {hint && <p className="rounded-xl border border-purple-300/20 bg-purple-500/5 p-4">{episode.clue}</p>}
        <div className={styles.notice} role="status" aria-live="polite">{notice}</div>
        {completed && <p className="text-xs">{saved ? 'Episodio completado guardado en este navegador. No se han enviado datos de una reserva o compra.' : 'Puedes seguir sin guardar el progreso. No se han enviado datos de una reserva o compra.'}</p>}
      </div>
      <div className={styles.scene}>
        <div className={styles.sceneHeader}><span>NEGOCIO FICTICIO · DEMO</span><span>{fixed ? 'CORREGIDA' : 'EN INVESTIGACIÓN'}</span></div>
        <div className={styles.device}>
          {isBooking ? <>
            <h3>Estudio Lila</h3><p>Un momento para ti.</p>
            <label htmlFor="demo-service">Tu servicio<select id="demo-service" value={service} onChange={(event) => setService(event.target.value)} disabled={completed}><option>Corte y peinado</option><option>Tratamiento capilar</option></select></label>
            <label htmlFor="demo-time">Hoy, a las<select id="demo-time" value={time} onChange={(event) => setTime(event.target.value)} disabled={completed}><option>17:00</option><option>18:00</option><option>19:00</option></select></label>
            {fixed && <div className={styles.fixedPromo}>Conoce nuestros tratamientos de bienvenida.</div>}
            {completed ? <div className={styles.success}><Check size={16} className="mb-2" aria-hidden />Reserva de ejemplo confirmada: {service}, {time}. No se ha reservado una cita real.</div> : <div className={styles.bookingFooter}><button type="button" className={`${styles.button} ${styles.confirm}`} onClick={() => fixed ? finish() : exposeProblem()}>Confirmar cita</button>{!fixed && <button type="button" className={styles.promo} onClick={exposeProblem} aria-label="La promoción tapa la confirmación. Comprobar el problema">Promoción de bienvenida · ver más</button>}</div>}
          </> : isCart ? <>
            <h3>Objeto Studio</h3><p>Tu cesta de ejemplo · un producto</p>
            <dl className={styles.receipt}><div><dt>Lámpara de mesa</dt><dd>34,00 €</dd></div>{(fixed || showFees) && <div><dt>Envío</dt><dd>6,00 €</dd></div>}</dl>
            <div className={styles.total}><span>Total</span><span>{((fixed || showFees ? DEMO_BASKET.total : DEMO_BASKET.products) / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span></div>
            <p className="mt-3">Importes ficticios de la demo, impuestos incluidos.</p>
            {completed ? <div className={styles.success}>Pedido simulado confirmado por 40,00 €. No se ha cobrado ni comprado nada.</div> : <button type="button" className={`${styles.button} ${styles.confirm}`} onClick={() => { if (fixed) finish(); else { setShowFees(true); exposeProblem(); } }}>{fixed ? 'Confirmar pedido simulado · 40 €' : 'Continuar'}</button>}
          </> : <>
            <h3>La pausa</h3><p>Café y objetos para tu mesa.</p>
            <form onSubmit={(event) => { event.preventDefault(); setSubmittedQuery(query); if (!fixed) { if (searchDemoProducts(query, false).length === 0 && searchDemoProducts(query, true).length > 0) exposeProblem(); else setNotice('Para investigar este caso, busca cafe, sin tilde y en minúsculas.'); } }}>
              <label htmlFor="demo-search">Buscar en el catálogo<input id="demo-search" type="search" value={query} maxLength={80} onChange={(event) => setQuery(event.target.value)} placeholder="Prueba cafe" disabled={completed} /></label>
              <button type="submit" className={`${styles.button} ${styles.confirm}`} disabled={completed}>Buscar</button>
            </form>
            {completed ? <div className={styles.success}>Producto encontrado. Las tildes ya no impiden descubrir el café.</div> : submittedQuery !== null && <div className={styles.productList} aria-live="polite">{results.length ? results.map((product) => <button key={product} type="button" onClick={() => { if (fixed && normalizeDemoSearch(submittedQuery ?? '') === 'cafe') finish(); else setNotice('Comprueba también la consulta cafe, sin tilde, para resolver el caso.'); }}>{product} <span aria-hidden>→</span></button>) : <p>Sin resultados para «{submittedQuery}». El catálogo contiene Café de especialidad, Taza de cerámica y Filtro reutilizable.</p>}</div>}
          </>}
        </div>
        {isBooking && !fixed && !completed && <button type="button" className={`${styles.button} mt-4 w-full`} onClick={exposeProblem}>Intentar confirmar la cita</button>}
      </div>
    </div>
  );
}
