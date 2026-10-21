// MIKHLAFI LABS — High-Performance Zero-Dependency Local Dev Server
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { handleApiRequest } from './apps/api/src/server.js';
import { runMigrations, query } from './apps/api/src/db/connection.js';
import { seedDemoWorkspace } from './apps/api/src/db/seedDemoWorkspace.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically load .env file if it exists
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envPath);
  }
} catch (e) {
  // Silent fallback
}

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const PLATFORM_DIST = path.join(__dirname, 'apps', 'platform', 'dist');

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff'
      });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];

  // ── 1. API Endpoints (/api/*) ────────────────────────────────────────────
  if (urlPath.startsWith('/api/')) {
    handleApiRequest(req, res);
    return;
  }

  // ── 2. Static Assets (/assets/*, /favicon.*, root static files) ─────────
  if (urlPath !== '/') {
    // Check if the URL points to a physical file inside PLATFORM_DIST (e.g. /favicon.svg, /assets/...)
    const safeDistBase = path.resolve(PLATFORM_DIST);
    const safeDistPath = path.resolve(safeDistBase, '.' + path.normalize('/' + urlPath));

    if (safeDistPath.startsWith(safeDistBase)) {
      try {
        if (fs.existsSync(safeDistPath) && fs.statSync(safeDistPath).isFile()) {
          serveFile(res, safeDistPath);
          return;
        }
      } catch (e) {
        // Fall through
      }
    }

    // Fallback for root /assets directory
    if (urlPath.startsWith('/assets/')) {
      const assetSub = urlPath.slice('/assets/'.length);
      const safeRootBase = path.resolve(__dirname, 'assets');
      const safeRootPath = path.resolve(safeRootBase, '.' + path.normalize('/' + assetSub));

      if (safeRootPath.startsWith(safeRootBase)) {
        try {
          if (fs.existsSync(safeRootPath) && fs.statSync(safeRootPath).isFile()) {
            serveFile(res, safeRootPath);
            return;
          }
        } catch (e) {
          // Fall through
        }
      }
    }
  }

  // ── 3. Main React Application Routes (SPA) ───────────────────────────────
  // Serves apps/platform/dist/index.html for:
  // - / (Redesigned Public Homepage)
  // - /platform, /solutions, /industries, /pricing, /about, /contact
  // - /app, /app/* (Customer Application & Protected Sub-Pages)
  const spaIndex = path.join(PLATFORM_DIST, 'index.html');
  fs.stat(spaIndex, (err, stats) => {
    if (!err && stats.isFile()) {
      serveFile(res, spaIndex);
    } else {
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Platform bundle is building. Please run: npm run build in apps/platform');
    }
  });
});

async function ensureDemoWorkspace() {
  if (process.env.SEED_DEMO_DATA === '0') return;

  // Some migrations insert a handful of template rows, so the demo organization is
  // never fully empty. Journal entries are the largest demo dataset and no migration
  // creates any, which makes them a reliable "has the demo data ever been seeded"
  // marker. This also means the platform owner's own edits are never overwritten.
  const existing = await query(`SELECT COUNT(*)::int AS count FROM tenant_journal_entries`);

  if ((existing.rows?.[0]?.count ?? 0) > 0) return;

  console.log('[Seed] Demo workspace is empty — seeding demonstration data...');
  await seedDemoWorkspace();
}

runMigrations()
  .then(() => ensureDemoWorkspace())
  .then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=============================================================`);
    console.log(`  MIKHLAFI LABS — Enterprise Decision Intelligence Platform`);
    console.log(`  INTELLIGENCE · SYSTEMS · INNOVATION`);
    console.log(`  Public Website:          http://localhost:${PORT}/`);
    console.log(`  Customer Workspace:      http://localhost:${PORT}/app`);
    console.log(`  Product Overview:        http://localhost:${PORT}/platform`);
    console.log(`  REST API Gateway:        http://localhost:${PORT}/api/v1`);
    console.log(`  Database Status:         PostgreSQL Schema Initialized`);
    console.log(`=============================================================\n`);
  });
}).catch(err => {
  console.error('[Database Migration Failed on Startup]:', err);
  process.exit(1);
});
