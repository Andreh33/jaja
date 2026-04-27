import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export default function GradientText({
  children,
  className,
  as: Tag = 'span',
}: {
  children: ReactNode;
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div';
}) {
  return (
    <Tag className={cn('text-gradient', className)}>
      {children}
    </Tag>
  );
}
