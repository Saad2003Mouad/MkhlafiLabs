-- MIKHLAFI LABS — 003_financial_intelligence.sql
-- Foundational Tables for Service 01: Financial Intelligence & Forensic Leak Detection
-- Conforms to docs/MASTER_PRODUCT_SPECIFICATION.md and docs/DOMAIN_MODEL_AND_RELATIONSHIPS.md

-- 1. Financial Invoices (Ingested from ERPs, Purchase Orders, and Ledger Syncs)
CREATE TABLE IF NOT EXISTS financial_invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id       UUID REFERENCES branches(id) ON DELETE SET NULL,
  invoice_number  VARCHAR(100) NOT NULL,
  vendor_name     VARCHAR(200) NOT NULL,
  vendor_iban     VARCHAR(100),
  issue_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date        DATE,
  po_reference    VARCHAR(100),
  grn_reference   VARCHAR(100),
  total_amount    NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  currency        VARCHAR(10) NOT NULL DEFAULT 'SAR',
  status          VARCHAR(50) NOT NULL DEFAULT 'PAID', -- 'PENDING', 'PAID', 'DISPUTED', 'FROZEN'
  source_system   VARCHAR(50) NOT NULL DEFAULT 'ERP_CONNECTOR', -- 'ERP_CONNECTOR', 'MANUAL_IMPORT', 'DEMO_FEED'
  details         JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_org_invoice_num UNIQUE (organization_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_fin_invoices_org ON financial_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_fin_invoices_vendor ON financial_invoices(organization_id, vendor_name);
CREATE INDEX IF NOT EXISTS idx_fin_invoices_status ON financial_invoices(organization_id, status);

-- 2. Financial Line Items (Item-level detail for 3-way match reconciliation)
CREATE TABLE IF NOT EXISTS financial_line_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id     UUID NOT NULL REFERENCES financial_invoices(id) ON DELETE CASCADE,
  description    VARCHAR(255) NOT NULL,
  item_code      VARCHAR(100),
  quantity       NUMERIC(12, 3) NOT NULL DEFAULT 1.000,
  unit_price     NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  line_total     NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  currency       VARCHAR(10) NOT NULL DEFAULT 'SAR',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fin_line_items_inv ON financial_line_items(invoice_id);

-- 3. Financial Anomalies & Leakage Detection Cases
CREATE TABLE IF NOT EXISTS financial_anomalies (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id          UUID REFERENCES branches(id) ON DELETE SET NULL,
  case_number        VARCHAR(50) NOT NULL,
  rule_code          VARCHAR(100) NOT NULL, -- 'RULE_DUP_INVOICE_HASH', 'RULE_PO_PRICE_DRIFT', 'RULE_EARLY_PAYMENT_DISCOUNT'
  severity           VARCHAR(50) NOT NULL DEFAULT 'HIGH', -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
  confidence_pct     NUMERIC(5, 2) NOT NULL DEFAULT 94.20,
  target_vendor      VARCHAR(200) NOT NULL,
  flagged_amount     NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  currency           VARCHAR(10) NOT NULL DEFAULT 'SAR',
  narrative_en       TEXT NOT NULL,
  narrative_ar       TEXT NOT NULL,
  status             VARCHAR(50) NOT NULL DEFAULT 'DETECTED', -- 'DETECTED', 'LEGITIMATE', 'FROZEN', 'RESOLVED'
  primary_invoice_id UUID REFERENCES financial_invoices(id) ON DELETE SET NULL,
  matched_invoice_id UUID REFERENCES financial_invoices(id) ON DELETE SET NULL,
  resolved_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at        TIMESTAMPTZ,
  action_notes       TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_org_case_num UNIQUE (organization_id, case_number)
);

CREATE INDEX IF NOT EXISTS idx_fin_anomalies_org ON financial_anomalies(organization_id);
CREATE INDEX IF NOT EXISTS idx_fin_anomalies_status ON financial_anomalies(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_fin_anomalies_severity ON financial_anomalies(organization_id, severity);
