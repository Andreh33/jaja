'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Home, Building2, FolderOpen, User, Lock, CreditCard, LogOut, ArrowLeft, Shield, Users, FileText, Inbox, Briefcase } from 'lucide-react';
import Logo from '../layout/Logo';
import { cn } from '@/lib/utils';

const CLIENT_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/empresa', label: 'Mi empresa', icon: Building2 },
  { href: '/dashboard/archivos', label: 'Mis archivos', icon: FolderOpen },
  { href: '/dashboard/perfil', label: 'Perfil', icon: User },
  { href: '/dashboard/seguridad', label: 'Seguridad', icon: Lock },
  { href: '/dashboard/facturacion', label: 'Facturación', icon: CreditCard },
];

const ADMIN_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/mensajes', label: 'Mensajes', icon: Inbox },
  { href: '/admin/trabajo', label: 'Trabajo', icon: Briefcase },
];

export default function Sidebar({ admin = false, userName = '' }: { admin?: boolean; userName?: string }) {
  const pathname = usePathname();
  const items = admin ? ADMIN_ITEMS : CLIENT_ITEMS;

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r md:flex" style={{ borderColor: 'var(--border-subtle)', background: 'rgba(7,5,14,0.6)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0 }}>
      <div className="flex h-20 items-center px-6">
        <Link href="/" aria-label="Latech inicio">
          <Logo size="sm" />
        </Link>
        {admin && (
          <span className="ml-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <Shield size={9} /> Admin
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 border-y px-6 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ background: 'var(--grad-signature)' }}
        >
          {(userName?.[0] || 'U').toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white">{userName || 'Usuario'}</div>
          <div className="text-[10px] uppercase tracking-wider text-white/40">{admin ? 'Administrador' : 'Cliente'}</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.href || (it.href !== '/dashboard' && it.href !== '/admin' && pathname?.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                active ? 'text-white' : 'text-white/55 hover:bg-white/5 hover:text-white',
              )}
              style={active ? { background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' } : {}}
            >
              <Icon size={16} strokeWidth={1.6} />
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t p-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/55 transition-colors hover:bg-white/5 hover:text-white">
          <ArrowLeft size={14} /> Volver a la web
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/55 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={14} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
