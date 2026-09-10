/** Optional browser fixtures. Fixed local SQLite target; never loads env credentials. */
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

async function main() {
  const databasePath = resolve('.local/qa.db');
  if (!existsSync(databasePath)) throw new Error('Run qa:prepare first.');
  const client = createClient({ url: `file:${databasePath}` });
  try {
    const fixture = await client.execute("SELECT id FROM posts WHERE id = 'qa-private-draft' AND published = 0");
    if (!fixture.rows.length) throw new Error('Local QA fixture marker missing.');
    const credentialsPath = resolve('.local/qa-users.json');
    const credentials = existsSync(credentialsPath)
      ? JSON.parse(readFileSync(credentialsPath, 'utf8')) as Record<string, string>
      : { admin: randomBytes(24).toString('base64url'), client: randomBytes(24).toString('base64url') };
    for (const role of ['admin', 'client'] as const) {
      if (typeof credentials[role] !== 'string' || credentials[role].length < 24) throw new Error('Invalid local QA credentials file.');
      const hash = await bcrypt.hash(credentials[role], 10);
      await client.execute({
        sql: 'INSERT INTO users (id, email, password, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET password = excluded.password',
        args: [`qa-${role}`, `qa-${role}@latech.invalid`, hash, `QA ${role}`, role.toUpperCase(), Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000)],
      });
    }
    writeFileSync(credentialsPath, JSON.stringify(credentials), { mode: 0o600 });
    console.log('Two local QA accounts prepared. Credentials remain in ignored .local/qa-users.json. No remote services contacted.');
  } finally { client.close(); }
}
main().catch(() => { console.error('Could not prepare local QA accounts. Check the isolated fixture and credentials file.'); process.exitCode = 1; });
