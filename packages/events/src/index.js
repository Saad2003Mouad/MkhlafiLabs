// @mikhlafi-labs/events — Domain Events & Outbox Contracts
// Master Architecture v1.0 Section 9 (Service Integration Events)

export const DomainEvents = {
  FinancialAnomalyDetected: 'FinancialAnomalyDetected',
  SupplierPriceDeviationDetected: 'SupplierPriceDeviationDetected',
  ProjectDelayRiskRaised: 'ProjectDelayRiskRaised',
  DataQualityIssueDetected: 'DataQualityIssueDetected',
  CustomerChurnRiskRaised: 'CustomerChurnRiskRaised'
};

export class DomainEventFactory {
  static createEvent(type, organizationId, payload) {
    return {
      eventId: `EVT-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      eventType: type,
      organizationId,
      timestamp: new Date().toISOString(),
      schemaVersion: '1.0',
      payload
    };
  }
}
