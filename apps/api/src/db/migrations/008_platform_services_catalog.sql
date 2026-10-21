-- MIKHLAFI LABS — Platform Services Catalog
--
-- The eight intelligence engines are a real, editable catalog owned by the
-- platform operator, not a hard-coded front-end list. This table is the single
-- source of truth for the engine index that the admin console manages and that
-- the public website reads. Rows are seeded once and then owned by the
-- operator: renaming, re-ordering, disabling and re-writing a summary all
-- persist and are written to the platform audit log.

CREATE TABLE IF NOT EXISTS platform_services (
  id            TEXT PRIMARY KEY,
  engine_number VARCHAR(4)  NOT NULL,
  slug          TEXT        NOT NULL,
  badge_ar      TEXT        NOT NULL DEFAULT '',
  badge_en      TEXT        NOT NULL DEFAULT '',
  title_ar      TEXT        NOT NULL,
  title_en      TEXT        NOT NULL,
  summary_ar    TEXT        NOT NULL DEFAULT '',
  summary_en    TEXT        NOT NULL DEFAULT '',
  sort_order    INT         NOT NULL DEFAULT 0,
  is_enabled    BOOLEAN     NOT NULL DEFAULT true,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_services_order
  ON platform_services (sort_order, engine_number);

INSERT INTO platform_services
  (id, engine_number, slug, badge_ar, badge_en, title_ar, title_en, sort_order)
VALUES
  ('financial-leak-detection', '01', 'financial-leak-detection',
   'المحرك المالي الأساسي', 'CORE FINANCIAL FORENSICS',
   'منظومة كشف الهدر والانحراف المالي المستمر',
   'Autonomous Financial Leak & Variance Prevention', 1),

  ('executive-decisions', '02', 'executive-decisions',
   'طبقة التوجيه الاستراتيجي', 'EXECUTIVE DECISION MESH',
   'شبكة القرارات التنفيذية وتوجيه رأس المال',
   'Executive Decision Mesh & Capital Allocation', 2),

  ('risk-radar', '03', 'risk-radar',
   'رادار المخاطر الاستباقي', 'PREDICTIVE RISK INTELLIGENCE',
   'رادار التنبؤ بالمخاطر والإنذار المبكر',
   'Predictive Risk Intelligence & Early Warning Radar', 3),

  ('project-margins', '04', 'project-margins',
   'حوكمة العقود والهوامش', 'PROJECT & CONTRACT GOVERNANCE',
   'حوكمة المشاريع وحماية هوامش العقود الاستراتيجية',
   'Contract Margin Assurance & Project Telemetry', 4),

  ('supplier-intelligence', '05', 'supplier-intelligence',
   'ذكاء الموردين والتوريد', 'SUPPLIER INTELLIGENCE',
   'ذكاء الموردين وموثوقية سلاسل الإمداد',
   'Supplier Intelligence & Procurement Risk Radar', 5),

  ('customer-retention', '06', 'customer-retention',
   'صحة العملاء والاستبقاء', 'CUSTOMER RETENTION',
   'مراقبة العملاء ومكافحة الفقدان الصامت',
   'Customer Health & Silent Churn Prevention', 6),

  ('executive-assistant', '07', 'executive-assistant',
   'الذكاء المستند إلى الأدلة', 'EVIDENCE-GROUNDED AI',
   'المساعد التنفيذي المؤسسي المستند للأدلة',
   'Evidence-Grounded AI Executive Assistant', 7),

  ('data-quality-governance', '08', 'data-quality-governance',
   'حوكمة البيانات وجودتها', 'DATA GOVERNANCE & INTEGRITY',
   'ذكاء جودة وحوكمة البيانات المتعددة',
   'Data Quality & Multi-System Governance', 8)
ON CONFLICT (id) DO NOTHING;
