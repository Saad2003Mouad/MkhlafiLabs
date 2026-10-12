# ADR 0001: Modular Monolith with Monorepo Architecture

## Status
Accepted

## Context
MIKHLAFI LABS comprises 8 distinct intelligence engines, public websites, internal admin, and background workers. Building 8 separate microservices from day one introduces severe operational overhead, distributed transaction complexity, and network latency.

## Decision
Adopt a Modular Monolith in a single monorepo (`pnpm-workspace.yaml`). Each service is logically isolated with explicit boundaries (`domain`, `application`, `infrastructure`, `api`, `ui`, `events`), but shares single relational database transactions and shared packages without direct cross-table queries.

## Consequences
- Clean logical boundaries with simplified local development and single-command deployment.
- Individual services can be extracted into microservices in the future when scaling or isolation demands it.
