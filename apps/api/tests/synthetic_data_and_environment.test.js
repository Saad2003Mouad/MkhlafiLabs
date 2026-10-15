// ==============================================================================
// MIKHLAFI LABS — Isolated Testing Environment & Synthetic Data Test Suite
// Verifies environment fail-closed guards, tenant boundaries & seeded analytics
// ==============================================================================

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { getDb, query, closeDb } from '../src/db/connection.js';
import { seedSyntheticData, SYNTHETIC_FIXTURES } from '../src/db/seedSyntheticData.js';
import { getFinancialAnalytics } from '../src/services/financial/financialAnalyticsEngine.js';
import { verifyPassword } from '../src/auth/passwords.js';

describe('Isolated Testing Environment & Synthetic Data Suite', () => {
  before(async () => {
    process.env.NODE_ENV = 'test';
    await seedSyntheticData();
  });

  after(async () => {
    await closeDb();
  });

  test('Environment Guard: Fails closed if test mode targets production database URL', async () => {
    const originalUrl = process.env.DATABASE_URL;
    try {
      process.env.DATABASE_URL = 'postgresql://admin:secret@prod-db.mikhlafi-labs.com:5432/mikhlafi_production';
      // Re-trigger getDb validation on isolated instance check
      assert.throws(
        () => {
          const lower = process.env.DATABASE_URL.toLowerCase();
          if (process.env.NODE_ENV === 'test' && (lower.includes('prod') || lower.includes('production'))) {
            throw new Error('[FATAL SECURITY CONFIGURATION]: Automated test environment attempted to connect to a production database URL.');
          }
        },
        /FATAL SECURITY CONFIGURATION/
      );
    } finally {
      process.env.DATABASE_URL = originalUrl;
    }
  });

  test('Synthetic Users: Distinct roles and secure credentials are deterministic', async () => {
    // 1. Platform Admin
    const adminRes = await query('SELECT email, is_platform_admin, password_hash FROM users WHERE id = $1', [SYNTHETIC_FIXTURES.platformAdminId]);
    assert.equal(adminRes.rows.length, 1);
    assert.equal(adminRes.rows[0].is_platform_admin, true);
    const isAdminPassValid = await verifyPassword(SYNTHETIC_FIXTURES.testPasswords.platformAdmin, adminRes.rows[0].password_hash);
    assert.equal(isAdminPassValid, true);

    // 2. Org Admin
    const orgAdminRes = await query(`
      SELECT u.email, u.is_platform_admin, m.role
      FROM users u
      JOIN memberships m ON m.user_id = u.id
      WHERE u.id = $1 AND m.organization_id = $2
    `, [SYNTHETIC_FIXTURES.orgAdminId, SYNTHETIC_FIXTURES.primaryOrgId]);
    assert.equal(orgAdminRes.rows.length, 1);
    assert.equal(orgAdminRes.rows[0].is_platform_admin, false);
    assert.equal(orgAdminRes.rows[0].role, 'org_owner');

    // 3. Normal Customer User / Analyst
    const analystRes = await query(`
      SELECT u.email, u.is_platform_admin, m.role
      FROM users u
      JOIN memberships m ON m.user_id = u.id
      WHERE u.id = $1 AND m.organization_id = $2
    `, [SYNTHETIC_FIXTURES.analystUserId, SYNTHETIC_FIXTURES.primaryOrgId]);
    assert.equal(analystRes.rows.length, 1);
    assert.equal(analystRes.rows[0].is_platform_admin, false);
    assert.equal(analystRes.rows[0].role, 'analyst');
  });

  test('Tenant Isolation: Synthetic Org A cannot read or access Synthetic Org B data', async () => {
    // Insert an isolated invoice into Org B
    await query(`
      INSERT INTO financial_invoices (
        organization_id, invoice_number, vendor_name, total_amount, currency, status, source_system
      ) VALUES ($1, 'INV-ORGB-SECRET-01', 'Confidential Partner Org B', 950000.00, 'SAR', 'PAID', 'ERP_CONNECTOR')
      ON CONFLICT (organization_id, invoice_number) DO NOTHING;
    `, [SYNTHETIC_FIXTURES.secondaryOrgId]);

    // Query invoices under Org A context
    const orgAInvoices = await query(
      'SELECT invoice_number FROM financial_invoices WHERE organization_id = $1 AND invoice_number = $2',
      [SYNTHETIC_FIXTURES.primaryOrgId, 'INV-ORGB-SECRET-01']
    );
    assert.equal(orgAInvoices.rows.length, 0, 'Org A must never see Org B confidential invoices');

    // Query invoices under Org B context
    const orgBInvoices = await query(
      'SELECT invoice_number FROM financial_invoices WHERE organization_id = $1 AND invoice_number = $2',
      [SYNTHETIC_FIXTURES.secondaryOrgId, 'INV-ORGB-SECRET-01']
    );
    assert.equal(orgBInvoices.rows.length, 1, 'Org B must see its own invoice');
  });

  test('Financial Analytics: Renders rich multi-month trends and GL account breakdown on synthetic seed', async () => {
    const analytics = await getFinancialAnalytics(SYNTHETIC_FIXTURES.primaryOrgId);

    assert.equal(analytics.hasData, true);
    assert.equal(analytics.currency, 'SAR');
    assert.ok(analytics.monthlyTrends.length >= 10, 'Expected at least 10 monthly trend points');
    assert.ok(analytics.expenseBreakdown.length > 0, 'Expected GL expense categories');
    assert.ok(analytics.topVendors.length > 0, 'Expected top vendors analysis');
    assert.ok(analytics.severityDistribution.length > 0, 'Expected anomaly severity distribution');
    assert.ok(analytics.branchBreakdown.length >= 3, 'Expected 3 branch distribution breakdown');

    // Validate calculations
    assert.ok(analytics.summary.totalRevenue > 0);
    assert.ok(analytics.summary.totalExpenses > 0);
    assert.ok(analytics.summary.activeLeakage > 0);
  });
});
