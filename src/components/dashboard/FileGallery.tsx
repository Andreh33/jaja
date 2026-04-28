'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Download, FileText, Video, FileImage, X, ExternalLink } from 'lucide-react';
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
  const [preview, setPreview] = useState<Archivo | null>(null);
  const filtered = tab === 'all' ? files : files.filter((f) => f.category === tab);

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreview(null);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [preview]);

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este archivo?')) return;
    try {
      const r = await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!r.ok) throw new Error();
      toast.success('Archivo eliminado');
      if (preview?.id === id) setPreview(null);
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
              <button
                type="button"
                onClick={() => setPreview(f)}
                className="block aspect-square w-full cursor-zoom-in overflow-hidden bg-black/40 text-left"
                aria-label={`Abrir ${f.filename}`}
              >
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
              </button>
              <div className="pointer-events-auto absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <a
                  href={f.url}
                  download={f.filename}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
                  aria-label="Descargar"
                >
                  <Download size={13} />
                </a>
                <button
                  onClick={(e) => { e.stopPropagation(); remove(f.id); }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-300 backdrop-blur hover:bg-red-500/30"
                  aria-label="Eliminar"
                >
                  <Trash2 size={13} />
                </button>
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

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border bg-[#0b0814]"
              style={{ borderColor: 'var(--border-subtle)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">{preview.filename}</div>
                  <div className="text-[11px] text-white/45">
                    {formatBytes(preview.size || 0)} · {preview.mimeType || 'archivo'}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={preview.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs text-white/85 hover:bg-white/5"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <ExternalLink size={13} /> Abrir en nueva pestaña
                  </a>
                  <a
                    href={preview.url}
                    download={preview.filename}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs text-white/85 hover:bg-white/5"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <Download size={13} /> Descargar
                  </a>
                  <button
                    onClick={() => remove(preview.id)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-3 text-xs text-red-300 hover:bg-red-500/20"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={13} /> Eliminar
                  </button>
                  <button
                    onClick={() => setPreview(null)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border text-white/85 hover:bg-white/5"
                    style={{ borderColor: 'var(--border-subtle)' }}
                    aria-label="Cerrar"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="flex min-h-[50vh] flex-1 items-center justify-center overflow-auto bg-black/50">
                {preview.mimeType?.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview.url} alt={preview.filename} className="max-h-[80vh] w-auto max-w-full object-contain" />
                ) : preview.mimeType?.startsWith('video/') ? (
                  <video src={preview.url} controls autoPlay className="max-h-[80vh] w-auto max-w-full" />
                ) : preview.mimeType === 'application/pdf' ? (
                  <iframe src={preview.url} title={preview.filename} className="h-[80vh] w-full bg-white" />
                ) : (
                  <div className="flex flex-col items-center gap-3 p-10 text-center text-white/65">
                    <FileImage size={48} className="text-white/40" />
                    <p className="text-sm">Este tipo de archivo no se puede previsualizar.</p>
                    <a
                      href={preview.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs text-white hover:bg-white/15"
                    >
                      <ExternalLink size={13} /> Abrir archivo
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// To avoid unused import warning
export const _icons = { Video };
