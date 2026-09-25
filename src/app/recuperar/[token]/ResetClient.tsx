'use client';

import Link from 'next/link';
import { ArrowRight, ShieldAlert } from 'lucide-react';

export default function ResetClient() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl glass-strong p-8 md:p-10">
        <ShieldAlert className="text-[var(--brand-300)]" size={30} aria-hidden="true" />
        <h1 className="font-display mt-5 text-3xl text-white" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
          Enlace desactivado
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Por seguridad, los enlaces de recuperación anteriores ya no son válidos. Contacta con soporte para verificar tu identidad y recuperar el acceso.
        </p>
        <Link
          href="/contacto"
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform active:scale-[0.98] glow-purple"
          style={{ background: 'var(--grad-signature)' }}
        >
          Contactar con soporte <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <Link
          href="/login"
          className="mt-3 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white/65 transition-colors hover:text-white"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
