import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export type Crumb = { name: string; path: string };

/**
 * Migas de pan visibles. Debe usarse junto a `breadcrumbJsonLd` con los
 * mismos items para que el marcado y lo visible coincidan.
 */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length < 2) return null;
  return (
    <nav aria-label="Migas de pan" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/50">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={11} aria-hidden className="text-white/30" />}
              {last ? (
                <span aria-current="page" className="max-w-[16rem] truncate text-white/75">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="transition-colors hover:text-white">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
