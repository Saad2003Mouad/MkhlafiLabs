-- ============================================================================
-- MIKHLAFI LABS — Database Migration 006
-- Integrations, Workflows, Alerts, Workspace Settings & ERP Ledger Ingestion
-- ============================================================================

-- 1. Tenant Integrations Table (Service 08 / Integrations Hub)
CREATE TABLE IF NOT EXISTS tenant_integrations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code                 VARCHAR(64) NOT NULL,
  name_en              VARCHAR(128) NOT NULL,
  name_ar              VARCHAR(128) NOT NULL,
  category             VARCHAR(64) NOT NULL DEFAULT 'ERP / General Ledger',
  auth_type            VARCHAR(64) NOT NULL DEFAULT 'Read-Only DB View',
  records_synced_count BIGINT NOT NULL DEFAULT 0,
  last_sync_status     VARCHAR(32) NOT NULL DEFAULT 'HEALTHY',
  last_sync_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  status               VARCHAR(32) NOT NULL DEFAULT 'connected',
  config               JSONB,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_integrations_org ON tenant_integrations(organization_id);

-- 2. Tenant Automated Workflows Table
CREATE TABLE IF NOT EXISTS tenant_workflows (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code             VARCHAR(64) NOT NULL,
  name_ar          VARCHAR(255) NOT NULL,
  name_en          VARCHAR(255) NOT NULL,
  trigger_ar       TEXT NOT NULL,
  trigger_en       TEXT NOT NULL,
  action_ar        TEXT NOT NULL,
  action_en        TEXT NOT NULL,
  active           BOOLEAN NOT NULL DEFAULT true,
  executions_count INT NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_workflows_org ON tenant_workflows(organization_id);

-- 3. Tenant Real-Time Alerts Table
CREATE TABLE IF NOT EXISTS tenant_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title_ar        TEXT NOT NULL,
  title_en        TEXT NOT NULL,
  severity        VARCHAR(32) NOT NULL DEFAULT 'warning', -- 'critical', 'warning', 'info'
  source_domain   VARCHAR(64) NOT NULL DEFAULT 'financial',
  acknowledged    BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_alerts_org ON tenant_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenant_alerts_ack ON tenant_alerts(organization_id, acknowledged);

-- 4. Tenant Workspace Settings Table
CREATE TABLE IF NOT EXISTS tenant_settings (
  organization_id       UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  base_currency         VARCHAR(10) NOT NULL DEFAULT 'SAR',
  calendar_standard     VARCHAR(32) NOT NULL DEFAULT 'gregorian',
  retention_policy      VARCHAR(32) NOT NULL DEFAULT '7years',
  data_classification   VARCHAR(32) NOT NULL DEFAULT 'RESTRICTED',
  encryption_standard   VARCHAR(64) NOT NULL DEFAULT 'AES-256-GCM',
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tenant General Ledger Journal Entries Table (For ERP Ingestion)
CREATE TABLE IF NOT EXISTS tenant_journal_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  batch_id        UUID NOT NULL DEFAULT gen_random_uuid(),
  posting_date    DATE NOT NULL,
  document_number VARCHAR(64) NOT NULL,
  account_number  VARCHAR(64) NOT NULL,
  vendor_number   VARCHAR(64),
  vendor_name     VARCHAR(255),
  amount_sar      NUMERIC(15,2) NOT NULL,
  debit_credit    VARCHAR(2) NOT NULL DEFAULT 'S', -- 'S'=Debit, 'H'=Credit
  text_narrative  TEXT,
  is_flagged      BOOLEAN NOT NULL DEFAULT false,
  flag_reason     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_org ON tenant_journal_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_batch ON tenant_journal_entries(batch_id);

-- ============================================================================
-- Seed Foundational Records for Demo Executive Workspace
-- ('c0000000-0000-0000-0000-000000000002')
-- ============================================================================

-- Seed Integrations for mikhlafi-group (Templates awaiting credentials)
INSERT INTO tenant_integrations (
  id, organization_id, code, name_en, name_ar, category, auth_type, records_synced_count, last_sync_status, status
)
VALUES
(
  'e1000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'SAP-ERP-PROD',
  'SAP S/4HANA Finance & Controlling (FICO)',
  'نظام ساب المالي وإدارة دفتر الأستاذ العام (SAP S/4HANA)',
  'ERP / General Ledger',
  'mTLS + Read-Only Database Replica',
  0,
  'NOT_CONFIGURED',
  'not_configured'
),
(
  'e1000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000002',
  'ORACLE-SCM',
  'Oracle Fusion Cloud Procurement & Inventory',
  'أوراكل لإدارة سلاسل الإمداد والمشتريات (Oracle SCM)',
  'Procurement & Contracts',
  'Signed REST Webhook (Read-Only)',
  0,
  'NOT_CONFIGURED',
  'not_configured'
),
(
  'e1000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000002',
  'ZATCA-E-INVOICE',
  'ZATCA Fatoora Phase II Clearance Gateway',
  'بوابة الفوترة الإلكترونية المرحلة الثانية (هيئة الزكاة والضريبة)',
  'Regulatory & Tax Bridge',
  'Cryptographic API Stamp (Read-Only)',
  0,
  'NOT_CONFIGURED',
  'not_configured'
)
ON CONFLICT (id) DO UPDATE SET
  records_synced_count = EXCLUDED.records_synced_count,
  last_sync_status = EXCLUDED.last_sync_status,
  status = EXCLUDED.status;

-- Seed Workflows for mikhlafi-group (Zero execution until genuinely executed)
INSERT INTO tenant_workflows (
  id, organization_id, code, name_ar, name_en, trigger_ar, trigger_en, action_ar, action_en, active, executions_count
)
VALUES
(
  'e2000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'WF-DUPLICATE-FREEZE',
  'تجميد مدفوعات الفواتير المكررة فورياً',
  'Instant Freeze on Suspected Duplicate Invoices',
  'رصد تشابه رقم الفاتورة وتاريخ الصرف لنفس المورد بمبلغ يتجاوز 10,000 ريال',
  'Detection of matching invoice/date disbursement exceeding 10,000 SAR',
  'تجميد أمر الدفع في ERP وإرسال تنبيه عاجل لمدير التدقيق',
  'Block ERP disbursement queue and escalate to Audit Director',
  true,
  0
),
(
  'e2000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000002',
  'WF-SUPPLIER-PRICE-CREEP',
  'تصعيد انحراف أسعار عقود التوريد',
  'Escalation for Supplier Price Variance',
  'تجاوز سعر الوحدة المفوتر بنسبة +10% عن العقد الأساسي المسجل',
  'Unit invoice price exceeding contractual baseline by +10%',
  'إدراج بند مراجعة أسعار في طابور قرارات المشتريات',
  'Create mandatory price review item in Procurement Decision Queue',
  true,
  0
),
(
  'e2000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000002',
  'WF-PROJECT-CLAIM-SLIP',
  'إنذار تأخر مستخلصات المشاريع الحرجة',
  'Early Warning on Critical Project Progress Slippage',
  'تأخر الإنجاز الفعلي عن المخطط بأكثر من 10% على المسار الحرج',
  'Actual milestone lagging contractual schedule by >10%',
  'توليد إنذار مبكر لمدير العمليات التنفيذي',
  'Dispatch early warning notification to Operations Director',
  false,
  0
)
ON CONFLICT (id) DO UPDATE SET
  executions_count = EXCLUDED.executions_count,
  active = EXCLUDED.active;

-- Seed Alerts for mikhlafi-group
INSERT INTO tenant_alerts (
  id, organization_id, title_ar, title_en, severity, source_domain, acknowledged
)
VALUES
(
  'e3000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'تكرار صرف مدفوعات لنفس المورد خلال 48 ساعة (#INV-9041)',
  'Duplicate payment disbursement match detected within 48h (#INV-9041)',
  'critical',
  'financial',
  false
),
(
  'e3000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000002',
  'تصاعد سعر حديد التسليح بنسبة +16.5% عن العقد الأساسي CTR-04',
  'Supplier price creep exceeding contractual baseline (+16.5%) on CTR-04',
  'warning',
  'supplier',
  false
),
(
  'e3000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000002',
  'تأخر تسليم مستخلصات مشروع أتمتة خطوط الإمداد بجدة 14 يوماً',
  'Jeddah Logistics project claims delayed by 14 days',
  'warning',
  'project',
  true
),
(
  'e3000000-0000-0000-0000-000000000004',
  'c0000000-0000-0000-0000-000000000002',
  'اكتمال المزامنة الحية مع بوابة الفوترة ZATCA بنجاح',
  'Live synchronization cycle with ZATCA Tax Bridge completed successfully',
  'info',
  'system',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Seed Settings for mikhlafi-group
INSERT INTO tenant_settings (
  organization_id, base_currency, calendar_standard, retention_policy, data_classification
)
VALUES
(
  'c0000000-0000-0000-0000-000000000002',
  'SAR',
  'gregorian',
  '7years',
  'RESTRICTED'
)
ON CONFLICT (organization_id) DO NOTHING;
