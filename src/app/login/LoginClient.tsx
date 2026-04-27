'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import MagneticButton from '@/components/effects/MagneticButton';

type Stage = 'select' | 'login';

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const callback = params?.get('callbackUrl') || '/dashboard';
  const [stage, setStage] = useState<Stage>('select');
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (r?.error) {
        toast.error('Credenciales incorrectas');
      } else {
        toast.success('Bienvenido a Latech');
        router.push(callback);
        router.refresh();
      }
    } catch {
      toast.error('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl">
      <AnimatePresence mode="wait">
        {stage === 'select' ? (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display mb-3 text-center text-4xl md:text-6xl"
              style={{ letterSpacing: '-0.04em', fontWeight: 800 }}
            >
              ¿Cómo entras hoy?
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-14 text-center text-base text-white/55"
            >
              Elige tu portal para acceder.
            </motion.p>

            <div className="flex flex-col items-center gap-12 md:flex-row md:gap-20">
              <PortalCircle
                onClick={() => setStage('login')}
                title="Negocios"
                subtitle="Si nos has comprado un servicio, accede aquí para subir fotos, logos y la info de tu empresa."
                gradient="linear-gradient(135deg, #8B5CF6 0%, #F97316 100%)"
                delay={0.15}
                shape={(
                  <g stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path d="M40 110 L40 60 L70 40 L100 60 L100 110 Z" pathLength="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.4 }} />
                    <motion.path d="M55 110 L55 80 L85 80 L85 110" pathLength="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.1 }} />
                    <motion.circle cx="70" cy="55" r="3" fill="#fff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} />
                  </g>
                )}
              />

              <div aria-hidden className="hidden text-xs uppercase tracking-[0.3em] text-white/30 md:block">vs</div>

              <PortalCircle
                onClick={() => {
                  window.location.href = 'https://hh-gamma.vercel.app/dashboard';
                }}
                title="Trabajadores"
                subtitle="Equipo de Latech. Acceso al CRM interno."
                gradient="linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)"
                delay={0.3}
                shape={(
                  <g stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <motion.circle cx="70" cy="55" r="20" pathLength="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.5 }} />
                    <motion.path d="M40 110 Q40 80 70 80 Q100 80 100 110" pathLength="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 1.2 }} />
                    <motion.path d="M70 35 L70 25 M55 40 L48 32 M85 40 L92 32" pathLength="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 1.8 }} />
                  </g>
                )}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className="mx-auto w-full max-w-md"
          >
            <button
              onClick={() => setStage('select')}
              className="mb-6 inline-flex items-center gap-2 text-xs text-white/55 transition-colors hover:text-white"
            >
              <ArrowLeft size={14} /> Cambiar portal
            </button>

            <div className="rounded-3xl glass-strong p-8 md:p-10">
              <h2 className="font-display text-3xl text-white" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                Accede a tu panel
              </h2>
              <p className="mt-2 text-sm text-white/55">Bienvenido de vuelta. Introduce tus credenciales.</p>

              <form onSubmit={submit} className="mt-7 space-y-4">
                <Field label="Email">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="input"
                  />
                </Field>
                <Field label="Contraseña">
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                      aria-label="Mostrar/ocultar"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>
                <div className="flex items-center justify-between text-sm">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-white/60">
                    <input type="checkbox" className="h-4 w-4 rounded" /> Recordarme
                  </label>
                  <Link href="/recuperar" className="link-underline text-white/60 hover:text-white">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60 glow-purple"
                  style={{ background: 'var(--grad-signature)' }}
                >
                  {loading ? 'Entrando…' : 'Entrar'} <ArrowRight size={16} />
                </button>
              </form>

              <div className="my-6 flex items-center gap-3 text-xs text-white/30">
                <div className="h-px flex-1 bg-white/10" />o<div className="h-px flex-1 bg-white/10" />
              </div>
              <p className="text-center text-sm text-white/55">
                ¿Aún no tienes cuenta?{' '}
                <Link href="/registro" className="link-underline font-medium text-white">Crear cuenta</Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .input {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          border-radius: 14px;
          background: rgba(7, 5, 14, 0.5);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          font-size: 14px;
          transition: all 0.2s;
        }
        .input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        .input:focus {
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

function PortalCircle({
  title, subtitle, gradient, onClick, shape, delay,
}: {
  title: string;
  subtitle: string;
  gradient: string;
  onClick: () => void;
  shape: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, rotate: -4 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 110, damping: 14, delay }}
      className="flex flex-col items-center"
    >
      <button
        type="button"
        onClick={onClick}
        className="group relative h-[260px] w-[260px] cursor-pointer rounded-full transition-all duration-500 hover:scale-[1.06] md:h-[280px] md:w-[280px]"
        style={{
          background: gradient,
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 30px 90px rgba(139,92,246,0.35)',
        }}
        aria-label={title}
      >
        <span className="absolute inset-2 rounded-full" style={{ background: 'rgba(7,5,14,0.55)', backdropFilter: 'blur(8px)' }} />
        <span className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ boxShadow: '0 0 90px rgba(139,92,246,0.6)' }} />
        <svg viewBox="0 0 140 140" className="relative h-full w-full">
          {shape}
        </svg>
      </button>
      <h3 className="mt-7 font-display text-2xl text-white" style={{ letterSpacing: '-0.03em', fontWeight: 700 }}>
        {title}
      </h3>
      <p className="mt-3 max-w-[260px] text-center text-xs leading-relaxed text-white/55">{subtitle}</p>
    </motion.div>
  );
}
