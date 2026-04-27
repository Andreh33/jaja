'use client';

import NumberFlowCore from '@number-flow/react';
import { useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function NumberFlow({
  value,
  suffix,
  prefix,
  duration = 1.4,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (inView) setN(value);
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <NumberFlowCore value={n} transformTiming={{ duration: duration * 1000, easing: 'cubic-bezier(0.16,1,0.3,1)' }} />
      {suffix}
    </span>
  );
}
