// MIKHLAFI LABS — Production API Client (TypeScript)
// Communicates with /api/v1 backend endpoints with automatic credentials and error handling

export interface UserProfile {
  id: string;
  email: string;
  nameEn: string;
  nameAr?: string;
  phone?: string;
  status: string;
  isPlatformAdmin?: boolean;
}

export interface TenantContext {
  organizationId: string;
  orgSlug: string;
  orgNameEn: string;
  orgNameAr: string;
  currency: string;
  timezone: string;
  role: string;
  branchId?: string | null;
  permissions: string[];
  availableOrganizations: Array<{
    id: string;
    slug: string;
    nameEn: string;
    nameAr: string;
    role: string;
    currency: string;
    timezone: string;
  }>;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  tenant: TenantContext | null;
  isLoading: boolean;
  error: string | null;
}

export interface DashboardSummaryResponse {
  organization: {
    id: string;
    nameEn: string;
    nameAr: string;
    slug: string;
    currency: string;
  };
  user: {
    id: string;
    nameEn: string;
    role: string;
  };
  kpis: {
    pendingDecisionsCount: number;
    pendingImpactSAR: number;
    executedDecisionsCount: number;
    executedImpactSAR: number;
    totalBranches: number;
    auditEventsLogged: number;
  };
  databaseEngine: string;
  isolationStatus: string;
}

/** One engine in the operator-owned services catalog. */
export interface PlatformService {
  id: string;
  engine_number: string;
  slug: string;
  badge_ar: string;
  badge_en: string;
  title_ar: string;
  title_en: string;
  summary_ar: string;
  summary_en: string;
  sort_order: number;
  is_enabled: boolean;
  updated_at?: string;
}

export interface IntegrationConfig {
  endpoint_url?: string;
  record_path?: string;
  api_key?: string;
  timeout_ms?: number;
  headers?: Record<string, string>;
}

export interface IntegrationSource {
  id: string;
  organization_id: string;
  code: string;
  name_en: string;
  name_ar: string;
  category: string;
  auth_type: string;
  records_synced_count: number | string;
  last_sync_status: string;
  last_sync_at: string;
  status: string;
  config?: IntegrationConfig;
  created_at?: string;
  updated_at?: string;
}

export interface ConnectionProbe {
  reachable: boolean;
  errorCode?: string;
  message?: string;
  url?: string;
  httpStatus?: number;
  contentType?: string;
  format?: string;
  candidateRecords?: number;
  parseMessage?: string;
  latencyMs?: number;
}

export interface IngestResult {
  success: boolean;
  batchId: string;
  totalIngested: number;
  acceptedCount: number;
  rejectedCount: number;
  duplicateCount: number;
  flaggedCount: number;
  flaggedItems: Array<{ docNum: string; amount: number; vendorName: string; flagReason: string }>;
  validationErrors: Array<{ row: number; field: string; message: string }>;
}

export interface RealDecisionItem {
  id: string;
  organization_id: string;
  title: string;
  category: string;
  impact_amount: string | number;
  currency: string;
  risk_level: string;
  status: string;
  created_at: string;
}

export interface MemberRecord {
  membership_id: string;
  user_id: string;
  email: string;
  name_en?: string;
  name_ar?: string;
  phone?: string;
  role: string;
  status: string;
  department?: string | null;
  job_title?: string | null;
  branch_id?: string | null;
  branch_name?: string | null;
  branch_name_ar?: string | null;
  created_at: string;
}

export interface EmployeeProvisionPayload {
  email: string;
  password?: string;
  nameAr?: string;
  nameEn?: string;
  phone?: string;
  role?: string;
  department?: string;
  jobTitle?: string;
  branchId?: string | null;
}

export interface ProvisionedCredentials {
  email: string;
  password: string;
  nameAr: string;
  nameEn: string;
  role: string;
  department?: string | null;
  jobTitle?: string | null;
}

export interface TeamChannel {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  is_default: boolean;
  created_at: string;
  message_count: number;
  last_message_at?: string | null;
}

export interface TeamMessage {
  id: string;
  channel_id: string;
  content: string;
  attachment_type: 'none' | 'report' | 'task' | 'alert' | 'ledger_entry';
  attachment_data?: any;
  created_at: string;
  user_id: string;
  sender_email: string;
  sender_name_ar?: string;
  sender_name_en?: string;
  sender_role: string;
  sender_job_title?: string;
  sender_department?: string;
}

export interface TeamTask {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  created_by: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  due_date?: string;
  related_report_ref?: string;
  created_at: string;
  updated_at: string;
  assignee_name_ar?: string;
  assignee_name_en?: string;
  assignee_email?: string;
  assignee_job_title?: string;
  assignee_department?: string;
  creator_name_ar?: string;
  creator_name_en?: string;
}

class ApiClient {
  private baseUrl = '/api/v1';
  private activeOrgId: string | null = null;

  setActiveOrganizationId(orgId: string | null) {
    this.activeOrgId = orgId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.activeOrgId) {
      headers['X-Organization-Id'] = this.activeOrgId;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include' // Always include HttpOnly cookies
    });

    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      // In case Vercel or an intermediate gateway returned plain text / HTML (e.g. 500, 502, 504)
      if (!response.ok) {
        throw new Error(text || `Server error (${response.status})`);
      }
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(data?.error || data?.message || `Request failed with status ${response.status}`);
    }

    return data as T;
  }

  // ── Authentication ────────────────────────────────────────────────────────
  async getMe(): Promise<{ user: UserProfile; tenant: TenantContext | null; availableOrganizations: any[] }> {
    return this.request('/auth/me', { method: 'GET' });
  }

  async login(email: string, password: string): Promise<{ success: boolean; user: UserProfile; activeTenant: TenantContext }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(params: {
    email: string;
    password: string;
    nameEn: string;
    nameAr?: string;
    orgNameEn: string;
    orgNameAr?: string;
  }): Promise<{ success: boolean; user: UserProfile; organization: any }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async logout(): Promise<{ success: boolean }> {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // ── Organizations & Memberships ───────────────────────────────────────────
  async getCurrentOrganization(): Promise<{
    organization: any;
    userRole: string;
    permissions: string[];
    branchCount: number;
    memberCount: number;
  }> {
    return this.request('/organizations/current', { method: 'GET' });
  }

  async getMembers(): Promise<{ organizationId: string; members: MemberRecord[] }> {
    return this.request('/organizations/members', { method: 'GET' });
  }

  async provisionEmployee(payload: EmployeeProvisionPayload): Promise<{
    success: boolean;
    membership: any;
    credentials: ProvisionedCredentials;
  }> {
    return this.request('/organizations/members', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async inviteMember(
    emailOrParams: string | EmployeeProvisionPayload,
    role = 'viewer'
  ): Promise<{ success: boolean; membership: any; credentials?: ProvisionedCredentials }> {
    const payload = typeof emailOrParams === 'string'
      ? { email: emailOrParams, role }
      : emailOrParams;
    return this.request('/organizations/members', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async resetMemberPassword(
    membershipId: string,
    password?: string
  ): Promise<{ success: boolean; email: string; newPassword: string }> {
    return this.request(`/organizations/members/${membershipId}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password })
    });
  }

  async updateMember(
    membershipId: string,
    params: { role?: string; department?: string; jobTitle?: string; branchId?: string | null; status?: string }
  ): Promise<{ success: boolean; membership: any }> {
    return this.request(`/organizations/members/${membershipId}`, {
      method: 'PATCH',
      body: JSON.stringify(params)
    });
  }

  async removeMember(membershipId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/organizations/members/${membershipId}`, {
      method: 'DELETE'
    });
  }

  async getBranches(): Promise<{ organizationId: string; branches: any[] }> {
    return this.request('/branches', { method: 'GET' });
  }

  async createBranch(params: { nameEn: string; nameAr?: string; code?: string; city?: string; isMainHq?: boolean }): Promise<{ success: boolean; branch: any }> {
    return this.request('/branches', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // ── Executive Dashboard Summary ───────────────────────────────────────────
  async getDashboardSummary(): Promise<DashboardSummaryResponse> {
    return this.request('/dashboard/summary', { method: 'GET' });
  }

  // ── Operational Decisions ─────────────────────────────────────────────────
  async getDecisions(status?: string): Promise<{
    organizationId: string;
    count: number;
    totalPendingImpactSAR: number;
    decisions: RealDecisionItem[];
  }> {
    const queryStr = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request(`/records/decisions${queryStr}`, { method: 'GET' });
  }

  async createDecision(params: {
    title: string;
    category: string;
    impactAmount: number;
    riskLevel?: string;
  }): Promise<{ success: boolean; decision: RealDecisionItem }> {
    return this.request('/records/decisions', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async executeDecision(decisionId: string): Promise<{ success: boolean; decision: any }> {
    return this.request(`/records/decisions/${decisionId}/execute`, {
      method: 'POST'
    });
  }

  // ── Financial Leak Detection (Service 01) ─────────────────────────────────
  async getFinancialLeaks(filters?: { severity?: string; status?: string }): Promise<{
    organizationId: string;
    totalCases: number;
    activeLeakageSAR: number;
    protectedAmountSAR: number;
    highSeverityCount: number;
    anomalies: Array<{
      id: string;
      case_number: string;
      rule_code: string;
      severity: string;
      confidence_pct: number;
      target_vendor: string;
      flagged_amount: number;
      currency: string;
      narrative_en: string;
      narrative_ar: string;
      status: string;
      created_at: string;
      resolved_at?: string;
    }>;
  }> {
    const params = new URLSearchParams();
    if (filters?.severity) params.set('severity', filters.severity);
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/records/financial-leaks${qs}`, { method: 'GET' });
  }

  async resolveFinancialLeak(
    anomalyId: string,
    action: 'FREEZE' | 'LEGITIMATE' | 'RESOLVE',
    notes = ''
  ): Promise<{ success: boolean; anomaly: any }> {
    return this.request(`/records/financial-leaks/${anomalyId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action, notes })
    });
  }

  async getFinancialAnalytics(filters?: { startDate?: string; endDate?: string; branchId?: string }): Promise<{
    organizationId: string;
    hasData: boolean;
    currency: string;
    summary: {
      totalRevenue: number;
      totalExpenses: number;
      netCashFlow: number;
      activeLeakage: number;
      protectedCapital: number;
      anomalyCount: number;
      periodVariance?: {
        currentPeriod: string;
        previousPeriod: string;
        absoluteVarianceSAR: number | null;
        percentageChange: number | null;
      };
    };
    monthlyTrends: Array<{
      period: string;
      revenue: number;
      expenses: number;
      netFlow: number;
      transactionCount: number;
    }>;
    expenseBreakdown: Array<{
      account: string;
      category: string;
      amount: number;
      count: number;
    }>;
    topVendors: Array<{
      vendorName: string;
      totalSpend: number;
      invoiceCount: number;
      currency: string;
    }>;
    severityDistribution: Array<{
      severity: string;
      count: number;
      totalFlaggedSAR: number;
    }>;
    branchBreakdown: Array<{
      branchNameEn: string;
      branchNameAr: string;
      branchCode: string;
      totalSpend: number;
      invoiceCount: number;
    }>;
  }> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    if (filters?.branchId) params.set('branchId', filters.branchId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/records/financial-analytics${qs}`, { method: 'GET' });
  }

  // ── Customer Billing & Subscriptions ──────────────────────────────────────
  async getBillingDetails(): Promise<{
    subscription: any;
    usage: {
      monthlyRecordsUsed: number;
      activeEnginesCount: number;
      totalEnginesCount: number;
    };
  }> {
    return this.request('/billing/current', { method: 'GET' });
  }

  // ── Inbound Lead Inquiries (Public) ───────────────────────────────────────
  async submitLeadInquiry(params: {
    name: string;
    email: string;
    companyName?: string;
    phone?: string;
    message?: string;
    inquiryType?: string;
  }): Promise<{ success: boolean; message: string; inquiry: any }> {
    return this.request('/inquiries', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // ── Platform Administration (/api/v1/admin/*) ──────────────────────────
  async getAdminOverview(): Promise<{
    organizations: { total: number; active: number; suspended: number };
    users: { total: number };
    subscriptions: any[];
    financialIntelligence: { totalCases: number; totalFlaggedSAR: number };
    leads: { total: number; new: number };
    platformStatus: string;
  }> {
    return this.request('/admin/overview', { method: 'GET' });
  }

  async getAdminTenants(): Promise<{ organizations: any[] }> {
    return this.request('/admin/organizations', { method: 'GET' });
  }

  async createTenant(payload: {
    nameAr: string;
    nameEn: string;
    slug: string;
    currency?: string;
    timezone?: string;
    adminEmail: string;
    adminPassword?: string;
    adminNameAr: string;
    adminNameEn: string;
    packageId?: string;
    subscriptionMonths?: number;
  }): Promise<{ success: boolean; organization: any; adminUser: any; subscription: any }> {
    return this.request('/admin/organizations', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateTenant(tenantId: string, payload: {
    nameAr?: string;
    nameEn?: string;
    slug?: string;
    currency?: string;
    timezone?: string;
    status?: string;
  }): Promise<{ success: boolean; organization: any }> {
    return this.request(`/admin/organizations/${tenantId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteTenant(tenantId: string): Promise<{ success: boolean; deleted: any }> {
    return this.request(`/admin/organizations/${tenantId}`, {
      method: 'DELETE'
    });
  }

  async updateTenantStatus(tenantId: string, status: string, reason?: string): Promise<{ success: boolean; organization: any }> {
    return this.request(`/admin/organizations/${tenantId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason })
    });
  }

  async addManualSubscription(tenantId: string, payload: {
    packageId: string;
    durationMonths?: number;
    amount?: number;
    paymentMethod?: string;
    referenceNumber?: string;
    notes?: string;
  }): Promise<{ success: boolean; subscription: any }> {
    return this.request(`/admin/organizations/${tenantId}/subscription`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async confirmTenantPayment(tenantId: string, amount: number, referenceNumber: string, notes = ''): Promise<{ success: boolean; subscription: any }> {
    return this.request(`/admin/organizations/${tenantId}/confirm-payment`, {
      method: 'POST',
      body: JSON.stringify({ amount, referenceNumber, notes })
    });
  }

  async getAdminUsers(): Promise<{ users: any[] }> {
    return this.request('/admin/users', { method: 'GET' });
  }

  async createPlatformUser(payload: {
    email: string;
    password: string;
    nameAr: string;
    nameEn: string;
    isPlatformAdmin?: boolean;
  }): Promise<{ success: boolean; user: any }> {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updatePlatformUser(userId: string, payload: {
    nameAr?: string;
    nameEn?: string;
    status?: string;
    isPlatformAdmin?: boolean;
    newPassword?: string;
  }): Promise<{ success: boolean; user: any }> {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deletePlatformUser(userId: string): Promise<{ success: boolean; deletedUser: any }> {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }

  async getAdminLeads(): Promise<{ leads: any[] }> {
    return this.request('/admin/leads', { method: 'GET' });
  }

  async updateLeadStatus(leadId: string, status: string, notes = ''): Promise<{ success: boolean; lead: any }> {
    return this.request(`/admin/leads/${leadId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  }

  async getAdminAuditLogs(): Promise<{ auditLogs: any[] }> {
    return this.request('/admin/audit', { method: 'GET' });
  }

  async getPackages(): Promise<{ packages: any[] }> {
    return this.request('/admin/packages', { method: 'GET' });
  }

  // ── Platform services (engines) catalog ───────────────────────────────────

  /** Full catalog, including disabled engines. Platform operators only. */
  async getAdminServices(): Promise<{ services: PlatformService[] }> {
    return this.request('/admin/services', { method: 'GET' });
  }

  async updateAdminService(
    serviceId: string,
    payload: {
      titleAr?: string;
      titleEn?: string;
      badgeAr?: string;
      badgeEn?: string;
      summaryAr?: string;
      summaryEn?: string;
      sortOrder?: number;
      isEnabled?: boolean;
    }
  ): Promise<{ success: boolean; service: PlatformService }> {
    return this.request(`/admin/services/${encodeURIComponent(serviceId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  /** Enabled engines only — this is what the public website renders. */
  async getPublishedServices(): Promise<{ services: PlatformService[] }> {
    return this.request('/services', { method: 'GET' });
  }

  async createPackage(payload: {
    id: string;
    nameAr: string;
    nameEn: string;
    tierLevel?: number;
    monthlyPriceSar?: number;
    annualPriceSar?: number;
    maxBranches?: number;
    maxMembers?: number;
    monthlyRecordLimit?: number;
    capabilities?: string[];
  }): Promise<{ success: boolean; package: any }> {
    return this.request('/admin/packages', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updatePackage(packageId: string, payload: {
    nameAr?: string;
    nameEn?: string;
    tierLevel?: number;
    monthlyPriceSar?: number;
    annualPriceSar?: number;
    maxBranches?: number;
    maxMembers?: number;
    monthlyRecordLimit?: number;
    capabilities?: string[];
    isActive?: boolean;
  }): Promise<{ success: boolean; package: any }> {
    return this.request(`/admin/packages/${packageId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deletePackage(packageId: string): Promise<{ success: boolean; message?: string }> {
    return this.request(`/admin/packages/${packageId}`, {
      method: 'DELETE'
    });
  }

  async issueOfflineLicense(payload: {
    customerSlug: string;
    customerName: string;
    tier?: string;
    edition?: string;
    maxMembers?: number;
    licensedCapabilities?: string[];
  }): Promise<{ success: boolean; license: any }> {
    return this.request('/admin/licenses/issue', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async verifyOfflineLicense(licenseData: any): Promise<{ valid: boolean; error?: string; license?: any }> {
    return this.request('/admin/licenses/verify', {
      method: 'POST',
      body: JSON.stringify(licenseData)
    });
  }

  async getTenantAuditLogs(): Promise<{ success: boolean; logs: any[] }> {
    return this.request('/tenant/audit-logs', { method: 'GET' });
  }

  // ── Operational Intelligence Engines (Services 03-08) ────────────────────
  async getRisks(): Promise<{
    organizationId: string;
    count: number;
    totalMonitoredExposureSAR: number;
    risks: any[];
  }> {
    return this.request('/records/risks', { method: 'GET' });
  }

  async toggleRiskMitigation(riskId: string): Promise<{ success: boolean; risk: any }> {
    return this.request(`/records/risks/${riskId}/mitigate`, { method: 'POST' });
  }

  async getProjects(): Promise<{
    organizationId: string;
    count: number;
    totalCapitalBudgetSAR: number;
    projects: any[];
  }> {
    return this.request('/records/projects', { method: 'GET' });
  }

  async verifyProjectClaims(projectId: string): Promise<{ success: boolean; project: any }> {
    return this.request(`/records/projects/${projectId}/verify-claims`, { method: 'POST' });
  }

  async getSuppliers(): Promise<{
    organizationId: string;
    count: number;
    totalMonitoredContractsSAR: number;
    suppliers: any[];
  }> {
    return this.request('/records/suppliers', { method: 'GET' });
  }

  async auditSupplier(supplierId: string): Promise<{ success: boolean; supplier: any }> {
    return this.request(`/records/suppliers/${supplierId}/audit`, { method: 'POST' });
  }

  async getCustomers(): Promise<{
    organizationId: string;
    count: number;
    totalRevenueAtRiskSAR: number;
    customers: any[];
  }> {
    return this.request('/records/customers', { method: 'GET' });
  }

  async reviewCustomer(customerId: string): Promise<{ success: boolean; customer: any }> {
    return this.request(`/records/customers/${customerId}/review`, { method: 'POST' });
  }

  async getDataQualityAudits(): Promise<{
    organizationId: string;
    overallComplianceScore: number;
    audits: any[];
  }> {
    return this.request('/data-quality/audits', { method: 'GET' });
  }

  async runDataQualityScan(): Promise<{
    success: boolean;
    message: string;
    overallComplianceScore: number;
    audits: any[];
  }> {
    return this.request('/data-quality/scan', { method: 'POST' });
  }

  async askAssistant(queryText: string, locale = 'ar', personaConfig?: any): Promise<{
    success: boolean;
    response: string;
    citations: Array<{ source: string; docId: string; confidence: string }>;
    aiProvider?: { name: string; isLocal: boolean; sovereignty: string };
  }> {
    return this.request('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ query: queryText, locale, personaConfig })
    });
  }

  async ingestLedgerEntries(entries: Array<{
    documentNumber: string;
    vendorName?: string;
    amount: number;
    postingDate?: string;
    text?: string;
    category?: string;
  }>, batchId?: string): Promise<{
    success: boolean;
    batchId: string;
    totalIngested: number;
    duplicateCount: number;
    flaggedCount: number;
    flaggedItems?: any[];
  }> {
    return this.request('/ingest/journal-entries', {
      method: 'POST',
      body: JSON.stringify({ entries, batchId })
    });
  }

  // ── Operations: Integrations Hub ──────────────────────────────────────────
  async getIntegrations(): Promise<{ organizationId: string; integrations: IntegrationSource[] }> {
    return this.request('/integrations', { method: 'GET' });
  }

  async createIntegration(params: {
    code: string;
    name_en: string;
    name_ar: string;
    category?: string;
    auth_type?: string;
    config?: IntegrationConfig;
  }): Promise<{ success: boolean; integration: IntegrationSource }> {
    return this.request('/integrations', { method: 'POST', body: JSON.stringify(params) });
  }

  async updateIntegration(
    id: string,
    params: Partial<{
      code: string;
      name_en: string;
      name_ar: string;
      category: string;
      auth_type: string;
      config: IntegrationConfig;
    }>
  ): Promise<{ success: boolean; integration: IntegrationSource }> {
    return this.request(`/integrations/${id}`, { method: 'PUT', body: JSON.stringify(params) });
  }

  async deleteIntegration(id: string): Promise<{ success: boolean }> {
    return this.request(`/integrations/${id}`, { method: 'DELETE' });
  }

  /** Verifies reachability and payload shape without ingesting anything. */
  async testIntegration(id: string, config?: IntegrationConfig): Promise<ConnectionProbe> {
    return this.request(`/integrations/${id}/test`, {
      method: 'POST',
      body: JSON.stringify(config ? { config } : {})
    });
  }

  /** Executes a real outbound read of the source system and ingests what returns. */
  async syncIntegration(
    id: string
  ): Promise<{
    success: boolean;
    status: string;
    recordsProcessed?: number;
    recordsRejected?: number;
    message?: string;
    errorCode?: string;
    error?: string;
    integration: IntegrationSource;
  }> {
    return this.request(`/integrations/${id}/sync`, { method: 'POST' });
  }

  // ── Operations: Workflows ─────────────────────────────────────────────────
  async getWorkflows(): Promise<{ organizationId: string; workflows: any[] }> {
    return this.request('/workflows', { method: 'GET' });
  }

  async toggleWorkflow(id: string): Promise<{ success: boolean; workflow: any }> {
    return this.request(`/workflows/${id}/toggle`, { method: 'POST' });
  }

  // ── Operations: Alerts ────────────────────────────────────────────────────
  async getAlerts(): Promise<{ organizationId: string; alerts: any[] }> {
    return this.request('/alerts', { method: 'GET' });
  }

  async toggleAlert(id: string): Promise<{ success: boolean; alert: any }> {
    return this.request(`/alerts/${id}/acknowledge`, { method: 'POST' });
  }

  // ── Operations: Workspace Settings ────────────────────────────────────────
  async getSettings(): Promise<any> {
    return this.request('/organization/settings', { method: 'GET' });
  }

  async updateSettings(params: { currency?: string; calendar?: string; retention?: string; dataClassification?: string }): Promise<{ success: boolean; settings: any }> {
    return this.request('/organization/settings', { method: 'PUT', body: JSON.stringify(params) });
  }

  // ── Operations: ERP Journal Entry Ingestion ───────────────────────────────
  async ingestJournalEntries(entries: any[], batchId?: string): Promise<IngestResult> {
    return this.request('/ingest/journal-entries', {
      method: 'POST',
      body: JSON.stringify({ entries, batchId })
    });
  }

  /**
   * Connects a source system by uploading a spreadsheet/CSV export.
   * Parsing and row-level validation run server-side; rejected rows come back
   * with their line number instead of being silently coerced.
   */
  async ingestJournalCsv(csv: string, batchId?: string): Promise<IngestResult> {
    return this.request('/ingest/journal-csv', {
      method: 'POST',
      body: JSON.stringify({ csv, batchId })
    });
  }

  // ── Team Collaboration: Channels & Chat Hub ──────────────────────────────
  async getTeamChannels(): Promise<{ organizationId: string; channels: TeamChannel[] }> {
    return this.request('/team/channels', { method: 'GET' });
  }

  async createTeamChannel(params: {
    nameAr: string;
    nameEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    slug?: string;
  }): Promise<{ success: boolean; channel: TeamChannel }> {
    return this.request('/team/channels', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async getTeamMessages(channelId: string): Promise<{ channelId: string; messages: TeamMessage[] }> {
    return this.request(`/team/channels/${channelId}/messages`, { method: 'GET' });
  }

  async sendTeamMessage(
    channelId: string,
    params: { content: string; attachmentType?: string; attachmentData?: any }
  ): Promise<{ success: boolean; message: TeamMessage }> {
    return this.request(`/team/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // ── Team Collaboration: Tasks Board ───────────────────────────────────────
  async getTeamTasks(params?: { status?: string; assignedTo?: string }): Promise<{ organizationId: string; tasks: TeamTask[] }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.assignedTo) searchParams.set('assignedTo', params.assignedTo);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/team/tasks${qs}`, { method: 'GET' });
  }

  async createTeamTask(params: {
    title: string;
    description?: string;
    assignedTo?: string;
    priority?: string;
    status?: string;
    dueDate?: string;
    relatedReportRef?: string;
  }): Promise<{ success: boolean; task: TeamTask }> {
    return this.request('/team/tasks', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async updateTeamTask(
    taskId: string,
    params: Partial<{
      title: string;
      description: string;
      assignedTo: string;
      priority: string;
      status: string;
      dueDate: string;
      relatedReportRef: string;
    }>
  ): Promise<{ success: boolean; task: TeamTask }> {
    return this.request(`/team/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(params)
    });
  }

  async deleteTeamTask(taskId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/team/tasks/${taskId}`, {
      method: 'DELETE'
    });
  }
}

export const api = new ApiClient();
