import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getArticleDecision } from '@/lib/briefing';
import BriefingClient from './BriefingClient';

export const metadata: Metadata = {
  title: 'Briefing para tu web, tienda o agente IA',
  description: 'Define objetivos, materiales, integraciones y criterios de entrega. Prepara y exporta tu briefing sin registro; comparte con Latech solo cuando lo decidas.',
  alternates: { canonical: '/briefing' },
  openGraph: { title: 'Tu proyecto, sin puntos ciegos · Latech', description: 'Define objetivos, materiales, integraciones y criterios de entrega. Prepara y exporta tu briefing sin registro.', url: '/briefing', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Tu proyecto, sin puntos ciegos · Latech', description: 'Prepara el briefing de tu web, tienda o agente IA y compártelo solo cuando lo decidas.' },
};
export default async function BriefingPage({ searchParams }: { searchParams: Promise<{ decision?: string | string[] }> }) {
  const params = await searchParams;
  const decision = getArticleDecision(typeof params.decision === 'string' ? params.decision : undefined);
  return <><Navbar /><BriefingClient decisionId={decision?.id} /><Footer /></>;
}
