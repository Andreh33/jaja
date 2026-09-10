import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import { encode } from '@auth/core/jwt';
import { NextRequest, type NextFetchEvent } from 'next/server';

// This test imports the real guard and Auth.js configuration in an isolated
// test process. JWT reads need no users and must never touch a remote database.
const secret = randomBytes(32).toString('hex');
const previousEnv = new Map<string, string | undefined>();
const fixtureEnv: Record<string, string | undefined> = {
  AUTH_SECRET: secret,
  NEXTAUTH_SECRET: undefined,
  AUTH_URL: undefined,
  NEXTAUTH_URL: undefined,
  TURSO_DATABASE_URL: 'file::memory:',
  TURSO_AUTH_TOKEN: undefined,
};
let proxy: typeof import('../src/proxy').default;
let handlers: typeof import('../src/lib/auth').handlers;
const event = {} as NextFetchEvent; // The application guard never uses the event.

before(async () => {
  for (const [key, value] of Object.entries(fixtureEnv)) {
    previousEnv.set(key, process.env[key]);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  proxy = (await import('../src/proxy')).default;
  handlers = (await import('../src/lib/auth')).handlers;
});

after(() => {
  for (const [key, value] of previousEnv) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function request(path: string, cookie = '', secure = false) {
  return new NextRequest(`${secure ? 'https' : 'http'}://localhost:3000${path}`, {
    headers: { host: 'localhost:3000', 'x-forwarded-proto': secure ? 'https' : 'http', cookie },
  });
}
function sessionName(secure: boolean) {
  return `${secure ? '__Secure-' : ''}authjs.session-token`;
}
async function tokenCookie(role: 'ADMIN' | 'CLIENT', secure = false, chunked = false, maxAge = 3600) {
  const name = sessionName(secure);
  const value = await encode({ secret, salt: name, maxAge, token: { id: 'qa-proxy-only', role, ...(chunked ? { fixture: 'x'.repeat(5000) } : {}) } });
  return chunked
    ? (value.match(/.{1,3000}/g) ?? []).map((part, index) => `${name}.${index}=${part}`).join('; ')
    : `${name}=${value}`;
}
function sessionWrites(response: Response) {
  return response.headers.getSetCookie().filter(value => /^(?:__Secure-)?authjs\.session-token(?:\.\d+)?=/.test(value));
}

describe('private proxy with real Auth.js JWT validation', () => {
  it('preserves role guards, redirects and Next routing headers without renewing plain, secure or chunked cookies', async () => {
    for (const secure of [false, true]) {
      for (const chunked of [false, true]) {
        const admin = await tokenCookie('ADMIN', secure, chunked);
        const allowed = await proxy(request('/admin/clientes', admin, secure), event);
        assert.ok(allowed instanceof Response);
        assert.equal(allowed.status, 200);
        assert.equal(allowed.headers.get('x-middleware-next'), '1');
        assert.equal(allowed.headers.has('set-cookie'), false);

        const client = await tokenCookie('CLIENT', secure, chunked);
        const denied = await proxy(request('/admin', client, secure), event);
        assert.ok(denied instanceof Response);
        assert.equal(denied.status, 307);
        assert.equal(new URL(denied.headers.get('location')!).pathname, '/login');
        assert.equal(denied.headers.has('set-cookie'), false);

        const dashboard = await proxy(request('/dashboard/seguridad', client, secure), event);
        assert.ok(dashboard instanceof Response);
        assert.equal(dashboard.headers.get('x-middleware-next'), '1');
        assert.equal(dashboard.headers.has('set-cookie'), false);
      }
    }
  });

  it('keeps unauthenticated and expired sessions outside protected pages', async (t) => {
    // Auth.js intentionally reports invalid JWTs; the fixture contains no PII.
    t.mock.method(console, 'error', () => {});
    const expired = await tokenCookie('ADMIN', false, false, -60);
    for (const cookie of ['', expired, 'authjs.session-token=invalid']) {
      for (const [path, destination] of [['/admin', '/admin/login'], ['/dashboard', '/login']]) {
        const response = await proxy(request(path, cookie), event);
        assert.ok(response instanceof Response);
        assert.equal(response.status, 307);
        assert.equal(new URL(response.headers.get('location')!).pathname, destination);
        assert.equal(response.headers.has('set-cookie'), false);
      }
    }
    const login = await proxy(request('/admin/login'), event);
    assert.ok(login instanceof Response);
    assert.equal(login.headers.get('x-middleware-next'), '1');
  });

  it('allows Auth endpoints to renew and clear a session while a delayed private response cannot restore it', async () => {
    const cookie = await tokenCookie('ADMIN');
    const delayedPrivateResponse = await proxy(request('/admin/clientes', cookie), event);
    assert.ok(delayedPrivateResponse instanceof Response);

    const sessionResponse = await handlers.GET(request('/api/auth/session', cookie));
    assert.equal(sessionResponse.status, 200);
    assert.equal((await sessionResponse.json()).user.role, 'ADMIN');
    assert.ok(sessionWrites(sessionResponse).length > 0);

    const csrfResponse = await handlers.GET(request('/api/auth/csrf', cookie));
    const { csrfToken } = await csrfResponse.json();
    const csrfCookies = csrfResponse.headers.getSetCookie().map(value => value.split(';')[0]);
    const signOut = await handlers.POST(new NextRequest('http://localhost:3000/api/auth/signout', {
      method: 'POST',
      headers: { host: 'localhost:3000', 'x-forwarded-proto': 'http', 'content-type': 'application/x-www-form-urlencoded', 'x-auth-return-redirect': '1', cookie: [cookie, ...csrfCookies].join('; ') },
      body: new URLSearchParams({ csrfToken, callbackUrl: 'http://localhost:3000/' }),
    }));
    assert.equal(signOut.status, 200);
    assert.ok(sessionWrites(signOut).some(value => /Max-Age=0/i.test(value)));
    // Delivering this older authenticated response after the sign-out response
    // has no cookie write to undo that deletion (the local production-build race).
    assert.equal(sessionWrites(delayedPrivateResponse).length, 0);
    const afterSignOut = await proxy(request('/admin'), event);
    assert.ok(afterSignOut instanceof Response);
    assert.equal(new URL(afterSignOut.headers.get('location')!).pathname, '/admin/login');
  });
});
