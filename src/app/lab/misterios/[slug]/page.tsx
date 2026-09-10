import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { MYSTERIES, getMystery } from '@/lib/lab-mysteries';
import MysteryExperience from '../MysteryExperience';
import MysteryProgress from '../MysteryProgress';
import styles from '../mysteries.module.css';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return MYSTERIES.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const episode = getMystery(slug);
  if (!episode) return {};
  const title = `${episode.title}: misterio interactivo`;
  const url = `/lab/misterios/${episode.slug}`;
  return { title, description: episode.description, alternates: { canonical: url },
    openGraph: { title, description: episode.description, url, type: 'website' },
    twitter: { card: 'summary_large_image', title, description: episode.description },
  };
}
export default async function MysteryPage({ params }: Props) {
  const { slug } = await params; const episode = getMystery(slug); if (!episode) notFound();
  const next = MYSTERIES[(MYSTERIES.indexOf(episode) + 1) % MYSTERIES.length];
  return <><AuroraBackground intensity="subtle" /><main className={styles.page}><div className={styles.container}>
    <Link className={styles.eyebrow} href="/lab/misterios">← Misterios / caso {episode.number}</Link>
    <h1 className={styles.heading}>{episode.title}</h1><p className={styles.lede}>{episode.description}</p><span className={styles.tag}>Demostración ficticia · ningún pedido o reserva real</span>
    <MysteryProgress slug={episode.slug} />
    <noscript><p className="mt-5 text-sm leading-relaxed text-white/70">La demo interactiva necesita JavaScript. Puedes <a href="#aprendizaje" className="underline underline-offset-4">leer la explicación y su lista de comprobación</a> sin jugar.</p></noscript>
    <MysteryExperience key={episode.slug} episode={episode} />
    <section className={styles.lesson} id="aprendizaje" aria-labelledby="lesson-title"><p className={styles.eyebrow}>Llévatelo a tu web</p><h2 id="lesson-title">Qué comprobar en un proyecto real</h2><p>{episode.lesson}</p><ul>{episode.checklist.map((item) => <li key={item}>{item}</li>)}</ul><div className={styles.footer}><Link className={styles.link} href={episode.article}>{episode.articleLabel} <ArrowRight size={16} aria-hidden /></Link><Link className={styles.link} href={episode.service}>Ver cómo podemos ayudarte <ArrowRight size={16} aria-hidden /></Link></div></section>
    <div className={styles.footer}><Link className={styles.link} href={`/lab/misterios/${next.slug}`}>Siguiente caso: {next.title} <ArrowRight size={16} aria-hidden /></Link><Link className={styles.link} href="/briefing">Llévalo a tu briefing <ArrowRight size={16} aria-hidden /></Link></div>
  </div></main></>;
}
