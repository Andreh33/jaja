'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function RegistroClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', accept: false });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (!form.accept) {
      toast.error('Debes aceptar términos y privacidad');
      return;
    }
    setLoading(true);
    try {
      const r = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        toast.error(data.error || 'Error al registrar');
        setLoading(false);
        return;
      }
      const sign = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      if (sign?.error) {
        toast.error('Cuenta creada. Inicia sesión.');
        router.push('/login');
      } else {
        toast.success('Bienvenido a Latech');
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      toast.error('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl glass-strong p-8 md:p-10">
        <h1 className="font-display text-3xl text-white" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
          Crea tu cuenta
        </h1>
        <p className="mt-2 text-sm text-white/55">Para clientes de Latech. Sin coste.</p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <Field label="Nombre">
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tu nombre" />
          </Field>
          <Field label="Email">
            <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" />
          </Field>
          <Field label="Teléfono">
            <input className="input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+34 ..." />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Contraseña">
              <input className="input" type="password" minLength={6} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
            </Field>
            <Field label="Confirma">
              <input className="input" type="password" minLength={6} required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Repítela" />
            </Field>
          </div>
          <label className="mt-2 flex items-start gap-2 text-xs text-white/60">
            <input type="checkbox" className="mt-0.5" checked={form.accept} onChange={(e) => setForm({ ...form, accept: e.target.checked })} required />
            <span>
              He leído y acepto los{' '}
              <Link href="/terminos" className="link-underline text-white/85">Términos</Link> y la{' '}
              <Link href="/privacidad" className="link-underline text-white/85">Política de Privacidad</Link>.
            </span>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60 glow-purple"
            style={{ background: 'var(--grad-signature)' }}
          >
            {loading ? 'Creando…' : 'Crear cuenta'} <ArrowRight size={16} />
          </button>
        </form>
      </div>

      <style jsx>{`
        .input { width:100%; height:48px; padding:0 14px; border-radius:14px; background:rgba(7,5,14,0.5); border:1px solid var(--border-subtle); color:var(--text-primary); font-size:14px; transition:all .2s; }
        .input::placeholder { color:rgba(255,255,255,0.3); }
        .input:focus { outline:none; border-color:var(--purple-400); box-shadow:0 0 0 3px rgba(139,92,246,0.18); }
      `}</style>
    </div>
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
