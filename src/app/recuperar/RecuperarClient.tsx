'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function RecuperarClient() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (r.ok) {
        const data = await r.json();
        setSent(true);
        if (data.devLink) {
          toast.message('En producción enviaríamos email — link de prueba abajo', {
            description: data.devLink,
          });
        } else {
          toast.success('Si el email existe, te enviaremos un enlace');
        }
      }
    } catch {
      toast.error('Error inesperado');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl glass-strong p-8 md:p-10">
        <h1 className="font-display text-3xl text-white" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
          Recuperar acceso
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Introduce tu email y te mandaremos un enlace para restablecer la contraseña.
        </p>

        {sent ? (
          <div className="mt-7 rounded-2xl glass p-6 text-center">
            <div className="font-display text-xl text-white">📬 Comprueba tu bandeja</div>
            <p className="mt-3 text-sm text-white/55">
              Si tu email está registrado, recibirás un enlace para restablecer la contraseña.
              Caduca en 1 hora.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/55">Email</span>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
            </label>
            <button
              type="submit"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform active:scale-[0.98] glow-purple"
              style={{ background: 'var(--grad-signature)' }}
            >
              Enviar enlace <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        .input { width:100%; height:48px; padding:0 14px; border-radius:14px; background:rgba(7,5,14,0.5); border:1px solid var(--border-subtle); color:var(--text-primary); font-size:14px; transition:all .2s; }
        .input::placeholder { color:rgba(255,255,255,0.3); }
        .input:focus { outline:none; border-color:var(--purple-400); box-shadow:0 0 0 3px rgba(139,92,246,0.18); }
      `}</style>
    </div>
  );
}
