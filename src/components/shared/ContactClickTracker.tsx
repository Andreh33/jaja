'use client';

import { useEffect } from 'react';
import { track } from '@vercel/analytics';

import { commercialDestination, contactChannel, measurementPath } from '@/lib/measurement';

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
      const channel = contactChannel(href);
      const path = measurementPath(window.location.pathname);
      if (!path) return;
      try {
        if (channel) track('contact_click', { channel, path });
        const destination = commercialDestination(href, window.location.origin);
        if (destination && destination !== window.location.pathname) track('commercial_navigation', { source: path, destination });
      } catch { /* Navigation remains available without analytics. */ }
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);
  return null;
}
