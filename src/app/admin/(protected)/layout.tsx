import type { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';

export const dynamic = 'force-dynamic';

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect('/admin/login');
  if (session.user?.role !== 'ADMIN') redirect('/login');

  return (
    <div className="relative flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Patrón de puntos sutil de fondo. Solo en (protected), no en /admin/login. */}
      <div className="admin-background" aria-hidden="true" />
      <Sidebar admin userName={session.user?.name || session.user?.email || ''} />
      <main className="relative z-10 flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
