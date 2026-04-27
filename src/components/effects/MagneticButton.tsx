'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef, type ReactNode, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  accent?: 'purple' | 'blue' | 'orange' | 'green';
  target?: string;
  rel?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
};

export default function MagneticButton({
  children,
  href,
  onClick,
  className,
  variant = 'primary',
  accent = 'purple',
  target,
  rel,
  type,
  disabled,
}: Props) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });

  const handleMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.25;
    const dy = (e.clientY - cy) * 0.25;
    x.set(Math.max(-12, Math.min(12, dx)));
    y.set(Math.max(-12, Math.min(12, dy)));
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const accentClass = {
    purple: 'glow-purple',
    blue: 'glow-blue',
    orange: 'glow-orange',
    green: 'glow-green',
  }[accent];

  const base = 'group relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 active:scale-[0.97]';
  const styles = {
    primary: cn(base, 'text-white', accentClass),
    secondary: cn(base, 'border text-white glass'),
    ghost: cn(base, 'text-white/70 hover:text-white'),
  }[variant];

  const innerStyle: React.CSSProperties =
    variant === 'primary'
      ? { background: 'var(--grad-signature)', backgroundSize: '200% 200%' }
      : {};

  const inner = (
    <motion.span
      style={{ x: sx, y: sy }}
      className="relative inline-flex h-full w-full items-center justify-center gap-2"
    >
      {children}
    </motion.span>
  );

  const props = {
    onMouseMove: handleMove,
    onMouseLeave: reset,
    className: cn(styles, className),
    style: innerStyle,
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
