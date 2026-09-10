import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { MYSTERIES } from '@/lib/lab-mysteries';
import styles from './mysteries.module.css';
import MysteryProgress from './MysteryProgress';

export const metadata: Metadata = {
  title: 'Misterios de negocio: aprende probando',
  description: 'Tres experiencias interactivas de Latech: repara una reserva móvil, aclara el total de una cesta y consigue que un buscador encuentre el café. Sin registro.',
  alternates: { canonical: '/lab/misterios' },
  openGraph: { title: 'Misterios de negocio: aprende probando', description: 'Repara una reserva móvil, aclara el total de una cesta y consigue que un buscador encuentre el café.', url: '/lab/misterios', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Misterios de negocio: aprende probando', description: 'Tres casos ficticios para aprender a mejorar una web probando.' },
};
export default function MysteriesPage() {
  return <><AuroraBackground intensity="subtle" /><main className={styles.page}><div className={styles.container}>
    <Link className={styles.eyebrow} href="/lab">← Laboratorio Latech</Link>
    <h1 className={styles.heading}>Hay un problema.<br /><span className="text-gradient">Tú tienes el control.</span></h1>
    <p className={styles.lede}>Ponte en el lugar de un cliente, descubre qué le frena y cambia la demo para solucionarlo. Tres pequeños misterios sobre decisiones que importan en una web.</p>
    <span className={styles.tag}>Negocios ficticios · sin cuenta · a tu ritmo</span>
    <div className={styles.cards}>{MYSTERIES.map((episode) => <article key={episode.slug} className={styles.card}><span className={styles.number}>{episode.number} / {episode.category}</span><h2>{episode.title}</h2><p>{episode.description}</p><MysteryProgress slug={episode.slug} /><Link className={styles.link} href={`/lab/misterios/${episode.slug}`}>Abrir el caso <ArrowRight size={16} aria-hidden /></Link></article>)}</div>
    <p className="max-w-2xl text-sm leading-7 text-white/60">Puedes probar, corregir y repetir cada episodio, o leer directamente su explicación. Aquí no se hacen reservas ni compras reales. Solo se guarda el episodio completado en este navegador cuando el almacenamiento está disponible.</p>
    <div className={styles.footer}><Link href="/briefing" className={styles.link}>Prepara tu propio proyecto <ArrowRight size={16} aria-hidden /></Link><Link href="/blog" className={styles.link}>Sigue aprendiendo en el blog <ArrowRight size={16} aria-hidden /></Link></div>
  </div></main></>;
}
