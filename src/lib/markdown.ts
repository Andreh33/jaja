import MarkdownIt from 'markdown-it';
import { isSafeContentUrl } from './content-url';

export type ArticleHeading = { id: string; text: string; level: number };
type ArticleEnvironment = { headings?: ArticleHeading[] };

const parser = new MarkdownIt({ html: false, linkify: false, typographer: false });
const validateDefault = parser.validateLink.bind(parser);
parser.validateLink = url => validateDefault(url) && isSafeContentUrl(url);

// Assign IDs using the parsed block tree: fenced code cannot accidentally create headings.
parser.core.ruler.after('inline', 'latech_headings', state => {
  const headings: ArticleHeading[] = []; const used = new Set<string>();
  for (let index = 0; index < state.tokens.length; index++) {
    const token = state.tokens[index];
    if (token.type !== 'heading_open') continue;
    // The page owns the H1. Markdown content starts at H2.
    if (token.tag === 'h1') { token.tag = 'h2'; if (state.tokens[index + 2]?.type === 'heading_close') state.tokens[index + 2].tag = 'h2'; }
    const inline = state.tokens[index + 1];
    const text = (inline?.children || []).map(child => child.type === 'softbreak' || child.type === 'hardbreak' ? ' ' : child.content).join('').trim();
    const base = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'seccion';
    let id = base; let suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id); token.attrSet('id', id);
    const level = Number(token.tag.slice(1));
    if (level <= 3) headings.push({ id, text, level });
  }
  (state.env as ArticleEnvironment).headings = headings;
});
const renderImage = parser.renderer.rules.image!;
parser.renderer.rules.image = (tokens, index, options, env, renderer) => {
  const token = tokens[index];
  if (!isSafeContentUrl(String(token.attrGet('src') || ''), true)) return parser.utils.escapeHtml(token.content);
  token.attrSet('loading', 'lazy'); token.attrSet('decoding', 'async'); token.attrSet('referrerpolicy', 'no-referrer');
  return renderImage(tokens, index, options, env, renderer);
};
const renderLink = parser.renderer.rules.link_open;
parser.renderer.rules.link_open = (tokens, index, options, env, renderer) => {
  const token = tokens[index];
  if (/^https?:\/\//.test(String(token.attrGet('href') || ''))) token.attrSet('rel', 'noopener noreferrer');
  return renderLink ? renderLink(tokens, index, options, env, renderer) : renderer.renderToken(tokens, index, options);
};
parser.renderer.rules.table_open = () => '<div class="table-wrap" role="region" aria-label="Tabla de datos" tabindex="0"><table>\n';
parser.renderer.rules.table_close = () => '</table></div>\n';

export function renderArticle(markdown: string): { html: string; headings: ArticleHeading[] } {
  const env: ArticleEnvironment = {};
  const html = parser.render(markdown, env);
  return { html, headings: env.headings || [] };
}
export function renderMarkdown(markdown: string): string { return renderArticle(markdown).html; }
export function extractHeadings(markdown: string): ArticleHeading[] {
  const env: ArticleEnvironment = {}; parser.parse(markdown, env); return env.headings || [];
}
