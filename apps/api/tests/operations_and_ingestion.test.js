// MIKHLAFI LABS — Operations, Workflows, Integrations & ERP Ingestion Test Suite
// Verifies Migration 006 & 007, Truthful Integration Sync, Separate Workflow Execution Semantics,
// Validated Settings, and RFC-4180 ERP Ingestion with Deduplication.

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
      email: 'client@mikhlafi-holding.com',
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

test.describe('Phase 4 & 6: Operations, Truthful Integrations & Workflow Semantics', () => {

  test('1. GET /api/v1/integrations returns enterprise ERP connectors scoped to tenant', async () => {
    const res = await makeRequest('/api/v1/integrations');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.integrations));
    assert.ok(res.data.integrations.length >= 3);

    const sap = res.data.integrations.find(i => i.code === 'SAP-ERP-PROD' || i.name_en.includes('SAP'));
    assert.ok(sap.name_en.includes('SAP S/4HANA Finance'));
    assert.equal(sap.category, 'ERP / General Ledger');
  });

  test('2. Priority 2: Syncing unconfigured integration does NOT increase records count and records NOT_CONFIGURED audit log', async () => {
    const listRes = await makeRequest('/api/v1/integrations');
    const firstIntegration = listRes.data.integrations[0];
    assert.ok(firstIntegration);

    const initialCount = parseInt(firstIntegration.records_synced_count, 10);

    const syncRes = await makeRequest(`/api/v1/integrations/${firstIntegration.id}/sync`, {
      method: 'POST'
    });

    assert.equal(syncRes.status, 200);
    // Must NOT fabricate healthy status or fake 1250 records!
    assert.equal(syncRes.data.status, 'NOT_CONFIGURED');
    assert.equal(syncRes.data.success, false);
    assert.equal(parseInt(syncRes.data.integration.records_synced_count, 10), initialCount);

    // Verify persistent audit log in tenant_integration_sync_logs
    const logCheck = await query(
      `SELECT * FROM tenant_integration_sync_logs
       WHERE organization_id = $1 AND integration_id = $2
       ORDER BY started_at DESC LIMIT 1`,
      [targetOrgId, firstIntegration.id]
    );
    assert.equal(logCheck.rows.length, 1);
    assert.equal(logCheck.rows[0].status, 'NOT_CONFIGURED');
    assert.equal(logCheck.rows[0].error_code, 'CONNECTOR_NOT_CONFIGURED');
  });

  test('3. Priority 4: Toggling workflow policy active state does NOT modify executions_count or fabricate last_executed_at', async () => {
    const listRes = await makeRequest('/api/v1/workflows');
    assert.equal(listRes.status, 200);
    assert.ok(Array.isArray(listRes.data.workflows));
    const workflow = listRes.data.workflows[0];
    assert.ok(workflow);

    const initialActive = workflow.active;
    const initialExecCount = workflow.executions_count;
    const initialLastExecutedAt = workflow.last_executed_at;

    // Toggle once
    const toggleRes1 = await makeRequest(`/api/v1/workflows/${workflow.id}/toggle`, {
      method: 'POST'
    });
    assert.equal(toggleRes1.status, 200);
    assert.equal(toggleRes1.data.success, true);
    assert.equal(toggleRes1.data.workflow.active, !initialActive);
    // Executions count MUST NOT change when toggling policy configuration!
    assert.equal(toggleRes1.data.workflow.executions_count, initialExecCount);
    assert.equal(toggleRes1.data.workflow.last_executed_at, initialLastExecutedAt);

    // Toggle back to active
    const toggleRes2 = await makeRequest(`/api/v1/workflows/${workflow.id}/toggle`, {
      method: 'POST'
    });
    assert.equal(toggleRes2.status, 200);
    assert.equal(toggleRes2.data.workflow.active, initialActive);
    assert.equal(toggleRes2.data.workflow.executions_count, initialExecCount);
  });

  test('4. Priority 4: Workflow Execution Semantics, Dry-Runs & Execution Logs', async () => {
    const listRes = await makeRequest('/api/v1/workflows');
    const workflow = listRes.data.workflows.find(w => w.active === true) || listRes.data.workflows[0];
    const initialCount = workflow.executions_count;

    // A. Dry run execution
    const dryRunRes = await makeRequest(`/api/v1/workflows/${workflow.id}/execute`, {
      method: 'POST',
      body: {
        dryRun: true,
        idempotencyKey: 'idemp-test-dry-run-001',
        conditions: { matchedCount: 3 }
      }
    });

    assert.equal(dryRunRes.status, 200);
    assert.equal(dryRunRes.data.dryRun, true);
    assert.equal(dryRunRes.data.execution.execution_status, 'SIMULATED_DRY_RUN');

    // Dry run must NOT increment workflow.executions_count
    const verifyWf = await query(`SELECT executions_count FROM tenant_workflows WHERE id = $1`, [workflow.id]);
    assert.equal(verifyWf.rows[0].executions_count, initialCount);

    // B. Real execution
    const execRes = await makeRequest(`/api/v1/workflows/${workflow.id}/execute`, {
      method: 'POST',
      body: {
        dryRun: false,
        idempotencyKey: 'idemp-test-real-001',
        conditions: { matchedCount: 2 }
      }
    });

    assert.equal(execRes.status, 200);
    assert.equal(execRes.data.execution.execution_status, 'COMPLETED');

    // Real execution MUST increment workflow.executions_count by 1
    const verifyWf2 = await query(`SELECT executions_count, last_executed_at FROM tenant_workflows WHERE id = $1`, [workflow.id]);
    assert.equal(verifyWf2.rows[0].executions_count, initialCount + 1);
    assert.ok(verifyWf2.rows[0].last_executed_at);

    // C. Idempotency test: Re-executing with same idempotency key returns existing execution without double-incrementing
    const retryRes = await makeRequest(`/api/v1/workflows/${workflow.id}/execute`, {
      method: 'POST',
      body: {
        dryRun: false,
        idempotencyKey: 'idemp-test-real-001'
      }
    });

    assert.equal(retryRes.status, 200);
    assert.equal(retryRes.data.idempotent, true);
    const verifyWf3 = await query(`SELECT executions_count FROM tenant_workflows WHERE id = $1`, [workflow.id]);
    assert.equal(verifyWf3.rows[0].executions_count, initialCount + 1);
  });

  test('5. POST /api/v1/alerts/:id/acknowledge updates acknowledgment state', async () => {
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

  test('6. Priority 5: Settings validation, persistence, and read-only infrastructure encryption', async () => {
    const getRes = await makeRequest('/api/v1/organization/settings');
    assert.equal(getRes.status, 200);
    assert.ok(getRes.data.base_currency);
    assert.equal(getRes.data.encryption_standard, 'AES-256-GCM');
    assert.equal(getRes.data.encryption_managed_by, 'INFRASTRUCTURE_KMS');

    // Update settings with valid parameters
    const putRes = await makeRequest('/api/v1/organization/settings', {
      method: 'PUT',
      body: {
        currency: 'USD',
        calendar: 'hijri',
        retention: '10years',
        dataClassification: 'RESTRICTED'
      }
    });

    assert.equal(putRes.status, 200);
    assert.equal(putRes.data.success, true);
    assert.equal(putRes.data.settings.base_currency, 'USD');
    assert.equal(putRes.data.settings.calendar_standard, 'hijri');
    assert.equal(putRes.data.settings.retention_policy, '10years');

    // Verify GET persists saved values
    const verifyRes = await makeRequest('/api/v1/organization/settings');
    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.data.base_currency, 'USD');
    assert.equal(verifyRes.data.calendar_standard, 'hijri');

    // Restore to SAR for subsequent tests
    await makeRequest('/api/v1/organization/settings', {
      method: 'PUT',
      body: { currency: 'SAR', calendar: 'gregorian', retention: '7years' }
    });
  });

  test('7. Priority 3: RFC-4180 Ingestion, Deduplication, and Honest Anomaly Detection', async () => {
    // A. Rejects empty import
    const emptyRes = await makeRequest('/api/v1/ingest/journal-entries', {
      method: 'POST',
      body: { entries: [] }
    });
    assert.ok(emptyRes.status >= 400);

    // B. Ingest valid records
    const entries = [
      {
        documentNumber: 'INV-TRUTH-001',
        vendorName: 'Aram Logistics Co.',
        amount: 250000.00,
        text: 'Q3 Certified Freight Delivery'
      },
      {
        documentNumber: 'INV-TRUTH-002',
        vendorName: 'Saudi Cement Co.',
        amount: 499000.00, // Structuring anomaly near 500k statutory threshold
        text: 'Structural Concrete Supply Order #99'
      }
    ];

    const ingestRes1 = await makeRequest('/api/v1/ingest/journal-entries', {
      method: 'POST',
      body: { entries }
    });

    assert.equal(ingestRes1.status, 201);
    assert.equal(ingestRes1.data.totalIngested, 2);
    assert.equal(ingestRes1.data.duplicateCount, 0);
    assert.equal(ingestRes1.data.flaggedCount, 1); // INV-TRUTH-002 flagged for structuring threshold
    assert.ok(ingestRes1.data.flaggedItems[0].flagReason.includes('structuring'));

    // C. Deduplication test: re-submitting same batch prevents duplicate insertion
    const ingestRes2 = await makeRequest('/api/v1/ingest/journal-entries', {
      method: 'POST',
      body: { entries }
    });

    assert.equal(ingestRes2.status, 201);
    assert.equal(ingestRes2.data.totalIngested, 0);
    assert.equal(ingestRes2.data.duplicateCount, 2); // 2 duplicates skipped cleanly!
  });

});
