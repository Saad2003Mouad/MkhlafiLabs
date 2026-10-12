// @mikhlafi-labs/security — Secrets, Encryption & Tenant Isolation
// Master Architecture v1.0 Section 11 & 12

export class SecurityGuard {
  static sanitizeOutput(data) {
    const sanitized = { ...data };
    delete sanitized.rawPassword;
    delete sanitized.clientSecret;
    delete sanitized.databasePassword;
    return sanitized;
  }
}
