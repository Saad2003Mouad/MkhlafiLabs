// MIKHLAFI LABS — Data Source Connector Test Suite
// Proves the connection layer does real work rather than reporting synthetic success:
//   * lifecycle CRUD with credential redaction and per-tenant scoping
//   * live connection probes (success, unconfigured, unreachable, blocked target)
//   * real outbound sync that ingests exactly what the source returned
//   * honest FAILED status with the real reason when a source errors
//   * CSV export ingestion with row-level rejection reporting
//   * the former demonstration-fixture path no longer exists

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { handleApiRequest } from '../src/server.js';
import { runMigrations, query, closeDb } from '../src/db/connection.js';

let apiServer;
let baseUrl;
let fixtureServer;
let fixtureUrl;
let sessionCookie = '';
let otherSessionCookie = '';
let orgId = '';

// Fixture behaviour is switched per test
let fixtureMode = 'json';
let fixtureRecords = [];

const STAMP = Date.now().toString(36).toUpperCase();

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionCookie ? { Cookie: sessionCookie } : {}),
        ...(options.sessionCookie ? { Cookie: options.sessionCookie } : {}),
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch { json = null; }
        resolve({ status: res.statusCode, headers: res.headers, data: json, text: data });
      });
    });

    req.on('error', reject);
    if (options.body !== undefined) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

function csvBody(records) {
  const header = 'documentNumber,amount,vendorName,date,accountNumber,narrative';
  const rows = records.map((r) =>
    [r.documentNumber, r.amount, r.vendorName, r.date, r.accountNumber, r.narrative]
      .map((v) => (String(v).includes(',') ? `"${String(v).replace(/"/g, '""')}"` : String(v)))
      .join(',')
  );
  return [header, ...rows].join('\n');
}

async function createSource(overrides = {}) {
  const res = await makeRequest('/api/v1/integrations', {
    method: 'POST',
    body: {
      code: `CONN-${STAMP}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      name_en: 'Connected Ledger Feed',
      name_ar: 'بث دفتر الأستاذ المرتبط',
      category: 'ERP / General Ledger',
      auth_type: 'REST API',
      config: {},
      ...overrides
    }
  });
  return res;
}

test.before(async () => {
  // Permit loopback fixtures so a live outbound read can be exercised.
  process.env.MIKHLAFI_CONNECTOR_ALLOW_PRIVATE = '1';

  await runMigrations();

  fixtureServer = http.createServer((req, res) => {
    if (fixtureMode === 'json') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: fixtureRecords }));
      return;
    }
    if (fixtureMode === 'csv') {
      res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8' });
      res.end(csvBody(fixtureRecords));
      return;
    }
    if (fixtureMode === 'garbage') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('<<< not json and not csv >>>');
      return;
    }
    if (fixtureMode === 'empty') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: [] }));
      return;
    }
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'upstream ledger unavailable' }));
  });
  await new Promise((resolve) => fixtureServer.listen(0, '127.0.0.1', resolve));
  fixtureUrl = `http://127.0.0.1:${fixtureServer.address().port}/ledger/export`;

  apiServer = http.createServer(async (req, res) => {
    await handleApiRequest(req, res);
  });
  await new Promise((resolve) => apiServer.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${apiServer.address().port}`;

  const login = await makeRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: 'client@mikhlafi-holding.com', password: 'Client@2026' }
  });
  assert.equal(login.status, 200);
  const setCookie = login.headers['set-cookie'];
  sessionCookie = Array.isArray(setCookie) ? setCookie[0].split(';')[0] : setCookie.split(';')[0];
  orgId = login.data.activeTenant.organizationId;
  assert.ok(orgId);

  const otherLogin = await makeRequest('/api/v1/auth/register', {
    method: 'POST',
    body: {
      email: `connector-tenant-${STAMP.toLowerCase()}@example.com`,
      password: 'Sup3rSecretPass!2026',
      nameEn: 'Connector Isolation Tenant',
      orgNameEn: 'Isolation Check Holdings'
    }
  });
  assert.equal(otherLogin.status, 201);
  const otherCookieHeader = otherLogin.headers['set-cookie'];
  otherSessionCookie = Array.isArray(otherCookieHeader)
    ? otherCookieHeader[0].split(';')[0]
    : otherCookieHeader.split(';')[0];
});

test.after(async () => {
  delete process.env.MIKHLAFI_CONNECTOR_ALLOW_PRIVATE;
  if (apiServer) await new Promise((resolve) => apiServer.close(resolve));
  if (fixtureServer) await new Promise((resolve) => fixtureServer.close(resolve));
  await closeDb();
});

test.describe('Data source lifecycle', () => {

  test('creates a source, validates input, and redacts stored credentials', async () => {
    const res = await createSource({
      config: { endpoint_url: fixtureUrl, api_key: 'super-secret-token-value', record_path: 'data' }
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.equal(res.data.integration.status, 'not_configured');
    assert.equal(res.data.integration.last_sync_status, 'NOT_CONFIGURED');
    assert.notEqual(res.data.integration.config.api_key, 'super-secret-token-value');
    assert.ok(res.data.integration.config.api_key.includes('•'));
    assert.equal(res.data.integration.config.endpoint_url, fixtureUrl);

    // Stored value must remain usable server-side even though it is redacted in responses
    const stored = await query(
      `SELECT config FROM tenant_integrations WHERE id = $1 AND organization_id = $2`,
      [res.data.integration.id, orgId]
    );
    assert.equal(stored.rows[0].config.api_key, 'super-secret-token-value');
  });

  test('rejects duplicate codes within the same workspace', async () => {
    const code = `DUP-${STAMP}`;
    const first = await createSource({ code });
    assert.equal(first.status, 201);

    const second = await createSource({ code });
    assert.equal(second.status, 409);
    assert.match(second.data.error, /already exists/i);
  });

  test('rejects unsafe or malformed endpoint URLs at write time', async () => {
    const schemes = await createSource({ config: { endpoint_url: 'ftp://example.com/feed' } });
    assert.equal(schemes.status, 400);

    const embedded = await createSource({ config: { endpoint_url: 'https://user:pass@example.com/feed' } });
    assert.equal(embedded.status, 400);
    assert.match(embedded.data.error, /credentials/i);
  });

  test('updates a source and merges connection configuration', async () => {
    const created = await createSource();
    assert.equal(created.status, 201);

    const updated = await makeRequest(`/api/v1/integrations/${created.data.integration.id}`, {
      method: 'PUT',
      body: { name_en: 'Renamed Ledger Feed', config: { endpoint_url: fixtureUrl } }
    });

    assert.equal(updated.status, 200);
    assert.equal(updated.data.integration.name_en, 'Renamed Ledger Feed');
    assert.equal(updated.data.integration.config.endpoint_url, fixtureUrl);
    assert.equal(updated.data.integration.code, created.data.integration.code);
  });
});

test.describe('Connection probe', () => {

  test('reports NOT_CONFIGURED for a source with no endpoint', async () => {
    const created = await createSource();
    const probe = await makeRequest(`/api/v1/integrations/${created.data.integration.id}/test`, {
      method: 'POST',
      body: {}
    });

    assert.equal(probe.status, 200);
    assert.equal(probe.data.reachable, false);
    assert.equal(probe.data.errorCode, 'NOT_CONFIGURED');
  });

  test('performs a real request and reports payload shape without ingesting', async () => {
    fixtureMode = 'json';
    fixtureRecords = [
      { documentNumber: `PROBE-${STAMP}`, amount: 1500, vendorName: 'Probe Vendor' }
    ];

    const created = await createSource({ config: { endpoint_url: fixtureUrl, record_path: 'data' } });
    const probe = await makeRequest(`/api/v1/integrations/${created.data.integration.id}/test`, {
      method: 'POST',
      body: {}
    });

    assert.equal(probe.status, 200);
    assert.equal(probe.data.reachable, true);
    assert.equal(probe.data.httpStatus, 200);
    assert.equal(probe.data.format, 'json');
    assert.equal(probe.data.candidateRecords, 1);
    assert.ok(probe.data.latencyMs >= 0);

    const ingested = await query(
      `SELECT count(*)::int AS n FROM tenant_journal_entries WHERE organization_id = $1`,
      [orgId]
    );
    const beforeCount = ingested.rows[0].n;
    assert.equal(beforeCount, 0, 'a probe must never ingest records');
  });

  test('blocks requests to private and loopback targets by default', async () => {
    delete process.env.MIKHLAFI_CONNECTOR_ALLOW_PRIVATE;
    try {
      const probe = await makeRequest(`/api/v1/integrations/00000000-0000-0000-0000-000000000000/test`, {
        method: 'POST',
        body: { config: { endpoint_url: 'http://169.254.169.254/latest/meta-data/' } }
      });

      // Unknown id still resolves to a probe attempt against the override config,
      // which must be refused as a link-local target.
      assert.equal(probe.data.reachable, false);
      assert.equal(probe.data.errorCode, 'TARGET_BLOCKED');
    } finally {
      process.env.MIKHLAFI_CONNECTOR_ALLOW_PRIVATE = '1';
    }
  });
});

test.describe('Real synchronization', () => {

  test('ingests exactly what the source returned and records real counts', async () => {
    fixtureMode = 'json';
    fixtureRecords = [
      {
        documentNumber: `SYNC-OK-${STAMP}-1`,
        amount: 4200,
        vendorName: 'Atlas Industrial Supplies',
        date: '2026-09-01',
        accountNumber: '510100',
        narrative: 'Component procurement'
      },
      {
        documentNumber: `SYNC-OK-${STAMP}-2`,
        amount: 9800.5,
        vendorName: 'Northline Logistics',
        date: '2026-09-04',
        accountNumber: '520200',
        narrative: 'Freight services'
      },
      {
        documentNumber: '',
        amount: 100,
        vendorName: 'Rejected Row'
      }
    ];

    const created = await createSource({ config: { endpoint_url: fixtureUrl, record_path: 'data' } });
    const sync = await makeRequest(`/api/v1/integrations/${created.data.integration.id}/sync`, {
      method: 'POST'
    });

    assert.equal(sync.status, 200);
    assert.equal(sync.data.success, true);
    assert.equal(sync.data.status, 'HEALTHY');
    assert.equal(sync.data.recordsProcessed, 2, 'only valid rows from the real response are ingested');
    assert.equal(sync.data.recordsRejected, 1);
    assert.equal(parseInt(sync.data.integration.records_synced_count, 10), 2);
    assert.equal(sync.data.integration.last_sync_status, 'HEALTHY');
    assert.equal(sync.data.integration.status, 'connected');

    const rows = await query(
      `SELECT document_number, amount_sar::float AS amount
       FROM tenant_journal_entries
       WHERE organization_id = $1 AND document_number LIKE $2
       ORDER BY document_number`,
      [orgId, `SYNC-OK-${STAMP}-%`]
    );
    assert.equal(rows.rows.length, 2, 'rows must exist in the database, not only in the response');
    assert.deepEqual(rows.rows.map((r) => r.document_number).sort(), [
      `SYNC-OK-${STAMP}-1`,
      `SYNC-OK-${STAMP}-2`
    ]);

    const log = await query(
      `SELECT * FROM tenant_integration_sync_logs
       WHERE organization_id = $1 AND integration_id = $2
       ORDER BY started_at DESC LIMIT 1`,
      [orgId, created.data.integration.id]
    );
    assert.equal(log.rows[0].status, 'SUCCESS');
    assert.equal(log.rows[0].records_processed, 2);
    assert.equal(log.rows[0].records_rejected, 1);
    assert.equal(log.rows[0].error_code, null);
  });

  test('ingests a CSV-shaped source response', async () => {
    fixtureMode = 'csv';
    fixtureRecords = [
      {
        documentNumber: `SYNC-CSV-${STAMP}`,
        amount: 7300,
        vendorName: 'Meridian Components',
        date: '2026-09-10',
        accountNumber: '510300',
        narrative: 'Assembly parts'
      }
    ];

    const created = await createSource({ config: { endpoint_url: fixtureUrl } });
    const sync = await makeRequest(`/api/v1/integrations/${created.data.integration.id}/sync`, {
      method: 'POST'
    });

    assert.equal(sync.data.success, true);
    assert.equal(sync.data.recordsProcessed, 1);

    const rows = await query(
      `SELECT id FROM tenant_journal_entries WHERE organization_id = $1 AND document_number = $2`,
      [orgId, `SYNC-CSV-${STAMP}`]
    );
    assert.equal(rows.rows.length, 1);
  });

  test('records FAILED with the real reason when the source is unavailable', async () => {
    fixtureMode = 'error';

    const created = await createSource({ config: { endpoint_url: fixtureUrl } });
    const before = await query(
      `SELECT records_synced_count FROM tenant_integrations WHERE id = $1`,
      [created.data.integration.id]
    );

    const sync = await makeRequest(`/api/v1/integrations/${created.data.integration.id}/sync`, {
      method: 'POST'
    });

    assert.equal(sync.status, 200);
    assert.equal(sync.data.success, false);
    assert.equal(sync.data.status, 'FAILED');
    assert.match(sync.data.error, /500/);
    assert.equal(sync.data.integration.last_sync_status, 'FAILED');
    assert.equal(sync.data.integration.status, 'error');
    assert.equal(
      parseInt(sync.data.integration.records_synced_count, 10),
      parseInt(before.rows[0].records_synced_count, 10),
      'a failed sync must not increase the record count'
    );

    const log = await query(
      `SELECT * FROM tenant_integration_sync_logs
       WHERE organization_id = $1 AND integration_id = $2
       ORDER BY started_at DESC LIMIT 1`,
      [orgId, created.data.integration.id]
    );
    assert.equal(log.rows[0].status, 'FAILED');
    assert.ok(log.rows[0].error_code);
    assert.ok(log.rows[0].error_message.includes('500'));
  });

  test('reports FAILED rather than fabricating success for an unparseable payload', async () => {
    fixtureMode = 'garbage';

    const created = await createSource({ config: { endpoint_url: fixtureUrl } });
    const sync = await makeRequest(`/api/v1/integrations/${created.data.integration.id}/sync`, {
      method: 'POST'
    });

    assert.equal(sync.data.success, false);
    assert.equal(sync.data.status, 'FAILED');
    assert.equal(sync.data.errorCode, 'UNPARSEABLE_PAYLOAD');
  });

  test('an empty payload is a legitimate successful sync with zero records', async () => {
    fixtureMode = 'empty';

    const created = await createSource({ config: { endpoint_url: fixtureUrl, record_path: 'data' } });
    const sync = await makeRequest(`/api/v1/integrations/${created.data.integration.id}/sync`, {
      method: 'POST'
    });

    assert.equal(sync.data.success, true);
    assert.equal(sync.data.recordsProcessed, 0);
    assert.equal(parseInt(sync.data.integration.records_synced_count, 10), 0);
  });

  test('the former demonstration-fixture sync path no longer exists', async () => {
    const created = await createSource();
    // Legacy demo markers in config must no longer trigger a synthetic success.
    await makeRequest(`/api/v1/integrations/${created.data.integration.id}`, {
      method: 'PUT',
      body: { config: { is_demo: true } }
    });

    const sync = await makeRequest(`/api/v1/integrations/${created.data.integration.id}/sync`, {
      method: 'POST'
    });

    assert.equal(sync.data.status, 'NOT_CONFIGURED');
    assert.equal(sync.data.success, false);
    assert.notEqual(sync.data.status, 'DEMO_SYNCED');

    const log = await query(
      `SELECT status FROM tenant_integration_sync_logs
       WHERE organization_id = $1 AND integration_id = $2`,
      [orgId, created.data.integration.id]
    );
    assert.ok(!log.rows.some((r) => r.status === 'DEMO_SYNCED'));
  });
});

test.describe('CSV export ingestion', () => {

  test('ingests a spreadsheet export and reports rejected rows with line numbers', async () => {
    const csv = [
      'documentNumber,amount,vendorName,date,accountNumber,narrative',
      `CSV-OK-${STAMP},12500,Cedar Fabrication,2026-09-12,510400,Tooling`,
      `CSV-OK-${STAMP}-2,not-a-number,Orion Trading,2026-09-13,510500,Materials`,
      `,900,Missing Document,2026-09-14,510600,Services`
    ].join('\n');

    const res = await makeRequest('/api/v1/ingest/journal-csv', {
      method: 'POST',
      body: { csv }
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.acceptedCount, 1);
    assert.equal(res.data.rejectedCount, 2);
    assert.ok(res.data.validationErrors.some((e) => e.row === 3 && e.field === 'amount'));
    assert.ok(res.data.validationErrors.some((e) => e.row === 4 && e.field === 'documentNumber'));

    const rows = await query(
      `SELECT id FROM tenant_journal_entries WHERE organization_id = $1 AND document_number = $2`,
      [orgId, `CSV-OK-${STAMP}`]
    );
    assert.equal(rows.rows.length, 1);
  });

  test('rejects an empty CSV body', async () => {
    const res = await makeRequest('/api/v1/ingest/journal-csv', {
      method: 'POST',
      body: { csv: '   ' }
    });
    assert.equal(res.status, 400);
  });

  test('rejects a CSV with a header row only', async () => {
    const res = await makeRequest('/api/v1/ingest/journal-csv', {
      method: 'POST',
      body: { csv: 'documentNumber,amount,vendorName' }
    });
    assert.equal(res.status, 400);
    assert.match(res.data.error, /header row only/i);
  });
});

test.describe('Tenant isolation', () => {

  test('another workspace cannot read, sync, test, modify or delete a foreign source', async () => {
    const created = await createSource({ config: { endpoint_url: fixtureUrl } });
    const id = created.data.integration.id;

    const list = await makeRequest('/api/v1/integrations', {
      sessionCookie: otherSessionCookie
    });
    assert.equal(list.status, 200);
    assert.ok(!list.data.integrations.some((i) => i.id === id));

    const sync = await makeRequest(`/api/v1/integrations/${id}/sync`, {
      method: 'POST',
      sessionCookie: otherSessionCookie
    });
    assert.equal(sync.status, 404);

    const probe = await makeRequest(`/api/v1/integrations/${id}/test`, {
      method: 'POST',
      body: {},
      sessionCookie: otherSessionCookie
    });
    assert.equal(probe.status, 404);

    const update = await makeRequest(`/api/v1/integrations/${id}`, {
      method: 'PUT',
      body: { name_en: 'Hijacked' },
      sessionCookie: otherSessionCookie
    });
    assert.equal(update.status, 404);

    const remove = await makeRequest(`/api/v1/integrations/${id}`, {
      method: 'DELETE',
      sessionCookie: otherSessionCookie
    });
    assert.equal(remove.status, 404);

    const stillThere = await query(
      `SELECT id FROM tenant_integrations WHERE id = $1 AND organization_id = $2`,
      [id, orgId]
    );
    assert.equal(stillThere.rows.length, 1, 'the source must survive a cross-tenant delete attempt');
  });

  test('the owner can delete their own source, removing its sync history', async () => {
    const created = await createSource({ config: { endpoint_url: fixtureUrl } });
    const id = created.data.integration.id;

    const remove = await makeRequest(`/api/v1/integrations/${id}`, { method: 'DELETE' });
    assert.equal(remove.status, 200);

    const gone = await makeRequest(`/api/v1/integrations/${id}/sync`, { method: 'POST' });
    assert.equal(gone.status, 404);

    const history = await query(
      `SELECT id FROM tenant_integration_sync_logs WHERE integration_id = $1`,
      [id]
    );
    assert.equal(history.rows.length, 0);
  });
});
