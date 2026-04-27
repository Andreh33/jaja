'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { renderMarkdown } from '@/lib/markdown';
import { slugify } from '@/lib/utils';

const CATEGORIES = ['Diseño Web', 'Tiendas Online', 'IA', 'SEO', 'Tutoriales'];

type Initial = {
  id?: string;
  slug?: string;
  title?: string;
  excerpt?: string | null;
  content?: string;
  category?: string | null;
  cover?: string | null;
  readingMinutes?: number | null;
  published?: boolean | null;
};

export default function PostEditor({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState({
    id: initial?.id || '',
    slug: initial?.slug || '',
    title: initial?.title || '',
    excerpt: initial?.excerpt || '',
    content: initial?.content || '',
    category: initial?.category || CATEGORIES[0],
    cover: initial?.cover || '',
    readingMinutes: initial?.readingMinutes || 5,
    published: initial?.published ?? true,
  });
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateTitle = (t: string) => setForm({ ...form, title: t, slug: form.slug ? form.slug : slugify(t) });

  const submit = async () => {
    setSaving(true);
    try {
      const url = '/api/posts';
      const method = form.id ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error();
      toast.success('Post guardado');
      router.push('/admin/posts');
      router.refresh();
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!form.id) return;
    if (!confirm('¿Eliminar este post?')) return;
    try {
      const r = await fetch(`/api/posts?id=${form.id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error();
      toast.success('Post eliminado');
      router.push('/admin/posts');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="rounded-2xl glass p-6">
          <input
            value={form.title}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="Título del post"
            className="font-display w-full bg-transparent text-3xl text-white outline-none placeholder:text-white/25"
            style={{ letterSpacing: '-0.03em', fontWeight: 700 }}
          />
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="slug-del-post"
            className="mt-3 w-full bg-transparent font-mono text-xs text-white/50 outline-none placeholder:text-white/25"
          />
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="Extracto (1-2 frases que enganchen)..."
            className="mt-4 w-full resize-none bg-transparent text-sm text-white/80 outline-none placeholder:text-white/25"
            rows={3}
          />
        </div>

        <div className="rounded-2xl glass p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/55">
              Contenido (Markdown)
            </h3>
            <button onClick={() => setPreview(!preview)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] text-white/65 hover:text-white" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Eye size={11} /> {preview ? 'Editar' : 'Preview'}
            </button>
          </div>
          {preview ? (
            <div className="prose-latech max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) }} />
          ) : (
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="## Sección\n\nTu contenido en markdown..."
              className="min-h-[500px] w-full resize-y rounded-xl bg-black/30 p-4 font-mono text-sm text-white outline-none focus:ring-1 focus:ring-purple-400/40"
            />
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl glass p-5 space-y-3">
          <Field label="Categoría">
            <select value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Imagen cover (URL)">
            <input className="input" value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} placeholder="/og/post.svg" />
          </Field>
          <Field label="Tiempo de lectura (min)">
            <input className="input" type="number" min={1} value={form.readingMinutes} onChange={(e) => setForm({ ...form, readingMinutes: Number(e.target.value) || 5 })} />
          </Field>
          <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" checked={!!form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            <span className="text-white/85">{form.published ? 'Publicado' : 'Borrador'}</span>
          </label>
        </div>

        <button
          onClick={submit}
          disabled={saving || !form.title || !form.content}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 glow-purple"
          style={{ background: 'var(--grad-signature)' }}
        >
          <Save size={14} /> {saving ? 'Guardando…' : 'Guardar'}
        </button>
        {form.id && (
          <button onClick={remove} className="inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm text-red-300 hover:bg-red-500/10" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
            <Trash2 size={14} /> Eliminar
          </button>
        )}
      </aside>

      <style jsx>{`
        .input { width:100%; height:42px; padding:0 12px; border-radius:10px; background:rgba(7,5,14,0.5); border:1px solid var(--border-subtle); color:var(--text-primary); font-size:13px; }
        .input:focus { outline:none; border-color:var(--purple-400); box-shadow:0 0 0 3px rgba(139,92,246,0.18); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/55">{label}</span>
      {children}
    </label>
  );
}
