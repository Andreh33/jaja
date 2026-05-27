/**
 * Lógica pura del emergente de instalación PWA.
 *
 * Se aísla aquí (sin DOM) para poder testear la regla de "cuándo mostrar"
 * sin montar el componente. El componente `InstallPrompt` consume estas
 * funciones pasándole el estado real del dispositivo/almacenamiento.
 */

export type Platform = 'ios' | 'chromium' | 'unsupported';

export interface PromptEligibility {
  /** App ya instalada (display-mode: standalone o navigator.standalone en iOS). */
  installed: boolean;
  /** Plataforma detectada. */
  platform: Platform;
  /** Evento `beforeinstallprompt` capturado (solo Chromium). */
  hasDeferredPrompt: boolean;
  /** Marca de tiempo (epoch ms) del último cierre, o null si nunca se cerró. */
  lastDismissedAt: number | null;
  /** Ahora (epoch ms). */
  now: number;
}

/** No volver a mostrar el emergente durante este tiempo tras cerrarlo. */
export const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 días

/** Clave de localStorage donde se guarda el cierre. */
export const DISMISS_STORAGE_KEY = 'latech.pwa.dismissedAt';

/**
 * Decide si el emergente es ELEGIBLE para mostrarse. La aparición diferida
 * (tras scroll o unos segundos) es responsabilidad de la UI, no de esta regla.
 */
export function shouldShowPrompt(s: PromptEligibility): boolean {
  if (s.installed) return false;
  if (s.platform === 'unsupported') return false;

  if (s.lastDismissedAt !== null && s.now - s.lastDismissedAt < DISMISS_COOLDOWN_MS) {
    return false;
  }

  // En Chromium no hay instalación de 1 clic sin el evento capturado:
  // esperamos a `beforeinstallprompt`.
  if (s.platform === 'chromium' && !s.hasDeferredPrompt) return false;

  // iOS muestra instrucciones; Chromium con evento muestra el botón Instalar.
  return true;
}

/**
 * Detección de plataforma a partir del user-agent. iOS (Safari) no soporta
 * `beforeinstallprompt`, así que se trata aparte (instrucciones manuales).
 * El resto se considera Chromium y se gatea con `hasDeferredPrompt`.
 */
export function detectPlatform(userAgent: string): Platform {
  if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
  return 'chromium';
}
