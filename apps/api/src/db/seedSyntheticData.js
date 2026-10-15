// ==============================================================================
// MIKHLAFI LABS — Deterministic Synthetic Data Seeder for Isolated Testing
// Creates fictional, clearly labeled organizations, users, invoices & anomalies
// Never uses or touches real customer data or production databases
// ==============================================================================

import { getDb, query, exec, runMigrations, closeDb } from './connection.js';
import { hashPassword } from '../auth/passwords.js';

export const SYNTHETIC_FIXTURES = {
  primaryOrgId: 'f0000000-0000-0000-0000-000000000001',
  secondaryOrgId: 'f0000000-0000-0000-0000-000000000002',
  platformAdminId: 'f1000000-0000-0000-0000-000000000001',
  orgAdminId: 'f1000000-0000-0000-0000-000000000002',
  analystUserId: 'f1000000-0000-0000-0000-000000000003',
  branchHqId: 'f2000000-0000-0000-0000-000000000001',
  branchJeddahId: 'f2000000-0000-0000-0000-000000000002',
  branchDammamId: 'f2000000-0000-0000-0000-000000000003',
  testPasswords: {
    platformAdmin: 'SyntheticPlatformAdminPass2026!',
    orgAdmin: 'SyntheticOrgAdminPass2026!',
    user: 'SyntheticUserPass2026!'
  }
};

export async function seedSyntheticData() {
  console.log('[Synthetic Seed] Applying database migrations...');
  await runMigrations();

  console.log('[Synthetic Seed] Creating synthetic organizations...');
  // 1. Primary Organization: Synthetic Horizon Industrial
  await query(`
    INSERT INTO organizations (
      id, slug, name_en, name_ar, default_currency, default_locale, timezone, status
    ) VALUES (
      $1, 'synthetic-horizon', '[SYNTHETIC] Horizon Industrial Trading Ltd.',
      '[بيانات افتراضية] شركة الأفق للصناعات والتجارة المحدودة',
      'SAR', 'ar', 'Asia/Riyadh', 'active'
    ) ON CONFLICT (id) DO UPDATE SET
      name_en = EXCLUDED.name_en,
      name_ar = EXCLUDED.name_ar;
  `, [SYNTHETIC_FIXTURES.primaryOrgId]);

  // 2. Secondary Organization for Tenant Isolation Boundary Testing
  await query(`
    INSERT INTO organizations (
      id, slug, name_en, name_ar, default_currency, default_locale, timezone, status
    ) VALUES (
      $1, 'synthetic-najd-logistics', '[SYNTHETIC] Najd Logistics Services',
      '[بيانات افتراضية] شركة نجد للخدمات اللوجستية',
      'SAR', 'ar', 'Asia/Riyadh', 'active'
    ) ON CONFLICT (id) DO UPDATE SET
      name_en = EXCLUDED.name_en,
      name_ar = EXCLUDED.name_ar;
  `, [SYNTHETIC_FIXTURES.secondaryOrgId]);

  console.log('[Synthetic Seed] Creating synthetic test users with distinct roles...');
  const adminHash = await hashPassword(SYNTHETIC_FIXTURES.testPasswords.platformAdmin);
  const orgAdminHash = await hashPassword(SYNTHETIC_FIXTURES.testPasswords.orgAdmin);
  const userHash = await hashPassword(SYNTHETIC_FIXTURES.testPasswords.user);

  // Platform Super Administrator
  await query(`
    INSERT INTO users (
      id, email, password_hash, name_en, name_ar, is_verified, is_platform_admin, status
    ) VALUES (
      $1, 'test.platform_admin@test.mikhlafi-labs.local', $2,
      'Synthetic Platform Admin', 'مسؤول المنصة التجريبي', true, true, 'active'
    ) ON CONFLICT (id) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      is_platform_admin = true;
  `, [SYNTHETIC_FIXTURES.platformAdminId, adminHash]);

  // Organization Administrator
  await query(`
    INSERT INTO users (
      id, email, password_hash, name_en, name_ar, is_verified, is_platform_admin, status
    ) VALUES (
      $1, 'test.org_admin@test.mikhlafi-labs.local', $2,
      'Synthetic Organization Admin', 'مسؤول المنشأة التجريبي', true, false, 'active'
    ) ON CONFLICT (id) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      is_platform_admin = false;
  `, [SYNTHETIC_FIXTURES.orgAdminId, orgAdminHash]);

  // Normal Customer User / Analyst
  await query(`
    INSERT INTO users (
      id, email, password_hash, name_en, name_ar, is_verified, is_platform_admin, status
    ) VALUES (
      $1, 'test.user@test.mikhlafi-labs.local', $2,
      'Synthetic Financial Analyst', 'محلل مالي تجريبي', true, false, 'active'
    ) ON CONFLICT (id) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      is_platform_admin = false;
  `, [SYNTHETIC_FIXTURES.analystUserId, userHash]);

  // Link Organization Memberships
  await query(`
    INSERT INTO memberships (id, organization_id, user_id, role, status)
    VALUES
      (gen_random_uuid(), $1, $2, 'org_owner', 'active'),
      (gen_random_uuid(), $1, $3, 'analyst', 'active')
    ON CONFLICT (user_id, organization_id) DO UPDATE SET role = EXCLUDED.role;
  `, [SYNTHETIC_FIXTURES.primaryOrgId, SYNTHETIC_FIXTURES.orgAdminId, SYNTHETIC_FIXTURES.analystUserId]);

  console.log('[Synthetic Seed] Creating synthetic branches...');
  await query(`
    INSERT INTO branches (id, organization_id, code, name_en, name_ar, city, is_main_hq)
    VALUES
      ($1, $4, 'HQ-RUH', 'Riyadh Central Headquarters', 'المقر الرئيسي بالرياض', 'Riyadh', true),
      ($2, $4, 'BR-JED', 'Jeddah Distribution Center', 'مركز توزيع جدة الغربي', 'Jeddah', false),
      ($3, $4, 'BR-DMM', 'Dammam Logistics Terminal', 'محطة عمليات الدمام', 'Dammam', false)
    ON CONFLICT (id) DO NOTHING;
  `, [
    SYNTHETIC_FIXTURES.branchHqId,
    SYNTHETIC_FIXTURES.branchJeddahId,
    SYNTHETIC_FIXTURES.branchDammamId,
    SYNTHETIC_FIXTURES.primaryOrgId
  ]);

  console.log('[Synthetic Seed] Generating multi-month synthetic financial transactions...');
  // Invoices & General Ledger records across 2025 and 2026
  const months = [
    { period: '2025-11', baseSpend: 310000, revenue: 490000 },
    { period: '2025-12', baseSpend: 345000, revenue: 520000 },
    { period: '2026-01', baseSpend: 280000, revenue: 460000 },
    { period: '2026-02', baseSpend: 295000, revenue: 475000 },
    { period: '2026-03', baseSpend: 315000, revenue: 510000 },
    { period: '2026-04', baseSpend: 330000, revenue: 535000 },
    { period: '2026-05', baseSpend: 360000, revenue: 560000 },
    { period: '2026-06', baseSpend: 340000, revenue: 550000 },
    { period: '2026-07', baseSpend: 375000, revenue: 590000 },
    { period: '2026-08', baseSpend: 390000, revenue: 610000 },
    { period: '2026-09', baseSpend: 420000, revenue: 645000 },
    { period: '2026-10', baseSpend: 410000, revenue: 630000 }
  ];

  const vendors = [
    { name: 'Al-Buraq Industrial Supplies Ltd.', gl: '510100', cat: 'Raw Materials', branchId: SYNTHETIC_FIXTURES.branchHqId },
    { name: 'Red Sea Cold-Chain Logistics', gl: '520200', cat: 'Logistics & Freight', branchId: SYNTHETIC_FIXTURES.branchJeddahId },
    { name: 'Rawabi Engineering Contracting', gl: '530300', cat: 'Subcontractors', branchId: SYNTHETIC_FIXTURES.branchDammamId },
    { name: 'Saudi Cloud Systems & Tech', gl: '540400', cat: 'IT & Cloud Services', branchId: SYNTHETIC_FIXTURES.branchHqId }
  ];

  for (let mIdx = 0; mIdx < months.length; mIdx++) {
    const { period, baseSpend, revenue } = months[mIdx];
    const dateStr = `${period}-15`;

    // 1. Credit Commercial Revenue
    await query(`
      INSERT INTO tenant_journal_entries (
        organization_id, posting_date, document_number, account_number,
        amount_sar, debit_credit, text_narrative
      ) VALUES ($1, $2, $3, '410100', $4, 'H', $5)
      ON CONFLICT DO NOTHING;
    `, [
      SYNTHETIC_FIXTURES.primaryOrgId,
      dateStr,
      `REV-${period}`,
      revenue,
      `[SYNTHETIC] Commercial Revenue Recognition for ${period}`
    ]);

    // 2. Vendor Invoices and Ledger Expenses
    for (let vIdx = 0; vIdx < vendors.length; vIdx++) {
      const v = vendors[vIdx];
      const invAmount = Math.round((baseSpend / vendors.length) * (0.9 + 0.2 * Math.sin(mIdx + vIdx)));
      const invNum = `INV-${period}-${vIdx + 1}`;

      await query(`
        INSERT INTO financial_invoices (
          organization_id, branch_id, invoice_number, vendor_name,
          issue_date, total_amount, currency, status, source_system
        ) VALUES ($1, $2, $3, $4, $5, $6, 'SAR', 'PAID', 'ERP_CONNECTOR')
        ON CONFLICT (organization_id, invoice_number) DO NOTHING;
      `, [
        SYNTHETIC_FIXTURES.primaryOrgId,
        v.branchId,
        invNum,
        v.name,
        dateStr,
        invAmount
      ]);

      await query(`
        INSERT INTO tenant_journal_entries (
          organization_id, posting_date, document_number, account_number,
          vendor_name, amount_sar, debit_credit, text_narrative
        ) VALUES ($1, $2, $3, $4, $5, $6, 'S', $7)
        ON CONFLICT DO NOTHING;
      `, [
        SYNTHETIC_FIXTURES.primaryOrgId,
        dateStr,
        invNum,
        v.gl,
        v.name,
        invAmount,
        `[SYNTHETIC] ${v.cat} Monthly Disbursement (${invNum})`
      ]);
    }
  }

  console.log('[Synthetic Seed] Injecting controlled financial anomalies with forensic explanations...');
  // Injected Anomaly 1: Duplicate invoice payout attempt (CRITICAL)
  await query(`
    INSERT INTO financial_anomalies (
      id, organization_id, branch_id, case_number, rule_code, severity,
      confidence_pct, target_vendor, flagged_amount, currency,
      narrative_en, narrative_ar, status
    ) VALUES (
      'f3000000-0000-0000-0000-000000000001', $1, $2, 'CASE-SYNTH-001',
      'RULE_DUP_INVOICE_HASH', 'CRITICAL', 99.40,
      'Al-Buraq Industrial Supplies Ltd.', 78500.00, 'SAR',
      '[SYNTHETIC ANOMALY] Duplicate invoice submission detected with identical line item fingerprint matching paid invoice INV-2026-08-1.',
      '[حالة تدقيق افتراضية] رصد تقديم فاتورة مكررة مطابقة في البصمة الرقمية ومطالبة الصرف لفاتورة سابقة مسددة.',
      'DETECTED'
    ) ON CONFLICT (organization_id, case_number) DO NOTHING;
  `, [SYNTHETIC_FIXTURES.primaryOrgId, SYNTHETIC_FIXTURES.branchHqId]);

  // Injected Anomaly 2: Extreme Price Deviation Drift (HIGH)
  await query(`
    INSERT INTO financial_anomalies (
      id, organization_id, branch_id, case_number, rule_code, severity,
      confidence_pct, target_vendor, flagged_amount, currency,
      narrative_en, narrative_ar, status
    ) VALUES (
      'f3000000-0000-0000-0000-000000000002', $1, $2, 'CASE-SYNTH-002',
      'RULE_PO_PRICE_DRIFT', 'HIGH', 92.15,
      'Rawabi Engineering Contracting', 142000.00, 'SAR',
      '[SYNTHETIC ANOMALY] Unit price charged for civil structural steel exceeds contracted schedule of rates by +34.8%.',
      '[حالة تدقيق افتراضية] انحراف وتصاعد في أسعار بنود المقاولة الهندسية بنسبة +34.8% عن جدول الأسعار التعاقدي المعتمد.',
      'DETECTED'
    ) ON CONFLICT (organization_id, case_number) DO NOTHING;
  `, [SYNTHETIC_FIXTURES.primaryOrgId, SYNTHETIC_FIXTURES.branchDammamId]);

  console.log('[Synthetic Seed] Seeding synthetic integrations and workflows...');
  // Integrations with varied honest statuses
  await query(`
    INSERT INTO tenant_integrations (
      organization_id, code, name_en, name_ar, category, auth_type,
      records_synced_count, last_sync_status, status
    ) VALUES
      ($1, 'SYNTH-SAP', 'SAP S/4HANA Finance Replica', 'نسخة قاعدة بيانات ساب المالية', 'ERP / General Ledger', 'mTLS Read-Only DB', 24500, 'HEALTHY', 'connected'),
      ($1, 'SYNTH-ORACLE', 'Oracle Fusion SCM Cloud', 'سحابة أوراكل لسلاسل الإمداد', 'Supply Chain / Inventory', 'REST OAuth2', 1250, 'DEMO_SYNCED', 'connected'),
      ($1, 'SYNTH-MS-DYN', 'Microsoft Dynamics 365 Finance', 'مايكروسوفت دايناميكس 365', 'ERP / Invoicing', 'API Key', 0, 'NOT_CONFIGURED', 'disconnected')
    ON CONFLICT DO NOTHING;
  `, [SYNTHETIC_FIXTURES.primaryOrgId]);

  // Workflows
  await query(`
    INSERT INTO tenant_workflows (
      organization_id, code, name_ar, name_en, trigger_ar, trigger_en,
      action_ar, action_en, active, executions_count
    ) VALUES
      ($1, 'WF-SYNTH-FREEZE', 'التجميد التلقائي للفواتير المكررة', 'Auto-Freeze Duplicate Invoices', 'رصد تطابق بصمة الفاتورة بنسبة 95%+', 'Invoice hash match >= 95%', 'إيقاف أمر الصرف وإخطار المدير المالي', 'Freeze disbursement & notify CFO', true, 14),
      ($1, 'WF-SYNTH-CREEP', 'إنذار تصاعد أسعار الموردين', 'Vendor Price Creep Alert', 'تجاوز السعر المرجعي بنسبة 15%', 'Price deviation >= 15%', 'إرسال إشعار فوري لمكتب المشتريات', 'Send alert to procurement team', false, 0)
    ON CONFLICT DO NOTHING;
  `, [SYNTHETIC_FIXTURES.primaryOrgId]);

  console.log('[Synthetic Seed] Completed successfully. All fixtures are deterministic and isolated.');
  return {
    success: true,
    organizationsSeeded: 2,
    usersSeeded: 3,
    branchesSeeded: 3,
    monthsSeeded: months.length
  };
}

// Allow direct CLI execution: node apps/api/src/db/seedSyntheticData.js
if (process.argv[1] && process.argv[1].endsWith('seedSyntheticData.js')) {
  seedSyntheticData()
    .then((res) => {
      console.log('[Synthetic Seed CLI Output]:', JSON.stringify(res, null, 2));
      return closeDb();
    })
    .catch((err) => {
      console.error('[Synthetic Seed CLI Fatal Error]:', err);
      process.exit(1);
    });
}
