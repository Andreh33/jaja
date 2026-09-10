import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';
import { experiments, getExperiment } from '../_lib/experiments';
import ExperimentArt from '../_components/ExperimentArt';
import LabExperiment from '../_components/LabExperiment';
import styles from '../lab.module.css';

type Props = { params: Promise<{ experimento: string }> };
export function generateStaticParams() { return experiments.map((experiment) => ({ experimento: experiment.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const experiment = getExperiment((await params).experimento);
  if (!experiment) notFound();
  return {
    title: `${experiment.title} · Latech Lab`, description: experiment.description,
    alternates: { canonical: `/lab/${experiment.slug}` },
    openGraph: { title: experiment.title, description: experiment.description, url: `/lab/${experiment.slug}`, type: 'website' },
    twitter: { card: 'summary_large_image', title: experiment.title, description: experiment.description },
  };
}
export default async function ExperimentPage({ params }: Props) {
  const experiment = getExperiment((await params).experimento);
  if (!experiment) notFound();
  return <main className={styles.shell} id="main-content">
    <JsonLd data={breadcrumbJsonLd([{ name: 'Inicio', path: '/' }, { name: 'Latech Lab', path: '/lab' }, { name: experiment.title, path: `/lab/${experiment.slug}` }])} />
    <section className={styles.experimentHeader}><Link href="/lab" className={styles.backLink}><ArrowLeft size={16} /> Todos los experimentos</Link><p className={styles.eyebrow}>{experiment.category} / Latech Lab</p><h1>{experiment.title}</h1><p className={styles.lead}>{experiment.description}</p></section>
    <section className={styles.playSection} aria-label={`Prueba ${experiment.title}`}><LabExperiment kind={experiment.slug} action={experiment.action}><ExperimentArt kind={experiment.slug} /></LabExperiment></section>
    <section className={styles.instructions} aria-labelledby="how-to-title"><div><p className={styles.eyebrow}>Antes de entrar</p><h2 id="how-to-title">Así se juega.<br />Así se explora.</h2></div><ol>{experiment.controls.map((control) => <li key={control}>{control}</li>)}</ol></section>
    <section className={styles.details}><div><h2>Lo que estás probando</h2><p>{experiment.detail}</p></div><div><h2>Tus datos y tu progreso</h2><p>{experiment.privacy}</p></div></section>
    <section className={styles.related}><div><p className={styles.eyebrow}>Sigue curioseando</p><h2>Prueba otra idea.</h2></div><div className={styles.relatedLinks}>{experiments.filter((item) => item.slug !== experiment.slug).slice(0, 3).map((item) => <Link href={`/lab/${item.slug}`} key={item.slug}><span>{item.title}</span><ArrowUpRight size={19} /></Link>)}</div></section>
    <div className={styles.projectLink}><p>¿Y si tu web tuviera una experiencia propia?</p><Link href="/tienda/calculadora" className={styles.textLink}>Configura tu proyecto <ArrowUpRight size={19} /></Link></div>
  </main>;
}
