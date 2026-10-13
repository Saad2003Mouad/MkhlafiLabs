// MIKHLAFI LABS — Operations, Workflows, Integrations & ERP Ingestion Test Suite
// Verifies Migration 006, Integration Connectors, Automated Workflows, Real-Time Alerts,
// Organization Settings, and General Ledger Journal Entry Ingestion.

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { handleApiRequest } from '../src/server.js';
import { runMigrations, query, closeDb } from '../src/db/connection.js';

let server;
let baseUrl;
let sessionCookie = '';
let targetOrgId = '';

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionCookie ? { 'Cookie': sessionCookie } : {}),
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

  // Login as seeded executive supervisor
  const res = await makeRequest('/api/v1/auth/login', {
    method: 'POST',
    body: {
      email: 'saad@mikhlafi-labs.com',
      password: 'MikhlafiSecure2026!'
    }
  });

  assert.equal(res.status, 200);
  const setCookie = res.headers['set-cookie'];
  sessionCookie = Array.isArray(setCookie) ? setCookie[0].split(';')[0] : setCookie.split(';')[0];
  targetOrgId = res.data.activeTenant.organizationId;
  assert.ok(targetOrgId);
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await closeDb();
});

test.describe('Phase 4 & 6: Operations, Integrations & ERP Ingestion Verification', () => {

  test('1. GET /api/v1/integrations returns enterprise ERP connectors scoped to tenant', async () => {
    const res = await makeRequest('/api/v1/integrations');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.integrations));
    assert.ok(res.data.integrations.length >= 3);

    const sap = res.data.integrations.find(i => i.code === 'sap_s4hana' || i.name_en.includes('SAP'));
    assert.ok(sap.name_en.includes('SAP S/4HANA Finance'));
    assert.equal(sap.category, 'ERP / General Ledger');
  });

  test('2. POST /api/v1/integrations/:id/sync triggers connector handshake and updates status', async () => {
    const listRes = await makeRequest('/api/v1/integrations');
    const firstIntegration = listRes.data.integrations[0];
    assert.ok(firstIntegration);

    const syncRes = await makeRequest(`/api/v1/integrations/${firstIntegration.id}/sync`, {
      method: 'POST'
    });

    assert.equal(syncRes.status, 200);
    assert.equal(syncRes.data.success, true);
    assert.equal(syncRes.data.integration.last_sync_status, 'HEALTHY');
    assert.ok(syncRes.data.integration.last_sync_at);
    assert.ok(syncRes.data.integration.records_synced_count >= 1250);
  });

  test('3. POST /api/v1/workflows/:id/toggle flips active state and updates record', async () => {
    const listRes = await makeRequest('/api/v1/workflows');
    assert.equal(listRes.status, 200);
    assert.ok(Array.isArray(listRes.data.workflows));
    const workflow = listRes.data.workflows[0];
    assert.ok(workflow);

    const initialActive = workflow.active;

    // Toggle once
    const toggleRes1 = await makeRequest(`/api/v1/workflows/${workflow.id}/toggle`, {
      method: 'POST'
    });
    assert.equal(toggleRes1.status, 200);
    assert.equal(toggleRes1.data.success, true);
    assert.equal(toggleRes1.data.workflow.active, !initialActive);

    // Toggle back
    const toggleRes2 = await makeRequest(`/api/v1/workflows/${workflow.id}/toggle`, {
      method: 'POST'
    });
    assert.equal(toggleRes2.status, 200);
    assert.equal(toggleRes2.data.workflow.active, initialActive);
  });

  test('4. POST /api/v1/alerts/:id/acknowledge updates acknowledgment state', async () => {
    const listRes = await makeRequest('/api/v1/alerts');
    assert.equal(listRes.status, 200);
    assert.ok(Array.isArray(listRes.data.alerts));
    const alert = listRes.data.alerts[0];
    assert.ok(alert);

    const initialAck = alert.acknowledged;

    const ackRes = await makeRequest(`/api/v1/alerts/${alert.id}/acknowledge`, {
      method: 'POST'
    });

    assert.equal(ackRes.status, 200);
    assert.equal(ackRes.data.success, true);
    assert.equal(ackRes.data.alert.acknowledged, !initialAck);
  });

  test('5. GET & PUT /api/v1/organization/settings persists enterprise tenant configuration', async () => {
    const getRes = await makeRequest('/api/v1/organization/settings');
    assert.equal(getRes.status, 200);
    assert.ok(getRes.data.base_currency);

    // Update settings
    const putRes = await makeRequest('/api/v1/organization/settings', {
      method: 'PUT',
      body: {
        currency: 'SAR',
        calendar: 'hijri',
        retention: '10years',
        dataClassification: 'RESTRICTED'
      }
    });

    assert.equal(putRes.status, 200);
    assert.equal(putRes.data.success, true);
    assert.equal(putRes.data.settings.base_currency, 'SAR');
    assert.equal(putRes.data.settings.calendar_standard, 'hijri');
    assert.equal(putRes.data.settings.retention_policy, '10years');

    // Verify GET reflects changes
    const verifyRes = await makeRequest('/api/v1/organization/settings');
    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.data.base_currency, 'SAR');
    assert.equal(verifyRes.data.calendar_standard, 'hijri');
  });

  test('6. POST /api/v1/ingest/journal-entries parses entries, stores records and flags high-value anomalies', async () => {
    const entries = [
      {
        documentNumber: 'INV-TEST-001',
        vendorName: 'Aram Logistics Co.',
        amount: 540000.00,
        text: 'Q3 High Value Heavy Machinery Transfer'
      },
      {
        documentNumber: 'INV-TEST-002',
        vendorName: 'Saudi Cement Co.',
        amount: 125000.00,
        text: 'Concrete Delivery Order #42'
      },
      {
        documentNumber: 'INV-TEST-003',
        vendorName: 'Riyadh Office Supplies',
        amount: 12000.00,
        text: 'Paper and Stationeries'
      }
    ];

    const ingestRes = await makeRequest('/api/v1/ingest/journal-entries', {
      method: 'POST',
      body: {
        entries
      }
    });

    assert.equal(ingestRes.status, 201);
    assert.equal(ingestRes.data.success, true);
    assert.equal(ingestRes.data.totalIngested, 3);
    assert.equal(ingestRes.data.flaggedCount, 1); // INV-TEST-001 is 540,000 SAR (> 500,000 threshold)

    // Verify database record in tenant_journal_entries
    const dbCheck = await query(
      `SELECT * FROM tenant_journal_entries 
       WHERE organization_id = $1 AND document_number = 'INV-TEST-001'`,
      [targetOrgId]
    );
    assert.equal(dbCheck.rows.length, 1);
    assert.equal(parseFloat(dbCheck.rows[0].amount_sar), 540000);
    assert.equal(dbCheck.rows[0].vendor_name, 'Aram Logistics Co.');
    assert.equal(dbCheck.rows[0].is_flagged, true);
  });

});
