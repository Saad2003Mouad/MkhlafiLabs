# ADR 0002: Separation of Catalog, Plans, and Runtime Entitlements

## Status
Accepted

## Context
Hardcoding service lists or subscription plan names inside the application code makes pricing flexibility impossible and introduces brittle access control.

## Decision
Separate the commercial Catalog (Services & Plans) from runtime Entitlements. The application code only checks `hasEntitlement(organizationId, 'financial-intelligence')`, completely agnostic of whether it was acquired via an enterprise bundle, an individual module, or a custom quote contract.
