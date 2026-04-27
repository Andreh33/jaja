'use client';

import { useState } from 'react';
import { Mail, Phone, MessageCircle, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import type { ContactMessage } from '../../../../../drizzle/schema';

export default function MensajesClient({ initial }: { initial: ContactMessage[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initial);

  const markRead = async (id: string, read: boolean) => {
    setMessages((m) => m.map((x) => (x.id === id ? { ...x, read } : x)));
    await fetch(`/api/admin/mensajes`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, read }) });
    router.refresh();
  };

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar mensaje?')) return;
    setMessages((m) => m.filter((x) => x.id !== id));
    const r = await fetch(`/api/admin/mensajes?id=${id}`, { method: 'DELETE' });
    if (!r.ok) toast.error('Error al eliminar');
    else toast.success('Eliminado');
  };

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-white/40" style={{ borderColor: 'var(--border-subtle)' }}>
        Aún no hay mensajes.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div
          key={m.id}
          className="rounded-2xl glass p-5 transition-colors"
          style={!m.read ? { background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.2)' } : {}}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {!m.read && <span className="h-2 w-2 rounded-full" style={{ background: 'var(--purple-400)', boxShadow: '0 0 8px var(--purple-glow)' }} />}
                <h3 className="font-display text-lg text-white">{m.name}</h3>
                {m.service && <span className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--purple-300)' }}>{m.service}</span>}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/55">
                <a className="link-underline inline-flex items-center gap-1 hover:text-white" href={`mailto:${m.email}`}><Mail size={11} /> {m.email}</a>
                {m.phone && <a className="link-underline inline-flex items-center gap-1 hover:text-white" href={`tel:${m.phone}`}><Phone size={11} /> {m.phone}</a>}
                <span>{m.createdAt ? formatDate(m.createdAt) : ''}</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/75">{m.message}</p>
            </div>
            <div className="flex items-center gap-2">
              {m.phone && (
                <a href={`https://wa.me/${m.phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/65 hover:text-white hover:bg-white/10" aria-label="WhatsApp">
                  <MessageCircle size={14} style={{ color: '#25D366' }} />
                </a>
              )}
              <button onClick={() => markRead(m.id, !m.read)} className="inline-flex h-9 items-center gap-1 rounded-full bg-white/5 px-3 text-xs text-white/65 hover:text-white hover:bg-white/10">
                <Check size={12} /> {m.read ? 'Marcar no leído' : 'Marcar leído'}
              </button>
              <button onClick={() => remove(m.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 text-red-300 hover:bg-red-500/20" aria-label="Eliminar">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
