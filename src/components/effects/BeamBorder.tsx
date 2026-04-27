import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export default function BeamBorder({
  children,
  className,
  rounded = 'rounded-3xl',
}: {
  children: ReactNode;
  className?: string;
  rounded?: string;
}) {
  return (
    <div className={cn('beam-border', rounded, className)}>
      {children}
    </div>
  );
}
