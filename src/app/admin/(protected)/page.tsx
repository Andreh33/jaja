import { db } from '@/lib/db';
import { users, archivos, contactMessages } from '../../../../drizzle/schema';
import { desc, eq, gte } from 'drizzle-orm';
import Link from 'next/link';
import Holographic from '@/components/effects/Holographic';
import { Users, FolderOpen, Mail, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const allClients = await db.select().from(users).where(eq(users.role, 'CLIENT'));
  const allFiles = await db.select().from(archivos).orderBy(desc(archivos.uploadedAt)).limit(10);
  const unreadMessages = await db.select().from(contactMessages).where(eq(contactMessages.read, false));
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const recentClients = allClients.filter((c) => c.createdAt && new Date(c.createdAt) >= monthAgo);
  const lastFive = [...allClients].sort((a, b) => (b.createdAt ? +new Date(b.createdAt) : 0) - (a.createdAt ? +new Date(a.createdAt) : 0)).slice(0, 5);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const filesToday = await db.select().from(archivos).where(gte(archivos.uploadedAt, today));

  const KPIS = [
    { v: allClients.length, label: 'Clientes totales', icon: Users, color: 'var(--purple-300)' },
    { v: recentClients.length, label: 'Nuevos este mes', icon: Sparkles, color: 'var(--accent-shop)' },
    { v: filesToday.length, label: 'Archivos hoy', icon: FolderOpen, color: 'var(--accent-web)' },
    { v: unreadMessages.length, label: 'Mensajes sin leer', icon: Mail, color: 'var(--accent-ia)' },
  ];

  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-white/55">Resumen global de la plataforma.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <Holographic key={k.label} className="p-6" rounded="rounded-2xl">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${k.color}1A`, border: `1px solid ${k.color}40`, color: k.color }}>
                <Icon size={18} strokeWidth={1.6} />
              </div>
              <div className="font-display text-3xl text-white">{k.v}</div>
              <div className="mt-2 text-xs uppercase tracking-wider text-white/50">{k.label}</div>
            </Holographic>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl glass p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl text-white">Últimos clientes</h2>
            <Link href="/admin/clientes" className="text-xs text-white/60 hover:text-white link-underline">Ver todos →</Link>
          </div>
          {lastFive.length === 0 ? (
            <p className="text-sm text-white/50">Aún no hay clientes registrados.</p>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {lastFive.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: 'var(--grad-signature)' }}>
                      {(c.name?.[0] || c.email[0]).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{c.name || c.email}</div>
                      <div className="truncate text-xs text-white/45">{c.email}</div>
                    </div>
                  </div>
                  <Link href={`/admin/clientes/${c.id}`} className="text-xs text-white/60 hover:text-white link-underline">
                    Ver →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl glass p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl text-white">Archivos recientes</h2>
            <span className="text-xs text-white/45">Últimos 10</span>
          </div>
          {allFiles.length === 0 ? (
            <p className="text-sm text-white/50">Aún no hay archivos subidos.</p>
          ) : (
            <ul className="space-y-2.5">
              {allFiles.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-white/5">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-white/85">{f.filename}</div>
                    <div className="text-[10px] text-white/40">{f.uploadedAt ? formatDate(f.uploadedAt) : ''}</div>
                  </div>
                  <Link href={`/admin/clientes/${f.userId}`} className="shrink-0 text-xs text-white/60 hover:text-white">Ver →</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {unreadMessages.length > 0 && (
        <div className="mt-6 rounded-2xl border p-5" style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg text-white">Tienes {unreadMessages.length} mensaje(s) sin leer</h3>
              <p className="mt-1 text-xs text-white/60">Responde rápido para mantener nuestra promesa de menos de 24h.</p>
            </div>
            <Link href="/admin/mensajes" className="rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ background: 'var(--grad-signature)' }}>
              Ver mensajes
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
