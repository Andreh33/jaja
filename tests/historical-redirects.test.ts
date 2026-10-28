import assert from 'node:assert/strict';
import test from 'node:test';
import config from '../next.config';

test('the old restaurant design URL preserves its topic with a permanent redirect', async () => {
  const redirects = await config.redirects!();
  const rule = redirects.find((r) => r.source === '/diseno-web-restaurantes');
  assert.ok(rule);
  assert.equal(rule.destination, '/blog/pagina-web-restaurantes');
  assert.equal(rule.permanent, true);
});
