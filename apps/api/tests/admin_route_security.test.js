// MIKHLAFI LABS — Priority 1: Admin Route Isolation & Security Test Suite
// Asserts that customer users (including org_owner & org_admin) can NEVER access Platform Admin APIs

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { handleApiRequest } from '../src/server.js';
import { runMigrations, query, closeDb } from '../src/db/connection.js';

let server;
let baseUrl;
let customerOwnerCookie = '';
let customerAdminCookie = '';
let customerViewerCookie = '';
let platformAdminCookie = '';

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch { json = null; }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
          text: data
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

test.before(async () => {
  await runMigrations();

  server = http.createServer(async (req, res) => {
    await handleApiRequest(req, res);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;

  // 1. Login as Platform Admin (is_platform_admin = true)
  const adminLogin = await makeRequest('/api/v1/auth/login', {
    method: 'POST',
    body: {
      email: 'saad@mikhlafi-labs.com',
      password: 'MikhlafiSecure2026!'
    }
  });
  assert.equal(adminLogin.status, 200);
  platformAdminCookie = adminLogin.headers['set-cookie'][0].split(';')[0];

  // 2. Register an enterprise customer organization (Owner)
  const ownerReg = await makeRequest('/api/v1/auth/register', {
    method: 'POST',
    body: {
      email: `customer-owner-${Date.now()}@acme-corp.sa`,
      password: 'CustomerSecurePass2026!',
      nameEn: 'Tariq Al-Owner',
      orgNameEn: 'Acme Mega Corp'
    }
  });
  assert.equal(ownerReg.status, 201);
  customerOwnerCookie = ownerReg.headers['set-cookie'][0].split(';')[0];

  // 3. Register a customer admin
  const adminReg = await makeRequest('/api/v1/auth/register', {
    method: 'POST',
    body: {
      email: `customer-admin-${Date.now()}@acme-corp.sa`,
      password: 'CustomerSecurePass2026!',
      nameEn: 'Omar Al-Admin',
      orgNameEn: 'Beta Enterprise LLC'
    }
  });
  assert.equal(adminReg.status, 201);
  customerAdminCookie = adminReg.headers['set-cookie'][0].split(';')[0];
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await closeDb();
});

test.describe('Priority 1: Platform Admin Route Isolation & RBAC Boundary Enforcement', () => {

  test('1. Unauthenticated requests to /api/v1/admin/* are rejected with 401 Unauthorized', async () => {
    const endpoints = [
      '/api/v1/admin/overview',
      '/api/v1/admin/organizations',
      '/api/v1/admin/users',
      '/api/v1/admin/leads',
      '/api/v1/admin/audit'
    ];

    for (const ep of endpoints) {
      const res = await makeRequest(ep);
      assert.equal(res.status, 401, `Endpoint ${ep} should reject unauthenticated callers`);
    }
  });

  test('2. Organization Owner (org_owner) is rejected from all Platform Admin endpoints with 403 Forbidden', async () => {
    const endpoints = [
      '/api/v1/admin/overview',
      '/api/v1/admin/organizations',
      '/api/v1/admin/users',
      '/api/v1/admin/leads',
      '/api/v1/admin/audit'
    ];

    for (const ep of endpoints) {
      const res = await makeRequest(ep, {
        headers: { 'Cookie': customerOwnerCookie }
      });
      assert.equal(res.status, 403, `Org Owner must be denied access to ${ep}`);
      assert.match(res.data.error, /operator authorization required/i);
    }
  });

  test('3. Organization Admin (org_admin) is rejected from Platform Admin endpoints with 403 Forbidden', async () => {
    const res = await makeRequest('/api/v1/admin/overview', {
      headers: { 'Cookie': customerAdminCookie }
    });
    assert.equal(res.status, 403);
    assert.match(res.data.error, /operator authorization required/i);
  });

  test('4. Customer users CANNOT invoke Operator License Issuance or Payment Confirmation', async () => {
    const licenseRes = await makeRequest('/api/v1/admin/licenses/issue', {
      method: 'POST',
      headers: { 'Cookie': customerOwnerCookie },
      body: {
        customerSlug: 'malicious-org',
        customerName: 'Malicious Org'
      }
    });
    assert.equal(licenseRes.status, 403);

    const paymentRes = await makeRequest('/api/v1/admin/organizations/c0000000-0000-0000-0000-000000000002/confirm-payment', {
      method: 'POST',
      headers: { 'Cookie': customerOwnerCookie },
      body: { amount: 100000, referenceNumber: 'FAKE-WIRE-123' }
    });
    assert.equal(paymentRes.status, 403);
  });

  test('5. Non-existent admin path /api/v1/admin/unknown returns 404 and does not fall through to tenant context', async () => {
    const res = await makeRequest('/api/v1/admin/unknown-endpoint-xyz', {
      headers: { 'Cookie': platformAdminCookie }
    });
    assert.equal(res.status, 404);
    assert.match(res.data.error, /Admin API endpoint not found/i);
  });

  test('6. Verified Platform Admin (is_platform_admin = true) successfully accesses /api/v1/admin/overview', async () => {
    const res = await makeRequest('/api/v1/admin/overview', {
      headers: { 'Cookie': platformAdminCookie }
    });
    assert.equal(res.status, 200);
    assert.ok(res.data.organizations);
    assert.equal(res.data.platformStatus, 'OPERATIONAL');
  });

});
