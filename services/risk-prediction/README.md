# Predictive Risk Intelligence Service (التنبؤ بالمخاطر والإنذار المبكر)
**Descriptor:** Early Warnings, Stockout Probabilities, Material Variance & Delivery Slips.

## Architecture Structure (Section 4.2)
- `domain/`: RiskRule, PredictionThreshold, LeadingIndicator
- `application/`: CalculateLeadTimeRisks, EvaluateStockoutProbabilities
- `infrastructure/`: Time-series Stores, Forecast Models
- `api/`: REST Routes (`GET /risks/predictive`, `POST /risks/tune-thresholds`)
- `ui/`: Risk Register, Leading Indicator Heatmaps
- `events/`: Emits `ProjectDelayRiskRaised`, `OperationalRiskRaised`
- `tests/`: Prediction vs Actual Calibration Tests
