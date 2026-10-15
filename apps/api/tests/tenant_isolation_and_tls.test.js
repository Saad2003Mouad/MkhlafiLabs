// MIKHLAFI LABS — Tenant Identity Collision, Storage Containment & TLS Hardening Suite
// Validates Priority 6 & Priority 7

import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCanonicalTenantId, tenantManager } from '../src/db/tenantManager.js';
import { getPostgresSslConfig } from '../src/db/connection.js';

test.describe('Priority 6: Tenant Identity Validation & Collision Prevention', () => {
  test('1. Validates canonical UUID tenant identifiers successfully', () => {
    const validUuid = 'c0000000-0000-0000-0000-000000000002';
    const result = validateCanonicalTenantId(validUuid);
    assert.equal(result, validUuid);
  });

  test('2. Validates canonical kebab-case slug tenant identifiers successfully', () => {
    const validSlug = 'mikhlafi-group';
    const result = validateCanonicalTenantId(validSlug);
    assert.equal(result, validSlug);
  });

  test('3. REJECTS identity collision vectors with special characters instead of silent stripping', () => {
    // Previously, tenant#1 and tenant$1 would both be stripped to tenant1 causing identity collision
    assert.throws(
      () => validateCanonicalTenantId('tenant#1'),
      /Silent character stripping is prohibited to prevent tenant collisions/
    );

    assert.throws(
      () => validateCanonicalTenantId('tenant$1'),
      /Silent character stripping is prohibited to prevent tenant collisions/
    );

    assert.throws(
      () => validateCanonicalTenantId('tenant@domain.com'),
      /Silent character stripping is prohibited/
    );
  });

  test('4. REJECTS directory traversal attacks in tenant identifiers', () => {
    assert.throws(
      () => validateCanonicalTenantId('../etc/passwd'),
      /Invalid tenant identifier/
    );

    assert.throws(
      () => validateCanonicalTenantId('..\\windows\\system32'),
      /Invalid tenant identifier/
    );
  });

  test('5. Enforces storage path containment strictly', () => {
    const validPath = tenantManager.getTenantStoragePath('c0000000-0000-0000-0000-000000000002', 'uploads');
    assert.ok(validPath.includes('c0000000-0000-0000-0000-000000000002'));
    assert.ok(validPath.endsWith('uploads'));
  });

  test('6. Fails closed when required production tenant database credentials are missing', async () => {
    const oldEnv = process.env.NODE_ENV;
    const oldPools = process.env.ENABLE_PER_TENANT_POSTGRES_POOLS;
    const oldEmbedded = process.env.USE_EMBEDDED_PG;

    try {
      process.env.NODE_ENV = 'production';
      process.env.ENABLE_PER_TENANT_POSTGRES_POOLS = 'true';
      delete process.env.USE_EMBEDDED_PG;

      await assert.rejects(
        () => tenantManager.getTenantDb('unconfigured-tenant-corp'),
        /Dedicated database credentials required for tenant "unconfigured-tenant-corp"/
      );
    } finally {
      process.env.NODE_ENV = oldEnv;
      process.env.ENABLE_PER_TENANT_POSTGRES_POOLS = oldPools;
      if (oldEmbedded) process.env.USE_EMBEDDED_PG = oldEmbedded;
    }
  });
});

test.describe('Priority 7: PostgreSQL TLS and Production Security', () => {
  test('1. Insecure TLS (rejectUnauthorized: false) is strictly rejected in production', () => {
    const oldEnv = process.env.NODE_ENV;
    const oldSsl = process.env.DATABASE_SSL;
    const oldAllow = process.env.ALLOW_INSECURE_TLS;

    try {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_SSL = 'true';
      process.env.ALLOW_INSECURE_TLS = 'true';

      assert.throws(
        () => getPostgresSslConfig(),
        /Insecure TLS \(rejectUnauthorized: false\) is strictly prohibited in production/
      );
    } finally {
      process.env.NODE_ENV = oldEnv;
      process.env.DATABASE_SSL = oldSsl;
      process.env.ALLOW_INSECURE_TLS = oldAllow;
    }
  });

  test('2. Production TLS requires and enforces rejectUnauthorized: true by default', () => {
    const oldEnv = process.env.NODE_ENV;
    const oldSsl = process.env.DATABASE_SSL;
    const oldAllow = process.env.ALLOW_INSECURE_TLS;

    try {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_SSL = 'true';
      delete process.env.ALLOW_INSECURE_TLS;

      const ssl = getPostgresSslConfig();
      assert.equal(ssl.rejectUnauthorized, true);
    } finally {
      process.env.NODE_ENV = oldEnv;
      process.env.DATABASE_SSL = oldSsl;
      process.env.ALLOW_INSECURE_TLS = oldAllow;
    }
  });

  test('3. Non-SSL mode returns false cleanly', () => {
    const oldSsl = process.env.DATABASE_SSL;
    try {
      delete process.env.DATABASE_SSL;
      const ssl = getPostgresSslConfig();
      assert.equal(ssl, false);
    } finally {
      process.env.DATABASE_SSL = oldSsl;
    }
  });
});
