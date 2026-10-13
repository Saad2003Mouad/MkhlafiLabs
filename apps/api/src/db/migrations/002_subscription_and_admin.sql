-- MIKHLAFI LABS — 002_subscription_and_admin.sql
-- Subscriptions, Platform Capabilities, Packages, Admin Control Center & Leads
-- Conforms to docs/SUBSCRIPTION_AND_ENTITLEMENT_SPECIFICATION.md and docs/PLATFORM_ADMINISTRATION_SPECIFICATION.md

-- 1. Ensure is_platform_admin exists on users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_users_platform_admin ON users(is_platform_admin);

-- 2. Platform Capabilities Catalog (The Canonical 8 Intelligence Engines + Foundational Modules)
CREATE TABLE IF NOT EXISTS platform_capabilities (
  id             VARCHAR(50) PRIMARY KEY,
  name_en        VARCHAR(100) NOT NULL,
  name_ar        VARCHAR(100) NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  category       VARCHAR(50) NOT NULL DEFAULT 'intelligence',
  tier_required  VARCHAR(50) NOT NULL DEFAULT 'basic',
  is_active      BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO platform_capabilities (id, name_en, name_ar, description_en, description_ar, tier_required) VALUES
  ('financial-intelligence', 'Financial Intelligence', 'الذكاء المالي وكشف التسرب', 'Forensic auditing of financial flows, duplicate invoice detection, and 3-way match triangulation.', 'فحص تفصيلي للتدفقات النقدية، كشف مؤشرات تسرب الأرباح، والمطابقة الحسابية الثلاثية.', 'basic'),
  ('executive-decisions', 'Executive Decisions', 'مركز القرارات التنفيذية', 'Actionable decision radar quantifying monetary impact and risk mitigations.', 'مركز موحد لإدارة الأولويات، الفرص، والتوصيات التنفيذية المدعومة بالأدلة.', 'basic'),
  ('data-quality', 'Data Quality Intelligence', 'ذكاء جودة البيانات', 'Integrity auditing, orphan record identification, and cross-system reconciliation.', 'حصر السجلات الناقصة والمكررة وتدقيق سلامة المزامنة المحاسبية.', 'basic'),
  ('risk-intelligence', 'Risk Intelligence', 'ذكاء المخاطر المؤسسية', 'Operational and financial risk registry tracking likelihood and severity matrices.', 'سجل المخاطر التشغيلية والمالية ومصفوفة التأثير والاحتمالية.', 'advanced'),
  ('supplier-intelligence', 'Supplier Intelligence', 'ذكاء الموردين والمشتريات', 'Vendor concentration risk, price drift radar, and contract compliance.', 'تقييم كفاءة التوريد، تركز المشتريات، ومقارنة تغير أسعار التوريد.', 'advanced'),
  ('customer-intelligence', 'Customer Intelligence', 'ذكاء العملاء والإيرادات', 'Revenue concentration risk, churn risk indicators, and account lifetime profitability.', 'تتبع نشاط العملاء، احتمالات الانسحاب، وتركز مصادر الإيرادات.', 'premier'),
  ('project-intelligence', 'Project Intelligence', 'ذكاء المشاريع والعمليات', 'Milestone tracking, earned value analysis, and budget variance for contracting.', 'نسب الإنجاز، انحرافات الميزانية، ومؤشرات التأخير للشركات القائمة على المشاريع.', 'premier'),
  ('ai-assistant', 'AI Business Assistant', 'المساعد الذكي للأعمال', 'Natural language contextual inquiry over verified enterprise records with data provenance.', 'استجواب بيانات المؤسسة باللغة الطبيعية مع توثيق المصدر البرمجي لكل إجابة.', 'premier')
ON CONFLICT (id) DO NOTHING;

-- 3. Commercial Subscription Packages
CREATE TABLE IF NOT EXISTS subscription_packages (
  id                   VARCHAR(50) PRIMARY KEY,
  name_en              VARCHAR(100) NOT NULL,
  name_ar              VARCHAR(100) NOT NULL,
  tier_level           INT NOT NULL DEFAULT 1,
  monthly_price_sar    NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  annual_price_sar     NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  currency             VARCHAR(10) NOT NULL DEFAULT 'SAR',
  max_branches         INT NOT NULL DEFAULT 1,
  max_members          INT NOT NULL DEFAULT 5,
  monthly_record_limit BIGINT NOT NULL DEFAULT 100000,
  is_public            BOOLEAN NOT NULL DEFAULT true,
  is_active            BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO subscription_packages (id, name_en, name_ar, tier_level, monthly_price_sar, annual_price_sar, max_branches, max_members, monthly_record_limit) VALUES
  ('plan_starter', 'Starter Suite', 'باقة الأعمال الناشئة', 1, 1500.00, 15000.00, 1, 5, 100000),
  ('plan_pro', 'Professional Suite', 'باقة الشركات المتقدمة', 2, 4500.00, 45000.00, 5, 25, 1000000),
  ('plan_enterprise', 'Enterprise Suite', 'باقة المؤسسات الشاملة', 3, 12000.00, 120000.00, 999, 100, 10000000),
  ('plan_sovereign', 'Sovereign Mesh', 'باقة السيادة المخصصة', 4, 35000.00, 350000.00, 9999, 9999, 100000000)
ON CONFLICT (id) DO NOTHING;

-- 4. Package Capabilities Mapping
CREATE TABLE IF NOT EXISTS package_capabilities (
  package_id    VARCHAR(50) NOT NULL REFERENCES subscription_packages(id) ON DELETE CASCADE,
  capability_id VARCHAR(50) NOT NULL REFERENCES platform_capabilities(id) ON DELETE CASCADE,
  PRIMARY KEY (package_id, capability_id)
);

-- Map Starter: Financial, Decisions, Data Quality
INSERT INTO package_capabilities (package_id, capability_id) VALUES
  ('plan_starter', 'financial-intelligence'),
  ('plan_starter', 'executive-decisions'),
  ('plan_starter', 'data-quality')
ON CONFLICT DO NOTHING;

-- Map Pro: Starter + Risk, Suppliers
INSERT INTO package_capabilities (package_id, capability_id) VALUES
  ('plan_pro', 'financial-intelligence'),
  ('plan_pro', 'executive-decisions'),
  ('plan_pro', 'data-quality'),
  ('plan_pro', 'risk-intelligence'),
  ('plan_pro', 'supplier-intelligence')
ON CONFLICT DO NOTHING;

-- Map Enterprise & Sovereign: All 8 Capabilities
INSERT INTO package_capabilities (package_id, capability_id)
SELECT 'plan_enterprise', id FROM platform_capabilities
ON CONFLICT DO NOTHING;

INSERT INTO package_capabilities (package_id, capability_id)
SELECT 'plan_sovereign', id FROM platform_capabilities
ON CONFLICT DO NOTHING;

-- 5. Organization Active Subscriptions
CREATE TABLE IF NOT EXISTS organization_subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  package_id           VARCHAR(50) NOT NULL REFERENCES subscription_packages(id),
  status               VARCHAR(50) NOT NULL DEFAULT 'active', -- 'trialing', 'active', 'past_due', 'suspended', 'canceled'
  billing_interval     VARCHAR(20) NOT NULL DEFAULT 'annual', -- 'monthly', 'annual', 'custom'
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end   TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '365 days'),
  grace_period_end     TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_org_subscription UNIQUE (organization_id)
);

CREATE INDEX IF NOT EXISTS idx_org_subs_package ON organization_subscriptions(package_id);
CREATE INDEX IF NOT EXISTS idx_org_subs_status ON organization_subscriptions(status);

-- 6. Organization Usage Accounting (Monthly Records)
CREATE TABLE IF NOT EXISTS organization_usage (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_key        VARCHAR(7) NOT NULL, -- e.g. '2026-10'
  records_processed BIGINT NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_org_usage_period UNIQUE (organization_id, period_key)
);

-- 7. Platform Operator Audit Trail (Administrative Governance)
CREATE TABLE IF NOT EXISTS platform_audit_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  action           VARCHAR(100) NOT NULL,
  target_tenant_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  details          JSONB,
  ip_address       VARCHAR(45),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_audit_created ON platform_audit_logs(created_at DESC);

-- 8. Inbound Lead Inquiries (From Public /contact & Demo Requests)
CREATE TABLE IF NOT EXISTS lead_inquiries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(150) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  company_name VARCHAR(200),
  phone        VARCHAR(50),
  inquiry_type VARCHAR(50) NOT NULL DEFAULT 'demo_request',
  message      TEXT,
  status       VARCHAR(50) NOT NULL DEFAULT 'NEW', -- 'NEW', 'IN_REVIEW', 'CONTACTED', 'CONVERTED', 'ARCHIVED'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON lead_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON lead_inquiries(created_at DESC);

-- 9. Public Website CMS Content Blocks
CREATE TABLE IF NOT EXISTS cms_content_blocks (
  id         VARCHAR(100) PRIMARY KEY,
  content_en TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  category   VARCHAR(50) NOT NULL DEFAULT 'marketing',
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO cms_content_blocks (id, content_en, content_ar, category) VALUES
  ('hero_headline', 'Building Technology That Helps Businesses Make Better Decisions.', 'بناء تقنيات ذكية تمكّن الشركات من اتخاذ قرارات أعمال استثنائية وأكثر دقة.', 'marketing'),
  ('hero_subtitle', 'Modular cross-industry intelligence platform for operational forensics, financial leakage detection, and risk mitigation.', 'منصة ذكاء أعمال وعمليات تشغيلية قطاعية مرنة للتدقيق المالي، كشف التسرب، والحد من المخاطر.', 'marketing'),
  ('announcement_banner', 'MIKHLAFI LABS Enterprise Release 2.0 is now live for all licensed tenants.', 'تم إطلاق الإصدار المؤسسي الموحد 2.0 لمنصة مخلافي لابز لكافة المؤسسات المشتركة.', 'marketing')
ON CONFLICT (id) DO NOTHING;

-- 10. Automatically provision active subscriptions for existing organizations if any exist
INSERT INTO organization_subscriptions (organization_id, package_id, status, billing_interval)
SELECT id, 'plan_enterprise', 'active', 'annual'
FROM organizations
ON CONFLICT (organization_id) DO NOTHING;
