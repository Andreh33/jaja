// The declaration remains in schema.ts. This scoped entrypoint ensures an
// additive TV migration never diffs or recreates unrelated application tables.
export { tvRemoteSessions, tvArcadeSessions } from './schema';
