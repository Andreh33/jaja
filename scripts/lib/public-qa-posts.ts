// Only bundled public editorial content, never customers or production DB.
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import type { QaPublicPost } from './qa-database-initializer';
import { posts as batch1 } from '../posts-data/seo-batch-1';
import { posts as batch2 } from '../posts-data/seo-batch-2';
import { posts as batch3 } from '../posts-data/seo-batch-3';
import { posts as batch4 } from '../posts-data/seo-batch-4';
import { posts as batch5 } from '../posts-data/seo-batch-5';
import { posts as batch6 } from '../posts-data/seo-batch-6';
import { posts as batch7 } from '../posts-data/seo-batch-7';
import { posts as batch8 } from '../posts-data/seo-batch-8';
import { posts as batch9 } from '../posts-data/seo-batch-9';

const LEGACY_ARRAYS = ['seededPosts', 'extraPosts'] as const;
const STRING_FIELDS = new Set(['slug', 'title', 'content', 'excerpt', 'cover', 'category', 'author']);

/** Read literals only. Never import, evaluate or execute the legacy seed script. */
export function extractLegacyPublicPosts(sourceText: string): QaPublicPost[] {
  const source = ts.createSourceFile('legacy-public-posts.ts', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const arrays = new Map<string, ts.ArrayLiteralExpression>();
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && (LEGACY_ARRAYS as readonly string[]).includes(node.name.text)) {
      if (arrays.has(node.name.text) || !node.initializer || !ts.isArrayLiteralExpression(node.initializer)) {
        throw new Error('Legacy public posts must have exactly one literal array per approved name.');
      }
      arrays.set(node.name.text, node.initializer);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  if (arrays.size !== LEGACY_ARRAYS.length) throw new Error('Both approved legacy public-post arrays are required.');
  return LEGACY_ARRAYS.flatMap(name => arrays.get(name)!.elements.map(element => {
    if (!ts.isObjectLiteralExpression(element)) throw new Error('Legacy public posts must be literal objects.');
    const post: Record<string, string | number> = {};
    for (const property of element.properties) {
      if (!ts.isPropertyAssignment(property) || (!ts.isIdentifier(property.name) && !ts.isStringLiteral(property.name))) {
        throw new Error('Legacy public posts must use explicit, non-computed properties.');
      }
      const key = property.name.text;
      // In particular, skip publishedAt: new Date(...), flags, IDs and credentials.
      // Their expressions are never evaluated or copied into the QA dataset.
      if (!STRING_FIELDS.has(key) && key !== 'readingMinutes') continue;
      if (key in post) throw new Error('Duplicate public editorial field.');
      const value = property.initializer;
      if (key === 'readingMinutes' && ts.isNumericLiteral(value)) {
        const number = Number(value.text);
        if (!Number.isInteger(number) || number < 1 || number > 120) throw new Error('Invalid public reading time.');
        post[key] = number;
      } else if (STRING_FIELDS.has(key) && (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value))) {
        post[key] = value.text;
      } else {
        throw new Error('Public editorial fields must be string or numeric literals; expressions are not allowed.');
      }
    }
    if (!post.slug || !post.title || !post.content) throw new Error('Legacy public post is missing required editorial fields.');
    return post as QaPublicPost;
  }));
}

const legacyPosts = extractLegacyPublicPosts(readFileSync(new URL('../seed.ts', import.meta.url), 'utf8'));
export const publicQaPosts: QaPublicPost[] = [...legacyPosts, ...batch1, ...batch2, ...batch3, ...batch4, ...batch5, ...batch6, ...batch7, ...batch8, ...batch9];
if (new Set(publicQaPosts.map(post => post.slug)).size !== publicQaPosts.length) throw new Error('QA public-post slugs must be unique.');
