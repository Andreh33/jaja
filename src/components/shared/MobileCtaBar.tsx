'use client';

import { usePathname } from 'next/navigation';
import { Phone, MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/lib/stripe-links';

/** Rutas de aplicación (no comerciales) donde la barra molesta. */
const HIDDEN_PREFIXES = ['/admin', '/dashboard', '/cursos', '/login', '/registro', '/recuperar'];

/**
 * Barra fija de contacto para móvil (llamar + WhatsApp). En servicios la
 * decisión se toma en segundos y la mayoría del tráfico es móvil: el teléfono
 * debe estar siempre a un toque. En escritorio se oculta (ahí ya está el
 * botón flotante de WhatsApp). Los clics los registra ContactClickTracker.
 */
export default function MobileCtaBar() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))) return null;

  return (
    <nav
      aria-label="Contacto rápido"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t md:hidden"
      style={{
        borderColor: 'var(--border-subtle)',
        background: 'rgba(7,5,14,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <a
        href="tel:+34684739091"
        className="flex h-14 items-center justify-center gap-2 text-sm font-semibold text-white"
      >
        <Phone size={16} style={{ color: 'var(--purple-300)' }} aria-hidden />
        Llamar
      </a>
      <a
        href={whatsappLink('Hola, quiero información sobre Latech')}
        target="_blank"
        rel="noreferrer"
        className="flex h-14 items-center justify-center gap-2 text-sm font-semibold text-white"
        style={{ background: '#25D366' }}
      >
        <MessageCircle size={16} aria-hidden />
        WhatsApp
      </a>
    </nav>
  );
}
