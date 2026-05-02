import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Download,
  FileText,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { db } from '@/lib/db';
import { users, archivos, empresas } from '../../../../../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { formatBytes, formatDate } from '@/lib/utils';
import { whatsappLink } from '@/lib/stripe-links';
import { getActiveLocalSubscription, getOrdersForUser, type LocalOrder, type LocalSubscription } from '@/lib/billing-data';
import { getAdminClientData } from '@/lib/admin-data';
import { humanReadableCatalogName, categoryFromCatalogId, type ServiceCategory } from '@/config/catalog';
import AdminDataForm from './AdminDataForm';
import PhoneAgentProvisionButton from './PhoneAgentProvisionButton';

export const dynamic = 'force-dynamic';

type CartLineLocal = { catalog_id: string; quantity?: number; amount_subtotal?: number };

function eur(cents: number, currency = 'eur'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: (currency || 'eur').toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function unixToDate(unix: number | null | undefined): string {
  if (!unix) return '—';
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(unix * 1000),
  );
}

function orderConcept(order: LocalOrder): string {
  const items = (order.lineItems as CartLineLocal[] | null) ?? [];
  if (items.length === 0) return 'Pago';
  const first = humanReadableCatalogName(items[0].catalog_id);
  if (items.length === 1) return first;
  return `${first} (+${items.length - 1} más)`;
}

function orderStatusBadge(status: string): { label: string; bg: string; fg: string } {
  switch (status) {
    case 'paid':
      return { label: 'Pagada', bg: 'rgba(34,197,94,0.12)', fg: '#22c55e' };
    case 'pending':
      return { label: 'Pendiente', bg: 'rgba(234,179,8,0.12)', fg: '#eab308' };
    case 'failed':
      return { label: 'Fallida', bg: 'rgba(239,68,68,0.12)', fg: '#ef4444' };
    default:
      return { label: status, bg: 'rgba(255,255,255,0.06)', fg: 'rgba(255,255,255,0.7)' };
  }
}

function subscriptionCategoryBadges(sub: LocalSubscription): ServiceCategory[] {
  const items = (sub.items as CartLineLocal[] | null) ?? [];
  const set = new Set<ServiceCategory>();
  for (const it of items) {
    const cat = categoryFromCatalogId(it.catalog_id);
    if (cat) set.add(cat);
  }
  return Array.from(set);
}

export default async function AdminClienteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userArr = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (userArr.length === 0) notFound();
  const u = userArr[0];

  const [empArr, files, subscription, orders, adminData] = await Promise.all([
    db.select().from(empresas).where(eq(empresas.userId, id)).limit(1),
    db.select().from(archivos).where(eq(archivos.userId, id)).orderBy(desc(archivos.uploadedAt)),
    getActiveLocalSubscription(id),
    getOrdersForUser(id),
    getAdminClientData(id),
  ]);
  const emp = empArr[0];

  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const lastUpload = files[0]?.uploadedAt;
  const phoneE164 = (u.phone || '').replace(/\s+/g, '').replace('+', '');

  const subItems = (subscription?.items as CartLineLocal[] | null) ?? [];
  const subCategories = subscription ? subscriptionCategoryBadges(subscription) : [];
  const stripeDashboardUrl = u.stripeCustomerId
    ? `https://dashboard.stripe.com/test/customers/${u.stripeCustomerId}`
    : null;

  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <Link href="/admin/clientes" className="inline-flex items-center gap-2 text-xs text-white/55 hover:text-white">
        <ArrowLeft size={12} /> Todos los clientes
      </Link>

      {/* === Banner agente IA pendiente === */}
      {u.phoneAgentPendingProvision && (
        <div
          className="mt-6 flex items-start justify-between gap-4 rounded-xl border px-5 py-4"
          style={{ borderColor: 'rgba(234,179,8,0.4)', background: 'rgba(234,179,8,0.08)' }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} style={{ color: '#eab308', marginTop: 2 }} />
            <div>
              <p className="font-medium text-white">Aprovisionar número virtual pendiente</p>
              <p className="mt-1 text-sm text-white/65">
                Este cliente contrató Agente IA por teléfono. Configura el número virtual en
                Twilio/Telnyx y marca como aprovisionado.
              </p>
            </div>
          </div>
          <PhoneAgentProvisionButton userId={u.id} />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* === Sidebar info === */}
        <aside className="space-y-4">
          <div className="rounded-2xl glass p-6 text-center">
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ background: 'var(--grad-signature)' }}
            >
              {(u.name?.[0] || u.email[0]).toUpperCase()}
            </div>
            <h2 className="mt-4 font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
              {u.name || 'Sin nombre'}
            </h2>
            <p className="text-xs text-white/45">{u.email}</p>
            {u.phone && <p className="mt-1 text-xs text-white/45">{u.phone}</p>}
            <p className="mt-2 text-[10px] text-white/35">
              Registrado: {u.createdAt ? formatDate(u.createdAt) : '—'}
            </p>
            {u.stripeCustomerId && (
              <div className="mt-3 flex flex-col items-center gap-1 border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="font-mono text-[10px] text-white/40">{u.stripeCustomerId}</p>
                {stripeDashboardUrl && (
                  <a
                    href={stripeDashboardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-white/65 hover:text-white"
                  >
                    Ver en Stripe Dashboard <ExternalLink size={10} />
                  </a>
                )}
              </div>
            )}
            {subCategories.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {subCategories.includes('web') && (
                  <span className="rounded-full px-2.5 py-0.5 text-[10px]" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-web)' }}>web</span>
                )}
                {subCategories.includes('tienda') && (
                  <span className="rounded-full px-2.5 py-0.5 text-[10px]" style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--accent-shop)' }}>tienda</span>
                )}
                {subCategories.includes('ia') && (
                  <span className="rounded-full px-2.5 py-0.5 text-[10px]" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-ia)' }}>agente IA</span>
                )}
              </div>
            )}
          </div>

          {emp && (
            <div className="rounded-2xl glass p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Empresa</h3>
              <dl className="mt-3 space-y-2 text-sm">
                {emp.nombre && <Row k="Nombre" v={emp.nombre} />}
                {emp.cif && <Row k="CIF" v={emp.cif} />}
                {emp.sector && <Row k="Sector" v={emp.sector} />}
                {emp.telefono && <Row k="Teléfono" v={emp.telefono} />}
                {emp.email && <Row k="Email" v={emp.email} />}
                {emp.direccion && <Row k="Dirección" v={emp.direccion} />}
                {emp.ciudad && <Row k="Ciudad" v={emp.ciudad} />}
                {emp.cp && <Row k="CP" v={emp.cp} />}
              </dl>
              {emp.descripcion && (
                <>
                  <div className="mt-5 text-xs font-semibold uppercase tracking-wider text-white/50">Descripción</div>
                  <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-white/70">{emp.descripcion}</p>
                </>
              )}
              {emp.horarios && (
                <>
                  <div className="mt-5 text-xs font-semibold uppercase tracking-wider text-white/50">Horarios</div>
                  <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-white/70">{emp.horarios}</p>
                </>
              )}
            </div>
          )}

          <div className="rounded-2xl glass p-6 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Acciones</h3>
            {u.phone && (
              <a
                href={whatsappLink(`Hola ${u.name || ''}, te contactamos desde Latech`).replace(
                  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '34684739091',
                  phoneE164 || '34684739091',
                )}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              >
                <MessageCircle size={14} style={{ color: '#25D366' }} /> WhatsApp
              </a>
            )}
            {u.phone && (
              <a href={`tel:${u.phone}`} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
                <Phone size={14} className="text-purple-300" /> {u.phone}
              </a>
            )}
            <a href={`mailto:${u.email}`} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
              <Mail size={14} className="text-purple-300" /> Email
            </a>
            <a href={`/api/admin/clientes/${u.id}/zip`} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
              <Download size={14} className="text-amber-300" /> Descargar todo (.zip)
            </a>
          </div>
        </aside>

        {/* === Main column === */}
        <div className="space-y-6">
          {/* === Suscripción activa === */}
          <div className="rounded-2xl glass p-6 md:p-8">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
                Suscripción activa
              </h2>
              {subscription && (
                <span
                  className="rounded-full px-2 py-0.5 text-[11px]"
                  style={
                    subscription.cancelAtPeriodEnd
                      ? { background: 'rgba(234,179,8,0.12)', color: '#eab308' }
                      : { background: 'rgba(34,197,94,0.12)', color: '#22c55e' }
                  }
                >
                  {subscription.cancelAtPeriodEnd
                    ? `Se cancela el ${unixToDate(subscription.currentPeriodEnd)}`
                    : 'Activa'}
                </span>
              )}
            </div>

            {!subscription ? (
              <p className="mt-4 text-sm text-white/45">Sin suscripción activa.</p>
            ) : (
              <>
                <p className="mt-2 text-sm text-white/55">
                  Cadencia: <span className="text-white/85">{subscription.cadence === 'yearly' ? 'Anual' : 'Mensual'}</span>
                  {' · '}
                  Próxima renovación:{' '}
                  <span className="text-white/85">{unixToDate(subscription.currentPeriodEnd)}</span>
                </p>
                <p className="mt-1 font-mono text-[11px] text-white/40">
                  {subscription.stripeSubscriptionId} · status={subscription.status}
                </p>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wider text-white/45">
                      <tr>
                        <th className="py-2 pr-4 font-normal">Producto</th>
                        <th className="py-2 pr-4 font-normal text-center">Cantidad</th>
                        <th className="py-2 pr-4 font-normal text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subItems.map((item, idx) => (
                        <tr
                          key={`${item.catalog_id}-${idx}`}
                          className="border-t"
                          style={{ borderColor: 'var(--border-subtle)' }}
                        >
                          <td className="py-3 pr-4 text-white/85">{humanReadableCatalogName(item.catalog_id)}</td>
                          <td className="py-3 pr-4 text-center text-white/75">{item.quantity ?? 1}</td>
                          <td className="py-3 pr-4 text-right font-mono text-white">
                            {eur(item.amount_subtotal ?? 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* === Pagos puntuales === */}
          <div className="rounded-2xl glass p-6 md:p-8">
            <h2 className="font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
              Pagos puntuales (orders)
            </h2>
            <p className="mt-2 text-xs text-white/45">
              Solo se muestran pagos one-time registrados localmente. Las facturas recurrentes de la
              suscripción no se cachean en BBDD — consúltalas en el Dashboard de Stripe.
            </p>

            {orders.length === 0 ? (
              <p className="mt-5 text-sm text-white/45">Sin pagos puntuales registrados.</p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-white/45">
                    <tr>
                      <th className="py-2 pr-4 font-normal">Fecha</th>
                      <th className="py-2 pr-4 font-normal">Concepto</th>
                      <th className="py-2 pr-4 font-normal text-right">Importe</th>
                      <th className="py-2 pr-4 font-normal">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const badge = orderStatusBadge(o.status);
                      return (
                        <tr key={o.id} className="border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                          <td className="py-3 pr-4 text-white/75">{o.createdAt ? formatDate(o.createdAt) : '—'}</td>
                          <td className="py-3 pr-4 text-white/85">{orderConcept(o)}</td>
                          <td className="py-3 pr-4 text-right font-mono text-white">
                            {eur(o.amountTotal, o.currency)}
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className="rounded-full px-2 py-0.5 text-[11px]"
                              style={{ background: badge.bg, color: badge.fg }}
                            >
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* === Datos comerciales (admin only) === */}
          <div className="rounded-2xl glass p-6 md:p-8">
            <h2 className="font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
              Datos comerciales (interno)
            </h2>
            <p className="mt-2 text-xs text-white/45">
              Anotaciones operativas visibles solo para el equipo. No se muestran al cliente.
            </p>
            <div className="mt-5">
              <AdminDataForm
                userId={u.id}
                initial={{
                  comercial: adminData?.comercialQueVendio ?? '',
                  dominio: adminData?.dominioElegido ?? '',
                  tareas: adminData?.tareasPendientes ?? '',
                }}
              />
            </div>
          </div>

          {/* === Files explorer === */}
          <div className="rounded-2xl glass p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-white/40">Cliente / {u.name || u.email} / Archivos</p>
                <h2 className="mt-1 font-display text-2xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
                  Archivos del cliente
                </h2>
              </div>
              <div className="text-right text-xs text-white/45">
                <div>{files.length} archivos · {formatBytes(totalSize)}</div>
                {lastUpload && <div>Último: {formatDate(lastUpload)}</div>}
              </div>
            </div>

            {files.length === 0 ? (
              <div className="rounded-xl border border-dashed py-14 text-center text-sm text-white/45" style={{ borderColor: 'var(--border-subtle)' }}>
                Aún no hay archivos.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {files.map((f) => (
                  <div key={f.id} className="group relative overflow-hidden rounded-xl border bg-white/[0.02]" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="aspect-square w-full overflow-hidden bg-black/40">
                      {f.mimeType?.startsWith('image/') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.url} alt={f.filename} className="h-full w-full object-cover" />
                      ) : f.mimeType?.startsWith('video/') ? (
                        <video src={f.url} className="h-full w-full object-cover" muted />
                      ) : (
                        <div className="flex h-full items-center justify-center text-white/45">
                          <FileText size={36} />
                        </div>
                      )}
                      <div className="pointer-events-auto absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <a href={f.url} download={f.filename} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20">
                          <Download size={12} />
                        </a>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <div className="truncate text-[11px] font-medium text-white/85">{f.filename}</div>
                      <div className="mt-0.5 flex justify-between text-[10px] text-white/40">
                        <span>{f.category}</span>
                        <span>{formatBytes(f.size || 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-white/45">{k}</dt>
      <dd className="truncate text-right text-white/85">{v}</dd>
    </div>
  );
}
