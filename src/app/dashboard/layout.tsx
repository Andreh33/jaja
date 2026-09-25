import type { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar userName={session.user?.name || session.user?.email || ''} />
      <main id="main-content" tabIndex={-1} className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
