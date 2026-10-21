// MIKHLAFI LABS — Automated Route, Navigation & Security Test Suite
// Verifies public website routes, dedicated auth routes, protected API endpoints, and legacy elimination

import { describe, it, before, after } from 'node:test';
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

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: 'GET',
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json || data
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function post(path, body = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = JSON.stringify(body);
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json || data
        });
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

describe('Master Refactoring & Route Architecture Verification Suite', () => {
  // ── Public Marketing Routes Verification ─────────────────────────────────
  describe('Public Website Routes (Accessible without Authentication)', () => {
    it('1. GET / loads the public homepage successfully', async () => {
      const res = await get('/');
      assert.equal(res.status, 200);
      assert.match(String(res.data), /<title>MIKHLAFI LABS — Intelligence · Systems · Innovation<\/title>/);
      assert.doesNotMatch(String(res.data), /Visual Prototype/);
    });

    it('2. GET /about resolves to SPA bundle', async () => {
      const res = await get('/about');
      assert.equal(res.status, 200);
      assert.match(String(res.data), /id="root"/);
    });

    it('3. GET /platform resolves to SPA bundle (Public Product Overview, NOT Customer Dashboard)', async () => {
      const res = await get('/platform');
      assert.equal(res.status, 200);
      assert.match(String(res.data), /id="root"/);
    });

    it('4. GET /solutions resolves to SPA bundle', async () => {
      const res = await get('/solutions');
      assert.equal(res.status, 200);
      assert.match(String(res.data), /id="root"/);
    });

    it('5. GET /industries resolves to SPA bundle', async () => {
      const res = await get('/industries');
      assert.equal(res.status, 200);
      assert.match(String(res.data), /id="root"/);
    });

    it('6. GET /pricing resolves to SPA bundle', async () => {
      const res = await get('/pricing');
      assert.equal(res.status, 200);
      assert.match(String(res.data), /id="root"/);
    });

    it('7. GET /contact resolves to SPA bundle', async () => {
      const res = await get('/contact');
      assert.equal(res.status, 200);
      assert.match(String(res.data), /id="root"/);
    });
  });

  // ── Dedicated Authentication Routes ──────────────────────────────────────
  describe('Dedicated Authentication Routes', () => {
    it('8. GET /login resolves to dedicated login SPA route', async () => {
      const res = await get('/login');
      assert.equal(res.status, 200);
      assert.match(String(res.data), /id="root"/);
    });

    it('9. GET /register resolves to dedicated registration SPA route', async () => {
      const res = await get('/register');
      assert.equal(res.status, 200);
      assert.match(String(res.data), /id="root"/);
    });
  });

  // ── Protected Customer Application Routes ────────────────────────────────
  describe('Protected Customer Workspace Routes (/app/*)', () => {
    it('10. GET /app serves SPA bundle for client-side protected route evaluation', async () => {
      const res = await get('/app');
      assert.equal(res.status, 200);
      assert.match(String(res.data), /id="root"/);
    });

    it('11. GET /app/decisions serves SPA bundle for client-side route evaluation', async () => {
      const res = await get('/app/decisions');
      assert.equal(res.status, 200);
      assert.match(String(res.data), /id="root"/);
    });

    it('12. GET /app/risk serves SPA bundle for client-side route evaluation', async () => {
      const res = await get('/app/risk');
      assert.equal(res.status, 200);
      assert.match(String(res.data), /id="root"/);
    });
  });

  // ── Legacy Routes Clean Elimination ──────────────────────────────────────
  describe('Legacy and Prototype Clean Elimination', () => {
    it('13. Obsolete /legacy route no longer serves obsolete files', async () => {
      const res = await get('/legacy');
      // Serves modern SPA (which will handle as 404 or redirect), not obsolete legacy HTML
      assert.equal(res.status, 200);
      assert.doesNotMatch(String(res.data), /legacy-cockpit/i);
    });
  });

  // ── API Authentication & Tenant Security ─────────────────────────────────
  describe('Backend Session Validation & Tenant Boundary Enforcement', () => {
    it('14. GET /api/v1/auth/me rejects unauthenticated request with 401', async () => {
      const res = await get('/api/v1/auth/me');
      assert.equal(res.status, 401);
      assert.ok(res.data.error);
    });

    it('15. GET /api/v1/dashboard/summary rejects unauthenticated request with 401', async () => {
      const res = await get('/api/v1/dashboard/summary');
      assert.equal(res.status, 401);
      assert.ok(res.data.error);
    });

    it('16. POST /api/v1/auth/register and /api/v1/auth/login validate credentials and manage sessions', async () => {
      const testEmail = `route-test-${Date.now()}@mikhlafi-labs.com`;
      const regRes = await post('/api/v1/auth/register', {
        email: testEmail,
        password: 'Password123!',
        nameEn: 'Route Test Admin',
        orgNameEn: `Route Test Organization ${Date.now()}`
      });
      assert.equal(regRes.status, 201);
      assert.ok(regRes.data.user);
      assert.ok(regRes.headers['set-cookie']);

      // Login test
      const res = await post('/api/v1/auth/login', {
        email: testEmail,
        password: 'Password123!'
      });
      assert.equal(res.status, 200);
      assert.ok(res.data.user);
      assert.equal(res.data.user.email, testEmail);
      assert.ok(res.headers['set-cookie']);

      const sessionCookie = res.headers['set-cookie'][0].split(';')[0];

      // Now verify authenticated session access
      const meRes = await get('/api/v1/auth/me', { Cookie: sessionCookie });
      assert.equal(meRes.status, 200);
      assert.equal(meRes.data.user.email, testEmail);
      assert.ok(meRes.data.tenant);

      // Verify dashboard summary accessible with valid session
      const dashRes = await get('/api/v1/dashboard/summary', { Cookie: sessionCookie });
      assert.equal(dashRes.status, 200);
      assert.ok(dashRes.data.organization);
      assert.ok(dashRes.data.kpis);

      // Logout invalidates session
      const logoutRes = await post('/api/v1/auth/logout', {}, { Cookie: sessionCookie });
      assert.equal(logoutRes.status, 200);

      // After logout, session is terminated
      const afterLogoutRes = await get('/api/v1/auth/me', { Cookie: sessionCookie });
      assert.equal(afterLogoutRes.status, 401);
    });
  });
});
