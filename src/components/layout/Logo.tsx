import { cn } from '@/lib/utils';

export default function Logo({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }[size];
  return (
    <span className={cn('font-display inline-flex items-center gap-1', sizes, className)} style={{ letterSpacing: '-0.04em' }}>
      <span>LATECH</span>
      <span
        aria-hidden
        className="inline-block h-2 w-2 translate-y-[2px] rounded-full"
        style={{ background: 'var(--grad-signature)' }}
      />
    </span>
  );
}
