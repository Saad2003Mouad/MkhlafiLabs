import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { IconOrganization, IconCheck, IconPlus } from '../Icons';

interface OrganizationViewProps {
  locale: LocaleMode;
}

interface MemberItem {
  id: string;
  name: string;
  email: string;
  roleAr: string;
  roleEn: string;
  branch: string;
  status: 'active' | 'invited';
}

export const OrganizationView: React.FC<OrganizationViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [members] = useState<MemberItem[]>([
    {
      id: 'm-1',
      name: 'سعد المخلافي',
      email: 's.mikhlafi@holding.sa',
      roleAr: 'المسؤول التنفيذي الأعلى (Owner)',
      roleEn: 'Executive Owner (Superadmin)',
      branch: 'Riyadh HQ',
      status: 'active'
    },
    {
      id: 'm-2',
      name: 'فهد السبيعي',
      email: 'f.subaie@holding.sa',
      roleAr: 'مدير التدقيق المالي',
      roleEn: 'Chief Audit Officer',
      branch: 'Riyadh HQ',
      status: 'active'
    },
    {
      id: 'm-3',
      name: 'م. خالد الغامدي',
      email: 'k.ghamdi@holding.sa',
      roleAr: 'مدير العمليات وسلاسل الإمداد',
      roleEn: 'Operations & Logistics Director',
      branch: 'Jeddah Hub',
      status: 'active'
    }
  ]);

  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);

  const handleInvite = () => {
    setInviteFeedback(isAr ? 'تم إرسال دعوة انضمام بريدية مع رابط التحقق الثنائي.' : 'Invitation sent with 2FA verification link.');
    setTimeout(() => setInviteFeedback(null), 3500);
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

        <button onClick={handleInvite} className="btn-primary" style={{ fontSize: '12px', padding: '9px 14px' }}>
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

      {/* Branches Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', margin: '16px 0' }}>
        <div className="decision-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '13px' }}>{isAr ? 'المقر الرئيسي — الرياض' : 'Riyadh Headquarters'}</span>
            <span className="severity-tag optimal">PRIMARY</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '8px 0 0' }}>
            {isAr ? 'ربط مباشر بأنظمة SAP ودفتر الأستاذ العام' : 'Direct SAP & GL Core Link'}
          </p>
        </div>

        <div className="decision-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '13px' }}>{isAr ? 'مركز العمليات اللوجستية — جدة' : 'Jeddah Logistics Hub'}</span>
            <span className="severity-tag optimal">ACTIVE</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '8px 0 0' }}>
            {isAr ? 'مراقبة سلاسل التوريد وعقود المقاولين' : 'Procurement & Logistics Link'}
          </p>
        </div>

        <div className="decision-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '13px' }}>{isAr ? 'الفرع الصناعي — الخبر' : 'Khobar Industrial Branch'}</span>
            <span className="severity-tag optimal">ACTIVE</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '8px 0 0' }}>
            {isAr ? 'متابعة المشاريع وتكلفة المواد المباشرة' : 'Industrial Projects & Assets Link'}
          </p>
        </div>
      </div>

      {/* Members Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '13px' }}>
            {isAr ? 'فريق القيادة والوصول المصرح' : 'Active Authorized Leadership Team'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {isAr ? 'المقاعد المفعلة: 3 من 25' : 'Seats: 3 / 25 Used'}
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
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{m.name}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{m.email}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--accent-light)', fontWeight: 600 }}>{isAr ? m.roleAr : m.roleEn}</td>
                  <td style={{ padding: '12px 14px' }}>{m.branch}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="severity-tag optimal">{m.status.toUpperCase()}</span>
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
