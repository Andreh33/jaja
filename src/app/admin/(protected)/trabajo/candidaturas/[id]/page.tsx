import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Download,
  MapPin,
  Calendar,
  FileText,
} from 'lucide-react';
import { getApplicationById, getOfferById } from '@/lib/admin-jobs';
import { formatBytes, formatDate } from '@/lib/utils';
import { whatsappLink } from '@/lib/stripe-links';
import StatusAndNotes from './_components/StatusAndNotes';

export const dynamic = 'force-dynamic';

export default async function CandidaturaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = await getApplicationById(id);
  if (!app) notFound();

  const offer = app.jobOfferId ? await getOfferById(app.jobOfferId) : null;
  const phoneE164 = app.phone.replace(/\s+/g, '').replace('+', '');
  const wppMessage = `Hola ${app.fullName.split(' ')[0]}, te escribo desde Latech por tu candidatura${
    offer ? ` para "${offer.title}"` : ''
  }.`;
  // whatsappLink incluye el número por defecto del proyecto; reemplazamos por el del candidato.
  const wppHref = whatsappLink(wppMessage).replace(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '34684739091',
    phoneE164 || '34684739091',
  );

  const createdAt =
    typeof app.createdAt === 'number' ? new Date(app.createdAt * 1000) : (app.createdAt as Date | null);

  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <Link href="/admin/trabajo/candidaturas" className="inline-flex items-center gap-2 text-xs text-white/55 hover:text-white">
        <ArrowLeft size={12} /> Todas las candidaturas
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* === Main column === */}
        <div className="space-y-6">
          <div className="rounded-2xl glass p-6 md:p-8">
            <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
              {app.fullName}
            </h1>
            <div className="mt-4 grid gap-y-2 gap-x-6 text-sm md:grid-cols-2">
              <div className="flex items-center gap-2 text-white/75">
                <Mail size={13} className="text-white/40" /> {app.email}
              </div>
              <div className="flex items-center gap-2 text-white/75">
                <Phone size={13} className="text-white/40" /> {app.phone}
              </div>
              <div className="flex items-center gap-2 text-white/75">
                <MapPin size={13} className="text-white/40" /> {app.city}
              </div>
              <div className="flex items-center gap-2 text-white/55">
                <Calendar size={13} className="text-white/40" /> Recibida {createdAt ? formatDate(createdAt) : '—'}
              </div>
            </div>
          </div>

          <div className="rounded-2xl glass p-6 md:p-8">
            <h2 className="font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
              Aplicación a
            </h2>
            {offer ? (
              <p className="mt-2 text-sm text-white/85">
                <Link href={`/admin/trabajo/ofertas/${offer.id}`} className="text-white hover:underline">
                  {offer.title}
                </Link>{' '}
                <span className="text-white/45">— {offer.location} · {offer.status}</span>
              </p>
            ) : app.offerTitleSnapshot ? (
              <p className="mt-2 text-sm text-white/85">
                <span className="italic text-white/65">Oferta original (ya no existe):</span> {app.offerTitleSnapshot}
              </p>
            ) : (
              <p className="mt-2 text-sm italic text-white/55">Candidatura espontánea.</p>
            )}

            {app.hasComputer && (
              <p className="mt-4 text-xs uppercase tracking-wider text-white/45">
                Ordenador propio:{' '}
                <span className="font-medium text-white/85">{app.hasComputer === 'si' ? 'Sí' : 'No'}</span>
              </p>
            )}

            {app.message && (
              <>
                <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-white/55">Mensaje</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/80">{app.message}</p>
              </>
            )}
          </div>

          <div className="rounded-2xl glass p-6 md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
                CV adjunto
              </h2>
              <a
                href={app.cvBlobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-black"
                style={{ background: 'var(--accent-calc)' }}
              >
                <Download size={14} /> Descargar CV
              </a>
            </div>
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/65">
              <FileText size={13} className="text-white/40" />
              {app.cvFilename} <span className="text-white/40">· {formatBytes(app.cvSizeBytes)}</span>
            </p>
          </div>

          <StatusAndNotes
            applicationId={app.id}
            initialStatus={app.status as 'pendiente' | 'contactado' | 'descartado' | 'contratado'}
            initialNotes={app.adminNotes ?? ''}
          />
        </div>

        {/* === Sidebar actions === */}
        <aside className="space-y-3">
          <div className="rounded-2xl glass p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Contacto rápido</h3>
            <div className="mt-3 space-y-2">
              <a href={wppHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
                <MessageCircle size={14} style={{ color: '#25D366' }} /> WhatsApp
              </a>
              <a href={`tel:${app.phone}`} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
                <Phone size={14} className="text-purple-300" /> Llamar {app.phone}
              </a>
              <a href={`mailto:${app.email}`} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
                <Mail size={14} className="text-purple-300" /> Email
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
