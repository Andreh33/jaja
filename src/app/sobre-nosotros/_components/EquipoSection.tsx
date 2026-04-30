import Image from 'next/image';
import { Reveal, RevealGroup, RevealItem } from '@/components/effects/Reveal';
import { equipo, type Miembro } from '../_data/equipo';

const fundadores = equipo.find((m) => m.esFundador)!;
const resto = equipo.filter((m) => !m.esFundador);

const photoFrameStyle = {
  borderColor: 'var(--border-subtle)',
  background:
    'radial-gradient(120% 80% at 50% 0%, rgba(139,92,246,0.10), transparent 60%), rgba(13,9,24,0.35)',
};

function Parrafos({ items, className }: { items: string[]; className?: string }) {
  return (
    <div className={className}>
      {items.map((p, i) => (
        <p key={i} className="leading-relaxed">
          {p}
        </p>
      ))}
    </div>
  );
}

function MiembroCard({ miembro }: { miembro: Miembro }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl glass">
      <div className="p-4 md:p-5">
        <div
          className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border"
          style={photoFrameStyle}
        >
          <Image
            src={miembro.foto.src}
            alt={miembro.foto.alt}
            fill
            sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-6 pb-6 md:px-8 md:pb-8">
        <h3 className="font-display text-2xl text-white" style={{ letterSpacing: '-0.02em' }}>
          {miembro.nombre}
        </h3>
        <p className="mt-1 text-sm font-medium" style={{ color: 'var(--purple-300)' }}>
          {miembro.rol}
        </p>
        <Parrafos
          items={miembro.descripcion}
          className="mt-5 space-y-4 border-t pt-5 text-sm text-white/65"
        />
      </div>
    </article>
  );
}

export default function EquipoSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mb-14 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Equipo
            </p>
            <h2
              className="font-display text-4xl md:text-5xl"
              style={{ letterSpacing: '-0.04em', fontWeight: 800 }}
            >
              Las personas detrás de Latech
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base text-white/60">
              Un equipo pequeño, técnico y cercano. Cuando hablas con Latech, hablas con la persona que va a tocar el código de tu proyecto.
            </p>
          </div>
        </Reveal>

        {/* Tarjeta destacada de fundadores */}
        <Reveal>
          <article className="mb-8 overflow-hidden rounded-3xl glass lg:grid lg:grid-cols-12">
            <div className="p-5 md:p-6 lg:col-span-5 lg:flex lg:items-center lg:p-6">
              <div
                className="relative aspect-[688/1228] w-full overflow-hidden rounded-2xl border"
                style={photoFrameStyle}
              >
                <Image
                  src={fundadores.foto.src}
                  alt={fundadores.foto.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col justify-center px-6 pb-8 md:px-10 md:pb-10 lg:col-span-7 lg:px-12 lg:py-12">
              <p
                className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: 'var(--purple-300)' }}
              >
                {fundadores.rol}
              </p>
              <h3
                className="font-display text-3xl md:text-4xl"
                style={{ letterSpacing: '-0.03em', fontWeight: 800 }}
              >
                {fundadores.nombre}
              </h3>
              {fundadores.lema && (
                <p
                  className="mt-5 border-l-2 pl-4 font-display text-lg italic md:text-xl"
                  style={{ borderColor: 'var(--purple-400)', color: 'var(--purple-100)' }}
                >
                  «{fundadores.lema}»
                </p>
              )}
              <Parrafos
                items={fundadores.descripcion}
                className="mt-6 space-y-4 text-[15px] text-white/70"
              />
            </div>
          </article>
        </Reveal>

        {/* Resto del equipo */}
        <RevealGroup className="grid gap-5 sm:grid-cols-2">
          {resto.map((m) => (
            <RevealItem key={m.slug}>
              <MiembroCard miembro={m} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
