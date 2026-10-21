// ==============================================================================
// MIKHLAFI LABS — Demo Workspace Seeder (Clearly-Labelled Demo Fixture Data)
// ==============================================================================
// WHAT THIS FILE IS
//   A deterministic, idempotent, re-runnable seeder that populates the canonical
//   demo organization ('mikhlafi-group' / c0000000-0000-0000-0000-000000000002,
//   seeded by migration 004) so a platform owner can sign in and see realistic,
//   populated dashboards across every intelligence view.
//
// WHAT THIS FILE IS NOT
//   This is NOT real customer data and NOT an evidence claim. It is synthetic
//   demonstration fixture data. No monetary figure, percentage, or outcome in
//   this file is a measured result of any real deployment. Nothing here is
//   sourced from production systems. Integration templates are deliberately
//   left in status 'not_configured' with last_sync_status 'NOT_CONFIGURED' so
//   the platform never implies a live connection that does not exist.
//
// HOW IT WORKS
//   - Runs inside one transaction (connection.js exposes `transaction`).
//   - Every tenant table it touches is first DELETEd for the demo org only
//     (child tables before parents to respect foreign keys), then re-inserted
//     with fixed, deterministic UUIDs. Re-running is therefore stable and safe.
//   - Parent rows (organizations -> branches) are created/reused before children.
//   - Global (non tenant-scoped) rows such as lead_inquiries are keyed by fixed
//     UUIDs and deleted/re-inserted by those keys so they also stay stable.
//
// USAGE (direct CLI):
//   node apps/api/src/db/seedDemoWorkspace.js
// ==============================================================================

import { query, transaction, runMigrations, closeDb } from './connection.js';

// Canonical demo organization + migration-004 identities (do not change).
export const DEMO_ORG_ID = 'c0000000-0000-0000-0000-000000000002';
export const DEMO_ORG_SLUG = 'mikhlafi-group';
export const DEMO_HQ_BRANCH_ID = 'c0000000-0000-0000-0000-000000000003';
export const DEMO_PLATFORM_OWNER_ID = 'c0000000-0000-0000-0000-000000000001'; // saad@mikhlafi-labs.com
export const DEMO_CLIENT_USER_ID = 'c0000000-0000-0000-0000-000000000010'; // client@mikhlafi-holding.com

/**
 * Deterministic UUID builder. `prefix` must be exactly 8 hex characters.
 * Produces a stable v4-shaped UUID so repeated runs produce identical ids.
 */
const uid = (prefix, n) => `${prefix}-0000-4000-8000-${String(n).padStart(12, '0')}`;

const ORG = DEMO_ORG_ID;
const HQ = DEMO_HQ_BRANCH_ID;
const CLIENT_USER = DEMO_CLIENT_USER_ID;
const SAAD = DEMO_PLATFORM_OWNER_ID;

// Additional demo branches (created idempotently with fixed ids; the migration-004
// HQ branch is preserved as-is so memberships.branch_id is never orphaned).
const BR_JED = 'c1000000-0000-4000-8000-000000000001';
const BR_DMM = 'c1000000-0000-4000-8000-000000000002';
const BR_MED = 'c1000000-0000-4000-8000-000000000003';

// ── Tiny SQL helpers ─────────────────────────────────────────────────────────
const json = (value) => (value === undefined || value === null ? null : JSON.stringify(value));

function buildInsert(table, columns, rows) {
  const params = [];
  const tuples = rows.map((row) => {
    const placeholders = row.map((value) => {
      params.push(value);
      return `$${params.length}`;
    });
    return `(${placeholders.join(', ')})`;
  });
  return {
    sql: `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${tuples.join(', ')}`,
    params
  };
}

function rowsFrom(columns, objects) {
  return objects.map((obj) => columns.map((col) => (obj[col] === undefined ? null : obj[col])));
}

async function insertRows(tx, table, columns, objects) {
  if (!objects || objects.length === 0) return 0;
  const { sql, params } = buildInsert(table, columns, rowsFrom(columns, objects));
  await tx.query(sql, params);
  return objects.length;
}

// ==============================================================================
// STATIC FIXTURE DEFINITIONS
// ==============================================================================

const BRANCHES = [
  {
    id: BR_JED,
    organization_id: ORG,
    code: 'BR-JED',
    name_ar: 'مركز العمليات الغربي - جدة',
    name_en: 'Western Operations Center — Jeddah',
    city: 'Jeddah',
    is_main_hq: false,
    status: 'active'
  },
  {
    id: BR_DMM,
    organization_id: ORG,
    code: 'BR-DMM',
    name_ar: 'قاعدة العمليات الشرقية - الدمام',
    name_en: 'Eastern Operations Base — Dammam',
    city: 'Dammam',
    is_main_hq: false,
    status: 'active'
  },
  {
    id: BR_MED,
    organization_id: ORG,
    code: 'BR-MED',
    name_ar: 'مركز التوزيع - المدينة المنورة',
    name_en: 'Distribution Center — Madinah',
    city: 'Madinah',
    is_main_hq: false,
    status: 'active'
  }
];

// ── tenant_decisions (~14) ───────────────────────────────────────────────────
const DECISION_COLUMNS = [
  'id', 'organization_id', 'branch_id', 'title', 'category', 'impact_amount',
  'currency', 'risk_level', 'status', 'source_system', 'details'
];

const DECISIONS = [
  ['Renegotiate Cement & Aggregates Volume Contract Ahead of Q1 Price Indexation', 'Procurement', 362400.0, 'CRITICAL', 'PENDING', HQ,
    'مراجعة وإعادة التفاوض على عقد توريد الأسمنت والركام قبل تطبيق مؤشر أسعار الربع الأول',
    'Procurement Director', 'مدير المشتريات'],
  ['Capture 2/10 Net 30 Early Settlement Discounts on Approved Logistics Batches', 'Working Capital', 145000.0, 'HIGH', 'PENDING', HQ,
    'تحصيل خصومات السداد المبكر على دفعات الخدمات اللوجستية المعتمدة',
    'Group Treasurer', 'أمين الخزينة'],
  ['Mitigate 14-Day Milestone Slippage on Jeddah Logistics Automation Programme', 'Project Governance', 540000.0, 'MEDIUM', 'PENDING', BR_JED,
    'معالجة تأخر 14 يوماً في مراحل برنامج أتمتة الخدمات اللوجستية بجدة',
    'Programme Director', 'مدير البرامج'],
  ['Consolidate Duplicated Cloud Licence Sprawl Across Three Business Units', 'IT & Technology', 288000.0, 'HIGH', 'PENDING', HQ,
    'توحيد تراخيص الحوسبة السحابية المكررة بين ثلاث وحدات أعمال',
    'Head of IT', 'رئيس تقنية المعلومات'],
  ['Re-sequence Preventive Maintenance Windows to Reduce Unplanned Downtime', 'Operations', 197500.0, 'MEDIUM', 'PENDING', BR_DMM,
    'إعادة جدولة نوافذ الصيانة الوقائية لتقليل فترات التوقف غير المخططة',
    'Operations Manager', 'مدير العمليات'],
  ['Introduce Second-Source Framework Agreement for Industrial Spare Parts', 'Supply Chain', 415000.0, 'HIGH', 'PENDING', HQ,
    'اعتماد اتفاقية إطارية لمصدر توريد ثانٍ لقطع الغيار الصناعية',
    'Supply Chain Lead', 'مدير سلاسل الإمداد'],
  ['Defer Non-Critical Fleet Replacement by Two Quarters', 'Capital Allocation', 1220000.0, 'MEDIUM', 'PENDING', HQ,
    'تأجيل استبدال أسطول المركبات غير الحرج لمدة ربعين',
    'Chief Financial Officer', 'المدير المالي'],
  ['Automate VAT Reconciliation Between ERP Ledger and Tax Portal Filings', 'Regulatory & Tax', 96000.0, 'LOW', 'PENDING', HQ,
    'أتمتة مطابقة ضريبة القيمة المضافة بين دفتر الأستاذ وبوابات الإقرارات الضريبية',
    'Tax Compliance Manager', 'مدير الالتزام الضريبي'],
  ['Roll Out Structured Onboarding for Contract Workforce', 'Human Capital', 134000.0, 'LOW', 'PENDING', HQ,
    'تفعيل برنامج تهيئة منظم للقوى العاملة المتعاقدة',
    'HR Director', 'مدير الموارد البشرية'],
  ['Terminate Underperforming Facilities Maintenance Subcontract', 'Vendor Management', 210000.0, 'HIGH', 'EXECUTED', HQ,
    'إنهاء عقد مقاولة صيانة المرافق منخفض الأداء',
    'Facilities Manager', 'مدير المرافق'],
  ['Recover Overpaid Freight Surcharges Identified in the Q2 Forensic Review', 'Cost Recovery', 78500.0, 'MEDIUM', 'EXECUTED', HQ,
    'استعادة رسوم الشحن الزائدة المرصودة في المراجعة الجنائية للربع الثاني',
    'Internal Audit Director', 'مدير التدقيق الداخلي'],
  ['Migrate Legacy Reporting Warehouse to a Managed Data Platform', 'IT & Technology', 640000.0, 'MEDIUM', 'EXECUTED', HQ,
    'ترحيل مستودع التقارير القديم إلى منصة بيانات مُدارة',
    'Head of Data', 'رئيس قسم البيانات'],
  ['Reduce Energy Peak Load Through Load-Shifting Controls', 'Energy & Sustainability', 176000.0, 'MEDIUM', 'EXECUTED', BR_DMM,
    'تقليل حِمل الطاقة في فترات الذروة عبر ضوابط تحويل الأحمال',
    'Sustainability Lead', 'مدير الاستدامة'],
  ['Stand Up a Customer Retention Taskforce for At-Risk Accounts', 'Customer Retention', 450000.0, 'HIGH', 'EXECUTED', HQ,
    'تشكيل فريق عمل للحفاظ على العملاء ذوي المخاطر المرتفعة',
    'Commercial Director', 'المدير التجاري']
].map(([title, category, impact, risk, status, branchId, titleAr, ownerName, ownerRoleAr], i) => ({
  id: uid('a1000000', i + 1),
  organization_id: ORG,
  branch_id: branchId,
  title,
  category,
  impact_amount: impact,
  currency: 'SAR',
  risk_level: risk,
  status,
  source_system: 'DEMO_FIXTURE_FEED',
  details: json({
    demoFixture: true,
    titleAr,
    ownerName,
    ownerRole: ownerRoleAr,
    evidence: `Rule-grounded demo reference decision #${i + 1} — synthetic fixture, not a measured outcome.`
  })
}));

// ── tenant_risks (~10) ───────────────────────────────────────────────────────
const RISK_COLUMNS = [
  'id', 'organization_id', 'branch_id', 'code', 'title_en', 'title_ar', 'category_en', 'category_ar',
  'probability', 'severity', 'financial_exposure_sar', 'exposure_formatted', 'status', 'is_mitigated',
  'mitigation_plan_en', 'mitigation_plan_ar', 'owner_name'
];

const RISKS = [
  ['RSK-001', 'Raw material price volatility on cement and structural steel',
    'تقلب أسعار المواد الخام للأسمنت وحديد التسليح', 'Procurement', 'المشتريات', 'high', 'high',
    362400, '362,400 SAR', 'ACTIVE', false,
    'Lock quarterly volume tranches and require an indexation clause in the renewal.',
    'تثبيت شرائح كمية ربع سنوية وإلزام المورد ببند مؤشر أسعار في التجديد.', 'Procurement Risk Office'],
  ['RSK-002', 'Liquidity pressure from delayed certification of government progress claims',
    'ضغوط سيولة بسبب تأخر اعتماد المستخلصات الحكومية', 'Liquidity & Cash', 'السيولة والتدفقات',
    'medium', 'high', 920000, '920,000 SAR', 'ACTIVE', false,
    'Submit electronic reconciliation early and pre-agree evidence packs per milestone.',
    'تقديم المطابقة الإلكترونية مبكراً والاتفاق المسبق على حزم الأدلة لكل مرحلة.', 'Group Treasurer'],
  ['RSK-003', 'Revenue concentration on a single account exceeding 25% of volume',
    'تركز الإيرادات على عميل واحد يتجاوز 25% من الحجم', 'Customer Retention', 'الاحتفاظ بالعملاء',
    'medium', 'high', 840000, '840,000 SAR', 'ACTIVE', false,
    'Open two qualified accounts per quarter and schedule an executive review before renewal.',
    'إضافة عميلين مؤهلين كل ربع ومراجعة تنفيذية قبل موعد التجديد.', 'Commercial Director'],
  ['RSK-004', 'Industrial control network exposed to unpatched legacy endpoints',
    'شبكة التحكم الصناعي مكشوفة لأطراف قديمة غير محدثة', 'Cybersecurity', 'الأمن السيبراني',
    'medium', 'critical', 1250000, '1,250,000 SAR', 'ACTIVE', false,
    'Segment the OT network and enforce a quarterly patch window with change control.',
    'تقسيم شبكة التشغيل وفرض تحديث أمني ربع سنوي وفق ضوابط التغيير.', 'Head of IT Security'],
  ['RSK-005', 'Regulatory penalty exposure from e-invoicing phase-two filing gaps',
    'مخاطر غرامات تنظيمية بسبب فجوات في إقرارات الفوترة الإلكترونية', 'Regulatory & Tax', 'الالتزام التنظيمي',
    'low', 'medium', 180000, '180,000 SAR', 'ACTIVE', false,
    'Automate reconciliation between the ledger and the clearance gateway.',
    'أتمتة المطابقة بين دفتر الأستاذ وبوابة الاعتماد الإلكتروني.', 'Tax Compliance Manager'],
  ['RSK-006', 'Vendor concentration where one supplier provides over 60% of a critical category',
    'تركز الموردين حيث يوفر مورد واحد أكثر من 60% من فئة حرجة', 'Supply Chain', 'سلاسل الإمداد',
    'high', 'high', 540000, '540,000 SAR', 'ACTIVE', false,
    'Qualify a second source and split the annual volume across both vendors.',
    'تأهيل مصدر ثانٍ وتوزيع الحجم السنوي بين الموردين.', 'Supply Chain Lead'],
  ['RSK-007', 'Contractor claims escalation on fixed-price work packages',
    'تصاعد مطالبات المقاولين على حزم عمل بأسعار ثابتة', 'Project Delivery', 'تنفيذ المشاريع',
    'medium', 'medium', 610000, '610,000 SAR', 'ACTIVE', false,
    'Enforce a claims register with independent quantity verification before approval.',
    'تفعيل سجل مطالبات مع تحقق هندسي مستقل قبل الاعتماد.', 'Programme Director'],
  ['RSK-008', 'Key-person dependency in financial control and approvals',
    'اعتماد كبير على شخص واحد في الرقابة المالية والاعتمادات', 'Governance', 'الحكامة',
    'medium', 'medium', 210000, '210,000 SAR', 'MITIGATED', true,
    'Documented delegation of authority and cross-training completed for two deputies.',
    'توثيق تفويض الصلاحيات وتدريب بديلين على المهام الحساسة.', 'Chief Financial Officer'],
  ['RSK-008b', 'Unplanned downtime on a strategic distribution line',
    'توقف غير مخطط في خط توزيع استراتيجي', 'Operations', 'العمليات',
    'low', 'high', 300000, '300,000 SAR', 'MITIGATED', true,
    'Completed a preventive maintenance re-sequence and added a hot standby line.',
    'إتمام إعادة جدولة الصيانة الوقائية وإضافة خط احتياطي جاهز.', 'Operations Manager'],
  ['RSK-009', 'Customer payment cycle stretching beyond contractual terms',
    'تمدد دورة تحصيل العملاء بما يتجاوز الشروط التعاقدية', 'Liquidity & Cash', 'السيولة والتدفقات',
    'high', 'medium', 610000, '610,000 SAR', 'ACTIVE', false,
    'Apply a tiered dunning policy and tighten credit limits on overdue accounts.',
    'تطبيق سياسة تحصيل متدرجة وتقليص حدود الائتمان للحسابات المتأخرة.', 'Group Treasurer'],
  ['RSK-010', 'Skills gap in data engineering delaying reporting deliverables',
    'فجوة مهارات في هندسة البيانات تؤخر مخرجات التقارير', 'Human Capital', 'رأس المال البشري',
    'medium', 'low', 95000, '95,000 SAR', 'ACTIVE', true,
    'Blended delivery team with an external specialist for two quarters.',
    'فريق تسليم مدمج مع مختص خارجي لمدة ربعين.', 'Head of Data']
].map(([code, titleEn, titleAr, catEn, catAr, probability, severity, exposure, formatted, status, mitigated, planEn, planAr, owner], i) => ({
  id: uid('a2000000', i + 1),
  organization_id: ORG,
  branch_id: null,
  code,
  title_en: titleEn,
  title_ar: titleAr,
  category_en: catEn,
  category_ar: catAr,
  probability,
  severity,
  financial_exposure_sar: exposure,
  exposure_formatted: formatted,
  status,
  is_mitigated: mitigated,
  mitigation_plan_en: planEn,
  mitigation_plan_ar: planAr,
  owner_name: owner
}));

// ── tenant_projects (~6) ─────────────────────────────────────────────────────
const PROJECT_COLUMNS = [
  'id', 'organization_id', 'branch_id', 'code', 'name_en', 'name_ar', 'client_name',
  'budget_total_sar', 'spent_sar', 'variance_sar', 'planned_progress', 'actual_progress',
  'health', 'change_orders_count', 'contractor_claims_audited', 'status'
];

const PROJECTS = [
  ['PRJ-2026-01', 'Regional Distribution Hub Build-Out — Riyadh', 'تطوير مركز التوزيع الإقليمي — الرياض',
    'National Industrial Development Authority (Demo Client)', 4200000, 2814000, 126000, 72, 74, 'on-track', 2, true, BR_JED],
  ['PRJ-2026-02', 'Supply Chain Automation & Logistics Center — Jeddah', 'أتمتة سلاسل الإمداد ومركز الخدمات اللوجستية — جدة',
    'Red Sea Ports & Logistics Group (Demo Client)', 6800000, 3264000, 240000, 60, 48, 'at-risk', 5, false, BR_JED],
  ['PRJ-2026-03', 'Power Distribution Expansion — Eastern Province', 'توسعة شبكة توزيع الطاقة — المنطقة الشرقية',
    'Eastern Grid Transmission Co. (Demo Client)', 3100000, 2728000, -12000, 90, 88, 'on-track', 1, true, BR_DMM],
  ['PRJ-2026-04', 'Cold-Chain Warehouse Retrofit — Madinah', 'تحديث مستودع سلسلة التبريد — المدينة المنورة',
    'Western Food Distribution Holdings (Demo Client)', 2450000, 2205000, 187500, 85, 71, 'critical', 4, false, BR_MED],
  ['PRJ-2026-05', 'Enterprise Data Platform Rollout', 'تنفيذ منصة البيانات المؤسسية',
    'Internal Digital Transformation Programme (Demo)', 1800000, 936000, -36000, 50, 55, 'on-track', 1, true, HQ],
  ['PRJ-2026-06', 'Water Treatment Plant Upgrade — Dammam', 'تحديث محطة معالجة المياه — الدمام',
    'Municipal Utilities Directorate (Demo Client)', 5400000, 1242000, 18000, 25, 26, 'on-track', 0, false, BR_DMM]
].map(([code, nameEn, nameAr, client, budget, spent, variance, planned, actual, health, co, audited, branchId], i) => ({
  id: uid('a3000000', i + 1),
  organization_id: ORG,
  branch_id: branchId,
  code,
  name_en: nameEn,
  name_ar: nameAr,
  client_name: client,
  budget_total_sar: budget,
  spent_sar: spent,
  variance_sar: variance,
  planned_progress: planned,
  actual_progress: actual,
  health,
  change_orders_count: co,
  contractor_claims_audited: audited,
  status: 'ACTIVE'
}));

// ── tenant_suppliers (~8) ────────────────────────────────────────────────────
const SUPPLIER_COLUMNS = [
  'id', 'organization_id', 'code', 'name_en', 'name_ar', 'rating_score', 'price_creep_rate',
  'price_creep_pct', 'on_time_delivery_rate', 'active_contracts_val_sar', 'risk_status',
  'is_audited', 'last_audit_notes'
];

const SUPPLIERS = [
  ['VND-101', 'Al-Yamama Cement & Aggregates', 'شركة اليمامة للأسمنت والركام',
    64, '+16.5%', 16.5, '79.2%', 1450000, 'critical', false,
    'Uncontracted price drift detected on structural aggregate line items against the schedule of rates.'],
  ['VND-102', 'Eastern Pipe & Industrial Mill', 'مصنع الشرق للأنابيب والمواد الصناعية',
    93, '+1.2%', 1.2, '98.5%', 3200000, 'optimal', true,
    'Consistent compliance with the long-term procurement agreement; no material findings.'],
  ['VND-103', 'Global Logistics Co.', 'شركة الخدمات اللوجستية العالمية',
    77, '+6.8%', 6.8, '88.0%', 920000, 'moderate', false,
    'Fuel surcharge indexation applied without prior written notification on two batches.'],
  ['VND-104', 'Red Sea Industrial Equipment', 'شركة البحر الأحمر للمعدات الصناعية',
    85, '+2.4%', 2.4, '95.1%', 2100000, 'optimal', true,
    'Warranty terms honoured; spare-part lead times improving quarter over quarter (demo observation).'],
  ['VND-105', 'Saudi Cloud Systems & Tech', 'شركة الأنظمة السحابية التقنية',
    88, '+3.1%', 3.1, '96.4%', 1180000, 'optimal', false,
    'Licence true-up line awaiting procurement sign-off; no pricing anomalies observed.'],
  ['VND-105B', 'National Facilities Services Group', 'المجموعة الوطنية لخدمات المرافق',
    58, '+11.4%', 11.4, '74.6%', 380000, 'critical', false,
    'Repeated call-out charges outside contract scope; performance under formal review.'],
  ['VND-106', 'Gulf Advisory & Compliance Partners', 'شركاء الخليج للاستشارات والالتزام',
    85, '+2.4%', 2.4, '94.0%', 480000, 'optimal', true,
    'Deliverables accepted on schedule; retainer renewed at the existing rate.'],
  ['VND-107', 'Najd Workforce Solutions', 'حلول نجد للقوى العاملة',
    72, '+3.9%', 3.9, '91.0%', 610000, 'moderate', false,
    'Invoice to timesheet mismatch resolved; monitoring for repeat occurrence.']
].map(([code, nameEn, nameAr, rating, creepRate, creepPct, onTime, contractVal, risk, audited, notes], i) => ({
  id: uid('a4000000', i + 1),
  organization_id: ORG,
  code,
  name_en: nameEn,
  name_ar: nameAr,
  rating_score: rating,
  price_creep_rate: creepRate,
  price_creep_pct: creepPct,
  on_time_delivery_rate: onTime,
  active_contracts_val_sar: contractVal,
  risk_status: risk,
  is_audited: audited,
  last_audit_notes: notes
}));

// ── tenant_customers (~8) ────────────────────────────────────────────────────
const CUSTOMER_COLUMNS = [
  'id', 'organization_id', 'code', 'account_name_en', 'account_name_ar', 'volume_trend',
  'renewal_date', 'churn_probability', 'revenue_at_risk_sar', 'review_scheduled', 'status'
];

const CUSTOMERS = [
  ['CUST-201', 'Al-Rowad Contracting & Development', 'مجموعة الرواد للمقاولات والتطوير',
    '-35.2%', '2026-11-30', 0.68, 840000, false, 'ACTIVE'],
  ['CUST-202', 'Saudi Pharma Industrial Group', 'الشركة السعودية للصناعات الدوائية',
    '+8.4%', '2027-02-15', 0.12, 1200000, false, 'ACTIVE'],
  ['CUST-203', 'National Retail & Food Markets', 'سلسلة أسواق التغذية الوطنية',
    '-18.0%', '2026-12-15', 0.44, 520000, true, 'ACTIVE'],
  ['CUST-204', 'Gulf Steel Fabrication Co.', 'شركة الخليج لتشكيل المعادن',
    '-6.5%', '2027-01-31', 0.31, 610000, false, 'ACTIVE'],
  ['CUST-205', 'Northern Region Water Utility', 'الشركة الشمالية لخدمات المياه',
    '+3.1%', '2027-06-30', 0.09, 980000, false, 'ACTIVE'],
  ['CUST-206', 'Coastal Hospitality Holdings', 'مجموعة الضيافة الساحلية القابضة',
    '-22.7%', '2026-12-01', 0.52, 430000, true, 'ACTIVE'],
  ['CUST-207', 'Central Agricultural Supply Co.', 'الشركة المركزية للمستلزمات الزراعية',
    '+11.9%', '2027-03-20', 0.07, 350000, false, 'ACTIVE'],
  ['CUST-208', 'Metropolitan Facilities Group', 'مجموعة المرافق الحضرية',
    '-9.3%', '2027-05-10', 0.24, 275000, false, 'UNDER_REVIEW']
].map(([code, nameEn, nameAr, trend, renewal, churn, atRisk, scheduled, status], i) => ({
  id: uid('a5000000', i + 1),
  organization_id: ORG,
  code,
  account_name_en: nameEn,
  account_name_ar: nameAr,
  volume_trend: trend,
  renewal_date: renewal,
  churn_probability: churn,
  revenue_at_risk_sar: atRisk,
  review_scheduled: scheduled,
  status
}));

// ── data_quality_audits (~5) ─────────────────────────────────────────────────
const DQ_COLUMNS = [
  'id', 'organization_id', 'check_code', 'rule_name', 'source_system', 'compliance_rate',
  'unmapped_records', 'status', 'last_checked', 'details'
];

const DQ_AUDITS = [
  ['DQ-ZATCA-RECON', 'مطابقة قيود الفواتير مع السجل الضريبي ZATCA / Invoice-to-tax-portal reconciliation',
    'ERP Ledger <-> Tax Clearance Bridge', 99.8, 3, 'passed', '2026-10-12 04:00',
    { total_records: 12840, matched: 12837, pending_uuid_sync: 3, demoFixture: true }],
  ['DQ-PO-NULL', 'اكتمال بيانات وتوقيعات أوامر الشراء / Purchase order completeness and sign-off',
    'ERP Procurement Module', 94.2, 18, 'warning', '2026-10-12 06:30',
    { total_records: 2400, missing_tier2_approval: 18, demoFixture: true }],
  ['DQ-IBAN-DUP', 'مطابقة الحسابات البنكية للموردين / Vendor IBAN validation',
    'Banking Integration Engine', 98.1, 5, 'passed', '2026-10-12 05:15',
    { verified_iban_count: 89, flagged_secondary_accounts: 5, demoFixture: true }],
  ['DQ-PROJ-EVM', 'اكتمال بيانات نسب الإنجاز الفعلية للمشاريع / Project earned-value completeness',
    'Project Controls Register', 91.6, 9, 'warning', '2026-10-11 22:40',
    { total_records: 120, missing_actual_progress: 9, demoFixture: true }],
  ['DQ-VENDOR-MASTER', 'توحيد السجلات المكررة في دليل الموردين / Duplicate vendor master de-duplication',
    'Master Data Registry', 96.4, 7, 'passed', '2026-10-11 21:05',
    { total_vendors: 312, duplicate_candidates: 7, demoFixture: true }]
].map(([code, rule, source, rate, unmapped, status, checked, details], i) => ({
  id: uid('a6000000', i + 1),
  organization_id: ORG,
  check_code: code,
  rule_name: rule,
  source_system: source,
  compliance_rate: rate,
  unmapped_records: unmapped,
  status,
  last_checked: checked,
  details: json(details)
}));

// ── tenant_alerts (~8) ───────────────────────────────────────────────────────
const ALERT_COLUMNS = [
  'id', 'organization_id', 'title_en', 'title_ar', 'severity', 'source_domain',
  'acknowledged', 'acknowledged_by', 'acknowledged_at'
];

const ALERTS = [
  ['Duplicate payment disbursement match detected within 48h', 'رصد تطابق صرف مزدوج خلال 48 ساعة',
    'critical', 'financial', false, null, null],
  ['Supplier price creep exceeded contractual baseline (+16.5%)', 'تجاوز تصاعد أسعار المورد للسعر التعاقدي (+16.5%)',
    'warning', 'supplier', false, null, null],
  ['Project milestone slippage exceeded 14 days on Jeddah automation', 'تأخر مرحلة مشروع أتمتة جدة لأكثر من 14 يوماً',
    'warning', 'project', true, CLIENT_USER, '2026-10-10 09:20:00+03'],
  ['Customer volume contraction of 35% recorded on a key account', 'انخفاض 35% في حجم الطلب لعميل رئيسي',
    'warning', 'customer', false, null, null],
  ['Quarterly risk review is due for the procurement category', 'موعد المراجعة الربع سنوية لمخاطر فئة المشتريات',
    'info', 'risk', true, CLIENT_USER, '2026-10-09 14:05:00+03'],
  ['Data quality warning: 18 purchase orders missing tier-two sign-off', 'تحذير جودة بيانات: 18 أمر شراء بدون توقيع المستوى الثاني',
    'warning', 'data_quality', false, null, null],
  ['Journal batch flagged two entries held just below the approval threshold', 'رصد دفعة قيود تحتوي بندين أقل من حد الاعتماد مباشرة',
    'critical', 'financial', false, null, null],
  ['Workspace settings review completed for the current quarter', 'اكتملت مراجعة إعدادات مساحة العمل للربع الحالي',
    'info', 'system', true, SAAD, '2026-10-08 11:30:00+03']
].map(([titleEn, titleAr, severity, domain, ack, ackBy, ackAt], i) => ({
  id: uid('a7000000', i + 1),
  organization_id: ORG,
  title_en: titleEn,
  title_ar: titleAr,
  severity,
  source_domain: domain,
  acknowledged: ack,
  acknowledged_by: ackBy,
  acknowledged_at: ackAt
}));

// ── tenant_workflows (~5 templates, zero executed) ───────────────────────────
const WORKFLOW_COLUMNS = [
  'id', 'organization_id', 'code', 'name_ar', 'name_en', 'trigger_ar', 'trigger_en',
  'action_ar', 'action_en', 'active', 'executions_count', 'last_executed_at'
];

const WORKFLOWS = [
  ['WF-DUP-FREEZE', 'تجميد مدفوعات الفواتير المكررة فورياً', 'Instant Freeze on Suspected Duplicate Invoices',
    'رصد تطابق رقم الفاتورة والمبلغ ونفس الحساب البنكي خلال 48 ساعة',
    'Detection of matching invoice number, amount and bank account within 48 hours',
    'تجميد أمر الدفع في نظام التخطيط وإخطار مدير التدقيق',
    'Block the ERP disbursement queue and escalate to the audit lead', true],
  ['WF-PRICE-CREEP', 'تصعيد انحراف أسعار عقود التوريد', 'Escalation for Supplier Price Variance',
    'تجاوز سعر الوحدة المفوتر نسبة +10% عن العقد الأساسي المسجل',
    'Unit invoice price exceeding the contractual baseline by +10%',
    'إدراج بند مراجعة أسعار في طابور قرارات المشتريات',
    'Create a mandatory price review item in the procurement decision queue', true],
  ['WF-CLAIM-SLIP', 'إنذار تأخر مستخلصات المشاريع الحرجة', 'Early Warning on Critical Project Claim Delays',
    'تأخر اعتماد المستخلص أكثر من 14 يوماً عن الجدول المعتمد',
    'Milestone certification delayed more than 14 days against the baseline schedule',
    'إرسال إشعار فوري لمدير البرامج ومسؤول المشروع',
    'Notify the programme director and the project owner immediately', true],
  ['WF-THRESHOLD-SPLIT', 'مراجعة المدفوعات القريبة من حد الاعتماد', 'Approval-Threshold Proximity Review',
    'رصد مبالغ تقع مباشرة دون حد الاعتماد المعتمد (100,000 ريال)',
    'Detection of amounts structured immediately below the delegated approval limit (100,000 SAR)',
    'إضافة تنبيه مراجعة يدوية قبل اعتماد الدفعة',
    'Raise a manual review flag before the payment is approved', false],
  ['WF-VENDOR-ONBOARD', 'التحقق الآلي من بيانات الموردين الجدد', 'Automated New-Vendor Data Verification',
    'إدخال مورد جديد في دليل الموردين بدون رقم ضريبي مسجل',
    'A new vendor is added to the master registry without a tax registration number',
    'إيقاف التفعيل وطلب استكمال البيانات',
    'Hold activation and request the missing compliance data', false]
].map(([code, nameAr, nameEn, triggerAr, triggerEn, actionAr, actionEn, active], i) => ({
  id: uid('a8000000', i + 1),
  organization_id: ORG,
  code,
  name_ar: nameAr,
  name_en: nameEn,
  trigger_ar: triggerAr,
  trigger_en: triggerEn,
  action_ar: actionAr,
  action_en: actionEn,
  active,
  executions_count: 0,
  last_executed_at: null
}));

// ── tenant_integrations (~5 templates, honestly not configured) ──────────────
const INTEGRATION_COLUMNS = [
  'id', 'organization_id', 'code', 'name_en', 'name_ar', 'category', 'auth_type',
  'records_synced_count', 'last_sync_status', 'status', 'config'
];

const INTEGRATIONS = [
  ['SAP-ERP-TEMPLATE', 'SAP S/4HANA Finance & Controlling (FICO) Template',
    'قالب نظام ساب المالي وإدارة دفتر الأستاذ العام (SAP S/4HANA)',
    'ERP / General Ledger', 'mTLS + Read-Only Database Replica'],
  ['ORACLE-SCM-TEMPLATE', 'Oracle Fusion Cloud Procurement & Inventory Template',
    'قالب أوراكل لإدارة سلاسل الإمداد والمشتريات',
    'Procurement & Contracts', 'Signed REST Webhook (Read-Only)'],
  ['ZATCA-EINVOICE-TEMPLATE', 'ZATCA Fatoora Phase II Clearance Gateway Template',
    'قالب بوابة الفوترة الإلكترونية المرحلة الثانية',
    'Regulatory & Tax Bridge', 'Cryptographic API Stamp (Read-Only)'],
  ['BANK-STMT-TEMPLATE', 'Bank Statement Reconciliation Feed Template',
    'قالب تغذية كشوف الحسابات البنكية للمطابقة',
    'Banking & Treasury', 'ISO 20022 Read-Only Feed'],
  ['HRMS-TEMPLATE', 'HRMS Workforce Register Template',
    'قالب سجل القوى العاملة ونظام الموارد البشرية',
    'Human Capital', 'Read-Only API Credentials']
].map(([code, nameEn, nameAr, category, authType], i) => ({
  id: uid('a9000000', i + 1),
  organization_id: ORG,
  code,
  name_en: nameEn,
  name_ar: nameAr,
  category,
  auth_type: authType,
  records_synced_count: 0,
  last_sync_status: 'NOT_CONFIGURED',
  status: 'not_configured',
  config: json({ configured: false, credentials: null, note: 'Template only — awaiting tenant credentials. No data has been synced.' })
}));

// ── audit_logs (~12) ─────────────────────────────────────────────────────────
const AUDIT_LOG_COLUMNS = [
  'id', 'organization_id', 'user_id', 'action', 'entity_type', 'entity_id', 'details',
  'ip_address', 'user_agent'
];

const AUDIT_LOGS = [
  [CLIENT_USER, 'USER_LOGIN', 'USER', CLIENT_USER, { method: 'password', mfa: false }],
  [CLIENT_USER, 'DECISION_EXECUTED', 'TENANT_DECISION', DECISIONS[9].id, { title: DECISIONS[9].title }],
  [CLIENT_USER, 'DECISION_EXECUTED', 'TENANT_DECISION', DECISIONS[10].id, { title: DECISIONS[10].title }],
  [SAAD, 'RISK_MITIGATION_ACTIVATED', 'TENANT_RISK', RISKS[7].id, { code: 'RSK-007' }],
  [CLIENT_USER, 'DATA_QUALITY_SCAN_EXECUTED', 'DATA_QUALITY_AUDIT', ORG, { scannedBy: 'client@mikhlafi-holding.com' }],
  [CLIENT_USER, 'CUSTOMER_EXECUTIVE_REVIEW_SCHEDULED', 'TENANT_CUSTOMER', CUSTOMERS[2].id, { code: 'CUST-203' }],
  [CLIENT_USER, 'PROJECT_CLAIMS_VERIFIED', 'TENANT_PROJECT', PROJECTS[0].id, { code: 'PRJ-2026-01' }],
  [SAAD, 'INTEGRATION_TEMPLATE_VIEWED', 'TENANT_INTEGRATION', INTEGRATIONS[0].id, { code: 'SAP-ERP-TEMPLATE' }],
  [CLIENT_USER, 'WORKSPACE_SETTINGS_UPDATED', 'TENANT_SETTINGS', ORG, { baseCurrency: 'SAR', dataClassification: 'RESTRICTED' }],
  [CLIENT_USER, 'ALERT_ACKNOWLEDGED', 'TENANT_ALERT', ALERTS[2].id, { severity: 'warning' }],
  [SAAD, 'AUDIT_LOG_VIEWED', 'AUDIT_LOG', ORG, { scope: 'organization' }],
  [CLIENT_USER, 'REPORT_EXPORTED', 'FINANCIAL_ANALYTICS', ORG, { format: 'xlsx', demoFixture: true }]
].map(([userId, action, entityType, entityId, details], i) => ({
  id: uid('b7000000', i + 1),
  organization_id: ORG,
  user_id: userId,
  action,
  entity_type: entityType,
  entity_id: String(entityId),
  details: json(Object.assign({ demoFixture: true }, details)),
  ip_address: '10.20.30.' + (40 + i),
  user_agent: 'DemoSeeder/1.0 (fixture)'
}));

// ── ai_assistant_logs (~4) ───────────────────────────────────────────────────
const AI_LOG_COLUMNS = [
  'id', 'organization_id', 'user_id', 'query_text', 'response_text', 'citations'
];

const AI_LOGS = [
  ['Which procurement decisions carry the highest financial impact right now?',
    'Demo assistant response: the highest-impact open items are the cement and aggregates contract renegotiation and the second-source framework agreement. These are demo fixtures, not measured outcomes.',
    [{ source: 'tenant_decisions', ref: 'category = Procurement' }]],
  ['Summarise the current open risk exposure by category.',
    'Demo assistant response: exposure is concentrated in liquidity, cybersecurity and supply chain categories; two items are marked mitigated. Demo fixture summary only.',
    [{ source: 'tenant_risks', ref: 'ORDER BY financial_exposure_sar DESC' }]],
  ['Which suppliers show the largest price creep?',
    'Demo assistant response: the cement and aggregates supplier shows the largest synthetic price drift, followed by the facilities maintenance subcontractor. Demo fixture data.',
    [{ source: 'tenant_suppliers', ref: 'price_creep_pct' }]],
  ['Which customers are at highest churn risk this quarter?',
    'Demo assistant response: two demo accounts show elevated churn probability with renewal dates inside the next quarter. Demo fixture data, not a prediction of real accounts.',
    [{ source: 'tenant_customers', ref: 'churn_probability' }]]
].map(([q, a, citations], i) => ({
  id: uid('b8000000', i + 1),
  organization_id: ORG,
  user_id: CLIENT_USER,
  query_text: q,
  response_text: a,
  citations: json(citations)
}));

// ── lead_inquiries (~7, global, fixed ids) ───────────────────────────────────
const LEAD_COLUMNS = ['id', 'name', 'email', 'company_name', 'phone', 'inquiry_type', 'message', 'status'];

const LEADS = [
  ['Noura Al-Harbi', 'noura.alharbi@example-gulf-industrial.test', 'Gulf Industrial Coatings (Demo)',
    '+966500000101', 'demo_request', 'Interested in a guided walkthrough of the supplier intelligence module.', 'NEW'],
  ['Omar Al-Shammari', 'omar.shammari@example-najd-logistics.test', 'Najd Logistics Services (Demo)',
    '+966500000102', 'pricing', 'Please share annual pricing for the enterprise tier with three branches.', 'IN_REVIEW'],
  ['Layla Al-Qahtani', 'layla.qahtani@example-redsea-ports.test', 'Red Sea Ports Group (Demo)',
    '+966500000103', 'partnership', 'Exploring an implementation partnership for the eastern region.', 'CONTACTED'],
  ['Khalid Al-Otaibi', 'khalid.otaibi@example-metro-facilities.test', 'Metropolitan Facilities Group (Demo)',
    '+966500000104', 'demo_request', 'Would like a demo focused on project performance and claims audit.', 'CONTACTED'],
  ['Sara Al-Dosari', 'sara.dosari@example-pharma-industrial.test', 'Saudi Pharma Industrial Group (Demo)',
    '+966500000105', 'security_review', 'Requesting a security and data residency questionnaire before evaluation.', 'IN_REVIEW'],
  ['Faisal Al-Zahrani', 'faisal.zahrani@example-agri-supply.test', 'Central Agricultural Supply Co. (Demo)',
    '+966500000106', 'demo_request', 'Interested in data quality and reconciliation capabilities.', 'CONVERTED'],
  ['Maha Al-Anzi', 'maha.anzi@example-north-water.test', 'Northern Region Water Utility (Demo)',
    '+966500000107', 'support', 'Evaluated last quarter; re-engaging after a budget review.', 'ARCHIVED']
].map(([name, email, company, phone, type, message, status], i) => ({
  id: uid('c2000000', i + 1),
  name,
  email,
  company_name: company,
  phone,
  inquiry_type: type,
  message,
  status
}));

// ── Financial fixtures: invoices, line items, anomalies ──────────────────────
const INVOICE_MONTHS = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];

const INVOICE_VENDORS = [
  ['Global Logistics Co.', 'SA4420000001234567890123', '520200', 'Logistics & Freight'],
  ['Al-Yamama Cement & Aggregates', 'SA8810000009876543210987', '510100', 'Raw Materials'],
  ['Red Sea Industrial Equipment', 'SA2250000004561237896541', '510200', 'Industrial Equipment'],
  ['Saudi Cloud Systems & Tech', 'SA3340000007654321098765', '540400', 'IT & Cloud Services'],
  ['Rawabi Engineering Contracting', 'SA6630000001122334455667', '530300', 'Subcontractors'],
  ['Eastern Pipe & Industrial Mill', 'SA9910000007788990011223', '510300', 'Pipes & Fittings'],
  ['National Facilities Services Group', 'SA7780000002233445566778', '550500', 'Facilities & Maintenance'],
  ['Gulf Advisory & Compliance Partners', 'SA5530000006655443322110', '560600', 'Professional Services']
].map(([vendor_name, vendor_iban, account_number, category]) => ({ vendor_name, vendor_iban, account_number, category }));

const INVOICE_BRANCHES = [HQ, BR_JED, BR_DMM, BR_MED];

const INVOICE_ROWS = [];
{
  let seq = 0;
  for (let m = 0; m < INVOICE_MONTHS.length; m++) {
    const month = INVOICE_MONTHS[m];
    for (let v = 0; v < 4; v++) {
      seq += 1;
      const vendor = INVOICE_VENDORS[(m * 3 + v) % INVOICE_VENDORS.length];
      const amount = Number((18000 + ((m * 37 + v * 53) % 14) * 9250).toFixed(2));
      let status = 'PAID';
      if (seq % 7 === 0) status = 'DISPUTED';
      else if (seq % 5 === 0) status = 'PENDING';
      else if (seq % 11 === 0) status = 'FROZEN';
      const day = String(5 + ((m * 4 + v * 3) % 23)).padStart(2, '0');
      INVOICE_ROWS.push({
        id: uid('b1000000', seq),
        organization_id: ORG,
        branch_id: INVOICE_BRANCHES[(m + v) % INVOICE_BRANCHES.length],
        invoice_number: `INV-DEMO-${String(1000 + seq)}`,
        vendor_name: vendor.vendor_name,
        vendor_iban: vendor.vendor_iban,
        issue_date: `${month}-${day}`,
        due_date: null,
        po_reference: `PO-${String(8000 + seq)}`,
        grn_reference: `GRN-${String(4000 + seq)}`,
        total_amount: amount,
        currency: 'SAR',
        status,
        source_system: 'DEMO_FEED',
        details: json({ demoFixture: true, category: vendor.category })
      });
    }
  }

  // Deliberate duplicate invoice to exercise RULE_DUP_INVOICE_HASH.
  const original = INVOICE_ROWS[1];
  INVOICE_ROWS.push({
    id: uid('b1000000', 25),
    organization_id: ORG,
    branch_id: HQ,
    invoice_number: 'INV-DEMO-1025',
    vendor_name: original.vendor_name,
    vendor_iban: original.vendor_iban,
    issue_date: '2026-10-16',
    due_date: null,
    po_reference: 'PO-8999',
    grn_reference: 'GRN-4999',
    total_amount: original.total_amount,
    currency: 'SAR',
    status: 'PENDING',
    source_system: 'DEMO_FEED',
    details: json({ demoFixture: true, duplicateOf: original.invoice_number })
  });
}

// ── Journal entries (~80+) ───────────────────────────────────────────────────
const JOURNAL_MONTHS = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];

const REVENUE_LINES = [
  { account_number: '410100', en: 'Commercial revenue — goods', ar: 'إيرادات تجارية — بضائع' },
  { account_number: '410200', en: 'Service revenue — long-term contracts', ar: 'إيرادات خدمات — عقود طويلة الأجل' },
  { account_number: '420100', en: 'Other operating income', ar: 'إيرادات تشغيلية أخرى' }
];

const COST_LINES = [
  { account_number: '510100', vendor: 'Al-Yamama Cement & Aggregates', en: 'Raw materials — aggregates', ar: 'مواد خام — ركام' },
  { account_number: '510200', vendor: 'Red Sea Industrial Equipment', en: 'Industrial equipment spares', ar: 'قطع غيار معدات صناعية' },
  { account_number: '520200', vendor: 'Global Logistics Co.', en: 'Logistics and freight', ar: 'خدمات لوجستية وشحن' },
  { account_number: '530300', vendor: 'Rawabi Engineering Contracting', en: 'Subcontractor packages', ar: 'حزم مقاولات فرعية' },
  { account_number: '540400', vendor: 'Saudi Cloud Systems & Tech', en: 'IT and cloud services', ar: 'خدمات تقنية وسحابية' },
  { account_number: '550500', vendor: 'National Facilities Services Group', en: 'Facilities and maintenance', ar: 'مرافق وصيانة' },
  { account_number: '560600', vendor: 'Gulf Advisory & Compliance Partners', en: 'Professional advisory services', ar: 'خدمات استشارية مهنية' },
  { account_number: '570700', vendor: 'Eastern Power Distribution Services', en: 'Energy and utilities', ar: 'طاقة ومرافق' },
  { account_number: '580800', vendor: 'Najd Workforce Solutions', en: 'Workforce and training', ar: 'قوى عاملة وتدريب' },
  { account_number: '590900', vendor: 'Coastal Marketing Partners', en: 'Marketing and communications', ar: 'تسويق واتصالات' }
];

const JOURNAL_COLUMNS = [
  'id', 'organization_id', 'batch_id', 'posting_date', 'document_number', 'account_number',
  'vendor_number', 'vendor_name', 'amount_sar', 'debit_credit', 'text_narrative',
  'is_flagged', 'flag_reason'
];

function buildJournalEntries() {
  const entries = [];
  let seq = 0;
  for (let m = 0; m < JOURNAL_MONTHS.length; m++) {
    const month = JOURNAL_MONTHS[m];
    const batchId = uid('b4100000', m + 1);
    const day = (n) => String(n).padStart(2, '0');

    // Revenue recognised on the debit/inflow side. NOTE: the tenant financial
    // analytics engine maps debit_credit 'S' -> inflows and 'H' -> outflows.
    REVENUE_LINES.forEach((line, i) => {
      seq += 1;
      const amount = 420000 + i * 180000 + m * 35000;
      entries.push({
        id: uid('b4000000', seq),
        organization_id: ORG,
        batch_id: batchId,
        posting_date: `${month}-${day(15 + i)}`,
        document_number: `JE-${month.replace('-', '')}-${String(seq).padStart(3, '0')}`,
        account_number: line.account_number,
        vendor_number: null,
        vendor_name: null,
        amount_sar: amount,
        debit_credit: 'S',
        text_narrative: `${line.en} / ${line.ar} — ${month} (demo fixture)`,
        is_flagged: false,
        flag_reason: null
      });
    });

    COST_LINES.forEach((line, i) => {
      seq += 1;
      const amount = 42000 + ((m * 13 + i * 17) % 9) * 11500;
      entries.push({
        id: uid('b4000000', seq),
        organization_id: ORG,
        batch_id: batchId,
        posting_date: `${month}-${day(4 + ((i * 2) % 24))}`,
        document_number: `JE-${month.replace('-', '')}-${String(seq).padStart(3, '0')}`,
        account_number: line.account_number,
        vendor_number: `V-${1000 + i}`,
        vendor_name: line.vendor,
        amount_sar: amount,
        debit_credit: 'H',
        text_narrative: `${line.en} / ${line.ar} — ${month} (demo fixture)`,
        is_flagged: false,
        flag_reason: null
      });
    });
  }

  // Deliberate duplicates: same document number + amount as an existing cost entry,
  // posted two days later. Exercises explainable duplicate-disbursement rules.
  const dupSources = entries.filter((e) => e.vendor_name === 'Global Logistics Co.').slice(0, 2);
  dupSources.forEach((src, i) => {
    seq += 1;
    const dupDate = new Date(src.posting_date + 'T00:00:00Z');
    dupDate.setUTCDate(dupDate.getUTCDate() + 2);
    entries.push({
      id: uid('b4000000', seq),
      organization_id: ORG,
      batch_id: uid('b4200000', i + 1),
      posting_date: dupDate.toISOString().slice(0, 10),
      document_number: src.document_number,
      account_number: src.account_number,
      vendor_number: src.vendor_number,
      vendor_name: src.vendor_name,
      amount_sar: src.amount_sar,
      debit_credit: src.debit_credit,
      text_narrative: 'Duplicate posting of a previously disbursed logistics entry (demo fixture)',
      is_flagged: true,
      flag_reason: 'Duplicate disbursement match detected on identical vendor, document number and amount'
    });
  });

  // Amounts deliberately placed just under the 100,000 SAR approval threshold.
  const thresholdSpecs = [
    { amount: 99900, reason: 'Payment structured immediately below the 100,000 SAR delegated approval threshold' },
    { amount: 99850, reason: 'Second occurrence of an amount just below the 100,000 SAR approval threshold' }
  ];
  thresholdSpecs.forEach((spec, i) => {
    seq += 1;
    entries.push({
      id: uid('b4000000', seq),
      organization_id: ORG,
      batch_id: uid('b4300000', i + 1),
      posting_date: '2026-10-14',
      document_number: `JE-202610-THR-${i + 1}`,
      account_number: '560600',
      vendor_number: 'V-1005',
      vendor_name: 'Gulf Advisory & Compliance Partners',
      amount_sar: spec.amount,
      debit_credit: 'H',
      text_narrative: 'Advisory retainer tranche held below the approval threshold (demo fixture)',
      is_flagged: true,
      flag_reason: spec.reason
    });
  });

  // Amounts that match the platform's statutory-threshold structuring rule.
  const statutorySpecs = [499000, 499500];
  statutorySpecs.forEach((amount, i) => {
    seq += 1;
    entries.push({
      id: uid('b4000000', seq),
      organization_id: ORG,
      batch_id: uid('b4400000', i + 1),
      posting_date: '2026-10-16',
      document_number: `JE-202610-STR-${i + 1}`,
      account_number: '530300',
      vendor_number: 'V-1003',
      vendor_name: 'Rawabi Engineering Contracting',
      amount_sar: amount,
      debit_credit: 'H',
      text_narrative: 'Progress payment held immediately below the statutory approval threshold (demo fixture)',
      is_flagged: true,
      flag_reason: 'Potential structuring anomaly: payment structured immediately below the 500,000 SAR statutory approval threshold'
    });
  });

  return entries;
}

// ==============================================================================
// MAIN SEEDER
// ==============================================================================

/**
 * Idempotently seeds realistic demo fixture data for the canonical demo org.
 * Runs inside a single transaction. Safe to run repeatedly.
 *
 * @returns {Promise<object>} row counts per table
 */
export async function seedDemoWorkspace() {
  console.log(`[Seed] Starting demo workspace seeding for organization ${DEMO_ORG_ID} (${DEMO_ORG_SLUG})`);

  // ── Pre-flight guard: the canonical demo organization must already exist ───
  const orgCheck = await query('SELECT id FROM organizations WHERE id = $1', [ORG]);
  if (orgCheck.rows.length === 0) {
    throw new Error(
      `[Seed] Demo organization ${DEMO_ORG_ID} not found. Run migrations first (runMigrations()) so migration 004 can create it.`
    );
  }

  const counts = {};

  await transaction(async (tx) => {
    const q = (sql, params) => tx.query(sql, params);

    // ── Ensure the demo HQ branch exists and add extra demo branches ─────────
    // The HQ branch is migration-004 managed and is never deleted (memberships
    // reference it). Extra branches are upserted by fixed id for idempotency.
    await q(
      `INSERT INTO branches (id, organization_id, code, name_ar, name_en, city, is_main_hq, status)
       VALUES ($1, $2, 'HQ-01', 'المقر الرئيسي - الرياض', 'Riyadh Corporate Headquarters', 'Riyadh', true, 'active')
       ON CONFLICT (id) DO UPDATE SET organization_id = EXCLUDED.organization_id`,
      [HQ, ORG]
    );
    for (const b of BRANCHES) {
      await q(
        `INSERT INTO branches (id, organization_id, code, name_ar, name_en, city, is_main_hq, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           organization_id = EXCLUDED.organization_id,
           code = EXCLUDED.code,
           name_ar = EXCLUDED.name_ar,
           name_en = EXCLUDED.name_en,
           city = EXCLUDED.city,
           is_main_hq = EXCLUDED.is_main_hq,
           status = EXCLUDED.status,
           updated_at = now()`,
        [b.id, b.organization_id, b.code, b.name_ar, b.name_en, b.city, b.is_main_hq, b.status]
      );
    }
    counts.branches_upserted = BRANCHES.length + 1;

    // ── Delete existing demo data (children before parents) ──────────────────
    console.log('[Seed] Clearing existing demo-organization fixture rows...');
    await q(
      `DELETE FROM financial_line_items
       WHERE invoice_id IN (SELECT id FROM financial_invoices WHERE organization_id = $1)`,
      [ORG]
    );
    await q('DELETE FROM financial_anomalies WHERE organization_id = $1', [ORG]);
    await q('DELETE FROM financial_invoices WHERE organization_id = $1', [ORG]);
    await q('DELETE FROM tenant_journal_entries WHERE organization_id = $1', [ORG]);
    await q('DELETE FROM tenant_decisions WHERE organization_id = $1', [ORG]);
    await q('DELETE FROM tenant_risks WHERE organization_id = $1', [ORG]);
    await q('DELETE FROM tenant_projects WHERE organization_id = $1', [ORG]);
    await q('DELETE FROM tenant_suppliers WHERE organization_id = $1', [ORG]);
    await q('DELETE FROM tenant_customers WHERE organization_id = $1', [ORG]);
    await q('DELETE FROM data_quality_audits WHERE organization_id = $1', [ORG]);
    await q('DELETE FROM tenant_alerts WHERE organization_id = $1', [ORG]);
    await q('DELETE FROM tenant_workflows WHERE organization_id = $1', [ORG]);
    await q('DELETE FROM tenant_integrations WHERE organization_id = $1', [ORG]);
    await q('DELETE FROM audit_logs WHERE organization_id = $1', [ORG]);
    await q('DELETE FROM ai_assistant_logs WHERE organization_id = $1', [ORG]);
    await q('DELETE FROM organization_usage WHERE organization_id = $1', [ORG]);
    await q('DELETE FROM organization_subscriptions WHERE organization_id = $1', [ORG]);
    await q(
      `DELETE FROM lead_inquiries WHERE id = ANY($1::uuid[])`,
      [LEADS.map((l) => l.id)]
    );

    // ── Insert: decisions ────────────────────────────────────────────────────
    counts.tenant_decisions = await insertRows(tx, 'tenant_decisions', DECISION_COLUMNS, DECISIONS);

    // ── Insert: risks ────────────────────────────────────────────────────────
    counts.tenant_risks = await insertRows(tx, 'tenant_risks', RISK_COLUMNS, RISKS);

    // ── Insert: projects ─────────────────────────────────────────────────────
    counts.tenant_projects = await insertRows(tx, 'tenant_projects', PROJECT_COLUMNS, PROJECTS);

    // ── Insert: suppliers ────────────────────────────────────────────────────
    counts.tenant_suppliers = await insertRows(tx, 'tenant_suppliers', SUPPLIER_COLUMNS, SUPPLIERS);

    // ── Insert: customers ────────────────────────────────────────────────────
    counts.tenant_customers = await insertRows(tx, 'tenant_customers', CUSTOMER_COLUMNS, CUSTOMERS);

    // ── Insert: data quality audits ──────────────────────────────────────────
    counts.data_quality_audits = await insertRows(tx, 'data_quality_audits', DQ_COLUMNS, DQ_AUDITS);

    // ── Insert: alerts ───────────────────────────────────────────────────────
    counts.tenant_alerts = await insertRows(tx, 'tenant_alerts', ALERT_COLUMNS, ALERTS);

    // ── Upsert: settings (single row per organization) ───────────────────────
    await q(
      `INSERT INTO tenant_settings (
         organization_id, base_currency, calendar_standard, retention_policy,
         data_classification, encryption_standard, updated_at
       ) VALUES ($1, 'SAR', 'gregorian', '7years', 'RESTRICTED', 'AES-256-GCM', now())
       ON CONFLICT (organization_id) DO UPDATE SET
         base_currency = EXCLUDED.base_currency,
         calendar_standard = EXCLUDED.calendar_standard,
         retention_policy = EXCLUDED.retention_policy,
         data_classification = EXCLUDED.data_classification,
         encryption_standard = EXCLUDED.encryption_standard,
         updated_at = now()`,
      [ORG]
    );
    counts.tenant_settings = 1;

    // ── Insert: workflows (templates, zero executions) ───────────────────────
    counts.tenant_workflows = await insertRows(tx, 'tenant_workflows', WORKFLOW_COLUMNS, WORKFLOWS);

    // ── Insert: integrations (honestly not configured) ───────────────────────
    counts.tenant_integrations = await insertRows(tx, 'tenant_integrations', INTEGRATION_COLUMNS, INTEGRATIONS);

    // ── Insert: financial invoices ───────────────────────────────────────────
    counts.financial_invoices = await insertRows(tx, 'financial_invoices', [
      'id', 'organization_id', 'branch_id', 'invoice_number', 'vendor_name', 'vendor_iban',
      'issue_date', 'due_date', 'po_reference', 'grn_reference', 'total_amount', 'currency',
      'status', 'source_system', 'details'
    ], INVOICE_ROWS);

    // ── Insert: financial line items (two per invoice) ───────────────────────
    const lineItems = [];
    for (const inv of INVOICE_ROWS) {
      const half = Number((inv.total_amount / 2).toFixed(2));
      lineItems.push({
        id: uid('b2000000', inv.invoice_number.endsWith('1025') ? 501 : Number(inv.invoice_number.slice(-4)) * 10 + 1),
        invoice_id: inv.id,
        description: `Consumables and materials batch — ${inv.vendor_name}`,
        item_code: `ITM-${inv.invoice_number.slice(-4)}-A`,
        quantity: 1,
        unit_price: half,
        line_total: half,
        currency: 'SAR'
      });
      lineItems.push({
        id: uid('b2000000', inv.invoice_number.endsWith('1025') ? 502 : Number(inv.invoice_number.slice(-4)) * 10 + 2),
        invoice_id: inv.id,
        description: `Freight, handling and installation — ${inv.vendor_name}`,
        item_code: `ITM-${inv.invoice_number.slice(-4)}-B`,
        quantity: 1,
        unit_price: Number((inv.total_amount - half).toFixed(2)),
        line_total: Number((inv.total_amount - half).toFixed(2)),
        currency: 'SAR'
      });
    }
    counts.financial_line_items = await insertRows(tx, 'financial_line_items', [
      'id', 'invoice_id', 'description', 'item_code', 'quantity', 'unit_price', 'line_total', 'currency'
    ], lineItems);

    // ── Insert: financial anomalies ──────────────────────────────────────────
    const invByNumber = (num) => (INVOICE_ROWS.find((i) => i.invoice_number === num) || {}).id || null;
    const anomalyColumns = [
      'id', 'organization_id', 'branch_id', 'case_number', 'rule_code', 'severity',
      'confidence_pct', 'target_vendor', 'flagged_amount', 'currency', 'narrative_en',
      'narrative_ar', 'status', 'primary_invoice_id', 'matched_invoice_id', 'action_notes'
    ];
    const anomalies = [
      {
        case_number: 'CASE-DEMO-001', rule_code: 'RULE_DUP_INVOICE_HASH', severity: 'CRITICAL',
        confidence_pct: 98.4, target_vendor: 'Global Logistics Co.', flagged_amount: 48500, currency: 'SAR',
        narrative_en: 'Two invoices carry identical line items, vendor IBAN and monetary value within a 48-hour window. Flagged for review before batch payout. (Demo fixture.)',
        narrative_ar: 'فاتورتان تحملان نفس البنود ونفس الحساب البنكي ونفس القيمة خلال 48 ساعة. مُدرجة للمراجعة قبل اعتماد الدفعة. (بيانات عرض تجريبية.)',
        status: 'DETECTED', primary_invoice_id: invByNumber('INV-DEMO-1025'), matched_invoice_id: invByNumber('INV-DEMO-1002'),
        action_notes: null
      },
      {
        case_number: 'CASE-DEMO-002', rule_code: 'RULE_PO_PRICE_DRIFT', severity: 'HIGH',
        confidence_pct: 93.1, target_vendor: 'Al-Yamama Cement & Aggregates', flagged_amount: 82400, currency: 'SAR',
        narrative_en: 'Unit rate charged exceeds the contracted schedule of rates by +16.5%. (Demo fixture, not a measured outcome.)',
        narrative_ar: 'سعر الوحدة المفوتر يتجاوز جدول الأسعار التعاقدي بنسبة +16.5%. (بيانات عرض تجريبية وليست نتيجة مقاسة.)',
        status: 'DETECTED', primary_invoice_id: invByNumber('INV-DEMO-1006'), matched_invoice_id: null,
        action_notes: null
      },
      {
        case_number: 'CASE-DEMO-003', rule_code: 'RULE_EARLY_PAYMENT_DISCOUNT', severity: 'MEDIUM',
        confidence_pct: 91.6, target_vendor: 'Red Sea Industrial Equipment', flagged_amount: 14200, currency: 'SAR',
        narrative_en: 'A 2/10 Net 30 early settlement discount was not captured due to approval queue latency. (Demo fixture.)',
        narrative_ar: 'لم يتم تحصيل خصم السداد المبكر (2/10 صافي 30) بسبب تأخر مسار الاعتماد. (بيانات عرض تجريبية.)',
        status: 'DETECTED', primary_invoice_id: invByNumber('INV-DEMO-1009'), matched_invoice_id: null,
        action_notes: null
      },
      {
        case_number: 'CASE-DEMO-004', rule_code: 'RULE_DUP_INVOICE_HASH', severity: 'HIGH',
        confidence_pct: 95.7, target_vendor: 'Saudi Cloud Systems & Tech', flagged_amount: 31200, currency: 'SAR',
        narrative_en: 'Suspected repeat submission mapped to an already-settled invoice reference. (Demo fixture.)',
        narrative_ar: 'اشتباه في إعادة تقديم مرتبطة بمرجع فاتورة مُسدد سابقاً. (بيانات عرض تجريبية.)',
        status: 'FROZEN', primary_invoice_id: invByNumber('INV-DEMO-1014'), matched_invoice_id: invByNumber('INV-DEMO-1013'),
        action_notes: 'Demo fixture: payment held pending manual reconciliation.'
      },
      {
        case_number: 'CASE-DEMO-005', rule_code: 'RULE_PO_PRICE_DRIFT', severity: 'CRITICAL',
        confidence_pct: 97.2, target_vendor: 'Rawabi Engineering Contracting', flagged_amount: 142000, currency: 'SAR',
        narrative_en: 'Civil works line items exceed the agreed rate card materially across one invoice. (Demo fixture.)',
        narrative_ar: 'بنود الأعمال المدنية تتجاوز جدول الأسعار المتفق عليه بشكل ملحوظ في إحدى الفواتير. (بيانات عرض تجريبية.)',
        status: 'DETECTED', primary_invoice_id: invByNumber('INV-DEMO-1019'), matched_invoice_id: null,
        action_notes: null
      },
      {
        case_number: 'CASE-DEMO-005B', rule_code: 'RULE_PAYMENT_STRUCTURING', severity: 'MEDIUM',
        confidence_pct: 88.9, target_vendor: 'Gulf Advisory & Compliance Partners', flagged_amount: 99900, currency: 'SAR',
        narrative_en: 'Two advisory retainer amounts sit immediately below the 100,000 SAR delegated approval threshold. (Demo fixture.)',
        narrative_ar: 'مبلغان لدفعات استشارية يقعان مباشرة دون حد الاعتماد المفوض (100,000 ريال). (بيانات عرض تجريبية.)',
        status: 'DETECTED', primary_invoice_id: null, matched_invoice_id: null,
        action_notes: null
      },
      {
        case_number: 'CASE-DEMO-006', rule_code: 'RULE_EARLY_PAYMENT_DISCOUNT', severity: 'LOW',
        confidence_pct: 86.2, target_vendor: 'Eastern Pipe & Industrial Mill', flagged_amount: 6400, currency: 'SAR',
        narrative_en: 'Minor discount forfeiture recorded on a settled invoice. (Demo fixture.)',
        narrative_ar: 'خسارة خصم بسيطة مسجلة على فاتورة مسددة. (بيانات عرض تجريبية.)',
        status: 'RESOLVED', primary_invoice_id: invByNumber('INV-DEMO-1021'), matched_invoice_id: null,
        action_notes: 'Reviewed and closed by the demo workspace owner — fixture record only.'
      },
      {
        case_number: 'CASE-DEMO-007', rule_code: 'RULE_DUP_INVOICE_HASH', severity: 'MEDIUM',
        confidence_pct: 90.0, target_vendor: 'National Facilities Services Group', flagged_amount: 12750, currency: 'SAR',
        narrative_en: 'Duplicate line fingerprint matched but validated as a legitimate split delivery. (Demo fixture.)',
        narrative_ar: 'تطابق بصمة البنود ولكن تم التحقق من كونه تسليماً مقسماً مشروعاً. (بيانات عرض تجريبية.)',
        status: 'LEGITIMATE', primary_invoice_id: invByNumber('INV-DEMO-1014'), matched_invoice_id: invByNumber('INV-DEMO-1013'),
        action_notes: 'Confirmed legitimate by the demo reviewer — fixture record only.'
      }
    ].map((a, i) => Object.assign({
      id: uid('b3000000', i + 1),
      organization_id: ORG,
      branch_id: HQ
    }, a));
    counts.financial_anomalies = await insertRows(tx, 'financial_anomalies', anomalyColumns, anomalies);

    // ── Insert: journal entries ──────────────────────────────────────────────
    const journalEntries = buildJournalEntries();
    counts.tenant_journal_entries = await insertRows(tx, 'tenant_journal_entries', JOURNAL_COLUMNS, journalEntries);

    // ── Insert: audit logs ───────────────────────────────────────────────────
    counts.audit_logs = await insertRows(tx, 'audit_logs', AUDIT_LOG_COLUMNS, AUDIT_LOGS);

    // ── Insert: AI assistant logs ────────────────────────────────────────────
    counts.ai_assistant_logs = await insertRows(tx, 'ai_assistant_logs', AI_LOG_COLUMNS, AI_LOGS);

    // ── Insert: organization subscription ────────────────────────────────────
    await q(
      `INSERT INTO organization_subscriptions (
         id, organization_id, package_id, status, billing_interval,
         current_period_start, current_period_end
       ) VALUES ($1, $2, 'plan_enterprise', 'active', 'annual',
         now() - interval '30 days', now() + interval '335 days')`,
      [uid('c3000000', 1), ORG]
    );
    counts.organization_subscriptions = 1;

    // ── Insert: organization usage (monthly accounting) ──────────────────────
    const usageRows = [
      ['2026-04', 128400],
      ['2026-05', 152900],
      ['2026-06', 176300],
      ['2026-07', 141750],
      ['2026-08', 198220],
      ['2026-09', 214600],
      ['2026-10', 96480]
    ].map(([period_key, records], i) => ({
      id: uid('c4000000', i + 1),
      organization_id: ORG,
      period_key,
      records_processed: records
    }));
    counts.organization_usage = await insertRows(tx, 'organization_usage', [
      'id', 'organization_id', 'period_key', 'records_processed'
    ], usageRows);

    // ── Insert: lead inquiries (global) ──────────────────────────────────────
    counts.lead_inquiries = await insertRows(tx, 'lead_inquiries', LEAD_COLUMNS, LEADS);
  });

  // ── Logging (one line per seeded table) ─────────────────────────────────────
  const logOrder = [
    'tenant_decisions', 'tenant_risks', 'tenant_projects', 'tenant_suppliers', 'tenant_customers',
    'data_quality_audits', 'tenant_alerts', 'tenant_settings', 'tenant_workflows', 'tenant_integrations',
    'financial_invoices', 'financial_line_items', 'financial_anomalies', 'tenant_journal_entries',
    'audit_logs', 'ai_assistant_logs', 'organization_subscriptions', 'organization_usage',
    'lead_inquiries', 'branches_upserted'
  ];
  for (const table of logOrder) {
    console.log(`[Seed] ${table}: ${counts[table]} row(s)`);
  }
  console.log('[Seed] Demo workspace seeding completed successfully (all data is labelled demo fixture data).');

  return Object.assign({ success: true, organizationId: DEMO_ORG_ID, organizationSlug: DEMO_ORG_SLUG }, counts);
}

// Allow direct CLI execution: node apps/api/src/db/seedDemoWorkspace.js
if (process.argv[1] && process.argv[1].endsWith('seedDemoWorkspace.js')) {
  (async () => {
    try {
      await runMigrations();
      const result = await seedDemoWorkspace();
      console.log('[Seed CLI Output]:', JSON.stringify(result, null, 2));
      await closeDb();
    } catch (err) {
      console.error('[Seed CLI Fatal Error]:', err);
      try {
        await closeDb();
      } catch {
        // ignore close errors
      }
      process.exit(1);
    }
  })();
}
