/** End-to-end HTTP checks against the isolated local fixture only. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const origin = 'http://localhost:3010';
const credentials = JSON.parse(readFileSync('.local/qa-users.json', 'utf8')) as Record<string, string>;
type Jar = Map<string, string>;
async function request(path: string, jar: Jar, init: RequestInit = {}) {
  const response = await fetch(`${origin}${path}`, {
    ...init, redirect: 'manual',
    headers: { Origin: origin, Cookie: [...jar].map(([key, value]) => `${key}=${value}`).join('; '), ...init.headers },
  });
  for (const cookie of response.headers.getSetCookie()) {
    const item = cookie.split(';', 1)[0]; const i = item.indexOf('=');
    jar.set(item.slice(0, i), item.slice(i + 1));
  }
  return response;
}
async function login(role: 'admin' | 'client') {
  const jar: Jar = new Map();
  const { csrfToken } = await (await request('/api/auth/csrf', jar)).json();
  assert.equal(typeof csrfToken, 'string');
  await request('/api/auth/callback/credentials', jar, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Auth-Return-Redirect': '1' },
    body: new URLSearchParams({ csrfToken, email: `qa-${role}@latech.invalid`, password: credentials[role], callbackUrl: `${origin}/dashboard` }),
  });
  const session = await (await request('/api/auth/session', jar)).json();
  assert.equal(session.user?.role, role.toUpperCase());
  return jar;
}
async function main() {
  const anonymous: Jar = new Map();
  const admin = await login('admin');
  const client = await login('client');
  const slug = `qa-editor-${Date.now()}`;
  const input = { slug, title: 'QA editorial local', content: '## Prueba\n\nContenido privado de prueba para el recorrido editorial.', category: 'Tutoriales', published: false };
  const mutation = (body: object, method = 'POST'): RequestInit => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  let id: string | undefined;
  try {
    assert.equal((await request('/api/posts', anonymous, mutation(input))).status, 401);
    assert.equal((await request('/api/posts', client, mutation(input))).status, 401);
    assert.equal((await request('/dashboard', client)).status, 200);
    const created = await request('/api/posts', admin, mutation(input));
    assert.equal(created.status, 200); id = (await created.json()).id; assert.ok(id);
    assert.equal((await request(`/blog/${slug}`, anonymous)).status, 404);
    assert.equal((await request(`/blog/${slug}/opengraph-image`, anonymous)).status, 404);
    assert.ok(!(await (await request('/sitemap.xml', anonymous)).text()).includes(`/blog/${slug}`));
    const privateEditor = await request(`/admin/posts/${id}`, admin);
    assert.equal(privateEditor.status, 200);
    assert.match(await privateEditor.text(), /noindex/);
    const duplicate = await request('/api/posts', admin, mutation(input));
    assert.equal(duplicate.status, 409);
    assert.equal((await request('/api/posts', admin, mutation({ ...input, id, published: true }, 'PUT'))).status, 200);
    const published = await request(`/blog/${slug}`, anonymous);
    assert.equal(published.status, 200); assert.match(await published.text(), /Contenido privado de prueba/);
    assert.equal((await request(`/blog/${slug}/opengraph-image`, anonymous)).status, 200);
    assert.ok((await (await request('/sitemap.xml', anonymous)).text()).includes(`/blog/${slug}`));
    assert.equal((await request('/api/posts', admin, mutation({ ...input, id, slug: `${slug}-changed` }, 'PUT'))).status, 400);
    assert.equal((await request('/api/posts', admin, mutation({ ...input, id, published: false }, 'PUT'))).status, 200);
    assert.equal((await request(`/blog/${slug}`, anonymous)).status, 404);
    assert.equal((await request(`/blog/${slug}/opengraph-image`, anonymous)).status, 404);
    assert.ok(!(await (await request('/sitemap.xml', anonymous)).text()).includes(`/blog/${slug}`));
    console.log('PASS: local admin/client authentication, dashboard, authorization, private draft/OG/editor, collision, publication with OG/sitemap, stable URL and withdrawal/cache invalidation.');
  } finally {
    if (id) assert.equal((await request(`/api/posts?id=${encodeURIComponent(id)}`, admin, { method: 'DELETE' })).status, 200);
  }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : 'Local editorial check failed.'); process.exitCode = 1; });
