'use client';

import NumberFlowCore from '@number-flow/react';

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
  return (
    <span className={className}>
      {prefix}
      <NumberFlowCore value={value} respectMotionPreference={false} transformTiming={{ duration: duration * 1000, easing: 'cubic-bezier(0.23,1,0.32,1)' }} />
      {suffix}
    </span>
  );
}
