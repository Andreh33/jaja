import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
export const metadata: Metadata = { title: '404 · Latech', robots: { index: false, follow: true } };
export default function GlobalNotFound() {
  return <html lang="es"><body><main id="main-content" style={{ maxWidth: 720, margin: '15vh auto', padding: 24 }}><h1>404 · Página no encontrada</h1><p>La dirección no existe. / This page does not exist.</p><Link href="/">Latech · Inicio / Home</Link><nav aria-label="Idiomas" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 32 }}>{[['en','English'],['fr','Français'],['de','Deutsch'],['pt','Português'],['it','Italiano']].map(([code,name]) => <a key={code} href={`/${code}`}>{name}</a>)}</nav></main></body></html>;
}
