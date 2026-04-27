import type { Metadata } from 'next';
import Link from 'next/link';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import Logo from '@/components/layout/Logo';
import AdminLoginClient from './AdminLoginClient';

export const metadata: Metadata = { title: 'Admin · Acceso' };

export default function AdminLoginPage() {
  return (
    <main className="relative min-h-screen">
      <AuroraBackground intensity="subtle" />
      <MouseGlow />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/"><Logo /></Link>
        <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' }}>
          ZONA RESTRINGIDA
        </span>
      </header>
      <div className="relative z-10 flex min-h-[calc(100svh-90px)] items-center justify-center px-6">
        <AdminLoginClient />
      </div>
    </main>
  );
}
