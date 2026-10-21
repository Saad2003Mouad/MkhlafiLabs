# MIKHLAFI LABS — Interface Rebuild Brief

Shared contract for every interface rebuild. **Read this before touching any file.**

---

## 1. Product positioning (non-negotiable)

- The platform is an **Operational Decision Intelligence Platform** — **industry-neutral**.
- It must **never** read as a finance-only, accounting-only, or "money-loss finder" product.
- Financial leak detection is **one of eight engines**, not the identity of the product.
- Copy must work equally for contracting, manufacturing, logistics, retail, services, and holding groups.

### Banned framing
- "اكتشف ما تخفيه الدفاتر" / "what your ledgers hide" as the core pitch
- ROI/leakage calculators, savings simulators, "recover X% of spend"
- Any hard-coded performance claim (e.g. `2.4% – 5.1% recovery`, `97.4% quality`, `2 new`, `4 sources`)
- Any number that is not fetched from the backend API

---

## 2. Mock data is forbidden

- `apps/platform/src/data/mockData.ts` is **deleted**. Never reintroduce it.
- Do **not** create `MOCK_*`, `DEMO_*`, `SAMPLE_*`, `FAKE_*`, or hardcoded record arrays.
- Static **marketing copy** lives in `apps/platform/src/data/marketingContent.ts`.
- Static **catalog content** lives in `apps/platform/src/data/servicesData.ts`.
- Any operational record (decisions, risks, projects, suppliers, customers, alerts,
  integrations, workflows, audit logs, billing, members, branches) must come from
  `api.*` in `apps/platform/src/api/client.ts`.

### Empty state rules
- Unauthenticated → prompt to sign in, show **zero** records.
- Authenticated + API returned `[]` → honest empty state explaining how records appear.
- API error → error state with a Retry action. **Never** silently fall back to demo data.

---

## 3. Design system

Read these files — they are the source of truth:

| File | Contains |
|---|---|
| `src/tokens.css` | Color, type, spacing, radius, shadow, motion tokens |
| `src/styles/system.css` | Primitives: `.ml-*` layout, type, buttons, cards, badges, inputs, segmented, grid |
| `src/styles/site.css` | Public website: `.site-*` header, hero, sections, pricing, faq, footer, modal |
| `src/styles/app.css` | Customer workspace: `.app-*` shell, `.page-header`, `.empty-state`, `.page-filter-bar`, `.segmented-control`, `.stat-grid`, `.decision-*` |
| `src/styles/admin.css` | Admin: `.admin-*` shell, metrics, panels, tables, tabs, `.status-pill` |

### Tokens you should use
```
--bg-app --bg-surface --bg-surface-elevated --bg-surface-subtle --bg-inset
--text-primary --text-secondary --text-tertiary --text-muted
--border-subtle --border-default --border-strong
--accent-base --accent-light --accent-hover --accent-subtle --accent-glow
--status-success --status-warning --status-danger --status-info (+ -subtle variants)
--data-1 … --data-6            (charts only)
--radius-xs|sm|md|lg|xl|full
--space-1 … --space-24
--font-arabic --font-latin --font-mono
--ease-out --transition-fast --transition-smooth
--shadow-sm|card|elevated|glow
```

### Type scale
`.ml-eyebrow` `.ml-display` `.ml-heading` `.ml-title` `.ml-lead` `.ml-body` `.ml-muted` `.ml-mono`

### Buttons
`.ml-btn` + `--primary` `--dark` `--ghost` `--subtle` + `--sm` `--lg` `--block`
Icons go **inside** the button as children.

### Surfaces
`.ml-card` (`.ml-card--interactive`) · `.ml-panel` + `.ml-panel__head` / `__body`
`.ml-badge` + `--accent|success|warning|danger|info` · `.ml-dot`
`.ml-field` / `.ml-label` / `.ml-input` / `.ml-select` / `.ml-textarea` / `.ml-hint`
`.ml-segmented` + `.ml-segmented__item.is-active`
`.ml-grid-bg` (decorative background layer)
`.ml-modal-overlay` > `.ml-modal` + `.ml-modal__head` / `__body` / `__foot`

### Workspace
`PageHeader` and `EmptyState` components:
```tsx
import { PageHeader } from '../common/PageHeader';
import { EmptyState } from '../common/EmptyState';

<PageHeader locale={locale} icon={<IconX size={22} />}
  breadcrumb={[t('Platform'), t('Engines')]} title={...} subtitle={...}
  action={<Node />} />

<EmptyState icon={<IconX size={30} />} title={...} description={...}
  action={<button className="ml-btn ml-btn--primary">…</button>} />
```

---

## 4. API surface

`import { api } from '../../api/client'` (adjust relative path).

All calls send `credentials: 'include'` and `X-Organization-Id` automatically.

| Area | Method |
|---|---|
| Auth | `api.getMe()`, `api.login`, `api.register`, `api.logout()` |
| Org | `api.getCurrentOrganization()`, `api.getMembers()`, `api.inviteMember`, `api.getBranches()`, `api.createBranch` |
| Dashboard | `api.getDashboardSummary()` → `kpis.{pendingDecisionsCount,pendingImpactSAR,executedDecisionsCount,executedImpactSAR,totalBranches,auditEventsLogged}` |
| Decisions | `api.getDecisions()`, `api.createDecision`, `api.executeDecision(id)` |
| Anomalies | `api.getFinancialLeaks()`, `api.resolveFinancialLeak(id, …)`, `api.getFinancialAnalytics()` |
| Risk | `api.getRisks()`, `api.toggleRiskMitigation(id)` |
| Projects | `api.getProjects()`, `api.verifyProjectClaims(id)` |
| Suppliers | `api.getSuppliers()`, `api.auditSupplier(id)` |
| Customers | `api.getCustomers()`, `api.reviewCustomer(id)` |
| Data quality | `api.getDataQualityAudits()`, `api.runDataQualityScan()` |
| Assistant | `api.askAssistant(query, locale)` |
| Integrations | `api.getIntegrations()`, `api.createIntegration({...})`, `api.updateIntegration(id, {...})`, `api.deleteIntegration(id)`, `api.testIntegration(id, config?)`, `api.syncIntegration(id)` |
| File ingestion | `api.ingestJournalCsv(csv, batchId?)` — RFC-4180 parsed and validated server-side, rejects report line numbers. Also `api.ingestJournalEntries(entries, batchId?)` |
| Workflows | `api.getWorkflows()`, `api.toggleWorkflow(id)` |
| Alerts | `api.getAlerts()`, `api.toggleAlert(id)` |
| Settings | `api.getSettings()`, `api.updateSettings(…)` |
| Billing | `api.getBillingDetails()` |
| Audit | `api.getTenantAuditLogs()` |
| Public | `api.getPackages()`, `api.submitLeadInquiry(…)` |
| Admin | `api.getAdminOverview()`, `getAdminTenants`, `createTenant`, `updateTenant`, `deleteTenant`, `updateTenantStatus`, `addManualSubscription`, `confirmTenantPayment`, `getAdminUsers`, `createPlatformUser`, `updatePlatformUser`, `deletePlatformUser`, `getAdminLeads`, `updateLeadStatus`, `getAdminAuditLogs`, `getPackages/createPackage/updatePackage/deletePackage`, `issueOfflineLicense`, `verifyOfflineLicense` |

Backend route reference: `apps/api/src/server.js`.

---

## 5. Writing rules

1. **Bilingual**: every user-visible string needs `isAr ? 'عربي' : 'English'`.
2. Arabic is the default locale (`dir="rtl"`). Use logical properties
   (`marginInlineStart`, `insetInlineStart`, `text-align: start`) — never hardcode left/right.
3. No emoji as UI iconography. Use `components/Icons.tsx`.
4. Accessibility: label icon-only buttons, keep focus-visible, respect `prefers-reduced-motion`.
5. No `any` where a real type exists. `npx tsc --noEmit` must pass.
6. Keep existing public component **prop signatures** — the router depends on them.

## 6. Verification

```bash
# from apps/platform
npx tsc --noEmit
npm run build
```

Both must pass before you finish.
