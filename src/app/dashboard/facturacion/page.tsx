import Link from 'next/link';
import {
  CreditCard,
  ExternalLink,
  MessageCircle,
  FileText,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { whatsappLink } from '@/lib/stripe-links';
import { getBillingData, type LocalSubscription } from '@/lib/billing-data';
import { CATALOG, type CatalogItem } from '@/config/catalog';
import SuccessBanner from './SuccessBanner';
import PortalButton from './PortalButton';
import type Stripe from 'stripe';

export const dynamic = 'force-dynamic';

type CartLineLocal = { catalog_id: string; quantity: number; amount_subtotal?: number };

function eur(amountCents: number, currency = 'eur'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: (currency || 'eur').toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

function unixToDate(unix: number | null | undefined): string {
  if (!unix) return '—';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(unix * 1000));
}

function findCatalog(catalogId: string): CatalogItem | null {
  for (const k of Object.keys(CATALOG) as Array<keyof typeof CATALOG>) {
    if (CATALOG[k].id === catalogId) return CATALOG[k];
  }
  return null;
}

function planTitle(sub: LocalSubscription): string {
  const items = (sub.items as CartLineLocal[] | null) ?? [];
  if (items.length === 0) return 'Plan personalizado';
  // Heurística: usa el primer recurring de hosting si existe; si no, primer item.
  const hosting = items.find((i) => i.catalog_id.startsWith('hosting_'));
  const lead = hosting ?? items[0];
  const cat = findCatalog(lead.catalog_id);
  const baseName = cat?.name ?? 'Plan personalizado';
  if (items.length === 1) return baseName;
  return `${baseName} +${items.length - 1}`;
}

/**
 * Suma amount_subtotal de los items recurring (hosting_*, tienda_*, social*,
 * ai_*, blog_post*) para mostrar el "precio del plan". Excluye one-time
 * (web_creation_*, logo, seo_hour) que se cobran solo en la primera factura.
 */
function recurringSubtotalCents(sub: LocalSubscription): number {
  const items = (sub.items as CartLineLocal[] | null) ?? [];
  const ONE_TIME_PREFIXES = ['web_creation_', 'logo', 'seo_'];
  return items.reduce((acc, it) => {
    if (ONE_TIME_PREFIXES.some((p) => it.catalog_id.startsWith(p))) return acc;
    return acc + (it.amount_subtotal ?? 0);
  }, 0);
}

function cadenceSuffix(cadence: string): { label: string; warn: boolean } {
  if (cadence === 'monthly') return { label: '/mes', warn: false };
  if (cadence === 'yearly') return { label: '/año', warn: false };
  return { label: ' (consultar)', warn: true };
}

function statusBadge(status: Stripe.Invoice.Status | null): {
  label: string;
  bg: string;
  fg: string;
} {
  switch (status) {
    case 'paid':
      return { label: 'Pagada', bg: 'rgba(34,197,94,0.12)', fg: '#22c55e' };
    case 'open':
      return { label: 'Pendiente', bg: 'rgba(234,179,8,0.12)', fg: '#eab308' };
    case 'uncollectible':
      return { label: 'Incobrable', bg: 'rgba(239,68,68,0.12)', fg: '#ef4444' };
    default:
      return { label: status ?? '—', bg: 'rgba(255,255,255,0.06)', fg: 'rgba(255,255,255,0.7)' };
  }
}

function invoiceConcept(inv: Stripe.Invoice): string {
  const lines = inv.lines?.data ?? [];
  if (lines.length === 0) return inv.description || 'Factura';
  const first = lines[0].description || 'Factura';
  if (lines.length === 1) return first;
  return `${first} (+${lines.length - 1} más)`;
}

export default async function FacturacionPage() {
  const session = await auth();
  const data = await getBillingData(session!.user.id);

  const sub = data.subscription;
  const upcoming = data.upcoming;
  const invoices = data.invoices;
  const cadence = sub ? cadenceSuffix(sub.cadence) : { label: '', warn: false };
  const subtotalCents = sub ? recurringSubtotalCents(sub) : 0;

  if (sub && cadence.warn) {
    console.warn(
      `[billing-ui] result=warn reason=cadence_unknown subscription_id=${sub.stripeSubscriptionId} user_id=${data.user.id}`,
    );
  }

  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <SuccessBanner />

      <h1
        className="font-display text-3xl text-white md:text-4xl"
        style={{ letterSpacing: '-0.04em', fontWeight: 800 }}
      >
        Facturación
      </h1>
      <p className="mt-2 text-sm text-white/55">
        Gestiona tu plan y descarga tus facturas.
      </p>

      {data.customerDeleted && (
        <div
          className="mt-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}
        >
          <AlertTriangle size={18} style={{ color: '#ef4444', marginTop: 1 }} />
          <div>
            <p className="font-medium text-white">No encontramos tu cuenta de pago</p>
            <p className="mt-1 text-white/65">
              Contáctanos para regenerarla. Puedes seguir usando el resto del dashboard.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* === Plan actual === */}
        <div className="rounded-2xl glass p-6 md:p-8">
          <p className="text-xs uppercase tracking-wider text-white/45">Plan actual</p>
          {sub ? (
            <>
              <div className="mt-3 font-display text-2xl text-white">{planTitle(sub)}</div>
              <p className="mt-2 text-sm text-white/55">
                {eur(subtotalCents, 'eur')}
                <span className={cadence.warn ? 'text-amber-300/90' : 'text-white/40'}>
                  {cadence.label}
                </span>
                {' · '}
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[11px]"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}
                >
                  {sub.status}
                </span>
              </p>
              {sub.cancelAtPeriodEnd && (
                <p className="mt-2 text-xs text-amber-300/90">
                  Se cancelará al final del período actual.
                </p>
              )}
              <div className="mt-5">
                <PortalButton disabled={data.customerDeleted} />
              </div>
            </>
          ) : (
            <>
              <div className="mt-3 font-display text-2xl text-white">Sin plan asignado</div>
              <p className="mt-2 text-sm text-white/55">
                Cuando contrates un servicio en la tienda, aparecerá aquí con su próximo cobro y
                opciones de gestión.
              </p>
              <Link
                href="/tienda"
                className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
                style={{ background: 'var(--grad-signature)' }}
              >
                <CreditCard size={14} /> Ver planes
              </Link>
            </>
          )}
        </div>

        {/* === Próximo cobro === */}
        <div className="rounded-2xl glass p-6 md:p-8">
          <p className="text-xs uppercase tracking-wider text-white/45">Próximo cobro</p>
          {upcoming ? (
            <>
              <div className="mt-3 font-display text-2xl text-white">
                {eur(upcoming.amount_due ?? 0, upcoming.currency ?? 'eur')}
              </div>
              <p className="mt-2 text-sm text-white/55">
                {upcoming.next_payment_attempt
                  ? `Programado para el ${unixToDate(upcoming.next_payment_attempt)}.`
                  : sub?.currentPeriodEnd
                    ? `Renovación el ${unixToDate(sub.currentPeriodEnd)}.`
                    : 'Sin fecha confirmada.'}
              </p>
            </>
          ) : (
            <>
              <div className="mt-3 font-display text-2xl text-white">—</div>
              <p className="mt-2 text-sm text-white/55">
                {data.errors.upcoming
                  ? 'No hemos podido calcularlo en este momento.'
                  : 'Aún no hay cobros programados.'}
              </p>
            </>
          )}
          {data.errors.upcoming && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-amber-300/80">
              <AlertCircle size={12} /> Información temporal no disponible
            </p>
          )}
        </div>
      </div>

      {/* === Historial === */}
      <div className="mt-6 rounded-2xl glass p-6 md:p-8">
        <h2
          className="font-display text-xl text-white"
          style={{ letterSpacing: '-0.02em', fontWeight: 700 }}
        >
          Historial de facturas
        </h2>
        <p className="mt-2 text-sm text-white/55">
          Pulsa sobre cada factura para descargarla en PDF.
        </p>

        {data.errors.invoices ? (
          <div
            className="mt-5 rounded-xl border border-dashed py-8 text-center text-sm text-amber-300/90"
            style={{ borderColor: 'rgba(234,179,8,0.35)' }}
          >
            No hemos podido cargar el historial en este momento.
          </div>
        ) : invoices.length === 0 ? (
          <div
            className="mt-6 rounded-xl border border-dashed py-12 text-center text-sm text-white/40"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            Sin facturas todavía.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-white/45">
                <tr>
                  <th className="py-2 pr-4 font-normal">Fecha</th>
                  <th className="py-2 pr-4 font-normal">Concepto</th>
                  <th className="py-2 pr-4 font-normal">Importe</th>
                  <th className="py-2 pr-4 font-normal">Estado</th>
                  <th className="py-2 pr-4 font-normal">PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const badge = statusBadge(inv.status);
                  return (
                    <tr
                      key={inv.id}
                      className="border-t"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <td className="py-3 pr-4 text-white/75">{unixToDate(inv.created)}</td>
                      <td className="py-3 pr-4 text-white/85">{invoiceConcept(inv)}</td>
                      <td className="py-3 pr-4 text-white">
                        {eur(inv.amount_paid || inv.amount_due || inv.total || 0, inv.currency ?? 'eur')}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className="inline-block rounded-full px-2 py-0.5 text-[11px]"
                          style={{ background: badge.bg, color: badge.fg }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {inv.invoice_pdf ? (
                          <a
                            href={inv.invoice_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-white/80 underline-offset-4 hover:text-white hover:underline"
                          >
                            <FileText size={13} /> Descargar
                          </a>
                        ) : (
                          <span className="text-white/40">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* === Soporte === */}
      <div className="mt-6 rounded-2xl glass p-6 md:p-8">
        <h2
          className="font-display text-xl text-white"
          style={{ letterSpacing: '-0.02em', fontWeight: 700 }}
        >
          ¿Necesitas una factura específica o cambiar algo?
        </h2>
        <p className="mt-2 text-sm text-white/55">
          Escríbenos por WhatsApp o email y te lo gestionamos al momento.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={whatsappLink('Hola, necesito gestionar una factura')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm"
          >
            <MessageCircle size={14} style={{ color: '#25D366' }} /> WhatsApp
          </a>
          <a
            href="mailto:info@latech.es"
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm"
          >
            <ExternalLink size={14} /> info@latech.es
          </a>
        </div>
      </div>
    </div>
  );
}

