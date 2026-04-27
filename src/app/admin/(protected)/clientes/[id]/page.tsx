import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, MessageCircle, Download, Trash2, FileText } from 'lucide-react';
import { db } from '@/lib/db';
import { users, archivos, empresas } from '../../../../../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { formatBytes, formatDate } from '@/lib/utils';
import { whatsappLink } from '@/lib/stripe-links';

export const dynamic = 'force-dynamic';

export default async function AdminClienteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userArr = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (userArr.length === 0) notFound();
  const u = userArr[0];
  const empArr = await db.select().from(empresas).where(eq(empresas.userId, id)).limit(1);
  const emp = empArr[0];
  const files = await db.select().from(archivos).where(eq(archivos.userId, id)).orderBy(desc(archivos.uploadedAt));

  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const lastUpload = files[0]?.uploadedAt;
  const services = (emp?.serviciosContratados as string[] | null) || [];

  const phoneE164 = (u.phone || '').replace(/\s+/g, '').replace('+', '');

  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <Link href="/admin/clientes" className="inline-flex items-center gap-2 text-xs text-white/55 hover:text-white">
        <ArrowLeft size={12} /> Todos los clientes
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Sidebar info */}
        <aside className="space-y-4">
          <div className="rounded-2xl glass p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white" style={{ background: 'var(--grad-signature)' }}>
              {(u.name?.[0] || u.email[0]).toUpperCase()}
            </div>
            <h2 className="mt-4 font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
              {u.name || 'Sin nombre'}
            </h2>
            <p className="text-xs text-white/45">{u.email}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {services.includes('web') && <span className="rounded-full px-2.5 py-0.5 text-[10px]" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-web)' }}>web</span>}
              {services.includes('tienda') && <span className="rounded-full px-2.5 py-0.5 text-[10px]" style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--accent-shop)' }}>tienda</span>}
              {services.includes('ia') && <span className="rounded-full px-2.5 py-0.5 text-[10px]" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-ia)' }}>agente IA</span>}
            </div>
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
              <a href={whatsappLink(`Hola ${u.name || ''}, te contactamos desde Latech`).replace(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '34684739091', phoneE164 || '34684739091')} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
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

        {/* Files explorer */}
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
                      <div className="flex h-full items-center justify-center text-white/45"><FileText size={36} /></div>
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
