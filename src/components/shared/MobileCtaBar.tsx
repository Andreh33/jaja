'use client';

import { usePathname } from 'next/navigation';
import { Phone, MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/lib/stripe-links';
import styles from '../layout/public-mobile.module.css';

/** Focused flows already provide their own actions or fixed summary. */
const HIDDEN_PREFIXES = [
  '/admin', '/dashboard', '/cursos', '/login', '/registro', '/recuperar',
  '/reset-password', '/lab', '/briefing', '/tienda/calculadora', '/checkout', '/pago', '/cuenta',
];

export default function MobileCtaBar() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`))) return null;

  return (
    <>
    <div aria-hidden className={styles.contactSafeArea} />
    <nav aria-label="Contacto rápido" className={styles.contactBar}>
      <a href="tel:+34684739091" className={styles.contactPhone}>
        <Phone size={17} aria-hidden />
        <span>Llamar</span>
      </a>
      <a
        href={whatsappLink('Hola, quiero información sobre Latech')}
        target="_blank"
        rel="noreferrer"
        className={styles.contactWhatsapp}
      >
        <MessageCircle size={18} aria-hidden />
        <span>Hablemos <span className={styles.contactChannel}>por WhatsApp</span></span>
      </a>
    </nav>
    </>
  );
}
