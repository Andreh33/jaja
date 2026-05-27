import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sin conexión',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon-192.png"
        alt="Latech"
        width={72}
        height={72}
        className="mb-6 rounded-2xl"
        style={{ boxShadow: '0 0 50px rgba(139,92,246,0.35), 0 0 80px rgba(249,115,22,0.15)' }}
      />
      <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.03em', fontWeight: 800 }}>
        Sin conexión
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-white/60">
        Parece que no tienes internet ahora mismo. Revisa tu conexión y vuelve a intentarlo —
        la app de Latech seguirá aquí.
      </p>
    </main>
  );
}
