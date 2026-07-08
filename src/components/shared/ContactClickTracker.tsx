'use client';

import { useEffect } from 'react';
import { track } from '@vercel/analytics';

function channelFor(href: string): string | null {
  if (href.startsWith('tel:')) return 'telefono';
  if (href.startsWith('mailto:')) return 'email';
  if (href.includes('wa.me/') || href.includes('api.whatsapp.com')) return 'whatsapp';
  return null;
}

/**
 * Instrumentación de micro-conversiones: registra en Vercel Analytics
 * cualquier clic en enlaces tel:/mailto:/wa.me de todo el sitio por
 * delegación de eventos, sin tocar cada componente. El envío del formulario
 * de contacto se registra aparte en ContactForm.
 */
export default function ContactClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const anchor = target?.closest?.('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      const channel = channelFor(href);
      if (!channel) return;
      track('contact_click', { channel, path: window.location.pathname });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);
  return null;
}
