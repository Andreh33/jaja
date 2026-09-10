import Link from 'next/link';
import { ArrowUpRight, NotebookPen } from 'lucide-react';
import { ARTICLE_DECISIONS } from '@/lib/briefing';

export default function BriefingDecision({ slug }: { slug: string }) {
  const decision = ARTICLE_DECISIONS[slug as keyof typeof ARTICLE_DECISIONS];
  if (!decision) return null;
  return (
    <aside className="mx-auto mt-10 max-w-3xl px-6" aria-label="Lleva esta idea a tu proyecto">
      <div className="rounded-2xl border border-purple-300/30 bg-purple-400/[.07] p-6 sm:p-8">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-200"><NotebookPen size={16} /> Tu proyecto, sin puntos ciegos</p>
        <h2 className="mt-4 font-display text-2xl font-semibold text-white">{decision.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70">{decision.text}</p>
        <Link href={`/briefing?decision=${decision.id}`} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full border border-purple-300/40 px-5 py-3 text-sm font-semibold text-purple-100 outline-none hover:bg-purple-400/15 focus-visible:ring-2 focus-visible:ring-purple-200">Llevar esta idea a mi briefing <ArrowUpRight size={16} /></Link>
        <p className="mt-3 text-xs leading-relaxed text-white/50">Tú decides qué incorporar. Sin cuenta y sin enviar nada al abrirlo.</p>
      </div>
    </aside>
  );
}
