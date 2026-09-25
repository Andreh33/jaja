import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { POST as forgotPassword } from '../src/app/api/auth/forgot/route';
import { POST as resetPassword } from '../src/app/api/auth/reset/route';

describe('password recovery containment', () => {
  for (const [name, handler] of [
    ['forgot', forgotPassword],
    ['reset', resetPassword],
  ] as const) {
    it(`${name} fails closed with a constant, non-cacheable response`, async () => {
      const response = await handler();
      const body = await response.json() as Record<string, unknown>;

      assert.equal(response.status, 503);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(typeof body.error, 'string');
      assert.equal('ok' in body, false);
      assert.equal('devLink' in body, false);
      assert.equal('token' in body, false);
    });
  }
});
