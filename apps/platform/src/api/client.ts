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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
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

  async getMembers(): Promise<{ organizationId: string; members: any[] }> {
    return this.request('/organizations/members', { method: 'GET' });
  }

  async inviteMember(
    emailOrParams: string | { email: string; role?: string; branchId?: string | null },
    role = 'viewer'
  ): Promise<{ success: boolean; membership: any }> {
    const payload = typeof emailOrParams === 'string'
      ? { email: emailOrParams, role }
      : emailOrParams;
    return this.request('/organizations/members', {
      method: 'POST',
      body: JSON.stringify(payload)
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

  async updateTenantStatus(tenantId: string, status: string, reason?: string): Promise<{ success: boolean; organization: any }> {
    return this.request(`/admin/organizations/${tenantId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason })
    });
  }

  async getAdminUsers(): Promise<{ users: any[] }> {
    return this.request('/admin/users', { method: 'GET' });
  }

  async getAdminLeads(): Promise<{ leads: any[] }> {
    return this.request('/admin/leads', { method: 'GET' });
  }

  async getAdminAuditLogs(): Promise<{ auditLogs: any[] }> {
    return this.request('/admin/audit', { method: 'GET' });
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

  async askAssistant(queryText: string, locale = 'ar'): Promise<{
    success: boolean;
    response: string;
    citations: Array<{ source: string; docId: string; confidence: string }>;
    aiProvider?: { name: string; isLocal: boolean; sovereignty: string };
  }> {
    return this.request('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ query: queryText, locale })
    });
  }


  // ── Operations: Integrations Hub ──────────────────────────────────────────
  async getIntegrations(): Promise<{ organizationId: string; integrations: any[] }> {
    return this.request('/integrations', { method: 'GET' });
  }

  async syncIntegration(id: string): Promise<{ success: boolean; integration: any }> {
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
  async ingestJournalEntries(entries: any[], batchId?: string): Promise<{
    success: boolean;
    batchId: string;
    totalIngested: number;
    flaggedCount: number;
    flaggedItems: any[];
  }> {
    return this.request('/ingest/journal-entries', {
      method: 'POST',
      body: JSON.stringify({ entries, batchId })
    });
  }
}

export const api = new ApiClient();
