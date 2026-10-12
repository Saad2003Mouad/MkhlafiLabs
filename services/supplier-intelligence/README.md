# Supplier Intelligence Service (ذكاء الموردين والمشتريات)
**Descriptor:** Vendor Scorecard, Contract Price Indexing, Reliability SLAs, Dependency Risks.

## Architecture Structure (Section 4.2)
- `domain/`: SupplierProfile, ContractPriceBook, DeliverySLA, SoleSourceRisk
- `application/`: ScoreSupplierReliability, DetectPriceCreep, AuditContractClauses
- `infrastructure/`: Vendor Master Data Connectors
- `api/`: REST Routes (`GET /suppliers`, `GET /suppliers/:id/price-variance`)
- `ui/`: Supplier Performance Scorecards, Contract Variance Explorer
- `events/`: Emits `SupplierPriceDeviationDetected`, `VendorSLAWarning`
- `tests/`: Price Book Matching & Unit Normalization Tests
