# ADR 0003: Dual Deployment Models (Managed Cloud vs. Sovereign On-Premise)

## Status
Accepted

## Context
Enterprise organizations and regional conglomerates handle highly confidential financial records, vendor pricing, and executive strategy. Many clients require data to remain within their private datacenter perimeter.

## Decision
Design the entire platform to run in two verified configurations:
1. **Managed Enterprise Cloud:** Hosted SaaS with dedicated tenant database schemas and automated backups.
2. **Sovereign On-Premise:** Full air-gapped installation inside the customer's datacenter, supporting local AI inference or Bring-Your-Own-Key (BYOK).
