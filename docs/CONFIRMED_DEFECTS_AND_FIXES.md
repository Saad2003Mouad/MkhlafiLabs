# MIKHLAFI LABS — Confirmed Defects and Evidence-Based Corrections

This document records the exact confirmed defects identified during the repository audit, their root causes, the source files modified, and the verification evidence.

---

## 1. Defect Inventory & Resolution Matrix

| # | Subsystem / Area | Confirmed Root Cause | Resolution Implemented | Impact & Verification |
| :- | :--- | :--- | :--- | :--- |
| **01** | **ERP CSV Ingestion Fallback** | `apps/platform/src/components/platform/IntegrationsView.tsx` contained an emergency fallback that fabricated a ledger entry for 540,000 SAR when CSV parsing failed or yielded empty rows. | Fabricated fallback completely eradicated. Implemented RFC-4180 parser with quotes, escaped quotes, header detection, and row-level error reporting. Added downloadable CSV template. | Verified by automated tests in `operations_and_ingestion.test.js`. Zero fake entries are ever generated. |
| **02** | **Integration Sync Honesty** | `apps/api/src/services/operations/operationsEngine.js:syncTenantIntegration` blindly incremented `records_synced_count` by 1,250 and marked unconfigured integrations as `HEALTHY`. | Removed fixed increments. Returns honest status (`NOT_CONFIGURED` or `DEMO_SYNCED`). Persists audit logs to `tenant_integration_sync_logs`. | Verified in `operations_and_ingestion.test.js`. Record counts only increase upon verified ingestion. |
| **03** | **Workflow Execution Semantics** | `apps/api/src/services/operations/operationsEngine.js:toggleTenantWorkflow` incremented `executions_count` and updated `last_executed_at` whenever a workflow was enabled/disabled. | Configuration change separated from execution. Toggling only updates `active`. Genuine executions handled by `executeTenantWorkflow` with dry-run support and execution logs. | Verified in `operations_and_ingestion.test.js`. Toggling a workflow yields zero executions. |
| **04** | **Platform Admin Route Leakage** | Platform administration link appeared in customer navigation; customer users navigating to `/platform-admin/*` rendered admin UI DOM components. | Removed admin link from `CustomerLayout.tsx`. Added authoritative 403 barrier in `ProtectedRoute.tsx`. Added API middleware 404 gate in `server.js`. | Verified by 6/6 tests in `admin_route_security.test.js`. Customer users cannot access or view admin DOM. |
| **05** | **Tenant Identifier Validation** | `validateCanonicalTenantId` previously stripped characters silently, creating identity collision vectors (e.g. `tenant#1` colliding with `tenant1`). | Replaced silent stripping with strict regex validation (`/^[a-z0-9]+(-[a-z0-9]+)*$/` and canonical UUID). Directory traversal attempts (`../`) are rejected. | Verified by 9/9 tests in `tenant_isolation_and_tls.test.js`. |
| **06** | **Database TLS Certificate Hardening** | `getPostgresSslConfig` permitted `rejectUnauthorized: false` even when `NODE_ENV === 'production'`. | Strictly fails closed if `ALLOW_INSECURE_TLS` is attempted in production. Enforces `rejectUnauthorized: true` and verifies CA certificate presence. | Verified in `tenant_isolation_and_tls.test.js`. |
| **07** | **Financial Calculation Divide-by-Zero** | Ad-hoc inline calculations for variance percentage, EVM (SPI/CPI), and HHI risk score lacked zero-denominator guards, risking `NaN` and `Infinity`. | Built centralized calculations engine [`apps/api/src/services/financial/calculations.js`](file:///d:/mikhlafi-labs/apps/api/src/services/financial/calculations.js) with strict guards and finite return types. | Verified by 8/8 tests in `financial_calculations.test.js`. |
| **08** | **Financial Visualizations Gap** | Route `/app/finance` mapped to `IntelligenceDetail.tsx` had no multi-dimensional charts (revenue vs expense, GL breakdown, vendor spend). | Built pure SVG responsive chart component [`FinancialCharts.tsx`](file:///d:/mikhlafi-labs/apps/platform/src/components/financial/FinancialCharts.tsx) and backend engine `financialAnalyticsEngine.js`. | Verified via `/api/v1/records/financial-analytics` and frontend production build. |
| **09** | **Silent Mock Fallbacks in Service Views** | Views (`RiskView`, `SuppliersView`, `CustomersView`) displayed hardcoded mock values when authenticated if database returned empty arrays. | Harmonized views to render honest empty states and display an explicit `Demonstration Dataset` badge only when unauthenticated demo fixtures are active. | Verified across all service components. |
| **10** | **Insecure Docker Production Defaults** | `docker-compose.yml` had hardcoded fallback secrets (`ChangeMeSecurePass2026!`, `MikhlafiEnterpriseProduction...`). | Removed hardcoded secrets. Enforced environment-provided secrets via `${VARIABLE:?Error}`. Created `docker-compose.test.yml`. | Verified in Docker compose validation and `synthetic_data_and_environment.test.js`. |

---

## 2. Test Verification Summary

All 13 backend test suites and frontend builds pass cleanly:
```bash
# Backend Test Suites: 105 passed, 0 failed, 0 skipped
node --test apps/api/tests/*.test.js

# Frontend Production Compilation: 0 errors
npm run build --prefix apps/platform
```
