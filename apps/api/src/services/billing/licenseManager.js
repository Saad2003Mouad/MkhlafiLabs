// MIKHLAFI LABS — Cryptographic Offline License Authority (Private Edition)
// Issues and validates tamper-evident digital licenses for air-gapped on-premises installations

import crypto from 'node:crypto';
import fs from 'node:fs';

const DEFAULT_SIGNING_SECRET = process.env.LICENSE_SIGNING_SECRET || 'mikhlafi-labs-license-secret-2026-sovereign';

export class LicenseManager {
  constructor(secret = DEFAULT_SIGNING_SECRET) {
    this.secret = secret;
  }

  /**
   * Generates a canonical representation of license parameters for digital signing.
   */
  canonicalize(payload) {
    const sorted = {
      licenseId: payload.licenseId,
      customerSlug: payload.customerSlug,
      customerName: payload.customerName,
      edition: payload.edition || 'PRIVATE_EDITION',
      tier: payload.tier || 'enterprise',
      issuedAt: payload.issuedAt,
      expiresAt: payload.expiresAt,
      maintenanceExpiresAt: payload.maintenanceExpiresAt || payload.expiresAt,
      maxMembers: Number(payload.maxMembers || 100),
      maxBranches: Number(payload.maxBranches || 25),
      licensedCapabilities: Array.isArray(payload.licensedCapabilities) ? payload.licensedCapabilities.slice().sort() : []
    };
    return JSON.stringify(sorted);
  }

  signPayload(canonicalString) {
    return crypto.createHmac('sha256', this.secret).update(canonicalString).digest('hex');
  }

  /**
   * Generates a complete signed license object ready for export to customer.
   */
  generateSignedLicense(options) {
    const {
      licenseId = `LIC-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      customerSlug,
      customerName,
      edition = 'PRIVATE_EDITION',
      tier = 'enterprise',
      issuedAt = new Date().toISOString(),
      expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      maintenanceExpiresAt = null,
      maxMembers = 100,
      maxBranches = 25,
      licensedCapabilities = [
        'financial-intelligence',
        'executive-decisions',
        'data-quality',
        'risk-intelligence',
        'supplier-intelligence',
        'customer-intelligence',
        'project-intelligence',
        'ai-assistant'
      ]
    } = options;

    if (!customerSlug || !customerName) {
      throw new Error('Customer slug and customer name are required to issue a license.');
    }

    const payload = {
      licenseId,
      customerSlug,
      customerName,
      edition,
      tier,
      issuedAt,
      expiresAt,
      maintenanceExpiresAt: maintenanceExpiresAt || expiresAt,
      maxMembers,
      maxBranches,
      licensedCapabilities
    };

    const canonical = this.canonicalize(payload);
    const signature = this.signPayload(canonical);

    return {
      ...payload,
      signature
    };
  }

  /**
   * Validates an offline license payload against digital signature and expiry rules.
   */
  verifyOfflineLicense(licenseData) {
    if (!licenseData || typeof licenseData !== 'object') {
      return { valid: false, error: 'Invalid license format: Expected JSON object.' };
    }

    const { signature, ...payload } = licenseData;
    if (!signature) {
      return { valid: false, error: 'Tamper detected: License signature is missing.' };
    }

    const canonical = this.canonicalize(payload);
    const expectedSignature = this.signPayload(canonical);

    // Constant-time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return { valid: false, error: 'Cryptographic signature mismatch: License has been modified or forged.' };
    }

    const now = new Date();
    const expiry = new Date(payload.expiresAt);

    if (now > expiry) {
      return {
        valid: false,
        expired: true,
        error: `License expired on ${payload.expiresAt}. Please renew subscription.`
      };
    }

    const maintenanceExpiry = new Date(payload.maintenanceExpiresAt || payload.expiresAt);
    const isMaintenanceActive = now <= maintenanceExpiry;

    return {
      valid: true,
      expired: false,
      isMaintenanceActive,
      license: payload
    };
  }

  /**
   * Loads and verifies license from file path or environment variable.
   */
  loadFromEnvironment(filePath = null) {
    let raw = process.env.MIKHLAFI_LICENSE_KEY;
    if (!raw && filePath && fs.existsSync(filePath)) {
      raw = fs.readFileSync(filePath, 'utf8');
    }

    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      return this.verifyOfflineLicense(parsed);
    } catch (err) {
      return { valid: false, error: `Failed to parse license key: ${err.message}` };
    }
  }
}

export const licenseManager = new LicenseManager();
