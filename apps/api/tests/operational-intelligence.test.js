// MIKHLAFI LABS — Operational Intelligence Engines & AI Assistant Test Suite
// Verifies Services 03-08: Risk, Projects, Suppliers, Customers, Data Quality, AI Assistant

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { handleApiRequest } from '../src/server.js';
import { runMigrations, query, closeDb } from '../src/db/connection.js';

let server;
let baseUrl;
let sessionCookie = '';

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

  // Login as executive supervisor
  const res = await makeRequest('/api/v1/auth/login', {
    method: 'POST',
    body: {
      email: 'client@mikhlafi-holding.com',
      password: 'Client@2026'
    }
  });

  assert.equal(res.status, 200);
  const setCookie = res.headers['set-cookie'];
  assert.ok(setCookie);
  sessionCookie = Array.isArray(setCookie) ? setCookie[0].split(';')[0] : setCookie.split(';')[0];
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await closeDb();
});

test('Service 03 (Risk Intelligence): GET /api/v1/records/risks returns verified risks', async () => {
  const res = await makeRequest('/api/v1/records/risks', {
    headers: { cookie: sessionCookie }
  });

  assert.equal(res.status, 200);
  assert.ok(res.data.risks.length >= 3);
  assert.ok(res.data.totalMonitoredExposureSAR > 0);
  const topRisk = res.data.risks[0];
  assert.ok(topRisk.code);
  assert.ok(topRisk.title_ar);
});

test('Service 03 (Risk Intelligence): POST /api/v1/records/risks/:id/mitigate toggles state and updates audit log', async () => {
  const res = await makeRequest('/api/v1/records/risks/d1000000-0000-0000-0000-000000000109/mitigate', {
    method: 'POST',
    headers: { cookie: sessionCookie },
    body: {}
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.risk.is_mitigated, true);
  assert.equal(res.data.risk.status, 'MITIGATED');

  // Verify audit log
  const auditRes = await query(
    `SELECT * FROM audit_logs WHERE entity_id = 'd1000000-0000-0000-0000-000000000109' AND action = 'RISK_MITIGATION_ACTIVATED'`
  );
  assert.ok(auditRes.rows.length > 0);
});

test('Service 04 (Project Intelligence): GET /api/v1/records/projects returns verified projects', async () => {
  const res = await makeRequest('/api/v1/records/projects', {
    headers: { cookie: sessionCookie }
  });

  assert.equal(res.status, 200);
  assert.ok(res.data.projects.length >= 3);
  assert.ok(res.data.totalCapitalBudgetSAR > 0);
  const p1 = res.data.projects.find(p => p.id === 'd2000000-0000-0000-0000-000000000001');
  assert.ok(p1);
  assert.equal(p1.code, 'PRJ-2026-01');
});

test('Service 04 (Project Intelligence): POST /api/v1/records/projects/:id/verify-claims marks claims audited', async () => {
  const res = await makeRequest('/api/v1/records/projects/d2000000-0000-0000-0000-000000000002/verify-claims', {
    method: 'POST',
    headers: { cookie: sessionCookie },
    body: {}
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.project.contractor_claims_audited, true);

  const auditRes = await query(
    `SELECT * FROM audit_logs WHERE entity_id = 'd2000000-0000-0000-0000-000000000002' AND action = 'PROJECT_CLAIMS_VERIFIED'`
  );
  assert.ok(auditRes.rows.length > 0);
});

test('Service 05 (Supplier Intelligence): GET /api/v1/records/suppliers returns suppliers', async () => {
  const res = await makeRequest('/api/v1/records/suppliers', {
    headers: { cookie: sessionCookie }
  });

  assert.equal(res.status, 200);
  assert.ok(res.data.suppliers.length >= 3);
  assert.ok(res.data.totalMonitoredContractsSAR > 0);
});

test('Service 05 (Supplier Intelligence): POST /api/v1/records/suppliers/:id/audit triggers benchmark audit', async () => {
  const res = await makeRequest('/api/v1/records/suppliers/d3000000-0000-0000-0000-000000000702/audit', {
    method: 'POST',
    headers: { cookie: sessionCookie },
    body: {}
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.supplier.is_audited, true);

  const auditRes = await query(
    `SELECT * FROM audit_logs WHERE entity_id = 'd3000000-0000-0000-0000-000000000702' AND action = 'SUPPLIER_AUDIT_COMPLETED'`
  );
  assert.ok(auditRes.rows.length > 0);
});

test('Service 06 (Customer Intelligence): GET /api/v1/records/customers returns churn radar accounts', async () => {
  const res = await makeRequest('/api/v1/records/customers', {
    headers: { cookie: sessionCookie }
  });

  assert.equal(res.status, 200);
  assert.ok(res.data.customers.length >= 3);
  assert.ok(res.data.totalRevenueAtRiskSAR > 0);
});

test('Service 06 (Customer Intelligence): POST /api/v1/records/customers/:id/review schedules executive review', async () => {
  const res = await makeRequest('/api/v1/records/customers/d4000000-0000-0000-0000-000000000901/review', {
    method: 'POST',
    headers: { cookie: sessionCookie },
    body: {}
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.customer.review_scheduled, true);
});

test('Service 07 (Data Quality): GET /api/v1/data-quality/audits and POST /api/v1/data-quality/scan', async () => {
  const resGet = await makeRequest('/api/v1/data-quality/audits', {
    headers: { cookie: sessionCookie }
  });

  assert.equal(resGet.status, 200);
  assert.ok(resGet.data.audits.length >= 3);
  assert.ok(resGet.data.overallComplianceScore > 90);

  const resScan = await makeRequest('/api/v1/data-quality/scan', {
    method: 'POST',
    headers: { cookie: sessionCookie },
    body: {}
  });

  assert.equal(resScan.status, 200);
  assert.equal(resScan.data.success, true);
});

test('Service 08 (AI Business Assistant): POST /api/v1/assistant/chat answers queries with verifiable citations', async () => {
  const res = await makeRequest('/api/v1/assistant/chat', {
    method: 'POST',
    headers: { cookie: sessionCookie },
    body: {
      query: 'ما هي أبرز حالات الهدر المالي التي تحتاج قراراً؟',
      locale: 'ar'
    }
  });

  assert.equal(res.status, 200);
  assert.ok(
    res.data.response.includes('شذوذ') ||
    res.data.response.includes('مالي') ||
    res.data.response.includes('تسرب') ||
    res.data.response.includes('السجلات') ||
    res.data.response.includes('CASE-')
  );
  assert.ok(res.data.citations.length > 0);
  assert.ok(res.data.citations[0].docId);
  assert.ok(res.data.citations[0].source);

  // Verify persistence in ai_assistant_logs
  const logRes = await query('SELECT * FROM ai_assistant_logs WHERE organization_id = $1', ['c0000000-0000-0000-0000-000000000002']);
  assert.ok(logRes.rows.length > 0);
});
