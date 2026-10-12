# Customer Intelligence Service (مراقبة العملاء ومخاطر فقدانهم)
**Descriptor:** Client Retention, Recurring Revenue Vulnerability, Order Volume Drops.

## Architecture Structure (Section 4.2)
- `domain/`: CustomerAccount, RevenueRunRate, EngagementHealthScore, ChurnSignal
- `application/`: DetectOrderVolumeDrop, FlagExpiringContracts, CorrelateServiceComplaints
- `infrastructure/`: CRM & Invoicing Connectors
- `api/`: REST Routes (`GET /customers/at-risk`, `GET /customers/:id/trend`)
- `ui/`: Client Health Radar, At-Risk Revenue Table
- `events/`: Emits `CustomerChurnRiskRaised`
- `tests/`: Churn Signal Sensitivity Tests
