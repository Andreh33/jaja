'use client';

import { useEffect, useState } from 'react';
import { defaultStudio, parseStudioHash, type StudioPage } from './studio-model';

export function useStudioExperience() {
  const [page, setPage] = useState<StudioPage>('home');
  const [history, setHistory] = useState<StudioPage[]>([]);
  const [settings, setSettings] = useState(defaultStudio);
  const [project, setProject] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    function restore() {
      const saved = parseStudioHash(window.location.hash);
      if (saved) { setSettings(saved); setPage('create'); setExpanded(true); }
    }
    restore();
    window.addEventListener('hashchange', restore);
    return () => window.removeEventListener('hashchange', restore);
  }, []);

  function navigate(next: StudioPage) {
    if (next === page) return;
    setHistory(previous => [...previous.slice(-19), page]);
    setPage(next);
  }
  function back() {
    const previous = history.at(-1);
    if (!previous) return;
    setHistory(history.slice(0, -1)); setPage(previous);
  }
  return { page, navigate, back, history, settings, setSettings, project, setProject, expanded, setExpanded };
}
export type StudioExperience = ReturnType<typeof useStudioExperience>;
