-- ============================================================================
-- MIKHLAFI LABS — Database Migration 007
-- Truthful Integration Sync Logs & Persistent Workflow Policy Executions
-- ============================================================================

-- 1. Integration Sync Audit Logs Table
CREATE TABLE IF NOT EXISTS tenant_integration_sync_logs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id       UUID NOT NULL REFERENCES tenant_integrations(id) ON DELETE CASCADE,
  started_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at         TIMESTAMPTZ,
  status               VARCHAR(32) NOT NULL DEFAULT 'NOT_CONFIGURED', -- 'SUCCESS', 'FAILED', 'NOT_CONFIGURED', 'DEMO_SYNCED'
  records_processed    INT NOT NULL DEFAULT 0,
  records_rejected     INT NOT NULL DEFAULT 0,
  error_code           VARCHAR(64),
  error_message        TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_sync_logs_org ON tenant_integration_sync_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenant_sync_logs_integ ON tenant_integration_sync_logs(integration_id);

-- 2. Tenant Workflow Executions History Table
CREATE TABLE IF NOT EXISTS tenant_workflow_executions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workflow_id            UUID NOT NULL REFERENCES tenant_workflows(id) ON DELETE CASCADE,
  triggered_by           VARCHAR(64) NOT NULL DEFAULT 'SYSTEM_FORENSIC_TRIGGER',
  trigger_type           VARCHAR(64) NOT NULL DEFAULT 'POLICY_EVALUATION',
  evaluated_conditions   JSONB,
  matched_records_count  INT NOT NULL DEFAULT 0,
  proposed_action        TEXT NOT NULL,
  approval_status        VARCHAR(32) NOT NULL DEFAULT 'AUTO_APPROVED', -- 'PENDING_APPROVAL', 'AUTO_APPROVED', 'REJECTED'
  execution_status       VARCHAR(32) NOT NULL DEFAULT 'COMPLETED',     -- 'COMPLETED', 'SIMULATED_DRY_RUN', 'FAILED', 'CANCELLED'
  executed_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  details                JSONB,
  idempotency_key        VARCHAR(128),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_wf_exec_org ON tenant_workflow_executions(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenant_wf_exec_wf ON tenant_workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_tenant_wf_exec_idemp ON tenant_workflow_executions(idempotency_key);
