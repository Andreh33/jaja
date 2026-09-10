import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import {
  ARTICLE_DECISIONS, applyArticleDecision, BRIEFING_KEY, BRIEFING_VERSION,
  briefingText, briefingWhatsApp, buildBriefing, chooseProject, clearBriefing,
  EMPTY_BRIEFING, FEATURES, getArticleDecision, readBriefing, sanitizeBriefing, saveBriefing,
} from '../src/lib/briefing';

function memoryStorage(initial?: string) {
  const values = new Map(initial === undefined ? [] : [[BRIEFING_KEY, initial]]);
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
}

describe('briefing decisions and report', () => {
  it('builds useful pending decisions with no fake budget or deadline', () => {
    const report = buildBriefing(EMPTY_BRIEFING);
    assert.equal(report.complete, false); assert.equal(report.answered, 0);
    assert.equal(report.sections.length, 6);
    const text = briefingText(EMPTY_BRIEFING);
    assert.match(text, /presupuesto pendientes de confirmar/);
    assert.doesNotMatch(text, /\d+\s*€|24.?48|enviado|contratado/i);
  });
  it('only reports features and materials relevant to the selected project', () => {
    const state = sanitizeBriefing({ project: 'shop', features: FEATURES.map(f => f.value), objective: 'Vender productos', audience: 'Personas que buscan una talla', materials: { texts: 'ready', photos: 'ready', catalog: 'pending' }, owner: 'undecided', launch: 'urgent' });
    const report = buildBriefing(state);
    assert.equal(report.complete, true);
    assert.equal(report.answered, report.total);
    assert.equal(report.warnings.length, 2);
    assert.ok(!briefingText(state).includes('Responder preguntas frecuentes'));
    const next = chooseProject(state, 'automation');
    assert.deepEqual(next.features, ['languages', 'answers', 'handoff']);
    assert.equal(next.objective, state.objective);
    assert.ok(!briefingText(next).includes('Catálogo, precios y variantes:'));
  });
  it('does not imply an automation can safely run without defining human handoff', () => {
    assert.match(buildBriefing({ project: 'automation', features: ['answers'] }).warnings[0], /quién lo recibe/);
    assert.equal(buildBriefing({ project: 'automation', features: ['answers', 'handoff'] }).warnings.length, 0);
  });
  it('has exactly six real article entry points and applies them only when requested', () => {
    const sources = readdirSync('scripts/posts-data').filter(file => file.endsWith('.ts')).map(file => readFileSync(`scripts/posts-data/${file}`, 'utf8')).join('\n');
    assert.equal(Object.keys(ARTICLE_DECISIONS).length, 6);
    for (const [slug, decision] of Object.entries(ARTICLE_DECISIONS)) {
      assert.ok(sources.includes(`slug: '${slug}'`), `${slug} is an existing article`);
      assert.equal(getArticleDecision(decision.id), decision);
      const before = sanitizeBriefing({ objective: 'Mi objetivo', notes: 'Mi contexto' });
      const after = applyArticleDecision(before, decision);
      assert.equal(before.project, ''); assert.equal(after.project, decision.project);
      assert.equal(after.objective, 'Mi objetivo'); assert.equal(after.notes, 'Mi contexto');
      assert.deepEqual(applyArticleDecision(after, decision), after, 'repeated incorporation is idempotent');
    }
    assert.equal(getArticleDecision('__proto__'), undefined);
    assert.equal(getArticleDecision(['crm']), undefined);
  });
  it('round-trips the complete, bounded WhatsApp message without sending or quoting prices', () => {
    const state = { project: 'web', objective: 'Reservas & dudas + idiomas', audience: 'Público local', features: ['reservations', 'languages'], integrations: ['calendar'], notes: 'Importante: <revisar> enlaces\ny fotografías.' };
    const url = new URL(briefingWhatsApp(state));
    assert.equal(url.origin, 'https://wa.me'); assert.equal(url.pathname, '/34684739091');
    assert.equal(url.searchParams.get('text'), `Hola, quiero revisar este proyecto con Latech.\n\n${briefingText(state)}`);
    assert.match(url.searchParams.get('text')!, /Reservas & dudas \+ idiomas/);
    assert.match(url.searchParams.get('text')!, /compatibilidad y costes/);
    assert.ok(briefingText({ ...state, objective: 'x'.repeat(10000), notes: 'y'.repeat(10000) }).length < 6000);
  });
});

describe('voluntary defensive briefing storage', () => {
  it('whitelists and bounds data before persistence, never trusting extra fields', () => {
    const state = sanitizeBriefing({ project: 'wrong', objective: 'a'.repeat(500), notes: '\u0000b'.repeat(2000), features: ['catalog', 'catalog', 'unknown', false], integrations: ['crm', 'crm', 'secret'], owner: true, materials: { catalog: 'ready', texts: 'unknown' }, password: 'never-store-this' });
    assert.equal(state.project, ''); assert.equal(state.objective.length, 240); assert.equal(state.notes.length, 600);
    assert.equal(state.owner, ''); assert.deepEqual(state.features, ['catalog']); assert.deepEqual(state.integrations, ['crm']);
    const storage = memoryStorage(); assert.equal(storage.getItem(BRIEFING_KEY), null);
    assert.equal(saveBriefing(storage, { ...state, password: 'never-store-this' }), true);
    assert.doesNotMatch(storage.getItem(BRIEFING_KEY)!, /password|never-store-this/);
    assert.deepEqual(readBriefing(storage), state);
    assert.equal(clearBriefing(storage), true); assert.equal(readBriefing(storage), null);
  });
  it('tolerates corrupt, incompatible, overlong and blocked storage', () => {
    for (const value of ['not-json', 'null', JSON.stringify({ version: 999, state: EMPTY_BRIEFING }), 'x'.repeat(12001)]) assert.equal(readBriefing(memoryStorage(value)), null);
    assert.deepEqual(readBriefing(memoryStorage(JSON.stringify({ version: BRIEFING_VERSION, state: null }))), EMPTY_BRIEFING);
    const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
    assert.equal(readBriefing(blocked), null); assert.equal(saveBriefing(blocked, EMPTY_BRIEFING), false); assert.equal(clearBriefing(blocked), false);
  });
  it('keeps private answers out of analytics and does not submit anything in the background', () => {
    const client = readFileSync('src/app/briefing/BriefingClient.tsx', 'utf8');
    assert.doesNotMatch(client, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|\/api\//);
    const events = [...client.matchAll(/track\('[^']+',\s*\{([^}]*)\}/g)].map(match => match[1].trim());
    assert.ok(events.length >= 4);
    for (const payload of events) assert.ok(['project: state.project', 'decision: decision.id'].includes(payload), payload);
    assert.match(client, /useState\(false\)/);
    assert.match(readFileSync('src/app/briefing/briefing.module.css', 'utf8'), /@media print/);
  });
});
