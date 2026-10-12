// MIKHLAFI LABS — Customer Application Layout
// Dedicated layout for authenticated customer workspace under /app/*
// Manages customer sidebar, tenant switching, user menu, session status, and sign-out

import React, { useState } from 'react';
import { LocaleMode, ThemeMode } from '../types';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../router/routes';
import {
  IconDashboard,
  IconFinance,
  IconDecisions,
  IconRisk,
  IconProjects,
  IconSupplier,
  IconCustomer,
  IconAssistant,
  IconDataQuality,
  IconServer,
  IconMenu,
  IconX,
  IconGlobe,
  IconSun,
  IconMoon,
  IconBell,
  IconWorkflow,
  IconFileText,
  IconOrganization,
  IconCreditCard,
  IconSettings
} from '../components/Icons';

interface CustomerLayoutProps {
  theme: ThemeMode;
  locale: LocaleMode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onToggleTheme: () => void;
  onToggleLocale: () => void;
  children: React.ReactNode;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  theme,
  locale,
  currentPath,
  onNavigate,
  onToggleTheme,
  onToggleLocale,
  children
}) => {
  const isAr = locale === 'ar';
  const { user, tenant, logout, switchOrganization } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const availableWorkspaces = (tenant?.availableOrganizations && tenant.availableOrganizations.length > 0)
    ? tenant.availableOrganizations.map((o) => ({
        id: o.id,
        nameAr: o.nameAr || o.nameEn,
        nameEn: o.nameEn
      }))
    : [
        {
          id: tenant?.organizationId || 'current-org',
          nameAr: tenant?.orgNameAr || 'مساحة العمل الحالية',
          nameEn: tenant?.orgNameEn || 'Current Workspace'
        }
      ];

  const currentOrgId = tenant?.organizationId || availableWorkspaces[0]?.id || '';

  const handleNav = (targetPath: string) => {
    onNavigate(targetPath);
    setMobileSidebarOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      onNavigate(ROUTES.AUTH.LOGIN);
    }
  };

  const isActive = (routePath: string) => {
    return currentPath === routePath;
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside
        className="app-sidebar"
        style={{
          display: mobileSidebarOpen ? 'flex' : undefined,
          position: mobileSidebarOpen ? 'fixed' : undefined,
          zIndex: mobileSidebarOpen ? 1500 : undefined,
          height: mobileSidebarOpen ? '100vh' : undefined,
          top: 0,
          insetInlineStart: 0
        }}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <button
            onClick={() => handleNav(ROUTES.APP.OVERVIEW)}
            className="brand-emblem"
            style={{ textAlign: 'start', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div className="brand-symbol" style={{ width: '30px', height: '30px', fontSize: '15px' }}>M</div>
            <div className="brand-meta">
              <span className="brand-name" style={{ fontSize: '13px' }}>MIKHLAFI LABS</span>
              <span className="brand-sub" style={{ fontSize: '8px' }}>
                {isAr ? 'منصة استخبارات الأعمال' : 'ENTERPRISE INTELLIGENCE'}
              </span>
            </div>
          </button>
          {mobileSidebarOpen && (
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="ctrl-btn"
              style={{ marginInlineStart: 'auto' }}
            >
              <IconX size={16} />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar-nav">
          {/* Group 1: Workspace */}
          <div className="nav-section-title">
            {isAr ? 'مساحة العمل والقيادة' : 'WORKSPACE'}
          </div>

          <button
            onClick={() => handleNav(ROUTES.APP.OVERVIEW)}
            className={`nav-item ${isActive(ROUTES.APP.OVERVIEW) ? 'active' : ''}`}
          >
            <IconDashboard size={16} />
            <span>{isAr ? 'مركز القيادة التنفيذي' : 'Executive Command Center'}</span>
          </button>

          <button
            onClick={() => handleNav(ROUTES.APP.ALERTS)}
            className={`nav-item ${isActive(ROUTES.APP.ALERTS) ? 'active' : ''}`}
          >
            <IconBell size={16} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>{isAr ? 'مركز التنبيهات الفورية' : 'Alerts & Telemetry'}</span>
              <span className="severity-tag high" style={{ fontSize: '9px', padding: '1px 5px' }}>
                2 {isAr ? 'جديد' : 'new'}
              </span>
            </div>
          </button>

          {/* Group 2: Intelligence Suite */}
          <div className="nav-section-title">
            {isAr ? 'محركات الاستخبارات والقرارات' : 'INTELLIGENCE SUITE'}
          </div>

          <button
            onClick={() => handleNav(ROUTES.APP.FINANCE)}
            className={`nav-item ${isActive(ROUTES.APP.FINANCE) ? 'active' : ''}`}
          >
            <IconFinance size={16} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>{isAr ? 'الذكاء المالي وكشف الشذوذ' : 'Financial Intelligence'}</span>
              <span className="severity-tag high" style={{ fontSize: '9px', padding: '1px 5px' }}>
                7 {isAr ? 'حالات' : 'flags'}
              </span>
            </div>
          </button>

          <button
            onClick={() => handleNav(ROUTES.APP.DECISIONS)}
            className={`nav-item ${isActive(ROUTES.APP.DECISIONS) ? 'active' : ''}`}
          >
            <IconDecisions size={16} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>{isAr ? 'مركز القرارات التنفيذية' : 'Decision Center'}</span>
              <span className="severity-tag critical" style={{ fontSize: '9px', padding: '1px 5px' }}>
                3 {isAr ? 'أولويات' : 'critical'}
              </span>
            </div>
          </button>

          <button
            onClick={() => handleNav(ROUTES.APP.RISK)}
            className={`nav-item ${isActive(ROUTES.APP.RISK) ? 'active' : ''}`}
          >
            <IconRisk size={16} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>{isAr ? 'التنبؤ بالمخاطر والإنذار المبكر' : 'Predictive Risk Intelligence'}</span>
              <span className="severity-tag medium" style={{ fontSize: '9px', padding: '1px 5px' }}>
                1.7M SAR
              </span>
            </div>
          </button>

          <button
            onClick={() => handleNav(ROUTES.APP.PROJECTS)}
            className={`nav-item ${isActive(ROUTES.APP.PROJECTS) ? 'active' : ''}`}
          >
            <IconProjects size={16} />
            <span>{isAr ? 'ذكاء أداء المشاريع والعقود' : 'Project Intelligence'}</span>
          </button>

          <button
            onClick={() => handleNav(ROUTES.APP.SUPPLIERS)}
            className={`nav-item ${isActive(ROUTES.APP.SUPPLIERS) ? 'active' : ''}`}
          >
            <IconSupplier size={16} />
            <span>{isAr ? 'ذكاء الموردين والمشتريات' : 'Supplier Intelligence'}</span>
          </button>

          <button
            onClick={() => handleNav(ROUTES.APP.CUSTOMERS)}
            className={`nav-item ${isActive(ROUTES.APP.CUSTOMERS) ? 'active' : ''}`}
          >
            <IconCustomer size={16} />
            <span>{isAr ? 'ذكاء ومراقبة العملاء (Churn)' : 'Customer Intelligence'}</span>
          </button>

          <button
            onClick={() => handleNav(ROUTES.APP.DATA_QUALITY)}
            className={`nav-item ${isActive(ROUTES.APP.DATA_QUALITY) ? 'active' : ''}`}
          >
            <IconDataQuality size={16} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>{isAr ? 'جودة وحوكمة البيانات' : 'Data Quality Intelligence'}</span>
              <span className="severity-tag optimal" style={{ fontSize: '9px', padding: '1px 5px' }}>
                97.4%
              </span>
            </div>
          </button>

          {/* Group 3: AI Assistant */}
          <div className="nav-section-title">
            {isAr ? 'الذكاء الاصطناعي المدعوم بالأدلة' : 'AI ASSISTANT'}
          </div>

          <button
            onClick={() => handleNav(ROUTES.APP.ASSISTANT)}
            className={`nav-item ${isActive(ROUTES.APP.ASSISTANT) ? 'active' : ''}`}
          >
            <IconAssistant size={16} />
            <span>{isAr ? 'المساعد التنفيذي الذكي' : 'Executive AI Assistant'}</span>
          </button>

          {/* Group 4: Operations & Mitigation */}
          <div className="nav-section-title">
            {isAr ? 'العمليات والسياسات' : 'OPERATIONS & POLICIES'}
          </div>

          <button
            onClick={() => handleNav(ROUTES.APP.WORKFLOWS)}
            className={`nav-item ${isActive(ROUTES.APP.WORKFLOWS) ? 'active' : ''}`}
          >
            <IconWorkflow size={16} />
            <span>{isAr ? 'سير العمل وسياسات الأتمتة' : 'Workflows & Automation'}</span>
          </button>

          <button
            onClick={() => handleNav(ROUTES.APP.REPORTS)}
            className={`nav-item ${isActive(ROUTES.APP.REPORTS) ? 'active' : ''}`}
          >
            <IconFileText size={16} />
            <span>{isAr ? 'التقارير وسجلات التدقيق' : 'Reports & Audit Trails'}</span>
          </button>

          {/* Group 5: Administration & Tenancy */}
          <div className="nav-section-title">
            {isAr ? 'الإدارة والسيادة' : 'ADMINISTRATION & TENANCY'}
          </div>

          <button
            onClick={() => handleNav(ROUTES.APP.INTEGRATIONS)}
            className={`nav-item ${isActive(ROUTES.APP.INTEGRATIONS) ? 'active' : ''}`}
          >
            <IconServer size={16} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>{isAr ? 'مصادر البيانات وتكامل ERP' : 'Data Sources & ERP'}</span>
              <span className="severity-tag optimal" style={{ fontSize: '9px', padding: '1px 5px' }}>
                4
              </span>
            </div>
          </button>

          <button
            onClick={() => handleNav(ROUTES.APP.ORGANIZATION)}
            className={`nav-item ${isActive(ROUTES.APP.ORGANIZATION) ? 'active' : ''}`}
          >
            <IconOrganization size={16} />
            <span>{isAr ? 'المؤسسة والفروع والمستخدمين' : 'Organization & Branches'}</span>
          </button>

          <button
            onClick={() => handleNav(ROUTES.APP.BILLING)}
            className={`nav-item ${isActive(ROUTES.APP.BILLING) ? 'active' : ''}`}
          >
            <IconCreditCard size={16} />
            <span>{isAr ? 'الاشتراك والاستحقاقات' : 'Subscription & Quotas'}</span>
          </button>

          <button
            onClick={() => handleNav(ROUTES.APP.SETTINGS)}
            className={`nav-item ${isActive(ROUTES.APP.SETTINGS) ? 'active' : ''}`}
          >
            <IconSettings size={16} />
            <span>{isAr ? 'إعدادات المنظومة' : 'Platform Settings'}</span>
          </button>
        </nav>
      </aside>

      {/* Main App Content View */}
      <main className="app-main">
        {/* Top Header */}
        <header className="app-header">
          <div className="header-left">
            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="ctrl-btn"
              style={{ display: 'none' }}
            >
              <IconMenu size={18} />
            </button>

            {/* Active Organization Switcher */}
            <div className="workspace-badge" title={isAr ? 'عزل المؤسسات متعدد المستأجرين (Tenant Isolation)' : 'Multi-Tenant Isolation'}>
              <span>🏛️</span>
              <select
                value={currentOrgId}
                onChange={(e) => switchOrganization(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  fontSize: '12px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {availableWorkspaces.map((w) => (
                  <option key={w.id} value={w.id} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                    {isAr ? w.nameAr : w.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Direct Link back to Public Website */}
            <button
              onClick={() => onNavigate(ROUTES.PUBLIC.HOME)}
              className="ctrl-btn"
              style={{ fontSize: '11px' }}
              title={isAr ? 'الانتقال إلى الموقع التعريفي العام' : 'Return to Public Website'}
            >
              <span>{isAr ? '🌐 الموقع التعريفي' : '🌐 Public Site'}</span>
            </button>
          </div>

          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Live Data Freshness & Tenant Connection Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--status-optimal)'
                }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>
                {isAr
                  ? `قاعدة البيانات: ${tenant?.orgNameAr || tenant?.orgNameEn || 'متصل'}`
                  : `PostgreSQL: ${tenant?.orgNameEn || 'Connected'}`}
              </span>
            </div>

            {/* Lang Toggle */}
            <button onClick={onToggleLocale} className="ctrl-btn" style={{ padding: '6px 9px' }} title="Toggle Language">
              <IconGlobe size={14} />
              <span>{isAr ? 'EN' : 'عربي'}</span>
            </button>

            {/* Theme Toggle */}
            <button onClick={onToggleTheme} className="ctrl-btn" style={{ padding: '6px 9px' }} title="Toggle Theme">
              {theme === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />}
            </button>

            {/* Authenticated User Menu & Sign Out */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-subtle)',
                    border: '1px solid var(--accent-base)',
                    color: 'var(--accent-light)',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                  title={`${user.email} (${tenant?.role || 'Member'})`}
                >
                  <span>{user.nameEn || user.email}</span>
                  <span
                    style={{
                      fontSize: '9px',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      background: 'var(--accent-base)',
                      color: '#fff',
                      textTransform: 'uppercase'
                    }}
                  >
                    {tenant?.role || 'MEMBER'}
                  </span>
                </div>

                <button
                  onClick={handleSignOut}
                  className="ctrl-btn"
                  style={{ fontSize: '11px', padding: '5px 8px', color: 'var(--status-danger)' }}
                  title={isAr ? 'تسجيل الخروج وإنهاء الجلسة' : 'Sign Out of Session'}
                >
                  {isAr ? 'خروج' : 'Sign Out'}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        {children}
      </main>
    </div>
  );
};
