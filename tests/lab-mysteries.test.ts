import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { MYSTERIES, getMystery, searchDemoProducts, parseMysteryProgress, DEMO_BASKET } from '../src/lib/lab-mysteries';

describe('business mystery scenarios', () => {
  it('reproduces the search problem and corrects case, accents and spaces', () => {
    assert.deepEqual(searchDemoProducts('cafe', false), []);
    for (const query of ['cafe', 'CAFÉ', ' café ', 'CAFE']) assert.deepEqual(searchDemoProducts(query, true), ['Café de especialidad']);
    assert.deepEqual(searchDemoProducts('producto inexistente', true), []);
  });
  it('keeps the basket total consistent with the disclosed fee', () => {
    assert.equal(DEMO_BASKET.total, DEMO_BASKET.products + DEMO_BASKET.shipping);
  });
  it('stores only known episode IDs and tolerates blocked or damaged state', () => {
    assert.deepEqual(parseMysteryProgress(null), []);
    assert.deepEqual(parseMysteryProgress('x'.repeat(2001)), []);
    assert.deepEqual(parseMysteryProgress('{invalid'), []);
    assert.deepEqual(parseMysteryProgress('{"name":"private"}'), []);
    assert.deepEqual(parseMysteryProgress('["unknown", "la-reserva-imposible", "la-reserva-imposible"]'), ['la-reserva-imposible']);
  });
  it('has three distinct complete lessons with a reachable correct choice', () => {
    assert.equal(new Set(MYSTERIES.map((episode) => episode.slug)).size, 3);
    const articles = readdirSync('scripts/posts-data').filter(file => file.endsWith('.ts')).map(file => readFileSync(`scripts/posts-data/${file}`, 'utf8')).join('\n');
    for (const episode of MYSTERIES) {
      assert.ok(episode.choices.some((choice) => choice.id === episode.correctChoice));
      assert.equal(getMystery(episode.slug), episode);
      assert.equal(episode.checklist.length, 3);
      assert.ok(episode.article.startsWith('/blog/'));
      assert.ok(articles.includes(`slug: '${episode.article.slice('/blog/'.length)}'`), 'related article exists');
      assert.ok(readFileSync(`src/app${episode.service}/page.tsx`, 'utf8').length > 0, 'related service exists');
    }
    assert.equal(getMystery('../admin'), undefined);
  });
});
