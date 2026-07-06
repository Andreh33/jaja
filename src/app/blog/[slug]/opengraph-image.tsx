import { getPostBySlug } from '@/lib/posts';
import { brandedOgImage, OG_SIZE } from '@/lib/og-image';

export const alt = 'Artículo del blog de Latech';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return brandedOgImage({
    title: post?.title ?? 'Blog de Latech',
    subtitle: post?.excerpt ? post.excerpt.slice(0, 140) : undefined,
    badge: post?.category ?? 'Blog',
  });
}
