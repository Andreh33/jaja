import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { contactSchema, submitContact } from '../src/lib/contact-validation';

const message = { name: 'Ana', email: 'ana@example.test', phone: '', service: 'web', message: 'Quiero una web para mi negocio.' };

describe('contact submission contract', () => {
  it('normalizes valid inputs and saves exactly once', async () => {
    const saved: unknown[] = [];
    const result = await submitContact({ ...message, name: '  Ana  ', email: ' ana@example.test ', message: '  Quiero una web para mi negocio.  ' }, async (input) => { saved.push(input); });
    assert.deepEqual(result, { ok: true });
    assert.deepEqual(saved, [message]);
  });

  it('returns actionable minimum-length errors without writing', async () => {
    let writes = 0;
    const result = await submitContact({ ...message, name: ' A ', message: ' hola ' }, async () => { writes++; });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.fields.name);
      assert.ok(result.fields.message);
    }
    assert.equal(writes, 0);
  });

  it('rejects whitespace, malformed input, unknown services and maximum overflows', () => {
    for (const input of [null, {}, { ...message, name: '   ' }, { ...message, email: 'not-email' }, { ...message, service: 'arbitrary' }, { ...message, message: 'x'.repeat(4001) }, { ...message, phone: 'x'.repeat(41) }]) {
      assert.equal(contactSchema.safeParse(input).success, false);
    }
  });

  it('does not report success when persistence fails', async () => {
    await assert.rejects(submitContact(message, async () => { throw new Error('storage unavailable'); }), /storage unavailable/);
  });
});
