import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import { getMystery } from '@/lib/lab-mysteries';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Misterios de negocio del Laboratorio Latech';
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const episode = getMystery(slug); if (!episode) notFound();
  return new ImageResponse(<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: '64px', background: '#07050e', color: '#fff', fontFamily: 'sans-serif', backgroundImage: 'radial-gradient(ellipse at top right, #342056, #07050e 70%)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c084fc', fontSize: 23, letterSpacing: '3px' }}><span>LATECH / LAB</span><span>CASO {episode.number}</span></div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}><span style={{ fontSize: 22, color: '#fbbf24' }}>{episode.category}</span><span style={{ fontSize: 78, lineHeight: 1.04, fontWeight: 700, letterSpacing: '-3px', maxWidth: 950 }}>{episode.title}</span></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, color: '#d5c6df' }}><span>Prueba. Corrige. Comprueba.</span><span>serviciosonlineweb.com</span></div>
  </div>, size);
}
