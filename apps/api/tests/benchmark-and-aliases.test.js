import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest } from '../src/server.js';
import { runMigrations } from '../src/db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLATFORM_DIST = path.resolve(__dirname, '../../../apps/platform/dist');

let localServer = null;
let BASE_URL = process.env.TEST_BASE_URL || '';

before(async () => {
  if (!BASE_URL) {
    const isPortOpen = await new Promise((resolve) => {
      const probe = http.request('http://127.0.0.1:3000/', { method: 'HEAD', timeout: 500 }, (res) => resolve(true));
      probe.on('error', () => resolve(false));
      probe.on('timeout', () => { probe.destroy(); resolve(false); });
      probe.end();
    });

    if (isPortOpen) {
      BASE_URL = 'http://127.0.0.1:3000';
    } else {
      await runMigrations();
      localServer = http.createServer(async (req, res) => {
        const parsed = new URL(req.url, 'http://127.0.0.1');
        if (parsed.pathname.startsWith('/api/')) {
          await handleApiRequest(req, res);
          return;
        }
        const reqPath = parsed.pathname === '/' ? 'index.html' : parsed.pathname.replace(/^\//, '');
        const filePath = path.join(PLATFORM_DIST, reqPath);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const content = fs.readFileSync(filePath);
          res.writeHead(200);
          res.end(content);
        } else {
          const indexHtml = path.join(PLATFORM_DIST, 'index.html');
          if (fs.existsSync(indexHtml)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fs.readFileSync(indexHtml));
          } else {
            res.writeHead(404);
            res.end('Not Found');
          }
        }
      });
      await new Promise((resolve) => localServer.listen(0, '127.0.0.1', resolve));
      BASE_URL = `http://127.0.0.1:${localServer.address().port}`;
    }
  }
});

after(async () => {
  if (localServer) {
    await new Promise((resolve) => localServer.close(resolve));
  }
});

function fetchUrl(pathname, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathname, BASE_URL);
    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

test('Empirical Benchmark & Route Alias Normalization Suite', async (t) => {
  await t.test('1. GET /api/v1/benchmarks/financial returns 200 with 533k SAP ERP benchmark results', async () => {
    const res = await fetchUrl('/api/v1/benchmarks/financial');
    assert.equal(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.equal(data.success, true);
    assert.ok(data.benchmark);
    assert.equal(data.benchmark.metadata.totalRows, 533009);
    assert.equal(data.benchmark.metadata.globalAnomalies, 70);
    assert.equal(data.benchmark.metadata.localAnomalies, 30);
    assert.ok(data.benchmark.empiricalValidation.accuracy > 99.0);
    assert.ok(data.benchmark.empiricalValidation.falsePositiveRate < 0.5);
  });

  await t.test('2. Direct domain paths resolve cleanly without 404 (Serving SPA Index)', async () => {
    const routesToTest = [
      '/finance',
      '/decisions',
      '/risk',
      '/projects',
      '/suppliers',
      '/customers',
      '/data-quality',
      '/assistant',
      '/organization',
      '/billing',
      '/settings',
      '/dashboard',
      '/services',
      '/features',
      '/about-us',
      '/contact-us'
    ];

    for (const route of routesToTest) {
      const res = await fetchUrl(route);
      assert.equal(res.statusCode, 200, `Expected 200 for route ${route}`);
      assert.ok(res.body.includes('<!DOCTYPE html>') || res.body.includes('<html'), `Expected HTML body for route ${route}`);
    }
  });
});
