import type { Metadata } from 'next';
import Link from 'next/link';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import Logo from '@/components/layout/Logo';
import ResetClient from './ResetClient';

export const metadata: Metadata = {
  title: 'Restablecer contraseña',
  robots: { index: false, follow: false },
};

export default function ResetPage() {
  return (
    <main id="main-content" tabIndex={-1} className="relative min-h-screen">
      <AuroraBackground intensity="strong" />
      <MouseGlow strong />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/"><Logo /></Link>
      </header>
      <div className="relative z-10 flex min-h-[calc(100svh-90px)] items-center justify-center px-6">
        <ResetClient />
      </div>
    </main>
  );
}
