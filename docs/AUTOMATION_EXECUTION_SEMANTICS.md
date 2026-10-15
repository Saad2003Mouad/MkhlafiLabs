# MIKHLAFI LABS — Automation Execution Semantics & Integration Lifecycle

## 1. Design Principles

1. **Configuration $\neq$ Execution:** Changing a toggle, enabling a policy, or updating an integration's credentials is an administrative configuration event. It must never increment execution counters, update execution timestamps, or simulate operational results.
2. **Deterministic Audit Logging:** Every sync attempt and policy execution must persist an immutable audit trail with execution duration, actor ID, affected records, and status.
3. **No Fabricated Health:** Integrations without verified credentials return `NOT_CONFIGURED`. Unreachable remote endpoints record `FAILED`. A status of `HEALTHY` requires verified live connectivity.

---

## 2. Integration Synchronization Lifecycle

```
[NOT_CONFIGURED] ──(Supply Credentials)──> [UNVERIFIED]
       ▲                                        │
       │                                  (Test Connection)
       │                                        ▼
   (Revoke)                           [HEALTHY] ◄──► [FAILED]
       │                                        ▲
       └────────────────────────────────────────┘
```

### Methods in [`operationsEngine.js`](file:///d:/mikhlafi-labs/apps/api/src/services/operations/operationsEngine.js):
- **`syncTenantIntegration(organizationId, integrationId)`**:
  - Validates integration existence under tenant context.
  - If integration config is empty: records an audit log to `tenant_integration_sync_logs` with status `NOT_CONFIGURED` and returns an honest warning.
  - If integration is in demo mode: returns status `DEMO_SYNCED` with an explicit notice that live production sync requires mTLS / API certificates.
  - Never increments `records_synced_count` by arbitrary numbers.

---

## 3. Workflow & Policy Execution Semantics

### Methods in [`operationsEngine.js`](file:///d:/mikhlafi-labs/apps/api/src/services/operations/operationsEngine.js):
- **`toggleTenantWorkflow(organizationId, workflowId)`**:
  - Updates `active = NOT active` only.
  - `executions_count` and `last_executed_at` remain completely untouched.
- **`executeTenantWorkflow(organizationId, workflowId, options)`**:
  - Verifies tenant ownership and user role.
  - Supports dry-run testing (`dryRun: true`), recording an execution status of `SIMULATED_DRY_RUN` without mutating operational data.
  - Upon genuine run, increments `executions_count`, updates `last_executed_at = now()`, and inserts an execution record into `tenant_workflow_executions`.

---

## 4. Database Schema Support

Migration `007_integration_sync_logs_and_workflow_executions.sql` adds:
- **`tenant_integration_sync_logs`**:
  - `integration_id`, `organization_id`, `status`, `records_processed`, `duration_ms`, `error_message`, `created_at`.
- **`tenant_workflow_executions`**:
  - `workflow_id`, `organization_id`, `status`, `dry_run`, `triggered_by`, `records_affected`, `execution_output`, `created_at`.
