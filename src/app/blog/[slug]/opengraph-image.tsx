import { renderBrandOG, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
import { getPostBySlug } from '@/lib/posts';

export const alt = 'Artículo del blog de Latech';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return renderBrandOG({
    kicker: 'Blog · Latech',
    title: post?.title ?? 'Latech',
  });
}
