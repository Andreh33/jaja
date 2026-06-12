import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { posts } from '../drizzle/schema';
import { posts as batch1 } from './posts-data/seo-batch-1';
import { posts as batch2 } from './posts-data/seo-batch-2';
import { posts as batch3 } from './posts-data/seo-batch-3';
import { posts as batch4 } from './posts-data/seo-batch-4';
import { posts as batch5 } from './posts-data/seo-batch-5';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const db = drizzle(client);

const ALL = [...batch1, ...batch2, ...batch3, ...batch4, ...batch5];

async function main() {
  console.log(`🌱 Sembrando ${ALL.length} posts SEO...`);

  // Fechas escalonadas: el más antiguo hace ~180 días, el más reciente hace ~2 días,
  // para que el blog no muestre 40 posts publicados el mismo día.
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const span = 178; // días entre el primero y el último
  const step = span / Math.max(1, ALL.length - 1);

  let inserted = 0;
  let updated = 0;

  for (let i = 0; i < ALL.length; i++) {
    const p = ALL[i];
    const publishedAt = new Date(now - (2 + (ALL.length - 1 - i) * step) * DAY);
    const existing = await db.select().from(posts).where(eq(posts.slug, p.slug)).limit(1);
    if (existing.length === 0) {
      await db.insert(posts).values({
        slug: p.slug,
        title: p.title,
        category: p.category,
        excerpt: p.excerpt,
        cover: p.cover,
        readingMinutes: p.readingMinutes,
        content: p.content,
        published: true,
        publishedAt,
      });
      inserted++;
      console.log(`✅ ${p.slug}`);
    } else {
      await db
        .update(posts)
        .set({
          title: p.title,
          category: p.category,
          excerpt: p.excerpt,
          cover: p.cover,
          readingMinutes: p.readingMinutes,
          content: p.content,
        })
        .where(eq(posts.slug, p.slug));
      updated++;
      console.log(`♻️  ${p.slug}`);
    }
  }

  console.log(`\n🎉 Hecho: ${inserted} insertados, ${updated} actualizados.`);
  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
