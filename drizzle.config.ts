import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const tvRemoteOnly = process.env.TV_REMOTE_SCHEMA_ONLY === '1';
export default {
  schema: tvRemoteOnly ? './drizzle/tv-remote-scope.ts' : './drizzle/schema.ts',
  ...(tvRemoteOnly ? { tablesFilter: ['tv_remote_sessions', 'tv_arcade_sessions'] } : {}),
  out: './drizzle/migrations',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config;
