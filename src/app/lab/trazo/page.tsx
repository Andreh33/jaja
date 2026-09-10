import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';
import TraceExperience from './TraceExperience';
import styles from './trace.module.css';

const description = 'Dibuja una línea, conviértela en plataformas y reta a alguien con el mismo recorrido. Un juego creativo de Latech Lab, sin registro.';
export const metadata: Metadata = {
  title: 'Tu trazo, un mundo · Latech Lab', description,
  alternates: { canonical: '/lab/trazo' },
  openGraph: { title: 'Tu trazo, un mundo · Latech Lab', description, url: '/lab/trazo', type: 'website' },
};
export default async function TracePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  return <main id="main-content" className={styles.shell}>
    <JsonLd data={breadcrumbJsonLd([{ name: 'Inicio', path: '/' }, { name: 'Latech Lab', path: '/lab' }, { name: 'Tu trazo, un mundo', path: '/lab/trazo' }])} />
    <header className={styles.header}>
      <Link href="/lab" className={styles.back}><ArrowLeft size={16} /> Latech Lab</Link>
      <p className={styles.eyebrow}>Una idea de tu mano</p>
      <h1>Tu trazo,<br /><span>un mundo.</span></h1>
      <p>Hay ideas que empiezan con una línea. Dibuja la tuya, entra en ella y pásale el reto a alguien.</p>
    </header>
    <noscript><p className={styles.status}>Para dibujar y jugar necesitas activar JavaScript. Puedes <a href="#trace-explanation">leer cómo convertimos el trazo en plataformas</a> o seguir explorando Latech Lab.</p></noscript>
    <TraceExperience key={typeof params.level === 'string' ? params.level : 'new'} sharedToken={typeof params.level === 'string' ? params.level : undefined} />
  </main>;
}
