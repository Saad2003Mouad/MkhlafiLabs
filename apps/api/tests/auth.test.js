// MIKHLAFI LABS — Authentication & Session Automated Test Suite
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { runMigrations, closeDb, query } from '../src/db/connection.js';
import { handleApiRequest } from '../src/server.js';

let server;
let baseUrl;

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

describe('Authentication & Session Management Tests', () => {
  before(async () => {
    await runMigrations();
    server = http.createServer(handleApiRequest);
    await new Promise(res => server.listen(0, '127.0.0.1', res));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await new Promise(res => server.close(res));
    await closeDb();
  });

  const testEmail = `auth-test-${Date.now()}@mikhlafi-labs.com`;
  let sessionCookie = '';

  it('1. Rejects registration with missing required fields', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'incomplete@test.com' });

    assert.equal(res.status, 400);
    assert.match(res.data.error, /Missing required registration fields/i);
  });

  it('2. Successfully registers a new user, organization and returns session cookie', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testEmail,
      password: 'SecurePassword123!',
      nameEn: 'Tariq Al-Sabah',
      nameAr: 'طارق الصباح',
      orgNameEn: 'Al-Sabah Industrial Holding',
      orgNameAr: 'مجموعة الصباح الصناعية القابضة'
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.equal(res.data.user.email, testEmail);
    assert.equal(res.data.organization.name_en, 'Al-Sabah Industrial Holding');

    // Verify Set-Cookie header exists with HttpOnly
    const setCookie = res.headers['set-cookie'];
    assert.ok(setCookie);
    assert.match(setCookie[0], /ml_session=/);
    assert.match(setCookie[0], /HttpOnly/i);

    sessionCookie = setCookie[0].split(';')[0];
  });

  it('3. Rejects duplicate registration with the same email', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testEmail,
      password: 'AnotherPassword123!',
      nameEn: 'Duplicate User',
      orgNameEn: 'Duplicate Org'
    });

    assert.equal(res.status, 409);
    assert.match(res.data.error, /already exists/i);
  });

  it('4. Successfully verifies session via /api/v1/auth/me using HttpOnly cookie', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Cookie': sessionCookie }
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.user.email, testEmail);
    assert.equal(res.data.tenant.role, 'org_owner');
    assert.ok(res.data.tenant.permissions.includes('org:delete'));
    assert.ok(res.data.tenant.permissions.includes('member:invite'));
  });

  it('5. Rejects unauthenticated request without session cookie', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/auth/me',
      method: 'GET'
    });

    assert.equal(res.status, 401);
    assert.match(res.data.error, /Authentication required/i);
  });

  it('6. Successfully logs in with valid credentials and sets new session', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testEmail,
      password: 'SecurePassword123!'
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.user.email, testEmail);
    assert.ok(res.headers['set-cookie']);
  });

  it('7. Rejects login with invalid password', async () => {
    const res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testEmail,
      password: 'WrongPassword999!'
    });

    assert.equal(res.status, 401);
    assert.match(res.data.error, /Invalid email or password/i);
  });

  it('8. Logout revokes the session in database and clears the cookie', async () => {
    // 1. Logout
    const logoutRes = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/auth/logout',
      method: 'POST',
      headers: { 'Cookie': sessionCookie }
    });

    assert.equal(logoutRes.status, 200);
    assert.equal(logoutRes.data.success, true);
    assert.match(logoutRes.headers['set-cookie'][0], /Max-Age=0/i);

    // 2. Subsequent request using old cookie must be rejected (session revoked)
    const afterLogoutRes = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Cookie': sessionCookie }
    });

    assert.equal(afterLogoutRes.status, 401);
    assert.match(afterLogoutRes.data.error, /Invalid, revoked, or expired/i);
  });
});
