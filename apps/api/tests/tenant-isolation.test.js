// MIKHLAFI LABS — Strict Multi-Tenant Isolation & RBAC Security Test Suite
// Verifies complete cross-tenant isolation, IDOR prevention, header spoofing rejection, and role-based permissions

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { runMigrations, closeDb, query } from '../src/db/connection.js';
import { handleApiRequest } from '../src/server.js';

let server;

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
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
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

describe('Strict Tenant Isolation & Security Boundary Tests', () => {
  before(async () => {
    await runMigrations();
    server = http.createServer(handleApiRequest);
    await new Promise(res => server.listen(0, '127.0.0.1', res));
  });

  after(async () => {
    await new Promise(res => server.close(res));
    await closeDb();
  });

  let userAlphaCookie = '';
  let orgAlphaId = '';
  let alphaDecisionId = '';

  let userBetaCookie = '';
  let orgBetaId = '';
  let betaDecisionId = '';

  let userViewerCookie = '';

  it('Setup: Register Organization Alpha with User Alpha (Owner)', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: `alpha-owner-${Date.now()}@alpha-corp.com`,
      password: 'AlphaPassword123!',
      nameEn: 'Sulaiman Al-Alpha',
      orgNameEn: 'Alpha Industrial Conglomerate'
    });

    assert.equal(res.status, 201);
    orgAlphaId = res.data.organization.id;
    userAlphaCookie = res.headers['set-cookie'][0].split(';')[0];
    assert.ok(orgAlphaId);
  });

  it('Setup: User Alpha creates a confidential decision in Organization Alpha', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/records/decisions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': userAlphaCookie
      }
    }, {
      title: 'CONFIDENTIAL: Alpha Group SAR 5.2M Cement Procurement Hedging',
      category: 'Procurement',
      impactAmount: 5200000.00,
      riskLevel: 'CRITICAL'
    });

    assert.equal(res.status, 201);
    alphaDecisionId = res.data.decision.id;
    assert.equal(res.data.decision.organization_id, orgAlphaId);
    assert.ok(alphaDecisionId);
  });

  it('Setup: Register Organization Beta with User Beta (Owner)', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: `beta-owner-${Date.now()}@beta-holdings.com`,
      password: 'BetaPassword123!',
      nameEn: 'Bader Al-Beta',
      orgNameEn: 'Beta Logistics & Supply Co'
    });

    assert.equal(res.status, 201);
    orgBetaId = res.data.organization.id;
    userBetaCookie = res.headers['set-cookie'][0].split(';')[0];
    assert.ok(orgBetaId);
    assert.notEqual(orgAlphaId, orgBetaId);
  });

  it('Setup: User Beta creates a decision in Organization Beta', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/records/decisions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': userBetaCookie
      }
    }, {
      title: 'Beta Fleet Route Optimization Savings',
      category: 'Supply Chain',
      impactAmount: 850000.00,
      riskLevel: 'HIGH'
    });

    assert.equal(res.status, 201);
    betaDecisionId = res.data.decision.id;
    assert.equal(res.data.decision.organization_id, orgBetaId);
  });

  // ── TENANT ISOLATION TESTS ────────────────────────────────────────────────

  it('1. User Beta listing decisions receives ONLY Beta records (Zero Alpha records leaked)', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/records/decisions',
      method: 'GET',
      headers: { 'Cookie': userBetaCookie }
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.organizationId, orgBetaId);

    // Verify all decisions returned belong strictly to orgBetaId
    res.data.decisions.forEach(decision => {
      assert.equal(decision.organization_id, orgBetaId);
      assert.notEqual(decision.id, alphaDecisionId);
      assert.ok(!decision.title.includes('Alpha Group'));
    });
  });

  it('2. IDOR Prevention: User Beta cannot access Alpha decision by direct ID (returns 404)', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: `/api/v1/records/decisions/${alphaDecisionId}`,
      method: 'GET',
      headers: { 'Cookie': userBetaCookie }
    });

    // Must return 404 so caller cannot discover that the ID exists in another tenant
    assert.equal(res.status, 404);
    assert.match(res.data.error, /not found/i);
  });

  it('3. Cross-Tenant Mutation Prevention: User Beta cannot execute Alpha decision (returns 404)', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: `/api/v1/records/decisions/${alphaDecisionId}/execute`,
      method: 'POST',
      headers: { 'Cookie': userBetaCookie }
    });

    assert.equal(res.status, 404);

    // Verify in database that Alpha decision was NOT executed
    const checkDb = await query('SELECT status FROM tenant_decisions WHERE id = $1', [alphaDecisionId]);
    assert.equal(checkDb.rows[0].status, 'PENDING');
  });

  it('4. Header Spoofing Prevention: User Beta passing X-Organization-Id: orgAlphaId is rejected with 403', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/records/decisions',
      method: 'GET',
      headers: {
        'Cookie': userBetaCookie,
        'X-Organization-Id': orgAlphaId // Malicious attempt to spoof tenant context!
      }
    });

    assert.equal(res.status, 403);
    assert.match(res.data.error, /do not have an active membership in the requested organization/i);
  });

  it('5. Branch Isolation: User Beta cannot view Organization Alpha branches', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/branches',
      method: 'GET',
      headers: { 'Cookie': userBetaCookie }
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.organizationId, orgBetaId);
    res.data.branches.forEach(b => {
      assert.notEqual(b.organization_id, orgAlphaId);
    });
  });

  it('6. Membership Isolation: User Beta cannot view Organization Alpha members', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/organizations/members',
      method: 'GET',
      headers: { 'Cookie': userBetaCookie }
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.organizationId, orgBetaId);
    res.data.members.forEach(m => {
      assert.notEqual(m.email, 'alpha-owner@alpha-corp.com');
    });
  });

  // ── RBAC TESTS ────────────────────────────────────────────────────────────

  it('7. Owner can invite an auditor with role "viewer" to Organization Alpha', async () => {
    const viewerEmail = `auditor-${Date.now()}@audit-firm.com`;
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/organizations/members',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': userAlphaCookie
      }
    }, {
      email: viewerEmail,
      role: 'viewer'
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.equal(res.data.membership.role, 'viewer');

    // Login as viewer to obtain cookie
    const loginRes = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: viewerEmail,
      password: 'MikhlafiTemp2026!'
    });

    assert.equal(loginRes.status, 200);
    userViewerCookie = loginRes.headers['set-cookie'][0].split(';')[0];
  });

  it('8. Role "viewer" CANNOT invite members (403 Forbidden)', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/organizations/members',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': userViewerCookie
      }
    }, {
      email: 'unauthorized-invite@test.com',
      role: 'viewer'
    });

    assert.equal(res.status, 403);
    assert.match(res.data.error, /Insufficient permissions/i);
  });

  it('9. Role "viewer" CANNOT execute mitigation decisions (403 Forbidden)', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: `/api/v1/records/decisions/${alphaDecisionId}/execute`,
      method: 'POST',
      headers: { 'Cookie': userViewerCookie }
    });

    assert.equal(res.status, 403);
    assert.match(res.data.error, /Insufficient permissions to execute decisions/i);
  });

  it('10. Role "org_owner" CAN execute mitigation decisions', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: `/api/v1/records/decisions/${alphaDecisionId}/execute`,
      method: 'POST',
      headers: { 'Cookie': userAlphaCookie }
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.decision.status, 'EXECUTED');
  });

  it('11. Dashboard summary returns only tenant-scoped metrics for each organization', async () => {
    // Check Alpha dashboard summary
    const alphaSummary = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/dashboard/summary',
      method: 'GET',
      headers: { 'Cookie': userAlphaCookie }
    });
    assert.equal(alphaSummary.status, 200);
    assert.equal(alphaSummary.data.organization.id, orgAlphaId);
    assert.ok(alphaSummary.data.kpis.executedDecisionsCount >= 1);

    // Check Beta dashboard summary
    const betaSummary = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/dashboard/summary',
      method: 'GET',
      headers: { 'Cookie': userBetaCookie }
    });
    assert.equal(betaSummary.status, 200);
    assert.equal(betaSummary.data.organization.id, orgBetaId);
    assert.equal(betaSummary.data.kpis.executedDecisionsCount, 0); // Beta has not executed any decisions
  });
});
