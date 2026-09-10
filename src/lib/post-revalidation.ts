type Revalidate = (path: string, type?: 'page' | 'layout') => void;

export function invalidatePostCache(revalidate: Revalidate, ...slugs: (string | undefined)[]) {
  revalidate('/blog');
  // Related cards occur in every article. Unpublishing must remove them too.
  revalidate('/blog/[slug]', 'page');
  revalidate('/blog/categoria/[categoria]', 'page');
  revalidate('/sitemap.xml');
  for (const slug of new Set(slugs.filter((value): value is string => Boolean(value)))) {
    const path = '/blog/' + encodeURIComponent(slug);
    revalidate(path);
    revalidate(path + '/opengraph-image');
  }
}
