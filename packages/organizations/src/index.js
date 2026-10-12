// @mikhlafi-labs/organizations — Tenants, Branches & Memberships
export class OrganizationService {
  static getOrganization(orgId) {
    return {
      id: orgId,
      name: 'Al-Yusr Holding Group',
      timezone: 'Asia/Riyadh',
      currency: 'SAR',
      branches: ['Riyadh Head Office', 'Jeddah Regional Hub', 'Eastern Province Operations']
    };
  }
}
