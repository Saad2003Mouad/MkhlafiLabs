# AI Assistant Service (المساعد التنفيذي المدعوم بالبيانات)
**Descriptor:** Grounded Natural Language Queries, Evidence-Backed Responses, Strict SQL/API Guardrails.

## Architecture Structure (Section 4.2)
- `domain/`: ExecutiveQuery, GroundedContext, CitationLink, ExecutionPolicy
- `application/`: TranslatePromptToStructuredQuery, ValidatePermissions, AttachEvidenceCitations
- `infrastructure/`: LLM Gateway (Local / Private API / BYOK), Vector Indexes
- `api/`: REST Routes (`POST /assistant/query`, `GET /assistant/history`)
- `ui/`: Executive AI Chat Interface with Evidence Drawers
- `events/`: Emits `AuditLog` of sensitive executive inquiries
- `tests/`: Prompt Injection Protection & Hallucination Suppression Tests
