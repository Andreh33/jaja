'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { whatsappLink } from '@/lib/stripe-links';

export default function WhatsAppFloat() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();
  const hide = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard');

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 2200);
    return () => clearTimeout(t);
  }, []);

  if (hide) return null;
  return (
    <AnimatePresence>
      {show && (
        <motion.a
          initial={{ opacity: 0, scale: 0.6, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          href={whatsappLink('Hola, me gustaría saber más sobre Latech')}
          target="_blank"
          rel="noreferrer"
          aria-label="Contacto por WhatsApp"
          className="group fixed bottom-6 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
          style={{ background: '#25D366', boxShadow: '0 0 0 4px rgba(37,211,102,0.18), 0 10px 40px rgba(37,211,102,0.35)' }}
        >
          <span className="absolute inset-0 rounded-full" style={{ background: '#25D366', opacity: 0.5, animation: 'pulse-dot 2s ease-in-out infinite' }} />
          <svg viewBox="0 0 32 32" className="relative h-7 w-7 fill-white">
            <path d="M16.0024 4C9.3779 4 4.00386 9.37404 4.00046 15.9986C3.99877 18.1175 4.55284 20.1853 5.60571 22.0067L4 28L10.1417 26.4374C11.8957 27.3936 13.9303 27.8997 16.0024 27.8997H16.0058C22.6303 27.8997 28.0044 22.5257 28.0078 15.9008C28.0091 12.6917 26.7613 9.67429 24.4923 7.40391C22.2233 5.13354 19.2069 4.00134 16.0024 4ZM16.0024 25.7989C14.1457 25.7989 12.3231 25.291 10.7388 24.3328L10.3658 24.1117L6.7196 25.0392L7.66308 21.4795L7.42178 21.0918C6.36825 19.4475 5.81297 17.7517 5.81471 15.9986C5.81734 10.5267 10.5305 6.10086 16.0058 6.10086C18.6549 6.10157 21.1487 7.13167 23.0264 9.01069C24.9041 10.8897 25.9332 13.3856 25.9302 16.0349C25.9275 21.5068 21.4715 25.7989 16.0024 25.7989ZM21.4364 18.4985C21.1396 18.3505 19.6661 17.6266 19.3938 17.5294C19.1216 17.4322 18.9229 17.3837 18.7242 17.6809C18.5255 17.978 17.9514 18.6464 17.7775 18.8455C17.6035 19.0446 17.4296 19.0701 17.1328 18.9221C16.8361 18.7741 15.8676 18.4561 14.7193 17.4322C13.8225 16.6336 13.2196 15.6477 13.0457 15.3506C12.8718 15.0534 13.027 14.892 13.1769 14.7444C13.3128 14.6109 13.4758 14.3974 13.6248 14.2229C13.7738 14.0485 13.8224 13.9229 13.921 13.7238C14.0197 13.5247 13.9703 13.3502 13.8961 13.2022C13.8224 13.0542 13.2222 11.5717 12.9748 10.9774C12.7327 10.3964 12.4878 10.4757 12.3055 10.4664C12.132 10.4577 11.9332 10.4575 11.7345 10.4575C11.5358 10.4575 11.2143 10.5318 10.942 10.829C10.6698 11.1262 9.9 11.8501 9.9 13.3325C9.9 14.815 10.9669 16.247 11.1159 16.4461C11.2649 16.6452 13.211 19.6442 16.193 20.9476C16.9019 21.2581 17.4554 21.4438 17.886 21.5832C18.5995 21.812 19.2486 21.7791 19.7621 21.7036C20.3343 21.6195 21.5286 20.9836 21.776 20.3128C22.0234 19.642 22.0234 19.0671 21.9492 18.9477C21.8755 18.8283 21.6767 18.7541 21.38 18.6061L21.4364 18.4985Z" />
          </svg>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
