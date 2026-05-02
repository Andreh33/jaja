import Link from 'next/link';
import { MapPin, Briefcase, Clock, ArrowRight } from 'lucide-react';
import type { JobOffer } from '../../../../drizzle/schema';

const ACCENT = 'var(--accent-calc)';

const CONTRACT_LABELS: Record<string, string> = {
  indefinido: 'Indefinido',
  temporal: 'Temporal',
  practicas: 'Prácticas',
  freelance: 'Freelance',
};
const SCHEDULE_LABELS: Record<string, string> = {
  completa: 'Jornada completa',
  parcial: 'Jornada parcial',
  flexible: 'Horario flexible',
};

export default function JobCard({ offer }: { offer: JobOffer }) {
  const closed = offer.status === 'cerrada';

  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl glass p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        closed ? 'opacity-70' : ''
      }`}
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      {closed && (
        <span
          className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: 'rgba(234,179,8,0.15)', color: '#eab308', border: '1px solid rgba(234,179,8,0.35)' }}
        >
          Plaza cubierta
        </span>
      )}

      <h2
        className="font-display text-xl text-white md:text-2xl"
        style={{ letterSpacing: '-0.02em', fontWeight: 700 }}
      >
        {offer.title}
      </h2>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/65">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1">
          <MapPin size={11} className="text-white/40" />
          {offer.location}
        </span>
        {offer.contractType && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1">
            <Briefcase size={11} className="text-white/40" />
            {CONTRACT_LABELS[offer.contractType] ?? offer.contractType}
          </span>
        )}
        {offer.schedule && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1">
            <Clock size={11} className="text-white/40" />
            {SCHEDULE_LABELS[offer.schedule] ?? offer.schedule}
          </span>
        )}
      </div>

      {offer.salary && (
        <p className="mt-3 text-sm text-white/55">{offer.salary}</p>
      )}

      <div className="mt-auto pt-5">
        <Link
          href={`/empleo/${offer.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: ACCENT }}
        >
          Ver detalle <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
