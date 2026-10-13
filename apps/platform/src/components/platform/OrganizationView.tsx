import React, { useState, useEffect } from 'react';
import { LocaleMode } from '../../types';
import { IconOrganization, IconCheck, IconPlus } from '../Icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

interface OrganizationViewProps {
  locale: LocaleMode;
}

export const OrganizationView: React.FC<OrganizationViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, tenant, openAuthModal } = useAuth();

  const fallbackMembers = [
    {
      id: 'm-demo-1',
      user_id: 'u-1',
      name: 'سعد المخلافي',
      email: 'saad@mikhlafi-labs.com',
      role: 'org_owner',
      branch_name: 'الرياض — المقر الرئيسي',
      status: 'active'
    },
    {
      id: 'm-demo-2',
      user_id: 'u-2',
      name: 'فهد السبيعي',
      email: 'f.subaie@holding.sa',
      role: 'org_admin',
      branch_name: 'الرياض — المقر الرئيسي',
      status: 'active'
    }
  ];

  const fallbackBranches = [
    { id: 'b-demo-1', name: 'المقر الرئيسي — الرياض', code: 'RUH-HQ', status: 'active' },
    { id: 'b-demo-2', name: 'مركز العمليات اللوجستية — جدة', code: 'JED-LOG', status: 'active' }
  ];

  const [members, setMembers] = useState<any[]>(fallbackMembers);
  const [branches, setBranches] = useState<any[]>(fallbackBranches);
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);

  // Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      Promise.all([api.getBranches(), api.getMembers()])
        .then(([bRes, mRes]) => {
          if (isMounted) {
            setBranches(bRes.branches || []);
            setMembers(mRes.members || []);
          }
        })
        .catch(() => {
          // Fall back gracefully if error
        });
    } else {
      setBranches(fallbackBranches);
      setMembers(fallbackMembers);
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, tenant?.organizationId]);

  const openInviteModal = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setInviteEmail('');
    setInviteRole('viewer');
    setInviteError(null);
    setIsInviteModalOpen(true);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      setInviteError(isAr ? 'يرجى إدخال البريد الإلكتروني.' : 'Email is required.');
      return;
    }

    setInviteSubmitting(true);
    setInviteError(null);

    try {
      await api.inviteMember(inviteEmail.trim().toLowerCase(), inviteRole);
      const mRes = await api.getMembers();
      setMembers(mRes.members || []);
      setIsInviteModalOpen(false);
      setInviteFeedback(
        isAr
          ? `تم اعتماد دعوة ${inviteEmail} بصلاحية ${inviteRole.toUpperCase()} بنجاح.`
          : `Successfully invited ${inviteEmail} with ${inviteRole.toUpperCase()} role.`
      );
      setTimeout(() => setInviteFeedback(null), 5000);
    } catch (err: any) {
      setInviteError(err.message || (isAr ? 'فشل إرسال الدعوة. تأكد من الصلاحيات.' : 'Failed to send invitation.'));
    } finally {
      setInviteSubmitting(false);
    }
  };

  return (
    <div className="platform-page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div className="page-breadcrumb">
            <span>{isAr ? 'المنصة' : 'Platform'}</span>
            <span>/</span>
            <span>{isAr ? 'الإدارة والسيادة' : 'Administration'}</span>
            <span>/</span>
            <span className="current">{isAr ? 'المؤسسة والفروع والمستخدمين' : 'Organization & RBAC'}</span>
          </div>
          <h1 className="page-title">
            <IconOrganization size={24} />
            <span>{isAr ? 'إدارة المؤسسة وهيكل الفروع والصلاحيات (RBAC)' : 'Multi-Branch Hierarchy & Role-Based Permissions'}</span>
          </h1>
          <p className="page-subtitle">
            {isAr
              ? 'إدارة الحسابات القيادية، عزل فروع المؤسسة بصلاحيات وصول صارمة، وحماية خصوصية السجلات المالية.'
              : 'Enterprise multi-branch segmentation, role-based access control, and tenant governance.'}
          </p>
        </div>

        <button onClick={openInviteModal} className="btn-primary" style={{ fontSize: '12px', padding: '9px 14px' }}>
          <IconPlus size={14} />
          <span>{isAr ? 'دعوة قيادي جديد' : 'Invite Executive Member'}</span>
        </button>
      </div>

      {inviteFeedback && (
        <div className="alert-feedback-banner success">
          <IconCheck size={16} />
          <span>{inviteFeedback}</span>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
              {isAr ? 'دعوة عضو قيادي أو مدقق جديد' : 'Invite Executive Team Member'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              {isAr
                ? 'سيتم منح العضو حق الوصول المشروط إلى سجلات هذه المؤسسة فقط وفق نموذج عزل المستأجرين الصارم.'
                : 'The invited member will receive scoped access exclusively to this tenant organization environment.'}
            </p>

            <form onSubmit={handleSendInvite}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {isAr ? 'البريد الإلكتروني المهني' : 'Corporate Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="executive@enterprise.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {isAr ? 'الدور ونطاق الصلاحيات (RBAC)' : 'Role & Permission Scope'}
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                >
                  <option value="viewer">
                    {isAr ? 'مستطلع / مدقق خارجي (Viewer — استعراض فقط)' : 'Viewer (Read-only auditor)'}
                  </option>
                  <option value="analyst">
                    {isAr ? 'محلل مالي وتشغيلي (Analyst — تدقيق ورصد مؤشرات)' : 'Analyst (Audit & financial forensics)'}
                  </option>
                  <option value="manager">
                    {isAr ? 'مدير تنفيذي (Manager — اعتماد قرارات وتوجيه)' : 'Manager (Decisions & operations)'}
                  </option>
                  <option value="org_admin">
                    {isAr ? 'مسؤول مؤسسي (Admin — إدارة الأعضاء والإعدادات)' : 'Administrator (Full organization control)'}
                  </option>
                </select>
              </div>

              {inviteError && (
                <div style={{
                  padding: '10px 12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--status-critical)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--status-critical)',
                  fontSize: '12px',
                  marginBottom: '14px'
                }}>
                  {inviteError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  disabled={inviteSubmitting}
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  <span>{isAr ? 'إلغاء' : 'Cancel'}</span>
                </button>
                <button
                  type="submit"
                  disabled={inviteSubmitting}
                  className="btn-primary"
                  style={{ fontSize: '12px', padding: '8px 18px' }}
                >
                  <span>{inviteSubmitting ? (isAr ? 'جارِ الإرسال...' : 'Sending...') : (isAr ? 'إرسال وتفعيل' : 'Send Invitation')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tenant Isolation Banner */}
      {isAuthenticated ? (
        <div className="honest-alert" style={{ borderColor: 'var(--status-success)', background: 'rgba(16, 185, 129, 0.08)' }}>
          <span style={{ fontSize: '20px' }}>🏛️</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--status-success)' }}>
              {isAr ? 'عزل المؤسسة مفعل (Strict Tenant Isolation):' : 'Tenant Isolation Enforced:'}
            </strong>{' '}
            {isAr
              ? `جميع الفروع والمستخدمين المعروضين أدناه مسترجعون حصرياً من سجلات المؤسسة النشطة (${tenant?.orgNameAr || tenant?.orgNameEn}) ولا يمكن لأي مؤسسة أخرى استعراضها.`
              : `All branches and memberships displayed below are strictly isolated to the active organization (${tenant?.orgNameEn}). Cross-tenant access is denied at DB level.`}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--status-success)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            ROLE: {tenant?.role?.toUpperCase()}
          </span>
        </div>
      ) : (
        <div className="honest-alert">
          <span style={{ fontSize: '20px' }}>ℹ️</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--text-primary)' }}>
              {isAr ? 'بيانات توضيحية استرشادية:' : 'Preview Demonstration Mode:'}
            </strong>{' '}
            {isAr
              ? 'سجل الدخول لاستعراض فروع مؤسستك الحقيقية من PostgreSQL وإدارة صلاحيات الأعضاء.'
              : 'Sign in to access your organization-specific branches and manage membership roles.'}
          </div>
          <button
            onClick={openAuthModal}
            className="btn-primary"
            style={{ fontSize: '11px', padding: '5px 12px' }}
          >
            <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
          </button>
        </div>
      )}

      {/* Branches Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', margin: '16px 0' }}>
        {branches.map((b) => (
          <div key={b.id} className="decision-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '13px' }}>{b.name}</span>
              <span className="severity-tag optimal">{b.code || 'ACTIVE'}</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '8px 0 0' }}>
              {isAr ? 'فرع تشغيلي موثق ومعزول ضمن حدود المؤسسة' : 'Operational branch isolated to tenant scope'}
            </p>
          </div>
        ))}
      </div>

      {/* Members Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '13px' }}>
            {isAr ? 'فريق القيادة والوصول المصرح' : 'Active Authorized Leadership Team'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {isAr ? `إجمالي الأعضاء: ${members.length}` : `Total Members: ${members.length}`}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'الاسم' : 'Name'}</th>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'الدور والصلاحيات' : 'Role & Scope'}</th>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'الفرع' : 'Branch'}</th>
                <th style={{ padding: '10px 14px', textAlign: 'start' }}>{isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{m.name || m.user_id}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{m.email}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--accent-light)', fontWeight: 600 }}>
                    <span style={{ textTransform: 'uppercase' }}>{m.role}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>{m.branch_name || (isAr ? 'المقر العام' : 'Headquarters')}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="severity-tag optimal">{(m.status || 'ACTIVE').toUpperCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
