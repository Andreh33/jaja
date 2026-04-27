import type { Metadata } from 'next';
import Link from 'next/link';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import Logo from '@/components/layout/Logo';
import RecuperarClient from './RecuperarClient';

export const metadata: Metadata = {
  title: 'Recuperar contraseña',
  description: 'Recupera el acceso a tu cuenta de Latech.',
};

export default function RecuperarPage() {
  return (
    <main className="relative min-h-screen">
      <AuroraBackground intensity="strong" />
      <MouseGlow strong />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/"><Logo /></Link>
        <Link href="/login" className="text-sm text-white/60 hover:text-white">← Iniciar sesión</Link>
      </header>
      <div className="relative z-10 flex min-h-[calc(100svh-90px)] items-center justify-center px-6">
        <RecuperarClient />
      </div>
    </main>
  );
}
