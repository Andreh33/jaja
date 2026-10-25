/** Generate the lightweight client registry from the actual published dictionaries. */
import { readFileSync, writeFileSync } from 'node:fs';
import { locales } from '../src/lib/international-routes';
const topics = new Map<string, { id: string; slugs: Record<string, string> }>();
for (const locale of locales) {
  const dictionary = JSON.parse(readFileSync(`src/content/international/${locale}.json`, 'utf8'));
  for (const article of dictionary.articles as { id: string; slug: string }[]) {
    if (!topics.has(article.id)) topics.set(article.id, { id: article.id, slugs: {} });
    topics.get(article.id)!.slugs[locale] = article.slug;
  }
}
writeFileSync('src/content/international-article-routes.json', JSON.stringify([...topics.values()], null, 2) + '\n');
console.log(`Registry generated: ${topics.size} topics across ${locales.length} locales.`);
