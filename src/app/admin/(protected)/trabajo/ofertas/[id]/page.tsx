import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getOfferById } from '@/lib/admin-jobs';
import OfferForm, { type OfferFormData } from '../_components/OfferForm';

export const dynamic = 'force-dynamic';

export default async function EditarOfertaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await getOfferById(id);
  if (!offer) notFound();

  const initial: OfferFormData = {
    id: offer.id,
    slug: offer.slug,
    title: offer.title,
    description: offer.description,
    location: offer.location,
    contractType: (offer.contractType as OfferFormData['contractType']) ?? '',
    schedule: (offer.schedule as OfferFormData['schedule']) ?? '',
    salary: offer.salary ?? '',
    experienceRequired: offer.experienceRequired ?? '',
    languages: offer.languages ?? '',
    extras: offer.extras ?? '',
    requiresComputer: offer.requiresComputer as OfferFormData['requiresComputer'],
    positionsCount: offer.positionsCount,
    status: offer.status as OfferFormData['status'],
  };

  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <Link href="/admin/trabajo/ofertas" className="inline-flex items-center gap-2 text-xs text-white/55 hover:text-white">
        <ArrowLeft size={12} /> Todas las ofertas
      </Link>
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
          Editar oferta
        </h1>
        {offer.status !== 'borrador' && (
          <a
            href={`/empleo/${offer.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-white/65 hover:text-white"
          >
            Ver pública <ExternalLink size={11} />
          </a>
        )}
      </div>
      <p className="mt-2 font-mono text-[11px] text-white/40">/empleo/{offer.slug} · {offer.status}</p>
      <div className="mt-8 max-w-3xl">
        <OfferForm mode="edit" initial={initial} />
      </div>
    </div>
  );
}
