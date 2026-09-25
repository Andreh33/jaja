import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { whatsappLink } from '@/lib/stripe-links';
import { Reveal } from '../effects/Reveal';

export default function CTABanner() {
  return <section className="blue-cta"><Reveal className="site-container"><p className="eyebrow"><span className="status-dot" /> TU PRÓXIMO GRAN PROYECTO</p><h2>Lo normal<br /><span>se queda corto.</span></h2><p>Si tienes una idea que no cabe en una plantilla, estamos deseando escucharla. Construyamos algo que merezca la pena.</p><div className="hero-actions"><a href={whatsappLink('Hola, tengo una idea. Hablemos de mi proyecto.')} className="blue-button" target="_blank" rel="noopener noreferrer">Hagamos que pase <ArrowUpRight size={18} /></a><Link href="/tienda/calculadora" className="text-button">Calcular presupuesto <ArrowUpRight size={17} /></Link></div></Reveal></section>;
}
