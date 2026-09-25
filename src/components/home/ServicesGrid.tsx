import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '../effects/Reveal';

const services = [
  { title: 'Webs con personalidad.', detail: 'DISEÑO + DESARROLLO', description: 'Tu marca, convertida en una experiencia digital. Diseño a medida, SEO técnico y una web que se adapta a cada pantalla.', href: '/tienda/web' },
  { title: 'Tiendas que lo ponen fácil.', detail: 'ECOMMERCE + CONVERSIÓN', description: 'Un escaparate a la altura de tu producto. Catálogo, carrito y pagos integrados para que comprar sea sencillo.', href: '/tienda/online' },
  { title: 'IA que hace el trabajo.', detail: 'AGENTES + AUTOMATIZACIÓN', description: 'Atención al cliente, reservas y procesos conectados. Automatizaciones con n8n que encajan en tu negocio.', href: '/tienda/agente-ia' },
];
export default function ServicesGrid() {
  return <section className="section-space" id="servicios"><div className="site-container">
    <Reveal className="section-heading"><div><p className="eyebrow">03 / LO QUE PODEMOS CONSTRUIR</p><h2>Ambición digital.<br /><span className="muted-heading">De principio a fin.</span></h2></div><p className="max-w-xs text-sm leading-relaxed text-white/50">Diseño, tecnología y estrategia.<br />Un mismo equipo, de la idea al lanzamiento.</p></Reveal>
    <div className="service-list">{services.map((s,i) => <Reveal key={s.href} delay={i * .05}><Link href={s.href} className="service-row"><span className="service-number">0{i+1}</span><div><h3>{s.title}</h3><small>{s.detail}</small></div><p>{s.description}</p><ArrowUpRight size={28} /></Link></Reveal>)}</div>
  </div></section>;
}
