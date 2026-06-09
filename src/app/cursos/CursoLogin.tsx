'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export default function CursoLogin() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch('/api/cursos/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const data = await r.json();
      if (!r.ok) {
        toast.error(data.error || 'No se pudo acceder.');
        return;
      }
      toast.success(`¡Bienvenido, ${name.trim().split(' ')[0]}!`);
      router.refresh();
    } catch {
      toast.error('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100svh-160px)] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl glass-strong p-7 md:p-9"
      >
        <div
          className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white"
          style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #10B981 100%)' }}
        >
          <GraduationCap size={22} />
        </div>
        <h1 className="font-display text-3xl text-white" style={{ letterSpacing: '-0.03em', fontWeight: 800 }}>
          Formación comercial
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Identifícate para empezar el curso. Tu progreso queda guardado con tu teléfono,
          así puedes continuar desde cualquier dispositivo.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <Field label="Nombre y apellidos">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
              className="curso-input"
            />
          </Field>
          <Field label="Teléfono">
            <input
              type="tel"
              required
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="600 11 22 33"
              autoComplete="tel"
              className="curso-input"
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60 glow-purple"
            style={{ background: 'var(--grad-signature)' }}
          >
            {loading ? 'Entrando…' : 'Empezar el curso'} <ArrowRight size={16} />
          </button>
        </form>
      </motion.div>

      <style jsx>{`
        .curso-input {
          width: 100%;
          height: 50px;
          padding: 0 14px;
          border-radius: 14px;
          background: rgba(7, 5, 14, 0.5);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          font-size: 16px; /* 16px evita el zoom automático de iOS Safari */
          transition: all 0.2s;
        }
        .curso-input::placeholder { color: rgba(255, 255, 255, 0.3); }
        .curso-input:focus {
          outline: none;
          border-color: var(--purple-400);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
        }
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
