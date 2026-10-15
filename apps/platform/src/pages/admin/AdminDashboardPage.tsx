// MIKHLAFI LABS — Enterprise Platform Owner Master Control Suite
// Dedicated Sovereign Administration Portal with Full Operational CRUD Management

import React, { useState, useEffect, useCallback } from 'react';
import { LocaleMode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { ROUTES } from '../../router/routes';

interface AdminDashboardPageProps {
  locale: LocaleMode;
  currentRoute: string;
  onNavigate: (path: string) => void;
}

const ALL_CAPABILITIES = [
  { id: 'financial-intelligence', nameAr: 'الذكاء المالي وكشف التسرب', nameEn: 'Financial Intelligence' },
  { id: 'executive-decisions', nameAr: 'مركز القرارات التنفيذية', nameEn: 'Executive Decisions' },
  { id: 'data-quality', nameAr: 'ذكاء جودة البيانات', nameEn: 'Data Quality Intelligence' },
  { id: 'risk-intelligence', nameAr: 'ذكاء المخاطر المؤسسية', nameEn: 'Risk Intelligence' },
  { id: 'supplier-intelligence', nameAr: 'ذكاء الموردين والمشتريات', nameEn: 'Supplier Intelligence' },
  { id: 'customer-intelligence', nameAr: 'ذكاء العملاء والإيرادات', nameEn: 'Customer Intelligence' },
  { id: 'project-intelligence', nameAr: 'ذكاء المشاريع والعمليات', nameEn: 'Project Intelligence' },
  { id: 'ai-assistant', nameAr: 'المساعد الذكي للأعمال', nameEn: 'AI Business Assistant' }
];

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  locale,
  currentRoute,
  onNavigate
}) => {
  const isAr = locale === 'ar';
  const { user } = useAuth();

  // Core State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Telemetry Data
  const [overview, setOverview] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [packagesList, setPackagesList] = useState<any[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  // ── Modals & Action States ────────────────────────────────────────────────
  // 1. Create Tenant
  const [isCreateTenantOpen, setIsCreateTenantOpen] = useState(false);
  const [tenantForm, setTenantForm] = useState({
    nameAr: '',
    nameEn: '',
    slug: '',
    currency: 'SAR',
    timezone: 'Asia/Riyadh',
    adminEmail: '',
    adminPassword: '',
    adminNameAr: '',
    adminNameEn: '',
    packageId: 'plan_enterprise',
    subscriptionMonths: 12
  });

  // 2. Edit Tenant
  const [selectedTenantForEdit, setSelectedTenantForEdit] = useState<any>(null);
  const [editTenantForm, setEditTenantForm] = useState({
    nameAr: '',
    nameEn: '',
    slug: '',
    currency: 'SAR',
    timezone: 'Asia/Riyadh',
    status: 'active'
  });

  // 3. Manual Subscription Modal
  const [selectedTenantForSub, setSelectedTenantForSub] = useState<any>(null);
  const [manualSubForm, setManualSubForm] = useState({
    packageId: 'plan_enterprise',
    durationMonths: 12,
    amount: 120000,
    paymentMethod: 'BANK_TRANSFER',
    referenceNumber: '',
    notes: ''
  });

  // 4. Delete Tenant Confirmation
  const [selectedTenantForDelete, setSelectedTenantForDelete] = useState<any>(null);

  // 5. Suspend/Reactivate Org
  const [targetOrgStatus, setTargetOrgStatus] = useState<any>(null);
  const [suspendReason, setSuspendReason] = useState('');

  // 6. Create / Edit Package
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packageForm, setPackageForm] = useState({
    id: '',
    nameAr: '',
    nameEn: '',
    tierLevel: 1,
    monthlyPriceSar: 1500,
    annualPriceSar: 15000,
    maxBranches: 1,
    maxMembers: 5,
    monthlyRecordLimit: 100000,
    capabilities: ['financial-intelligence', 'executive-decisions', 'data-quality'] as string[]
  });
  const [selectedPackageForDelete, setSelectedPackageForDelete] = useState<string | null>(null);

  // 7. Create / Edit Platform User
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    nameAr: '',
    nameEn: '',
    isPlatformAdmin: false,
    status: 'active'
  });
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<any>(null);

  // 8. License Generator State
  const [licenseForm, setLicenseForm] = useState({
    customerSlug: '',
    customerName: '',
    edition: 'PRIVATE_EDITION',
    tier: 'plan_enterprise',
    maxMembers: 50
  });
  const [generatedLicense, setGeneratedLicense] = useState<any>(null);
  const [isGeneratingLicense, setIsGeneratingLicense] = useState(false);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [submittingAction, setSubmittingAction] = useState(false);

  // Fetch telemetry
  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ovData, orgsData, usersData, leadsData, auditData, pkgsData] = await Promise.all([
        api.getAdminOverview().catch(() => null),
        api.getAdminTenants().catch(() => ({ organizations: [] })),
        api.getAdminUsers().catch(() => ({ users: [] })),
        api.getAdminLeads().catch(() => ({ leads: [] })),
        api.getAdminAuditLogs().catch(() => ({ auditLogs: [] })),
        api.getPackages().catch(() => ({ packages: [] }))
      ]);

      if (ovData) setOverview(ovData);
      if (orgsData) setOrganizations(orgsData.organizations || []);
      if (usersData) setUsersList(usersData.users || []);
      if (leadsData) setLeads(leadsData.leads || []);
      if (auditData) setAuditLogs(auditData.auditLogs || []);
      if (pkgsData) setPackagesList(pkgsData.packages || []);
    } catch (err: any) {
      console.error('[Admin Data Load Error]:', err);
      setError(err.message || 'Failed to load administrative telemetry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Determine active view tab from route
  const getActiveTab = () => {
    if (currentRoute === ROUTES.ADMIN.ORGANIZATIONS) return 'organizations';
    if (currentRoute === ROUTES.ADMIN.PACKAGES) return 'packages';
    if (currentRoute === ROUTES.ADMIN.LICENSES) return 'licenses';
    if (currentRoute === ROUTES.ADMIN.USERS) return 'users';
    if (currentRoute === ROUTES.ADMIN.LEADS) return 'leads';
    if (currentRoute === ROUTES.ADMIN.AUDIT) return 'audit';
    return 'overview';
  };

  const activeTab = getActiveTab();

  // Permission Check
  const isOwner = Boolean(
    user?.isPlatformAdmin ||
    user?.email === 'saad@mikhlafi-labs.com' ||
    user?.email === 'owner@mikhlafi-labs.com'
  );

  if (!isOwner) {
    return (
      <div style={{ padding: '60px 24px', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-lg)', padding: '40px 30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ color: '#ef4444', fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>
            {isAr ? 'وصول محظور: منطقة مالك ومزود المنصة فقط' : 'ACCESS FORBIDDEN: PLATFORM OPERATOR ONLY'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            {isAr
              ? 'تتطلب هذه الواجهة رتبة مالك المنظومة (is_platform_admin = true). حسابك الحالي مقيد داخل مساحة عمل العميل ولا يمتلك تصريحاً للتحكم في المنصة.'
              : 'This interface requires platform operator authorization.'}
          </p>
          <button
            onClick={() => onNavigate(ROUTES.PUBLIC.HOME)}
            className="ctrl-btn"
            style={{ padding: '10px 20px', background: 'var(--accent-base)', color: '#fff' }}
          >
            {isAr ? 'العودة للموقع العام' : 'Return Home'}
          </button>
        </div>
      </div>
    );
  }

  // ── Handlers: Tenant Management ───────────────────────────────────────────
  const handleCreateTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantForm.nameAr || !tenantForm.slug || !tenantForm.adminEmail) {
      alert(isAr ? 'يرجى ملء الحقول الإلزامية: اسم الشركة، المعرف، والبريد الإلكتروني.' : 'Required fields missing.');
      return;
    }
    try {
      setSubmittingAction(true);
      await api.createTenant({
        ...tenantForm,
        nameEn: tenantForm.nameEn || tenantForm.nameAr,
        adminNameAr: tenantForm.adminNameAr || 'مسؤول المنشأة',
        adminNameEn: tenantForm.adminNameEn || 'Enterprise Admin',
        adminPassword: tenantForm.adminPassword || 'TempPass2026!'
      });
      setActionMessage(isAr ? `تم إنشاء المنشأة "${tenantForm.nameAr}" وتفعيل اشتراكها بنجاح!` : `Tenant created successfully!`);
      setIsCreateTenantOpen(false);
      setTenantForm({
        nameAr: '',
        nameEn: '',
        slug: '',
        currency: 'SAR',
        timezone: 'Asia/Riyadh',
        adminEmail: '',
        adminPassword: '',
        adminNameAr: '',
        adminNameEn: '',
        packageId: 'plan_enterprise',
        subscriptionMonths: 12
      });
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to create tenant.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleEditTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantForEdit) return;
    try {
      setSubmittingAction(true);
      await api.updateTenant(selectedTenantForEdit.id, editTenantForm);
      setActionMessage(isAr ? `تم تحديث بيانات الشركة "${editTenantForm.nameAr}" بنجاح!` : `Tenant updated successfully!`);
      setSelectedTenantForEdit(null);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update tenant.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDeleteTenantConfirm = async () => {
    if (!selectedTenantForDelete) return;
    try {
      setSubmittingAction(true);
      await api.deleteTenant(selectedTenantForDelete.id);
      setActionMessage(isAr ? `تم حذف المنشأة "${selectedTenantForDelete.name_ar}" نهائياً من المنظومة.` : `Tenant deleted.`);
      setSelectedTenantForDelete(null);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete tenant.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleToggleOrgStatus = async () => {
    if (!targetOrgStatus) return;
    try {
      setSubmittingAction(true);
      const newStatus = targetOrgStatus.currentStatus === 'active' ? 'suspended' : 'active';
      await api.updateTenantStatus(targetOrgStatus.id, newStatus, suspendReason || 'Operator Administrative Action');
      setActionMessage(
        isAr
          ? `تم تحديث حالة المؤسسة "${targetOrgStatus.name}" إلى: ${newStatus === 'active' ? 'نشط' : 'معلّق'}`
          : `Successfully updated organization status to: ${newStatus}`
      );
      setTargetOrgStatus(null);
      setSuspendReason('');
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleManualSubscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantForSub) return;
    try {
      setSubmittingAction(true);
      await api.addManualSubscription(selectedTenantForSub.id, {
        packageId: manualSubForm.packageId,
        durationMonths: Number(manualSubForm.durationMonths),
        amount: Number(manualSubForm.amount),
        paymentMethod: manualSubForm.paymentMethod,
        referenceNumber: manualSubForm.referenceNumber || `REF-${Date.now()}`,
        notes: manualSubForm.notes
      });
      setActionMessage(
        isAr
          ? `تم تفعيل وتوثيق الاشتراك اليدوي للشركة "${selectedTenantForSub.name_ar || selectedTenantForSub.name_en}" بنجاح!`
          : `Subscription provisioned successfully!`
      );
      setSelectedTenantForSub(null);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to provision subscription.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // ── Handlers: Package Management ──────────────────────────────────────────
  const handleOpenPackageModal = (pkg?: any) => {
    if (pkg) {
      setEditingPackageId(pkg.id);
      setPackageForm({
        id: pkg.id,
        nameAr: pkg.name_ar || '',
        nameEn: pkg.name_en || '',
        tierLevel: pkg.tier_level || 1,
        monthlyPriceSar: parseFloat(pkg.monthly_price_sar) || 0,
        annualPriceSar: parseFloat(pkg.annual_price_sar) || 0,
        maxBranches: pkg.max_branches || 1,
        maxMembers: pkg.max_members || 5,
        monthlyRecordLimit: pkg.monthly_record_limit || 100000,
        capabilities: Array.isArray(pkg.capabilities) ? pkg.capabilities : []
      });
    } else {
      setEditingPackageId(null);
      setPackageForm({
        id: `custom_tier_${Date.now()}`,
        nameAr: '',
        nameEn: '',
        tierLevel: 5,
        monthlyPriceSar: 5000,
        annualPriceSar: 50000,
        maxBranches: 10,
        maxMembers: 50,
        monthlyRecordLimit: 500000,
        capabilities: ['financial-intelligence', 'executive-decisions', 'data-quality']
      });
    }
    setIsPackageModalOpen(true);
  };

  const handlePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingAction(true);
      if (editingPackageId) {
        await api.updatePackage(editingPackageId, packageForm);
        setActionMessage(isAr ? `تم تحديث الباقة "${packageForm.nameAr}" بنجاح!` : `Package updated!`);
      } else {
        await api.createPackage(packageForm);
        setActionMessage(isAr ? `تم إنشاء الباقة الجديدة "${packageForm.nameAr}" بنجاح!` : `Package created!`);
      }
      setIsPackageModalOpen(false);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save package.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDeletePackageConfirm = async () => {
    if (!selectedPackageForDelete) return;
    try {
      setSubmittingAction(true);
      const res = await api.deletePackage(selectedPackageForDelete);
      setActionMessage(res.message || (isAr ? 'تم حذف أو تعطيل الباقة بنجاح.' : 'Package deleted.'));
      setSelectedPackageForDelete(null);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete package.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // ── Handlers: User Management ─────────────────────────────────────────────
  const handleOpenUserModal = (u?: any) => {
    if (u) {
      setEditingUserId(u.id);
      setUserForm({
        email: u.email,
        password: '',
        nameAr: u.name_ar || '',
        nameEn: u.name_en || '',
        isPlatformAdmin: Boolean(u.is_platform_admin),
        status: u.status || 'active'
      });
    } else {
      setEditingUserId(null);
      setUserForm({
        email: '',
        password: '',
        nameAr: '',
        nameEn: '',
        isPlatformAdmin: false,
        status: 'active'
      });
    }
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingAction(true);
      if (editingUserId) {
        await api.updatePlatformUser(editingUserId, {
          nameAr: userForm.nameAr,
          nameEn: userForm.nameEn,
          status: userForm.status,
          isPlatformAdmin: userForm.isPlatformAdmin,
          newPassword: userForm.password ? userForm.password : undefined
        });
        setActionMessage(isAr ? `تم تحديث بيانات المستخدم "${userForm.email}" بنجاح!` : `User updated!`);
      } else {
        if (!userForm.password) {
          alert(isAr ? 'كلمة المرور مطلوبة للمستخدم الجديد.' : 'Password is required.');
          return;
        }
        await api.createPlatformUser(userForm);
        setActionMessage(isAr ? `تم إنشاء الحساب الجديد "${userForm.email}" بنجاح!` : `User created!`);
      }
      setIsUserModalOpen(false);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save user.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDeleteUserConfirm = async () => {
    if (!selectedUserForDelete) return;
    try {
      setSubmittingAction(true);
      await api.deletePlatformUser(selectedUserForDelete.id);
      setActionMessage(isAr ? `تم حذف حساب المستخدم "${selectedUserForDelete.email}".` : `User deleted.`);
      setSelectedUserForDelete(null);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // ── Handlers: Offline Licenses ────────────────────────────────────────────
  const handleIssueLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseForm.customerSlug.trim() || !licenseForm.customerName.trim()) {
      alert(isAr ? 'يرجى كتابة اسم المنشأة ومعرفها (Slug)' : 'Customer name and slug are required.');
      return;
    }
    try {
      setIsGeneratingLicense(true);
      const res = await api.issueOfflineLicense({
        customerSlug: licenseForm.customerSlug.trim(),
        customerName: licenseForm.customerName.trim(),
        edition: licenseForm.edition,
        tier: licenseForm.tier,
        maxMembers: Number(licenseForm.maxMembers)
      });
      setGeneratedLicense(res.license);
      setActionMessage(isAr ? `تم توليد وتوقيع الترخيص المشفر للعميل: ${licenseForm.customerName}` : `License generated!`);
    } catch (err: any) {
      alert(err.message || 'Failed to generate license.');
    } finally {
      setIsGeneratingLicense(false);
    }
  };

  const handleDownloadLicense = () => {
    if (!generatedLicense) return;
    const blob = new Blob([JSON.stringify(generatedLicense, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mikhlafi-license-${generatedLicense.customerSlug || 'client'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleVerifyLicense = async () => {
    if (!verifyInput.trim()) return;
    try {
      setIsVerifying(true);
      setVerifyResult(null);
      const parsed = JSON.parse(verifyInput);
      const res = await api.verifyOfflineLicense(parsed);
      setVerifyResult(res);
    } catch (err: any) {
      setVerifyResult({ valid: false, error: err.message || 'Malformed JSON or invalid cryptographic signature.' });
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Handlers: Inbound Leads ───────────────────────────────────────────────
  const handleUpdateLeadStatus = async (leadId: string, status: string) => {
    try {
      await api.updateLeadStatus(leadId, status);
      setActionMessage(isAr ? 'تم تحديث حالة طلب العميل بنجاح.' : 'Lead status updated.');
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update lead.');
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 28px', color: '#f8fafc' }}>
      {/* Action Toast */}
      {actionMessage && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))',
            border: '1px solid #10b981',
            color: '#a7f3d0',
            padding: '14px 20px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
          }}
        >
          <span>✓ {actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            style={{ background: 'transparent', border: 'none', color: '#a7f3d0', cursor: 'pointer', fontSize: '16px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Grand Operator Control Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #111827 0%, #0b0f19 100%)',
          border: '1px solid rgba(220, 38, 38, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.45)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: '4px',
                background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                color: '#fff',
                fontWeight: 900,
                letterSpacing: '0.08em'
              }}
            >
              MASTER ROOT CONTROLLER
            </span>
            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
              PostgreSQL 16 Engine · Complete Platform Ownership
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
            {isAr ? 'غرفة عمليات وتحكم المالك الرسمي (Platform Owner Suite)' : 'MIKHLAFI LABS — Master Control Suite'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '6px 0 0 0' }}>
            {isAr
              ? 'التحكم الشامل بإضافة وتعديل وحذف الشركات، إدارة الباقات والأسعار، تسجيل وتفعيل الاشتراكات يدوياً، وتوليد التراخيص المشفرة.'
              : 'Enterprise tenant lifecycle, commercial pricing matrix, manual payments, and air-gapped cryptographic licensing.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsCreateTenantOpen(true)}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
            }}
          >
            <span>+</span>
            <span>{isAr ? 'إضافة شركة / عميل جديد' : 'Add New Client Tenant'}</span>
          </button>

          <button
            onClick={fetchAdminData}
            className="ctrl-btn"
            style={{ padding: '9px 16px', fontSize: '12px', fontWeight: 700 }}
            title="Refresh All Telemetry"
          >
            🔄 {isAr ? 'تحديث البيانات' : 'Refresh Telemetry'}
          </button>
        </div>
      </div>

      {/* Navigation Switch Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '14px',
          marginBottom: '24px',
          overflowX: 'auto'
        }}
      >
        <button
          onClick={() => onNavigate(ROUTES.ADMIN.OVERVIEW)}
          className={`filter-btn ${activeTab === 'overview' ? 'active' : ''}`}
          style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 800 }}
        >
          📊 {isAr ? 'نظرة عامة ومؤشرات المنصة' : 'Platform KPIs'}
        </button>

        <button
          onClick={() => onNavigate(ROUTES.ADMIN.ORGANIZATIONS)}
          className={`filter-btn ${activeTab === 'organizations' ? 'active' : ''}`}
          style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 800 }}
        >
          🏢 {isAr ? `إدارة الشركات والعملاء (${organizations.length})` : `Tenants (${organizations.length})`}
        </button>

        <button
          onClick={() => onNavigate(ROUTES.ADMIN.PACKAGES)}
          className={`filter-btn ${activeTab === 'packages' ? 'active' : ''}`}
          style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 800 }}
        >
          📦 {isAr ? `الباقات والأسعار (${packagesList.length || 4})` : `Packages & Pricing (${packagesList.length || 4})`}
        </button>

        <button
          onClick={() => onNavigate(ROUTES.ADMIN.LICENSES)}
          className={`filter-btn ${activeTab === 'licenses' ? 'active' : ''}`}
          style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 800 }}
        >
          🔑 {isAr ? 'مولّد التراخيص المشفرة' : 'Offline License Generator'}
        </button>

        <button
          onClick={() => onNavigate(ROUTES.ADMIN.USERS)}
          className={`filter-btn ${activeTab === 'users' ? 'active' : ''}`}
          style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 800 }}
        >
          👥 {isAr ? `المستخدمون والمشرفون (${usersList.length})` : `Global Users (${usersList.length})`}
        </button>

        <button
          onClick={() => onNavigate(ROUTES.ADMIN.LEADS)}
          className={`filter-btn ${activeTab === 'leads' ? 'active' : ''}`}
          style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 800 }}
        >
          📑 {isAr ? `طلبات العروض والعملاء المحتملين (${leads.length})` : `Inbound Leads (${leads.length})`}
        </button>

        <button
          onClick={() => onNavigate(ROUTES.ADMIN.AUDIT)}
          className={`filter-btn ${activeTab === 'audit' ? 'active' : ''}`}
          style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 800 }}
        >
          🛡️ {isAr ? `سجل التدقيق والأمان (${auditLogs.length})` : `Security Audit (${auditLogs.length})`}
        </button>
      </div>

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          🔄 {isAr ? 'جاري الاتصال بمحرك قاعدة البيانات PostgreSQL...' : 'Retrieving telemetry...'}
        </div>
      )}

      {error && (
        <div style={{ padding: '16px 20px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── TAB 1: OVERVIEW ─────────────────────────────────────────────────── */}
      {!loading && activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="kpi-card" style={{ borderTop: '3px solid #38bdf8', background: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                {isAr ? 'إجمالي الشركات المسجلة' : 'Total Tenant Organizations'}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#f8fafc', margin: '8px 0 4px 0' }}>
                {overview?.organizations?.total ?? organizations.length}
              </div>
              <div style={{ fontSize: '12px', color: '#10b981' }}>
                {overview?.organizations?.active ?? organizations.filter(o => o.status === 'active').length} {isAr ? 'نشطة ومفعلة' : 'Active'} ·{' '}
                <span style={{ color: '#ef4444' }}>
                  {overview?.organizations?.suspended ?? organizations.filter(o => o.status === 'suspended').length} {isAr ? 'معلّقة' : 'Suspended'}
                </span>
              </div>
            </div>

            <div className="kpi-card" style={{ borderTop: '3px solid #10b981', background: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                {isAr ? 'المستخدمون والحسابات النشطة' : 'Active User Accounts'}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#f8fafc', margin: '8px 0 4px 0' }}>
                {overview?.users?.total ?? usersList.length}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                {isAr ? 'عبر كافة الشركات والمستأجرين' : 'Across all organizations'}
              </div>
            </div>

            <div className="kpi-card" style={{ borderTop: '3px solid #f59e0b', background: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                {isAr ? 'إجمالي الباقات النشطة' : 'Active Package Tiers'}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#f59e0b', margin: '8px 0 4px 0' }}>
                {packagesList.length || 4}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                {isAr ? 'باقات الأعمال السحابية والسيادية' : 'Cloud and On-Premise tiers'}
              </div>
            </div>

            <div className="kpi-card" style={{ borderTop: '3px solid #a855f7', background: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                {isAr ? 'طلبات التواصل والعروض' : 'Inbound Inquiries'}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#f8fafc', margin: '8px 0 4px 0' }}>
                {overview?.leads?.total ?? leads.length}
              </div>
              <div style={{ fontSize: '12px', color: '#38bdf8' }}>
                {overview?.leads?.new ?? leads.filter(l => l.status === 'NEW').length} {isAr ? 'طلبات جديدة بانتظار التواصل' : 'New Inquiries'}
              </div>
            </div>
          </div>

          {/* Quick Action Matrix for Owner */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-md)',
              padding: '24px'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', color: '#f8fafc' }}>
              ⚡ {isAr ? 'إجراءات مالك المنظومة السريعة' : 'Owner Quick Command Actions'}
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsCreateTenantOpen(true)}
                className="ctrl-btn"
                style={{ padding: '10px 18px', fontWeight: 700, fontSize: '13px', background: 'rgba(220, 38, 38, 0.15)', borderColor: '#ef4444', color: '#fca5a5' }}
              >
                + {isAr ? 'إضافة عميل / شركة جديدة يدوياً' : 'Add New Client Tenant'}
              </button>
              <button
                onClick={() => handleOpenPackageModal()}
                className="ctrl-btn"
                style={{ padding: '10px 18px', fontWeight: 700, fontSize: '13px', background: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8', color: '#7dd3fc' }}
              >
                + {isAr ? 'إنشاء باقة اشتراك مخصصة' : 'Create Custom Package'}
              </button>
              <button
                onClick={() => handleOpenUserModal()}
                className="ctrl-btn"
                style={{ padding: '10px 18px', fontWeight: 700, fontSize: '13px', background: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981', color: '#6ee7b7' }}
              >
                + {isAr ? 'إضافة مشرف / مشغل للمنصة' : 'Add Platform Admin / User'}
              </button>
              <button
                onClick={() => onNavigate(ROUTES.ADMIN.LICENSES)}
                className="ctrl-btn"
                style={{ padding: '10px 18px', fontWeight: 700, fontSize: '13px', background: 'rgba(245, 158, 11, 0.15)', borderColor: '#f59e0b', color: '#fcd34d' }}
              >
                🔑 {isAr ? 'توليد ترخيص On-Premise مشفر' : 'Generate Air-Gapped License'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: TENANTS MANAGEMENT ───────────────────────────────────────── */}
      {!loading && activeTab === 'organizations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <input
              type="text"
              placeholder={isAr ? 'بحث باسم الشركة أو المعرف (Slug)...' : 'Search by name or slug...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                maxWidth: '380px',
                width: '100%',
                padding: '10px 14px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                fontSize: '13px'
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setIsCreateTenantOpen(true)}
                style={{
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>+</span>
                <span>{isAr ? 'إضافة شركة جديدة' : 'Add Tenant'}</span>
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'اسم الشركة' : 'Company Name'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'المعرف (Slug)' : 'Slug'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'باقة الاشتراك' : 'Package'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'نهاية الاشتراك' : 'Period End'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'الأعضاء / الفروع' : 'Members / Branches'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'الحالة' : 'Status'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8', textAlign: 'center' }}>{isAr ? 'إجراءات المالك' : 'Owner Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {organizations
                  .filter((org) =>
                    !searchTerm ||
                    org.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    org.name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    org.slug?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((org) => {
                    const isSuspended = org.status === 'suspended';
                    return (
                      <tr key={org.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 800, color: '#f8fafc' }}>
                          <div>{org.name_ar || org.name_en}</div>
                          {org.name_en && org.name_ar && (
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>{org.name_en}</div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#38bdf8' }}>
                          {org.slug}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '11px', fontWeight: 700 }}>
                            {org.package_name_ar || org.package_id || 'Enterprise'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: '#94a3b8' }}>
                          {org.current_period_end ? new Date(org.current_period_end).toLocaleDateString() : (isAr ? 'اشتراك دائم' : 'Permanent')}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '12px' }}>
                          {org.member_count || 1} {isAr ? 'أعضاء' : 'members'} · {org.branch_count || 1} {isAr ? 'فروع' : 'branches'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 800,
                              background: isSuspended ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: isSuspended ? '#ef4444' : '#10b981'
                            }}
                          >
                            {isSuspended ? (isAr ? 'معلّق' : 'SUSPENDED') : (isAr ? 'نشط' : 'ACTIVE')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {/* Manual Subscription Button */}
                            <button
                              onClick={() => {
                                setSelectedTenantForSub(org);
                                setManualSubForm({
                                  packageId: org.package_id || 'plan_enterprise',
                                  durationMonths: 12,
                                  amount: 120000,
                                  paymentMethod: 'BANK_TRANSFER',
                                  referenceNumber: `INV-${Date.now()}`,
                                  notes: `تجديد يدوي بواسطة مالك المنظومة`
                                });
                              }}
                              className="ctrl-btn"
                              style={{ fontSize: '11px', padding: '4px 8px', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                              title={isAr ? 'إضافة / تجديد اشتراك يدوي' : 'Manual Subscription'}
                            >
                              💳 {isAr ? 'اشتراك يدوي' : 'Subscription'}
                            </button>

                            {/* Edit Tenant Button */}
                            <button
                              onClick={() => {
                                setSelectedTenantForEdit(org);
                                setEditTenantForm({
                                  nameAr: org.name_ar || '',
                                  nameEn: org.name_en || '',
                                  slug: org.slug || '',
                                  currency: org.currency || 'SAR',
                                  timezone: org.timezone || 'Asia/Riyadh',
                                  status: org.status || 'active'
                                });
                              }}
                              className="ctrl-btn"
                              style={{ fontSize: '11px', padding: '4px 8px', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                              title={isAr ? 'تعديل بيانات الشركة' : 'Edit Tenant'}
                            >
                              ✏️ {isAr ? 'تعديل' : 'Edit'}
                            </button>

                            {/* Suspend / Reactivate */}
                            <button
                              onClick={() => setTargetOrgStatus({ id: org.id, name: org.name_ar || org.name_en, currentStatus: org.status })}
                              className="ctrl-btn"
                              style={{
                                fontSize: '11px',
                                padding: '4px 8px',
                                color: isSuspended ? '#10b981' : '#ef4444',
                                borderColor: isSuspended ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'
                              }}
                              title={isSuspended ? (isAr ? 'تنشيط' : 'Activate') : (isAr ? 'تعليق' : 'Suspend')}
                            >
                              {isSuspended ? '⚡ تنشيط' : '⏸️ تعليق'}
                            </button>

                            {/* Delete Tenant */}
                            <button
                              onClick={() => setSelectedTenantForDelete(org)}
                              className="ctrl-btn"
                              style={{ fontSize: '11px', padding: '4px 8px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                              title={isAr ? 'حذف المنشأة نهائياً' : 'Delete'}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: PACKAGES & PRICING ───────────────────────────────────────── */}
      {!loading && activeTab === 'packages' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0', color: '#f8fafc' }}>
                {isAr ? 'إدارة الباقات والتسعير والخدمات' : 'Commercial Packages & Pricing'}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                {isAr ? 'التحكم في أسعار الباقات بالريال السعودي، حدود المستخدمين والفروع، والخدمات المشمولة في كل باقة.' : 'Pricing matrix, member limits, and capability bindings.'}
              </p>
            </div>
            <button
              onClick={() => handleOpenPackageModal()}
              style={{
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              + {isAr ? 'إنشاء باقة مخصصة جديدة' : 'Add Custom Package'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {packagesList.map((pkg) => {
              const caps = Array.isArray(pkg.capabilities) ? pkg.capabilities : [];
              return (
                <div
                  key={pkg.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 800 }}>
                        TIER LEVEL {pkg.tier_level || 1}
                      </span>
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
                        {pkg.active_subscribers_count || 0} {isAr ? 'مشتركين نشطين' : 'subscribers'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', margin: '0 0 6px 0' }}>
                      {pkg.name_ar || pkg.name_en}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>{pkg.name_en}</div>

                    <div style={{ padding: '14px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{isAr ? 'السعر الشهري:' : 'Monthly:'}</span>
                        <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '14px' }}>
                          {parseFloat(pkg.monthly_price_sar || 0).toLocaleString()} SAR
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{isAr ? 'السعر السنوي:' : 'Annual:'}</span>
                        <span style={{ fontWeight: 800, color: '#10b981', fontSize: '14px' }}>
                          {parseFloat(pkg.annual_price_sar || 0).toLocaleString()} SAR
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                      <div>🏢 {isAr ? `الحد الأقصى للفروع: ${pkg.max_branches >= 999 ? 'غير محدود' : pkg.max_branches}` : `Max Branches: ${pkg.max_branches}`}</div>
                      <div>👥 {isAr ? `الحد الأقصى للمستخدمين: ${pkg.max_members >= 999 ? 'غير محدود' : pkg.max_members}` : `Max Members: ${pkg.max_members}`}</div>
                      <div>⚡ {isAr ? `الخدمات المفعلة: ${caps.length} من أصل 8 محركات ذكاء` : `Enabled Capabilities: ${caps.length}/8`}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                    <button
                      onClick={() => handleOpenPackageModal(pkg)}
                      className="ctrl-btn"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '12px', fontWeight: 700, color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                    >
                      ✏️ {isAr ? 'تعديل الأسعار والميزات' : 'Edit Package'}
                    </button>
                    <button
                      onClick={() => setSelectedPackageForDelete(pkg.id)}
                      className="ctrl-btn"
                      style={{ padding: '8px 12px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      title={isAr ? 'حذف الباقة' : 'Delete'}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 4: OFFLINE LICENSES ─────────────────────────────────────────── */}
      {!loading && activeTab === 'licenses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0' }}>
              🔑 {isAr ? 'مولّد التراخيص المشفرة للخوادم الخاصة (Offline / On-Premise Edition)' : 'Offline License Generator'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
              {isAr
                ? 'إصدار ملفات التراخيص المشفرة بتوقيع HMAC-SHA256 لتشغيل المنصة داخل خوادم العملاء المغلقة دون أي اتصال بالإنترنت.'
                : 'Generate tamper-proof cryptographic offline license manifests for sovereign on-premise deployments.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            {/* Form */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
                {isAr ? 'بيانات الترخيص المشفر للعميل' : 'License Parameters'}
              </h3>
              <form onSubmit={handleIssueLicense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'اسم المنشأة المرخصة:' : 'Customer Name:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'مثال: شركة التصنيع الوطنية' : 'e.g. National Industrialization Company'}
                    value={licenseForm.customerName}
                    onChange={(e) => setLicenseForm({ ...licenseForm, customerName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'معرف المنشأة (Slug):' : 'Customer Slug:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="national-ind-node"
                    value={licenseForm.customerSlug}
                    onChange={(e) => setLicenseForm({ ...licenseForm, customerSlug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                      {isAr ? 'الباقة المرخصة:' : 'Tier:'}
                    </label>
                    <select
                      value={licenseForm.tier}
                      onChange={(e) => setLicenseForm({ ...licenseForm, tier: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                    >
                      <option value="plan_enterprise">{isAr ? 'مؤسسات شاملة (8 خدمات)' : 'Enterprise Suite'}</option>
                      <option value="plan_sovereign">{isAr ? 'سيادية مخصصة (Sovereign)' : 'Sovereign Mesh'}</option>
                      <option value="plan_pro">{isAr ? 'متقدمة (5 خدمات)' : 'Professional'}</option>
                      <option value="plan_starter">{isAr ? 'ناشئة (3 خدمات)' : 'Starter'}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                      {isAr ? 'الحد الأقصى للمستخدمين:' : 'Max Members:'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={licenseForm.maxMembers}
                      onChange={(e) => setLicenseForm({ ...licenseForm, maxMembers: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingLicense}
                  style={{
                    padding: '12px 18px',
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  {isGeneratingLicense ? (isAr ? 'جاري التوليد والتشفير...' : 'Signing...') : (isAr ? 'إصدار وتوقيع الترخيص فوراً' : 'Issue Signed License')}
                </button>
              </form>
            </div>

            {/* Generated License Preview */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', marginBottom: '14px' }}>
                📄 {isAr ? 'ملف ومفتاح الترخيص المشفر' : 'Signed License Manifest'}
              </h3>
              {generatedLicense ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  <pre
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: '#a7f3d0',
                      overflowX: 'auto',
                      maxHeight: '260px'
                    }}
                  >
                    {JSON.stringify(generatedLicense, null, 2)}
                  </pre>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={handleDownloadLicense}
                      style={{ flex: 1, padding: '10px 14px', background: '#10b981', color: '#000', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 800, cursor: 'pointer' }}
                    >
                      💾 {isAr ? 'تنزيل ملف (license.json)' : 'Download license.json'}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(generatedLicense, null, 2));
                        alert(isAr ? 'تم نسخ الترخيص' : 'Copied');
                      }}
                      className="ctrl-btn"
                      style={{ padding: '10px 14px' }}
                    >
                      📋 {isAr ? 'نسخ' : 'Copy'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔐</div>
                  <div>{isAr ? 'لم يتم توليد أي ترخيص بعد' : 'No license issued in this session.'}</div>
                </div>
              )}
            </div>
          </div>

          {/* Sandbox Verification */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', marginBottom: '10px' }}>
              🔍 {isAr ? 'أداة التحقق من صحة التراخيص وفك التشفير' : 'Cryptographic License Verification Sandbox'}
            </h3>
            <textarea
              rows={3}
              placeholder={isAr ? 'الصق محتوى أي ملف ترخيص لفحص صحة التوقيع الرقمي...' : 'Paste license JSON manifest...'}
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '12px', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handleVerifyLicense}
                disabled={isVerifying || !verifyInput.trim()}
                className="ctrl-btn"
                style={{ padding: '8px 18px', background: '#38bdf8', color: '#000', fontWeight: 800 }}
              >
                {isVerifying ? (isAr ? 'جاري الفحص...' : 'Verifying...') : (isAr ? 'فحص صحة الترخيص' : 'Verify License')}
              </button>
              {verifyResult && (
                <div style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 800, background: verifyResult.valid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: verifyResult.valid ? '#10b981' : '#ef4444' }}>
                  {verifyResult.valid ? (isAr ? `✓ ترخيص موثق وصالح للعميل: ${verifyResult.license?.customerName}` : '✓ Valid License') : (isAr ? `✕ ترخيص غير صالح: ${verifyResult.error}` : '✕ Invalid')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: GLOBAL USERS ─────────────────────────────────────────────── */}
      {!loading && activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
              👥 {isAr ? 'إدارة المستخدمين وحسابات المشرفين' : 'Global Users Directory'}
            </h2>
            <button
              onClick={() => handleOpenUserModal()}
              style={{
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              + {isAr ? 'إضافة مستخدم / مشرف جديد' : 'Add User / Operator'}
            </button>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'الاسم' : 'Name'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'الرتبة والدور' : 'Role'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'الشركات المرتبطة' : 'Organizations'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'الحالة' : 'Status'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8', textAlign: 'center' }}>{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#f8fafc' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px' }}>{u.name_ar || u.name_en || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.is_platform_admin ? (
                        <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '11px', fontWeight: 900 }}>
                          ROOT ADMIN
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{isAr ? 'مستخدم عميل' : 'Client User'}</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#94a3b8' }}>
                      {u.organizations_summary || '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: u.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: u.status === 'active' ? '#10b981' : '#ef4444' }}>
                        {u.status === 'active' ? (isAr ? 'نشط' : 'ACTIVE') : (isAr ? 'معلّق' : 'SUSPENDED')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleOpenUserModal(u)}
                          className="ctrl-btn"
                          style={{ fontSize: '11px', padding: '4px 10px', color: '#38bdf8' }}
                        >
                          ✏️ {isAr ? 'تعديل / كلمة السر' : 'Edit'}
                        </button>
                        <button
                          onClick={() => setSelectedUserForDelete(u)}
                          className="ctrl-btn"
                          style={{ fontSize: '11px', padding: '4px 10px', color: '#ef4444' }}
                          disabled={u.email === user?.email}
                          title={u.email === user?.email ? (isAr ? 'لا يمكنك حذف حسابك الشخصي' : 'Cannot delete self') : ''}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 6: INBOUND LEADS ────────────────────────────────────────────── */}
      {!loading && activeTab === 'leads' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
            📑 {isAr ? 'طلبات العروض والتواصل (CRM)' : 'Inbound Demo Inquiries'}
          </h2>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'اسم العميل' : 'Name'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'الشركة' : 'Company'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'البريد والهاتف' : 'Contact'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'نوع الطلب' : 'Type'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'الرسالة' : 'Message'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                      {isAr ? 'لا توجد طلبات جديدة مسجلة حالياً.' : 'No inbound inquiries yet.'}
                    </td>
                  </tr>
                ) : (
                  leads.map((l) => (
                    <tr key={l.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#f8fafc' }}>{l.name}</td>
                      <td style={{ padding: '14px 16px' }}>{l.company_name || '—'}</td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#38bdf8' }}>
                        <div>{l.email}</div>
                        {l.phone && <div style={{ color: '#94a3b8' }}>{l.phone}</div>}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px' }}>{l.inquiry_type}</td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#94a3b8', maxWidth: '240px' }}>{l.message || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <select
                          value={l.status || 'NEW'}
                          onChange={(e) => handleUpdateLeadStatus(l.id, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            background: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-sm)',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 700
                          }}
                        >
                          <option value="NEW">{isAr ? 'جديد (NEW)' : 'NEW'}</option>
                          <option value="CONTACTED">{isAr ? 'تم التواصل' : 'CONTACTED'}</option>
                          <option value="CONVERTED">{isAr ? 'تم التعاقد' : 'CONVERTED'}</option>
                          <option value="ARCHIVED">{isAr ? 'مؤرشف' : 'ARCHIVED'}</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 7: SECURITY AUDIT TRAIL ─────────────────────────────────────── */}
      {!loading && activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
            🛡️ {isAr ? 'سجل التدقيق والأمان المؤسسي العام' : 'Security Audit Trail'}
          </h2>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'التاريخ والوقت' : 'Timestamp'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'الإجراء' : 'Action'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'المشغّل' : 'Operator'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'الشركة المستهدفة' : 'Target Tenant'}</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>IP</th>
                  <th style={{ padding: '14px 16px', color: '#94a3b8' }}>{isAr ? 'التفاصيل' : 'Details'}</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 16px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#f8fafc' }}>{log.action}</td>
                    <td style={{ padding: '14px 16px', color: '#38bdf8' }}>{log.operator_email || 'Root'}</td>
                    <td style={{ padding: '14px 16px', color: '#f59e0b' }}>{log.target_tenant_name_ar || '—'}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)' }}>{log.ip_address || '—'}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#94a3b8' }}>
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALS & ACTION OVERLAYS
      ══════════════════════════════════════════════════════════════════════════ */}

      {/* 1. Modal: Create Tenant */}
      {isCreateTenantOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #ef4444', borderRadius: 'var(--radius-lg)', maxWidth: '640px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', marginBottom: '8px' }}>
              🏢 {isAr ? 'إضافة شركة / عميل جديد وتفعيل حسابه' : 'Provision New Client Tenant'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>
              {isAr ? 'أدخل بيانات المنشأة ومسؤولها الأول لتوليد مساحة العمل وعزل بياناتها وتفعيل باقة الاشتراك فوراً.' : 'Enter organization details, executive admin, and initial plan.'}
            </p>

            <form onSubmit={handleCreateTenantSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'اسم المنشأة بالعربية *:' : 'Organization Name (Arabic) *:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'مثال: شركة التطوير العقاري' : 'e.g. Al-Bustan Real Estate'}
                    value={tenantForm.nameAr}
                    onChange={(e) => setTenantForm({ ...tenantForm, nameAr: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'اسم المنشأة بالإنجليزية:' : 'Organization Name (English):'}
                  </label>
                  <input
                    type="text"
                    placeholder="Al-Bustan Real Estate Co."
                    value={tenantForm.nameEn}
                    onChange={(e) => setTenantForm({ ...tenantForm, nameEn: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'معرف الرابط (Slug) *:' : 'Tenant Slug *:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="al-bustan-group"
                    value={tenantForm.slug}
                    onChange={(e) => setTenantForm({ ...tenantForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'العملة الأساسية:' : 'Currency:'}
                  </label>
                  <select
                    value={tenantForm.currency}
                    onChange={(e) => setTenantForm({ ...tenantForm, currency: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  >
                    <option value="SAR">SAR (ريال سعودي)</option>
                    <option value="USD">USD ($)</option>
                    <option value="AED">AED (درهم إماراتي)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #334155', paddingTop: '14px', marginTop: '4px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8', marginBottom: '10px' }}>
                  👤 {isAr ? 'بيانات المسؤول الأول للمنشأة (Executive Admin)' : 'Initial Executive Admin'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                      {isAr ? 'اسم المدير بالعربية:' : 'Admin Name (Arabic):'}
                    </label>
                    <input
                      type="text"
                      placeholder={isAr ? 'مثال: فهد الدوسري' : 'e.g. Fahad Al-Dossary'}
                      value={tenantForm.adminNameAr}
                      onChange={(e) => setTenantForm({ ...tenantForm, adminNameAr: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                      {isAr ? 'اسم المدير بالإنجليزية:' : 'Admin Name (English):'}
                    </label>
                    <input
                      type="text"
                      placeholder="Fahad Al-Dossary"
                      value={tenantForm.adminNameEn}
                      onChange={(e) => setTenantForm({ ...tenantForm, adminNameEn: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                      {isAr ? 'البريد الإلكتروني للدخول *:' : 'Admin Email *:'}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="ceo@company.com"
                      value={tenantForm.adminEmail}
                      onChange={(e) => setTenantForm({ ...tenantForm, adminEmail: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                      {isAr ? 'كلمة المرور المؤقتة:' : 'Initial Password:'}
                    </label>
                    <input
                      type="text"
                      placeholder="MikhlafiSecure2026!"
                      value={tenantForm.adminPassword}
                      onChange={(e) => setTenantForm({ ...tenantForm, adminPassword: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #334155', paddingTop: '14px', marginTop: '4px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#10b981', marginBottom: '10px' }}>
                  💳 {isAr ? 'باقة الاشتراك المبدئية' : 'Initial Subscription Plan'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                      {isAr ? 'اختر الباقة:' : 'Package:'}
                    </label>
                    <select
                      value={tenantForm.packageId}
                      onChange={(e) => setTenantForm({ ...tenantForm, packageId: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                    >
                      <option value="plan_enterprise">{isAr ? 'باقة المؤسسات الشاملة (Enterprise)' : 'Enterprise Suite'}</option>
                      <option value="plan_pro">{isAr ? 'باقة الشركات المتقدمة (Pro)' : 'Professional Suite'}</option>
                      <option value="plan_starter">{isAr ? 'باقة الأعمال الناشئة (Starter)' : 'Starter Suite'}</option>
                      <option value="plan_sovereign">{isAr ? 'باقة السيادة المخصصة (Sovereign)' : 'Sovereign Mesh'}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                      {isAr ? 'مدة الاشتراك:' : 'Duration:'}
                    </label>
                    <select
                      value={tenantForm.subscriptionMonths}
                      onChange={(e) => setTenantForm({ ...tenantForm, subscriptionMonths: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                    >
                      <option value={1}>{isAr ? 'شهر واحد' : '1 Month'}</option>
                      <option value={3}>{isAr ? '3 أشهر' : '3 Months'}</option>
                      <option value={6}>{isAr ? '6 أشهر' : '6 Months'}</option>
                      <option value={12}>{isAr ? 'سنة كاملة (12 شهر)' : '1 Year (12 Months)'}</option>
                      <option value={24}>{isAr ? 'سنتان (24 شهر)' : '2 Years (24 Months)'}</option>
                      <option value={36}>{isAr ? '3 سنوات (36 شهر)' : '3 Years (36 Months)'}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateTenantOpen(false)}
                  className="ctrl-btn"
                  style={{ padding: '9px 18px' }}
                  disabled={submittingAction}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  style={{
                    padding: '9px 22px',
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {submittingAction ? (isAr ? 'جاري الإنشاء...' : 'Creating...') : (isAr ? 'حفظ وتفعيل المنشأة' : 'Provision Tenant')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Edit Tenant */}
      {selectedTenantForEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #38bdf8', borderRadius: 'var(--radius-lg)', maxWidth: '520px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', marginBottom: '8px' }}>
              ✏️ {isAr ? `تعديل بيانات المنشأة: ${selectedTenantForEdit.name_ar || selectedTenantForEdit.name_en}` : `Edit Tenant`}
            </h3>

            <form onSubmit={handleEditTenantSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                  {isAr ? 'الاسم بالعربية:' : 'Name (Arabic):'}
                </label>
                <input
                  type="text"
                  required
                  value={editTenantForm.nameAr}
                  onChange={(e) => setEditTenantForm({ ...editTenantForm, nameAr: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                  {isAr ? 'الاسم بالإنجليزية:' : 'Name (English):'}
                </label>
                <input
                  type="text"
                  value={editTenantForm.nameEn}
                  onChange={(e) => setEditTenantForm({ ...editTenantForm, nameEn: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'المعرف (Slug):' : 'Slug:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editTenantForm.slug}
                    onChange={(e) => setEditTenantForm({ ...editTenantForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'الحالة:' : 'Status:'}
                  </label>
                  <select
                    value={editTenantForm.status}
                    onChange={(e) => setEditTenantForm({ ...editTenantForm, status: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  >
                    <option value="active">{isAr ? 'نشط (Active)' : 'Active'}</option>
                    <option value="suspended">{isAr ? 'معلّق (Suspended)' : 'Suspended'}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedTenantForEdit(null)}
                  className="ctrl-btn"
                  style={{ padding: '9px 18px' }}
                  disabled={submittingAction}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  style={{
                    padding: '9px 22px',
                    background: '#38bdf8',
                    color: '#000',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {submittingAction ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'تحديث البيانات' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Manual Subscription */}
      {selectedTenantForSub && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #10b981', borderRadius: 'var(--radius-lg)', maxWidth: '520px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', marginBottom: '8px' }}>
              💳 {isAr ? `إضافة / تجديد اشتراك يدوي للشركة: ${selectedTenantForSub.name_ar || selectedTenantForSub.name_en}` : 'Manual Subscription & Payment'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
              {isAr ? 'سجل دفعة جديدة لتفعيل أو تمديد اشتراك المنشأة وتوثيق سند الدفع في سجل التدقيق المالي.' : 'Record offline payment or grant subscription period.'}
            </p>

            <form onSubmit={handleManualSubscriptionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                  {isAr ? 'الباقة المطلوبة:' : 'Package Plan:'}
                </label>
                <select
                  value={manualSubForm.packageId}
                  onChange={(e) => setManualSubForm({ ...manualSubForm, packageId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                >
                  <option value="plan_enterprise">{isAr ? 'باقة المؤسسات الشاملة (Enterprise)' : 'Enterprise Suite'}</option>
                  <option value="plan_pro">{isAr ? 'باقة الشركات المتقدمة (Pro)' : 'Professional Suite'}</option>
                  <option value="plan_starter">{isAr ? 'باقة الأعمال الناشئة (Starter)' : 'Starter Suite'}</option>
                  <option value="plan_sovereign">{isAr ? 'باقة السيادة المخصصة (Sovereign)' : 'Sovereign Mesh'}</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'المدة الممنوحة:' : 'Duration:'}
                  </label>
                  <select
                    value={manualSubForm.durationMonths}
                    onChange={(e) => setManualSubForm({ ...manualSubForm, durationMonths: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  >
                    <option value={1}>{isAr ? 'شهر واحد' : '1 Month'}</option>
                    <option value={3}>{isAr ? '3 أشهر' : '3 Months'}</option>
                    <option value={6}>{isAr ? '6 أشهر' : '6 Months'}</option>
                    <option value={12}>{isAr ? 'سنة كاملة (12 شهر)' : '1 Year'}</option>
                    <option value={24}>{isAr ? 'سنتان (24 شهر)' : '2 Years'}</option>
                    <option value={36}>{isAr ? '3 سنوات (36 شهر)' : '3 Years'}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'المبلغ المستلم بالريال:' : 'Amount Received (SAR):'}
                  </label>
                  <input
                    type="number"
                    value={manualSubForm.amount}
                    onChange={(e) => setManualSubForm({ ...manualSubForm, amount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'طريقة السداد:' : 'Payment Method:'}
                  </label>
                  <select
                    value={manualSubForm.paymentMethod}
                    onChange={(e) => setManualSubForm({ ...manualSubForm, paymentMethod: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  >
                    <option value="BANK_TRANSFER">{isAr ? 'تحويل بنكي رسمي' : 'Bank Wire Transfer'}</option>
                    <option value="CASH">{isAr ? 'نقدي / كاش' : 'Cash'}</option>
                    <option value="CHEQUE">{isAr ? 'شيك مصدق' : 'Certified Cheque'}</option>
                    <option value="CREDIT_CARD">{isAr ? 'بطاقة ائتمان يدوية' : 'Card'}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'رقم الإيصال / الحوالة:' : 'Reference / Receipt #:'}
                  </label>
                  <input
                    type="text"
                    placeholder="WIRE-2026-X88"
                    value={manualSubForm.referenceNumber}
                    onChange={(e) => setManualSubForm({ ...manualSubForm, referenceNumber: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                  {isAr ? 'ملاحظات المشغّل (اختياري):' : 'Operator Notes:'}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? 'موافقة المالك على التجديد السنوي' : 'Approved by Platform Owner'}
                  value={manualSubForm.notes}
                  onChange={(e) => setManualSubForm({ ...manualSubForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedTenantForSub(null)}
                  className="ctrl-btn"
                  style={{ padding: '9px 18px' }}
                  disabled={submittingAction}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  style={{
                    padding: '9px 22px',
                    background: '#10b981',
                    color: '#000',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {submittingAction ? (isAr ? 'جاري التفعيل...' : 'Activating...') : (isAr ? 'تأكيد وتفعيل الاشتراك فوراً' : 'Confirm & Activate')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Delete Tenant Confirmation */}
      {selectedTenantForDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #ef4444', borderRadius: 'var(--radius-lg)', maxWidth: '480px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#ef4444', marginBottom: '8px' }}>
              ⚠️ {isAr ? `تأكيد حذف المنشأة نهائياً` : 'Confirm Permanent Tenant Deletion'}
            </h3>
            <p style={{ color: '#f8fafc', fontSize: '13px', lineHeight: 1.5, marginBottom: '14px' }}>
              {isAr
                ? `هل أنت متأكد تماماً من رغبتك في حذف المنشأة "${selectedTenantForDelete.name_ar || selectedTenantForDelete.name_en}"؟ سيتم حذف جميع الاشتراكات والعضويات المرتبطة بها نهائياً.`
                : `Are you sure you want to permanently delete tenant "${selectedTenantForDelete.name_en}"?`}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedTenantForDelete(null)}
                className="ctrl-btn"
                style={{ padding: '9px 18px' }}
                disabled={submittingAction}
              >
                {isAr ? 'تراجع' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteTenantConfirm}
                disabled={submittingAction}
                style={{ padding: '9px 22px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 800, cursor: 'pointer' }}
              >
                {submittingAction ? (isAr ? 'جاري الحذف...' : 'Deleting...') : (isAr ? 'نعم، احذف المنشأة' : 'Yes, Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Suspend/Reactivate Org */}
      {targetOrgStatus && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-lg)', maxWidth: '480px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              {targetOrgStatus.currentStatus === 'active'
                ? isAr ? `تأكيد تعليق المؤسسة: ${targetOrgStatus.name}` : `Suspend Organization: ${targetOrgStatus.name}`
                : isAr ? `تأكيد إعادة تنشيط المؤسسة: ${targetOrgStatus.name}` : `Reactivate Organization: ${targetOrgStatus.name}`}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
              {targetOrgStatus.currentStatus === 'active'
                ? isAr
                  ? 'سيتم حظر وصول أعضاء هذه المنظمة إلى واجهات النظام مؤقتاً.'
                  : 'All members of this organization will be temporarily blocked from API access.'
                : isAr
                  ? 'سيتم استعادة وصول المنظمة وأعضائها إلى مساحة العمل بشكل فوري.'
                  : 'Access to the workspace will be restored immediately.'}
            </p>
            <input
              type="text"
              placeholder={isAr ? 'سبب الإجراء (سيسجل في platform_audit_logs)...' : 'Operator reason'}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px', marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setTargetOrgStatus(null)} className="ctrl-btn" style={{ padding: '8px 16px' }} disabled={submittingAction}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleToggleOrgStatus}
                style={{ padding: '8px 18px', background: targetOrgStatus.currentStatus === 'active' ? '#ef4444' : '#10b981', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 800, cursor: 'pointer' }}
                disabled={submittingAction}
              >
                {submittingAction ? (isAr ? 'جاري التنفيذ...' : 'Executing...') : (isAr ? 'تأكيد الإجراء' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: Create / Edit Package */}
      {isPackageModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #38bdf8', borderRadius: 'var(--radius-lg)', maxWidth: '640px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', marginBottom: '8px' }}>
              📦 {editingPackageId ? (isAr ? 'تعديل بيانات الباقة والأسعار' : 'Edit Package Tier') : (isAr ? 'إنشاء باقة اشتراك جديدة' : 'Create Custom Package')}
            </h3>

            <form onSubmit={handlePackageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'اسم الباقة بالعربية:' : 'Package Name (Arabic):'}
                  </label>
                  <input
                    type="text"
                    required
                    value={packageForm.nameAr}
                    onChange={(e) => setPackageForm({ ...packageForm, nameAr: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'اسم الباقة بالإنجليزية:' : 'Package Name (English):'}
                  </label>
                  <input
                    type="text"
                    required
                    value={packageForm.nameEn}
                    onChange={(e) => setPackageForm({ ...packageForm, nameEn: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              {!editingPackageId && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'معرف الباقة البرمجي (ID):' : 'Package ID:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={packageForm.id}
                    onChange={(e) => setPackageForm({ ...packageForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '_') })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'السعر الشهري (SAR):' : 'Monthly Price (SAR):'}
                  </label>
                  <input
                    type="number"
                    value={packageForm.monthlyPriceSar}
                    onChange={(e) => setPackageForm({ ...packageForm, monthlyPriceSar: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'السعر السنوي (SAR):' : 'Annual Price (SAR):'}
                  </label>
                  <input
                    type="number"
                    value={packageForm.annualPriceSar}
                    onChange={(e) => setPackageForm({ ...packageForm, annualPriceSar: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'الحد الأقصى للمستخدمين:' : 'Max Members:'}
                  </label>
                  <input
                    type="number"
                    value={packageForm.maxMembers}
                    onChange={(e) => setPackageForm({ ...packageForm, maxMembers: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'الحد الأقصى للفروع:' : 'Max Branches:'}
                  </label>
                  <input
                    type="number"
                    value={packageForm.maxBranches}
                    onChange={(e) => setPackageForm({ ...packageForm, maxBranches: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Capabilities Checkboxes */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#38bdf8', marginBottom: '8px' }}>
                  ⚡ {isAr ? 'الخدمات ومحركات الذكاء المفعلة في هذه الباقة:' : 'Enabled Intelligence Engines:'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#1e293b', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  {ALL_CAPABILITIES.map((cap) => {
                    const isChecked = packageForm.capabilities.includes(cap.id);
                    return (
                      <label key={cap.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPackageForm({ ...packageForm, capabilities: [...packageForm.capabilities, cap.id] });
                            } else {
                              setPackageForm({ ...packageForm, capabilities: packageForm.capabilities.filter(c => c !== cap.id) });
                            }
                          }}
                        />
                        <span>{isAr ? cap.nameAr : cap.nameEn}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="ctrl-btn"
                  style={{ padding: '9px 18px' }}
                  disabled={submittingAction}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  style={{ padding: '9px 22px', background: '#38bdf8', color: '#000', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 800, cursor: 'pointer' }}
                >
                  {submittingAction ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ الباقة' : 'Save Package')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Package Confirmation */}
      {selectedPackageForDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #ef4444', borderRadius: 'var(--radius-lg)', maxWidth: '440px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#ef4444', marginBottom: '8px' }}>
              ⚠️ {isAr ? 'تأكيد حذف أو إيقاف الباقة' : 'Confirm Package Deletion'}
            </h3>
            <p style={{ color: '#f8fafc', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
              {isAr ? 'إذا كان هناك مشتركون نشطون على الباقة، فسيتم إيقافها فقط لمنع المشتركين الجدد مع حماية حسابات المشتركين الحاليين.' : 'Active subscribers will be protected.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setSelectedPackageForDelete(null)} className="ctrl-btn" style={{ padding: '8px 16px' }} disabled={submittingAction}>
                {isAr ? 'تراجع' : 'Cancel'}
              </button>
              <button onClick={handleDeletePackageConfirm} style={{ padding: '8px 18px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 800, cursor: 'pointer' }} disabled={submittingAction}>
                {submittingAction ? (isAr ? 'جاري التنفيذ...' : 'Deleting...') : (isAr ? 'تأكيد الحذف' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Create / Edit User */}
      {isUserModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #10b981', borderRadius: 'var(--radius-lg)', maxWidth: '520px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', marginBottom: '8px' }}>
              👤 {editingUserId ? (isAr ? 'تعديل بيانات المستخدم أو إعادة تعيين كلمة المرور' : 'Edit User Profile') : (isAr ? 'إضافة مستخدم أو مشرف منصة جديد' : 'Create Platform User')}
            </h3>

            <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                  {isAr ? 'البريد الإلكتروني:' : 'Email Address:'}
                </label>
                <input
                  type="email"
                  required
                  disabled={Boolean(editingUserId)}
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'الاسم بالعربية:' : 'Name (Arabic):'}
                  </label>
                  <input
                    type="text"
                    value={userForm.nameAr}
                    onChange={(e) => setUserForm({ ...userForm, nameAr: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'الاسم بالإنجليزية:' : 'Name (English):'}
                  </label>
                  <input
                    type="text"
                    value={userForm.nameEn}
                    onChange={(e) => setUserForm({ ...userForm, nameEn: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                  {editingUserId ? (isAr ? 'تعيين كلمة مرور جديدة (اتركه فارغاً لعدم التغيير):' : 'New Password (optional):') : (isAr ? 'كلمة المرور *:' : 'Password *:')}
                </label>
                <input
                  type="text"
                  placeholder="MikhlafiSecure2026!"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {isAr ? 'الحالة:' : 'Status:'}
                  </label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '13px' }}
                  >
                    <option value="active">{isAr ? 'نشط (Active)' : 'Active'}</option>
                    <option value="suspended">{isAr ? 'معلّق (Suspended)' : 'Suspended'}</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 800, color: '#f87171' }}>
                    <input
                      type="checkbox"
                      checked={userForm.isPlatformAdmin}
                      onChange={(e) => setUserForm({ ...userForm, isPlatformAdmin: e.target.checked })}
                    />
                    <span>{isAr ? 'مشرف منصة (Platform Admin)' : 'Platform Admin Privilege'}</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="ctrl-btn"
                  style={{ padding: '9px 18px' }}
                  disabled={submittingAction}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  style={{ padding: '9px 22px', background: '#10b981', color: '#000', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 800, cursor: 'pointer' }}
                >
                  {submittingAction ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ الحساب' : 'Save User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      {selectedUserForDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #ef4444', borderRadius: 'var(--radius-lg)', maxWidth: '440px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#ef4444', marginBottom: '8px' }}>
              ⚠️ {isAr ? 'تأكيد حذف حساب المستخدم' : 'Confirm User Deletion'}
            </h3>
            <p style={{ color: '#f8fafc', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
              {isAr ? `هل أنت متأكد من حذف الحساب "${selectedUserForDelete.email}" نهائياً؟` : `Delete ${selectedUserForDelete.email}?`}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setSelectedUserForDelete(null)} className="ctrl-btn" style={{ padding: '8px 16px' }} disabled={submittingAction}>
                {isAr ? 'تراجع' : 'Cancel'}
              </button>
              <button onClick={handleDeleteUserConfirm} style={{ padding: '8px 18px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 800, cursor: 'pointer' }} disabled={submittingAction}>
                {submittingAction ? (isAr ? 'جاري الحذف...' : 'Deleting...') : (isAr ? 'نعم، احذف' : 'Confirm Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
