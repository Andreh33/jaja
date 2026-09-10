import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { POST as forgot } from '../src/app/api/auth/forgot/route';
import { POST as reset } from '../src/app/api/auth/reset/route';

describe('assisted recovery containment', () => {
  it('does not issue credentials or claim an email was sent without a provider', async () => {
    const response = await forgot();
    const body = await response.json();
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(body.code, 'RECOVERY_ASSISTED');
    assert.equal(body.supportPath, '/recuperar');
    assert.equal('devLink' in body, false);
    assert.equal('token' in body, false);
    assert.notEqual(body.ok, true);
  });

  it('retires legacy reset authorization without connecting to user data', async () => {
    const response = await reset();
    const body = await response.json();
    assert.equal(response.status, 410);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(body.code, 'RECOVERY_LINK_RETIRED');
    assert.equal('devLink' in body, false);
    assert.notEqual(body.ok, true);
  });
});
