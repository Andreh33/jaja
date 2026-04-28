'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileImage, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { formatBytes } from '@/lib/utils';

const CATEGORIES = [
  { id: 'logo', label: 'Logo' },
  { id: 'foto', label: 'Fotos' },
  { id: 'video', label: 'Vídeos' },
  { id: 'documento', label: 'Documentos' },
  { id: 'otro', label: 'Otros' },
];

type UploadItem = { name: string; size: number; progress: number; done: boolean; error?: boolean };

export default function FileUploader() {
  const router = useRouter();
  const [category, setCategory] = useState('foto');
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const onDrop = useCallback(async (accepted: File[]) => {
    const initial: UploadItem[] = accepted.map((f) => ({ name: f.name, size: f.size, progress: 5, done: false }));
    setUploads((u) => [...u, ...initial]);

    let successCount = 0;
    for (const file of accepted) {
      try {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 80) || 'archivo';
        const pathname = `clientes/${Date.now()}-${safe}`;

        const blob = await upload(pathname, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          contentType: file.type || 'application/octet-stream',
          onUploadProgress: (e) => {
            setUploads((u) => u.map((x) => x.name === file.name && !x.done ? { ...x, progress: Math.max(5, Math.min(95, e.percentage)) } : x));
          },
        });

        const r = await fetch('/api/upload/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: blob.url,
            pathname: blob.pathname,
            filename: file.name,
            mimeType: file.type,
            size: file.size,
            category,
          }),
        });
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error(data?.error || `Error ${r.status}`);
        }

        setUploads((u) => u.map((x) => x.name === file.name ? { ...x, progress: 100, done: true } : x));
        successCount++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al subir';
        setUploads((u) => u.map((x) => x.name === file.name ? { ...x, progress: 100, done: true, error: true } : x));
        toast.error(`${file.name}: ${msg}`);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} archivo(s) subido(s)`);
      router.refresh();
    }
    setTimeout(() => setUploads([]), 2200);
  }, [category, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
      'application/pdf': [],
      'application/postscript': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
    },
    maxSize: 50 * 1024 * 1024,
  });

  return (
    <div className="rounded-2xl glass p-6 md:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
          Subir archivos
        </h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
              style={category === c.id ? { background: 'rgba(139,92,246,0.2)', color: '#fff', border: '1px solid rgba(139,92,246,0.5)' } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', border: '1px solid var(--border-subtle)' }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div
        {...getRootProps()}
        className="relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all"
        style={{
          borderColor: isDragActive ? 'var(--purple-400)' : 'var(--border-strong)',
          background: isDragActive ? 'rgba(139,92,246,0.08)' : 'rgba(7,5,14,0.4)',
        }}
      >
        <input {...getInputProps()} />
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--purple-300)', border: '1px solid rgba(139,92,246,0.3)' }}>
          <Upload size={22} strokeWidth={1.6} />
        </div>
        <p className="text-base font-semibold text-white">
          {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz click'}
        </p>
        <p className="mt-2 text-xs text-white/55">
          Imágenes, vídeos y PDFs. Máximo 50MB por archivo. Categoría: <span className="text-white/85">{CATEGORIES.find((c) => c.id === category)?.label}</span>
        </p>
      </div>

      {uploads.length > 0 && (
        <div className="mt-5 space-y-2">
          {uploads.map((u, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <FileImage size={16} className="shrink-0 text-white/60" />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-3 text-xs">
                  <span className="truncate text-white/85">{u.name}</span>
                  <span className="text-white/45">{formatBytes(u.size)}</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${u.progress}%`,
                      background: u.error ? 'var(--danger)' : u.done ? 'var(--accent-ia)' : 'var(--purple-400)',
                    }}
                  />
                </div>
              </div>
              {u.done && !u.error && <span className="text-xs text-emerald-400">✓</span>}
              {u.error && <X size={14} className="text-red-400" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
