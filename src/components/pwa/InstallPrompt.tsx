'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@vercel/analytics';
import { X, Share } from 'lucide-react';
import {
  shouldShowPrompt,
  detectPlatform,
  DISMISS_STORAGE_KEY,
  type Platform,
} from '@/lib/install-prompt';

/** El evento beforeinstallprompt no está en lib.dom; lo tipamos mínimamente. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const SHOW_DELAY_MS = 6000;

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function getLastDismissed(): number | null {
  try {
    const v = localStorage.getItem(DISMISS_STORAGE_KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

export default function InstallPrompt() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [platform] = useState<Platform>(() =>
    typeof navigator !== 'undefined' ? detectPlatform(navigator.userAgent) : 'chromium',
  );
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const hideOnRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard');

  useEffect(() => {
    if (typeof window === 'undefined' || isStandalone()) return;

    let deferredEvt: BeforeInstallPromptEvent | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const evaluate = () => {
      const eligible = shouldShowPrompt({
        installed: isStandalone(),
        platform,
        hasDeferredPrompt: deferredEvt !== null,
        lastDismissedAt: getLastDismissed(),
        now: Date.now(),
      });
      if (eligible && timer === undefined) {
        timer = setTimeout(() => {
          setVisible(true);
          track('pwa_prompt_shown', { platform });
        }, SHOW_DELAY_MS);
      }
    };

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredEvt = e as BeforeInstallPromptEvent;
      setDeferred(deferredEvt);
      evaluate();
    };
    const onInstalled = () => {
      setVisible(false);
      track('pwa_prompt_installed', { platform });
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    // iOS no dispara beforeinstallprompt: evaluamos para mostrar instrucciones.
    if (platform === 'ios') evaluate();

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      if (timer) clearTimeout(timer);
    };
  }, [platform]);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    } catch {
      /* almacenamiento no disponible — no pasa nada */
    }
    track('pwa_prompt_dismissed', { platform });
  }, [platform]);

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    track(outcome === 'accepted' ? 'pwa_prompt_installed' : 'pwa_prompt_dismissed', { platform });
    setDeferred(null);
    setVisible(false);
  }, [deferred, platform]);

  if (hideOnRoute) return null;

  const isIOS = platform === 'ios';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          role="dialog"
          aria-label="Instalar la app de Latech"
          className="glass-strong fixed z-50 overflow-hidden rounded-2xl p-4"
          style={{
            right: 'calc(env(safe-area-inset-right, 0px) + 1.25rem)',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5.5rem)',
            width: 'min(360px, calc(100vw - 2.5rem))',
            boxShadow: '0 24px 60px rgba(7,5,14,0.6)',
          }}
        >
          <button
            onClick={dismiss}
            aria-label="Cerrar"
            className="absolute right-2.5 top-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/10 hover:text-white/80"
          >
            <X size={15} />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon-192.png"
              alt="Latech"
              width={46}
              height={46}
              className="flex-shrink-0 rounded-xl"
              style={{ boxShadow: '0 0 22px rgba(139,92,246,0.5), 0 0 30px rgba(249,115,22,0.2)' }}
            />
            <div className="min-w-0">
              <p className="font-display text-[15px] font-bold leading-tight text-white">
                Instala la app de Latech
              </p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-white/55">
                Acceso directo desde tu inicio
              </p>
            </div>
          </div>

          {isIOS ? (
            <div className="mt-3.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-[12.5px] leading-relaxed text-white/70">
              <span className="inline-flex items-center gap-1.5">
                Pulsa <Share size={14} className="inline text-[var(--purple-300)]" /> Compartir
              </span>
              <br />
              y luego{' '}
              <strong className="font-semibold text-white">«Añadir a pantalla de inicio»</strong>.
            </div>
          ) : (
            <button
              onClick={install}
              className="mt-4 w-full rounded-xl py-2.5 text-sm font-bold text-white transition-transform active:scale-[0.98]"
              style={{
                background: 'var(--grad-signature)',
                backgroundSize: '200% 200%',
                boxShadow: '0 8px 26px rgba(139,92,246,0.4), 0 6px 24px rgba(249,115,22,0.2)',
              }}
            >
              Instalar
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
