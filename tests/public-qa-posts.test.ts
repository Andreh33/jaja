import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { extractLegacyPublicPosts, publicQaPosts } from '../scripts/lib/public-qa-posts';

test('all 76 audited public URLs are present without importing the legacy seed executable', () => {
  const map = readFileSync(new URL('../docs/editorial/mapa-urls.csv', import.meta.url), 'utf8');
  const existing = map.split(/\r?\n/).filter(line => /^(?:A\d\d)?,https:\/\/serviciosonlineweb\.com\/blog\//.test(line))
    .map(line => line.match(/^.*?,https:\/\/serviciosonlineweb\.com\/blog\/([^,]+)/)![1]);
  assert.equal(existing.length, 76);
  assert.equal(publicQaPosts.length, 76);
  assert.deepEqual(publicQaPosts.map(post => post.slug).sort(), existing.sort());
  for (const post of publicQaPosts) {
    assert.ok(post.slug && post.title && post.content);
    assert.ok(Object.keys(post).every(key => ['slug', 'title', 'content', 'excerpt', 'cover', 'category', 'author', 'readingMinutes'].includes(key)));
  }
});

test('AST extraction ignores executable code, dates and fields outside the public whitelist', () => {
  const source = "throw new Error('THIS MUST NEVER EXECUTE'); const seededPosts = [{slug:'one',title:'One',content:`Literal \\n body`,readingMinutes:4,publishedAt:new Date(runSideEffect()),password:readSecret()}]; const extraPosts=[{slug:'two',title:'Two',content:'Body'}]; runDatabaseMutation();";
  assert.deepEqual(extractLegacyPublicPosts(source), [
    { slug: 'one', title: 'One', content: 'Literal \n body', readingMinutes: 4 },
    { slug: 'two', title: 'Two', content: 'Body' },
  ]);
});

test('computed editorial values, interpolated templates, spreads and ambiguous arrays are rejected', () => {
  const valid = "const seededPosts=[{slug:'one',title:'One',content:'Body'}]; const extraPosts=[];";
  for (const source of [
    valid.replace("content:'Body'", 'content:readSecret()'),
    valid.replace("content:'Body'", 'content:`Text ${readSecret()}`'),
    valid.replace("{slug:'one',title:'One',content:'Body'}", '...otherPosts'),
    valid.replace("content:'Body'", "...otherFields,content:'Body'"),
    valid.replace('const extraPosts=[];', 'const extraPosts=loadPosts();'),
    valid + ' function duplicate(){const seededPosts=[];}',
    'const seededPosts=[];',
  ]) assert.throws(() => extractLegacyPublicPosts(source));
});
