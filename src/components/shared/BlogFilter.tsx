'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import BlogCard from './BlogCard';
import type { Post } from '../../../drizzle/schema';

const ALL = 'Todos';

export default function BlogFilter({ posts, categories }: { posts: Post[]; categories: string[] }) {
  const cats = [ALL, ...categories];
  const [active, setActive] = useState(ALL);
  const filtered = active === ALL ? posts : posts.filter((p) => p.category === active);

  return (
    <>
      <div className="mb-12 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={cn(
              'relative rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors',
              active === c ? 'text-white' : 'text-white/55 hover:text-white',
            )}
          >
            {active === c && (
              <motion.span
                layoutId="blog-filter"
                className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.4)' }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              />
            )}
            <span className="relative">{c}</span>
          </button>
        ))}
      </div>

      <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <motion.div key={p.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <BlogCard post={p} />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
