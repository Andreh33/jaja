import Link from 'next/link';
import { cn } from '@/lib/utils';
import { categorySlug } from '@/lib/blog-categories';

/**
 * Píldoras de categoría del blog como enlaces REALES (<a>) a los hubs
 * /blog/categoria/[slug]. Sustituye al filtro client-side con <button>:
 * mismas rutas para el usuario y para el crawler, y cada categoría pasa a
 * ser una página indexable que enlaza a sus posts.
 */
export default function BlogCategoryPills({
  categories,
  active,
}: {
  categories: string[];
  active?: string;
}) {
  const pills = [
    { label: 'Todos', href: '/blog', isActive: !active },
    ...categories.map((c) => ({
      label: c,
      href: `/blog/categoria/${categorySlug(c)}`,
      isActive: active === c,
    })),
  ];

  return (
    <div className="mb-12 flex flex-wrap gap-2">
      {pills.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          aria-current={p.isActive ? 'page' : undefined}
          className={cn(
            'rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors',
            p.isActive ? 'text-white' : 'text-white/55 hover:text-white',
          )}
          style={
            p.isActive
              ? { background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.4)' }
              : { border: '1px solid transparent' }
          }
        >
          {p.label}
        </Link>
      ))}
    </div>
  );
}
