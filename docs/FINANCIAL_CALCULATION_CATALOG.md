# MIKHLAFI LABS — Centralized Financial Calculation Engine & Math Catalog

## 1. Architectural Philosophy

All financial metrics, forensic variance formulas, earned value indicators, and concentration indices are centralized in [`apps/api/src/services/financial/calculations.js`](file:///d:/mikhlafi-labs/apps/api/src/services/financial/calculations.js). 

Inline ad-hoc formulas across UI components and route handlers are strictly prohibited. Every mathematical operation enforces **zero-denominator guards**, **finite range validation**, and **null-safe fallbacks** to eliminate `NaN` or `Infinity` bugs.

---

## 2. Catalog of Mathematical Formulas & Guard Semantics

### 2.1 Budget Variance & Utilization
- **Absolute Variance:**
  $$\text{Variance} = \text{Actual} - \text{Budget}$$
- **Variance Percentage:**
  $$\text{Variance \%} = \frac{\text{Actual} - \text{Budget}}{\text{Budget}} \times 100$$
  *Guard:* If $\text{Budget} = 0$, returns `0.00%` rather than dividing by zero.
- **Budget Utilization:**
  $$\text{Utilization \%} = \frac{\text{Spent}}{\text{Budget}} \times 100$$
  *Guard:* If $\text{Budget} = 0$, returns `0.00%`.

### 2.2 Earned Value Management (EVM) for Projects
- **Schedule Variance (SV):**
  $$\text{SV} = \text{EV} - \text{PV}$$
- **Cost Variance (CV):**
  $$\text{CV} = \text{EV} - \text{AC}$$
- **Schedule Performance Index (SPI):**
  $$\text{SPI} = \frac{\text{EV}}{\text{PV}}$$
  *Guard:* If $\text{PV} \le 0$, returns `1.000` (neutral baseline).
- **Cost Performance Index (CPI):**
  $$\text{CPI} = \frac{\text{EV}}{\text{AC}}$$
  *Guard:* If $\text{AC} \le 0$, returns `1.000` (neutral baseline).

### 2.3 Supplier Price Creep & Benchmarking
- **Price Deviation:**
  $$\text{Deviation \%} = \frac{\text{Actual Price} - \text{Baseline Price}}{\text{Baseline Price}} \times 100$$
  *Guard:* If $\text{Baseline Price} \le 0$, returns `0.00%`.

### 2.4 Revenue Concentration & Market Risk
- **Top 3 Customer Share:**
  $$\text{Top 3 Share} = \frac{\sum_{i=1}^3 \text{Revenue}_i}{\text{Total Revenue}} \times 100$$
- **Herfindahl-Hirschman Index (HHI):**
  $$\text{HHI} = \sum_{i=1}^n \left( \frac{\text{Revenue}_i}{\text{Total Revenue}} \times 100 \right)^2$$
  *Guard:* If $\text{Total Revenue} \le 0$, returns `0.00` for both metrics.

### 2.5 Success Rate & Composite Risk Scoring
- **Success Rate:**
  $$\text{Success \%} = \frac{\text{Successful Count}}{\text{Total Count}} \times 100$$
  *Guard:* If $\text{Total Count} \le 0$, returns `0.00%`.
- **Composite Risk Score:**
  $$\text{Risk Score} = \sum_{k} w_k \cdot S_k, \quad \sum w_k = 1$$
  *Bound:* Clamped strictly to the $[0.00, 100.00]$ range.

---

## 3. Test Coverage

All formulas are comprehensively verified by [`apps/api/tests/financial_calculations.test.js`](file:///d:/mikhlafi-labs/apps/api/tests/financial_calculations.test.js):
- Zero-denominator handling for budgets, actual costs, and baselines.
- Boundary conditions ($0$ revenue, $100\%$ concentration).
- High precision floating-point rounding ($2$ decimal places).
