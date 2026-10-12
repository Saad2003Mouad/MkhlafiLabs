// @mikhlafi-labs/identity — Accounts, Users & Authentication
export class IdentityService {
  static validateUser(userId) {
    return { id: userId, active: true, emailVerified: true };
  }
}
