// MIKHLAFI LABS — High-Performance Zero-Dependency Local Dev Server
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlPath = req.url.split('?')[0];

  // ── 1. Legacy Route Clean Redirect (/legacy -> /platform) ─────────────────
  if (urlPath === '/legacy' || urlPath.startsWith('/legacy/')) {
    res.writeHead(302, { 'Location': '/platform' });
    res.end();
    return;
  }

  // ── 2. Assets (/assets/*) ────────────────────────────────────────────────
  if (urlPath.startsWith('/assets/')) {
    const assetSub = urlPath.slice('/assets/'.length);
    const distAssetPath = path.join(PLATFORM_DIST, 'assets', path.normalize(assetSub));

    fs.stat(distAssetPath, (err, stats) => {
      if (!err && stats.isFile()) {
        serveFile(res, distAssetPath);
        return;
      }

      // Root images/assets fallback
      const rootAssetPath = path.join(__dirname, 'assets', path.normalize(assetSub));
      fs.stat(rootAssetPath, (rootErr, rootStats) => {
        if (!rootErr && rootStats.isFile()) {
          serveFile(res, rootAssetPath);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Asset Not Found');
        }
      });
    });
    return;
  }

  // ── 3. Main React Application Routes (SPA) ───────────────────────────────
  // Serves apps/platform/dist/index.html for:
  // - / (Redesigned Public Homepage)
  // - /platform, /platform/* (Customer Application & 16 Sub-Pages)
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=============================================================`);
  console.log(`  MIKHLAFI LABS — Enterprise Decision Intelligence Platform`);
  console.log(`  INTELLIGENCE · SYSTEMS · INNOVATION`);
  console.log(`  New Public Homepage:     http://localhost:${PORT}/`);
  console.log(`  Customer Platform:       http://localhost:${PORT}/platform`);
  console.log(`  Scenario Review:         http://localhost:${PORT}/prototype`);
  console.log(`  Preserved Legacy Site:   http://localhost:${PORT}/legacy`);
  console.log(`=============================================================\n`);
});
