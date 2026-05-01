'use client';

import { Check, ArrowRight } from 'lucide-react';
import BeamBorder from '../effects/BeamBorder';
import Holographic from '../effects/Holographic';
import MagneticButton from '../effects/MagneticButton';
import NumberFlow from '../effects/NumberFlow';

export type Plan = {
  badge: string;
  price: number;
  priceSuffix?: string;
  oneTime?: string;
  features: string[];
  cta: { label: string; href: string; target?: string; rel?: string };
  microtext?: string;
  accent?: 'purple' | 'blue' | 'orange' | 'green' | 'yellow';
};

export default function PlanCard({ plan }: { plan: Plan }) {
  const accentMap = {
    purple: 'var(--purple-400)',
    blue: 'var(--accent-web)',
    orange: 'var(--accent-shop)',
    green: 'var(--accent-ia)',
    yellow: 'var(--accent-calc)',
  };
  const accentColor = accentMap[plan.accent || 'purple'];

  return (
    <BeamBorder rounded="rounded-[2rem]">
      <Holographic className="relative flex flex-col p-8 md:p-12" rounded="rounded-[2rem]">
        <div className="mb-8 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40` }}
          >
            ● {plan.badge}
          </span>
          <span className="font-mono text-xs text-white/50">Sin permanencia · 24-48h</span>
        </div>

        <div className="mb-2">
          <span className="font-display text-7xl font-bold leading-none text-white tabular-nums">
            <NumberFlow prefix="" value={plan.price} suffix="€" />
          </span>
          <span className="ml-2 text-base text-white/50">{plan.priceSuffix || '/mes'}</span>
        </div>
        {plan.oneTime && (
          <p className="mb-8 text-sm text-white/60">{plan.oneTime}</p>
        )}

        <ul className="mb-10 space-y-3">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-white/80">
              <span
                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ background: `${accentColor}20`, color: accentColor }}
              >
                <Check size={12} strokeWidth={3} />
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <MagneticButton
          href={plan.cta.href}
          target={plan.cta.target}
          rel={plan.cta.rel}
          accent={plan.accent || 'purple'}
          className="!py-4 !text-base"
        >
          {plan.cta.label} <ArrowRight size={18} />
        </MagneticButton>
        {plan.microtext && (
          <p className="mt-5 text-center text-xs leading-relaxed text-white/45">{plan.microtext}</p>
        )}
      </Holographic>
    </BeamBorder>
  );
}
