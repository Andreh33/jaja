'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState, type CSSProperties } from 'react';
const ArcadeCabinet = dynamic(() => import('./ArcadeCabinet'), { ssr: false });
export default function ArcadePortal({ onActiveChange }: { onActiveChange: (active: boolean) => void }) {
  const [open, setOpen] = useState(false); const [origin, setOrigin] = useState<CSSProperties>({});
  useEffect(() => {
    const launch = () => { const corners = [...document.querySelectorAll<HTMLElement>('[data-crt-corner]')];
      if (corners.length) { const bounds = corners.map(item => item.getBoundingClientRect()); const x = bounds.reduce((sum, item) => sum + item.x, 0) / bounds.length; const y = bounds.reduce((sum, item) => sum + item.y, 0) / bounds.length;
        setOrigin({ '--arcade-x': `${x - innerWidth / 2}px`, '--arcade-y': `${y - innerHeight / 2}px` } as CSSProperties); }
      setOpen(true); onActiveChange(true); };
    window.addEventListener('latech:arcade', launch); return () => window.removeEventListener('latech:arcade', launch);
  }, [onActiveChange]);
  return open ? <ArcadeCabinet origin={origin} onClose={() => { setOpen(false); onActiveChange(false); }} /> : null;
}
