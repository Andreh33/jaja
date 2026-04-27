'use client';

import { Marquee } from '../effects/Marquee';

const TECHS = [
  'Next.js', 'React', 'TypeScript', 'Stripe', 'n8n', 'OpenAI', 'Vercel', 'Tailwind', 'Framer Motion', 'Three.js', 'PostgreSQL', 'Turso', 'Drizzle', 'GSAP', 'Bizum', 'Anthropic',
];

export default function TechMarquee() {
  return (
    <section className="relative z-10 border-y" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
      <div className="py-7">
        <Marquee speed={40} pauseOnHover>
          {TECHS.map((t, i) => (
            <span key={i} className="flex items-center gap-10 pl-10 font-mono text-sm text-white/30 transition-colors hover:text-white/90">
              {t}
              <span className="inline-block h-1 w-1 rounded-full bg-white/15" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
