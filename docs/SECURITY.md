# Security, Data Sovereignty & Threat Model
**MIKHLAFI LABS — Enterprise Decision Platform**

## 1. Multi-Tenant Isolation
Every query, record retrieval, background task, and report enforces strict `organizationId` filtering at the data layer. Direct browser `organizationId` parameter overrides are rejected on the server.

## 2. Secrets Management
API keys, ERP database connection credentials, and encryption keys are stored in encrypted vaults and are never logged or exposed in raw form to the client.

## 3. Immutable Audit Trails
All sensitive administrative and analytical actions (such as marking an invoice verified, triggering decision dismissals, or modifying entitlements) are logged in the append-only `AuditLog` table.

## 4. Grounded AI Guardrails
The AI Assistant never runs unbounded hallucinated queries. All responses are verified against deterministic SQL/API queries, and source citation IDs are attached to each factual claim.
