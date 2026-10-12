# ARCHITECTURE.md — MIKHLAFI LABS Architecture Specification
**Version:** 1.0.0  
**Status:** Approved & Implemented  
**Date:** October 11, 2026  
**Author:** Saad Al-Mikhlafi & Antigravity Enterprise Architecture Team  

---

## 1. System Philosophy & Brand Positioning
* **Brand:** MIKHLAFI LABS
* **Descriptor:** INTELLIGENCE · SYSTEMS · INNOVATION
* **Statement:** "Building technology that helps businesses make better decisions."
* **Core Principle:** An intelligence layer over existing ERP and accounting systems (SAP, Oracle, Odoo, Dynamics, Excel) without forcing risky software replacement.
* **Deterministic Analysis First:** Mathematical and algorithmic proof precedes language generation. Every assertion must cite source documents.

---

## 2. Monorepo & Modular Application Structure
```text
mikhlafi-labs/
├── apps/
│   ├── website/              # Public Corporate Editorial Website
│   │   ├── Hero & Live BI Product Preview
│   │   ├── Business Challenges (6 Core Problems)
│   │   ├── Architecture Flow (Existing ERP -> Normalization -> Engines -> Actions)
│   │   ├── 8 Core Intelligence Engines
│   │   ├── 5-Step Deterministic Process
│   │   ├── Target Industry Verticals
│   │   ├── Sovereign Deployment Models (Cloud, On-Premise, Hybrid)
│   │   └── Interactive Enterprise Quotation & Consultation Booking
│   │
│   ├── platform/             # Executive Intelligence Workspace UI
│   │   ├── Application Shell (Collapsible Sidebar & Org Switcher)
│   │   ├── Executive Overview (6 Real-time KPIs & Sparklines)
│   │   ├── "Needs Your Attention" Prioritized Queue
│   │   ├── Native SVG Financial Anomaly Trajectory Chart
│   │   ├── Decision Center (Review, Assign, Authorize, Dismiss)
│   │   ├── Financial Intelligence (Duplicate invoices, Contract deviations)
│   │   ├── Slide-out Evidence Drawer (Source records comparison & baseline)
│   │   ├── Risk Register (Stockout, Cost overrun, Cashflow bottlenecks)
│   │   ├── Project Performance (Schedule variance & Budget burn)
│   │   ├── Supplier Intelligence (Price index & fulfillment reliability)
│   │   ├── Grounded AI Executive Assistant (Citations & Evidence chips)
│   │   └── Data Quality & Connectors Health Monitoring
│   │
│   └── api/                  # Specification for REST / GraphQL contracts
├── css/
│   ├── design-system.css     # Tokens, typography scale, warm neutral palette, dark/light
│   ├── website.css           # Public corporate website layout
│   └── platform.css          # Executive platform workspace
├── js/
│   ├── app.js                # Master coordinator, mode switching, theme & i18n
│   ├── data.js               # Audited datasets for all 8 modules and evidence
│   ├── website.js            # Website interactions & quote calculator
│   ├── platform.js           # Platform engine, evidence drawer, decisions, AI assistant
│   └── i18n.js               # Arabic (RTL) & English (LTR) dictionary
└── server.js                 # Zero-dependency local Node.js HTTP server
```

---

## 3. The 8 Intelligence Modules
1. **Financial Leak Detection (`financial-intelligence`):** Identifies duplicate invoices, supplier pricing anomalies, and budget cap violations with three-way matching algorithms.
2. **Executive Decision Center (`executive-decisions`):** Centralizes priority queues, owners, deadlines, and bottom-line impact.
3. **Predictive Risk Intelligence (`risk-prediction`):** Early warning signals for stockouts, cashflow bottlenecks, and project slippages.
4. **Project Performance Intelligence (`project-intelligence`):** Planned vs actual progress tracking, contractor claim verification, and schedule variance.
5. **Supplier Intelligence (`supplier-intelligence`):** Supplier scorecarding, price creep detection, and fulfillment reliability.
6. **Customer Intelligence (`customer-intelligence`):** Uncharacteristic volume drops and contract non-renewal signals.
7. **AI Executive Assistant (`ai-assistant`):** Strictly grounded natural language inquiry citing exact database record IDs.
8. **Data Quality Intelligence (`data-quality`):** Mandatory field checks, entity deduplication, and currency alignment.

---

## 4. Security & Sovereign Deployment
* **Managed Enterprise Cloud:** Multi-tenant architecture with cryptographic database schema isolation, encrypted TLS in transit, and AES-256 at rest.
* **Sovereign On-Premise:** Full local air-gapped installation inside corporate premises; zero customer data leaves internal boundary; supports local AI models or BYOK (Bring Your Own Key).
* **Hybrid Deployment:** Local rule evaluation with private reporting gateway.
