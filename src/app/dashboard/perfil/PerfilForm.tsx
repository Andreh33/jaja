'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

export default function PerfilForm({ user }: { user: { name: string; email: string; phone: string } }) {
  const [form, setForm] = useState(user);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch('/api/perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      });
      if (!r.ok) throw new Error();
      toast.success('Perfil actualizado');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl glass p-6 md:p-8">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white" style={{ background: 'var(--grad-signature)' }}>
          {(form.name?.[0] || 'U').toUpperCase()}
        </div>
        <div>
          <div className="font-display text-xl text-white">{form.name || 'Tu nombre'}</div>
          <div className="text-sm text-white/45">{form.email}</div>
        </div>
      </div>

      <div className="space-y-4">
        <Field label="Nombre"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Email (no modificable)"><input className="input" disabled value={form.email} /></Field>
        <Field label="Teléfono"><input className="input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-7 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 glow-purple"
        style={{ background: 'var(--grad-signature)' }}
      >
        <Save size={14} /> {loading ? 'Guardando…' : 'Guardar cambios'}
      </button>

      <style jsx>{`
        .input { width:100%; height:46px; padding:0 14px; border-radius:12px; background:rgba(7,5,14,0.5); border:1px solid var(--border-subtle); color:var(--text-primary); font-size:14px; }
        .input:focus { outline:none; border-color:var(--purple-400); box-shadow:0 0 0 3px rgba(139,92,246,0.18); }
        .input:disabled { opacity:0.55; cursor:not-allowed; }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/55">{label}</span>
      {children}
    </label>
  );
}
