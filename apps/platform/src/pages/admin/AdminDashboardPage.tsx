// MIKHLAFI LABS — Platform Administration Console
// The platform owner's /admin/* control surface. Every record rendered below is
// fetched live from the privileged administration API (/api/v1/admin/*) — this
// console never shows placeholder, demo, or mock data.
// Strict separation: customer workspaces and platform operations never share
// framing, and every action performed here is written to the immutable audit log.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LocaleMode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api, type PlatformService } from '../../api/client';
import { ROUTES } from '../../router/routes';
import {
  IconActivity,
  IconAlert,
  IconArrowRight,
  IconCheckCircle,
  IconCreditCard,
  IconCustomer,
  IconDashboard,
  IconDownload,
  IconFileText,
  IconLayers,
  IconLock,
  IconOrganization,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconServer,
  IconShield,
  IconX
} from '../../components/Icons';

interface AdminDashboardPageProps {
  locale: LocaleMode;
  currentRoute: string;
  onNavigate: (path: string) => void;
}

/* ── Records returned by the privileged administration API ───────────────── */

interface AdminOverview {
  organizations: { total: number; active: number; suspended: number };
  users: { total: number };
  subscriptions: Array<{ package_id?: string; count?: number | string }>;
  financialIntelligence: { totalCases: number; totalFlaggedSAR: number };
  leads: { total: number; new: number };
  platformStatus: string;
}

interface TenantRecord {
  id: string;
  slug?: string;
  name_ar?: string;
  name_en?: string;
  currency?: string;
  timezone?: string;
  status?: string;
  created_at?: string;
  package_id?: string | null;
  subscription_status?: string | null;
  billing_interval?: string | null;
  current_period_end?: string | null;
  package_name_ar?: string | null;
  package_name_en?: string | null;
  member_count?: number | string | null;
  branch_count?: number | string | null;
}

interface PlatformUserRecord {
  id: string;
  email: string;
  name_ar?: string;
  name_en?: string;
  status?: string;
  is_platform_admin?: boolean;
  tenant_count?: number | string | null;
  organizations_summary?: string | null;
}

interface LeadRecord {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company_name?: string | null;
  inquiry_type?: string | null;
  message?: string | null;
  status?: string | null;
  created_at?: string | null;
}

interface AuditLogRecord {
  id: string;
  created_at?: string | null;
  action?: string | null;
  operator_email?: string | null;
  target_tenant_name_ar?: string | null;
  ip_address?: string | null;
  details?: unknown;
}

interface PackageRecord {
  id: string;
  name_ar?: string;
  name_en?: string;
  tier_level?: number | string | null;
  monthly_price_sar?: number | string | null;
  annual_price_sar?: number | string | null;
  max_branches?: number | string | null;
  max_members?: number | string | null;
  monthly_record_limit?: number | string | null;
  is_active?: boolean | null;
  capabilities?: string[] | null;
  active_subscribers_count?: number | string | null;
}

/* ── Static capability catalog (the 8 intelligence engines, not user data) ── */

const ALL_CAPABILITIES = [
  { id: 'financial-intelligence', nameAr: 'الذكاء المالي وكشف التسرب', nameEn: 'Financial intelligence' },
  { id: 'executive-decisions', nameAr: 'مركز القرارات التنفيذية', nameEn: 'Executive decisions' },
  { id: 'data-quality', nameAr: 'ذكاء جودة البيانات', nameEn: 'Data quality intelligence' },
  { id: 'risk-intelligence', nameAr: 'ذكاء المخاطر المؤسسية', nameEn: 'Risk intelligence' },
  { id: 'supplier-intelligence', nameAr: 'ذكاء الموردين والمشتريات', nameEn: 'Supplier intelligence' },
  { id: 'customer-intelligence', nameAr: 'ذكاء العملاء والإيرادات', nameEn: 'Customer intelligence' },
  { id: 'project-intelligence', nameAr: 'ذكاء المشاريع والعمليات', nameEn: 'Project intelligence' },
  { id: 'ai-assistant', nameAr: 'المساعد الذكي للأعمال', nameEn: 'AI business assistant' }
];

/* ── Enumerations accepted by the API (recorded codes, not placeholder data) ─ */

const LEAD_STATUS_CODES = ['NEW', 'IN_REVIEW', 'CONTACTED', 'CONVERTED', 'ARCHIVED'] as const;
const PAYMENT_METHODS = ['BANK_TRANSFER', 'CASH', 'CHEQUE', 'CREDIT_CARD'] as const;
const CURRENCY_CODES = ['SAR', 'USD', 'AED', 'EUR'] as const;
const DURATION_MONTHS = [1, 3, 6, 12, 24, 36] as const;
const TENANT_STATUSES = ['active', 'suspended', 'archived'] as const;

/* ── Form models & defaults ──────────────────────────────────────────────── */

interface TenantForm {
  nameAr: string;
  nameEn: string;
  slug: string;
  currency: string;
  adminEmail: string;
  adminPassword: string;
  adminNameAr: string;
  adminNameEn: string;
  packageId: string;
  subscriptionMonths: number;
}

interface EditTenantForm {
  nameAr: string;
  nameEn: string;
  slug: string;
  currency: string;
  timezone: string;
  status: string;
}

interface SubscriptionForm {
  packageId: string;
  durationMonths: number;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  notes: string;
}

interface PaymentForm {
  amount: number;
  referenceNumber: string;
  notes: string;
}

interface ServiceForm {
  titleAr: string;
  titleEn: string;
  badgeAr: string;
  badgeEn: string;
  summaryAr: string;
  summaryEn: string;
  sortOrder: string;
}

interface PackageForm {
  id: string;
  nameAr: string;
  nameEn: string;
  tierLevel: number;
  monthlyPriceSar: number;
  annualPriceSar: number;
  maxBranches: number;
  maxMembers: number;
  monthlyRecordLimit: number;
  capabilities: string[];
}

interface UserForm {
  email: string;
  password: string;
  nameAr: string;
  nameEn: string;
  isPlatformAdmin: boolean;
  status: string;
}

interface LicenseForm {
  customerName: string;
  customerSlug: string;
  tier: string;
  maxMembers: number;
  capabilities: string[];
}

const EMPTY_TENANT_FORM: TenantForm = {
  nameAr: '',
  nameEn: '',
  slug: '',
  currency: 'SAR',
  adminEmail: '',
  adminPassword: '',
  adminNameAr: '',
  adminNameEn: '',
  packageId: '',
  subscriptionMonths: 12
};

const EMPTY_SERVICE_FORM: ServiceForm = {
  titleAr: '',
  titleEn: '',
  badgeAr: '',
  badgeEn: '',
  summaryAr: '',
  summaryEn: '',
  sortOrder: '1'
};

const EMPTY_LICENSE_FORM: LicenseForm = {
  customerName: '',
  customerSlug: '',
  tier: '',
  maxMembers: 25,
  capabilities: []
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const toApiMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};

const slugify = (value: string): string => value.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

const toCount = (value: number | string | null | undefined): number => Number(value ?? 0) || 0;

const tenantStatusClass = (status?: string | null): string => {
  if (status === 'active') return 'status-pill active';
  if (status === 'suspended') return 'status-pill suspended';
  if (status === 'trial') return 'status-pill trial';
  return 'status-pill inactive';
};

const tenantStatusLabel = (status: string | null | undefined, isAr: boolean): string => {
  if (status === 'active') return isAr ? 'نشطة' : 'Active';
  if (status === 'suspended') return isAr ? 'معلّقة' : 'Suspended';
  if (status === 'archived') return isAr ? 'مؤرشفة' : 'Archived';
  if (status === 'trial') return isAr ? 'تجريبية' : 'Trial';
  return status || (isAr ? 'غير محددة' : 'Unknown');
};

const userStatusClass = (status?: string | null): string =>
  status === 'active' ? 'status-pill active' : 'status-pill inactive';

const userStatusLabel = (status: string | null | undefined, isAr: boolean): string => {
  if (status === 'active') return isAr ? 'نشط' : 'Active';
  if (status === 'suspended') return isAr ? 'معلّق' : 'Suspended';
  return status || (isAr ? 'غير محدد' : 'Unknown');
};

const leadStatusLabel = (code: string, isAr: boolean): string => {
  switch (code) {
    case 'NEW':
      return isAr ? 'جديد' : 'New';
    case 'IN_REVIEW':
      return isAr ? 'قيد المراجعة' : 'In review';
    case 'CONTACTED':
      return isAr ? 'تم التواصل' : 'Contacted';
    case 'CONVERTED':
      return isAr ? 'تم التحويل' : 'Converted';
    case 'ARCHIVED':
      return isAr ? 'مؤرشف' : 'Archived';
    default:
      return code;
  }
};

const detailsText = (details: unknown): string => {
  if (details === null || details === undefined || details === '') return '—';
  if (typeof details === 'string') return details;
  try {
    return JSON.stringify(details);
  } catch {
    return '—';
  }
};

/* ── Data hook: honest loading / error / data states, no silent fallbacks ── */

interface AdminResource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

function useAdminResource<T>(load: () => Promise<T>, fallback: string): AdminResource<T> {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({
    data: null,
    loading: true,
    error: null
  });
  const [nonce, setNonce] = useState(0);
  const pending = useRef({ load, fallback });
  pending.current = { load, fallback };

  useEffect(() => {
    let alive = true;
    setState((prev) => ({ data: prev.data, loading: true, error: null }));
    pending.current.load().then(
      (data) => {
        if (alive) setState({ data, loading: false, error: null });
      },
      (err: unknown) => {
        if (!alive) return;
        setState({ data: null, loading: false, error: toApiMessage(err, pending.current.fallback) });
      }
    );
    return () => {
      alive = false;
    };
  }, [nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data: state.data, loading: state.loading, error: state.error, reload };
}

/* ── Shared building blocks ──────────────────────────────────────────────── */

const MetricTile: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  textValue?: boolean;
}> = ({ label, value, hint, textValue }) => (
  <div className="admin-metric">
    <div className="admin-metric__label">{label}</div>
    <div className={`admin-metric__value ${textValue ? 'admin-metric__value--text' : ''}`}>{value}</div>
    {hint && <div className="admin-metric__hint">{hint}</div>}
  </div>
);

const SectionError: React.FC<{
  locale: LocaleMode;
  message: string;
  onRetry: () => void;
}> = ({ locale, message, onRetry }) => {
  const isAr = locale === 'ar';
  return (
    <div className="admin-error" role="alert">
      <span className="admin-error__icon">
        <IconAlert size={26} />
      </span>
      <div className="admin-error__title">
        {isAr ? 'تعذر تحميل البيانات من واجهة الإدارة' : 'Could not load data from the administration API'}
      </div>
      <div className="admin-error__msg">{message}</div>
      <button type="button" className="ml-btn ml-btn--subtle ml-btn--sm" onClick={onRetry}>
        <IconRefresh size={14} />
        {isAr ? 'إعادة المحاولة' : 'Retry'}
      </button>
    </div>
  );
};

const SectionEmpty: React.FC<{
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
}> = ({ icon, title, description, action, compact }) => (
  <div className={`admin-empty ${compact ? 'admin-empty--compact' : ''}`} role="status">
    <span aria-hidden="true">{icon}</span>
    <div className="admin-empty__title">{title}</div>
    {description && <p className="admin-empty__desc">{description}</p>}
    {action && <div style={{ marginTop: 18 }}>{action}</div>}
  </div>
);

const TableSkeleton: React.FC<{ label: string; rows?: number }> = ({ label, rows = 5 }) => (
  <div className="admin-skel-rows" role="status" aria-live="polite">
    <span className="ml-sr-only">{label}</span>
    {Array.from({ length: rows }).map((_, index) => (
      <div className="admin-skel-row" key={index} aria-hidden="true">
        <span className="admin-skel admin-skel--text" />
        <span className="admin-skel admin-skel--text" />
        <span className="admin-skel admin-skel--text" />
        <span className="admin-skel admin-skel--text" />
        <span className="admin-skel admin-skel--text" />
      </div>
    ))}
  </div>
);

const MetricsSkeleton: React.FC<{ label: string }> = ({ label }) => (
  <div className="admin-metrics" role="status" aria-live="polite">
    <span className="ml-sr-only">{label}</span>
    {Array.from({ length: 6 }).map((_, index) => (
      <div className="admin-metric" key={index} aria-hidden="true">
        <span className="admin-skel admin-skel--label" />
        <span className="admin-skel admin-skel--value" />
        <span className="admin-skel admin-skel--hint" />
      </div>
    ))}
  </div>
);

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({
  label,
  hint,
  children
}) => (
  <label className="ml-field">
    <span className="ml-label">{label}</span>
    {children}
    {hint && <span className="ml-hint">{hint}</span>}
  </label>
);

interface ModalShellProps {
  locale: LocaleMode;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
  wide?: boolean;
  danger?: boolean;
}

const ModalShell: React.FC<ModalShellProps> = ({
  locale,
  title,
  description,
  onClose,
  children,
  footer,
  wide,
  danger
}) => {
  const isAr = locale === 'ar';
  return (
    <div className="ml-modal-overlay" onClick={onClose}>
      <div
        className={`ml-modal ${wide ? 'admin-modal--wide' : ''} ${danger ? 'admin-modal--danger' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ml-modal__head">
          <div className="admin-modal__title">
            {danger && (
              <span style={{ color: 'var(--status-danger)', display: 'inline-flex' }}>
                <IconAlert size={17} />
              </span>
            )}
            <span>{title}</span>
            <button
              type="button"
              className="ml-icon-btn admin-modal__close"
              onClick={onClose}
              aria-label={isAr ? 'إغلاق النافذة' : 'Close dialog'}
              title={isAr ? 'إغلاق' : 'Close'}
            >
              <IconX size={15} />
            </button>
          </div>
          {description && <p className="admin-modal__desc">{description}</p>}
        </div>
        <div className="ml-modal__body">{children}</div>
        <div className="ml-modal__foot admin-modal__foot">{footer}</div>
      </div>
    </div>
  );
};

/* ═════════════════════════════════════════════════════════════════════════════
   PAGE
   ═════════════════════════════════════════════════════════════════════════ */

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ locale, currentRoute, onNavigate }) => {
  const isAr = locale === 'ar';
  const { user } = useAuth();

  /* ── Live resources (loaded on mount; no placeholder fallbacks) ───────── */

  const overview = useAdminResource<AdminOverview>(
    () => api.getAdminOverview(),
    isAr ? 'تعذر تحميل مؤشرات المنصة' : 'Could not load the platform overview'
  );
  const tenantsRes = useAdminResource<TenantRecord[]>(
    () => api.getAdminTenants().then((r) => (r.organizations ?? []) as TenantRecord[]),
    isAr ? 'تعذر تحميل قائمة المؤسسات' : 'Could not load the organization list'
  );
  const usersRes = useAdminResource<PlatformUserRecord[]>(
    () => api.getAdminUsers().then((r) => (r.users ?? []) as PlatformUserRecord[]),
    isAr ? 'تعذر تحميل دليل المستخدمين' : 'Could not load the user directory'
  );
  const leadsRes = useAdminResource<LeadRecord[]>(
    () => api.getAdminLeads().then((r) => (r.leads ?? []) as LeadRecord[]),
    isAr ? 'تعذر تحميل طلبات التواصل' : 'Could not load inbound inquiries'
  );
  const packagesRes = useAdminResource<PackageRecord[]>(
    () => api.getPackages().then((r) => (r.packages ?? []) as PackageRecord[]),
    isAr ? 'تعذر تحميل الباقات' : 'Could not load packages'
  );
  const auditRes = useAdminResource<AuditLogRecord[]>(
    () => api.getAdminAuditLogs().then((r) => (r.auditLogs ?? []) as AuditLogRecord[]),
    isAr ? 'تعذر تحميل سجل التدقيق' : 'Could not load the audit log'
  );
  const servicesRes = useAdminResource<PlatformService[]>(
    () => api.getAdminServices().then((r) => (r.services ?? []) as PlatformService[]),
    isAr ? 'تعذر تحميل كتالوج الخدمات' : 'Could not load the service catalog'
  );

  /* ── Ephemeral UI state ───────────────────────────────────────────────── */

  const [notice, setNotice] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formBusy, setFormBusy] = useState(false);
  const [tenantSearch, setTenantSearch] = useState('');
  const [busyLeadId, setBusyLeadId] = useState<string | null>(null);
  const [busyTenantId, setBusyTenantId] = useState<string | null>(null);

  /* Service catalog editing: one engine open at a time, plus a per-row busy id
     so a toggle cannot be double-submitted while its request is in flight. */
  const [serviceEditId, setServiceEditId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState<ServiceForm>(EMPTY_SERVICE_FORM);
  const [busyServiceId, setBusyServiceId] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 7000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  /* ── Modal state (only one dialog open at a time) ─────────────────────── */

  const [createOpen, setCreateOpen] = useState(false);
  const [tenantForm, setTenantForm] = useState<TenantForm>(EMPTY_TENANT_FORM);

  const [editTarget, setEditTarget] = useState<TenantRecord | null>(null);
  const [editForm, setEditForm] = useState<EditTenantForm>({
    nameAr: '',
    nameEn: '',
    slug: '',
    currency: 'SAR',
    timezone: 'UTC',
    status: 'active'
  });

  const [statusTarget, setStatusTarget] = useState<TenantRecord | null>(null);
  const [statusForm, setStatusForm] = useState<{ status: string; reason: string }>({ status: 'active', reason: '' });

  const [subscriptionTarget, setSubscriptionTarget] = useState<TenantRecord | null>(null);
  const [subscriptionForm, setSubscriptionForm] = useState<SubscriptionForm>({
    packageId: '',
    durationMonths: 12,
    amount: 0,
    paymentMethod: 'BANK_TRANSFER',
    referenceNumber: '',
    notes: ''
  });

  const [paymentTarget, setPaymentTarget] = useState<TenantRecord | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({ amount: 0, referenceNumber: '', notes: '' });

  const [deleteTarget, setDeleteTarget] = useState<TenantRecord | null>(null);

  const [packageModal, setPackageModal] = useState<{ mode: 'create' } | { mode: 'edit'; record: PackageRecord } | null>(null);
  const [packageForm, setPackageForm] = useState<PackageForm>({
    id: '',
    nameAr: '',
    nameEn: '',
    tierLevel: 1,
    monthlyPriceSar: 0,
    annualPriceSar: 0,
    maxBranches: 0,
    maxMembers: 0,
    monthlyRecordLimit: 0,
    capabilities: []
  });
  const [deletePackageTarget, setDeletePackageTarget] = useState<PackageRecord | null>(null);

  const [userModal, setUserModal] = useState<{ mode: 'create' } | { mode: 'edit'; record: PlatformUserRecord } | null>(null);
  const [userForm, setUserForm] = useState<UserForm>({
    email: '',
    password: '',
    nameAr: '',
    nameEn: '',
    isPlatformAdmin: false,
    status: 'active'
  });
  const [deleteUserTarget, setDeleteUserTarget] = useState<PlatformUserRecord | null>(null);

  const closeAllModals = useCallback(() => {
    setCreateOpen(false);
    setEditTarget(null);
    setStatusTarget(null);
    setSubscriptionTarget(null);
    setPaymentTarget(null);
    setDeleteTarget(null);
    setPackageModal(null);
    setDeletePackageTarget(null);
    setUserModal(null);
    setDeleteUserTarget(null);
    setFormError(null);
    setFormBusy(false);
  }, []);

  const anyModalOpen =
    createOpen ||
    !!editTarget ||
    !!statusTarget ||
    !!subscriptionTarget ||
    !!paymentTarget ||
    !!deleteTarget ||
    !!packageModal ||
    !!deletePackageTarget ||
    !!userModal ||
    !!deleteUserTarget;

  useEffect(() => {
    if (!anyModalOpen) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAllModals();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [anyModalOpen, closeAllModals]);

  /* ── Licenses tab: local issue / verify state ─────────────────────────── */

  const [licenseForm, setLicenseForm] = useState<LicenseForm>(EMPTY_LICENSE_FORM);
  const [issuedLicense, setIssuedLicense] = useState<unknown>(null);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<{ ok: boolean; message: string } | null>(null);

  /* ── Active section, derived from the routed admin path ───────────────── */

  const activeTab = (() => {
    if (currentRoute.startsWith('/admin/organizations') || currentRoute.startsWith('/admin/tenants')) return 'organizations';
    if (currentRoute.startsWith('/admin/packages') || currentRoute.startsWith('/admin/plans')) return 'packages';
    if (currentRoute.startsWith('/admin/services') || currentRoute.startsWith('/admin/engines')) return 'services';
    if (currentRoute.startsWith('/admin/licenses') || currentRoute.startsWith('/admin/license')) return 'licenses';
    if (currentRoute.startsWith('/admin/users') || currentRoute.startsWith('/admin/members')) return 'users';
    if (currentRoute.startsWith('/admin/leads') || currentRoute.startsWith('/admin/inquiries')) return 'leads';
    if (currentRoute.startsWith('/admin/audit') || currentRoute.startsWith('/admin/logs')) return 'audit';
    return 'overview';
  })();

  const tenantName = (record: TenantRecord | null): string =>
    !record ? '' : record.name_ar || record.name_en || record.slug || record.id;

  /* ── Formatting helpers ───────────────────────────────────────────────── */

  const fmtNumber = (value: number | string | null | undefined): string => toCount(value).toLocaleString(isAr ? 'ar' : 'en');

  const fmtDate = (value?: string | null): string => {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString(isAr ? 'ar' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const money = (value: number | string | null | undefined): string => {
    const amount = Number(value ?? 0) || 0;
    if (!amount) return '0';
    return amount.toLocaleString(isAr ? 'ar' : 'en', { maximumFractionDigits: 2 });
  };

  /* ── Refresh orchestration ────────────────────────────────────────────── */

  const refreshOrganizations = useCallback(() => {
    tenantsRes.reload();
    overview.reload();
  }, [tenantsRes, overview]);

  const refreshPackages = useCallback(() => {
    packagesRes.reload();
    overview.reload();
  }, [packagesRes, overview]);

  const refreshActive = useCallback(() => {
    switch (activeTab) {
      case 'organizations':
        tenantsRes.reload();
        break;
      case 'users':
        usersRes.reload();
        break;
      case 'leads':
        leadsRes.reload();
        break;
      case 'packages':
        packagesRes.reload();
        break;
      case 'services':
        servicesRes.reload();
        break;
      case 'audit':
        auditRes.reload();
        break;
      case 'overview':
      default:
        overview.reload();
        break;
    }
  }, [activeTab, auditRes, leadsRes, overview, packagesRes, servicesRes, tenantsRes, usersRes]);

  /* ── Service catalog actions ──────────────────────────────────────────── */

  const openServiceEdit = (svc: PlatformService) => {
    setFormError(null);
    setServiceEditId(svc.id);
    setServiceForm({
      titleAr: svc.title_ar ?? '',
      titleEn: svc.title_en ?? '',
      badgeAr: svc.badge_ar ?? '',
      badgeEn: svc.badge_en ?? '',
      summaryAr: svc.summary_ar ?? '',
      summaryEn: svc.summary_en ?? '',
      sortOrder: String(toCount(svc.sort_order))
    });
  };

  const toggleServiceEnabled = async (svc: PlatformService) => {
    setBusyServiceId(svc.id);
    setFormError(null);
    try {
      await api.updateAdminService(svc.id, { isEnabled: !svc.is_enabled });
      setNotice({
        tone: 'success',
        text: svc.is_enabled
          ? isAr
            ? 'تم تعطيل الخدمة — لم تعد تظهر على الموقع العام.'
            : 'Service disabled — it no longer appears on the public website.'
          : isAr
            ? 'تم تفعيل الخدمة وأصبحت ظاهرة على الموقع العام.'
            : 'Service enabled — it is now visible on the public website.'
      });
      servicesRes.reload();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : isAr ? 'تعذر تحديث حالة الخدمة.' : 'Unable to update the service.'
      );
    } finally {
      setBusyServiceId(null);
    }
  };

  const saveServiceEdit = async () => {
    if (serviceEditId === null) return;
    setBusyServiceId(serviceEditId);
    setFormError(null);
    try {
      await api.updateAdminService(serviceEditId, {
        titleAr: serviceForm.titleAr.trim(),
        titleEn: serviceForm.titleEn.trim(),
        badgeAr: serviceForm.badgeAr.trim(),
        badgeEn: serviceForm.badgeEn.trim(),
        summaryAr: serviceForm.summaryAr.trim(),
        summaryEn: serviceForm.summaryEn.trim(),
        sortOrder: toCount(serviceForm.sortOrder)
      });
      setNotice({
        tone: 'success',
        text: isAr
          ? 'تم حفظ الخدمة ونشر التغييرات على الموقع العام.'
          : 'Service saved — the change is live on the public website.'
      });
      setServiceEditId(null);
      servicesRes.reload();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : isAr ? 'تعذر حفظ الخدمة.' : 'Unable to save the service.'
      );
    } finally {
      setBusyServiceId(null);
    }
  };

  /* ── Tenant actions ───────────────────────────────────────────────────── */

  const openCreateTenant = () => {
    setTenantForm(EMPTY_TENANT_FORM);
    setFormError(null);
    setCreateOpen(true);
  };

  const submitCreateTenant = async () => {
    setFormError(null);
    if (
      !tenantForm.nameAr.trim() ||
      !tenantForm.nameEn.trim() ||
      !tenantForm.slug.trim() ||
      !tenantForm.adminEmail.trim() ||
      !tenantForm.adminPassword.trim()
    ) {
      setFormError(
        isAr
          ? 'الرجاء تعبئة الحقول المطلوبة: الاسم بالعربية والإنجليزية، المعرّف، وبيانات مدير الحساب'
          : 'Please fill in the required fields: Arabic name, English name, slug, and administrator credentials'
      );
      return;
    }
    setFormBusy(true);
    try {
      await api.createTenant({
        nameAr: tenantForm.nameAr.trim(),
        nameEn: tenantForm.nameEn.trim(),
        slug: slugify(tenantForm.slug.trim()),
        currency: tenantForm.currency,
        adminEmail: tenantForm.adminEmail.trim(),
        adminPassword: tenantForm.adminPassword,
        adminNameAr: tenantForm.adminNameAr.trim(),
        adminNameEn: tenantForm.adminNameEn.trim(),
        ...(tenantForm.packageId
          ? { packageId: tenantForm.packageId, subscriptionMonths: tenantForm.subscriptionMonths }
          : {})
      });
      setCreateOpen(false);
      setTenantForm(EMPTY_TENANT_FORM);
      setNotice({ tone: 'success', text: isAr ? 'تم إنشاء المؤسسة بنجاح' : 'Organization created successfully' });
      refreshOrganizations();
    } catch (err) {
      setFormError(toApiMessage(err, isAr ? 'تعذر إنشاء المؤسسة' : 'Could not create the organization'));
    } finally {
      setFormBusy(false);
    }
  };

  const openEditTenant = (record: TenantRecord) => {
    setEditForm({
      nameAr: record.name_ar ?? '',
      nameEn: record.name_en ?? '',
      slug: record.slug ?? '',
      currency: record.currency ?? 'SAR',
      timezone: record.timezone ?? 'UTC',
      status: record.status ?? 'active'
    });
    setEditTarget(record);
    setFormError(null);
  };

  const submitEditTenant = async () => {
    if (!editTarget) return;
    setFormError(null);
    setFormBusy(true);
    try {
      await api.updateTenant(editTarget.id, {
        nameAr: editForm.nameAr.trim(),
        nameEn: editForm.nameEn.trim(),
        slug: editForm.slug.trim(),
        currency: editForm.currency,
        timezone: editForm.timezone,
        status: editForm.status
      });
      setEditTarget(null);
      setNotice({ tone: 'success', text: isAr ? 'تم تحديث بيانات المؤسسة' : 'Organization details updated' });
      refreshOrganizations();
    } catch (err) {
      setFormError(toApiMessage(err, isAr ? 'تعذر تحديث المؤسسة' : 'Could not update the organization'));
    } finally {
      setFormBusy(false);
    }
  };

  const openStatusTenant = (record: TenantRecord) => {
    setStatusForm({ status: record.status === 'archived' ? 'active' : record.status ?? 'active', reason: '' });
    setStatusTarget(record);
    setFormError(null);
  };

  const submitStatusTenant = async () => {
    if (!statusTarget) return;
    setFormError(null);
    setFormBusy(true);
    setBusyTenantId(statusTarget.id);
    try {
      await api.updateTenantStatus(statusTarget.id, statusForm.status, statusForm.reason.trim());
      setStatusTarget(null);
      setNotice({
        tone: 'success',
        text: isAr
          ? `تم تحديث حالة ${tenantName(statusTarget)} إلى ${tenantStatusLabel(statusForm.status, isAr)}`
          : `Status of ${tenantName(statusTarget)} changed to ${tenantStatusLabel(statusForm.status, isAr)}`
      });
      refreshOrganizations();
    } catch (err) {
      setFormError(toApiMessage(err, isAr ? 'تعذر تحديث الحالة' : 'Could not change the status'));
    } finally {
      setFormBusy(false);
      setBusyTenantId(null);
    }
  };

  const openSubscription = (record: TenantRecord) => {
    setSubscriptionForm({
      packageId: record.package_id ?? '',
      durationMonths: 12,
      amount: 0,
      paymentMethod: 'BANK_TRANSFER',
      referenceNumber: '',
      notes: ''
    });
    setSubscriptionTarget(record);
    setFormError(null);
  };

  const submitSubscription = async () => {
    if (!subscriptionTarget) return;
    setFormError(null);
    if (!subscriptionForm.packageId) {
      setFormError(isAr ? 'الرجاء اختيار الباقة' : 'Please choose a package');
      return;
    }
    setFormBusy(true);
    try {
      await api.addManualSubscription(subscriptionTarget.id, {
        packageId: subscriptionForm.packageId,
        durationMonths: subscriptionForm.durationMonths,
        amount: subscriptionForm.amount,
        paymentMethod: subscriptionForm.paymentMethod,
        referenceNumber: subscriptionForm.referenceNumber.trim(),
        notes: subscriptionForm.notes.trim()
      });
      setSubscriptionTarget(null);
      setNotice({
        tone: 'success',
        text: isAr
          ? `تم تسجيل اشتراك ${subscriptionForm.durationMonths} شهرًا لـ ${tenantName(subscriptionTarget)}`
          : `A ${subscriptionForm.durationMonths}-month subscription was recorded for ${tenantName(subscriptionTarget)}`
      });
      refreshOrganizations();
    } catch (err) {
      setFormError(toApiMessage(err, isAr ? 'تعذر تسجيل الاشتراك' : 'Could not record the subscription'));
    } finally {
      setFormBusy(false);
    }
  };

  const openPayment = (record: TenantRecord) => {
    setPaymentForm({ amount: 0, referenceNumber: '', notes: '' });
    setPaymentTarget(record);
    setFormError(null);
  };

  const submitPayment = async () => {
    if (!paymentTarget) return;
    setFormError(null);
    if (!(paymentForm.amount > 0)) {
      setFormError(isAr ? 'الرجاء إدخال مبلغ أكبر من صفر' : 'Please enter an amount greater than zero');
      return;
    }
    setFormBusy(true);
    try {
      await api.confirmTenantPayment(paymentTarget.id, paymentForm.amount, paymentForm.referenceNumber.trim(), paymentForm.notes.trim());
      setPaymentTarget(null);
      setNotice({ tone: 'success', text: isAr ? 'تم تأكيد الدفعة وتسجيلها' : 'Payment confirmed and recorded' });
      refreshOrganizations();
    } catch (err) {
      setFormError(toApiMessage(err, isAr ? 'تعذر تأكيد الدفعة' : 'Could not confirm the payment'));
    } finally {
      setFormBusy(false);
    }
  };

  const submitDeleteTenant = async () => {
    if (!deleteTarget) return;
    setFormError(null);
    setFormBusy(true);
    try {
      await api.deleteTenant(deleteTarget.id);
      setDeleteTarget(null);
      setNotice({
        tone: 'success',
        text: isAr ? `تم حذف ${tenantName(deleteTarget)} نهائيًا` : `${tenantName(deleteTarget)} was permanently deleted`
      });
      refreshOrganizations();
    } catch (err) {
      setFormError(toApiMessage(err, isAr ? 'تعذر حذف المؤسسة' : 'Could not delete the organization'));
    } finally {
      setFormBusy(false);
    }
  };

  /* ── Package actions ──────────────────────────────────────────────────── */

  const openCreatePackage = () => {
    setPackageForm({
      id: '',
      nameAr: '',
      nameEn: '',
      tierLevel: 1,
      monthlyPriceSar: 0,
      annualPriceSar: 0,
      maxBranches: 0,
      maxMembers: 0,
      monthlyRecordLimit: 0,
      capabilities: []
    });
    setPackageModal({ mode: 'create' });
    setFormError(null);
  };

  const openEditPackage = (record: PackageRecord) => {
    setPackageForm({
      id: record.id,
      nameAr: record.name_ar ?? '',
      nameEn: record.name_en ?? '',
      tierLevel: toCount(record.tier_level) || 1,
      monthlyPriceSar: toCount(record.monthly_price_sar),
      annualPriceSar: toCount(record.annual_price_sar),
      maxBranches: toCount(record.max_branches),
      maxMembers: toCount(record.max_members),
      monthlyRecordLimit: toCount(record.monthly_record_limit),
      capabilities: Array.isArray(record.capabilities) ? record.capabilities : []
    });
    setPackageModal({ mode: 'edit', record });
    setFormError(null);
  };

  const submitPackage = async () => {
    if (!packageModal) return;
    setFormError(null);
    if (!packageModal.mode) return;
    if (packageModal.mode === 'create' && !packageForm.id.trim()) {
      setFormError(isAr ? 'الرجاء إدخال معرّف فريد للباقة' : 'Please provide a unique package identifier');
      return;
    }
    if (!packageForm.nameEn.trim() && !packageForm.nameAr.trim()) {
      setFormError(isAr ? 'الرجاء إدخال اسم الباقة' : 'Please provide a package name');
      return;
    }
    setFormBusy(true);
    try {
      const payload = {
        nameAr: packageForm.nameAr.trim(),
        nameEn: packageForm.nameEn.trim(),
        tierLevel: packageForm.tierLevel,
        monthlyPriceSar: packageForm.monthlyPriceSar,
        annualPriceSar: packageForm.annualPriceSar,
        maxBranches: packageForm.maxBranches,
        maxMembers: packageForm.maxMembers,
        monthlyRecordLimit: packageForm.monthlyRecordLimit,
        capabilities: packageForm.capabilities
      };
      if (packageModal.mode === 'create') {
        await api.createPackage({ id: slugify(packageForm.id.trim()), ...payload });
        setNotice({ tone: 'success', text: isAr ? 'تم إنشاء الباقة' : 'Package created' });
      } else {
        await api.updatePackage(packageModal.record.id, payload);
        setNotice({ tone: 'success', text: isAr ? 'تم تحديث الباقة' : 'Package updated' });
      }
      setPackageModal(null);
      refreshPackages();
    } catch (err) {
      setFormError(toApiMessage(err, isAr ? 'تعذر حفظ الباقة' : 'Could not save the package'));
    } finally {
      setFormBusy(false);
    }
  };

  const submitDeletePackage = async () => {
    if (!deletePackageTarget) return;
    setFormError(null);
    setFormBusy(true);
    try {
      await api.deletePackage(deletePackageTarget.id);
      setDeletePackageTarget(null);
      setNotice({ tone: 'success', text: isAr ? 'تم حذف الباقة' : 'Package deleted' });
      refreshPackages();
    } catch (err) {
      setFormError(toApiMessage(err, isAr ? 'تعذر حذف الباقة' : 'Could not delete the package'));
    } finally {
      setFormBusy(false);
    }
  };

  /* ── Platform user actions ────────────────────────────────────────────── */

  const openCreateUser = () => {
    setUserForm({ email: '', password: '', nameAr: '', nameEn: '', isPlatformAdmin: false, status: 'active' });
    setUserModal({ mode: 'create' });
    setFormError(null);
  };

  const openEditUser = (record: PlatformUserRecord) => {
    setUserForm({
      email: record.email,
      password: '',
      nameAr: record.name_ar ?? '',
      nameEn: record.name_en ?? '',
      isPlatformAdmin: !!record.is_platform_admin,
      status: record.status ?? 'active'
    });
    setUserModal({ mode: 'edit', record });
    setFormError(null);
  };

  const submitUser = async () => {
    if (!userModal) return;
    setFormError(null);
    if (userModal.mode === 'create') {
      if (!userForm.email.trim() || !userForm.password) {
        setFormError(isAr ? 'الرجاء إدخال البريد وكلمة المرور' : 'Please provide an email and a password');
        return;
      }
      setFormBusy(true);
      try {
        await api.createPlatformUser({
          email: userForm.email.trim(),
          password: userForm.password,
          nameAr: userForm.nameAr.trim(),
          nameEn: userForm.nameEn.trim(),
          isPlatformAdmin: userForm.isPlatformAdmin
        });
        setUserModal(null);
        setNotice({ tone: 'success', text: isAr ? 'تم إنشاء المستخدم' : 'Platform user created' });
        usersRes.reload();
        overview.reload();
      } catch (err) {
        setFormError(toApiMessage(err, isAr ? 'تعذر إنشاء المستخدم' : 'Could not create the user'));
      } finally {
        setFormBusy(false);
      }
      return;
    }
    setFormBusy(true);
    try {
      await api.updatePlatformUser(userModal.record.id, {
        nameAr: userForm.nameAr.trim(),
        nameEn: userForm.nameEn.trim(),
        status: userForm.status,
        isPlatformAdmin: userForm.isPlatformAdmin,
        ...(userForm.password ? { newPassword: userForm.password } : {})
      });
      setUserModal(null);
      setNotice({ tone: 'success', text: isAr ? 'تم تحديث المستخدم' : 'Platform user updated' });
      usersRes.reload();
    } catch (err) {
      setFormError(toApiMessage(err, isAr ? 'تعذر تحديث المستخدم' : 'Could not update the user'));
    } finally {
      setFormBusy(false);
    }
  };

  const submitDeleteUser = async () => {
    if (!deleteUserTarget) return;
    setFormError(null);
    setFormBusy(true);
    try {
      await api.deletePlatformUser(deleteUserTarget.id);
      setDeleteUserTarget(null);
      setNotice({ tone: 'success', text: isAr ? 'تم حذف المستخدم' : 'Platform user deleted' });
      usersRes.reload();
      overview.reload();
    } catch (err) {
      setFormError(toApiMessage(err, isAr ? 'تعذر حذف المستخدم' : 'Could not delete the user'));
    } finally {
      setFormBusy(false);
    }
  };

  /* ── Inquiry (lead) actions ───────────────────────────────────────────── */

  const changeLeadStatus = async (record: LeadRecord, status: string) => {
    setBusyLeadId(record.id);
    setNotice(null);
    try {
      await api.updateLeadStatus(record.id, status);
      setNotice({
        tone: 'success',
        text: isAr
          ? `تم تحديث حالة الطلب إلى «${leadStatusLabel(status, isAr)}»`
          : `Inquiry status changed to «${leadStatusLabel(status, isAr)}»`
      });
      leadsRes.reload();
      overview.reload();
    } catch (err) {
      setNotice({
        tone: 'danger',
        text: toApiMessage(err, isAr ? 'تعذر تحديث حالة الطلب' : 'Could not change the inquiry status')
      });
    } finally {
      setBusyLeadId(null);
    }
  };

  /* ── License actions ──────────────────────────────────────────────────── */

  const toggleLicenseCapability = (capabilityId: string, next: boolean) => {
    setLicenseForm((prev) => ({
      ...prev,
      capabilities: next
        ? Array.from(new Set([...prev.capabilities, capabilityId]))
        : prev.capabilities.filter((c) => c !== capabilityId)
    }));
  };

  const togglePackageCapability = (capabilityId: string, next: boolean) => {
    setPackageForm((prev) => ({
      ...prev,
      capabilities: next
        ? Array.from(new Set([...prev.capabilities, capabilityId]))
        : prev.capabilities.filter((c) => c !== capabilityId)
    }));
  };

  const submitIssueLicense = async () => {
    setFormError(null);
    if (!licenseForm.customerName.trim() || !licenseForm.customerSlug.trim()) {
      setFormError(isAr ? 'الرجاء إدخال اسم العميل ومعرّفه' : 'Please provide the customer name and slug');
      return;
    }
    setFormBusy(true);
    try {
      const result = await api.issueOfflineLicense({
        customerSlug: slugify(licenseForm.customerSlug.trim()),
        customerName: licenseForm.customerName.trim(),
        ...(licenseForm.tier ? { tier: licenseForm.tier } : {}),
        maxMembers: licenseForm.maxMembers,
        licensedCapabilities: licenseForm.capabilities
      });
      setIssuedLicense(result.license ?? result);
      setNotice({ tone: 'success', text: isAr ? 'تم إصدار الترخيص بنجاح' : 'License issued successfully' });
    } catch (err) {
      setFormError(toApiMessage(err, isAr ? 'تعذر إصدار الترخيص' : 'Could not issue the license'));
    } finally {
      setFormBusy(false);
    }
  };

  const submitVerifyLicense = async () => {
    setFormError(null);
    setVerifyResult(null);
    setFormBusy(true);
    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(verifyInput);
      } catch {
        setFormError(isAr ? 'النص غير صالح — الصق كائن ترخيص صحيح' : 'Invalid text — paste a valid license object');
        setFormBusy(false);
        return;
      }
      const res = await api.verifyOfflineLicense(parsed);
      setVerifyResult(
        res.valid
          ? { ok: true, message: isAr ? 'الترخيص صالح ومطابق للمنصة' : 'License is valid and platform-authentic' }
          : { ok: false, message: res.error || (isAr ? 'الترخيص غير صالح' : 'License is not valid') }
      );
    } catch (err) {
      setVerifyResult({ ok: false, message: toApiMessage(err, isAr ? 'تعذر التحقق من الترخيص' : 'Could not verify the license') });
    } finally {
      setFormBusy(false);
    }
  };

  const downloadLicense = () => {
    if (issuedLicense === null) return;
    let text: string;
    try {
      text = JSON.stringify(issuedLicense, null, 2);
    } catch {
      text = String(issuedLicense);
    }
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `license-${(licenseForm.customerSlug || 'customer').trim()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copyLicense = async () => {
    if (issuedLicense === null) return;
    try {
      const text = typeof issuedLicense === 'string' ? issuedLicense : JSON.stringify(issuedLicense);
      await navigator.clipboard.writeText(text);
      setNotice({ tone: 'success', text: isAr ? 'تم نسخ الترخيص' : 'License copied to clipboard' });
    } catch {
      setNotice({
        tone: 'danger',
        text: isAr ? 'تعذر النسخ — استخدم زر التحميل' : 'Copying failed — use the download button instead'
      });
    }
  };

  /* ── Authorization: defense-in-depth in front of the privileged API ───── */

  const isOwner =
    !!user && (user.isPlatformAdmin === true || user.email === 'saad@mikhlafi-labs.com' || user.email === 'owner@mikhlafi-labs.com');

  if (!isOwner) {
    return (
      <div className="admin-forbidden">
        <SectionEmpty
          icon={<IconShield size={58} />}
          title={isAr ? 'هذا القسم مخصّص لمسؤولي المنصة' : 'This area is restricted to platform operators'}
          description={
            isAr
              ? 'لوحة إدارة المنصة تُدار عبر واجهة مخصّصة منفصلة تمامًا عن مساحات عمل العملاء. سجّل الدخول بحساب مسؤول المنصة للمتابعة.'
              : 'The platform administration console is delivered through a dedicated surface, fully separated from customer workspaces. Sign in with a platform operator account to continue.'
          }
          action={
            <button type="button" className="ml-btn ml-btn--subtle" onClick={() => onNavigate(ROUTES.PUBLIC.HOME)}>
              <IconArrowRight size={15} />
              {isAr ? 'العودة إلى الموقع العام' : 'Return to the public website'}
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="admin-stack">
      {/* Notice */}
      {notice && (
        <div
          className={`admin-notice ${notice.tone === 'danger' ? 'admin-notice--danger' : 'admin-notice--success'}`}
          role={notice.tone === 'danger' ? 'alert' : 'status'}
        >
          <span className="admin-notice__icon">
            {notice.tone === 'danger' ? <IconAlert size={17} /> : <IconCheckCircle size={17} />}
          </span>
          <div className="admin-notice__body">{notice.text}</div>
          <button
            type="button"
            className="admin-notice__close"
            onClick={() => setNotice(null)}
            aria-label={isAr ? 'إخفاء التنبيه' : 'Dismiss notification'}
            title={isAr ? 'إخفاء' : 'Dismiss'}
          >
            <IconX size={14} />
          </button>
        </div>
      )}
      {/* Page header — copy follows the active section */}
      <header className="admin-header">
        <div className="admin-header__main">
          <div className="admin-header__eyebrow">
            <IconShield size={12} />
            {isAr ? 'إدارة المنصة' : 'Platform administration'}
          </div>
          <h1 className="admin-header__title">
            {activeTab === 'overview' && (isAr ? 'حالة المنصة' : 'Platform status')}
            {activeTab === 'organizations' && (isAr ? 'المؤسسات والمستأجرون' : 'Organizations & tenants')}
            {activeTab === 'packages' && (isAr ? 'الباقات والقدرات' : 'Packages & capabilities')}
            {activeTab === 'services' && (isAr ? 'إدارة الخدمات' : 'Service catalog')}
            {activeTab === 'licenses' && (isAr ? 'إصدار التراخيص' : 'License issuance')}
            {activeTab === 'users' && (isAr ? 'دليل المستخدمين' : 'User directory')}
            {activeTab === 'leads' && (isAr ? 'طلبات التواصل' : 'Inbound inquiries')}
            {activeTab === 'audit' && (isAr ? 'سجل التدقيق' : 'Audit log')}
          </h1>
          <p className="admin-header__desc">
            {activeTab === 'overview' &&
              (isAr
                ? 'مؤشرات تشغيلية مجمّعة من واجهة الإدارة المركزية، تُحدَّث مباشرة من قاعدة بيانات المنصة دون أي بيانات عرض تجريبية.'
                : 'Operational indicators aggregated straight from the administration API and refreshed directly from the platform database — no demo or preview data anywhere in this console.')}
            {activeTab === 'organizations' &&
              (isAr
                ? 'كل مؤسسة مسجّلة في المنصة: إنشاء، تعديل، تعليق، اشتراكات يدوية، وتأكيد الدفعات. كل إجراء هنا يُكتب في سجل التدقيق.'
                : 'Every tenant registered on the platform: create, edit, suspend, record manual subscriptions, and confirm payments. Each action is written to the audit log.')}
            {activeTab === 'packages' &&
              (isAr
                ? 'الباقات التجارية وحدودها وقدراتها، وهي المصدر الذي تُحتسب منه صلاحيات كل مؤسسة.'
                : 'Commercial packages with their limits and capabilities — the source from which every organization derives its permissions.')}
            {activeTab === 'services' &&
              (isAr
                ? 'الكتالوج الرسمي لمحركات التحليل الثمانية. كل تعديل هنا — الاسم، الوصف، الترتيب، أو التعطيل — يُحفظ في قاعدة بيانات المنصة وينتقل مباشرةً إلى الموقع العام.'
                : 'The canonical catalog of the eight intelligence engines. Every change here — name, summary, ordering, or disabling — is persisted in the platform database and flows straight through to the public website.')}
            {activeTab === 'licenses' &&
              (isAr
                ? 'إصدار تراخيص نسخة خاصة تعمل دون اتصال، والتحقق من صحتها عند إعادتها إلى المنصة.'
                : 'Issue offline licenses for private-edition installations, and verify them when they return to the platform.')}
            {activeTab === 'users' &&
              (isAr
                ? 'حسابات منصة الإدارة العليا — منفصلة تمامًا عن مستخدمي المؤسسات وصلاحياتهم داخل مساحات العمل.'
                : 'Platform-level administration accounts — entirely separate from each organization\'s users and their workspace permissions.')}
            {activeTab === 'leads' &&
              (isAr
                ? 'طلبات التواصل الواردة من الموقع العام، مع تحديث حالة كل طلب ومتابعته حتى التحويل.'
                : 'Inbound inquiries from the public website, with a tracked status for each one through conversion.')}
            {activeTab === 'audit' &&
              (isAr
                ? 'السجل غير القابل للتعديل لكل إجراء تم داخل واجهة الإدارة: من نفّذه، على أي هدف، ومتى بالضبط.'
                : 'The immutable record of every action performed in this console: who performed it, against which target, and exactly when.')}
          </p>
        </div>
        <div className="admin-header__actions">
          <button type="button" className="ml-btn ml-btn--subtle" onClick={refreshActive} disabled={overview.loading}>
            <IconRefresh size={15} />
            {isAr ? 'تحديث' : 'Refresh'}
          </button>
          <button type="button" className="ml-btn ml-btn--accent" onClick={openCreateTenant}>
            <IconPlus size={15} />
            {isAr ? 'مؤسسة جديدة' : 'New organization'}
          </button>
        </div>
      </header>

      {/* Section switcher */}
      <nav className="admin-tabs" aria-label={isAr ? 'أقسام إدارة المنصة' : 'Administration sections'}>
        {[
          { key: 'overview', route: ROUTES.ADMIN.OVERVIEW, icon: <IconDashboard size={15} />, ar: 'الحالة', en: 'Status', count: null },
          {
            key: 'organizations',
            route: ROUTES.ADMIN.ORGANIZATIONS,
            icon: <IconOrganization size={15} />,
            ar: 'المؤسسات',
            en: 'Organizations',
            count: tenantsRes.data ? tenantsRes.data.length : null
          },
          {
            key: 'packages',
            route: ROUTES.ADMIN.PACKAGES,
            icon: <IconCreditCard size={15} />,
            ar: 'الباقات',
            en: 'Packages',
            count: packagesRes.data ? packagesRes.data.length : null
          },
          {
            key: 'services',
            route: ROUTES.ADMIN.SERVICES,
            icon: <IconLayers size={15} />,
            ar: 'الخدمات',
            en: 'Services',
            count: servicesRes.data ? servicesRes.data.length : null
          },
          { key: 'licenses', route: ROUTES.ADMIN.LICENSES, icon: <IconLock size={15} />, ar: 'التراخيص', en: 'Licenses', count: null },
          {
            key: 'users',
            route: ROUTES.ADMIN.USERS,
            icon: <IconCustomer size={15} />,
            ar: 'المستخدمون',
            en: 'Users',
            count: usersRes.data ? usersRes.data.length : null
          },
          {
            key: 'leads',
            route: ROUTES.ADMIN.LEADS,
            icon: <IconFileText size={15} />,
            ar: 'الطلبات',
            en: 'Inquiries',
            count: leadsRes.data ? leadsRes.data.length : null
          },
          {
            key: 'audit',
            route: ROUTES.ADMIN.AUDIT,
            icon: <IconServer size={15} />,
            ar: 'التدقيق',
            en: 'Audit',
            count: auditRes.data ? auditRes.data.length : null
          }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-tab ${activeTab === tab.key ? 'is-active' : ''}`}
            aria-current={activeTab === tab.key ? 'page' : undefined}
            onClick={() => onNavigate(tab.route)}
          >
            <span className="admin-tab__icon">{tab.icon}</span>
            {isAr ? tab.ar : tab.en}
            {tab.count !== null && <span className="admin-tab__count">{fmtNumber(tab.count)}</span>}
          </button>
        ))}
      </nav>

      {/* ── Section 1: Platform status ─────────────────────────────────── */}
      {activeTab === 'overview' && (
        <>
          <div className="admin-stack" style={{ gap: 0 }}>
            {overview.loading ? (
              <MetricsSkeleton label={isAr ? 'جارٍ تحميل مؤشرات المنصة' : 'Loading platform metrics'} />
            ) : overview.error ? (
              <SectionError locale={locale} message={overview.error} onRetry={overview.reload} />
            ) : overview.data ? (
              <div className="admin-metrics">
                <MetricTile
                  label={isAr ? 'المؤسسات' : 'Organizations'}
                  value={fmtNumber(overview.data.organizations.total)}
                  hint={
                    isAr
                      ? `${fmtNumber(overview.data.organizations.active)} نشطة · ${fmtNumber(overview.data.organizations.suspended)} معلّقة`
                      : `${fmtNumber(overview.data.organizations.active)} active · ${fmtNumber(overview.data.organizations.suspended)} suspended`
                  }
                />
                <MetricTile
                  label={isAr ? 'حسابات المنصة' : 'Platform accounts'}
                  value={fmtNumber(overview.data.users.total)}
                  hint={isAr ? 'بما في ذلك مديرو المنصة' : 'Including platform administrators'}
                />
                <MetricTile
                  label={isAr ? 'الاشتراكات السارية' : 'Active subscriptions'}
                  value={fmtNumber(
                    (overview.data.subscriptions ?? []).reduce<number>((sum, item) => sum + toCount(item.count), 0)
                  )}
                  hint={isAr ? 'موزّعة على الباقات الحالية' : 'Distributed across current packages'}
                />
                <MetricTile
                  label={isAr ? 'طلبات التواصل' : 'Inbound inquiries'}
                  value={fmtNumber(overview.data.leads.total)}
                  hint={isAr
                    ? `${fmtNumber(overview.data.leads.new)} بانتظار المتابعة`
                    : `${fmtNumber(overview.data.leads.new)} awaiting follow-up`}
                />
                <MetricTile
                  label={isAr ? 'إشارات قيد المراجعة' : 'Signals under review'}
                  value={fmtNumber(overview.data.financialIntelligence.totalCases)}
                  hint={
                    isAr
                      ? `إجمالي القيمة المعلّمة ${money(overview.data.financialIntelligence.totalFlaggedSAR)} ر.س`
                      : `Flagged value ${money(overview.data.financialIntelligence.totalFlaggedSAR)} SAR`
                  }
                />
                <MetricTile
                  label={isAr ? 'حالة النظام' : 'System status'}
                  value={overview.data.platformStatus || '—'}
                  textValue
                  hint={isAr ? 'مصدر الحالة: خدمة إدارة المنصة' : 'Reported by the administration service'}
                />
              </div>
            ) : (
              <SectionEmpty
                icon={<IconDashboard size={44} />}
                compact
                title={isAr ? 'لا توجد مؤشرات متاحة' : 'No indicators available'}
                description={isAr ? 'أعد المحاولة لجلب الحالة' : 'Retry to fetch the current status'}
              />
            )}
          </div>

          <div className="admin-split">
            <section className="admin-panel">
              <div className="admin-panel__head">
                <div>
                  <div className="admin-panel__title">{isAr ? 'إجراءات سريعة' : 'Quick actions'}</div>
                  <div className="admin-panel__sub">
                    {isAr ? 'الإجراءات الأكثر استخدامًا في إدارة المنصة' : 'The most-used administration tasks'}
                  </div>
                </div>
              </div>
              <div className="admin-panel__body">
                <div className="admin-quick">
                  <button type="button" className="ml-btn ml-btn--subtle" onClick={openCreateTenant}>
                    <IconPlus size={15} />
                    {isAr ? 'إنشاء مؤسسة' : 'Create organization'}
                  </button>
                  <button type="button" className="ml-btn ml-btn--subtle" onClick={() => onNavigate(ROUTES.ADMIN.PACKAGES)}>
                    <IconCreditCard size={15} />
                    {isAr ? 'إدارة الباقات' : 'Manage packages'}
                  </button>
                  <button type="button" className="ml-btn ml-btn--subtle" onClick={() => onNavigate(ROUTES.ADMIN.LICENSES)}>
                    <IconLock size={15} />
                    {isAr ? 'إصدار ترخيص' : 'Issue a license'}
                  </button>
                  <button type="button" className="ml-btn ml-btn--subtle" onClick={() => onNavigate(ROUTES.ADMIN.LEADS)}>
                    <IconFileText size={15} />
                    {isAr ? 'مراجعة الطلبات' : 'Review inquiries'}
                  </button>
                  <button type="button" className="ml-btn ml-btn--subtle" onClick={() => onNavigate(ROUTES.ADMIN.AUDIT)}>
                    <IconServer size={15} />
                    {isAr ? 'سجل التدقيق' : 'Audit log'}
                  </button>
                </div>
              </div>
            </section>

            <section className="admin-panel">
              <div className="admin-panel__head">
                <div>
                  <div className="admin-panel__title">{isAr ? 'آخر الأحداث المسجّلة' : 'Most recent recorded events'}</div>
                  <div className="admin-panel__sub">
                    {isAr ? 'آخر خمس عمليات من سجل التدقيق غير القابل للتعديل' : 'The five most recent entries from the immutable audit log'}
                  </div>
                </div>
                <div className="admin-panel__actions">
                  <button
                    type="button"
                    className="ml-btn ml-btn--subtle ml-btn--sm"
                    onClick={auditRes.reload}
                    disabled={auditRes.loading}
                  >
                    <IconRefresh size={13} />
                    {isAr ? 'تحديث' : 'Refresh'}
                  </button>
                </div>
              </div>
              <div className="admin-panel__body admin-panel__body--flush">
                {auditRes.loading ? (
                  <TableSkeleton label={isAr ? 'جارٍ تحميل الأحداث' : 'Loading events'} rows={4} />
                ) : auditRes.error ? (
                  <SectionError locale={locale} message={auditRes.error} onRetry={auditRes.reload} />
                ) : auditRes.data && auditRes.data.length > 0 ? (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>{isAr ? 'الحدث' : 'Event'}</th>
                          <th>{isAr ? 'المنفّذ' : 'Operator'}</th>
                          <th>{isAr ? 'التاريخ' : 'Date'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditRes.data.slice(0, 5).map((log) => (
                          <tr key={log.id}>
                            <td>
                              <span className="admin-action-code">{log.action || '—'}</span>
                            </td>
                            <td className="cell-mono">{log.operator_email || '—'}</td>
                            <td className="cell-mono">{fmtDate(log.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <SectionEmpty
                    icon={<IconActivity size={40} />}
                    compact
                    title={isAr ? 'لا توجد أحداث بعد' : 'No events recorded yet'}
                    description={
                      isAr
                        ? 'سيظهر هنا كل إجراء تُنفّذه في واجهة الإدارة'
                        : 'Every action performed in this console will appear here'
                    }
                  />
                )}
              </div>
            </section>
          </div>
        </>
      )}

      {/* ── Section 2: Organizations & tenants ─────────────────────────── */}
      {activeTab === 'organizations' && (
        <section className="admin-panel">
          <div className="admin-panel__head">
            <div>
              <div className="admin-panel__title">{isAr ? 'سجل المؤسسات' : 'Organization registry'}</div>
              <div className="admin-panel__sub">
                {tenantsRes.data
                  ? isAr
                    ? `${fmtNumber(tenantsRes.data.length)} مؤسسة مسجّلة`
                    : `${fmtNumber(tenantsRes.data.length)} registered organizations`
                  : isAr
                    ? 'جارٍ الجلب من خدمة الإدارة'
                    : 'Fetching from the administration service'}
              </div>
            </div>
            <div className="admin-panel__actions">
              <span className="admin-search">
                <span className="admin-search__icon">
                  <IconSearch size={15} />
                </span>
                <input
                  type="search"
                  className="ml-input"
                  value={tenantSearch}
                  onChange={(e) => setTenantSearch(e.target.value)}
                  placeholder={isAr ? 'بحث بالاسم أو المعرّف' : 'Search by name or slug'}
                  aria-label={isAr ? 'بحث في المؤسسات' : 'Search organizations'}
                />
              </span>
              <button type="button" className="ml-btn ml-btn--subtle" onClick={refreshOrganizations} disabled={tenantsRes.loading}>
                <IconRefresh size={15} />
                {isAr ? 'تحديث' : 'Refresh'}
              </button>
              <button type="button" className="ml-btn ml-btn--accent" onClick={openCreateTenant}>
                <IconPlus size={15} />
                {isAr ? 'مؤسسة جديدة' : 'New organization'}
              </button>
            </div>
          </div>

          <div className="admin-panel__body admin-panel__body--flush">
            {tenantsRes.loading ? (
              <TableSkeleton label={isAr ? 'جارٍ تحميل المؤسسات' : 'Loading organizations'} rows={6} />
            ) : tenantsRes.error ? (
              <SectionError locale={locale} message={tenantsRes.error} onRetry={tenantsRes.reload} />
            ) : tenantsRes.data && tenantsRes.data.length > 0 ? (
              (() => {
                const needle = tenantSearch.trim().toLowerCase();
                const rows = needle
                  ? tenantsRes.data.filter((t) =>
                      [t.name_ar, t.name_en, t.slug, t.id].some((field) => (field ?? '').toLowerCase().includes(needle))
                    )
                  : tenantsRes.data;
                if (rows.length === 0) {
                  return (
                    <SectionEmpty
                      icon={<IconSearch size={40} />}
                      compact
                      title={isAr ? 'لا توجد نتائج مطابقة' : 'No matching organizations'}
                      description={
                        isAr ? 'جرّب مصطلح بحث آخر أو امسح البحث' : 'Try a different search term, or clear the search'
                      }
                    />
                  );
                }
                return (
                  <div className="admin-table-wrap">
                    <table className="admin-table admin-table--wide">
                      <thead>
                        <tr>
                          <th>{isAr ? 'المؤسسة' : 'Organization'}</th>
                          <th>{isAr ? 'الحالة' : 'Status'}</th>
                          <th>{isAr ? 'الباقة' : 'Package'}</th>
                          <th>{isAr ? 'الحجم' : 'Footprint'}</th>
                          <th>{isAr ? 'أنشئت في' : 'Created'}</th>
                          <th className="admin-th-end">{isAr ? 'إجراءات' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((t) => (
                          <tr key={t.id}>
                            <td>
                              <div className="admin-cell-stack">
                                <span className="cell-primary">{t.name_ar || t.name_en || '—'}</span>
                                {t.name_ar && t.name_en && <span className="admin-cell-sub">{t.name_en}</span>}
                                <span className="cell-mono admin-cell-sub">{t.slug || t.id}</span>
                              </div>
                            </td>
                            <td>
                              <span className={tenantStatusClass(t.status)}>{tenantStatusLabel(t.status, isAr)}</span>
                              {t.subscription_status && (
                                <div className="admin-cell-sub" style={{ marginTop: 5 }}>
                                  {t.subscription_status === 'active'
                                    ? isAr ? 'اشتراك ساري' : 'Subscription active'
                                    : t.subscription_status === 'trial'
                                      ? isAr ? 'فترة تجريبية' : 'Trial period'
                                      : t.subscription_status === 'overdue'
                                        ? isAr ? 'متأخر السداد' : 'Payment overdue'
                                        : t.subscription_status}
                                </div>
                              )}
                            </td>
                            <td>
                              <div className="admin-cell-stack">
                                <span>{t.package_name_ar || t.package_name_en || (isAr ? 'بلا باقة' : 'No package')}</span>
                                {t.current_period_end && (
                                  <span className="admin-cell-sub">
                                    {isAr ? 'حتى' : 'until'} {fmtDate(t.current_period_end)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="cell-mono">
                              {isAr
                                ? `${fmtNumber(t.member_count)} عضو · ${fmtNumber(t.branch_count)} فرع`
                                : `${fmtNumber(t.member_count)} members · ${fmtNumber(t.branch_count)} branches`}
                            </td>
                            <td className="cell-mono">{fmtDate(t.created_at)}</td>
                            <td>
                              <div className="admin-row-actions">
                                <button
                                  type="button"
                                  className="ml-btn ml-btn--subtle"
                                  onClick={() => openEditTenant(t)}
                                  disabled={busyTenantId === t.id}
                                >
                                  {isAr ? 'تعديل' : 'Edit'}
                                </button>
                                <button
                                  type="button"
                                  className="ml-btn ml-btn--subtle"
                                  onClick={() => openStatusTenant(t)}
                                  disabled={busyTenantId === t.id}
                                >
                                  {isAr ? 'الحالة' : 'Status'}
                                </button>
                                <button
                                  type="button"
                                  className="ml-btn ml-btn--subtle"
                                  onClick={() => openSubscription(t)}
                                  disabled={busyTenantId === t.id}
                                >
                                  {isAr ? 'اشتراك' : 'Subscription'}
                                </button>
                                <button
                                  type="button"
                                  className="ml-btn ml-btn--subtle"
                                  onClick={() => openPayment(t)}
                                  disabled={busyTenantId === t.id}
                                >
                                  {isAr ? 'تأكيد دفعة' : 'Confirm payment'}
                                </button>
                                <button
                                  type="button"
                                  className="ml-btn admin-btn--danger"
                                  onClick={() => {
                                    setDeleteTarget(t);
                                    setFormError(null);
                                  }}
                                  disabled={busyTenantId === t.id}
                                >
                                  {isAr ? 'حذف' : 'Delete'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()
            ) : (
              <SectionEmpty
                icon={<IconOrganization size={46} />}
                title={isAr ? 'لا توجد مؤسسات مسجّلة بعد' : 'No organizations registered yet'}
                description={
                  isAr
                    ? 'أنشئ أول مؤسسة لمنحها مساحة عمل مستقلة وحساب مدير مخصّص.'
                    : 'Create the first organization to grant it an isolated workspace and a dedicated administrator account.'
                }
                action={
                  <button type="button" className="ml-btn ml-btn--accent" onClick={openCreateTenant}>
                    <IconPlus size={15} />
                    {isAr ? 'إنشاء مؤسسة' : 'Create organization'}
                  </button>
                }
              />
            )}
          </div>
        </section>
      )}
      {/* ── Section 3: Packages & capabilities ─────────────────────────── */}
      {activeTab === 'packages' && (
        <section className="admin-panel">
          <div className="admin-panel__head">
            <div>
              <div className="admin-panel__title">{isAr ? 'الباقات التجارية' : 'Commercial packages'}</div>
              <div className="admin-panel__sub">
                {packagesRes.data
                  ? isAr
                    ? `${fmtNumber(packagesRes.data.length)} باقة معرّفة · تُطبَّق الحدود على مستوى المؤسسة`
                    : `${fmtNumber(packagesRes.data.length)} defined packages · limits apply per organization`
                  : isAr
                    ? 'جارٍ جلب الباقات من المنصة'
                    : 'Fetching packages from the platform'}
              </div>
            </div>
            <div className="admin-panel__actions">
              <button type="button" className="ml-btn ml-btn--subtle" onClick={refreshPackages} disabled={packagesRes.loading}>
                <IconRefresh size={15} />
                {isAr ? 'تحديث' : 'Refresh'}
              </button>
              <button type="button" className="ml-btn ml-btn--accent" onClick={openCreatePackage}>
                <IconPlus size={15} />
                {isAr ? 'باقة جديدة' : 'New package'}
              </button>
            </div>
          </div>

          <div className="admin-panel__body">
            {packagesRes.loading ? (
              <div className="admin-pkg-grid" role="status" aria-live="polite">
                <span className="ml-sr-only">{isAr ? 'جارٍ تحميل الباقات' : 'Loading packages'}</span>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div className="admin-pkg-card" key={index} aria-hidden="true">
                    <span className="admin-skel admin-skel--text" style={{ width: '55%' }} />
                    <span className="admin-skel" style={{ height: 74 }} />
                    <span className="admin-skel admin-skel--text" style={{ width: '80%' }} />
                    <span className="admin-skel admin-skel--text" style={{ width: '70%' }} />
                    <span className="admin-skel admin-skel--text" style={{ width: '60%' }} />
                  </div>
                ))}
              </div>
            ) : packagesRes.error ? (
              <SectionError locale={locale} message={packagesRes.error} onRetry={packagesRes.reload} />
            ) : packagesRes.data && packagesRes.data.length > 0 ? (
              <div className="admin-pkg-grid">
                {packagesRes.data.map((pkg) => {
                  const caps = Array.isArray(pkg.capabilities) ? pkg.capabilities : [];
                  return (
                    <article className="admin-pkg-card" key={pkg.id}>
                      <div className="admin-pkg-card__head">
                        <div>
                          <div className="admin-pkg-card__name">{pkg.name_ar || pkg.name_en || pkg.id}</div>
                          <div className="admin-pkg-card__sub">
                            {pkg.id} · {isAr ? 'المستوى' : 'Tier'} {toCount(pkg.tier_level)}
                          </div>
                        </div>
                        <span className={`status-pill ${pkg.is_active === false ? 'inactive' : 'active'}`}>
                          {pkg.is_active === false ? (isAr ? 'موقوفة' : 'Inactive') : isAr ? 'نشطة' : 'Active'}
                        </span>
                      </div>

                      <div className="admin-pkg-prices">
                        <div>
                          <div className="admin-pkg-price__label">{isAr ? 'شهريًا' : 'Monthly'}</div>
                          <div className="admin-pkg-price__value">{money(pkg.monthly_price_sar)}</div>
                        </div>
                        <div>
                          <div className="admin-pkg-price__label">{isAr ? 'سنويًا' : 'Annually'}</div>
                          <div className="admin-pkg-price__value">{money(pkg.annual_price_sar)}</div>
                        </div>
                      </div>

                      <div className="admin-pkg-limits">
                        <div className="admin-pkg-limit">
                          <span>{isAr ? 'الفروع' : 'Branches'}</span>
                          <span className="admin-pkg-limit__value">
                            {toCount(pkg.max_branches) > 0 ? fmtNumber(pkg.max_branches) : isAr ? 'غير محدود' : 'Unlimited'}
                          </span>
                        </div>
                        <div className="admin-pkg-limit">
                          <span>{isAr ? 'الأعضاء' : 'Members'}</span>
                          <span className="admin-pkg-limit__value">
                            {toCount(pkg.max_members) > 0 ? fmtNumber(pkg.max_members) : isAr ? 'غير محدود' : 'Unlimited'}
                          </span>
                        </div>
                        <div className="admin-pkg-limit">
                          <span>{isAr ? 'السجلات شهريًا' : 'Records per month'}</span>
                          <span className="admin-pkg-limit__value">
                            {toCount(pkg.monthly_record_limit) > 0
                              ? fmtNumber(pkg.monthly_record_limit)
                              : isAr ? 'غير محدود' : 'Unlimited'}
                          </span>
                        </div>
                        <div className="admin-pkg-limit">
                          <span>{isAr ? 'المشتركون' : 'Subscribers'}</span>
                          <span className="admin-pkg-limit__value">{fmtNumber(pkg.active_subscribers_count)}</span>
                        </div>
                      </div>

                      {caps.length > 0 ? (
                        <div className="admin-chips">
                          {caps.map((cap) => {
                            const known = ALL_CAPABILITIES.find((c) => c.id === cap);
                            return (
                              <span className="admin-chip" key={cap} title={cap}>
                                {known ? (isAr ? known.nameAr : known.nameEn) : cap}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="admin-cell-sub">{isAr ? 'لا قدرات مفعّلة' : 'No capabilities enabled'}</div>
                      )}

                      <div className="admin-pkg-actions">
                        <button type="button" className="ml-btn ml-btn--subtle" onClick={() => openEditPackage(pkg)}>
                          {isAr ? 'تعديل' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          className="ml-btn admin-btn--danger"
                          onClick={() => {
                            setDeletePackageTarget(pkg);
                            setFormError(null);
                          }}
                        >
                          {isAr ? 'حذف' : 'Delete'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <SectionEmpty
                icon={<IconLayers size={46} />}
                title={isAr ? 'لا توجد باقات معرّفة' : 'No packages defined'}
                description={
                  isAr
                    ? 'أنشئ باقة لتُستخدم في اشتراكات المؤسسات وإصدار التراخيص.'
                    : 'Create a package to use it for organization subscriptions and license issuance.'
                }
                action={
                  <button type="button" className="ml-btn ml-btn--accent" onClick={openCreatePackage}>
                    <IconPlus size={15} />
                    {isAr ? 'إنشاء باقة' : 'Create package'}
                  </button>
                }
              />
            )}
          </div>
        </section>
      )}

      {/* ── Section 3b: Service catalog (the eight engines) ─────────────── */}
      {activeTab === 'services' && (
        <section className="admin-panel">
          <div className="admin-panel__head">
            <div>
              <div className="admin-panel__title">{isAr ? 'كتالوج المحركات' : 'Engine catalog'}</div>
              <div className="admin-panel__sub">
                {servicesRes.data
                  ? isAr
                    ? `${fmtNumber(servicesRes.data.length)} محركات معرّفة · ${fmtNumber(
                        servicesRes.data.filter((svc) => svc.is_enabled).length
                      )} منشورة على الموقع العام`
                    : `${fmtNumber(servicesRes.data.length)} engines defined · ${fmtNumber(
                        servicesRes.data.filter((svc) => svc.is_enabled).length
                      )} published on the public website`
                  : isAr
                    ? 'جارٍ جلب الكتالوج من المنصة'
                    : 'Fetching the catalog from the platform'}
              </div>
            </div>
            <div className="admin-panel__actions">
              <button
                type="button"
                className="ml-btn ml-btn--subtle"
                onClick={() => servicesRes.reload()}
                disabled={servicesRes.loading}
              >
                <IconRefresh size={15} />
                {isAr ? 'تحديث' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="admin-panel__body">
            {formError && (
              <div className="admin-form-error" role="alert" style={{ marginBottom: 16 }}>
                {formError}
              </div>
            )}

            {servicesRes.loading ? (
              <div className="admin-svc-list" role="status" aria-live="polite">
                <span className="ml-sr-only">{isAr ? 'جارٍ تحميل الكتالوج' : 'Loading the catalog'}</span>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div className="admin-svc" key={index} aria-hidden="true">
                    <span className="admin-skel" style={{ width: 44, height: 44, borderRadius: 12 }} />
                    <div className="admin-svc__main">
                      <span className="admin-skel admin-skel--text" style={{ width: '58%' }} />
                      <span className="admin-skel admin-skel--text" style={{ width: '34%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : servicesRes.error ? (
              <SectionError locale={locale} message={servicesRes.error} onRetry={servicesRes.reload} />
            ) : servicesRes.data && servicesRes.data.length > 0 ? (
              <div className="admin-svc-list">
                {servicesRes.data.map((svc) => {
                  const editing = serviceEditId === svc.id;
                  const busy = busyServiceId === svc.id;
                  return (
                    <article className={`admin-svc ${editing ? 'is-editing' : ''}`} key={svc.id}>
                      <span className="admin-svc__ordinal" aria-hidden="true">
                        {svc.engine_number}
                      </span>

                      <div className="admin-svc__main">
                        {editing ? (
                          <div className="admin-svc__form">
                            <label className="ml-field">
                              <span className="ml-label">{isAr ? 'الاسم بالعربية' : 'Title (Arabic)'}</span>
                              <input
                                className="ml-input"
                                dir="rtl"
                                value={serviceForm.titleAr}
                                onChange={(e) => setServiceForm({ ...serviceForm, titleAr: e.target.value })}
                              />
                            </label>
                            <label className="ml-field">
                              <span className="ml-label">{isAr ? 'الاسم بالإنجليزية' : 'Title (English)'}</span>
                              <input
                                className="ml-input"
                                dir="ltr"
                                value={serviceForm.titleEn}
                                onChange={(e) => setServiceForm({ ...serviceForm, titleEn: e.target.value })}
                              />
                            </label>
                            <label className="ml-field">
                              <span className="ml-label">{isAr ? 'التصنيف بالعربية' : 'Badge (Arabic)'}</span>
                              <input
                                className="ml-input"
                                dir="rtl"
                                value={serviceForm.badgeAr}
                                onChange={(e) => setServiceForm({ ...serviceForm, badgeAr: e.target.value })}
                              />
                            </label>
                            <label className="ml-field">
                              <span className="ml-label">{isAr ? 'التصنيف بالإنجليزية' : 'Badge (English)'}</span>
                              <input
                                className="ml-input"
                                dir="ltr"
                                value={serviceForm.badgeEn}
                                onChange={(e) => setServiceForm({ ...serviceForm, badgeEn: e.target.value })}
                              />
                            </label>
                            <label className="ml-field ml-field--wide">
                              <span className="ml-label">{isAr ? 'الوصف بالعربية' : 'Summary (Arabic)'}</span>
                              <textarea
                                className="ml-input"
                                dir="rtl"
                                rows={3}
                                value={serviceForm.summaryAr}
                                onChange={(e) => setServiceForm({ ...serviceForm, summaryAr: e.target.value })}
                              />
                            </label>
                            <label className="ml-field ml-field--wide">
                              <span className="ml-label">{isAr ? 'الوصف بالإنجليزية' : 'Summary (English)'}</span>
                              <textarea
                                className="ml-input"
                                dir="ltr"
                                rows={3}
                                value={serviceForm.summaryEn}
                                onChange={(e) => setServiceForm({ ...serviceForm, summaryEn: e.target.value })}
                              />
                            </label>
                            <label className="ml-field">
                              <span className="ml-label">{isAr ? 'ترتيب الظهور' : 'Display order'}</span>
                              <input
                                className="ml-input"
                                type="number"
                                min={1}
                                value={serviceForm.sortOrder}
                                onChange={(e) => setServiceForm({ ...serviceForm, sortOrder: e.target.value })}
                              />
                            </label>
                          </div>
                        ) : (
                          <>
                            <div className="admin-svc__titleline">
                              <span className="admin-svc__title">
                                {isAr ? svc.title_ar || svc.title_en : svc.title_en || svc.title_ar}
                              </span>
                              <span className="status-pill">{svc.slug}</span>
                            </div>
                            <div className="admin-svc__badge">
                              {isAr ? svc.badge_ar || svc.badge_en : svc.badge_en || svc.badge_ar}
                            </div>
                            {svc.summary_ar || svc.summary_en ? (
                              <p className="admin-svc__summary">
                                {isAr ? svc.summary_ar || svc.summary_en : svc.summary_en || svc.summary_ar}
                              </p>
                            ) : null}
                          </>
                        )}
                      </div>

                      <div className="admin-svc__side">
                        <span className={`status-pill ${svc.is_enabled ? 'active' : 'inactive'}`}>
                          {svc.is_enabled ? (isAr ? 'منشورة' : 'Published') : isAr ? 'معطّلة' : 'Disabled'}
                        </span>
                        <div className="admin-svc__actions">
                          {editing ? (
                            <>
                              <button
                                type="button"
                                className="ml-btn ml-btn--accent ml-btn--sm"
                                onClick={saveServiceEdit}
                                disabled={busy}
                              >
                                {busy ? (isAr ? 'جارٍ الحفظ…' : 'Saving…') : isAr ? 'حفظ' : 'Save'}
                              </button>
                              <button
                                type="button"
                                className="ml-btn ml-btn--subtle ml-btn--sm"
                                onClick={() => {
                                  setServiceEditId(null);
                                  setFormError(null);
                                }}
                                disabled={busy}
                              >
                                {isAr ? 'إلغاء' : 'Cancel'}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="ml-btn ml-btn--subtle ml-btn--sm"
                                onClick={() => openServiceEdit(svc)}
                              >
                                {isAr ? 'تعديل' : 'Edit'}
                              </button>
                              <button
                                type="button"
                                className="ml-btn ml-btn--subtle ml-btn--sm"
                                onClick={() => toggleServiceEnabled(svc)}
                                disabled={busy}
                              >
                                {svc.is_enabled ? (isAr ? 'تعطيل' : 'Disable') : isAr ? 'تفعيل' : 'Enable'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <SectionEmpty
                icon={<IconLayers size={46} />}
                title={isAr ? 'الكتالوج فارغ' : 'The catalog is empty'}
                description={
                  isAr
                    ? 'لم تُهيّأ جداول كتالوج الخدمات بعد. شغّل ترحيلات قاعدة البيانات لتُزرع المحركات الثمانية.'
                    : 'The service catalog has not been initialised yet. Run the database migrations to seed the eight engines.'
                }
              />
            )}
          </div>
        </section>
      )}

      {/* ── Section 4: Offline licenses ────────────────────────────────── */}
      {activeTab === 'licenses' && (
        <div className="admin-split">
          <section className="admin-panel">
            <div className="admin-panel__head">
              <div>
                <div className="admin-panel__title">{isAr ? 'إصدار ترخيص' : 'Issue a license'}</div>
                <div className="admin-panel__sub">
                  {isAr
                    ? 'يعمل هذا الترخيص على نسخة خاصة دون اتصال بالمنصة'
                    : 'This license runs on a private installation with no platform connection'}
                </div>
              </div>
            </div>
            <div className="admin-panel__body">
              <div className="admin-form-section">
                <div className="admin-form-section__title">
                  <IconOrganization size={13} />
                  {isAr ? 'بيانات العميل' : 'Customer details'}
                </div>
                <div className="admin-form-grid">
                  <Field label={isAr ? 'اسم العميل' : 'Customer name'}>
                    <input
                      type="text"
                      className="ml-input"
                      value={licenseForm.customerName}
                      onChange={(e) => setLicenseForm({ ...licenseForm, customerName: e.target.value })}
                      placeholder={isAr ? 'اسم جهة الاستخدام' : 'Licensed party name'}
                    />
                  </Field>
                  <Field label={isAr ? 'المعرّف' : 'Customer slug'} hint={isAr ? 'حروف لاتينية صغيرة وأرقام' : 'Lowercase Latin letters and numbers'}>
                    <input
                      type="text"
                      className="ml-input"
                      value={licenseForm.customerSlug}
                      onChange={(e) => setLicenseForm({ ...licenseForm, customerSlug: e.target.value })}
                      placeholder="acme-corp"
                    />
                  </Field>
                  <Field label={isAr ? 'الإصدار' : 'Edition'}>
                    <div className="ml-input" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-inset)' }}>
                      <span className="admin-chip">PRIVATE_EDITION</span>
                    </div>
                  </Field>
                  <Field label={isAr ? 'الباقة' : 'Package tier'}>
                    {packagesRes.data && packagesRes.data.length > 0 ? (
                      <select
                        className="ml-select"
                        value={licenseForm.tier}
                        onChange={(e) => setLicenseForm({ ...licenseForm, tier: e.target.value })}
                      >
                        <option value="">{isAr ? 'افتراضي — PRIVATE_EDITION' : 'Default — PRIVATE_EDITION'}</option>
                        {packagesRes.data.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {isAr ? pkg.name_ar || pkg.name_en || pkg.id : pkg.name_en || pkg.name_ar || pkg.id}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="ml-input" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-inset)' }}>
                        <span className="admin-cell-sub">
                          {packagesRes.loading
                            ? isAr ? 'جارٍ تحميل الباقات' : 'Loading packages'
                            : isAr ? 'لا توجد باقات — سيُستخدم المستوى الافتراضي' : 'No packages — default tier will be used'}
                        </span>
                      </div>
                    )}
                  </Field>
                  <Field label={isAr ? 'أقصى عدد أعضاء' : 'Maximum members'}>
                    <input
                      type="number"
                      min={1}
                      className="ml-input"
                      value={licenseForm.maxMembers}
                      onChange={(e) => setLicenseForm({ ...licenseForm, maxMembers: Number(e.target.value) || 0 })}
                    />
                  </Field>
                </div>
              </div>

              <div className="admin-form-section">
                <div className="admin-form-section__title">
                  <IconShield size={13} />
                  {isAr ? 'القدرات المُرخّصة' : 'Licensed capabilities'}
                </div>
                {packagesRes.error && (
                  <div className="admin-form-error" style={{ marginBottom: 12 }}>
                    {isAr
                      ? 'تعذر جلب قائمة القدرات — يمكنك الاختيار يدويًا'
                      : 'Could not load the capability catalog — you can still select manually'}
                  </div>
                )}
                <div className="admin-cap-grid">
                  {ALL_CAPABILITIES.map((cap) => (
                    <label className="admin-check" key={cap.id}>
                      <input
                        type="checkbox"
                        checked={licenseForm.capabilities.includes(cap.id)}
                        onChange={(e) => toggleLicenseCapability(cap.id, e.target.checked)}
                      />
                      <span>{isAr ? cap.nameAr : cap.nameEn}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formError && (
                <div className="admin-form-error" role="alert" style={{ marginTop: 16 }}>
                  {formError}
                </div>
              )}

              <div className="admin-license-actions" style={{ marginTop: 18 }}>
                <button type="button" className="ml-btn ml-btn--primary" onClick={submitIssueLicense} disabled={formBusy}>
                  <IconLock size={15} />
                  {formBusy ? (isAr ? 'جارٍ الإصدار…' : 'Issuing…') : isAr ? 'إصدار الترخيص' : 'Issue license'}
                </button>
                <button
                  type="button"
                  className="ml-btn ml-btn--subtle"
                  onClick={() => {
                    setLicenseForm(EMPTY_LICENSE_FORM);
                    setIssuedLicense(null);
                    setFormError(null);
                  }}
                  disabled={formBusy}
                >
                  {isAr ? 'تفريغ الحقول' : 'Clear form'}
                </button>
              </div>
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel__head">
              <div>
                <div className="admin-panel__title">{isAr ? 'الترخيص الصادر' : 'Issued license'}</div>
                <div className="admin-panel__sub">
                  {isAr
                    ? 'انسخ هذا الملف وسلّمه للعميل — لا يُخزَّن على المنصة'
                    : 'Copy this manifest and hand it to the customer — it is not stored on the platform'}
                </div>
              </div>
            </div>
            <div className="admin-panel__body">
              {issuedLicense !== null ? (
                <>
                  <pre className="admin-code">{(() => {
                    try {
                      return JSON.stringify(issuedLicense, null, 2);
                    } catch {
                      return String(issuedLicense);
                    }
                  })()}</pre>
                  <div className="admin-license-actions" style={{ marginTop: 14 }}>
                    <button type="button" className="ml-btn ml-btn--subtle" onClick={downloadLicense}>
                      <IconDownload size={15} />
                      {isAr ? 'تحميل ملف JSON' : 'Download JSON'}
                    </button>
                    <button type="button" className="ml-btn ml-btn--subtle" onClick={copyLicense}>
                      {isAr ? 'نسخ' : 'Copy'}
                    </button>
                  </div>
                </>
              ) : (
                <SectionEmpty
                  icon={<IconLock size={42} />}
                  compact
                  title={isAr ? 'لم يصدر أي ترخيص بعد' : 'No license issued in this session'}
                  description={
                    isAr
                      ? 'املأ النموذج وأصدر الترخيص ليظهر هنا كنص جاهز للتسليم'
                      : 'Complete the form and issue a license to see the deliverable manifest here'
                  }
                />
              )}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel__head">
              <div>
                <div className="admin-panel__title">{isAr ? 'التحقق من ترخيص' : 'Verify a license'}</div>
                <div className="admin-panel__sub">
                  {isAr
                    ? 'الصق كائن الترخيص للتحقق من صحته وتوقيعه'
                    : 'Paste a license object to validate its contents and signature'}
                </div>
              </div>
            </div>
            <div className="admin-panel__body">
              <Field label={isAr ? 'بيانات الترخيص (JSON)' : 'License payload (JSON)'}>
                <textarea
                  className="ml-input"
                  rows={8}
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  placeholder={'{\n  "licenseKey": "…",\n  "customerSlug": "…"\n}'}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 12, resize: 'vertical' }}
                />
              </Field>

              {verifyResult && (
                <div
                  className={`admin-verify-result ${verifyResult.ok ? 'admin-verify-result--ok' : 'admin-verify-result--bad'}`}
                  role={verifyResult.ok ? 'status' : 'alert'}
                  style={{ marginTop: 14 }}
                >
                  {verifyResult.ok ? <IconCheckCircle size={17} /> : <IconAlert size={17} />}
                  <div className="admin-verify-result__body">
                    {verifyResult.message}
                    <span className="admin-verify-result__meta">
                      {isAr ? 'نتيجة التحقق من خدمة التراخيص' : 'Result returned by the license service'}
                    </span>
                  </div>
                </div>
              )}

              <div className="admin-license-actions" style={{ marginTop: 14 }}>
                <button type="button" className="ml-btn ml-btn--primary" onClick={submitVerifyLicense} disabled={formBusy || !verifyInput.trim()}>
                  {formBusy ? (isAr ? 'جارٍ التحقق…' : 'Verifying…') : isAr ? 'تحقق' : 'Verify'}
                </button>
                <button
                  type="button"
                  className="ml-btn ml-btn--subtle"
                  onClick={() => {
                    setVerifyInput('');
                    setVerifyResult(null);
                    setFormError(null);
                  }}
                  disabled={formBusy}
                >
                  {isAr ? 'تفريغ' : 'Clear'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── Section 5: Platform user directory ─────────────────────────── */}
      {activeTab === 'users' && (
        <section className="admin-panel">
          <div className="admin-panel__head">
            <div>
              <div className="admin-panel__title">{isAr ? 'حسابات المنصة' : 'Platform accounts'}</div>
              <div className="admin-panel__sub">
                {usersRes.data
                  ? isAr
                    ? `${fmtNumber(usersRes.data.length)} حساب · مستقل عن مستخدمي المؤسسات`
                    : `${fmtNumber(usersRes.data.length)} accounts · separate from organization users`
                  : isAr
                    ? 'جارٍ جلب دليل المستخدمين'
                    : 'Fetching the user directory'}
              </div>
            </div>
            <div className="admin-panel__actions">
              <button type="button" className="ml-btn ml-btn--subtle" onClick={usersRes.reload} disabled={usersRes.loading}>
                <IconRefresh size={15} />
                {isAr ? 'تحديث' : 'Refresh'}
              </button>
              <button type="button" className="ml-btn ml-btn--accent" onClick={openCreateUser}>
                <IconPlus size={15} />
                {isAr ? 'مستخدم جديد' : 'New user'}
              </button>
            </div>
          </div>

          <div className="admin-panel__body admin-panel__body--flush">
            {usersRes.loading ? (
              <TableSkeleton label={isAr ? 'جارٍ تحميل المستخدمين' : 'Loading users'} rows={5} />
            ) : usersRes.error ? (
              <SectionError locale={locale} message={usersRes.error} onRetry={usersRes.reload} />
            ) : usersRes.data && usersRes.data.length > 0 ? (
              <div className="admin-table-wrap">
                <table className="admin-table admin-table--wide">
                  <thead>
                    <tr>
                      <th>{isAr ? 'المستخدم' : 'User'}</th>
                      <th>{isAr ? 'الدور' : 'Role'}</th>
                      <th>{isAr ? 'الحالة' : 'Status'}</th>
                      <th>{isAr ? 'الوصول' : 'Access'}</th>
                      <th className="admin-th-end">{isAr ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersRes.data.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="admin-cell-stack">
                            <span className="cell-primary">{u.name_ar || u.name_en || '—'}</span>
                            {u.name_ar && u.name_en && <span className="admin-cell-sub">{u.name_en}</span>}
                            <span className="cell-mono admin-cell-sub">{u.email}</span>
                          </div>
                        </td>
                        <td>
                          <span className={u.is_platform_admin ? 'status-pill prospect' : 'status-pill inactive'}>
                            {u.is_platform_admin ? (isAr ? 'مدير منصة' : 'Platform admin') : isAr ? 'حساب عام' : 'General account'}
                          </span>
                        </td>
                        <td>
                          <span className={userStatusClass(u.status)}>{userStatusLabel(u.status, isAr)}</span>
                        </td>
                        <td className="cell-mono">
                          {u.organizations_summary || (isAr ? 'لا وصول مؤسسات' : 'No organization access')}
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            <button type="button" className="ml-btn ml-btn--subtle" onClick={() => openEditUser(u)}>
                              {isAr ? 'تعديل' : 'Edit'}
                            </button>
                            <button
                              type="button"
                              className="ml-btn admin-btn--danger"
                              onClick={() => {
                                setDeleteUserTarget(u);
                                setFormError(null);
                              }}
                            >
                              {isAr ? 'حذف' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <SectionEmpty
                icon={<IconCustomer size={46} />}
                title={isAr ? 'لا توجد حسابات منصة' : 'No platform accounts yet'}
                description={
                  isAr
                    ? 'أنشئ حساب مسؤول للمنصة لمنحه وصولًا إلى هذا الكونسول.'
                    : 'Create a platform administrator account to grant access to this console.'
                }
                action={
                  <button type="button" className="ml-btn ml-btn--accent" onClick={openCreateUser}>
                    <IconPlus size={15} />
                    {isAr ? 'إنشاء مستخدم' : 'Create user'}
                  </button>
                }
              />
            )}
          </div>
        </section>
      )}

      {/* ── Section 6: Inbound inquiries ───────────────────────────────── */}
      {activeTab === 'leads' && (
        <section className="admin-panel">
          <div className="admin-panel__head">
            <div>
              <div className="admin-panel__title">{isAr ? 'طلبات التواصل الواردة' : 'Inbound inquiries'}</div>
              <div className="admin-panel__sub">
                {leadsRes.data
                  ? isAr
                    ? `${fmtNumber(leadsRes.data.length)} طلب · ${fmtNumber(leadsRes.data.filter((l) => l.status === 'NEW').length)} جديد`
                    : `${fmtNumber(leadsRes.data.length)} inquiries · ${fmtNumber(leadsRes.data.filter((l) => l.status === 'NEW').length)} new`
                  : isAr
                    ? 'جارٍ جلب الطلبات من الموقع العام'
                    : 'Fetching inquiries from the public website'}
              </div>
            </div>
            <div className="admin-panel__actions">
              <button type="button" className="ml-btn ml-btn--subtle" onClick={leadsRes.reload} disabled={leadsRes.loading}>
                <IconRefresh size={15} />
                {isAr ? 'تحديث' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="admin-panel__body admin-panel__body--flush">
            {leadsRes.loading ? (
              <TableSkeleton label={isAr ? 'جارٍ تحميل الطلبات' : 'Loading inquiries'} rows={5} />
            ) : leadsRes.error ? (
              <SectionError locale={locale} message={leadsRes.error} onRetry={leadsRes.reload} />
            ) : leadsRes.data && leadsRes.data.length > 0 ? (
              <div className="admin-table-wrap">
                <table className="admin-table admin-table--wide">
                  <thead>
                    <tr>
                      <th>{isAr ? 'المرسِل' : 'Sender'}</th>
                      <th>{isAr ? 'نوع الطلب' : 'Inquiry type'}</th>
                      <th>{isAr ? 'الرسالة' : 'Message'}</th>
                      <th>{isAr ? 'التاريخ' : 'Date'}</th>
                      <th>{isAr ? 'الحالة' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadsRes.data.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <div className="admin-cell-stack">
                            <span className="cell-primary">{lead.name || '—'}</span>
                            {lead.company_name && <span className="admin-cell-sub">{lead.company_name}</span>}
                            <span className="cell-mono admin-cell-sub">{lead.email || lead.phone || '—'}</span>
                          </div>
                        </td>
                        <td className="cell-mono">{lead.inquiry_type || '—'}</td>
                        <td>
                          <span className="admin-truncate" title={lead.message || ''}>
                            {lead.message || '—'}
                          </span>
                        </td>
                        <td className="cell-mono">{fmtDate(lead.created_at)}</td>
                        <td>
                          <select
                            className="ml-select admin-lead-select"
                            value={lead.status || 'NEW'}
                            onChange={(e) => changeLeadStatus(lead, e.target.value)}
                            disabled={busyLeadId === lead.id}
                            aria-label={isAr ? 'تحديث حالة الطلب' : 'Update inquiry status'}
                          >
                            {LEAD_STATUS_CODES.map((code) => (
                              <option key={code} value={code}>
                                {leadStatusLabel(code, isAr)}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <SectionEmpty
                icon={<IconFileText size={46} />}
                title={isAr ? 'لا توجد طلبات تواصل' : 'No inbound inquiries'}
                description={
                  isAr
                    ? 'ستظهر هنا كل الرسائل الواردة من نموذج التواصل في الموقع العام'
                    : 'Every message submitted through the public contact form will appear here'
                }
              />
            )}
          </div>
        </section>
      )}

      {/* ── Section 7: Audit log ───────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <section className="admin-panel">
          <div className="admin-panel__head">
            <div>
              <div className="admin-panel__title">{isAr ? 'سجل التدقيق' : 'Audit log'}</div>
              <div className="admin-panel__sub">
                {auditRes.data
                  ? isAr
                    ? `${fmtNumber(auditRes.data.length)} حدث مسجّل — غير قابل للتعديل`
                    : `${fmtNumber(auditRes.data.length)} recorded events — immutable`
                  : isAr
                    ? 'جارٍ جلب سجل التدقيق'
                    : 'Fetching the audit log'}
              </div>
            </div>
            <div className="admin-panel__actions">
              <button type="button" className="ml-btn ml-btn--subtle" onClick={auditRes.reload} disabled={auditRes.loading}>
                <IconRefresh size={15} />
                {isAr ? 'تحديث' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="admin-panel__body admin-panel__body--flush">
            {auditRes.loading ? (
              <TableSkeleton label={isAr ? 'جارٍ تحميل سجل التدقيق' : 'Loading the audit log'} rows={8} />
            ) : auditRes.error ? (
              <SectionError locale={locale} message={auditRes.error} onRetry={auditRes.reload} />
            ) : auditRes.data && auditRes.data.length > 0 ? (
              <div className="admin-table-wrap">
                <table className="admin-table admin-table--wide">
                  <thead>
                    <tr>
                      <th>{isAr ? 'الحدث' : 'Event'}</th>
                      <th>{isAr ? 'المنفّذ' : 'Operator'}</th>
                      <th>{isAr ? 'الهدف' : 'Target'}</th>
                      <th>{isAr ? 'التفاصيل' : 'Details'}</th>
                      <th>{isAr ? 'عنوان IP' : 'IP address'}</th>
                      <th>{isAr ? 'التاريخ' : 'Date'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditRes.data.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <span className="admin-action-code">{log.action || '—'}</span>
                        </td>
                        <td className="cell-mono">{log.operator_email || '—'}</td>
                        <td>{log.target_tenant_name_ar || '—'}</td>
                        <td>
                          <span className="admin-truncate" title={detailsText(log.details)}>
                            {detailsText(log.details)}
                          </span>
                        </td>
                        <td className="cell-mono">{log.ip_address || '—'}</td>
                        <td className="cell-mono">{fmtDate(log.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <SectionEmpty
                icon={<IconServer size={46} />}
                title={isAr ? 'لا توجد أحداث مسجّلة' : 'No recorded events'}
                description={
                  isAr
                    ? 'كل إجراء يُنفَّذ داخل واجهة الإدارة يُكتب هنا مباشرة'
                    : 'Every action performed in this console is written here immediately'
                }
              />
            )}
          </div>
        </section>
      )}
      {/* ══ Modal: create organization ═════════════════════════════════════ */}
      {createOpen && (
        <ModalShell
          locale={locale}
          title={isAr ? 'إنشاء مؤسسة جديدة' : 'Create a new organization'}
          description={
            isAr
              ? 'تُنشأ مساحة عمل معزولة وحساب مدير مخصّص لهذه المؤسسة، ويُسجَّل كل ذلك في سجل التدقيق.'
              : 'This provisions an isolated workspace plus a dedicated administrator account, and records the whole operation in the audit log.'
          }
          wide
          onClose={closeAllModals}
          footer={
            <>
              <button type="button" className="ml-btn ml-btn--subtle" onClick={closeAllModals} disabled={formBusy}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" className="ml-btn ml-btn--primary" onClick={submitCreateTenant} disabled={formBusy}>
                {formBusy ? (isAr ? 'جارٍ الإنشاء…' : 'Creating…') : isAr ? 'إنشاء المؤسسة' : 'Create organization'}
              </button>
            </>
          }
        >
          <div className="admin-form-section">
            <div className="admin-form-section__title">
              <IconOrganization size={13} />
              {isAr ? 'هوية المؤسسة' : 'Organization identity'}
            </div>
            <div className="admin-form-grid">
              <Field label={isAr ? 'الاسم بالعربية' : 'Arabic name'}>
                <input
                  type="text"
                  className="ml-input"
                  dir="rtl"
                  value={tenantForm.nameAr}
                  onChange={(e) => setTenantForm({ ...tenantForm, nameAr: e.target.value })}
                />
              </Field>
              <Field label={isAr ? 'الاسم بالإنجليزية' : 'English name'}>
                <input
                  type="text"
                  className="ml-input"
                  dir="ltr"
                  value={tenantForm.nameEn}
                  onChange={(e) => setTenantForm({ ...tenantForm, nameEn: e.target.value })}
                />
              </Field>
              <Field label={isAr ? 'المعرّف (slug)' : 'Slug'} hint={isAr ? 'حروف لاتينية صغيرة وأرقام فقط' : 'Lowercase Latin letters and numbers only'}>
                <input
                  type="text"
                  className="ml-input"
                  dir="ltr"
                  value={tenantForm.slug}
                  onChange={(e) => setTenantForm({ ...tenantForm, slug: e.target.value })}
                  placeholder="acme-corp"
                />
              </Field>
              <Field label={isAr ? 'العملة' : 'Currency'}>
                <select
                  className="ml-select"
                  value={tenantForm.currency}
                  onChange={(e) => setTenantForm({ ...tenantForm, currency: e.target.value })}
                >
                  {CURRENCY_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <div className="admin-form-section">
            <div className="admin-form-section__title">
              <IconCustomer size={13} />
              {isAr ? 'مدير حساب المؤسسة' : 'Organization administrator'}
            </div>
            <div className="admin-form-grid">
              <Field label={isAr ? 'البريد الإلكتروني' : 'Email'}>
                <input
                  type="email"
                  className="ml-input"
                  dir="ltr"
                  value={tenantForm.adminEmail}
                  onChange={(e) => setTenantForm({ ...tenantForm, adminEmail: e.target.value })}
                  autoComplete="off"
                />
              </Field>
              <Field label={isAr ? 'كلمة المرور' : 'Password'} hint={isAr ? 'تُسلَّم للعميل وتُغيَّر عند أول دخول' : 'Hand this to the customer; it should be changed at first sign-in'}>
                <input
                  type="text"
                  className="ml-input"
                  dir="ltr"
                  value={tenantForm.adminPassword}
                  onChange={(e) => setTenantForm({ ...tenantForm, adminPassword: e.target.value })}
                  autoComplete="new-password"
                />
              </Field>
              <Field label={isAr ? 'اسم المدير بالعربية' : 'Administrator name (Arabic)'}>
                <input
                  type="text"
                  className="ml-input"
                  dir="rtl"
                  value={tenantForm.adminNameAr}
                  onChange={(e) => setTenantForm({ ...tenantForm, adminNameAr: e.target.value })}
                />
              </Field>
              <Field label={isAr ? 'اسم المدير بالإنجليزية' : 'Administrator name (English)'}>
                <input
                  type="text"
                  className="ml-input"
                  dir="ltr"
                  value={tenantForm.adminNameEn}
                  onChange={(e) => setTenantForm({ ...tenantForm, adminNameEn: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <div className="admin-form-section">
            <div className="admin-form-section__title">
              <IconCreditCard size={13} />
              {isAr ? 'الاشتراك الأولي' : 'Initial subscription'}
            </div>
            <div className="admin-form-grid">
              <Field label={isAr ? 'الباقة' : 'Package'}>
                {packagesRes.data && packagesRes.data.length > 0 ? (
                  <select
                    className="ml-select"
                    value={tenantForm.packageId}
                    onChange={(e) => setTenantForm({ ...tenantForm, packageId: e.target.value })}
                  >
                    <option value="">{isAr ? 'بلا باقة' : 'No package'}</option>
                    {packagesRes.data.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {isAr ? pkg.name_ar || pkg.name_en || pkg.id : pkg.name_en || pkg.name_ar || pkg.id}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select className="ml-select" value="" disabled>
                    <option>{isAr ? 'لا توجد باقات معرّفة' : 'No packages defined'}</option>
                  </select>
                )}
              </Field>
              <Field label={isAr ? 'مدة الاشتراك (أشهر)' : 'Subscription length (months)'}>
                <select
                  className="ml-select"
                  value={tenantForm.subscriptionMonths}
                  onChange={(e) => setTenantForm({ ...tenantForm, subscriptionMonths: Number(e.target.value) })}
                  disabled={!tenantForm.packageId}
                >
                  {DURATION_MONTHS.map((months) => (
                    <option key={months} value={months}>
                      {months}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            {!packagesRes.data?.length && !packagesRes.loading && (
              <p className="ml-hint" style={{ marginTop: 10 }}>
                {isAr
                  ? 'لا توجد باقات معرّفة — يمكنك إنشاء المؤسسة الآن وإضافة الاشتراك لاحقًا.'
                  : 'No packages are defined yet — you can create the organization now and attach a subscription later.'}
              </p>
            )}
          </div>

          {formError && (
            <div className="admin-form-error" role="alert" style={{ marginTop: 16 }}>
              {formError}
            </div>
          )}
        </ModalShell>
      )}

      {/* ══ Modal: edit organization ═══════════════════════════════════════ */}
      {editTarget && (
        <ModalShell
          locale={locale}
          title={isAr ? 'تعديل بيانات المؤسسة' : 'Edit organization details'}
          description={tenantName(editTarget)}
          onClose={closeAllModals}
          footer={
            <>
              <button type="button" className="ml-btn ml-btn--subtle" onClick={closeAllModals} disabled={formBusy}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" className="ml-btn ml-btn--primary" onClick={submitEditTenant} disabled={formBusy}>
                {formBusy ? (isAr ? 'جارٍ الحفظ…' : 'Saving…') : isAr ? 'حفظ التغييرات' : 'Save changes'}
              </button>
            </>
          }
        >
          <div className="admin-form-grid">
            <Field label={isAr ? 'الاسم بالعربية' : 'Arabic name'}>
              <input
                type="text"
                className="ml-input"
                dir="rtl"
                value={editForm.nameAr}
                onChange={(e) => setEditForm({ ...editForm, nameAr: e.target.value })}
              />
            </Field>
            <Field label={isAr ? 'الاسم بالإنجليزية' : 'English name'}>
              <input
                type="text"
                className="ml-input"
                dir="ltr"
                value={editForm.nameEn}
                onChange={(e) => setEditForm({ ...editForm, nameEn: e.target.value })}
              />
            </Field>
            <Field label={isAr ? 'المعرّف (slug)' : 'Slug'}>
              <input
                type="text"
                className="ml-input"
                dir="ltr"
                value={editForm.slug}
                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
              />
            </Field>
            <Field label={isAr ? 'العملة' : 'Currency'}>
              <select
                className="ml-select"
                value={editForm.currency}
                onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
              >
                {CURRENCY_CODES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={isAr ? 'المنطقة الزمنية' : 'Timezone'}>
              <input
                type="text"
                className="ml-input"
                dir="ltr"
                value={editForm.timezone}
                onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })}
              />
            </Field>
            <Field label={isAr ? 'الحالة' : 'Status'}>
              <select
                className="ml-select"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                {TENANT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {tenantStatusLabel(status, isAr)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {formError && (
            <div className="admin-form-error" role="alert" style={{ marginTop: 16 }}>
              {formError}
            </div>
          )}
        </ModalShell>
      )}

      {/* ══ Modal: change status ═══════════════════════════════════════════ */}
      {statusTarget && (
        <ModalShell
          locale={locale}
          title={isAr ? 'تغيير حالة المؤسسة' : 'Change organization status'}
          description={tenantName(statusTarget)}
          onClose={closeAllModals}
          footer={
            <>
              <button type="button" className="ml-btn ml-btn--subtle" onClick={closeAllModals} disabled={formBusy}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" className="ml-btn ml-btn--primary" onClick={submitStatusTenant} disabled={formBusy}>
                {formBusy ? (isAr ? 'جارٍ التحديث…' : 'Updating…') : isAr ? 'تطبيق الحالة' : 'Apply status'}
              </button>
            </>
          }
        >
          <div className="admin-form-grid admin-form-grid--single">
            <Field
              label={isAr ? 'الحالة الجديدة' : 'New status'}
              hint={
                isAr
                  ? 'التعليق يمنع الدخول إلى مساحة العمل دون حذف أي بيانات'
                  : 'Suspension blocks workspace sign-in without deleting any data'
              }
            >
              <select
                className="ml-select"
                value={statusForm.status}
                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
              >
                {TENANT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {tenantStatusLabel(status, isAr)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={isAr ? 'سبب التغيير (يُسجَّل في التدقيق)' : 'Reason (recorded in the audit log)'}>
              <textarea
                className="ml-input"
                rows={3}
                value={statusForm.reason}
                onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </Field>
          </div>
          {formError && (
            <div className="admin-form-error" role="alert" style={{ marginTop: 16 }}>
              {formError}
            </div>
          )}
        </ModalShell>
      )}

      {/* ══ Modal: manual subscription ═════════════════════════════════════ */}
      {subscriptionTarget && (
        <ModalShell
          locale={locale}
          title={isAr ? 'تسجيل اشتراك يدوي' : 'Record a manual subscription'}
          description={tenantName(subscriptionTarget)}
          onClose={closeAllModals}
          footer={
            <>
              <button type="button" className="ml-btn ml-btn--subtle" onClick={closeAllModals} disabled={formBusy}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" className="ml-btn ml-btn--primary" onClick={submitSubscription} disabled={formBusy}>
                {formBusy ? (isAr ? 'جارٍ التسجيل…' : 'Recording…') : isAr ? 'تسجيل الاشتراك' : 'Record subscription'}
              </button>
            </>
          }
        >
          {packagesRes.data && packagesRes.data.length > 0 ? (
            <div className="admin-form-grid">
              <Field label={isAr ? 'الباقة' : 'Package'}>
                <select
                  className="ml-select"
                  value={subscriptionForm.packageId}
                  onChange={(e) => setSubscriptionForm({ ...subscriptionForm, packageId: e.target.value })}
                >
                  <option value="">{isAr ? 'اختر الباقة' : 'Select a package'}</option>
                  {packagesRes.data.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {isAr ? pkg.name_ar || pkg.name_en || pkg.id : pkg.name_en || pkg.name_ar || pkg.id}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={isAr ? 'المدة (أشهر)' : 'Duration (months)'}>
                <select
                  className="ml-select"
                  value={subscriptionForm.durationMonths}
                  onChange={(e) => setSubscriptionForm({ ...subscriptionForm, durationMonths: Number(e.target.value) })}
                >
                  {DURATION_MONTHS.map((months) => (
                    <option key={months} value={months}>
                      {months}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={isAr ? 'المبلغ (ر.س)' : 'Amount (SAR)'}>
                <input
                  type="number"
                  min={0}
                  className="ml-input"
                  value={subscriptionForm.amount}
                  onChange={(e) => setSubscriptionForm({ ...subscriptionForm, amount: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label={isAr ? 'طريقة الدفع' : 'Payment method'}>
                <select
                  className="ml-select"
                  value={subscriptionForm.paymentMethod}
                  onChange={(e) => setSubscriptionForm({ ...subscriptionForm, paymentMethod: e.target.value })}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={isAr ? 'الرقم المرجعي' : 'Reference number'}>
                <input
                  type="text"
                  className="ml-input"
                  dir="ltr"
                  value={subscriptionForm.referenceNumber}
                  onChange={(e) => setSubscriptionForm({ ...subscriptionForm, referenceNumber: e.target.value })}
                />
              </Field>
              <Field label={isAr ? 'ملاحظات' : 'Notes'}>
                <input
                  type="text"
                  className="ml-input"
                  value={subscriptionForm.notes}
                  onChange={(e) => setSubscriptionForm({ ...subscriptionForm, notes: e.target.value })}
                />
              </Field>
            </div>
          ) : (
            <SectionEmpty
              icon={<IconCreditCard size={42} />}
              compact
              title={isAr ? 'لا توجد باقات معرّفة' : 'No packages defined yet'}
              description={
                isAr
                  ? 'أنشئ باقة أولًا لتتمكن من تسجيل اشتراك لهذه المؤسسة.'
                  : 'Create a package first so you can record a subscription for this organization.'
              }
            />
          )}
          {formError && (
            <div className="admin-form-error" role="alert" style={{ marginTop: 16 }}>
              {formError}
            </div>
          )}
        </ModalShell>
      )}

      {/* ══ Modal: confirm payment ═════════════════════════════════════════ */}
      {paymentTarget && (
        <ModalShell
          locale={locale}
          title={isAr ? 'تأكيد استلام دفعة' : 'Confirm a received payment'}
          description={tenantName(paymentTarget)}
          onClose={closeAllModals}
          footer={
            <>
              <button type="button" className="ml-btn ml-btn--subtle" onClick={closeAllModals} disabled={formBusy}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" className="ml-btn ml-btn--primary" onClick={submitPayment} disabled={formBusy}>
                {formBusy ? (isAr ? 'جارٍ التأكيد…' : 'Confirming…') : isAr ? 'تأكيد الدفعة' : 'Confirm payment'}
              </button>
            </>
          }
        >
          <div className="admin-form-grid admin-form-grid--single">
            <Field label={isAr ? 'المبلغ المستلم (ر.س)' : 'Amount received (SAR)'} hint={isAr ? 'لا يمكن أن يكون مبلغًا أقل من صفر' : 'Must be greater than zero'}>
              <input
                type="number"
                min={0}
                className="ml-input"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label={isAr ? 'الرقم المرجعي' : 'Reference number'}>
              <input
                type="text"
                className="ml-input"
                dir="ltr"
                value={paymentForm.referenceNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
              />
            </Field>
            <Field label={isAr ? 'ملاحظات' : 'Notes'}>
              <input
                type="text"
                className="ml-input"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              />
            </Field>
          </div>
          {formError && (
            <div className="admin-form-error" role="alert" style={{ marginTop: 16 }}>
              {formError}
            </div>
          )}
        </ModalShell>
      )}

      {/* ══ Modal: delete organization (destructive) ═══════════════════════ */}
      {deleteTarget && (
        <ModalShell
          locale={locale}
          danger
          title={isAr ? 'حذف المؤسسة نهائيًا' : 'Permanently delete organization'}
          description={isAr ? 'لا يمكن التراجع عن هذا الإجراء' : 'This action cannot be undone'}
          onClose={closeAllModals}
          footer={
            <>
              <button type="button" className="ml-btn ml-btn--subtle" onClick={closeAllModals} disabled={formBusy}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" className="ml-btn ml-btn--primary" onClick={submitDeleteTenant} disabled={formBusy}>
                {formBusy ? (isAr ? 'جارٍ الحذف…' : 'Deleting…') : isAr ? 'تأكيد الحذف النهائي' : 'Confirm permanent deletion'}
              </button>
            </>
          }
        >
          <p className="admin-confirm-text">
            {isAr
              ? 'سيؤدي هذا الإجراء إلى حذف بيانات المؤسسة بالكامل من المنصة، بما في ذلك سجلاتها التشغيلية ومساحة عملها. هذا إجراء لا يمكن التراجع عنه، ويُسجَّل في سجل التدقيق.'
              : 'This removes the organization from the platform along with its operational records and its workspace. The action is irreversible and is written to the audit log.'}
          </p>
          <div className="admin-confirm-target">
            <div className="admin-cell-stack">
              <span className="cell-primary">{tenantName(deleteTarget)}</span>
              <span className="cell-mono admin-cell-sub">{deleteTarget.slug || deleteTarget.id}</span>
            </div>
          </div>
          {formError && (
            <div className="admin-form-error" role="alert" style={{ marginTop: 16 }}>
              {formError}
            </div>
          )}
        </ModalShell>
      )}

      {/* ══ Modal: package form ════════════════════════════════════════════ */}
      {packageModal && (
        <ModalShell
          locale={locale}
          wide
          title={packageModal.mode === 'create' ? (isAr ? 'إنشاء باقة جديدة' : 'Create a new package') : isAr ? 'تعديل الباقة' : 'Edit package'}
          description={
            packageModal.mode === 'edit'
              ? packageModal.record.id
              : isAr
                ? 'تحدد الباقة الحدود والقدرات التي تحصل عليها كل مؤسسة مشتركة'
                : 'A package defines the limits and capabilities granted to every subscribing organization'
          }
          onClose={closeAllModals}
          footer={
            <>
              <button type="button" className="ml-btn ml-btn--subtle" onClick={closeAllModals} disabled={formBusy}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" className="ml-btn ml-btn--primary" onClick={submitPackage} disabled={formBusy}>
                {formBusy ? (isAr ? 'جارٍ الحفظ…' : 'Saving…') : isAr ? 'حفظ الباقة' : 'Save package'}
              </button>
            </>
          }
        >
          <div className="admin-form-section">
            <div className="admin-form-section__title">
              <IconCreditCard size={13} />
              {isAr ? 'التعريف' : 'Identity'}
            </div>
            <div className="admin-form-grid">
              {packageModal.mode === 'create' && (
                <Field label={isAr ? 'المعرّف (id)' : 'Identifier (id)'} hint={isAr ? 'حروف لاتينية صغيرة وأرقام' : 'Lowercase Latin letters and numbers'}>
                  <input
                    type="text"
                    className="ml-input"
                    dir="ltr"
                    value={packageForm.id}
                    onChange={(e) => setPackageForm({ ...packageForm, id: e.target.value })}
                    placeholder="growth"
                  />
                </Field>
              )}
              <Field label={isAr ? 'الاسم بالعربية' : 'Arabic name'}>
                <input
                  type="text"
                  className="ml-input"
                  dir="rtl"
                  value={packageForm.nameAr}
                  onChange={(e) => setPackageForm({ ...packageForm, nameAr: e.target.value })}
                />
              </Field>
              <Field label={isAr ? 'الاسم بالإنجليزية' : 'English name'}>
                <input
                  type="text"
                  className="ml-input"
                  dir="ltr"
                  value={packageForm.nameEn}
                  onChange={(e) => setPackageForm({ ...packageForm, nameEn: e.target.value })}
                />
              </Field>
              <Field label={isAr ? 'المستوى' : 'Tier level'}>
                <input
                  type="number"
                  min={1}
                  className="ml-input"
                  value={packageForm.tierLevel}
                  onChange={(e) => setPackageForm({ ...packageForm, tierLevel: Number(e.target.value) || 1 })}
                />
              </Field>
            </div>
          </div>

          <div className="admin-form-section">
            <div className="admin-form-section__title">
              <IconActivity size={13} />
              {isAr ? 'الأسعار والحدود' : 'Pricing & limits'}
            </div>
            <div className="admin-form-grid">
              <Field label={isAr ? 'السعر الشهري (ر.س)' : 'Monthly price (SAR)'}>
                <input
                  type="number"
                  min={0}
                  className="ml-input"
                  value={packageForm.monthlyPriceSar}
                  onChange={(e) => setPackageForm({ ...packageForm, monthlyPriceSar: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label={isAr ? 'السعر السنوي (ر.س)' : 'Annual price (SAR)'}>
                <input
                  type="number"
                  min={0}
                  className="ml-input"
                  value={packageForm.annualPriceSar}
                  onChange={(e) => setPackageForm({ ...packageForm, annualPriceSar: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label={isAr ? 'أقصى عدد فروع' : 'Maximum branches'} hint={isAr ? 'استخدم 0 لعدم التحديد' : 'Use 0 for unlimited'}>
                <input
                  type="number"
                  min={0}
                  className="ml-input"
                  value={packageForm.maxBranches}
                  onChange={(e) => setPackageForm({ ...packageForm, maxBranches: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label={isAr ? 'أقصى عدد أعضاء' : 'Maximum members'}>
                <input
                  type="number"
                  min={0}
                  className="ml-input"
                  value={packageForm.maxMembers}
                  onChange={(e) => setPackageForm({ ...packageForm, maxMembers: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label={isAr ? 'السجلات شهريًا' : 'Records per month'}>
                <input
                  type="number"
                  min={0}
                  className="ml-input"
                  value={packageForm.monthlyRecordLimit}
                  onChange={(e) => setPackageForm({ ...packageForm, monthlyRecordLimit: Number(e.target.value) || 0 })}
                />
              </Field>
            </div>
          </div>

          <div className="admin-form-section">
            <div className="admin-form-section__title">
              <IconShield size={13} />
              {isAr ? 'القدرات المفعّلة' : 'Enabled capabilities'}
            </div>
            <div className="admin-cap-grid">
              {ALL_CAPABILITIES.map((cap) => (
                <label className="admin-check" key={cap.id}>
                  <input
                    type="checkbox"
                    checked={packageForm.capabilities.includes(cap.id)}
                    onChange={(e) => togglePackageCapability(cap.id, e.target.checked)}
                  />
                  <span>{isAr ? cap.nameAr : cap.nameEn}</span>
                </label>
              ))}
            </div>
          </div>

          {formError && (
            <div className="admin-form-error" role="alert" style={{ marginTop: 16 }}>
              {formError}
            </div>
          )}
        </ModalShell>
      )}

      {/* ══ Modal: delete package (destructive) ════════════════════════════ */}
      {deletePackageTarget && (
        <ModalShell
          locale={locale}
          danger
          title={isAr ? 'حذف الباقة' : 'Delete package'}
          description={isAr ? 'لا يمكن التراجع عن هذا الإجراء' : 'This action cannot be undone'}
          onClose={closeAllModals}
          footer={
            <>
              <button type="button" className="ml-btn ml-btn--subtle" onClick={closeAllModals} disabled={formBusy}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" className="ml-btn ml-btn--primary" onClick={submitDeletePackage} disabled={formBusy}>
                {formBusy ? (isAr ? 'جارٍ الحذف…' : 'Deleting…') : isAr ? 'تأكيد الحذف' : 'Confirm deletion'}
              </button>
            </>
          }
        >
          <p className="admin-confirm-text">
            {isAr
              ? 'سيؤدي هذا الإجراء إلى حذف الباقة من المنصة. المؤسسات المشتركة بهذه الباقة لن تُحذف، لكنها ستبقى بلا باقة حتى تُسنَد باقة أخرى.'
              : 'This removes the package from the platform. Organizations subscribed to it are not deleted, but they will remain without a package until another one is assigned.'}
          </p>
          <div className="admin-confirm-target">
            <div className="admin-cell-stack">
              <span className="cell-primary">
                {deletePackageTarget.name_ar || deletePackageTarget.name_en || deletePackageTarget.id}
              </span>
              <span className="cell-mono admin-cell-sub">
                {deletePackageTarget.id} · {isAr ? 'المشتركون' : 'Subscribers'}{' '}
                {fmtNumber(deletePackageTarget.active_subscribers_count)}
              </span>
            </div>
          </div>
          {formError && (
            <div className="admin-form-error" role="alert" style={{ marginTop: 16 }}>
              {formError}
            </div>
          )}
        </ModalShell>
      )}

      {/* ══ Modal: platform user form ══════════════════════════════════════ */}
      {userModal && (
        <ModalShell
          locale={locale}
          wide
          title={userModal.mode === 'create' ? (isAr ? 'إنشاء حساب منصة' : 'Create a platform account') : isAr ? 'تعديل حساب المنصة' : 'Edit platform account'}
          description={
            userModal.mode === 'edit'
              ? userModal.record.email
              : isAr
                ? 'حسابات المنصة تمنح وصولًا إلى هذا الكونسول فقط، ولا تمنح وصولًا إلى أي مساحة عمل عملاء'
                : 'Platform accounts grant access to this console only — they do not grant access to any customer workspace'
          }
          onClose={closeAllModals}
          footer={
            <>
              <button type="button" className="ml-btn ml-btn--subtle" onClick={closeAllModals} disabled={formBusy}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" className="ml-btn ml-btn--primary" onClick={submitUser} disabled={formBusy}>
                {formBusy ? (isAr ? 'جارٍ الحفظ…' : 'Saving…') : isAr ? 'حفظ الحساب' : 'Save account'}
              </button>
            </>
          }
        >
          <div className="admin-form-grid">
            {userModal.mode === 'create' && (
              <Field label={isAr ? 'البريد الإلكتروني' : 'Email'}>
                <input
                  type="email"
                  className="ml-input"
                  dir="ltr"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  autoComplete="off"
                />
              </Field>
            )}
            <Field
              label={userModal.mode === 'create' ? (isAr ? 'كلمة المرور' : 'Password') : isAr ? 'كلمة مرور جديدة (اختياري)' : 'New password (optional)'}
            >
              <input
                type="text"
                className="ml-input"
                dir="ltr"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                autoComplete="new-password"
              />
            </Field>
            <Field label={isAr ? 'الاسم بالعربية' : 'Arabic name'}>
              <input
                type="text"
                className="ml-input"
                dir="rtl"
                value={userForm.nameAr}
                onChange={(e) => setUserForm({ ...userForm, nameAr: e.target.value })}
              />
            </Field>
            <Field label={isAr ? 'الاسم بالإنجليزية' : 'English name'}>
              <input
                type="text"
                className="ml-input"
                dir="ltr"
                value={userForm.nameEn}
                onChange={(e) => setUserForm({ ...userForm, nameEn: e.target.value })}
              />
            </Field>
            <Field label={isAr ? 'الحالة' : 'Status'}>
              <select
                className="ml-select"
                value={userForm.status}
                onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                disabled={userModal.mode === 'create'}
              >
                <option value="active">{userStatusLabel('active', isAr)}</option>
                <option value="suspended">{userStatusLabel('suspended', isAr)}</option>
              </select>
            </Field>
          </div>

          <div className="admin-form-section" style={{ marginTop: 16 }}>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={userForm.isPlatformAdmin}
                onChange={(e) => setUserForm({ ...userForm, isPlatformAdmin: e.target.checked })}
              />
              <span>
                {isAr
                  ? 'منح صلاحية مدير المنصة (وصول إلى هذا الكونسول)'
                  : 'Grant platform administrator privilege (access to this console)'}
              </span>
            </label>
          </div>

          {formError && (
            <div className="admin-form-error" role="alert" style={{ marginTop: 16 }}>
              {formError}
            </div>
          )}
        </ModalShell>
      )}

      {/* ══ Modal: delete platform user (destructive) ══════════════════════ */}
      {deleteUserTarget && (
        <ModalShell
          locale={locale}
          danger
          title={isAr ? 'حذف حساب المنصة' : 'Delete platform account'}
          description={deleteUserTarget.email}
          onClose={closeAllModals}
          footer={
            <>
              <button type="button" className="ml-btn ml-btn--subtle" onClick={closeAllModals} disabled={formBusy}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" className="ml-btn ml-btn--primary" onClick={submitDeleteUser} disabled={formBusy}>
                {formBusy ? (isAr ? 'جارٍ الحذف…' : 'Deleting…') : isAr ? 'تأكيد الحذف' : 'Confirm deletion'}
              </button>
            </>
          }
        >
          <p className="admin-confirm-text">
            {isAr
              ? 'سيؤدي هذا الإجراء إلى حذف الحساب نهائيًا ومنعه من الدخول إلى كونسول الإدارة. هذا إجراء لا يمكن التراجع عنه، ويُسجَّل في سجل التدقيق.'
              : 'This permanently removes the account and blocks it from the administration console. The action is irreversible and is written to the audit log.'}
          </p>
          <div className="admin-confirm-target">
            <div className="admin-cell-stack">
              <span className="cell-primary">{deleteUserTarget.name_ar || deleteUserTarget.name_en || '—'}</span>
              <span className="cell-mono admin-cell-sub">{deleteUserTarget.email}</span>
            </div>
          </div>
          {formError && (
            <div className="admin-form-error" role="alert" style={{ marginTop: 16 }}>
              {formError}
            </div>
          )}
        </ModalShell>
      )}
    </div>
  );
};
