import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '../effects/Reveal';
import styles from './ServicesGrid.module.css';

const services = [
  { title: 'Webs con personalidad.', detail: 'DISEÑO + MOVIMIENTO', description: 'Una identidad que se reconoce. Animaciones que cuentan tu historia. Cada pantalla, cada detalle y cada clic pensados para tu marca.', href: '/tienda/web' },
  { title: 'Tiendas que lo ponen fácil.', detail: 'ECOMMERCE + CONVERSIÓN', description: 'Un escaparate a la altura de tu producto. Catálogo, carrito y pagos integrados para que comprar sea sencillo.', href: '/tienda/online' },
  { title: 'IA que hace el trabajo.', detail: 'MÁS ATENCIÓN. MENOS TAREAS.', description: 'Responde a tus clientes, organiza reservas y conecta tu negocio. Recupera tiempo para dedicarlo a lo que solo tú puedes hacer.', href: '/tienda/agente-ia' },
];
export default function ServicesGrid() {
  return <section className="section-space" id="servicios"><div className="site-container">
    <Reveal className="section-heading"><div><p className="eyebrow">03 / LO QUE PODEMOS CONSTRUIR</p><h2>Ambición digital.<br /><span className="muted-heading">De principio a fin.</span></h2></div><p className="max-w-xs text-sm leading-relaxed text-white/50">Diseño, tecnología y estrategia.<br />Un mismo equipo, de la idea al lanzamiento.</p></Reveal>
    <div className="service-list">{services.map((s,i) => <Reveal key={s.href} delay={i * .05}><Link href={s.href} className={`service-row ${styles.row}`}><span className={`service-number ${styles.number}`}>0{i+1}</span><div><h3>{s.title}</h3><small>{s.detail}</small></div><p>{s.description}</p><ArrowUpRight size={28} className={styles.arrow} aria-hidden="true" /></Link></Reveal>)}</div>
  </div></section>;
}
