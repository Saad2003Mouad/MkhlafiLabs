// MIKHLAFI LABS — Organization, Branches & Access
// Members, branches and role data are loaded exclusively from the authenticated
// backend. No placeholder members or branches are ever rendered.

import React, { useCallback, useEffect, useState } from 'react';
import { LocaleMode } from '../../types';
import { IconOrganization, IconUsers, IconPlus, IconCheck, IconAlertTriangle, IconShield, IconRefresh } from '../Icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
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

interface MemberRecord {
  membership_id: string;
  user_id: string;
  email: string;
  name_en?: string;
  name_ar?: string;
  role: string;
  status: string;
  branch_name?: string | null;
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
  const { isAuthenticated, tenant, openAuthModal } = useAuth();

  const [snapshot, setSnapshot] = useState<OrgSnapshot | null>(null);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Invite member modal
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<string>('viewer');
  const [inviteBusy, setInviteBusy] = useState<boolean>(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Create branch modal
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
        return isAr ? 'مدير' : 'Manager';
      case 'analyst':
        return isAr ? 'محلل' : 'Analyst';
      case 'viewer':
        return isAr ? 'مستطلع' : 'Viewer';
      default:
        return role || '—';
    }
  };

  const openInvite = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setInviteEmail('');
    setInviteRole('viewer');
    setInviteError(null);
    setIsInviteOpen(true);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email) {
      setInviteError(isAr ? 'يرجى إدخال البريد الإلكتروني.' : 'Email is required.');
      return;
    }

    setInviteBusy(true);
    setInviteError(null);
    try {
      await api.inviteMember(email, inviteRole);
      const memberRes = await api.getMembers();
      setMembers(Array.isArray(memberRes.members) ? memberRes.members : []);
      setIsInviteOpen(false);
      setFeedback({
        type: 'success',
        message: isAr
          ? `تمت دعوة ${email} بصلاحية "${roleLabel(inviteRole)}".`
          : `Invited ${email} with the "${roleLabel(inviteRole)}" role.`
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      setInviteError(
        err instanceof Error && err.message
          ? err.message
          : (isAr ? 'تعذر إرسال الدعوة.' : 'The invitation could not be sent.')
      );
    } finally {
      setInviteBusy(false);
    }
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
            : `Branch (${branchNameEn.trim()}) created and registered for your organization.`
        });
        setTimeout(() => setFeedback(null), 5000);
      } else {
        setBranchError(
          isAr ? 'تعذر إنشاء الفرع.' : 'The branch could not be created.'
        );
      }
    } catch (err) {
      setBranchError(
        err instanceof Error && err.message
          ? err.message
          : (isAr ? 'تعذر إنشاء الفرع.' : 'The branch could not be created.')
      );
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
        icon={<IconOrganization size={22} />}
        breadcrumb={[isAr ? 'المنصة' : 'Platform', isAr ? 'الإدارة والسيادة' : 'Administration']}
        title={isAr ? 'المؤسسة والفروع والصلاحيات' : 'Organization, Branches & Access'}
        subtitle={
          isAr
            ? 'إدارة بنية مؤسستك وهرمية فروعها، ومن يملك الصلاحية لعرض السجلات أو تعديلها.'
            : 'Manage your organization’s structure, its branch hierarchy, and who is authorized to view or change its records.'
        }
        action={
          <button onClick={openInvite} className="ml-btn ml-btn--primary ml-btn--sm">
            <IconPlus size={14} />
            <span>{isAr ? 'دعوة عضو' : 'Invite member'}</span>
          </button>
        }
      />

      {feedback && (
        <div className={`alert-feedback-banner ${feedback.type === 'error' ? 'error' : 'success'}`}>
          {feedback.type === 'error' ? <IconAlertTriangle size={16} /> : <IconCheck size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {!isAuthenticated ? (
        <EmptyState
          icon={<IconOrganization size={30} />}
          title={isAr ? 'سجّل الدخول لإدارة مؤسستك' : 'Sign in to manage your organization'}
          description={
            isAr
              ? 'تُسترجع الفروع والأعضاء والصلاحيات مباشرة من مساحة عمل مؤسستك بعد تسجيل الدخول.'
              : 'Branches, members and permissions are loaded directly from your organization workspace after signing in.'
          }
          action={
            <button onClick={openAuthModal} className="ml-btn ml-btn--primary">
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          }
        />
      ) : loading ? (
        <>
          <div className="skeleton-grid">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
          <div className="vc-skeleton-list">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="vc-skeleton-row" />
            ))}
          </div>
        </>
      ) : error ? (
        <EmptyState
          icon={<IconAlertTriangle size={30} />}
          title={isAr ? 'تعذر جلب بيانات المؤسسة' : 'Unable to load organization data'}
          description={error}
          action={
            <button onClick={() => loadAll()} className="ml-btn ml-btn--primary">
              <IconRefresh size={14} />
              <span>{isAr ? 'إعادة المحاولة' : 'Retry'}</span>
            </button>
          }
        />
      ) : (
        <>
          <div className="alert-feedback-banner info">
            <IconShield size={16} />
            <span>
              {isAr
                ? `كل السجلات أدناه محصورة في مؤسسة (${orgName}) فقط، ولا تشمل أي مؤسسة أخرى.`
                : `All records below are scoped to (${orgName}) only and never include any other organization.`}
            </span>
          </div>

          <div className="stat-grid">
            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'دورك' : 'Your Role'}</div>
              <div className="stat-tile__value">{(snapshot?.userRole || '—').toUpperCase()}</div>
              <div className="stat-tile__hint">{isAr ? 'في هذه المؤسسة' : 'In this organization'}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'الأعضاء' : 'Members'}</div>
              <div className="stat-tile__value">
                {(snapshot?.memberCount ?? members.length).toLocaleString()}
              </div>
              <div className="stat-tile__hint">{isAr ? 'عضوية نشطة' : 'Active memberships'}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'الفروع' : 'Branches'}</div>
              <div className="stat-tile__value">
                {(snapshot?.branchCount ?? branches.length).toLocaleString()}
              </div>
              <div className="stat-tile__hint">{isAr ? 'ضمن هذه المؤسسة' : 'Within this organization'}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__label">{isAr ? 'الصلاحيات' : 'Permissions'}</div>
              <div className="stat-tile__value">{(snapshot?.permissions.length ?? 0).toLocaleString()}</div>
              <div className="stat-tile__hint">{isAr ? 'مسندة لحسابك' : 'Granted to your account'}</div>
            </div>
          </div>

          {/* Branches */}
          <section className="ml-panel">
            <div className="ml-panel__head">
              <div className="vc-title-group">
                <div className="vc-title-group__title">{isAr ? 'الفروع' : 'Branches'}</div>
                <div className="vc-title-group__meta">
                  {isAr ? `${branches.length} فرع مسجل` : `${branches.length} registered`}
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
                      : 'Branches appear here as soon as they are created, and are used to separate records and permissions per operating location.'
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

          {/* Members */}
          <section className="ml-panel">
            <div className="ml-panel__head">
              <div className="vc-title-group">
                <div className="vc-title-group__title">{isAr ? 'الأعضاء والصلاحيات' : 'Members & access'}</div>
                <div className="vc-title-group__meta">
                  {isAr ? `${members.length} عضو` : `${members.length} member${members.length === 1 ? '' : 's'}`}
                </div>
              </div>
              <button onClick={openInvite} className="ml-btn ml-btn--primary ml-btn--sm">
                <IconUsers size={13} />
                <span>{isAr ? 'دعوة عضو' : 'Invite member'}</span>
              </button>
            </div>
            <div className="ml-panel__body">
              {members.length === 0 ? (
                <EmptyState
                  compact
                  icon={<IconUsers size={30} />}
                  title={isAr ? 'لا يوجد أعضاء بعد' : 'No members yet'}
                  description={
                    isAr
                      ? 'يظهر العضو هنا بعد قبول دعوته، مع دوره ونطاق صلاحياته داخل هذه المؤسسة.'
                      : 'A member appears here once their invitation is accepted, together with their role and scope inside this organization.'
                  }
                  action={
                    <button onClick={openInvite} className="ml-btn ml-btn--primary ml-btn--sm">
                      <IconPlus size={13} />
                      <span>{isAr ? 'دعوة عضو' : 'Invite member'}</span>
                    </button>
                  }
                />
              ) : (
                <div className="record-list">
                  {members.map((m) => (
                    <article key={m.membership_id || m.user_id} className="record-row vc-row">
                      <div className="record-row__main">
                        <div className="record-row__title">
                          {isAr ? m.name_ar || m.name_en || m.email : m.name_en || m.name_ar || m.email}
                        </div>
                        <div className="record-row__meta">
                          {[m.email, m.branch_name || undefined].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                      <div className="record-row__actions">
                        <span className="ml-badge ml-badge--accent">{roleLabel(m.role)}</span>
                        <span className={`ml-badge ${(m.status || 'active') === 'active' ? 'ml-badge--success' : ''}`}>
                          <span className="ml-dot" />
                          {(m.status || 'active').toUpperCase()}
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

      {/* Invite member modal */}
      {isInviteOpen && (
        <div
          className="ml-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? 'دعوة عضو' : 'Invite a member'}
          onClick={(e) => {
            if (e.target === e.currentTarget && !inviteBusy) setIsInviteOpen(false);
          }}
        >
          <div className="ml-modal">
            <div className="ml-modal__head">
              <h2 className="vc-modal-title">{isAr ? 'دعوة عضو إلى المؤسسة' : 'Invite a member to the organization'}</h2>
              <p className="vc-modal-desc">
                {isAr
                  ? 'يحصل العضو على وصول مقيّد بسجلات هذه المؤسسة فقط وفق الدور المحدد أدناه.'
                  : 'The member receives access limited to this organization’s records only, according to the role selected below.'}
              </p>
            </div>

            <form onSubmit={handleInvite}>
              <div className="ml-modal__body">
                <div className="ml-field">
                  <label className="ml-label" htmlFor="vc-invite-email">
                    {isAr ? 'البريد الإلكتروني' : 'Email address'}
                  </label>
                  <input
                    id="vc-invite-email"
                    type="email"
                    required
                    className="ml-input"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="name@organization.com"
                    autoComplete="email"
                  />
                </div>

                <div className="ml-field">
                  <label className="ml-label" htmlFor="vc-invite-role">
                    {isAr ? 'الدور ونطاق الصلاحيات' : 'Role & permission scope'}
                  </label>
                  <select
                    id="vc-invite-role"
                    className="ml-select"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="viewer">{isAr ? 'مستطلع (عرض فقط)' : 'Viewer (read-only)'}</option>
                    <option value="analyst">{isAr ? 'محلل (تدقيق ورصد)' : 'Analyst (review & monitoring)'}</option>
                    <option value="manager">{isAr ? 'مدير (اعتماد الإجراءات)' : 'Manager (approvals & actions)'}</option>
                    <option value="org_admin">{isAr ? 'مسؤول المؤسسة (إدارة كاملة)' : 'Administrator (full control)'}</option>
                  </select>
                  <span className="ml-hint">
                    {isAr
                      ? 'لا يمكن لغير مالك المؤسسة منح دور "مالك المؤسسة".'
                      : 'Only the organization owner can grant the "Organization Owner" role.'}
                  </span>
                </div>

                {inviteError && <div className="ml-error">{inviteError}</div>}
              </div>

              <div className="ml-modal__foot vc-modal-foot">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  disabled={inviteBusy}
                  className="ml-btn ml-btn--subtle"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={inviteBusy} className="ml-btn ml-btn--primary">
                  <IconCheck size={14} />
                  <span>{inviteBusy ? (isAr ? 'جارِ الإرسال…' : 'Sending…') : (isAr ? 'إرسال الدعوة' : 'Send invitation')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create branch modal */}
      {isBranchOpen && (
        <div
          className="ml-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? 'إضافة فرع' : 'Add a branch'}
          onClick={(e) => {
            if (e.target === e.currentTarget && !branchBusy) setIsBranchOpen(false);
          }}
        >
          <div className="ml-modal">
            <div className="ml-modal__head">
              <h2 className="vc-modal-title">{isAr ? 'إضافة فرع جديد' : 'Add a new branch'}</h2>
              <p className="vc-modal-desc">
                {isAr
                  ? 'يُسجَّل الفرع ضمن هذه المؤسسة ويُستخدم لتنظيم السجلات وحصر الصلاحيات لكل موقع.'
                  : 'The branch is registered under this organization and is used to organize records and scope access per location.'}
              </p>
            </div>

            <form onSubmit={handleCreateBranch}>
              <div className="ml-modal__body">
                <div className="ml-field">
                  <label className="ml-label" htmlFor="vc-branch-name-en">
                    {isAr ? 'اسم الفرع (إنجليزي)' : 'Branch name (English)'}
                  </label>
                  <input
                    id="vc-branch-name-en"
                    type="text"
                    required
                    className="ml-input"
                    value={branchNameEn}
                    onChange={(e) => setBranchNameEn(e.target.value)}
                    placeholder="Riyadh Operations"
                  />
                </div>

                <div className="ml-field">
                  <label className="ml-label" htmlFor="vc-branch-name-ar">
                    {isAr ? 'اسم الفرع (عربي)' : 'Branch name (Arabic)'}
                  </label>
                  <input
                    id="vc-branch-name-ar"
                    type="text"
                    className="ml-input"
                    value={branchNameAr}
                    onChange={(e) => setBranchNameAr(e.target.value)}
                    placeholder="عمليات الرياض"
                  />
                </div>

                <div className="vc-field-pair">
                  <div className="ml-field">
                    <label className="ml-label" htmlFor="vc-branch-code">
                      {isAr ? 'رمز الفرع' : 'Branch code'}
                    </label>
                    <input
                      id="vc-branch-code"
                      type="text"
                      className="ml-input"
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                      placeholder="RUH-01"
                    />
                  </div>
                  <div className="ml-field">
                    <label className="ml-label" htmlFor="vc-branch-city">
                      {isAr ? 'المدينة' : 'City'}
                    </label>
                    <input
                      id="vc-branch-city"
                      type="text"
                      className="ml-input"
                      value={branchCity}
                      onChange={(e) => setBranchCity(e.target.value)}
                      placeholder={isAr ? 'الرياض' : 'Riyadh'}
                    />
                  </div>
                </div>

                <span className="ml-hint">
                  {isAr
                    ? 'رمز الفرع والمدينة اختياريان، ويُولَّد رمز افتراضي تلقائياً عند تركه فارغاً.'
                    : 'Code and city are optional; a default code is generated when left empty.'}
                </span>

                {branchError && <div className="ml-error">{branchError}</div>}
              </div>

              <div className="ml-modal__foot vc-modal-foot">
                <button
                  type="button"
                  onClick={() => setIsBranchOpen(false)}
                  disabled={branchBusy}
                  className="ml-btn ml-btn--subtle"
                >
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
