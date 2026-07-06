import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginClient from './LoginClient';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import Logo from '@/components/layout/Logo';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Acceso',
  description: 'Acceso a tu panel de Latech.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <main className="relative min-h-screen">
      <AuroraBackground intensity="strong" />
      <MouseGlow strong />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/"><Logo size="md" /></Link>
        <Link href="/" className="text-sm text-white/60 hover:text-white">← Volver</Link>
      </header>
      <div className="relative z-10 flex min-h-[calc(100svh-90px)] items-center justify-center px-6">
        <Suspense fallback={null}>
          <LoginClient />
        </Suspense>
      </div>
    </main>
  );
}
