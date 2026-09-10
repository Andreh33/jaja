export type PauseReason = 'manual' | 'viewport' | 'hidden' | 'inactive' | 'focus';

let owner: symbol | null = null;
const subscribers = new Set<() => void>();

/** An open demo owns interaction until another game is deliberately resumed. */
export function suspendGames() {
  owner = null;
  subscribers.forEach((notify) => notify());
}

export function isEditableTarget(target: EventTarget | null) {
  return target instanceof HTMLElement
    && !!target.closest('input, textarea, select, [contenteditable="true"]');
}

/** Owns frame scheduling, visibility and pause reasons independently of physics. */
export function createGameSession({
  element,
  onFrame,
  onPause,
}: {
  element: HTMLElement;
  onFrame: (time: number, deltaSeconds: number) => void;
  onPause: (reasons: PauseReason[]) => void;
}) {
  const id = Symbol('latech-game');
  let disposed = false;
  let running = false;
  let raf = 0;
  let last = 0;
  const bounds = element.getBoundingClientRect();
  const reasons = new Set<PauseReason>(['manual', 'inactive']);
  if (document.hidden) reasons.add('hidden');
  if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) reasons.add('viewport');

  const frame = (time: number) => {
    raf = 0;
    if (disposed || !running || reasons.size) return;
    const delta = last ? Math.min((time - last) / 1000, 0.033) : 0;
    last = time;
    onFrame(time, delta);
    if (!disposed && running && !reasons.size) raf = requestAnimationFrame(frame);
  };
  const sync = () => {
    if (disposed) return;
    if (!running || reasons.size) {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    } else if (!raf) {
      raf = requestAnimationFrame(frame);
    }
    onPause([...reasons]);
  };
  const reason = (value: PauseReason, paused: boolean) => {
    if (reasons.has(value) === paused) return;
    if (paused) reasons.add(value); else reasons.delete(value);
    sync();
  };
  const onOwner = () => reason('inactive', owner !== id);
  subscribers.add(onOwner);
  const onVisibility = () => reason('hidden', document.hidden);
  const onBlur = () => reason('focus', true);
  const onFocus = () => { if (!element.contains(document.activeElement)) reason('focus', true); };
  const onFocusOut = (event: FocusEvent) => {
    if (!element.contains(event.relatedTarget as Node | null)) reason('focus', true);
  };
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('blur', onBlur);
  window.addEventListener('focus', onFocus);
  element.addEventListener('focusout', onFocusOut);
  const observer = new IntersectionObserver(([entry]) => reason('viewport', !entry.isIntersecting));
  observer.observe(element);

  return {
    play() {
      if (disposed) return;
      running = true;
      reasons.delete('manual');
      reasons.delete('focus');
      owner = id;
      subscribers.forEach((notify) => notify());
      sync();
    },
    pause() { reason('manual', true); },
    stop() { running = false; reason('manual', true); sync(); },
    canPlay() { return running && !reasons.size; },
    render() { if (!disposed && (!running || reasons.size)) onFrame(performance.now(), 0); },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      subscribers.delete(onOwner);
      if (owner === id) suspendGames();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      element.removeEventListener('focusout', onFocusOut);
    },
  };
}

export type GameSession = ReturnType<typeof createGameSession>;

export const PAUSE_LABELS: Record<PauseReason, string> = {
  manual: 'Has pausado la partida.',
  viewport: 'La partida se pausa al salir de la vista.',
  hidden: 'La partida se pausa mientras cambias de pestaña.',
  inactive: 'Otra experiencia está activa. Reanuda para volver a este juego.',
  focus: 'La partida se ha pausado al salir del juego.',
};
