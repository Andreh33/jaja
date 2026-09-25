'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2, Eye, PenLine } from 'lucide-react';
import { renderArticle } from '@/lib/markdown';
import { slugify } from '@/lib/slug';
import { readingTime } from '@/lib/utils';
import articleStyles from '@/components/blog/article.module.css';

const CATEGORIES = ['Diseño Web', 'Tiendas Online', 'IA', 'SEO', 'Tutoriales'];
type Initial = { id?: string; slug?: string; title?: string; excerpt?: string | null; content?: string; category?: string | null; cover?: string | null; readingMinutes?: number | null; published?: boolean | null; urlLocked?: boolean };
export default function PostEditor({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState({ id: initial?.id || '', slug: initial?.slug || '', title: initial?.title || '', excerpt: initial?.excerpt || '', content: initial?.content || '', category: initial?.category || CATEGORIES[0], cover: initial?.cover || '', published: initial?.published ?? false });
  const [manualSlug, setManualSlug] = useState(Boolean(initial?.id));
  const [urlLocked, setUrlLocked] = useState(Boolean(initial?.id || initial?.urlLocked || initial?.published));
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(form));
  const [preview, setPreview] = useState(false); const [saving, setSaving] = useState(false); const [deleting, setDeleting] = useState(false); const [feedback, setFeedback] = useState(''); const [error, setError] = useState('');
  const dirty = JSON.stringify(form) !== savedSnapshot;
  const rendered = useMemo(() => preview ? renderArticle(form.content) : null, [form.content, preview]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const updateTitle = (title: string) => setForm(prev => ({ ...prev, title, slug: manualSlug || urlLocked ? prev.slug : slugify(title) }));
  const submit = async (published: boolean) => {
    if (saving || deleting) return;
    setSaving(true); setError(''); setFeedback('');
    try {
      const response = await fetch('/api/posts', { method: form.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, published }) });
      const result = await response.json().catch(() => ({})) as { error?: string; id?: string; slug?: string; published?: boolean };
      if (!response.ok || !result.id || !result.slug) throw new Error(result.error || 'No se pudo guardar. Inténtalo de nuevo.');
      const saved = { ...form, id: result.id, slug: result.slug, published: Boolean(result.published) };
      setForm(saved); setSavedSnapshot(JSON.stringify(saved)); setManualSlug(true); setUrlLocked(true);
      setFeedback(published ? 'Artículo publicado. La página pública y sus listados se actualizarán.' : 'Borrador guardado. Solo puedes verlo desde el editor privado.');
      if (!form.id) router.replace(`/admin/posts/${result.id}`);
      router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo guardar. Tu contenido sigue aquí.'); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    if (!form.id || !window.confirm('¿Eliminar este artículo? Se retirará también de los listados públicos.')) return;
    setDeleting(true); setError('');
    try { const response = await fetch(`/api/posts?id=${encodeURIComponent(form.id)}`, { method: 'DELETE' }); if (!response.ok) throw new Error('No se pudo eliminar el artículo.'); router.push('/admin/posts'); router.refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo eliminar.'); setDeleting(false); }
  };
  return <fieldset disabled={saving || deleting} className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"><div className="min-w-0 space-y-5"><div className="rounded-2xl border border-white/15 bg-white/[.025] p-5 sm:p-6"><label htmlFor="post-title" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/65">Título</label><input id="post-title" value={form.title} maxLength={180} onChange={e => updateTitle(e.target.value)} placeholder="Título del artículo" className="input font-display !text-2xl" /><label htmlFor="post-slug" className="mt-5 mb-2 block text-xs font-semibold uppercase tracking-wider text-white/65">URL del artículo</label><div className="flex items-center gap-2"><span className="text-xs text-white/45">/blog/</span><input id="post-slug" value={form.slug} maxLength={160} readOnly={urlLocked} onChange={e => { const value = e.target.value; setManualSlug(Boolean(value)); setForm(prev => ({ ...prev, slug: value || slugify(prev.title) })); }} aria-describedby="post-slug-help" className="input min-w-0 font-mono !text-sm read-only:text-white/50" /></div><p id="post-slug-help" className="mt-2 text-xs leading-relaxed text-white/50">{urlLocked ? 'La URL se conserva desde el primer guardado para no romper enlaces, también al retirar y republicar. Un cambio requiere una redirección planificada.' : 'Se completa al escribir el título. Puedes personalizarla antes del primer guardado; comprobamos que no esté ocupada.'}</p><label htmlFor="post-excerpt" className="mt-5 mb-2 block text-xs font-semibold uppercase tracking-wider text-white/65">Resumen</label><textarea id="post-excerpt" value={form.excerpt} maxLength={600} rows={3} onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))} placeholder="La respuesta que encontrará quien lea este artículo." className="input" /></div>
    <div className="rounded-2xl border border-white/15 bg-white/[.025] p-5 sm:p-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><label htmlFor="post-content" className="text-xs font-semibold uppercase tracking-wider text-white/65">Contenido · Markdown</label><button type="button" onClick={() => setPreview(v => !v)} aria-pressed={preview} className="button border-white/20 text-white"><span className="inline-flex items-center gap-2">{preview ? <PenLine size={15} /> : <Eye size={15} />}{preview ? 'Volver a editar' : 'Vista previa privada'}</span></button></div>{preview ? <div><p className="mb-5 rounded-lg bg-purple-400/10 p-3 text-xs leading-relaxed text-purple-200">Vista previa sin publicar. Usa el mismo formato de tablas, imágenes y código que el artículo público.</p><h2 className="mb-4 font-display text-3xl font-bold text-white">{form.title || 'Título del artículo'}</h2>{form.excerpt && <p className="mb-6 text-white/65">{form.excerpt}</p>}<div className={articleStyles.article} dangerouslySetInnerHTML={{ __html: rendered?.html || '' }} /></div> : <textarea id="post-content" value={form.content} maxLength={200000} onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))} placeholder={'## Una sección\n\nTu contenido…'} className="input min-h-[500px] resize-y font-mono !text-sm" />}<details className="mt-5 text-xs text-white/60"><summary className="cursor-pointer py-2">Formato disponible</summary><p className="mt-2 leading-relaxed">Encabezados ## y ###, listas, enlaces, citas, tablas con |, bloques de código con tres acentos graves e imágenes con ![texto alternativo](/ruta/imagen.webp). El HTML se muestra como texto y se bloquean protocolos inseguros.</p></details></div></div>
    <aside className="space-y-4 lg:sticky lg:top-8"><div className="space-y-5 rounded-2xl border border-white/15 p-5"><p className="text-xs font-semibold uppercase tracking-widest text-purple-200">{form.published ? 'Publicado' : 'Borrador'}{dirty ? ' · Cambios sin guardar' : ''}</p><label className="block"><span className="mb-2 block text-xs text-white/65">Categoría</span><select className="input" value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}>{Array.from(new Set([...CATEGORIES, form.category])).map(category => <option key={category} value={category}>{category}</option>)}</select></label><label className="block"><span className="mb-2 block text-xs text-white/65">Portada · URL HTTPS o ruta del sitio</span><input className="input" value={form.cover} maxLength={2000} onChange={e => setForm(prev => ({ ...prev, cover: e.target.value }))} placeholder="/imagenes/articulo.webp" /></label><p className="text-sm text-white/65">Lectura calculada: <strong className="text-white">{readingTime(form.content)} min</strong></p><p className="text-xs leading-relaxed text-white/50">Conservamos las fechas registradas. Si una fecha es desconocida, no la inventamos al guardar o republicar.</p></div><button type="button" onClick={() => submit(true)} disabled={saving || deleting || form.title.trim().length < 2 || form.content.length < 10} className="button w-full border-purple-300/40 bg-purple-400/20 text-white"><Save size={15} />{saving ? 'Guardando…' : form.published ? 'Guardar cambios publicados' : 'Publicar artículo'}</button><button type="button" onClick={() => submit(false)} disabled={saving || deleting || form.title.trim().length < 2 || form.content.length < 10} className="button w-full border-white/20 text-white/85">{form.published ? 'Retirar y guardar borrador' : 'Guardar borrador'}</button>{form.id && <button type="button" onClick={remove} disabled={saving || deleting} className="button w-full border-rose-400/25 text-rose-300"><Trash2 size={15} />{deleting ? 'Eliminando…' : 'Eliminar artículo'}</button>}{form.published && <Link href={`/blog/${form.slug}`} target="_blank" className="inline-flex min-h-11 items-center text-sm text-purple-200 underline underline-offset-4">Ver artículo publicado</Link>}<p role="status" className="text-sm leading-relaxed text-emerald-200">{feedback}</p>{error && <p role="alert" className="rounded-xl border border-rose-300/30 bg-rose-300/5 p-4 text-sm leading-relaxed text-rose-200">{error}</p>}</aside>
    <style jsx>{`.input { width:100%; min-height:48px; padding:12px; border-radius:10px; background:#071323; border:1px solid rgba(255,255,255,.2); color:white; font-size:16px; } .input:focus-visible, .button:focus-visible { outline:2px solid #bfdbfe; outline-offset:3px; } .input::placeholder { color:rgba(255,255,255,.35); } .button { display:inline-flex; min-height:44px; align-items:center; justify-content:center; gap:8px; border-width:1px; border-radius:999px; padding:10px 16px; font-size:13px; font-weight:600; } .button:disabled { opacity:.4; cursor:not-allowed; }`}</style>
  </fieldset>;
}
