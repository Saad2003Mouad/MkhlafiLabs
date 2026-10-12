# Financial Intelligence Service (كشف الهدر المالي والاختلالات)
**Descriptor:** Duplicate Invoices, Price Deviations, Out-of-Policy Expenses, 3-Way Match Verification.

## Architecture Structure (Section 4.2)
- `domain/`: Entities (Invoice, PO, Receipt, PriceVariationRule)
- `application/`: DetectDuplicateInvoices, FlagPriceDeviations
- `infrastructure/`: ERP Data Extractors, Transaction Repositories
- `api/`: REST Routes (`GET /anomalies`, `POST /anomalies/:id/verify`)
- `ui/`: Financial Intelligence Analytics Views & Data Tables
- `events/`: Emits `FinancialAnomalyDetected`
- `tests/`: Deterministic Arithmetic Unit Tests
