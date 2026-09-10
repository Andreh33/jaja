import type { PostSummary } from './posts';

export const BLOG_PAGE_SIZE = 12;
export type BlogSearchParams = Record<string, string | string[] | undefined>;
export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').replace(/\s+/g, ' ').trim();
}
export function readBlogSearch(params: BlogSearchParams): { query: string; page: number } {
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const query = (rawQuery || '').trim().slice(0, 120);
  const page = rawPage && /^[1-9]\d{0,5}$/.test(rawPage) ? Number(rawPage) : 1;
  return { query, page };
}
export function filterBlogPosts(posts: PostSummary[], query: string, category?: string): PostSummary[] {
  const words = normalizeSearch(query).split(' ').filter(Boolean);
  return posts.filter(post => (!category || post.category === category) && words.every(word => normalizeSearch(`${post.title} ${post.excerpt || ''} ${post.category || ''}`).includes(word)));
}
export function paginateBlog(posts: PostSummary[], query: string, page: number, category?: string) {
  const filtered = filterBlogPosts(posts, query, category);
  const pages = Math.max(1, Math.ceil(filtered.length / BLOG_PAGE_SIZE));
  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  return { posts: filtered.slice((safePage - 1) * BLOG_PAGE_SIZE, safePage * BLOG_PAGE_SIZE), total: filtered.length, pages, page: safePage, outOfRange: safePage > pages };
}
export function blogHref(base: string, query = '', page = 1): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (page > 1) params.set('page', String(page));
  return `${base}${params.size ? `?${params}` : ''}`;
}
