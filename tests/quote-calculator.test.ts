import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { QUOTE_CATALOG, QUOTE_WHATSAPP_NUMBER } from '../src/lib/quotes/catalog';
import { INITIAL_STATE, TOTAL_STEPS, STORAGE_KEY, LEGACY_STORAGE_KEY, buildCart, buildWhatsAppMessage, buildWhatsAppUrl, sanitizeState, serializeState, deserializeState, loadFromStorage, saveToStorage, clearStorage, isStepValid, reducer, type QuoteStorage, type WizardState } from '../src/app/tienda/calculadora/_lib/state';

function state(patch: Partial<WizardState> = {}): WizardState { return sanitizeState({ ...INITIAL_STATE, ...patch }); }
class MemoryStorage implements QuoteStorage {
  entries = new Map<string, string>();
  getItem(key: string) { return this.entries.get(key) ?? null; }
  setItem(key: string, value: string) { this.entries.set(key, value); }
  removeItem(key: string) { this.entries.delete(key); }
}

describe('public quote pricing', () => {
  it('quotes the approved 600€ base and 60€/80€ monthly maintenance', () => {
    assert.equal(QUOTE_CATALOG.creation.amount, 60000);
    const web = buildCart(state());
    assert.equal(web.oneTimeTotal, 60000); assert.equal(web.recurringTotal, 6000); assert.equal(web.firstMonthTotal, 66000);
    const shop = buildCart(state({ tienda: true, webPagesOver8: true }));
    assert.equal(shop.oneTimeTotal, 60000); assert.equal(shop.recurringTotal, 8000); assert.equal(shop.firstMonthTotal, 68000);
  });
  it('keeps optional services separate and never mixes annual prices', () => {
    for (const tienda of [false, true]) for (const social of [false, true]) for (const logo of [false, true]) for (const aiAgent of ['none', 'web', 'phone'] as const) for (const blogPosts of [0, 1, 12, 100]) {
      const cart = buildCart(state({ tienda, social, logo, aiAgent, blogPosts }));
      const monthly = 6000 + (tienda ? 2000 : 0) + (social ? 10000 : 0) + (aiAgent === 'web' ? 15000 : aiAgent === 'phone' ? 20000 : 0) + blogPosts * 300;
      assert.equal(cart.recurringTotal, monthly);
      assert.equal(cart.oneTimeTotal, 60000 + (logo ? 3000 : 0));
      assert.equal(cart.firstMonthTotal, cart.oneTimeTotal + monthly);
      assert.equal(cart.recurring.some(l => l.catalogId === 'quote_blog_post'), blogPosts > 0);
      assert.equal(new Set([...cart.oneTime, ...cart.recurring].map(l => l.catalogId)).size, cart.oneTime.length + cart.recurring.length);
    }
  });
  it('bounds invalid quantities before deriving money', () => {
    for (const [quantity, expected] of [[-2, 0], [Infinity, 0], [NaN, 0], [500, 100], [3.9, 3]] as const) {
      assert.equal(buildCart(state({ blogPosts: quantity })).recurringTotal, 6000 + expected * 300);
    }
  });
});

describe('WhatsApp quotation handoff', () => {
  it('creates a URL for the approved number and round-trips the full review', () => {
    const s = state({ webPagesOver8: true, tienda: true, social: true, aiAgent: 'phone', blogPosts: 12, logo: true, contact: { name: 'María & José', email: 'hola@example.test', phone: '+34 600 123 123', company: 'Pan / café?', notes: 'Reservas + catálogo\nSin perder mi marca.' } });
    const message = buildWhatsAppMessage(s); const url = new URL(buildWhatsAppUrl(s));
    assert.equal(url.origin, 'https://wa.me'); assert.equal(url.pathname, `/${QUOTE_WHATSAPP_NUMBER}`);
    assert.equal(url.searchParams.get('text'), message);
    for (const selected of ['más de 8', 'Tienda online: sí', 'Redes sociales: sí', 'por teléfono', '12 artículos', 'Logo: sí', 'María & José', 'Pan / café?', 'Sin perder mi marca.', 'IVA no incluido', 'confirmar alcance']) assert.ok(message.includes(selected), selected);
    assert.match(message, /630\s*€/); assert.match(message, /416\s*€/); assert.match(message, /1046|1\.046/);
    assert.ok(!message.includes('pagar hoy')); assert.ok(!url.searchParams.has('email'));
  });
  it('includes unselected options and works without any personal details', () => {
    const message = buildWhatsAppMessage(state());
    for (const omitted of ['Tienda online: no', 'Redes sociales: no', 'Agente IA: ninguno', '0 artículos', 'Logo: no']) assert.ok(message.includes(omitted));
    assert.ok(!message.includes('DATOS OPCIONALES')); assert.ok(!message.includes('undefined'));
    assert.equal(isStepValid(4, state()), true); assert.equal(isStepValid(TOTAL_STEPS, state()), true);
  });
  it('rejects malformed optional contact fields but allows clearing them', () => {
    const bad = state({ contact: { ...INITIAL_STATE.contact, email: 'broken', phone: 'not a number' } });
    assert.equal(isStepValid(4, bad), false); assert.equal(isStepValid(TOTAL_STEPS, bad), false);
    const fixed = reducer(bad, { type: 'SET_CONTACT', patch: { email: '', phone: '' } });
    assert.equal(isStepValid(4, fixed), true);
  });
});

describe('defensive selection storage', () => {
  it('keeps selections and strips all personal fields and injected passwords', () => {
    const s = { ...state({ step: 5, tienda: true, blogPosts: 8 }), unknown: 'secret', contact: { ...INITIAL_STATE.contact, name: 'Private name', notes: 'Private notes', password: 'do-not-persist', confirmPassword: 'also-secret' } };
    const serialized = serializeState(s);
    for (const forbidden of ['Private', 'password', 'do-not-persist', 'also-secret', 'unknown', 'notes']) assert.ok(!serialized.includes(forbidden), forbidden);
    const loaded = deserializeState(serialized)!;
    assert.equal(loaded.tienda, true); assert.equal(loaded.blogPosts, 8); assert.equal(loaded.step, 5); assert.deepEqual(loaded.contact, INITIAL_STATE.contact);
  });
  it('does not restore a legacy authentication payload and removes it', () => {
    const storage = new MemoryStorage(); storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({ contact: { password: 'legacy' } }));
    assert.equal(loadFromStorage(storage), null); assert.equal(storage.getItem(LEGACY_STORAGE_KEY), null);
    saveToStorage(state({ social: true }), storage); assert.equal(loadFromStorage(storage)?.social, true);
    clearStorage(storage); assert.equal(storage.getItem(STORAGE_KEY), null);
  });
  it('handles corrupt JSON, schema versions, unexpected types and out-of-range state', () => {
    for (const raw of ['broken', 'null', '[]', '{}', '{"version":1,"state":{}}', '{"version":2,"state":[]}']) assert.equal(deserializeState(raw), null);
    const value = deserializeState(JSON.stringify({ version: 2, state: { step: 999, blogPosts: 999, tienda: 'true', social: 1, logo: {}, aiAgent: 'admin', contact: { password: 'injected', name: 'ignored' } } }))!;
    assert.equal(value.step, TOTAL_STEPS); assert.equal(value.blogPosts, 100); assert.equal(value.tienda, false); assert.equal(value.social, false); assert.equal(value.logo, false); assert.equal(value.aiAgent, 'none'); assert.equal(value.contact.name, '');
    assert.equal(sanitizeState({ step: NaN }).step, 1);
  });
  it('continues working with inaccessible storage', () => {
    const blocked: QuoteStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
    assert.equal(loadFromStorage(blocked), null); assert.doesNotThrow(() => saveToStorage(state(), blocked)); assert.doesNotThrow(() => clearStorage(blocked));
  });
  it('preserves edits while navigating and resets to a fresh state', () => {
    let s = reducer(state(), { type: 'SET_TIENDA', value: true });
    s = reducer(s, { type: 'GOTO', step: 5 }); s = reducer(s, { type: 'PREV' });
    assert.equal(s.step, 4); assert.equal(s.tienda, true);
    assert.deepEqual(reducer(s, { type: 'RESET' }), INITIAL_STATE);
  });
});

describe('calculator boundaries', () => {
  it('contains no checkout/auth request or password input in its user flow', () => {
    const root = join(process.cwd(), 'src/app/tienda/calculadora');
    const readTree = (path: string): string => readdirSync(path, { withFileTypes: true }).map(entry => entry.isDirectory() ? readTree(join(path, entry.name)) : entry.name.endsWith('.tsx') ? readFileSync(join(path, entry.name), 'utf8') : '').join('\n');
    const source = readTree(root);
    assert.doesNotMatch(source, /fetch\s*\(|\/api\/(?:auth|checkout)|type=["']password["']|buy\.stripe\.com/);
    assert.match(source, /Enviar presupuesto por WhatsApp/);
  });
});
