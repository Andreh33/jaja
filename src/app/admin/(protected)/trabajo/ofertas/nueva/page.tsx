import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import OfferForm, { type OfferFormData } from '../_components/OfferForm';

export const dynamic = 'force-dynamic';

const EMPTY: OfferFormData = {
  title: '',
  slug: '',
  description: '',
  location: '',
  contractType: '',
  schedule: '',
  salary: '',
  experienceRequired: '',
  languages: '',
  extras: '',
  requiresComputer: 'no',
  positionsCount: 1,
  status: 'borrador',
};

export default function NuevaOfertaPage() {
  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <Link href="/admin/trabajo/ofertas" className="inline-flex items-center gap-2 text-xs text-white/55 hover:text-white">
        <ArrowLeft size={12} /> Todas las ofertas
      </Link>
      <h1 className="mt-6 font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        Nueva oferta
      </h1>
      <p className="mt-2 text-sm text-white/55">Por defecto se crea como borrador (oculta).</p>
      <div className="mt-8 max-w-3xl">
        <OfferForm mode="create" initial={EMPTY} />
      </div>
    </div>
  );
}
