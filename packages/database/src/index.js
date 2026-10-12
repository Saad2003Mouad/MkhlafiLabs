// @mikhlafi-labs/database — Relational Schema Models & Multi-Tenant Isolation
// Master Architecture v1.0 Section 5 (Conceptual Data Entities)

export const SchemaEntities = [
  'User',
  'Organization',
  'Membership',
  'Branch',
  'ServiceDefinition',
  'FeatureDefinition',
  'Plan',
  'PlanService',
  'Subscription',
  'SubscriptionItem',
  'Entitlement',
  'UsageRecord',
  'QuoteRequest',
  'QuoteVersion',
  'Contract',
  'Deployment',
  'IntegrationConnection',
  'AuditLog',
  'EventOutbox',
  'InvoicePayment'
];

export class DatabaseClient {
  static getEntityNames() {
    return SchemaEntities;
  }
}
