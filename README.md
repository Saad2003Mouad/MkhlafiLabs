# MIKHLAFI LABS — Enterprise Intelligence & Decision Platform
> **INTELLIGENCE · SYSTEMS · INNOVATION**  
> *“Building technology that helps businesses make better decisions.”*  
> **Founder:** Saad Al-Mikhlafi | Riyadh, Kingdom of Saudi Arabia

---

## 🏛️ Master Architecture (Monorepo with Modular Monolith)

This repository enforces strict architectural separation between the **Public Marketing Website**, **Dedicated Authentication Pages**, and the **Protected Customer Application Workspace** (`/app/*`), backed by a hardened multi-tenant Node.js + PostgreSQL API gateway.

```
mikhlafi-labs/
├── apps/
│   ├── platform/                # Frontend (React 18 + TypeScript + Vite)
│   │   └── src/
│   │       ├── router/          # Central Route Definitions & Regex Matcher
│   │       ├── layouts/
│   │       │   ├── PublicLayout.tsx     # Public Website Header, Footer & Modals
│   │       │   └── CustomerLayout.tsx   # Customer Workspace Sidebar, Org Switcher & Top Header
│   │       ├── guards/
│   │       │   └── ProtectedRoute.tsx   # Verified Session Guard & Redirection
│   │       ├── pages/
│   │       │   ├── public/              # Home, About, Platform Overview, Solutions, Industries, Pricing, Contact
│   │       │   ├── auth/                # Dedicated Login & Registration Pages
│   │       │   └── not-found/           # Modern 404 Route Recovery Page
│   │       ├── components/              # 16 Customer Platform Views, Website Sections, Design System
│   │       ├── context/                 # AuthContext (Reactive Session, RBAC, Active Tenant)
│   │       └── api/                     # Type-safe API Client with Credential Management
│   └── api/                     # Central REST API, Auth, Multi-Tenancy & RBAC Gateway (Node.js + PostgreSQL)
│       ├── src/
│       │   ├── auth/            # Scrypt Password Hashing, Session Management
│       │   ├── db/              # In-Process PostgreSQL 16 (PGlite) & Migrations
│       │   ├── middleware/      # Strict Tenant Isolation & RBAC Interceptors
│       │   └── server.js        # REST Endpoints (/api/v1/*)
│       └── tests/               # Automated Tests (Auth, Tenant Isolation, Route Boundaries)
├── assets/                      # Enterprise Visual Assets & Architecture Schemas
├── docs/                        # Authoritative Specifications, Master Plans & Audit Reports
├── server.js                    # Unified High-Performance Server & Static File Gateway
├── package.json                 # Monorepo Manifest
└── .env.example                 # Environment Configuration Template
```

---

## 🗺️ Route Architecture & Ownership

### 1. Public Marketing Website (No Session Required)
Accessible without an account. Explains company philosophy, architecture, capabilities, and solutions.
- `/` — Corporate Homepage (Hero Cockpit Preview, 8 Engines, Methodology, Integrations, FAQ)
- `/about` — About MIKHLAFI LABS (Foundational Pillars, Mission, Leadership, Standards)
- `/platform` — Public Platform Architecture & Decision Mesh Showcase (Zero Customer Data Exposed)
- `/solutions` — Enterprise Solutions (Financial Leak Detection, Executive Decisions, Supply Risk, Margin Assurance)
- `/industries` — Cross-Industry Applicability (Manufacturing, Logistics, Retail & FMCG, Holding Groups)
- `/pricing` — Enterprise Licensing Models & Deployment Tiers (Core, Sovereign, Air-Gapped Dedicated)
- `/contact` — Consultation Inquiries & Executive Demo Booking

### 2. Dedicated Authentication Routes
Full-page secure authentication with client/server validation and `returnUrl` preservation:
- `/login` — Dedicated Sign-In (`?returnUrl=/app/...` restoration, anti-enumeration security)
- `/register` — Dedicated Organization Onboarding & Tenant Workspace Initialization

### 3. Protected Customer Application Workspace (`/app/*`)
Requires verified backend session validation. Unauthenticated visits automatically redirect to `/login?returnUrl=...`.
- `/app` — Executive Command Center (KPIs, Cash Flow, Variance Alerts, Recent Directives)
- `/app/decisions` — Decision Intelligence & Ranked Directives
- `/app/risk` — Early Warning Risk Radar & Vulnerability Scoring
- `/app/projects` — Project Intelligence & Contract Margin Assurance
- `/app/suppliers` — Supplier Reliability & Pricing Divergence
- `/app/customers` — Customer Intelligence & Churn Radar
- `/app/data-quality` — Enterprise Data Quality & Observability Pipeline
- `/app/assistant` — Evidence-Grounded Executive AI Assistant
- `/app/reports` — Audit Trails & Executive Dossiers
- `/app/alerts` — Real-Time Anomaly Telemetry
- `/app/integrations` — ERP Connectors (SAP, Oracle, Dynamics 365, Odoo)
- `/app/workflows` — Automated Action Directives & Policies
- `/app/organization` — Multi-Tenant Organization, Branches & Memberships
- `/app/billing` — Subscription Quotas & Entitlements
- `/app/settings` — Platform System Configuration
- `/app/finance` — Granular Financial Leak Investigation

---

## 🚀 Running the Platform Locally

### 1. Start the Production Server
```bash
node server.js
```
The server will:
1. Initialize the PostgreSQL 16 database and automatically run all pending schema migrations.
2. Seed the enterprise tenant hierarchy and authorized executive accounts.
3. Serve the React SPA bundle and public assets on port `3000`.
4. Expose the `/api/v1/*` REST API.

Open **`http://localhost:3000/`** in your browser.

### 2. Frontend Production Build
To recompile the React + TypeScript frontend bundle:
```bash
npm run build --prefix apps/platform
```

### 3. Running Automated Tests
To run all 39 integration, security, and route verification tests:
```bash
node --test apps/api/tests/*.test.js
```
All test suites:
- `auth.test.js` — 8/8 tests pass (Password hashing, registration, sessions, logout)
- `routes.test.js` — 16/16 tests pass (Public routes, dedicated auth, protected /app, legacy elimination)
- `tenant-isolation.test.js` — 15/15 tests pass (Strict cross-tenant boundaries, IDOR prevention, RBAC)

---

## 🔒 Security & Tenant Isolation Guarantees
1. **Server-Side Authority:** The frontend never decides data authorization. All database queries enforce `tenant_id` scoping at the SQL level.
2. **Session Revocation:** Logout terminates the session in the database and clears the HttpOnly cookie.
3. **No Unauthenticated Flash:** Protected routes check `/api/v1/auth/me` with a dedicated loading state before rendering customer workspace views.
4. **Sovereign Compliance:** Fully deployable on GCC/KSA sovereign cloud infrastructure or air-gapped on-premises Kubernetes clusters.
