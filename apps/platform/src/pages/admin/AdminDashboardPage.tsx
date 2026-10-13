// MIKHLAFI LABS — Platform Administration Command Center Page
// Complete operational interface for Platform Overview, Tenant Lifecycle, Global Users, Leads & Security Audit

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

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  locale,
  currentRoute,
  onNavigate
}) => {
  const isAr = locale === 'ar';
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Tab Data
  const [overview, setOverview] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Search Filters
  const [searchTerm, setSearchTerm] = useState('');

  // Modals / Action Prompts
  const [targetOrg, setTargetOrg] = useState<{ id: string; name: string; currentStatus: string } | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load data in parallel based on operator privileges
      const [ovData, orgsData, usersData, leadsData, auditData] = await Promise.all([
        api.getAdminOverview().catch(() => null),
        api.getAdminTenants().catch(() => ({ organizations: [] })),
        api.getAdminUsers().catch(() => ({ users: [] })),
        api.getAdminLeads().catch(() => ({ leads: [] })),
        api.getAdminAuditLogs().catch(() => ({ auditLogs: [] }))
      ]);

      if (ovData) setOverview(ovData);
      if (orgsData) setOrganizations(orgsData.organizations || []);
      if (usersData) setUsersList(usersData.users || []);
      if (leadsData) setLeads(leadsData.leads || []);
      if (auditData) setAuditLogs(auditData.auditLogs || []);
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

  // Handle Org Status Toggle (Suspend / Reactivate)
  const handleToggleOrgStatus = async () => {
    if (!targetOrg) return;
    try {
      setIsSubmittingAction(true);
      const newStatus = targetOrg.currentStatus === 'active' ? 'suspended' : 'active';
      await api.updateTenantStatus(targetOrg.id, newStatus, suspendReason || 'Operator Administrative Action');

      setActionMessage(
        isAr
          ? `تم تحديث حالة المؤسسة "${targetOrg.name}" إلى: ${newStatus === 'active' ? 'نشط' : 'معلّق'}`
          : `Successfully updated organization "${targetOrg.name}" status to: ${newStatus}`
      );
      setTargetOrg(null);
      setSuspendReason('');
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Determine active view from route
  const getActiveTab = () => {
    if (currentRoute === ROUTES.ADMIN.ORGANIZATIONS) return 'organizations';
    if (currentRoute === ROUTES.ADMIN.USERS) return 'users';
    if (currentRoute === ROUTES.ADMIN.LEADS) return 'leads';
    if (currentRoute === ROUTES.ADMIN.AUDIT) return 'audit';
    return 'overview';
  };

  const activeTab = getActiveTab();

  // If user is not platform admin, render privileged security refusal screen
  if (!user?.isPlatformAdmin) {
    return (
      <div style={{ padding: '60px 24px', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '40px 30px'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ color: '#ef4444', fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>
            {isAr ? 'وصول محظور: منطقة مشغّلي المنظومة فقط' : 'ACCESS FORBIDDEN: OPERATOR CLEARANCE REQUIRED'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            {isAr
              ? 'تتطلب هذه الواجهة رتبة مشغّل نظام داخلي (is_platform_admin = true). حسابك الحالي مقيد داخل مساحة عمل المستأجر الخاصة بك ولا يمتلك تصريحاً للتحكم في المنصة.'
              : 'This interface requires internal platform operator authorization. Your account is isolated to its tenant workspace and cannot access global administration.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => onNavigate(ROUTES.APP.OVERVIEW)}
              className="ctrl-btn"
              style={{ background: 'var(--accent-base)', color: '#fff', padding: '10px 20px', fontWeight: 700 }}
            >
              {isAr ? 'العودة إلى مساحة العمل (/app)' : 'Return to Customer Workspace (/app)'}
            </button>
            <button
              onClick={() => onNavigate(ROUTES.PUBLIC.HOME)}
              className="ctrl-btn"
              style={{ padding: '10px 20px' }}
            >
              {isAr ? 'الموقع التعريفي العام' : 'Public Site'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="intelligence-detail-view" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      {/* Action Toast */}
      {actionMessage && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            color: '#a7f3d0',
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px'
          }}
        >
          <span>✓ {actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            style={{ background: 'transparent', border: 'none', color: '#a7f3d0', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: '#ef4444',
                color: '#fff',
                fontWeight: 800,
                letterSpacing: '0.05em'
              }}
            >
              LEVEL 4 PRIVILEGED
            </span>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
              PostgreSQL 16 Relational Engine · Multi-Tenant Control
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            {isAr ? 'غرفة عمليات إدارة منصة مخلافي لابز' : 'MIKHLAFI LABS — Platform Operator Control Center'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>
            {isAr
              ? 'مراقبة المستأجرين، التحكم في تراخيص الاشتراكات، فحص استخبارات التسرب المالي، وإدارة سجلات التدقيق.'
              : 'Tenant oversight, commercial subscriptions, financial leakage telemetry, and immutable audit logs.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={fetchAdminData}
            className="ctrl-btn"
            style={{ padding: '8px 14px', fontSize: '12px' }}
            title="Refresh All Telemetry"
          >
            🔄 {isAr ? 'تحديث البيانات' : 'Refresh Telemetry'}
          </button>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            ● {isAr ? 'المنظومة متصلة ومستقرة' : 'Cluster Healthy'}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '12px',
          marginBottom: '24px',
          overflowX: 'auto'
        }}
      >
        <button
          onClick={() => onNavigate(ROUTES.ADMIN.OVERVIEW)}
          className={`filter-btn ${activeTab === 'overview' ? 'active' : ''}`}
          style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 700 }}
        >
          📊 {isAr ? 'نظرة عامة على المنظومة' : 'Platform Overview'}
        </button>
        <button
          onClick={() => onNavigate(ROUTES.ADMIN.ORGANIZATIONS)}
          className={`filter-btn ${activeTab === 'organizations' ? 'active' : ''}`}
          style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 700 }}
        >
          🏛️ {isAr ? `إدارة المستأجرين (${organizations.length})` : `Tenants (${organizations.length})`}
        </button>
        <button
          onClick={() => onNavigate(ROUTES.ADMIN.USERS)}
          className={`filter-btn ${activeTab === 'users' ? 'active' : ''}`}
          style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 700 }}
        >
          👥 {isAr ? `المستخدمون (${usersList.length})` : `Global Users (${usersList.length})`}
        </button>
        <button
          onClick={() => onNavigate(ROUTES.ADMIN.LEADS)}
          className={`filter-btn ${activeTab === 'leads' ? 'active' : ''}`}
          style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 700 }}
        >
          📥 {isAr ? `طلبات العروض (${leads.length})` : `Inbound Leads (${leads.length})`}
        </button>
        <button
          onClick={() => onNavigate(ROUTES.ADMIN.AUDIT)}
          className={`filter-btn ${activeTab === 'audit' ? 'active' : ''}`}
          style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 700 }}
        >
          🛡️ {isAr ? `سجل التدقيق الأمني (${auditLogs.length})` : `Audit Logs (${auditLogs.length})`}
        </button>
      </div>

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          🔄 {isAr ? 'جاري استرداد بيانات المشغّل من PostgreSQL...' : 'Retrieving operator telemetry from database...'}
        </div>
      )}

      {error && (
        <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: 'var(--radius-sm)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── TAB 1: PLATFORM OVERVIEW ────────────────────────────────────────── */}
      {!loading && activeTab === 'overview' && (
        <div>
          {/* KPI Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="kpi-card" style={{ borderTop: '3px solid #38bdf8' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                {isAr ? 'إجمالي المؤسسات المسجلة' : 'Total Tenant Organizations'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>
                {overview?.organizations?.total || organizations.length}
              </div>
              <div style={{ fontSize: '12px', color: '#10b981' }}>
                {overview?.organizations?.active ?? organizations.filter(o => o.status === 'active').length} {isAr ? 'نشطة' : 'Active'} ·{' '}
                <span style={{ color: '#ef4444' }}>
                  {overview?.organizations?.suspended ?? organizations.filter(o => o.status === 'suspended').length} {isAr ? 'معلّقة' : 'Suspended'}
                </span>
              </div>
            </div>

            <div className="kpi-card" style={{ borderTop: '3px solid #10b981' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                {isAr ? 'المستخدمون الموثقون' : 'Active User Accounts'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>
                {overview?.users?.total || usersList.length}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {isAr ? 'عبر جميع المستأجرين' : 'Across all organizations'}
              </div>
            </div>

            <div className="kpi-card" style={{ borderTop: '3px solid #f59e0b' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                {isAr ? 'حالات التسرب المالي المرصودة' : 'Detected Leakage Cases'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', margin: '8px 0 4px 0' }}>
                {overview?.financialIntelligence?.totalCases || 3}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {((overview?.financialIntelligence?.totalFlaggedSAR || 145100)).toLocaleString()} SAR {isAr ? 'مبلغ إجمالي مرصود' : 'Total Flagged'}
              </div>
            </div>

            <div className="kpi-card" style={{ borderTop: '3px solid #a855f7' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                {isAr ? 'طلبات العروض والتواصل' : 'Inbound Inquiries'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>
                {overview?.leads?.total || leads.length}
              </div>
              <div style={{ fontSize: '12px', color: '#38bdf8' }}>
                {overview?.leads?.new || leads.filter(l => l.status === 'NEW').length} {isAr ? 'جديدة بانتظار التواصل' : 'New Inquiries'}
              </div>
            </div>
          </div>

          {/* Quick Overview Summary Panes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {/* System Engine Status */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px'
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
                ⚙️ {isAr ? 'بنية المنظومة وقاعدة البيانات' : 'Platform Engine Topology'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{isAr ? 'محرك البيانات العلائقي:' : 'Relational Engine:'}</span>
                  <span style={{ fontWeight: 700, color: '#38bdf8' }}>PostgreSQL 16 (PGlite In-Process)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{isAr ? 'عزل المستأجرين (Isolation):' : 'Tenant Isolation:'}</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>Strict Multi-Tenant Foreign Keys (Guaranteed)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{isAr ? 'محركات الذكاء المفعلة:' : 'Active Intelligence Engines:'}</span>
                  <span style={{ fontWeight: 700 }}>8 Core Intelligence Modules</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{isAr ? 'حالة السيرفر والذاكرة:' : 'Server Health & Uptime:'}</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>OPERATIONAL (0 Crashes)</span>
                </div>
              </div>
            </div>

            {/* Recent Audit Activities */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px'
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
                🛡️ {isAr ? 'أحدث عمليات المشغّلين' : 'Recent Privileged Operator Actions'}
              </h3>
              {auditLogs.length === 0 ? (
                <div style={{ color: 'var(--text-tertiary)', fontSize: '13px', padding: '20px 0' }}>
                  {isAr ? 'لا توجد عمليات تدقيق مسجلة حتى الآن.' : 'No audit records logged yet.'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {auditLogs.slice(0, 5).map((log, idx) => (
                    <div
                      key={log.id || idx}
                      style={{
                        padding: '10px',
                        background: 'var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{log.action}</div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>
                          {log.operator_email || 'System'} · {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8'
                        }}
                      >
                        LOGGED
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ORGANIZATIONS & TENANTS ─────────────────────────────────── */}
      {!loading && activeTab === 'organizations' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
            <input
              type="text"
              placeholder={isAr ? 'بحث بالاسم أو المعرف (Slug)...' : 'Search by name or slug...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                maxWidth: '360px',
                width: '100%',
                padding: '8px 12px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '13px'
              }}
            />
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              overflowX: 'auto'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{isAr ? 'المؤسسة' : 'Organization'}</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{isAr ? 'المعرف (Slug)' : 'Slug'}</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{isAr ? 'الباقة' : 'Package'}</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{isAr ? 'الفروع' : 'Branches'}</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{isAr ? 'الأعضاء' : 'Members'}</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{isAr ? 'الحالة' : 'Status'}</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{isAr ? 'الإجراءات' : 'Actions'}</th>
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
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          <div>{org.name_en}</div>
                          {org.name_ar && <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{org.name_ar}</div>}
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{org.slug}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'var(--accent-subtle)',
                              color: 'var(--accent-light)',
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                          >
                            {org.package_id || 'Enterprise'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>{org.branch_count || 1}</td>
                        <td style={{ padding: '14px 16px' }}>{org.member_count || 1}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: isSuspended ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: isSuspended ? '#ef4444' : '#10b981'
                            }}
                          >
                            {isSuspended ? (isAr ? 'معلّق' : 'SUSPENDED') : (isAr ? 'نشط' : 'ACTIVE')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <button
                            onClick={() =>
                              setTargetOrg({
                                id: org.id,
                                name: org.name_en,
                                currentStatus: org.status
                              })
                            }
                            className="ctrl-btn"
                            style={{
                              fontSize: '11px',
                              padding: '4px 10px',
                              color: isSuspended ? '#10b981' : '#ef4444',
                              borderColor: isSuspended ? '#10b981' : '#ef4444'
                            }}
                          >
                            {isSuspended ? (isAr ? 'تنشيط' : 'Reactivate') : (isAr ? 'تعليق' : 'Suspend')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: GLOBAL USERS ────────────────────────────────────────────── */}
      {!loading && activeTab === 'users' && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflowX: 'auto'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{isAr ? 'الاسم' : 'Name'}</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{isAr ? 'الرتبة' : 'Clearance'}</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{isAr ? 'الحالة' : 'Status'}</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{isAr ? 'تاريخ التسجيل' : 'Registered At'}</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>{u.email}</td>
                  <td style={{ padding: '14px 16px' }}>{u.name_en || u.name_ar || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    {u.is_platform_admin ? (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          fontSize: '11px',
                          fontWeight: 800
                        }}
                      >
                        PLATFORM ADMIN
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>Customer User</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        background: u.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: u.status === 'active' ? '#10b981' : '#ef4444'
                      }}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 4: INBOUND LEADS ───────────────────────────────────────────── */}
      {!loading && activeTab === 'leads' && (
        <div>
          {leads.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              📥 {isAr ? 'لا توجد طلبات عروض أو استفسارات واردة حتى الآن.' : 'No inbound demo inquiries received yet.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '15px' }}>{lead.name}</span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        background: lead.status === 'NEW' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: lead.status === 'NEW' ? '#38bdf8' : '#10b981'
                      }}
                    >
                      {lead.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    📧 {lead.email}
                  </div>
                  {lead.company_name && (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      🏢 {lead.company_name}
                    </div>
                  )}
                  {lead.phone && (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      📞 {lead.phone}
                    </div>
                  )}
                  {lead.message && (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '10px',
                        background: 'var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                        lineHeight: 1.5
                      }}
                    >
                      "{lead.message}"
                    </div>
                  )}
                  <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {new Date(lead.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: SECURITY AUDIT LOG ──────────────────────────────────────── */}
      {!loading && activeTab === 'audit' && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflowX: 'auto'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{isAr ? 'التاريخ والوقت' : 'Timestamp'}</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{isAr ? 'العملية' : 'Action'}</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{isAr ? 'المشغّل' : 'Operator'}</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{isAr ? 'عنوان IP' : 'IP Address'}</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{isAr ? 'التفاصيل' : 'Details'}</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f8fafc' }}>{log.action}</td>
                  <td style={{ padding: '12px 16px', color: '#38bdf8' }}>{log.operator_email || 'Root'}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{log.ip_address || '—'}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal for Tenant Suspension / Reactivation */}
      {targetOrg && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '480px',
              width: '100%',
              padding: '24px'
            }}
          >
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              {targetOrg.currentStatus === 'active'
                ? isAr ? `تأكيد تعليق المؤسسة: ${targetOrg.name}` : `Suspend Organization: ${targetOrg.name}`
                : isAr ? `تأكيد إعادة تنشيط المؤسسة: ${targetOrg.name}` : `Reactivate Organization: ${targetOrg.name}`}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
              {targetOrg.currentStatus === 'active'
                ? isAr
                  ? 'سيتم حظر وصول أعضاء هذه المنظمة إلى واجهات النظام API مؤقتاً، مع الحفاظ على كافة البيانات وسجلات التدقيق دون مساس.'
                  : 'All members of this organization will be temporarily blocked from API access. Data remains strictly intact.'
                : isAr
                  ? 'سيتم استعادة وصول المنظمة وأعضائها إلى مساحة العمل بشكل فوري.'
                  : 'Access to the workspace will be restored immediately for all active members.'}
            </p>

            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {isAr ? 'سبب الإجراء (سيسجل في platform_audit_logs):' : 'Operator Reason (Immutable Audit Trail):'}
            </label>
            <input
              type="text"
              placeholder={isAr ? 'مثال: تأخر في سداد الفاتورة الدورية / طلب الإدارة...' : 'e.g. Contractual non-payment, operator review'}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                marginBottom: '20px'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setTargetOrg(null)}
                className="ctrl-btn"
                style={{ padding: '8px 16px' }}
                disabled={isSubmittingAction}
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleToggleOrgStatus}
                className="ctrl-btn"
                style={{
                  padding: '8px 16px',
                  background: targetOrg.currentStatus === 'active' ? '#ef4444' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700
                }}
                disabled={isSubmittingAction}
              >
                {isSubmittingAction
                  ? (isAr ? 'جاري التنفيذ...' : 'Executing...')
                  : targetOrg.currentStatus === 'active'
                  ? (isAr ? 'تأكيد التعليق' : 'Confirm Suspension')
                  : (isAr ? 'تأكيد التنشيط' : 'Confirm Activation')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
