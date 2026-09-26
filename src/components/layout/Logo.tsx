import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function Logo({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }[size];
  return (
    <span className={cn('font-display inline-flex items-center gap-3', sizes, className)} style={{ letterSpacing: '-0.04em' }}>
      <Image src="/brand/latech-logo.webp" alt="" width={64} height={33} className="h-auto w-14 shrink-0" />
      <span>LATECH</span>
      <span
        aria-hidden
        className="inline-block h-2 w-2 translate-y-[2px] rounded-full"
        style={{ background: 'var(--grad-signature)' }}
      />
    </span>
  );
}
