'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetClient({ token }: { token: string }) {
  const router = useRouter();
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd !== confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      const r = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: pwd }),
      });
      if (!r.ok) {
        toast.error('Token inválido o expirado');
      } else {
        toast.success('Contraseña actualizada');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl glass-strong p-8 md:p-10">
        <h1 className="font-display text-3xl text-white" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>Nueva contraseña</h1>
        <p className="mt-2 text-sm text-white/55">Elige una contraseña nueva, mínimo 6 caracteres.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/55">Contraseña</span>
            <input className="input" type="password" minLength={6} required value={pwd} onChange={(e) => setPwd(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/55">Confirma</span>
            <input className="input" type="password" minLength={6} required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60 glow-purple"
            style={{ background: 'var(--grad-signature)' }}
          >
            {loading ? 'Guardando…' : 'Guardar contraseña'} <ArrowRight size={16} />
          </button>
        </form>
      </div>
      <style jsx>{`
        .input { width:100%; height:48px; padding:0 14px; border-radius:14px; background:rgba(7,5,14,0.5); border:1px solid var(--border-subtle); color:var(--text-primary); font-size:14px; }
        .input:focus { outline:none; border-color:var(--purple-400); box-shadow:0 0 0 3px rgba(139,92,246,0.18); }
      `}</style>
    </div>
  );
}
