'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: 'web', message: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      toast.success('Mensaje enviado · Te respondemos en menos de 24h');
      setForm({ name: '', email: '', phone: '', service: 'web', message: '' });
    } catch {
      toast.error('Error enviando. Prueba por WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre">
          <input className="input" required placeholder="Tu nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Email">
          <input className="input" type="email" required placeholder="tu@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Teléfono">
          <input className="input" type="tel" placeholder="Opcional" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <Field label="Servicio">
          <select className="input" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
            <option value="web">Página web</option>
            <option value="tienda">Tienda online</option>
            <option value="ia">Agente IA</option>
            <option value="otro">Otro</option>
          </select>
        </Field>
      </div>
      <Field label="Mensaje">
        <textarea className="input min-h-[140px] py-3" required placeholder="Cuéntanos qué necesitas..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </Field>
      <button
        type="submit"
        disabled={loading}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60 glow-purple"
        style={{ background: 'var(--grad-signature)' }}
      >
        {loading ? 'Enviando…' : 'Enviar mensaje'} <ArrowRight size={16} />
      </button>
      <p className="text-center text-xs text-white/40">
        Te respondemos en menos de 24h con propuesta o asesoramiento.
      </p>

      <style jsx>{`
        .input { width:100%; height:48px; padding:0 14px; border-radius:14px; background:rgba(7,5,14,0.5); border:1px solid var(--border-subtle); color:var(--text-primary); font-size:14px; transition:all .2s; }
        .input::placeholder { color:rgba(255,255,255,0.3); }
        .input:focus { outline:none; border-color:var(--purple-400); box-shadow:0 0 0 3px rgba(139,92,246,0.18); }
        textarea.input { min-height:140px; }
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
