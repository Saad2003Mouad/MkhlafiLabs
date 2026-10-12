# MIKHLAFI LABS — Enterprise Decision Platform
> **INTELLIGENCE · SYSTEMS · INNOVATION**  
> *“Building technology that helps businesses make better decisions.”*  
> **Founder:** Saad Al-Mikhlafi | Riyadh, Kingdom of Saudi Arabia

---

## 🏛️ Master Architecture (Monorepo with Modular Monolith)

As specified in the Master Architecture document (`v1.0`), this repository is structured as a **Modular Monolith Monorepo** ensuring logical separation of responsibilities across applications, analytical services, shared enterprise packages, and infrastructure.

```
mikhlafi-labs/
├── apps/
│   ├── website/                 # Public Corporate & Marketing Portal
│   ├── platform/                # Customer Workspace & Executive Decision Portal
│   ├── admin/                  # Internal Back-Office Admin (Catalog, Plans, Orgs)
│   ├── api/                    # Central REST API, Auth & RBAC Verification
│   └── worker/                 # Background Job Processor & Outbox Dispatcher
│
├── services/                   # Eight Core Analytical Engines
│   ├── financial-intelligence/  # Duplicate invoices, price variances, cash leaks
│   ├── executive-decisions/     # Attention queue, decision center, impact tracking
│   ├── risk-prediction/         # Stockout, budget variance & project delay prediction
│   ├── project-intelligence/    # EPC/Contracting, progress billing, critical path
│   ├── supplier-intelligence/   # Vendor reliability, contract pricing & SLA audits
│   ├── customer-intelligence/   # Retention, contract renewal & churn risks
│   ├── ai-assistant/            # Grounded enterprise RAG & natural language queries
│   └── data-quality/            # Entity deduplication, currency normalization, audit
│
├── packages/                   # Shared Reusable Enterprise Foundations
│   ├── identity/               # Accounts, sessions & authentication
│   ├── organizations/          # Tenants, multi-branch hierarchy & memberships
│   ├── authorization/          # RBAC policies & permission enforcement
│   ├── entitlements/           # Feature flags, service quotas & plan rights
│   ├── catalog/                # Service definitions & product catalog
│   ├── billing/                # Subscriptions, invoices & contracts
│   ├── quotes/                 # Tailored quote requests & versioning
│   ├── integrations/           # ERP connectors & external system adapters
│   ├── events/                 # Domain event definitions & outbox schema
│   ├── database/               # Schema, migration contracts & data layer
│   ├── audit/                  # Immutable audit logs & activity tracking
│   ├── security/               # Encryption, secrets management & tenant isolation
│   ├── ui/                     # Design system tokens, components & utilities
│   ├── config/                 # Environment configuration & constants
│   └── observability/          # Telemetry, structured logging & health checks
│
├── infrastructure/             # Deployment & Sovereignty Templates
│   ├── cloud/                  # Managed Cloud deployment configurations
│   ├── on-prem/                # Air-gapped / Private Datacenter deployment
│   ├── monitoring/             # System health & performance metrics
│   └── backup-restore/         # Automated encrypted backup & recovery procedures
│
├── tests/                      # Enterprise Test Suites
│   ├── integration/            # Cross-service contract & integration tests
│   ├── security/               # Multi-tenant isolation & RBAC leak tests
│   └── end-to-end/             # User journey & decision audit tests
│
└── docs/                       # Architectural Decision Records & Specifications
    ├── ARCHITECTURE.md         # Master Architecture Specification
    ├── DATA_MODEL.md           # Multi-tenant data model & entity relations
    ├── SECURITY.md             # Security, data isolation & threat model
    ├── DEPLOYMENT_CLOUD.md     # Managed enterprise cloud guide
    ├── DEPLOYMENT_ON_PREM.md   # Sovereign on-premise installation guide
    ├── API_CONVENTIONS.md      # REST API standards & status codes
    └── ADR/                    # Architectural Decision Records (ADRs)
```

---

## 🚀 Running the Platform

To start the local development server:
```bash
npm run dev
# or
node server.js
```
Open **`http://localhost:3000/`** to view the application.

---

## 🔒 Tenets & Principles
1. **Intelligence Layer Above Existing ERP:** Never forces destructive replacement of existing systems.
2. **Evidence Before Assertion:** Every alert binds directly to source document records, POs, and invoices.
3. **Deterministic Logic First:** Probabilistic AI is strictly gated behind verified computational rules.
4. **Data Sovereignty:** Full support for air-gapped On-Premise and Managed Cloud deployment.
