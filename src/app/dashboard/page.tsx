import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { archivos, empresas } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import Link from 'next/link';
import { Building2, FolderOpen, Sparkles, MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/lib/stripe-links';
import { getActiveLocalSubscription } from '@/lib/billing-data';
import { categoryFromCatalogId, type ServiceCategory } from '@/config/catalog';

export const dynamic = 'force-dynamic';

type CartLineLocal = { catalog_id: string; quantity?: number; amount_subtotal?: number };

function fmtDate(unix: number | null | undefined): string {
  if (!unix) return '';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(unix * 1000));
}

export default async function DashboardHome() {
  const session = await auth();
  const userId = session!.user.id;
  const [filesCount] = await db.select({ count: archivos.id }).from(archivos).where(eq(archivos.userId, userId));
  const filesAll = await db.select().from(archivos).where(eq(archivos.userId, userId));
  const empresa = (await db.select().from(empresas).where(eq(empresas.userId, userId)).limit(1))[0];
  const subscription = await getActiveLocalSubscription(userId);

  const items = (subscription?.items as CartLineLocal[] | null) ?? [];
  const services = new Set<ServiceCategory>();
  for (const it of items) {
    const cat = categoryFromCatalogId(it.catalog_id);
    if (cat) services.add(cat);
  }

  const desc = empresa?.descripcion || '';
  const hasLogo = filesAll.some((f) => f.category === 'logo');
  const photosCount = filesAll.filter((f) => f.category === 'foto').length;

  const checklist = [
    { done: !!empresa?.nombre && desc.length >= 200, label: 'Completa la info de tu empresa' },
    { done: hasLogo, label: 'Sube tu logo' },
    { done: photosCount >= 5, label: 'Sube al menos 5 fotos' },
    { done: !!empresa?.horarios && !!empresa?.redes, label: 'Indica horarios y redes sociales' },
  ];

  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <WelcomeBanner name={session?.user?.name || ''} />

      <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        Hola{session?.user?.name ? `, ${session.user.name}` : ''} 👋
      </h1>
      <p className="mt-2 text-sm text-white/55">Aquí tienes un resumen de tu cuenta.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl glass p-6">
          <div className="text-xs uppercase tracking-wider text-white/45">Servicios contratados</div>
          <div className="mt-3 font-display text-3xl text-white">{services.size}/3</div>
          <div className="mt-3 flex gap-1.5">
            {services.has('web') && <span className="rounded-full px-2.5 py-0.5 text-[10px]" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-web)' }}>web</span>}
            {services.has('tienda') && <span className="rounded-full px-2.5 py-0.5 text-[10px]" style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--accent-shop)' }}>tienda</span>}
            {services.has('ia') && <span className="rounded-full px-2.5 py-0.5 text-[10px]" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-ia)' }}>agente IA</span>}
            {services.size === 0 && <span className="text-xs text-white/40">Aún ninguno indicado</span>}
          </div>
        </div>
        <div className="rounded-2xl glass p-6">
          <div className="text-xs uppercase tracking-wider text-white/45">Archivos subidos</div>
          <div className="mt-3 font-display text-3xl text-white">{filesAll.length}</div>
          <Link href="/dashboard/archivos" className="mt-3 inline-block text-xs text-white/60 hover:text-white link-underline">Ver galería →</Link>
        </div>
        <div className="rounded-2xl glass p-6">
          <div className="text-xs uppercase tracking-wider text-white/45">Estado del proyecto</div>
          <div className="mt-3">
            {(() => {
              if (subscription && subscription.cancelAtPeriodEnd) {
                return (
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(234,179,8,0.15)', color: '#eab308', border: '1px solid rgba(234,179,8,0.3)' }}>
                    <span className="relative inline-flex h-1.5 w-1.5"><span className="absolute inset-0 rounded-full bg-amber-400 animate-pulse-dot" /></span>
                    Se cancela el {fmtDate(subscription.currentPeriodEnd)}
                  </span>
                );
              }
              if (subscription) {
                return (
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                    <span className="relative inline-flex h-1.5 w-1.5"><span className="absolute inset-0 rounded-full bg-green-400 animate-pulse-dot" /></span>
                    Plan activo
                  </span>
                );
              }
              if (empresa) {
                return (
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <span className="relative inline-flex h-1.5 w-1.5"><span className="absolute inset-0 rounded-full bg-white/40" /></span>
                    Recopilando información
                  </span>
                );
              }
              return (
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <span className="relative inline-flex h-1.5 w-1.5"><span className="absolute inset-0 rounded-full bg-white/30" /></span>
                  Sin actividad
                </span>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl glass p-6">
          <h2 className="font-display text-xl text-white">Próximos pasos</h2>
          <ul className="mt-4 space-y-2.5">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-center gap-3 text-sm">
                <span
                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={c.done ? { background: 'rgba(16,185,129,0.18)', color: 'var(--accent-ia)' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
                >
                  {c.done ? '✓' : '○'}
                </span>
                <span className={c.done ? 'text-white/50 line-through' : 'text-white/80'}>{c.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl glass p-6">
          <h2 className="font-display text-xl text-white">Atajos</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link href="/dashboard/empresa" className="group flex items-center gap-3 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10">
              <Building2 size={18} className="text-purple-300" />
              <span className="text-sm text-white">Editar empresa</span>
            </Link>
            <Link href="/dashboard/archivos" className="group flex items-center gap-3 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10">
              <FolderOpen size={18} className="text-purple-300" />
              <span className="text-sm text-white">Subir archivos</span>
            </Link>
            <a href={whatsappLink('Hola, soy cliente de Latech')} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10">
              <MessageCircle size={18} style={{ color: '#25D366' }} />
              <span className="text-sm text-white">Hablar con tu técnico</span>
            </a>
            <Link href="/tienda" className="group flex items-center gap-3 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10">
              <Sparkles size={18} className="text-amber-300" />
              <span className="text-sm text-white">Más servicios</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
