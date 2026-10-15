# MIKHLAFI LABS — Remaining Verification Work & Known Limitations

## 1. Verified Subsystems & Automated Test Status

| Area | Status | Verified Evidence |
| :--- | :--- | :--- |
| **Platform Admin Isolation** | Verified | 6/6 tests in `admin_route_security.test.js`, 403 barrier in `ProtectedRoute.tsx`, route gate in `server.js` |
| **Truthful Integrations** | Verified | Zero fake 540,000 SAR fallback; RFC-4180 parsing; honest `NOT_CONFIGURED` & `DEMO_SYNCED` lifecycle |
| **Workflow Semantics** | Verified | Toggle does not count as execution; `executeTenantWorkflow` logs genuine executions |
| **Centralized Calculations** | Verified | 8/8 tests in `financial_calculations.test.js` with zero-division guards |
| **Tenant Isolation & Security** | Verified | 11/11 tests in `tenant-isolation.test.js`, 9/9 in `tenant_isolation_and_tls.test.js` |
| **Isolated Testing Environment** | Verified | 4/4 tests in `synthetic_data_and_environment.test.js`, fail-closed prod DB guard |
| **Financial Visualizations** | Verified | Responsive SVG charts in `FinancialCharts.tsx` powered by `financialAnalyticsEngine.js` |
| **Frontend Production Build** | Verified | `tsc && vite build` completed in 4.93s with 0 errors |

---

## 2. Unverified & Unimplemented External Connectors

In accordance with the truthfulness mandate, the platform explicitly marks the following connectors as **templates / unconfigured** rather than simulating false success:

| Connector | Status | Requirement for Live Production Verification |
| :--- | :--- | :--- |
| **SAP S/4HANA (mTLS Replica)** | Template / Awaiting Credentials | Requires corporate VPN, client X.509 certificate, and read-only replica connection string. |
| **Oracle Fusion SCM (REST API)** | Template / Awaiting Credentials | Requires Oracle Cloud Infrastructure (OCI) OAuth2 Client ID, Secret, and Tenant URL. |
| **Microsoft Dynamics 365** | Not Configured | Requires Microsoft Entra ID App Registration and Dataverse Web API permissions. |
| **Odoo ERP (XML-RPC / JSON-RPC)** | Template / Awaiting Credentials | Requires customer host URL, database name, and read-only API key. |
| **Salesforce CRM** | Template / Awaiting Credentials | Requires Connected App consumer key and OAuth2 JWT bearer credentials. |

---

## 3. Known Limitations & Operating Boundaries

1. **Local Test Environment:**
   - In local development and unit testing, the platform defaults to `@electric-sql/pglite` (WebAssembly PostgreSQL 16) or isolated Docker container `mikhlafi-postgres-test-db` (port 5433).
   - Heavy concurrent read replicas and replication lag metrics are simulated on synthetic data.
2. **AI Provider Fallback:**
   - When no external LLM API key or local Ollama daemon is running, the platform operates in `local_deterministic` mode. This ensures all financial leak detection and forensic audits run algorithmically with 100% determinism and zero external cloud costs.
3. **Corporate ERP Network Ingress:**
   - Live ERP telemetry requires customers to configure outbound read-only views or scheduled batch file exports. The platform does not require or recommend exposing production ERP databases to the public internet.
