import Image from 'next/image';
import { Reveal, RevealGroup, RevealItem } from '@/components/effects/Reveal';
import { equipo, type Miembro } from '../_data/equipo';

const fundadores = equipo.find((m) => m.esFundador)!;
const resto = equipo.filter((m) => !m.esFundador);

const LINE_COLORS: Record<string, string> = {
  fundadores: 'var(--accent-web)',          // azul
  'ricardo-perez': 'var(--accent-ia)',      // verde
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
    <article
      className="team-line flex h-full flex-col overflow-hidden rounded-3xl glass"
      style={{ ['--team-line-color' as string]: LINE_COLORS[miembro.slug] }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={miembro.foto.src}
          alt={miembro.foto.alt}
          fill
          sizes="(min-width: 1024px) 32vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h3 className="font-display text-[21px] text-white" style={{ letterSpacing: '-0.02em' }}>
          {miembro.nombre}
        </h3>
        <p className="mt-1 text-[13px] font-medium" style={{ color: 'var(--purple-300)' }}>
          {miembro.rol}
        </p>
        <Parrafos
          items={miembro.descripcion}
          className="mt-4 space-y-3 border-t pt-4 text-[14px] text-white/65"
        />
      </div>
    </article>
  );
}

export default function EquipoSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Equipo
            </p>
            <h2
              className="font-display text-3xl md:text-4xl"
              style={{ letterSpacing: '-0.04em', fontWeight: 800 }}
            >
              Las personas detrás de Latech
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-white/60">
              Un equipo pequeño, técnico y cercano. Cuando hablas con Latech, hablas con la persona que va a tocar el código de tu proyecto.
            </p>
          </div>
        </Reveal>

        {/* Tarjeta destacada de fundadores */}
        <Reveal>
          <article
            className="team-line mb-6 overflow-hidden rounded-3xl glass lg:grid lg:min-h-[440px] lg:grid-cols-12"
            style={{ ['--team-line-color' as string]: LINE_COLORS[fundadores.slug] }}
          >
            <div className="relative aspect-[688/982] w-full overflow-hidden lg:col-span-5 lg:aspect-auto lg:h-full lg:min-h-[440px]">
              <Image
                src={fundadores.foto.src}
                alt={fundadores.foto.alt}
                fill
                priority
                sizes="(min-width: 1024px) 36vw, 100vw"
                className="object-contain object-center"
              />
            </div>
            <div className="flex flex-col justify-center p-6 md:p-8 lg:col-span-7 lg:p-10">
              <p
                className="mb-3 text-[12px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: 'var(--purple-300)' }}
              >
                {fundadores.rol}
              </p>
              <h3
                className="font-display text-[25px] md:text-[31px]"
                style={{ letterSpacing: '-0.03em', fontWeight: 800 }}
              >
                {fundadores.nombre}
              </h3>
              {fundadores.lema && (
                <p
                  className="mt-4 border-l-2 pl-3 font-display text-[17px] italic md:text-[19px]"
                  style={{ borderColor: 'var(--purple-400)', color: 'var(--purple-100)' }}
                >
                  «{fundadores.lema}»
                </p>
              )}
              <Parrafos
                items={fundadores.descripcion}
                className="mt-5 space-y-3 text-[14px] text-white/70"
              />
            </div>
          </article>
        </Reveal>

        {/* Resto del equipo. Layout adapta según cuántos miembros haya
            para evitar huecos visuales cuando el array cambia. */}
        <RevealGroup
          className={
            resto.length === 1
              ? 'mx-auto max-w-md'
              : 'grid gap-5 sm:grid-cols-2'
          }
        >
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
