/** Editorial routes are selected from the current locale's authored articles only. */
const guidePriorities: Record<string, readonly string[]> = {
  home: ['seo-audit', 'seo-titles-clicks', 'conversion-landing'],
  web: ['seo-audit', 'search-intent', 'technical-indexing'],
  shop: ['online-store', 'image-seo', 'conversion-landing'],
  ai: ['whatsapp-conversion', 'website-budget', 'website-leads'],
  'website-leads': ['conversion-landing', 'service-pages', 'search-console-leads'],
  'website-budget': ['seo-audit', 'service-pages', 'online-store'],
  'local-seo': ['service-pages', 'search-intent', 'search-console-leads'],
  'international-seo': ['technical-indexing', 'search-intent', 'content-clusters'],
  'market-entry-seo': ['international-seo', 'search-intent', 'service-pages'],
  'mobile-performance': ['image-seo', 'technical-indexing', 'conversion-landing'],
  'online-store': ['image-seo', 'conversion-landing', 'technical-indexing'],
  'whatsapp-conversion': ['conversion-landing', 'website-leads', 'search-console-leads'],
  'website-migration': ['technical-indexing', 'seo-audit', 'seo-content-maintenance'],
  'ai-automation': ['whatsapp-conversion', 'service-pages', 'website-leads'],
  'seo-audit': ['technical-indexing', 'search-console-leads', 'seo-content-maintenance'],
  'search-intent': ['service-pages', 'seo-titles-clicks', 'content-clusters'],
  'service-pages': ['search-intent', 'conversion-landing', 'local-seo'],
  'seo-titles-clicks': ['search-console-leads', 'search-intent', 'conversion-landing'],
  'search-console-leads': ['seo-audit', 'conversion-landing', 'seo-titles-clicks'],
  'technical-indexing': ['website-migration', 'mobile-performance', 'seo-audit'],
  'content-clusters': ['search-intent', 'seo-content-maintenance', 'service-pages'],
  'image-seo': ['mobile-performance', 'online-store', 'technical-indexing'],
  'conversion-landing': ['website-leads', 'whatsapp-conversion', 'search-console-leads'],
  'seo-content-maintenance': ['seo-audit', 'content-clusters', 'seo-titles-clicks'],
};

export function selectGuides<T extends { id: string }>(articles: readonly T[], context: string, excludedId?: string, limit = 3): T[] {
  const byId = new Map(articles.map(article => [article.id, article]));
  const ids = [...new Set([...(guidePriorities[context] ?? guidePriorities.home), ...articles.map(article => article.id)])];
  return ids.filter(id => id !== excludedId && id !== 'ai-automation' && byId.has(id)).slice(0, limit).map(id => byId.get(id)!);
}
