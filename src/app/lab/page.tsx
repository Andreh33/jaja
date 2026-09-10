import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';
import { experiments } from './_lib/experiments';
import ExperimentArt from './_components/ExperimentArt';
import styles from './lab.module.css';

const description = 'Juegos, un lienzo para dibujar y experimentos interactivos de Latech. Explora lo que una web a medida puede hacer y juega desde tu navegador.';
export const metadata: Metadata = {
  title: 'Latech Lab · Juegos y experimentos web', description,
  alternates: { canonical: '/lab' },
  openGraph: { title: 'Latech Lab', description, url: '/lab', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Latech Lab', description },
};

export default function LabPage() {
  return <main className={styles.shell} id="main-content">
    <JsonLd data={breadcrumbJsonLd([{ name: 'Inicio', path: '/' }, { name: 'Latech Lab', path: '/lab' }])} />
    <section className={styles.hero}>
      <p className={styles.eyebrow}>Hecho para probarlo</p>
      <h1>Latech <span>Lab</span><sup>↗</sup></h1>
      <div className={styles.heroBottom}><p>Tu imaginación, nuestro límite.</p><p>Un lugar para jugar, dibujar y mirar una web desde otro ángulo. Entra, toca y descubre.</p><a href="#experimentos" className={styles.downLink} aria-label="Explorar los experimentos"><ArrowDown size={24} /></a></div>
    </section>
    <section id="experimentos" className={styles.collection} aria-labelledby="experiments-title">
      <div className={styles.sectionHeading}><h2 id="experiments-title">Elige tu experimento</h2><span>Juega · Crea · Explora</span></div>
      <article className={`${styles.discovery} ${styles.traceDiscovery}`}><Link href="/lab/trazo"><div className={styles.mysteryMark} aria-hidden><svg viewBox="0 0 80 80" fill="none"><path d="M9 60 22 40 38 51 53 23 71 32" stroke="#C084FC" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="53" cy="13" r="5" fill="#FBBF24"/></svg></div><div><p className={styles.eyebrow}>Dibuja · Juega · Comparte</p><h3>Tu trazo, un mundo</h3><p>Dibuja una línea, conviértela en plataformas y reta a alguien con el mismo recorrido. Sin registro.</p></div><span className={styles.discoveryAction}>Crear mi recorrido <ArrowUpRight size={20} aria-hidden /></span></Link></article>
      <div className={styles.grid}>{experiments.map((experiment, index) => <article className={`${styles.card} ${index === 0 ? styles.featured : ''}`} key={experiment.slug}>
        <Link href={`/lab/${experiment.slug}`} className={styles.cardLink}>
          <ExperimentArt kind={experiment.slug} />
          <div className={styles.cardBody}><p className={styles.cardCategory}><span>{experiment.category}</span><span>{experiment.number}</span></p><h3>{experiment.title}<ArrowUpRight size={24} aria-hidden /></h3><p>{experiment.short}</p><span className={styles.cardAction}>Descubrir experimento <span aria-hidden>→</span></span></div>
        </Link>
      </article>)}</div>
      <article className={styles.discovery}><Link href="/lab/misterios"><div className={styles.mysteryMark} aria-hidden>?</div><div><p className={styles.eyebrow}>Investiga · Prueba · Resuelve</p><h3>Misterios de negocio</h3><p>Una reserva imposible, un carrito sorpresa y un buscador despistado. Encuentra qué falla y cambia la demo para solucionarlo.</p></div><span className={styles.discoveryAction}>Abrir los casos <ArrowUpRight size={20} aria-hidden /></span></Link></article>
    </section>
    <section className={styles.manifesto}>
      <p className={styles.eyebrow}>Ideas que se pueden tocar</p><h2>Una web también puede<br /><span>hacerte participar.</span></h2>
      <div><p>Un juego, una herramienta o una interacción propia pueden dar a tus visitantes un motivo para quedarse. Aquí probamos esas ideas en primera persona.</p><Link href="/tienda/calculadora" className={styles.textLink}>Dale forma a tu proyecto <ArrowUpRight size={19} /></Link><Link href="/blog" className={styles.secondaryLink}>Lee cómo construimos para la web →</Link></div>
    </section>
  </main>;
}
