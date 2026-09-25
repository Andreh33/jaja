import { Reveal } from '../effects/Reveal';

const steps = [
  ['01', 'La idea.', 'Nos cuentas qué quieres conseguir. Escuchamos, preguntamos y definimos el alcance.'],
  ['02', 'La dirección.', 'Damos forma a tu identidad digital. Diseño, contenido y recorrido aprobados contigo.'],
  ['03', 'El código.', 'Construimos cada detalle. Interacciones, integraciones y pruebas en móvil y escritorio.'],
  ['04', 'El despegue.', 'Publicamos, medimos y seguimos a tu lado. Tu web evoluciona con tu negocio.'],
];
export default function ProcessSection() {
  return <section className="section-space"><div className="site-container">
    <Reveal className="section-heading"><div><p className="eyebrow">04 / DEL «Y SI…» AL «YA ESTÁ»</p><h2>Así lo hacemos<br /><span className="muted-heading">realidad.</span></h2></div><p className="max-w-xs text-sm leading-relaxed text-white/50">Comunicación directa. Un proceso claro.<br />Y obsesión por los detalles.</p></Reveal>
    <div className="blue-process">{steps.map(([n,title,desc],i) => <Reveal key={n} delay={i*.06} className="process-step"><span>{n} /</span><h3>{title}</h3><p>{desc}</p></Reveal>)}</div>
  </div></section>;
}
