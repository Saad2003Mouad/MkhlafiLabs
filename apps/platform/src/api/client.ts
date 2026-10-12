// MIKHLAFI LABS — Production API Client (TypeScript)
// Communicates with /api/v1 backend endpoints with automatic credentials and error handling

export interface UserProfile {
  id: string;
  email: string;
  nameEn: string;
  nameAr?: string;
  phone?: string;
  status: string;
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

  async inviteMember(email: string, role = 'viewer'): Promise<{ success: boolean; membership: any }> {
    return this.request('/organizations/members', {
      method: 'POST',
      body: JSON.stringify({ email, role })
    });
  }

  async getBranches(): Promise<{ organizationId: string; branches: any[] }> {
    return this.request('/branches', { method: 'GET' });
  }

  async createBranch(params: { nameEn: string; nameAr?: string; code?: string; city?: string }): Promise<{ success: boolean; branch: any }> {
    return this.request('/branches', {
      method: 'POST',
      body: JSON.stringify(params)
    });
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

  // ── Dashboard Summary ─────────────────────────────────────────────────────
  async getDashboardSummary(): Promise<DashboardSummaryResponse> {
    return this.request('/dashboard/summary', { method: 'GET' });
  }
}

export const api = new ApiClient();
