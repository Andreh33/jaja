'use client';

import Link from 'next/link';
import { ArrowRight, LifeBuoy } from 'lucide-react';

export default function RecuperarClient() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl glass-strong p-8 md:p-10">
        <h1 className="font-display text-3xl text-white" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
          Recuperar acceso
        </h1>
        <p className="mt-2 text-sm text-white/55">
          La recuperación automática está temporalmente desactivada mientras reforzamos su seguridad.
        </p>

        <div className="mt-7 rounded-2xl glass p-6 text-center">
          <LifeBuoy className="mx-auto text-[var(--brand-300)]" size={28} aria-hidden="true" />
          <div className="font-display mt-4 text-xl text-white">Te ayudamos personalmente</div>
          <p className="mt-3 text-sm text-white/55">
            Escríbenos desde soporte y verificaremos tu identidad antes de recuperar el acceso.
          </p>
          <Link
            href="/contacto"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform active:scale-[0.98] glow-purple"
            style={{ background: 'var(--grad-signature)' }}
          >
            Contactar con soporte <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
