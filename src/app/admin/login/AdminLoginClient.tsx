'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ArrowRight, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await signIn('credentials', { email, password, redirect: false });
      if (r?.error) {
        toast.error('Credenciales incorrectas');
      } else {
        toast.success('Acceso concedido');
        router.push('/admin');
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl glass-strong p-8 md:p-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <Shield size={11} /> Admin
        </div>
        <h1 className="font-display text-3xl text-white" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
          Acceso interno
        </h1>
        <p className="mt-2 text-sm text-white/55">Solo personal autorizado de Latech.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/55">Email</span>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@latech.es" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/55">Contraseña</span>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60 glow-purple"
            style={{ background: 'var(--grad-signature)' }}
          >
            {loading ? 'Entrando…' : 'Entrar'} <ArrowRight size={16} />
          </button>
        </form>
      </div>
      <style jsx>{`
        .input { width:100%; height:48px; padding:0 14px; border-radius:14px; background:rgba(7,5,14,0.5); border:1px solid var(--border-subtle); color:var(--text-primary); font-size:14px; }
        .input::placeholder { color:rgba(255,255,255,0.3); }
        .input:focus { outline:none; border-color:var(--purple-400); box-shadow:0 0 0 3px rgba(139,92,246,0.18); }
      `}</style>
    </div>
  );
}
