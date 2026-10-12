// MIKHLAFI LABS — Central REST API & Security Gateway Entrypoint (apps/api)
// Re-exports database, authentication, middleware, and HTTP server

import http from 'node:http';
import { runMigrations, getDb, closeDb } from './db/connection.js';
import { handleApiRequest } from './server.js';

export * from './db/connection.js';
export * from './auth/passwords.js';
export * from './auth/sessions.js';
export * from './middleware/tenant.js';
export * from './server.js';

const PORT = process.env.API_PORT || 4000;

export async function createApiServer() {
  await runMigrations();
  return http.createServer((req, res) => {
    handleApiRequest(req, res);
  });
}

// If executed directly
if (process.argv[1] && (process.argv[1].endsWith('index.js') || process.argv[1].endsWith('api'))) {
  createApiServer().then(server => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[MIKHLAFI LABS API] Running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('[API Startup Failed]:', err);
    process.exit(1);
  });
}
