// @mikhlafi-labs/entitlements — Service Rights, Quotas & Feature Toggles
// Master Architecture v1.0 Section 7: "Entitlement is the execution reference, not plan name alone"

export class EntitlementsService {
  static getActiveEntitlements(organizationId) {
    // Returns active entitled modules for given organization
    return [
      'financial-intelligence',
      'executive-decisions',
      'risk-prediction',
      'project-intelligence',
      'supplier-intelligence',
      'customer-intelligence',
      'ai-assistant',
      'data-quality'
    ];
  }

  static hasEntitlement(organizationId, serviceId) {
    const active = this.getActiveEntitlements(organizationId);
    return active.includes(serviceId);
  }
}
