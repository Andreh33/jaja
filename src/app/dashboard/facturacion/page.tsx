import Link from 'next/link';
import { CreditCard, ExternalLink, MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/lib/stripe-links';

export const dynamic = 'force-dynamic';

export default function FacturacionPage() {
  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        Facturación
      </h1>
      <p className="mt-2 text-sm text-white/55">Gestiona tu plan y descarga tus facturas.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl glass p-6 md:p-8">
          <p className="text-xs uppercase tracking-wider text-white/45">Plan actual</p>
          <div className="mt-3 font-display text-2xl text-white">Sin plan asignado</div>
          <p className="mt-2 text-sm text-white/55">
            Cuando contrates un servicio en la tienda, aparecerá aquí con su próximo cobro y opciones de gestión.
          </p>
          <Link href="/tienda" className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white" style={{ background: 'var(--grad-signature)' }}>
            <CreditCard size={14} /> Ver planes
          </Link>
        </div>

        <div className="rounded-2xl glass p-6 md:p-8">
          <p className="text-xs uppercase tracking-wider text-white/45">Próximo cobro</p>
          <div className="mt-3 font-display text-2xl text-white">—</div>
          <p className="mt-2 text-sm text-white/55">
            Aún no hay cobros programados.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl glass p-6 md:p-8">
        <h2 className="font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
          Historial de facturas
        </h2>
        <p className="mt-2 text-sm text-white/55">
          Todavía no se han generado facturas. Una vez activo tu plan, aparecerán aquí descargables en PDF.
        </p>
        <div className="mt-6 rounded-xl border border-dashed py-12 text-center text-sm text-white/40" style={{ borderColor: 'var(--border-subtle)' }}>
          Sin facturas todavía.
        </div>
      </div>

      <div className="mt-6 rounded-2xl glass p-6 md:p-8">
        <h2 className="font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
          ¿Necesitas una factura específica o cambiar algo?
        </h2>
        <p className="mt-2 text-sm text-white/55">Escríbenos por WhatsApp o email y te lo gestionamos al momento.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={whatsappLink('Hola, necesito gestionar una factura')} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm">
            <MessageCircle size={14} style={{ color: '#25D366' }} /> WhatsApp
          </a>
          <a href="mailto:info@latech.es" className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm">
            <ExternalLink size={14} /> info@latech.es
          </a>
        </div>
      </div>
    </div>
  );
}
