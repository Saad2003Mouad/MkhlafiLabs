# Data Quality Intelligence Service (مراقبة جودة البيانات والربط)
**Descriptor:** Deduplication, Missing Mandatory Fields, Currency Calibration, Ingestion Health.

## Architecture Structure (Section 4.2)
- `domain/`: DataQualityRule, NormalizationMap, DuplicateCluster, HealthScore
- `application/`: DeduplicateEntities, ValidateMandatoryFields, CheckCurrencyConsistency
- `infrastructure/`: Pipeline Monitors, Data Profilers
- `api/`: REST Routes (`GET /data-quality/score`, `POST /data-quality/cleanse`)
- `ui/`: Data Cleanliness Meters, Entity Discrepancy Resolvers
- `events/`: Emits `DataQualityIssueDetected`
- `tests/`: Normalization Algorithm Accuracy Tests
