-- MIKHLAFI LABS — 004_seed_executive_demo.sql
-- Seeds the canonical Executive Demo User & Organization (saad@mikhlafi-labs.com)
-- Pre-configured with Platform Super Admin + Enterprise Workspace Ownership

-- 1. Insert Executive User (if not exists)
INSERT INTO users (
  id,
  email,
  password_hash,
  name_en,
  name_ar,
  is_verified,
  is_platform_admin,
  status
) VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'saad@mikhlafi-labs.com',
  'scrypt$0c98e45748b8c347021cc4ab1cd48231$e2d60bb9c254aa9e4c4eb393d91be071ee30ea14da358ece93a3e2ea500c22163a5b996eb464530baf84ba08e688bdc1efd96d788fa631caf7d8128f0cfce73f',
  'Saad Al-Mikhlafi',
  'سعد المخلافي',
  true,
  true,
  'active'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  is_platform_admin = true,
  status = 'active';

-- 2. Insert Executive Organization
INSERT INTO organizations (
  id,
  slug,
  name_en,
  name_ar,
  default_currency,
  default_locale,
  timezone,
  status
) VALUES (
  'c0000000-0000-0000-0000-000000000002',
  'mikhlafi-group',
  'Mikhlafi Labs Group',
  'مجموعة مخلافي القابضة',
  'SAR',
  'ar',
  'Asia/Riyadh',
  'active'
)
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Main Headquarters Branch
INSERT INTO branches (
  id,
  organization_id,
  code,
  name_en,
  name_ar,
  city,
  is_main_hq,
  status
) VALUES (
  'c0000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000002',
  'HQ-01',
  'Riyadh Corporate Headquarters',
  'المقر الرئيسي - الرياض',
  'Riyadh',
  true,
  'active'
)
ON CONFLICT DO NOTHING;

-- 4. Assign Executive Owner Membership
INSERT INTO memberships (
  user_id,
  organization_id,
  branch_id,
  role,
  status
) VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000003',
  'org_owner',
  'active'
)
ON CONFLICT (user_id, organization_id) DO UPDATE SET
  role = 'org_owner',
  status = 'active';

-- 5. Provision Enterprise Subscription Package
INSERT INTO organization_subscriptions (
  organization_id,
  package_id,
  status,
  billing_interval
) VALUES (
  'c0000000-0000-0000-0000-000000000002',
  'plan_enterprise',
  'active',
  'annual'
)
ON CONFLICT (organization_id) DO NOTHING;

-- 6. Seed Initial Operational Decisions
INSERT INTO tenant_decisions (
  organization_id,
  branch_id,
  title,
  category,
  impact_amount,
  currency,
  risk_level,
  status
) VALUES
  ('c0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'Single-Source Cement Supplier Price Drift (+16.5%)', 'Procurement', 362400.00, 'SAR', 'CRITICAL', 'PENDING'),
  ('c0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'Early Payment Discount Capture on Q3 Logistics Batches', 'Working Capital', 145000.00, 'SAR', 'HIGH', 'PENDING'),
  ('c0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'Subcontractor Milestone Variance Delay Claim Mitigation', 'Project Governance', 540000.00, 'SAR', 'MEDIUM', 'PENDING')
ON CONFLICT DO NOTHING;

-- 7. Seed Financial Invoices
INSERT INTO financial_invoices (
  id,
  organization_id,
  branch_id,
  invoice_number,
  vendor_name,
  vendor_iban,
  issue_date,
  po_reference,
  grn_reference,
  total_amount,
  currency,
  status
) VALUES
  ('c0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'INV-2026-9022', 'Global Logistics Co.', 'SA4420000001234567890123', CURRENT_DATE - 3, 'PO-8812', 'GRN-4410', 48500.00, 'SAR', 'PAID'),
  ('c0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'INV-2026-9041', 'Global Logistics Co.', 'SA4420000001234567890123', CURRENT_DATE - 1, 'PO-8812', 'GRN-4410', 48500.00, 'SAR', 'PENDING'),
  ('c0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'INV-2026-1108', 'Al-Yamama Cement & Aggregates', 'SA8810000009876543210987', CURRENT_DATE - 5, 'PO-7704', 'GRN-3902', 82400.00, 'SAR', 'PENDING'),
  ('c0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'INV-2026-3044', 'Red Sea Industrial Equipment', 'SA2250000004561237896541', CURRENT_DATE - 7, 'PO-6520', 'GRN-2811', 14200.00, 'SAR', 'PAID')
ON CONFLICT DO NOTHING;

-- 8. Seed Detectable Financial Leakage Anomalies
INSERT INTO financial_anomalies (
  id,
  organization_id,
  branch_id,
  case_number,
  rule_code,
  severity,
  confidence_pct,
  target_vendor,
  flagged_amount,
  currency,
  narrative_en,
  narrative_ar,
  status,
  primary_invoice_id,
  matched_invoice_id
) VALUES
  ('c0000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003',
   'CASE-2026-081', 'RULE_DUP_INVOICE_HASH', 'HIGH', 94.20, 'Global Logistics Co.', 48500.00, 'SAR',
   'Two separate purchase orders matched identical line items, vendor IBAN, and monetary values (48,500 SAR) within a 36-hour timeframe. Server verification flags this for CFO review prior to batch payout.',
   'تم رصد فاتورتين مختلفتين بالرقم المرجعي (#INV-9022 و #INV-9041) تحملان نفس القيمة المالية، ونفس الحساب البنكي الآيبان، ونفس بنود التوريد خلال فترة 36 ساعة فقط. يُوصى بالتحقق المباشر قبل اعتماد الصرف.',
   'DETECTED', 'c0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000011'),

  ('c0000000-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003',
   'CASE-2026-082', 'RULE_PO_PRICE_DRIFT', 'CRITICAL', 98.50, 'Al-Yamama Cement & Aggregates', 82400.00, 'SAR',
   'Invoice unit rate exceeds approved purchase order contract baseline by +16.5%. Unmitigated drift represents 11,680 SAR in unaccounted margin loss.',
   'سعر الوحدة في الفاتورة يتجاوز السعر المتفق عليه في أمر الشراء الأساسي بنسبة +16.5%. يمثل هذا الانحراف خسارة هامش غير مبررة بقيمة 11,680 ر.س.',
   'DETECTED', 'c0000000-0000-0000-0000-000000000013', NULL),

  ('c0000000-0000-0000-0000-000000000023', 'c0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003',
   'CASE-2026-083', 'RULE_EARLY_PAYMENT_DISCOUNT', 'MEDIUM', 89.10, 'Red Sea Industrial Equipment', 14200.00, 'SAR',
   'Vendor 2/10 Net 30 early settlement discount was missed due to 4-day approval queue latency, resulting in forfeited cash yield.',
   'تمت خسارة خصم السداد المبكر (2/10 صافي 30) بسبب تأخر مسار الاعتماد الإداري لمدة 4 أيام، مما تسبب في إهدار عائد سيولة متاح.',
   'DETECTED', 'c0000000-0000-0000-0000-000000000014', NULL)
ON CONFLICT DO NOTHING;
