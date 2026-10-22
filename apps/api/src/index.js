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

const PORT = process.env.PORT || process.env.API_PORT || 4000;

let migrationsPromise = null;
async function ensureDbReady() {
  if (!migrationsPromise) {
    migrationsPromise = runMigrations().catch(err => {
      console.error('[Database Migration Warning]:', err.message);
      migrationsPromise = null;
    });
  }
  return migrationsPromise;
}

export async function createApiServer() {
  await ensureDbReady();
  return http.createServer((req, res) => {
    handleApiRequest(req, res);
  });
}

// Vercel Serverless / Node request handler
export default async function handler(req, res) {
  await ensureDbReady();
  return handleApiRequest(req, res);
}

// If executed directly or via npm start in Vercel Service
if (process.argv[1] || process.env.PORT) {
  createApiServer().then(server => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[MIKHLAFI LABS API] Running on port ${PORT}`);
    });
  }).catch(err => {
    console.error('[API Startup Failed]:', err);
    process.exit(1);
  });
}
