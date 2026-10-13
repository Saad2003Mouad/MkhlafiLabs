// MIKHLAFI LABS — Automated Verification Suite: Service 01 (Financial Leaks) & Platform Administration
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { handleApiRequest } from '../src/server.js';
import { runMigrations, closeDb, query } from '../src/db/connection.js';

let server;
let baseUrl;

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {}
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
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await closeDb();
});

test('Financial Leakage Intelligence & Platform Admin Verification', async (t) => {
  let customerCookie = '';
  let customerOrgId = '';
  let anomalyId = '';
  let adminCookie = '';

  // 1. Public Packages Catalog
  await t.test('1. GET /api/v1/packages returns active commercial packages without auth', async () => {
    const res = await makeRequest('/api/v1/packages');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.packages));
    assert.ok(res.data.packages.length >= 4);
    assert.equal(res.data.packages[0].id, 'plan_starter');
  });

  // 2. Public Demo Inquiries
  await t.test('2. POST /api/v1/inquiries creates a new lead inquiry from public site', async () => {
    const res = await makeRequest('/api/v1/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        name: 'Sultan Al-Otaibi',
        email: 'sultan@aram-logistics.sa',
        companyName: 'Aram Logistics Co.',
        phone: '+966500000000',
        message: 'Requesting enterprise demonstration of Financial Leak Detection.'
      }
    });
    console.log('Inquiry returned:', res.data.inquiry);
    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.equal(res.data.inquiry.name, 'Sultan Al-Otaibi');
    assert.equal(res.data.inquiry.status || res.data.inquiry.STATUS, 'NEW');
  });

  // 3. Register Customer Organization
  await t.test('3. Register enterprise customer and receive seeded financial intelligence records', async () => {
    const uniqueEmail = `cfo-${Date.now()}@saudi-steel.sa`;
    const regRes = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: uniqueEmail,
        password: 'Password123!Safe',
        nameEn: 'Tariq Al-Mansour',
        orgNameEn: 'Saudi Steel Industries'
      }
    });
    assert.equal(regRes.status, 201);
    assert.ok(regRes.headers['set-cookie']);
    customerCookie = regRes.headers['set-cookie'][0].split(';')[0];
    customerOrgId = regRes.data.organization.id;
  });

  // 4. Retrieve Customer Financial Leaks (Service 01)
  await t.test('4. GET /api/v1/records/financial-leaks returns real PostgreSQL forensic anomalies', async () => {
    const res = await makeRequest('/api/v1/records/financial-leaks', {
      headers: {
        Cookie: customerCookie,
        'X-Organization-Id': customerOrgId
      }
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.anomalies));
    assert.equal(res.data.anomalies.length, 3);
    assert.ok(res.data.activeLeakageSAR > 0);
    assert.ok(res.data.anomalies.some(a => a.rule_code === 'RULE_DUP_INVOICE_HASH'));
    anomalyId = res.data.anomalies[0].id;
  });

  // 5. Freeze Disbursement on Flagged Anomaly
  await t.test('5. POST /api/v1/records/financial-leaks/:id/resolve with FREEZE updates anomaly and invoice', async () => {
    const res = await makeRequest(`/api/v1/records/financial-leaks/${anomalyId}/resolve`, {
      method: 'POST',
      headers: {
        Cookie: customerCookie,
        'X-Organization-Id': customerOrgId,
        'Content-Type': 'application/json'
      },
      body: {
        action: 'FREEZE',
        notes: 'Disbursement halted pending duplicate verification with supplier.'
      }
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.anomaly.status, 'FROZEN');
  });

  // 6. Regular Customer Blocked from Platform Admin
  await t.test('6. GET /api/v1/admin/overview rejects customer user with 403 Forbidden', async () => {
    const res = await makeRequest('/api/v1/admin/overview', {
      headers: { Cookie: customerCookie }
    });
    assert.equal(res.status, 403);
    assert.ok(res.data.error.includes('Platform operator authorization required'));
  });

  // 7. Setup Platform Super Admin User
  await t.test('7. Platform Admin user with is_platform_admin = true can access /api/v1/admin/overview', async () => {
    const adminEmail = `operator-${Date.now()}@mikhlafi-labs.internal`;
    const regRes = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: adminEmail,
        password: 'AdminPassword123!Secure',
        nameEn: 'Master Platform Operator',
        orgNameEn: 'Mikhlafi Internal Ops'
      }
    });
    assert.equal(regRes.status, 201);
    adminCookie = regRes.headers['set-cookie'][0].split(';')[0];
    const adminUserId = regRes.data.user.id;

    // Elevate user to platform admin in database
    await query(`UPDATE users SET is_platform_admin = true WHERE id = $1`, [adminUserId]);

    // Now call /api/v1/admin/overview
    const adminRes = await makeRequest('/api/v1/admin/overview', {
      headers: { Cookie: adminCookie }
    });
    assert.equal(adminRes.status, 200);
    assert.ok(adminRes.data.organizations.total >= 1);
    assert.ok(adminRes.data.users.total >= 1);
    assert.equal(adminRes.data.platformStatus, 'OPERATIONAL');
  });

  // 8. Platform Admin Can Inspect & Suspend Tenant
  await t.test('8. PUT /api/v1/admin/organizations/:id/status allows operator to suspend tenant', async () => {
    const suspendRes = await makeRequest(`/api/v1/admin/organizations/${customerOrgId}/status`, {
      method: 'PUT',
      headers: {
        Cookie: adminCookie,
        'Content-Type': 'application/json'
      },
      body: {
        status: 'suspended',
        reason: 'Periodic audit check'
      }
    });
    assert.equal(suspendRes.status, 200);
    assert.equal(suspendRes.data.organization.status, 'suspended');

    // Verify audit log entry was written
    const auditRes = await makeRequest('/api/v1/admin/audit', {
      headers: { Cookie: adminCookie }
    });
    assert.equal(auditRes.status, 200);
    assert.ok(auditRes.data.auditLogs.some(log => log.action === 'ORGANIZATION_STATUS_CHANGED'));
  });
});
