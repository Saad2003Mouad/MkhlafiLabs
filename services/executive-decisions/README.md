# Executive Decision Center Service (مركز القرارات التنفيذية)
**Descriptor:** Executive Attention Queue, Monetary Impact Prioritization, Assignee Tracking, Verified Savings.

## Architecture Structure (Section 4.2)
- `domain/`: Decision, AttentionItem, ActionOwner, ImpactScore
- `application/`: PrioritizeAttentionQueue, AssignDecisionOwner, RecordVerifiedSavings
- `infrastructure/`: DecisionEventStore, AuditLogger
- `api/`: REST Routes (`GET /decisions`, `POST /decisions/:id/take-action`)
- `ui/`: Executive Attention Queue, Decision Action Drawer
- `events/`: Consumes all domain anomaly events from other engines
- `tests/`: Priority Ranking & Assignment Lifecycle Tests
