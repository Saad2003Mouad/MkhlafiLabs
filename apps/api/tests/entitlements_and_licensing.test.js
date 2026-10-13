// MIKHLAFI LABS — Entitlements, Offline Licensing & Billing Test Suite (Phase 3)
// Validates server-side tier capability gating, cryptographic offline license verification, and operator payment confirmation

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { handleApiRequest } from '../src/server.js';
import { runMigrations, query, transaction } from '../src/db/connection.js';
import { licenseManager } from '../src/services/billing/licenseManager.js';
import { hashPassword } from '../src/auth/passwords.js';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = data;
        try { parsed = JSON.parse(data); } catch (_) {}
        resolve({ status: res.statusCode, headers: res.headers, data: parsed });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

describe('Phase 3: Entitlements, Licensing & Billing Verification', () => {
  let server;
  let port;
  let starterUserCookie;
  let starterOrgId;
  let operatorCookie;

  before(async () => {
    await runMigrations();
    server = http.createServer((req, res) => handleApiRequest(req, res));
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        resolve();
      });
    });

    // 1. Create a tenant on 'plan_starter' (Starter Tier has: financial-intelligence, executive-decisions, data-quality)
    const starterEmail = `starter-${Date.now()}@startercorp.sa`;
    const regRes = await request({
      hostname: '127.0.0.1',
      port,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: starterEmail,
      password: 'StarterPass2026!',
      nameEn: 'Starter Founder',
      orgNameEn: `Starter Corp ${Date.now()}`
    });

    starterUserCookie = regRes.headers['set-cookie'][0].split(';')[0];
    starterOrgId = regRes.data.organization.id;

    // Downgrade this organization subscription to 'plan_starter' explicitly in DB
    await query(
      `UPDATE organization_subscriptions SET package_id = 'plan_starter' WHERE organization_id = $1`,
      [starterOrgId]
    );

    // 2. Create Platform Operator User
    const opEmail = `operator-bill-${Date.now()}@mikhlafi-labs.com`;
    const opHash = await hashPassword('OperatorSec2026!');
    const opUser = await query(
      `INSERT INTO users (email, password_hash, name_en, name_ar, is_platform_admin, is_verified, status)
       VALUES ($1, $2, 'Operator Billing', 'مشغل النظام', true, true, 'active')
       RETURNING id`,
      [opEmail, opHash]
    );

    const opLoginRes = await request({
      hostname: '127.0.0.1',
      port,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: opEmail,
      password: 'OperatorSec2026!'
    });

    operatorCookie = opLoginRes.headers['set-cookie'][0].split(';')[0];
  });

  after(() => {
    if (server) server.close();
  });

  it('1. Starter tier tenant can access licensed capabilities (Financial Leaks & Decisions)', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port,
      path: '/api/v1/records/financial-leaks',
      method: 'GET',
      headers: { 'Cookie': starterUserCookie }
    });

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.anomalies));
  });

  it('2. Starter tier tenant is denied access to unauthorized tier services (Risk & AI Assistant: 403 Forbidden)', async () => {
    // Attempt to access Risk Intelligence (requires plan_pro or higher)
    const riskRes = await request({
      hostname: '127.0.0.1',
      port,
      path: '/api/v1/records/risks',
      method: 'GET',
      headers: { 'Cookie': starterUserCookie }
    });

    assert.equal(riskRes.status, 403);
    assert.match(riskRes.data.error, /Risk Intelligence is not enabled/);

    // Attempt to access AI Business Assistant (requires enterprise)
    const aiRes = await request({
      hostname: '127.0.0.1',
      port,
      path: '/api/v1/assistant/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': starterUserCookie
      }
    }, { query: 'ما هي مؤشرات التسرب؟' });

    assert.equal(aiRes.status, 403);
    assert.match(aiRes.data.error, /AI Business Assistant is not enabled/);
  });

  it('3. Cryptographic Offline License issues valid HMAC signature and verifies correctly', () => {
    const signed = licenseManager.generateSignedLicense({
      customerSlug: 'aram-logistics',
      customerName: 'Aram Logistics Co.',
      edition: 'PRIVATE_EDITION',
      tier: 'enterprise',
      licensedCapabilities: [
        'financial-intelligence',
        'executive-decisions',
        'risk-intelligence'
      ]
    });

    assert.ok(signed.signature);
    assert.equal(signed.customerSlug, 'aram-logistics');

    // Verification succeeds
    const check = licenseManager.verifyOfflineLicense(signed);
    assert.equal(check.valid, true);
    assert.equal(check.expired, false);
    assert.equal(check.isMaintenanceActive, true);
  });

  it('4. Tampered offline license is detected and rejected with signature mismatch', () => {
    const signed = licenseManager.generateSignedLicense({
      customerSlug: 'saudi-acme',
      customerName: 'Saudi Acme Corp',
      tier: 'starter'
    });

    // Malicious customer alters tier to 'sovereign' without valid key
    const tampered = { ...signed, tier: 'sovereign' };
    const check = licenseManager.verifyOfflineLicense(tampered);

    assert.equal(check.valid, false);
    assert.match(check.error, /signature mismatch/i);
  });

  it('5. Expired offline license returns valid=false with expired=true status', () => {
    const expired = licenseManager.generateSignedLicense({
      customerSlug: 'past-corp',
      customerName: 'Past Corp',
      expiresAt: '2020-01-01T00:00:00Z'
    });

    const check = licenseManager.verifyOfflineLicense(expired);
    assert.equal(check.valid, false);
    assert.equal(check.expired, true);
    assert.match(check.error, /License expired/i);
  });

  it('6. Platform Operator confirms manual bank wire payment and extends subscription', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port,
      path: `/api/v1/admin/organizations/${starterOrgId}/confirm-payment`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': operatorCookie
      }
    }, {
      amount: 45000.00,
      referenceNumber: 'WIRE-SNB-2026-9901',
      notes: 'Annual Pro Suite Enterprise Wire Confirmed'
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.subscription.status, 'active');
    assert.ok(res.data.subscription.current_period_end);
  });
});
