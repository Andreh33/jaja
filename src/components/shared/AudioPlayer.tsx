'use client';

import { Play, Pause } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const fmt = (s: number) => {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export default function AudioPlayer({ src, accent = 'var(--accent-ia)' }: { src: string; accent?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setTime(a.currentTime);
    const onMeta = () => setDur(a.duration);
    const onEnd = () => setPlaying(false);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnd);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('ended', onEnd);
    };
  }, []);

  const ensureCtx = () => {
    if (typeof window === 'undefined') return;
    if (ctxRef.current || !audioRef.current) return;
    const W = window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };
    const Ctx = window.AudioContext || W.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const src = ctx.createMediaElementSource(audioRef.current);
    const an = ctx.createAnalyser();
    an.fftSize = 256;
    src.connect(an);
    an.connect(ctx.destination);
    ctxRef.current = ctx;
    sourceRef.current = src;
    analyserRef.current = an;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const an = analyserRef.current;
    if (!canvas || !an) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth * dpr;
    const h = canvas.clientHeight * dpr;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const buf = new Uint8Array(an.frequencyBinCount);
    an.getByteFrequencyData(buf);
    ctx.clearRect(0, 0, w, h);
    const bars = 64;
    const step = Math.floor(buf.length / bars);
    const barW = w / bars;
    for (let i = 0; i < bars; i++) {
      const v = buf[i * step] / 255;
      const bh = Math.max(2 * dpr, v * h);
      const x = i * barW;
      const grad = ctx.createLinearGradient(0, h, 0, h - bh);
      grad.addColorStop(0, accent);
      grad.addColorStop(1, '#8B5CF6');
      ctx.fillStyle = grad;
      ctx.fillRect(x + barW * 0.15, h - bh, barW * 0.7, bh);
    }
    rafRef.current = requestAnimationFrame(draw);
  };

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    ensureCtx();
    if (ctxRef.current?.state === 'suspended') await ctxRef.current.resume();
    if (a.paused) {
      await a.play();
      setPlaying(true);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(draw);
    } else {
      a.pause();
      setPlaying(false);
      cancelAnimationFrame(rafRef.current);
    }
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    a.currentTime = Math.max(0, Math.min(dur, ratio * dur));
  };

  return (
    <div className="flex flex-col gap-4">
      <audio ref={audioRef} src={src} preload="metadata" crossOrigin="anonymous" />
      <div className="relative h-32 w-full overflow-hidden rounded-2xl" style={{ background: 'rgba(7,5,14,0.6)', border: `1px solid ${accent}30` }}>
        <canvas ref={canvasRef} className="h-full w-full" />
        {!playing && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-mono text-white/40">
            Pulsa play para escuchar
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
          className="group inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-black transition-transform active:scale-95"
          style={{ background: accent, boxShadow: `0 0 30px ${accent}60` }}
        >
          {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
        <div className="flex-1">
          <div
            onClick={seek}
            className="relative h-2 cursor-pointer overflow-hidden rounded-full bg-white/10"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${dur ? (time / dur) * 100 : 0}%`, background: accent, boxShadow: `0 0 10px ${accent}` }}
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-xs text-white/50">
            <span>{fmt(time)}</span>
            <span>{fmt(dur)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
