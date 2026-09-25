import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CATALOG, formatEUR } from '@/config/catalog';
import { QUOTE_CATALOG, QUOTE_TAX_LABEL } from '@/lib/quotes/catalog';
import { Reveal } from '../effects/Reveal';

export default function PricingBand() {
  return <section className="site-container pb-20" aria-labelledby="price-heading"><Reveal className="price-statement">
    <div><p className="eyebrow">SIN LETRA PEQUEÑA. SIN MISTERIO.</p><h2 id="price-heading">Una web extraordinaria.<br />Un precio muy claro.</h2><p>Creación de tu web a medida, con diseño responsive y SEO técnico. Configura tu proyecto y consulta el desglose antes de contratar.</p></div>
    <div className="price-side"><div className="price-display">{QUOTE_CATALOG.creation.amount / 100}<span>€</span></div><p className="eyebrow">CREACIÓN · PAGO ÚNICO · {QUOTE_TAX_LABEL}</p><p className="mt-4">Hosting y mantenimiento: {formatEUR(CATALOG.hostingMonthly.amount)}/mes.<br />Complementos opcionales, siempre desglosados.</p><Link href="/tienda/calculadora" className="blue-button">Configurar mi web <ArrowUpRight size={17} /></Link></div>
  </Reveal></section>;
}
