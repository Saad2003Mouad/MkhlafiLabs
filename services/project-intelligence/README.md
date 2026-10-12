# Project Intelligence Service (ذكاء أداء المشاريع والإنشاءات)
**Descriptor:** EPC / Contracting, Actual vs Planned Costs, Progress Billing & Critical Path Delays.

## Architecture Structure (Section 4.2)
- `domain/`: ProjectContract, ProgressCertificate, CriticalPathMilestone, MarginErosion
- `application/`: CompareBaselineToActual, TrackUnbilledClaims, CorrelateVendorDelays
- `infrastructure/`: Project Planning Connectors, Billing Trackers
- `api/`: REST Routes (`GET /projects`, `GET /projects/:id/critical-path`)
- `ui/`: Portfolio Gantt Status, Margin Erosion Dashboards
- `events/`: Emits `ProjectDelayRiskRaised`, `MarginErosionAlert`
- `tests/`: Milestone Calculation & Penalty Liability Tests
