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

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const isDirectExecution = process.argv[1] && (
  path.resolve(process.argv[1]) === __filename ||
  process.argv[1].endsWith('src/index.js') ||
  process.argv[1].endsWith('src\\index.js')
);

// If executed directly (e.g. node src/index.js or npm start locally)
if (isDirectExecution && !process.env.VERCEL) {
  createApiServer().then(server => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[MIKHLAFI LABS API] Running on port ${PORT}`);
    });
  }).catch(err => {
    console.error('[API Startup Failed]:', err);
    process.exit(1);
  });
}
