'use client';

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useEffect, useRef, type ReactNode, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  accent?: 'purple' | 'blue' | 'orange' | 'green' | 'yellow';
  target?: string;
  rel?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  'aria-label'?: string;
};

export default function MagneticButton({
  children,
  href,
  onClick,
  className,
  variant = 'primary',
  target,
  rel,
  type,
  disabled,
  'aria-label': ariaLabel,
}: Props) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const pointerAllowed = useRef(false);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });
  const transform = useMotionTemplate`translate3d(${sx}px, ${sy}px, 0)`;

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const sync = () => {
      pointerAllowed.current = media.matches && !reduced && !disabled;
      if (!pointerAllowed.current) {
        x.jump(0);
        y.jump(0);
        sx.jump(0);
        sy.jump(0);
      }
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [disabled, reduced, sx, sy, x, y]);

  const handleMove = (e: MouseEvent) => {
    if (!ref.current || !pointerAllowed.current || ref.current.matches(':focus-visible')) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.15;
    const dy = (e.clientY - cy) * 0.15;
    x.set(Math.max(-6, Math.min(6, dx)));
    y.set(Math.max(-6, Math.min(6, dy)));
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const base = 'group relative inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold tracking-wide transition-[transform,background-color,border-color,color] duration-150 ease-[var(--ease-out)] active:scale-[0.97] motion-reduce:active:scale-100 focus-visible:active:scale-100 disabled:opacity-50 disabled:active:scale-100';
  const styles = {
    primary: cn(base, 'border border-transparent'),
    secondary: cn(base, 'border text-white glass'),
    ghost: cn(base, 'text-white/70 hover:text-white'),
  }[variant];

  const innerStyle: React.CSSProperties =
    variant === 'primary'
      ? {
          background: 'var(--signal, #ff9955)',
          color: 'var(--ink, #030914)',
          boxShadow: '0 6px 28px color-mix(in srgb, var(--signal, #ff9955) 15%, transparent)',
        }
      : {};

  const inner = (
    <motion.span
      style={{ transform: reduced ? 'none' : transform }}
      className="relative inline-flex h-full w-full items-center justify-center gap-2"
    >
      {children}
    </motion.span>
  );

  const props = {
    onMouseMove: handleMove,
    onMouseLeave: reset,
    onFocus: () => {
      x.jump(0);
      y.jump(0);
      sx.jump(0);
      sy.jump(0);
    },
    className: cn(styles, className),
    style: innerStyle,
    'aria-label': ariaLabel,
  };

  if (href) {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        {...props}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type || 'button'}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {inner}
    </motion.button>
  );
}
