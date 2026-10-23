// MIKHLAFI LABS — Organization, Branches & Employee Access Hub
// Full enterprise manual employee provisioning with protected passwords,
// granular RBAC roles, departments, branches, and password resets.

import React, { useCallback, useEffect, useState } from 'react';
import { LocaleMode } from '../../types';
import {
  IconOrganization,
  IconUsers,
  IconPlus,
  IconCheck,
  IconAlertTriangle,
  IconShield,
  IconRefresh,
  IconLock,
  IconKey,
  IconCopy,
  IconTrash
} from '../Icons';
import { useAuth } from '../../context/AuthContext';
import {
  api,
  MemberRecord,
  ProvisionedCredentials
} from '../../api/client';
import { EmptyState } from '../common/EmptyState';
import { PageHeader } from '../common/PageHeader';

interface OrganizationViewProps {
  locale: LocaleMode;
}

interface OrgProfile {
  id: string;
  slug?: string;
  name_en?: string;
  name_ar?: string;
  industry_type?: string;
  default_currency?: string;
  timezone?: string;
  status?: string;
}

interface OrgSnapshot {
  organization: OrgProfile | null;
  userRole: string;
  permissions: string[];
  branchCount: number;
  memberCount: number;
}

interface BranchRecord {
  id: string;
  code?: string;
  name_en?: string;
  name_ar?: string;
  city?: string;
  is_main_hq?: boolean;
  status?: string;
}

interface Feedback {
  message: string;
  type: 'success' | 'error';
}

export const OrganizationView: React.FC<OrganizationViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { user, isAuthenticated, tenant, openAuthModal } = useAuth();

  const [snapshot, setSnapshot] = useState<OrgSnapshot | null>(null);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // ── Provision Employee Modal State ─────────────────────────────────────────
  const [isProvisionOpen, setIsProvisionOpen] = useState<boolean>(false);
  const [empEmail, setEmpEmail] = useState<string>('');
  const [empPassword, setEmpPassword] = useState<string>('');
  const [empNameAr, setEmpNameAr] = useState<string>('');
  const [empNameEn, setEmpNameEn] = useState<string>('');
  const [empPhone, setEmpPhone] = useState<string>('');
  const [empRole, setEmpRole] = useState<string>('analyst');
  const [empDepartment, setEmpDepartment] = useState<string>('المالية والحسابات');
  const [empJobTitle, setEmpJobTitle] = useState<string>('محاسب / مدقق مالي');
  const [empBranchId, setEmpBranchId] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [provisionBusy, setProvisionBusy] = useState<boolean>(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  // Post-provisioning credentials reveal dialog
  const [credentialsDialog, setCredentialsDialog] = useState<ProvisionedCredentials | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState<boolean>(false);

  // ── Reset Password Modal State ─────────────────────────────────────────────
  const [resetModalMember, setResetModalMember] = useState<MemberRecord | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [resetBusy, setResetBusy] = useState<boolean>(false);
  const [resetResult, setResetResult] = useState<{ email: string; pass: string } | null>(null);
  const [copiedResetPass, setCopiedResetPass] = useState<boolean>(false);

  // ── Edit Member Role / Profile Modal State ─────────────────────────────────
  const [editModalMember, setEditModalMember] = useState<MemberRecord | null>(null);
  const [editRole, setEditRole] = useState<string>('viewer');
  const [editDepartment, setEditDepartment] = useState<string>('');
  const [editJobTitle, setEditJobTitle] = useState<string>('');
  const [editBranchId, setEditBranchId] = useState<string>('');
  const [editBusy, setEditBusy] = useState<boolean>(false);

  // ── Create Branch Modal State ──────────────────────────────────────────────
  const [isBranchOpen, setIsBranchOpen] = useState<boolean>(false);
  const [branchNameEn, setBranchNameEn] = useState<string>('');
  const [branchNameAr, setBranchNameAr] = useState<string>('');
  const [branchCode, setBranchCode] = useState<string>('');
  const [branchCity, setBranchCity] = useState<string>('');
  const [branchBusy, setBranchBusy] = useState<boolean>(false);
  const [branchError, setBranchError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!isAuthenticated) {
      setSnapshot(null);
      setMembers([]);
      setBranches([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [orgRes, memberRes, branchRes] = await Promise.all([
        api.getCurrentOrganization(),
        api.getMembers(),
        api.getBranches()
      ]);
      setSnapshot({
        organization: (orgRes.organization as OrgProfile) || null,
        userRole: orgRes.userRole,
        permissions: Array.isArray(orgRes.permissions) ? orgRes.permissions : [],
        branchCount: orgRes.branchCount,
        memberCount: orgRes.memberCount
      });
      setMembers(Array.isArray(memberRes.members) ? memberRes.members : []);
      setBranches(Array.isArray(branchRes.branches) ? branchRes.branches : []);
    } catch (err) {
      setSnapshot(null);
      setMembers([]);
      setBranches([]);
      setError(
        err instanceof Error && err.message
          ? err.message
          : (isAr ? 'تعذر جلب بيانات المؤسسة.' : 'Unable to load organization data.')
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAr]);

  useEffect(() => {
    loadAll();
  }, [loadAll, tenant?.organizationId]);

  const roleLabel = (role: string): string => {
    switch (role) {
      case 'org_owner':
        return isAr ? 'مالك المؤسسة' : 'Organization Owner';
      case 'org_admin':
        return isAr ? 'مسؤول المؤسسة' : 'Administrator';
      case 'manager':
        return isAr ? 'مدير عمليات' : 'Operations Manager';
      case 'analyst':
        return isAr ? 'محلل ومدقق' : 'Analyst / Auditor';
      case 'viewer':
        return isAr ? 'مستطلع (عرض فقط)' : 'Viewer (read-only)';
      default:
        return role || '—';
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let res = 'Mikhlafi@';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const openProvisionModal = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setEmpEmail('');
    setEmpPassword(generateRandomPassword());
    setEmpNameAr('');
    setEmpNameEn('');
    setEmpPhone('');
    setEmpRole('analyst');
    setEmpDepartment('المالية والحسابات');
    setEmpJobTitle('محاسب / مدقق مالي');
    setEmpBranchId(branches[0]?.id || '');
    setProvisionError(null);
    setIsProvisionOpen(true);
  };

  const handleProvisionEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = empEmail.trim().toLowerCase();
    if (!email) {
      setProvisionError(isAr ? 'يرجى إدخال البريد الإلكتروني للموظف.' : 'Email is required.');
      return;
    }

    setProvisionBusy(true);
    setProvisionError(null);
    try {
      const res = await api.provisionEmployee({
        email,
        password: empPassword.trim() || undefined,
        nameAr: empNameAr.trim() || undefined,
        nameEn: empNameEn.trim() || undefined,
        phone: empPhone.trim() || undefined,
        role: empRole,
        department: empDepartment.trim() || undefined,
        jobTitle: empJobTitle.trim() || undefined,
        branchId: empBranchId || null
      });

      if (res.success && res.credentials) {
        setIsProvisionOpen(false);
        setCredentialsDialog(res.credentials);
        setCopiedCredentials(false);
        const memberRes = await api.getMembers();
        setMembers(Array.isArray(memberRes.members) ? memberRes.members : []);
        setFeedback({
          type: 'success',
          message: isAr
            ? `تم تسجيل الموظف (${res.credentials.nameAr || email}) وتوليد بيانات الدخول المحمية بنجاح.`
            : `Employee (${email}) provisioned successfully with protected credentials.`
        });
      }
    } catch (err: any) {
      setProvisionError(err.message || (isAr ? 'تعذر إضافة الموظف.' : 'Failed to provision employee.'));
    } finally {
      setProvisionBusy(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalMember) return;
    setResetBusy(true);
    try {
      const res = await api.resetMemberPassword(resetModalMember.membership_id, newPasswordInput.trim() || undefined);
      if (res.success) {
        setResetResult({ email: res.email, pass: res.newPassword });
        setCopiedResetPass(false);
        setFeedback({
          type: 'success',
          message: isAr
            ? `تم تحديث كلمة المرور للموظف ${resetModalMember.name_ar || resetModalMember.email}.`
            : `Password reset successfully for ${resetModalMember.email}.`
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || (isAr ? 'تعذر إعادة تعيين كلمة المرور.' : 'Failed to reset password.')
      });
    } finally {
      setResetBusy(false);
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalMember) return;
    setEditBusy(true);
    try {
      await api.updateMember(editModalMember.membership_id, {
        role: editRole,
        department: editDepartment.trim() || undefined,
        jobTitle: editJobTitle.trim() || undefined,
        branchId: editBranchId || null
      });
      const memberRes = await api.getMembers();
      setMembers(Array.isArray(memberRes.members) ? memberRes.members : []);
      setEditModalMember(null);
      setFeedback({
        type: 'success',
        message: isAr ? 'تم تحديث بيانات وصلاحيات الموظف بنجاح.' : 'Member role updated successfully.'
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || (isAr ? 'تعذر تحديث الموظف.' : 'Failed to update member.')
      });
    } finally {
      setEditBusy(false);
    }
  };

  const handleRemoveMember = async (m: MemberRecord) => {
    const memberName = m.name_ar || m.name_en || m.email;
    if (!window.confirm(isAr ? `هل أنت متأكد من حذف وإلغاء وصول الموظف (${memberName})؟` : `Remove employee (${memberName})?`)) return;
    try {
      await api.removeMember(m.membership_id);
      setMembers((prev) => prev.filter((item) => item.membership_id !== m.membership_id));
      setFeedback({
        type: 'success',
        message: isAr ? `تم حذف الموظف (${memberName}) بنجاح.` : `Member removed successfully.`
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || (isAr ? 'تعذر حذف الموظف.' : 'Failed to remove member.')
      });
    }
  };

  const copyToClipboard = (text: string, onCopied: () => void) => {
    navigator.clipboard.writeText(text);
    onCopied();
    setTimeout(() => {
      setCopiedCredentials(false);
      setCopiedResetPass(false);
    }, 4000);
  };

  const openBranchModal = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setBranchNameEn('');
    setBranchNameAr('');
    setBranchCode('');
    setBranchCity('');
    setBranchError(null);
    setIsBranchOpen(true);
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchNameEn.trim()) {
      setBranchError(isAr ? 'اسم الفرع (بالإنجليزية) مطلوب.' : 'Branch name (English) is required.');
      return;
    }

    setBranchBusy(true);
    setBranchError(null);
    try {
      const res = await api.createBranch({
        nameEn: branchNameEn.trim(),
        nameAr: branchNameAr.trim() || undefined,
        code: branchCode.trim() || undefined,
        city: branchCity.trim() || undefined
      });
      if (res.success && res.branch) {
        const branchRes = await api.getBranches();
        setBranches(Array.isArray(branchRes.branches) ? branchRes.branches : []);
        setIsBranchOpen(false);
        setFeedback({
          type: 'success',
          message: isAr
            ? `تم إنشاء الفرع (${branchNameEn.trim()}) وتسجيله ضمن مؤسستك.`
            : `Branch (${branchNameEn.trim()}) created and registered.`
        });
      }
    } catch (err: any) {
      setBranchError(err.message || (isAr ? 'تعذر إنشاء الفرع.' : 'Failed to create branch.'));
    } finally {
      setBranchBusy(false);
    }
  };

  const orgName = snapshot?.organization
    ? (isAr
        ? snapshot.organization.name_ar || snapshot.organization.name_en
        : snapshot.organization.name_en || snapshot.organization.name_ar)
    : tenant
      ? (isAr ? tenant.orgNameAr || tenant.orgNameEn : tenant.orgNameEn || tenant.orgNameAr)
      : '';

  return (
    <div className="platform-page-container">
      <PageHeader
        locale={locale}
        title={isAr ? 'إدارة الموظفين والفروع التشغيلية' : 'Employees, Workforce & Operating Branches'}
        subtitle={isAr ? `إضافة منسوبي (${orgName}) يدوياً وتوليد حساباتهم وكلمات السر المحمية وتحديد أقسامهم ومستويات صلاحياتهم` : `Provision employees for (${orgName}), assign secure credentials, departments, and branch-level permissions`}
        icon={<IconOrganization size={20} />}
        action={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={openProvisionModal} className="ml-btn ml-btn--primary ml-btn--sm">
              <IconPlus size={13} />
              <span>{isAr ? 'إضافة موظف جديد' : 'Add Employee'}</span>
            </button>
            <button onClick={openBranchModal} className="ml-btn ml-btn--subtle ml-btn--sm">
              <IconPlus size={13} />
              <span>{isAr ? 'إضافة فرع' : 'Add branch'}</span>
            </button>
            <button onClick={loadAll} className="ml-btn ml-btn--subtle ml-btn--sm" title={isAr ? 'تحديث' : 'Refresh'}>
              <IconRefresh size={13} />
            </button>
          </div>
        }
      />

      {feedback && (
        <div
          role="status"
          className={`ml-banner ${feedback.type === 'success' ? 'ml-banner--success' : 'ml-banner--danger'}`}
          style={{ marginBottom: '1.25rem' }}
        >
          {feedback.type === 'success' ? <IconCheck size={16} /> : <IconAlertTriangle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
          {isAr ? 'جارِ تحميل سجلات الموظفين والمؤسسة…' : 'Loading organization & workforce data…'}
        </div>
      ) : error ? (
        <div className="ml-banner ml-banner--danger" style={{ marginBottom: '1.25rem' }}>
          <IconAlertTriangle size={16} />
          <span>{error}</span>
        </div>
      ) : (
        <>
          {/* Organization Profile Overview Card */}
          <section className="ml-panel" style={{ marginBottom: '1.5rem' }}>
            <div className="ml-panel__head">
              <div className="vc-title-group">
                <div className="vc-title-group__title">{isAr ? 'بيانات المؤسسة المعتمدة' : 'Organization profile'}</div>
                <div className="vc-title-group__meta">{isAr ? 'معزولة بنظام Multi-Tenancy آمن' : 'Isolated Multi-Tenant Node'}</div>
              </div>
              <span className="ml-badge ml-badge--success">
                <IconShield size={12} style={{ marginInlineEnd: 4 }} />
                {isAr ? 'مساحة عمليات مشفرة' : 'Encrypted Workspace'}
              </span>
            </div>
            <div className="ml-panel__body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="vc-stat-block">
                  <div className="vc-stat-block__label">{isAr ? 'اسم المنشأة' : 'Entity Name'}</div>
                  <div className="vc-stat-block__value" style={{ fontSize: '1.15rem' }}>{orgName || '—'}</div>
                </div>
                <div className="vc-stat-block">
                  <div className="vc-stat-block__label">{isAr ? 'إجمالي الموظفين المسجلين' : 'Total Provisioned Employees'}</div>
                  <div className="vc-stat-block__value">{members.length}</div>
                </div>
                <div className="vc-stat-block">
                  <div className="vc-stat-block__label">{isAr ? 'الفروع التشغيلية' : 'Operating Branches'}</div>
                  <div className="vc-stat-block__value">{branches.length}</div>
                </div>
                <div className="vc-stat-block">
                  <div className="vc-stat-block__label">{isAr ? 'عملة القيود' : 'Base Currency'}</div>
                  <div className="vc-stat-block__value">{snapshot?.organization?.default_currency || 'SAR'}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Members & Employees Section */}
          <section className="ml-panel" style={{ marginBottom: '1.5rem' }}>
            <div className="ml-panel__head">
              <div className="vc-title-group">
                <div className="vc-title-group__title">{isAr ? 'منسوبو المؤسسة والصلاحيات وكلمات المرور' : 'Workforce & Role Management'}</div>
                <div className="vc-title-group__meta">
                  {isAr ? `${members.length} موظف مسجل` : `${members.length} provisioned employees`}
                </div>
              </div>
              <button onClick={openProvisionModal} className="ml-btn ml-btn--primary ml-btn--sm">
                <IconPlus size={13} />
                <span>{isAr ? 'إضافة موظف يدوي' : 'Add Employee'}</span>
              </button>
            </div>
            <div className="ml-panel__body">
              {members.length === 0 ? (
                <EmptyState
                  compact
                  icon={<IconUsers size={30} />}
                  title={isAr ? 'لم تتم إضافة أي موظف بعد' : 'No employees provisioned yet'}
                  description={
                    isAr
                      ? 'يمكنك الآن إضافة الموظفين يدوياً وتحديد يوزراتهم وكلمات السر المحمية وأقسامهم.'
                      : 'You can now manually provision employees with secure credentials and departments.'
                  }
                  action={
                    <button onClick={openProvisionModal} className="ml-btn ml-btn--primary ml-btn--sm">
                      <IconPlus size={13} />
                      <span>{isAr ? 'إضافة موظف' : 'Add Employee'}</span>
                    </button>
                  }
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {members.map((m) => {
                    const isSelf = m.user_id === user?.id;
                    const displayName = isAr
                      ? m.name_ar || m.name_en || m.email
                      : m.name_en || m.name_ar || m.email;

                    return (
                      <article
                        key={m.membership_id || m.user_id}
                        className="record-row vc-row"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px',
                          padding: '14px 18px',
                          background: 'rgba(255,255,255,0.02)',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border, rgba(255,255,255,0.06))'
                        }}
                      >
                        {/* Member Identity & Details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 240 }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: 'var(--color-brand-primary, #0D9488)',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.95rem'
                            }}
                          >
                            {displayName.substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--color-text-primary, #FFF)' }}>
                              {displayName} {isSelf && <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>({isAr ? 'أنت' : 'You'})</span>}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary, #8892B0)', marginTop: '2px' }}>
                              {[m.email, m.phone, m.branch_name || m.branch_name_ar].filter(Boolean).join(' · ')}
                            </div>
                          </div>
                        </div>

                        {/* Department & Role Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {m.job_title && (
                            <span className="ml-badge" style={{ background: 'rgba(255,255,255,0.06)' }}>
                              {m.job_title}
                            </span>
                          )}
                          {m.department && (
                            <span className="ml-badge" style={{ background: 'rgba(13, 148, 136, 0.15)', color: 'var(--color-brand-primary, #0D9488)' }}>
                              {m.department}
                            </span>
                          )}
                          <span className="ml-badge ml-badge--accent">{roleLabel(m.role)}</span>
                          <span className={`ml-badge ${(m.status || 'active') === 'active' ? 'ml-badge--success' : ''}`}>
                            <span className="ml-dot" />
                            {(m.status || 'active').toUpperCase()}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setResetModalMember(m);
                              setNewPasswordInput(generateRandomPassword());
                              setResetResult(null);
                            }}
                            className="ml-btn ml-btn--subtle ml-btn--sm"
                            title={isAr ? 'إعادة تعيين كلمة السر' : 'Reset password'}
                          >
                            <IconKey size={13} />
                            <span>{isAr ? 'كلمة المرور' : 'Password'}</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditModalMember(m);
                              setEditRole(m.role);
                              setEditDepartment(m.department || '');
                              setEditJobTitle(m.job_title || '');
                              setEditBranchId(m.branch_id || '');
                            }}
                            className="ml-btn ml-btn--subtle ml-btn--sm"
                            title={isAr ? 'تعديل الصلاحيات والقسم' : 'Edit role and department'}
                          >
                            <IconShield size={13} />
                            <span>{isAr ? 'تعديل الصلاحيات' : 'Edit Role'}</span>
                          </button>

                          {!isSelf && m.role !== 'org_owner' && (
                            <button
                              onClick={() => handleRemoveMember(m)}
                              className="ml-btn ml-btn--subtle ml-btn--sm"
                              style={{ color: 'var(--color-danger, #EF4444)' }}
                              title={isAr ? 'حذف الموظف' : 'Remove member'}
                            >
                              <IconTrash size={13} />
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Operating Branches */}
          <section className="ml-panel">
            <div className="ml-panel__head">
              <div className="vc-title-group">
                <div className="vc-title-group__title">{isAr ? 'الفروع التشغيلية والمواقع' : 'Operating branches & locations'}</div>
                <div className="vc-title-group__meta">
                  {isAr ? `${branches.length} فرع مسجل` : `${branches.length} branch${branches.length === 1 ? '' : 'es'}`}
                </div>
              </div>
              <button onClick={openBranchModal} className="ml-btn ml-btn--subtle ml-btn--sm">
                <IconPlus size={13} />
                <span>{isAr ? 'إضافة فرع' : 'Add branch'}</span>
              </button>
            </div>
            <div className="ml-panel__body">
              {branches.length === 0 ? (
                <EmptyState
                  compact
                  icon={<IconOrganization size={30} />}
                  title={isAr ? 'لا توجد فروع مسجلة' : 'No branches registered'}
                  description={
                    isAr
                      ? 'تظهر الفروع هنا فور إنشائها، وتُستخدم لعزل السجلات والصلاحيات لكل موقع تشغيلي.'
                      : 'Branches appear here as soon as they are created.'
                  }
                  action={
                    <button onClick={openBranchModal} className="ml-btn ml-btn--primary ml-btn--sm">
                      <IconPlus size={13} />
                      <span>{isAr ? 'إضافة فرع' : 'Add branch'}</span>
                    </button>
                  }
                />
              ) : (
                <div className="record-list">
                  {branches.map((b) => (
                    <article key={b.id} className="record-row vc-row">
                      <div className="record-row__main">
                        <div className="record-row__title">
                          {isAr ? b.name_ar || b.name_en || b.id : b.name_en || b.name_ar || b.id}
                        </div>
                        <div className="record-row__meta">
                          {[
                            b.city,
                            b.is_main_hq ? (isAr ? 'المقر الرئيسي' : 'Headquarters') : undefined
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                      </div>
                      <div className="record-row__actions">
                        {b.code && <span className="ml-badge">{b.code}</span>}
                        <span className={`ml-badge ${(b.status || 'active') === 'active' ? 'ml-badge--success' : ''}`}>
                          <span className="ml-dot" />
                          {(b.status || 'active').toUpperCase()}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ─── MODAL 1: PROVISION EMPLOYEE ─── */}
      {isProvisionOpen && (
        <div
          className="ml-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && !provisionBusy && setIsProvisionOpen(false)}
        >
          <div className="ml-modal" style={{ maxWidth: '620px' }}>
            <div className="ml-modal__head">
              <h2 className="vc-modal-title">{isAr ? 'إضافة موظف وتعيين بيانات الدخول والصلاحيات' : 'Provision Employee & Assign Credentials'}</h2>
              <p className="vc-modal-desc">
                {isAr
                  ? 'قم بإدخال بيانات الموظف وتعيين كلمة السر المحمية وصلاحيات وصوله لنظام الشركة.'
                  : 'Enter employee profile details and assign protected password and workspace permissions.'}
              </p>
            </div>

            <form onSubmit={handleProvisionEmployee}>
              <div className="ml-modal__body">
                {/* Names */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'الاسم بالكامل (بالعربية)' : 'Full Name (Arabic)'}</label>
                    <input
                      type="text"
                      className="ml-input"
                      placeholder="مثال: سعد المخلافي"
                      value={empNameAr}
                      onChange={(e) => setEmpNameAr(e.target.value)}
                    />
                  </div>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'الاسم بالكامل (بالإنجليزية)' : 'Full Name (English)'}</label>
                    <input
                      type="text"
                      className="ml-input"
                      placeholder="e.g. Saad Almikhlafi"
                      value={empNameEn}
                      onChange={(e) => setEmpNameEn(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'البريد الإلكتروني / اسم المستخدم' : 'Email / Username'} *</label>
                    <input
                      type="email"
                      required
                      className="ml-input"
                      placeholder="employee@yourcompany.com"
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'رقم الجوال' : 'Phone Number'}</label>
                    <input
                      type="text"
                      className="ml-input"
                      placeholder="+966 5X XXX XXXX"
                      value={empPhone}
                      onChange={(e) => setEmpPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Department and Job Title */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'الإدارة / القسم' : 'Department'}</label>
                    <input
                      type="text"
                      className="ml-input"
                      placeholder="مثال: الإدارة المالية، التدقيق الداخلي"
                      value={empDepartment}
                      onChange={(e) => setEmpDepartment(e.target.value)}
                    />
                  </div>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'المسمى الوظيفي' : 'Job Title'}</label>
                    <input
                      type="text"
                      className="ml-input"
                      placeholder="مثال: رئيس الحسابات، مدقق مشتريات"
                      value={empJobTitle}
                      onChange={(e) => setEmpJobTitle(e.target.value)}
                    />
                  </div>
                </div>

                {/* Role and Branch */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'الدور ومستوى الصلاحيات' : 'Role & Permissions'}</label>
                    <select
                      className="ml-select"
                      value={empRole}
                      onChange={(e) => setEmpRole(e.target.value)}
                    >
                      <option value="analyst">{isAr ? 'محلل ومدقق (مراجعة القيود والفروقات وإعداد التقارير)' : 'Analyst / Auditor'}</option>
                      <option value="manager">{isAr ? 'مدير عمليات (إدارة القيود واعتماد القرارات والمهام)' : 'Operations Manager'}</option>
                      <option value="org_admin">{isAr ? 'مسؤول المنشأة (إدارة الموظفين والفروع والمصادر)' : 'Organization Administrator'}</option>
                      <option value="viewer">{isAr ? 'مستطلع (عرض التقارير والبيانات المعتمدة فقط)' : 'Viewer (read-only)'}</option>
                    </select>
                  </div>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'الفرع التشغيلي' : 'Assigned Branch'}</label>
                    <select
                      className="ml-select"
                      value={empBranchId}
                      onChange={(e) => setEmpBranchId(e.target.value)}
                    >
                      <option value="">{isAr ? 'جميع الفروع / المقر الرئيسي' : 'All Branches / HQ'}</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {isAr ? b.name_ar || b.name_en : b.name_en || b.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Protected Password Section */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: 'rgba(13, 148, 136, 0.08)',
                    border: '1px solid rgba(13, 148, 136, 0.25)',
                    marginTop: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="ml-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconLock size={14} color="var(--color-brand-primary, #0D9488)" />
                      <span style={{ fontWeight: 700 }}>{isAr ? 'تعيين كلمة السر المحمية للموظف' : 'Protected Password'}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setEmpPassword(generateRandomPassword())}
                      className="ml-btn ml-btn--subtle ml-btn--sm"
                      style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                    >
                      <IconRefresh size={12} />
                      <span>{isAr ? 'توليد كلمة سر آمنة' : 'Generate Secure'}</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="ml-input"
                      style={{ fontFamily: 'monospace', letterSpacing: '1px' }}
                      value={empPassword}
                      onChange={(e) => setEmpPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="ml-btn ml-btn--subtle"
                      style={{ fontSize: '0.78rem' }}
                    >
                      {showPassword ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'إظهار' : 'Show')}
                    </button>
                  </div>
                  <span className="ml-hint" style={{ marginTop: '6px', display: 'block' }}>
                    {isAr
                      ? 'يتم تشفير كلمة المرور فوراً بخوارزمية scrypt المشددة. ستتمكن من نسخها في الخطوة التالية لتسليمها للموظف.'
                      : 'Password is securely hashed via scrypt. You will be able to copy the login card upon creation.'}
                  </span>
                </div>

                {provisionError && <div className="ml-error" style={{ marginTop: '10px' }}>{provisionError}</div>}
              </div>

              <div className="ml-modal__foot vc-modal-foot">
                <button
                  type="button"
                  onClick={() => setIsProvisionOpen(false)}
                  disabled={provisionBusy}
                  className="ml-btn ml-btn--subtle"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={provisionBusy} className="ml-btn ml-btn--primary">
                  <IconCheck size={14} />
                  <span>{provisionBusy ? (isAr ? 'جارِ التسجيل والتشفير…' : 'Provisioning…') : (isAr ? 'تأكيد إضافة الموظف' : 'Save Employee')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: CREDENTIALS READY DIALOG (POST-PROVISIONING) ─── */}
      {credentialsDialog && (
        <div className="ml-modal-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && setCredentialsDialog(null)}>
          <div className="ml-modal" style={{ maxWidth: '500px' }}>
            <div className="ml-modal__head" style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px'
                }}
              >
                <IconCheck size={24} />
              </div>
              <h2 className="vc-modal-title">{isAr ? 'تم إنشاء حساب الموظف بنجاح' : 'Employee Credentials Ready'}</h2>
              <p className="vc-modal-desc">
                {isAr
                  ? 'يمكنك نسخ بطاقة تسجيل الدخول وتسليمها للموظف للبدء في استخدام النظام.'
                  : 'Copy the login credentials card to share with the employee.'}
              </p>
            </div>

            <div className="ml-modal__body">
              <div
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, rgba(255,255,255,0.12))',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--color-text-tertiary)' }}>{isAr ? 'اسم الموظف:' : 'Employee:'}</span>
                  <strong style={{ color: '#FFF' }}>{credentialsDialog.nameAr || credentialsDialog.nameEn}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--color-text-tertiary)' }}>{isAr ? 'البريد / اسم المستخدم:' : 'Email / Login:'}</span>
                  <strong style={{ color: 'var(--color-brand-primary, #0D9488)', fontFamily: 'monospace' }}>
                    {credentialsDialog.email}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--color-text-tertiary)' }}>{isAr ? 'كلمة المرور المحمية:' : 'Password:'}</span>
                  <strong style={{ color: '#F59E0B', fontFamily: 'monospace', letterSpacing: '1px' }}>
                    {credentialsDialog.password}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-tertiary)' }}>{isAr ? 'الدور والقسم:' : 'Role / Dept:'}</span>
                  <strong style={{ color: '#FFF' }}>
                    {roleLabel(credentialsDialog.role)} {credentialsDialog.department ? `(${credentialsDialog.department})` : ''}
                  </strong>
                </div>
              </div>
            </div>

            <div className="ml-modal__foot vc-modal-foot" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `بيانات تسجيل الدخول إلى منصة مخلافي لابز:\nالبريد الإلكتروني: ${credentialsDialog.email}\nكلمة المرور: ${credentialsDialog.password}\nالرابط: https://mkhlafilabs-one.vercel.app/login`,
                    () => setCopiedCredentials(true)
                  )
                }
                className="ml-btn ml-btn--primary"
                style={{ flex: 1 }}
              >
                <IconCopy size={14} />
                <span>{copiedCredentials ? (isAr ? 'تم نسخ البيانات بنجاح!' : 'Copied!') : (isAr ? 'نسخ بيانات الدخول للموظف' : 'Copy Credentials')}</span>
              </button>
              <button
                type="button"
                onClick={() => setCredentialsDialog(null)}
                className="ml-btn ml-btn--subtle"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: RESET EMPLOYEE PASSWORD ─── */}
      {resetModalMember && (
        <div className="ml-modal-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && !resetBusy && setResetModalMember(null)}>
          <div className="ml-modal" style={{ maxWidth: '480px' }}>
            <div className="ml-modal__head">
              <h2 className="vc-modal-title">{isAr ? 'إعادة تعيين كلمة المرور' : 'Reset Employee Password'}</h2>
              <p className="vc-modal-desc">
                {isAr
                  ? `تعيين كلمة سر جديدة للموظف: ${resetModalMember.name_ar || resetModalMember.name_en || resetModalMember.email}`
                  : `Assign a new secure password for ${resetModalMember.email}`}
              </p>
            </div>

            {resetResult ? (
              <div className="ml-modal__body">
                <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', borderRadius: '8px' }}>
                  <div style={{ color: '#10B981', fontWeight: 700, marginBottom: '8px' }}>
                    {isAr ? 'تم تحديث كلمة المرور بنجاح!' : 'Password updated successfully!'}
                  </div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                    <strong>{isAr ? 'المستخدم:' : 'User:'}</strong> {resetResult.email}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
                    <strong>{isAr ? 'كلمة المرور الجديدة:' : 'New Password:'}</strong>{' '}
                    <span style={{ color: '#F59E0B', fontWeight: 700 }}>{resetResult.pass}</span>
                  </div>
                </div>
                <div style={{ marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `كلمة المرور الجديدة لحسابك:\nالبريد: ${resetResult.email}\nكلمة المرور: ${resetResult.pass}`,
                        () => setCopiedResetPass(true)
                      )
                    }
                    className="ml-btn ml-btn--primary"
                    style={{ width: '100%' }}
                  >
                    <IconCopy size={14} />
                    <span>{copiedResetPass ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ كلمة المرور الجديدة' : 'Copy New Password')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="ml-modal__body">
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        required
                        className="ml-input"
                        style={{ fontFamily: 'monospace' }}
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setNewPasswordInput(generateRandomPassword())}
                        className="ml-btn ml-btn--subtle ml-btn--sm"
                      >
                        <IconRefresh size={12} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="ml-modal__foot vc-modal-foot">
                  <button type="button" onClick={() => setResetModalMember(null)} className="ml-btn ml-btn--subtle">
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" disabled={resetBusy} className="ml-btn ml-btn--primary">
                    <IconCheck size={14} />
                    <span>{resetBusy ? (isAr ? 'جارِ التعيين…' : 'Resetting…') : (isAr ? 'حفظ وتحديث كلمة المرور' : 'Save Password')}</span>
                  </button>
                </div>
              </form>
            )}

            {resetResult && (
              <div className="ml-modal__foot vc-modal-foot">
                <button type="button" onClick={() => setResetModalMember(null)} className="ml-btn ml-btn--subtle">
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL 4: EDIT MEMBER ROLE & PROFILE ─── */}
      {editModalMember && (
        <div className="ml-modal-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && !editBusy && setEditModalMember(null)}>
          <div className="ml-modal" style={{ maxWidth: '480px' }}>
            <div className="ml-modal__head">
              <h2 className="vc-modal-title">{isAr ? 'تعديل صلاحيات وبيانات الموظف' : 'Edit Member Scope & Role'}</h2>
              <p className="vc-modal-desc">
                {isAr
                  ? `تعديل صلاحيات: ${editModalMember.name_ar || editModalMember.name_en || editModalMember.email}`
                  : `Update role for ${editModalMember.email}`}
              </p>
            </div>

            <form onSubmit={handleUpdateMember}>
              <div className="ml-modal__body">
                <div className="ml-field">
                  <label className="ml-label">{isAr ? 'الدور ومستوى الصلاحيات' : 'Role'}</label>
                  <select
                    className="ml-select"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                  >
                    <option value="viewer">{isAr ? 'مستطلع (عرض فقط)' : 'Viewer (read-only)'}</option>
                    <option value="analyst">{isAr ? 'محلل ومدقق' : 'Analyst / Auditor'}</option>
                    <option value="manager">{isAr ? 'مدير عمليات' : 'Operations Manager'}</option>
                    <option value="org_admin">{isAr ? 'مسؤول المؤسسة' : 'Administrator'}</option>
                  </select>
                </div>

                <div className="ml-field">
                  <label className="ml-label">{isAr ? 'القسم / الإدارة' : 'Department'}</label>
                  <input
                    type="text"
                    className="ml-input"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder="المالية، التدقيق، المشتريات"
                  />
                </div>

                <div className="ml-field">
                  <label className="ml-label">{isAr ? 'المسمى الوظيفي' : 'Job Title'}</label>
                  <input
                    type="text"
                    className="ml-input"
                    value={editJobTitle}
                    onChange={(e) => setEditJobTitle(e.target.value)}
                    placeholder="مدقق مالي أول"
                  />
                </div>

                <div className="ml-field">
                  <label className="ml-label">{isAr ? 'الفرع' : 'Branch'}</label>
                  <select
                    className="ml-select"
                    value={editBranchId}
                    onChange={(e) => setEditBranchId(e.target.value)}
                  >
                    <option value="">{isAr ? 'جميع الفروع / المقر الرئيسي' : 'All Branches / HQ'}</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {isAr ? b.name_ar || b.name_en : b.name_en || b.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ml-modal__foot vc-modal-foot">
                <button type="button" onClick={() => setEditModalMember(null)} className="ml-btn ml-btn--subtle">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={editBusy} className="ml-btn ml-btn--primary">
                  <IconCheck size={14} />
                  <span>{editBusy ? (isAr ? 'جارِ التحديث…' : 'Updating…') : (isAr ? 'حفظ التغييرات' : 'Save Changes')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 5: CREATE BRANCH ─── */}
      {isBranchOpen && (
        <div
          className="ml-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && !branchBusy && setIsBranchOpen(false)}
        >
          <div className="ml-modal">
            <div className="ml-modal__head">
              <h2 className="vc-modal-title">{isAr ? 'إضافة فرع جديد' : 'Add a new branch'}</h2>
              <p className="vc-modal-desc">
                {isAr
                  ? 'يُسجَّل الفرع ضمن هذه المؤسسة ويُستخدم لتنظيم السجلات وحصر الصلاحيات لكل موقع.'
                  : 'The branch is registered under this organization and is used to organize records and scope access.'}
              </p>
            </div>

            <form onSubmit={handleCreateBranch}>
              <div className="ml-modal__body">
                <div className="ml-field">
                  <label className="ml-label">{isAr ? 'اسم الفرع (إنجليزي)' : 'Branch name (English)'}</label>
                  <input
                    type="text"
                    required
                    className="ml-input"
                    value={branchNameEn}
                    onChange={(e) => setBranchNameEn(e.target.value)}
                    placeholder="Riyadh Operations"
                  />
                </div>

                <div className="ml-field">
                  <label className="ml-label">{isAr ? 'اسم الفرع (عربي)' : 'Branch name (Arabic)'}</label>
                  <input
                    type="text"
                    className="ml-input"
                    value={branchNameAr}
                    onChange={(e) => setBranchNameAr(e.target.value)}
                    placeholder="عمليات الرياض"
                  />
                </div>

                <div className="vc-field-pair">
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'رمز الفرع' : 'Branch code'}</label>
                    <input
                      type="text"
                      className="ml-input"
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                      placeholder="RUH-01"
                    />
                  </div>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'المدينة' : 'City'}</label>
                    <input
                      type="text"
                      className="ml-input"
                      value={branchCity}
                      onChange={(e) => setBranchCity(e.target.value)}
                      placeholder={isAr ? 'الرياض' : 'Riyadh'}
                    />
                  </div>
                </div>

                {branchError && <div className="ml-error">{branchError}</div>}
              </div>

              <div className="ml-modal__foot vc-modal-foot">
                <button type="button" onClick={() => setIsBranchOpen(false)} disabled={branchBusy} className="ml-btn ml-btn--subtle">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={branchBusy} className="ml-btn ml-btn--primary">
                  <IconPlus size={14} />
                  <span>{branchBusy ? (isAr ? 'جارِ الإنشاء…' : 'Creating…') : (isAr ? 'إنشاء الفرع' : 'Create branch')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
