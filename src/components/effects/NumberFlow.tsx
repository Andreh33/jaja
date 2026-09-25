'use client';

import NumberFlowCore from '@number-flow/react';

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
  return (
    <span className={className}>
      {prefix}
      <NumberFlowCore value={value} transformTiming={{ duration: duration * 1000, easing: 'cubic-bezier(0.16,1,0.3,1)' }} />
      {suffix}
    </span>
  );
}
