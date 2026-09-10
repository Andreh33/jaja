import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/lib/stripe-links';

export default function RecuperarClient({ retiredLink = false }: { retiredLink?: boolean }) {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl glass-strong p-8 md:p-10">
        <h1 className="font-display text-3xl text-white" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>Recuperar acceso</h1>
        {retiredLink && <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">El enlace anterior ya no es válido. Puedes solicitar ayuda al equipo para recuperar tu cuenta.</p>}
        <p className="mt-5 text-sm leading-relaxed text-white/70">La recuperación automática por email no está disponible. Habla con el equipo de Latech: verificaremos que la cuenta te pertenece antes de ayudarte a recuperar el acceso.</p>
        <a href={whatsappLink('Hola, necesito ayuda para recuperar el acceso a mi cuenta de Latech.')} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-center text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-300" style={{ background: 'var(--grad-signature)' }}>
          <MessageCircle size={18} aria-hidden /> Solicitar ayuda por WhatsApp
        </a>
        <p className="mt-4 text-xs leading-relaxed text-white/55">No envíes contraseñas, códigos de acceso ni datos de pago por WhatsApp. Abrir el chat no cambia tu contraseña ni recupera la cuenta automáticamente.</p>
        <Link href="/contacto" className="mt-6 block text-center text-sm text-white/75 underline underline-offset-4 hover:text-white">Prefiero contactar desde la web</Link>
        <Link href="/login" className="mt-4 block text-center text-sm text-white/55 hover:text-white">Volver a iniciar sesión</Link>
      </div>
    </div>
  );
}
