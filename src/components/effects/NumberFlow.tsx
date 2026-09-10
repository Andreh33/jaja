'use client';

import NumberFlowCore from '@number-flow/react';
import { useReducedMotion } from 'framer-motion';

export default function NumberFlow({
  value,
  suffix,
  prefix,
  duration = 0.25,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <span className={className}>
      {prefix}
      <NumberFlowCore value={value} animated={!reduce} transformTiming={{ duration: duration * 1000, easing: 'cubic-bezier(0.23,1,0.32,1)' }} />
      {suffix}
    </span>
  );
}
