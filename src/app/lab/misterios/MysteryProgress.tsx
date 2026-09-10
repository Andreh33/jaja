'use client';

import { useSyncExternalStore } from 'react';
import { Check } from 'lucide-react';
import { MYSTERY_PROGRESS_EVENT, MYSTERY_PROGRESS_KEY, parseMysteryProgress, type MysteryId } from '@/lib/lab-mysteries';

function subscribe(notify: () => void) {
  const storageChanged = (event: StorageEvent) => { if (event.key === MYSTERY_PROGRESS_KEY || event.key === null) notify(); };
  window.addEventListener('storage', storageChanged);
  window.addEventListener(MYSTERY_PROGRESS_EVENT, notify);
  return () => { window.removeEventListener('storage', storageChanged); window.removeEventListener(MYSTERY_PROGRESS_EVENT, notify); };
}
function snapshot() {
  try { return window.localStorage.getItem(MYSTERY_PROGRESS_KEY); } catch { return null; }
}
const serverSnapshot = () => null;

/** A saved completion is visible when returning; the episode stays replayable. */
export default function MysteryProgress({ slug }: { slug: MysteryId }) {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  if (!parseMysteryProgress(raw).includes(slug)) return null;
  return <span className="mt-4 mb-2 inline-flex items-center gap-2 text-xs leading-relaxed text-emerald-200" role="status"><Check size={14} aria-hidden />Ya resuelto en este navegador · puedes repetirlo</span>;
}
