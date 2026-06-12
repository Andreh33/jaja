import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import AuroraBackground from '@/components/effects/AuroraBackground';
import Logo from '@/components/layout/Logo';

export const metadata: Metadata = {
  title: 'Formación comercial',
  description: 'Curso de formación para el equipo comercial de Latech.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function CursosLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen">
      <AuroraBackground intensity="subtle" />
      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <Link href="/" aria-label="Latech inicio"><Logo size="sm" /></Link>
        <Link href="/" className="text-sm text-white/60 transition-colors hover:text-white">← Inicio</Link>
      </header>
      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-20">{children}</div>
    </main>
  );
}
