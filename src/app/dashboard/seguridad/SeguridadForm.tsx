'use client';

import { useState } from 'react';
import { Lock, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { signOut } from 'next-auth/react';

export default function SeguridadForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      const r = await fetch('/api/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        toast.error(data.error || 'Error al cambiar contraseña');
        return;
      }
      toast.success('Contraseña actualizada');
      setCurrent(''); setNext(''); setConfirm('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="rounded-2xl glass p-6 md:p-8">
        <h2 className="font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
          Cambiar contraseña
        </h2>
        <p className="mt-2 text-sm text-white/55">Mínimo 6 caracteres. Usa una contraseña única que no uses en otros sitios.</p>
        <div className="mt-6 space-y-4">
          <Field label="Contraseña actual">
            <input type="password" required className="input" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </Field>
          <Field label="Nueva contraseña">
            <input type="password" minLength={6} required className="input" value={next} onChange={(e) => setNext(e.target.value)} />
          </Field>
          <Field label="Confirma">
            <input type="password" minLength={6} required className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </Field>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-7 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 glow-purple"
          style={{ background: 'var(--grad-signature)' }}
        >
          <Lock size={14} /> {loading ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
        <style jsx>{`
          .input { width:100%; height:46px; padding:0 14px; border-radius:12px; background:rgba(7,5,14,0.5); border:1px solid var(--border-subtle); color:var(--text-primary); font-size:14px; }
          .input:focus { outline:none; border-color:var(--purple-400); box-shadow:0 0 0 3px rgba(139,92,246,0.18); }
        `}</style>
      </form>

      <div className="rounded-2xl glass p-6 md:p-8">
        <h2 className="font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
          Cerrar sesión en todos los dispositivos
        </h2>
        <p className="mt-2 text-sm text-white/55">Si crees que alguien ha accedido a tu cuenta, cierra sesión en todos lados.</p>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-5 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium text-white/85 hover:text-white hover:bg-white/5"
          style={{ borderColor: 'var(--border-strong)' }}
        >
          <LogOut size={14} /> Cerrar sesión
        </button>
      </div>
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
