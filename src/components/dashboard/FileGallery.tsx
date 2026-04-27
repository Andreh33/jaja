'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Download, FileText, Video, FileImage } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn, formatBytes, formatDate } from '@/lib/utils';
import type { Archivo } from '../../../drizzle/schema';

const TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'logo', label: 'Logos' },
  { id: 'foto', label: 'Fotos' },
  { id: 'video', label: 'Vídeos' },
  { id: 'documento', label: 'Documentos' },
  { id: 'otro', label: 'Otros' },
];

export default function FileGallery({ files }: { files: Archivo[] }) {
  const router = useRouter();
  const [tab, setTab] = useState('all');
  const filtered = tab === 'all' ? files : files.filter((f) => f.category === tab);

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este archivo?')) return;
    try {
      const r = await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!r.ok) throw new Error();
      toast.success('Archivo eliminado');
      router.refresh();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="rounded-2xl glass p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
          Mis archivos <span className="ml-2 text-sm font-normal text-white/45">({files.length})</span>
        </h2>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const count = t.id === 'all' ? files.length : files.filter((f) => f.category === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                tab === t.id ? 'text-white' : 'text-white/55 hover:text-white',
              )}
              style={tab === t.id ? { background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.4)' } : { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}
            >
              {t.label}
              <span className="rounded-full bg-white/10 px-1.5 text-[10px]">{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed py-14 text-center text-sm text-white/45" style={{ borderColor: 'var(--border-subtle)' }}>
          Aún no hay archivos en esta categoría.
        </div>
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((f) => (
            <motion.div
              key={f.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative overflow-hidden rounded-xl border bg-white/[0.02]"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="aspect-square w-full overflow-hidden bg-black/40">
                {f.mimeType?.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.url} alt={f.filename} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : f.mimeType?.startsWith('video/') ? (
                  <video src={f.url} className="h-full w-full object-cover" muted />
                ) : f.mimeType === 'application/pdf' ? (
                  <div className="flex h-full items-center justify-center text-white/45"><FileText size={42} /></div>
                ) : (
                  <div className="flex h-full items-center justify-center text-white/45"><FileImage size={42} /></div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="pointer-events-auto absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <a
                    href={f.url}
                    download={f.filename}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
                    aria-label="Descargar"
                  >
                    <Download size={13} />
                  </a>
                  <button
                    onClick={() => remove(f.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-300 backdrop-blur hover:bg-red-500/30"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <div className="truncate text-xs font-medium text-white/85">{f.filename}</div>
                <div className="mt-1 flex justify-between text-[10px] text-white/40">
                  <span>{formatBytes(f.size || 0)}</span>
                  <span>{f.uploadedAt ? formatDate(f.uploadedAt) : ''}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// To avoid unused import warning
export const _icons = { Video };
