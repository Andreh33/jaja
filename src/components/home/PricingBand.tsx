import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '../effects/Reveal';
import AnswerBox from '../seo/AnswerBox';
import ComparisonTable from '../seo/ComparisonTable';

/**
 * Banda de precios citable en la home: respuesta directa ("cuánto cuesta una
 * web en España") + tabla de precios públicos. Es un activo GEO/CRO —el sector
 * esconde el precio tras formulario— y refuerza la ventaja de precio cerrado
 * de Latech. Server component sin JS.
 */
export default function PricingBand() {
  return (
    <section className="relative z-10 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Precios claros</p>
          <h2 className="font-display text-4xl md:text-5xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
            ¿Cuánto cuesta una web<br />
            <span style={{ color: 'var(--purple-300)' }}>profesional en España?</span>
          </h2>
          <div className="mt-8">
            <AnswerBox question="Respuesta rápida">
              Una página web profesional con Latech cuesta <strong className="text-white">600 € de creación
              más 60 €/mes</strong>; una tienda online, 600 € más 80 €/mes; y un agente de IA, desde 150 €/mes.
              Precios públicos y cerrados, sin permanencia y con entrega en 24-48 horas para empresas de toda España.
            </AnswerBox>
          </div>
          <div className="mt-6">
            <ComparisonTable
              headers={['Servicio', 'Creación (pago único)', 'Cuota mensual']}
              rows={[
                ['Página web', '600 €', '60 €/mes'],
                ['Tienda online', '600 €', '80 €/mes'],
                ['Agente de IA', 'Sin coste de alta', 'Desde 150 €/mes'],
              ]}
              caption="Precios Latech · IVA no incluido"
            />
          </div>
          <Link
            href="/tienda"
            className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            Ver todos los planes y qué incluye cada uno <ArrowRight size={14} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
