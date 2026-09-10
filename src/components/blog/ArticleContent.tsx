import { renderArticle } from '@/lib/markdown';
import styles from './article.module.css';
export default function ArticleContent({ content }: { content: string }) {
  const { html, headings } = renderArticle(content);
  return <div className="mx-auto grid max-w-6xl items-start gap-8 px-6 lg:grid-cols-[220px_minmax(0,760px)] lg:gap-12">{headings.length > 0 ? <nav aria-label="En este artículo" className={`${styles.toc} lg:sticky lg:top-32`}><details open><summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-purple-200">En este artículo</summary><ol className="mt-3 max-h-[50vh] overflow-y-auto pr-3">{headings.map(heading => <li key={heading.id} className={heading.level === 3 ? 'pl-3' : undefined}><a href={`#${heading.id}`}>{heading.text}</a></li>)}</ol></details></nav> : <div className="hidden lg:block" />}<div className={`${styles.article} min-w-0`} dangerouslySetInnerHTML={{ __html: html }} /></div>;
}
