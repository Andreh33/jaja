'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';

const KEY = 'latech-welcome-dismissed';

export default function WelcomeBanner({ name }: { name?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(KEY)) setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(KEY, '1');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="relative mb-6 overflow-hidden rounded-2xl border p-5 md:p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.10) 0%, rgba(249,115,22,0.06) 100%)',
            borderColor: 'rgba(139,92,246,0.25)',
          }}
        >
          <button onClick={dismiss} aria-label="Cerrar" className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white">
            <X size={14} />
          </button>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(139,92,246,0.18)', color: 'var(--purple-300)' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
                ¡Bienvenido a tu panel{name ? `, ${name}` : ''}!
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">
                Como cliente de Latech, aquí puedes subir las fotos, vídeos y logos de tu negocio,
                además de la información que necesitamos para crear tu web (horarios, teléfono,
                redes sociales, descripción...). <strong>Cuanto más detalle nos des, mejor será el resultado.</strong>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
