'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import type { Empresa } from '../../../drizzle/schema';

const SERVICES = [
  { id: 'web', label: 'Página web', color: 'var(--accent-web)' },
  { id: 'tienda', label: 'Tienda online', color: 'var(--accent-shop)' },
  { id: 'ia', label: 'Agente IA', color: 'var(--accent-ia)' },
];

type Form = {
  nombre: string;
  cif: string;
  sector: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  cp: string;
  horarios: string;
  redes: { instagram?: string; facebook?: string; tiktok?: string; web?: string; whatsapp?: string };
  descripcion: string;
  serviciosContratados: string[];
  notasInternas: string;
};

const HORARIOS_TPL = 'Lunes a Viernes: 9:00 - 14:00 y 16:00 - 19:00\nSábados: 10:00 - 14:00\nDomingos: cerrado';

export default function EmpresaForm({ initial }: { initial: Empresa | null }) {
  const [form, setForm] = useState<Form>({
    nombre: initial?.nombre || '',
    cif: initial?.cif || '',
    sector: initial?.sector || '',
    telefono: initial?.telefono || '',
    email: initial?.email || '',
    direccion: initial?.direccion || '',
    ciudad: initial?.ciudad || '',
    cp: initial?.cp || '',
    horarios: initial?.horarios || HORARIOS_TPL,
    redes: (initial?.redes as Form['redes']) || {},
    descripcion: initial?.descripcion || '',
    serviciosContratados: (initial?.serviciosContratados as string[]) || [],
    notasInternas: initial?.notasInternas || '',
  });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // autosave debounce
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        await fetch('/api/empresa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        setLastSaved(new Date());
      } catch {}
    }, 2000);
    return () => clearTimeout(t);
  }, [form]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch('/api/empresa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error();
      setLastSaved(new Date());
      toast.success('Empresa guardada');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const toggleService = (id: string) => {
    setForm((f) => ({
      ...f,
      serviciosContratados: f.serviciosContratados.includes(id)
        ? f.serviciosContratados.filter((x) => x !== id)
        : [...f.serviciosContratados, id],
    }));
  };

  return (
    <form onSubmit={submit} className="space-y-8 pb-24">
      <Section title="Información básica">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre comercial"><input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre de tu negocio" /></Field>
          <Field label="CIF / NIF"><input className="input" value={form.cif} onChange={(e) => setForm({ ...form, cif: e.target.value })} /></Field>
          <Field label="Sector"><input className="input" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="Restauración, peluquería..." /></Field>
        </div>
      </Section>

      <Section title="Contacto">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Teléfono principal"><input className="input" type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></Field>
          <Field label="Email empresa"><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Dirección" full><input className="input" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></Field>
          <Field label="Ciudad"><input className="input" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} /></Field>
          <Field label="Código postal"><input className="input" value={form.cp} onChange={(e) => setForm({ ...form, cp: e.target.value })} /></Field>
        </div>
      </Section>

      <Section title="Horarios">
        <textarea className="input min-h-[120px] py-3" value={form.horarios} onChange={(e) => setForm({ ...form, horarios: e.target.value })} />
      </Section>

      <Section title="Redes sociales">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Instagram"><input className="input" value={form.redes.instagram || ''} onChange={(e) => setForm({ ...form, redes: { ...form.redes, instagram: e.target.value } })} placeholder="@usuario" /></Field>
          <Field label="Facebook"><input className="input" value={form.redes.facebook || ''} onChange={(e) => setForm({ ...form, redes: { ...form.redes, facebook: e.target.value } })} /></Field>
          <Field label="TikTok"><input className="input" value={form.redes.tiktok || ''} onChange={(e) => setForm({ ...form, redes: { ...form.redes, tiktok: e.target.value } })} /></Field>
          <Field label="Web actual"><input className="input" value={form.redes.web || ''} onChange={(e) => setForm({ ...form, redes: { ...form.redes, web: e.target.value } })} placeholder="https://" /></Field>
          <Field label="WhatsApp" full><input className="input" value={form.redes.whatsapp || ''} onChange={(e) => setForm({ ...form, redes: { ...form.redes, whatsapp: e.target.value } })} placeholder="+34 ..." /></Field>
        </div>
      </Section>

      <Section title="Sobre tu empresa" subtitle="Cuéntanos quiénes sois, qué hacéis, qué os diferencia, vuestros servicios principales, vuestra historia... Cuanto más detalle, mejor para el copy de tu web. Mínimo 200 caracteres.">
        <textarea
          className="input min-h-[180px] py-3"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          placeholder="Hablamos de quiénes sois, qué ofrecéis y qué os diferencia..."
        />
        <div className="mt-2 text-right text-xs text-white/45">{form.descripcion.length} caracteres</div>
      </Section>

      <Section title="Servicios contratados">
        <div className="flex flex-wrap gap-3">
          {SERVICES.map((s) => {
            const on = form.serviciosContratados.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleService(s.id)}
                className="rounded-full px-4 py-2 text-sm font-medium transition-all"
                style={on
                  ? { background: `${s.color}25`, color: s.color, border: `1px solid ${s.color}60` }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid var(--border-subtle)' }}
              >
                {on ? '✓ ' : ''}{s.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Notas adicionales">
        <textarea className="input min-h-[100px] py-3" value={form.notasInternas} onChange={(e) => setForm({ ...form, notasInternas: e.target.value })} placeholder="Cualquier cosa que quieras transmitirnos..." />
      </Section>

      <div className="sticky bottom-0 -mx-6 -mb-12 flex items-center justify-between gap-4 border-t bg-bg-base/85 px-6 py-4 md:-mx-10 md:px-10" style={{ borderColor: 'var(--border-subtle)', background: 'rgba(7,5,14,0.85)', backdropFilter: 'blur(20px)' }}>
        <span className="text-xs text-white/45">
          {lastSaved ? `Guardado · ${lastSaved.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : 'Auto-guardado activo'}
        </span>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60 glow-purple"
          style={{ background: 'var(--grad-signature)' }}
        >
          <Save size={14} /> {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>

      <style jsx>{`
        .input { width:100%; height:46px; padding:0 14px; border-radius:12px; background:rgba(7,5,14,0.5); border:1px solid var(--border-subtle); color:var(--text-primary); font-size:14px; transition:all .2s; }
        .input::placeholder { color:rgba(255,255,255,0.3); }
        .input:focus { outline:none; border-color:var(--purple-400); box-shadow:0 0 0 3px rgba(139,92,246,0.18); }
        textarea.input { min-height:100px; }
      `}</style>
    </form>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl glass p-6 md:p-8">
      <h2 className="font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
        {title}
      </h2>
      {subtitle && <p className="mt-2 text-sm text-white/55">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? 'md:col-span-2' : ''}`}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/55">{label}</span>
      {children}
    </label>
  );
}
