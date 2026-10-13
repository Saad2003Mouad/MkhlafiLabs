-- ============================================================================
-- MIKHLAFI LABS — Database Migration 005
-- Operational Intelligence Engines & AI Evidence Context Schema
-- Services: Risk, Projects, Suppliers, Customers, Data Quality, AI Assistant
-- ============================================================================

-- 1. Tenant Risks Table (Service 03: Risk Intelligence)
CREATE TABLE IF NOT EXISTS tenant_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  code VARCHAR(32) NOT NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  category_en VARCHAR(64) NOT NULL,
  category_ar VARCHAR(64) NOT NULL,
  probability VARCHAR(32) NOT NULL DEFAULT 'medium',
  severity VARCHAR(32) NOT NULL DEFAULT 'high',
  financial_exposure_sar NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  exposure_formatted VARCHAR(64) NOT NULL DEFAULT '0 SAR',
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  is_mitigated BOOLEAN NOT NULL DEFAULT FALSE,
  mitigation_plan_en TEXT NOT NULL,
  mitigation_plan_ar TEXT NOT NULL,
  owner_name VARCHAR(128) NOT NULL DEFAULT 'Risk Management Office',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_risks_org ON tenant_risks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenant_risks_status ON tenant_risks(status);

-- 2. Tenant Projects Table (Service 04: Project Performance Intelligence)
CREATE TABLE IF NOT EXISTS tenant_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  code VARCHAR(32) NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  client_name VARCHAR(128) NOT NULL DEFAULT 'Strategic Client',
  budget_total_sar NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  spent_sar NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  variance_sar NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  planned_progress INT NOT NULL DEFAULT 0,
  actual_progress INT NOT NULL DEFAULT 0,
  health VARCHAR(32) NOT NULL DEFAULT 'on-track',
  change_orders_count INT NOT NULL DEFAULT 0,
  contractor_claims_audited BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_projects_org ON tenant_projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenant_projects_health ON tenant_projects(health);

-- 3. Tenant Suppliers Table (Service 05: Supplier Intelligence)
CREATE TABLE IF NOT EXISTS tenant_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code VARCHAR(32) NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  rating_score INT NOT NULL DEFAULT 75,
  price_creep_rate VARCHAR(32) NOT NULL DEFAULT '+0.0%',
  price_creep_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  on_time_delivery_rate VARCHAR(32) NOT NULL DEFAULT '90.0%',
  active_contracts_val_sar NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  risk_status VARCHAR(32) NOT NULL DEFAULT 'moderate',
  is_audited BOOLEAN NOT NULL DEFAULT FALSE,
  last_audit_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_suppliers_org ON tenant_suppliers(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenant_suppliers_risk ON tenant_suppliers(risk_status);

-- 4. Tenant Customers Table (Service 06: Customer Intelligence)
CREATE TABLE IF NOT EXISTS tenant_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code VARCHAR(32) NOT NULL,
  account_name_en TEXT NOT NULL,
  account_name_ar TEXT NOT NULL,
  volume_trend VARCHAR(32) NOT NULL DEFAULT '-0.0%',
  renewal_date VARCHAR(32) NOT NULL DEFAULT '2026-12-31',
  churn_probability DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  revenue_at_risk_sar NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  review_scheduled BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_customers_org ON tenant_customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenant_customers_churn ON tenant_customers(churn_probability);

-- 5. Data Quality Audits Table (Service 07: Data Quality Intelligence)
CREATE TABLE IF NOT EXISTS data_quality_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  check_code VARCHAR(32) NOT NULL,
  rule_name TEXT NOT NULL,
  source_system VARCHAR(128) NOT NULL,
  compliance_rate DECIMAL(5,2) NOT NULL DEFAULT 100.0,
  unmapped_records INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'passed',
  last_checked VARCHAR(64) NOT NULL DEFAULT 'الآن (محدث)',
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_quality_org ON data_quality_audits(organization_id);

-- 6. AI Assistant Interaction Logs Table (Service 08: AI Business Assistant)
CREATE TABLE IF NOT EXISTS ai_assistant_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  citations JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_assistant_org ON ai_assistant_logs(organization_id);

-- ============================================================================
-- Seed High-Fidelity Data for 'mikhlafi-group' Executive Workspace
-- (organization_id = 'c0000000-0000-0000-0000-000000000002')
-- ============================================================================

-- Seed 1: Risks for mikhlafi-group
INSERT INTO tenant_risks (
  id, organization_id, code, title_en, title_ar, category_en, category_ar,
  probability, severity, financial_exposure_sar, exposure_formatted, status, is_mitigated,
  mitigation_plan_en, mitigation_plan_ar, owner_name
)
VALUES
(
  'd1000000-0000-0000-0000-000000000109', 'c0000000-0000-0000-0000-000000000002', 'RSK-OPS-109',
  'Single-source vendor concentration for electrical insulation materials',
  'مخاطر تركز التوريد على مورد وحيد لمواد العزل الكهربائي',
  'Supply Chain', 'سلاسل الإمداد',
  'high', 'critical', 340000.00, '340,000 SAR', 'ACTIVE', false,
  'Qualify secondary domestic certified suppliers before Q4 close.',
  'تأهيل موردين محليين إضافيين معتمدين من هيئة المواصفات بنهاية الربع الرابع.',
  'م. خالد الغامدي'
),
(
  'd1000000-0000-0000-0000-000000000088', 'c0000000-0000-0000-0000-000000000002', 'RSK-FIN-088',
  'Cash flow tension from delayed certification of Gov Contract #402 progress claims',
  'ضغوط سيولة ناتجة عن تأخر اعتماد مستخلصات العقد الحكومي #402',
  'Liquidity & Cash', 'السيولة والتدفقات',
  'medium', 'high', 920000.00, '920,000 SAR', 'ACTIVE', false,
  'Submit electronic reconciliation via Etimad platform to accelerate approval.',
  'تقديم خطاب مطابقة الدفع الإلكتروني عبر منصة اعتماد لتسريع الصرف.',
  'فهد السبيعي'
),
(
  'd1000000-0000-0000-0000-000000000044', 'c0000000-0000-0000-0000-000000000002', 'RSK-COM-044',
  'Major customer churn hazard following 35% purchasing volume contraction',
  'احتمال فقدان عميل استراتيجي بسبب انخفاض وتيرة الطلب بنسبة 35%',
  'Customer Retention', 'إيرادات العملاء',
  'medium', 'medium', 450000.00, '450,000 SAR', 'ACTIVE', false,
  'Schedule executive account review session ahead of annual renewal window.',
  'جدولة اجتماع مراجعة تنفيذية ربع سنوي مع إدارة الحسابات قبل موعد التجديد.',
  'سلطان الشهري'
)
ON CONFLICT (id) DO NOTHING;

-- Seed 2: Projects for mikhlafi-group
INSERT INTO tenant_projects (
  id, organization_id, code, name_en, name_ar, client_name,
  budget_total_sar, spent_sar, variance_sar, planned_progress, actual_progress,
  health, change_orders_count, contractor_claims_audited
)
VALUES
(
  'd2000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'PRJ-2026-01',
  'Central Hub Infrastructure Development — Riyadh',
  'تطوير البنية السحابية والمستودع المركزي — الرياض',
  'هيئة تطوير بوابة الدرعية',
  4200000.00, 3024000.00, 35000.00, 75, 72, 'on-track', 2, false
),
(
  'd2000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'PRJ-2026-02',
  'Supply Chain Automation & Logistics Center — Jeddah',
  'أتمتة خطوط التوزيع وسلاسل الإمداد — جدة',
  'شركة الموانئ واللوجستيات الوطنية',
  6800000.00, 3264000.00, 240000.00, 60, 48, 'at-risk', 5, false
),
(
  'd2000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'PRJ-2026-03',
  'Power Distribution Expansion — Eastern Province',
  'توسعة محطات الطاقة والمحولات — الشرقية',
  'الشركة الوطنية لنقل الكهرباء',
  3100000.00, 2728000.00, -12000.00, 90, 88, 'on-track', 1, false
)
ON CONFLICT (id) DO NOTHING;

-- Seed 3: Suppliers for mikhlafi-group
INSERT INTO tenant_suppliers (
  id, organization_id, code, name_en, name_ar, rating_score,
  price_creep_rate, price_creep_pct, on_time_delivery_rate,
  active_contracts_val_sar, risk_status, is_audited, last_audit_notes
)
VALUES
(
  'd3000000-0000-0000-0000-000000000702', 'c0000000-0000-0000-0000-000000000002', 'VND-702',
  'Global Engineering Supplies Co.',
  'شركة التوريدات الهندسية الكبرى',
  68, '+16.5%', 16.50, '79.2%', 1450000.00, 'critical', false,
  'Uncontracted price drift detected in Structural Steel line items.'
),
(
  'd3000000-0000-0000-0000-000000000104', 'c0000000-0000-0000-0000-000000000002', 'VND-104',
  'Eastern Pipe & Industrial Mill',
  'مصنع الشرق للأنابيب والمواد',
  92, '+1.2%', 1.20, '98.5%', 3200000.00, 'optimal', false,
  'Consistent compliance with long-term procurement agreement.'
),
(
  'd3000000-0000-0000-0000-000000000308', 'c0000000-0000-0000-0000-000000000002', 'VND-308',
  'United Logistics & Transport Services',
  'الشركة المتحدة للنقل والخدمات اللوجستية',
  81, '+4.5%', 4.50, '88.0%', 920000.00, 'moderate', false,
  'Minor diesel surcharge fuel indexation applied without prior formal notification.'
)
ON CONFLICT (id) DO NOTHING;

-- Seed 4: Customers for mikhlafi-group
INSERT INTO tenant_customers (
  id, organization_id, code, account_name_en, account_name_ar,
  volume_trend, renewal_date, churn_probability, revenue_at_risk_sar, review_scheduled
)
VALUES
(
  'd4000000-0000-0000-0000-000000000901', 'c0000000-0000-0000-0000-000000000002', 'CUST-901',
  'Al-Rowad Contracting & Development',
  'مجموعة الرواد للمقاولات والتطوير',
  '-35.2%', '2026-11-30', 0.68, 840000.00, false
),
(
  'd4000000-0000-0000-0000-000000000412', 'c0000000-0000-0000-0000-000000000002', 'CUST-412',
  'Saudi Pharma Industrial Group',
  'الشركة السعودية للصناعات الدوائية',
  '+8.4%', '2027-02-15', 0.12, 1200000.00, false
),
(
  'd4000000-0000-0000-0000-000000000208', 'c0000000-0000-0000-0000-000000000002', 'CUST-208',
  'National Retail & Food Markets',
  'سلسلة أسواق التغذية الوطنية',
  '-18.0%', '2026-12-15', 0.44, 520000.00, false
)
ON CONFLICT (id) DO NOTHING;

-- Seed 5: Data Quality Audits for mikhlafi-group
INSERT INTO data_quality_audits (
  id, organization_id, check_code, rule_name, source_system,
  compliance_rate, unmapped_records, status, last_checked, details
)
VALUES
(
  'd5000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'DQ-ZATCA-RECON',
  'مطابقة قيود الفواتير مع السجل الضريبي ZATCA',
  'Oracle ERP <-> ZATCA Bridge',
  99.80, 3, 'passed', '2026-10-12 04:00',
  '{"total_records": 12840, "matched": 12837, "pending_uuid_sync": 3}'
),
(
  'd5000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'DQ-PO-NULL',
  'فحص اكتمال بيانات وتوقيعات أوامر الشراء (PO Sign-off)',
  'SAP S/4HANA Procurement',
  94.20, 18, 'warning', '2026-10-12 06:30',
  '{"total_records": 2400, "missing_tier2_approval": 18}'
),
(
  'd5000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'DQ-IBAN-DUP',
  'فحص مطابقة الحسابات البنكية للموردين (IBAN Validation)',
  'Banking Integration Engine',
  98.10, 5, 'passed', '2026-10-12 05:15',
  '{"verified_iban_count": 89, "flagged_secondary_accounts": 5}'
)
ON CONFLICT (id) DO NOTHING;
