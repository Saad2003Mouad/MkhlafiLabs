import React, { useState } from 'react';
import { LocaleMode, ThemeMode, AppRoute } from '../types';
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
} from './Icons';

interface ShellProps {
  theme: ThemeMode;
  locale: LocaleMode;
  currentRoute: AppRoute;
  onNavigateRoute: (r: AppRoute) => void;
  onNavigateHome: () => void;
  onToggleTheme: () => void;
  onToggleLocale: () => void;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({
  theme,
  locale,
  currentRoute,
  onNavigateRoute,
  onNavigateHome,
  onToggleTheme,
  onToggleLocale,
  children
}) => {
  const isAr = locale === 'ar';
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState('org-01');

  const workspaces = [
    { id: 'org-01', nameAr: 'مجموعة الأفق القابضة (HQ)', nameEn: 'Al-Ufuq Holdings (HQ)' },
    { id: 'org-02', nameAr: 'شركة التوريدات والخدمات اللوجستية', nameEn: 'National Logistics & Supply' },
    { id: 'org-03', nameAr: 'المجموعة الصناعية الخليجية', nameEn: 'Gulf Industrial Group' }
  ];

  const handleNav = (route: AppRoute) => {
    onNavigateRoute(route);
    setMobileSidebarOpen(false);
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
          <button onClick={onNavigateHome} className="brand-emblem" style={{ textAlign: 'start' }}>
            <div className="brand-symbol" style={{ width: '30px', height: '30px', fontSize: '15px' }}>M</div>
            <div className="brand-meta">
              <span className="brand-name" style={{ fontSize: '13px' }}>MIKHLAFI LABS</span>
              <span className="brand-sub" style={{ fontSize: '8px' }}>
                {isAr ? 'منصة القرارات' : 'DECISION MESH'}
              </span>
            </div>
          </button>
          {mobileSidebarOpen && (
            <button onClick={() => setMobileSidebarOpen(false)} className="ctrl-btn" style={{ marginInlineStart: 'auto' }}>
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
            onClick={() => handleNav('platform-overview')}
            className={`nav-item ${currentRoute === 'platform-overview' ? 'active' : ''}`}
          >
            <IconDashboard size={16} />
            <span>{isAr ? 'مركز القيادة التنفيذي' : 'Executive Command Center'}</span>
          </button>

          <button
            onClick={() => handleNav('platform-alerts')}
            className={`nav-item ${currentRoute === 'platform-alerts' ? 'active' : ''}`}
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
            {isAr ? 'محركات الذكاء الثمانية' : 'INTELLIGENCE SUITE'}
          </div>

          <button
            onClick={() => handleNav('platform-finance')}
            className={`nav-item ${currentRoute === 'platform-finance' ? 'active' : ''}`}
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
            onClick={() => handleNav('platform-decisions')}
            className={`nav-item ${currentRoute === 'platform-decisions' ? 'active' : ''}`}
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
            onClick={() => handleNav('platform-risk')}
            className={`nav-item ${currentRoute === 'platform-risk' ? 'active' : ''}`}
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
            onClick={() => handleNav('platform-projects')}
            className={`nav-item ${currentRoute === 'platform-projects' ? 'active' : ''}`}
          >
            <IconProjects size={16} />
            <span>{isAr ? 'ذكاء أداء المشاريع والعقود' : 'Project Intelligence'}</span>
          </button>

          <button
            onClick={() => handleNav('platform-suppliers')}
            className={`nav-item ${currentRoute === 'platform-suppliers' ? 'active' : ''}`}
          >
            <IconSupplier size={16} />
            <span>{isAr ? 'ذكاء الموردين والمشتريات' : 'Supplier Intelligence'}</span>
          </button>

          <button
            onClick={() => handleNav('platform-customers')}
            className={`nav-item ${currentRoute === 'platform-customers' ? 'active' : ''}`}
          >
            <IconCustomer size={16} />
            <span>{isAr ? 'ذكاء ومراقبة العملاء (Churn)' : 'Customer Intelligence'}</span>
          </button>

          <button
            onClick={() => handleNav('platform-data-quality')}
            className={`nav-item ${currentRoute === 'platform-data-quality' ? 'active' : ''}`}
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
            onClick={() => handleNav('platform-assistant')}
            className={`nav-item ${currentRoute === 'platform-assistant' ? 'active' : ''}`}
          >
            <IconAssistant size={16} />
            <span>{isAr ? 'المساعد التنفيذي الذكي' : 'Executive AI Assistant'}</span>
          </button>

          {/* Group 4: Operations & Mitigation */}
          <div className="nav-section-title">
            {isAr ? 'العمليات والسياسات' : 'OPERATIONS & POLICIES'}
          </div>

          <button
            onClick={() => handleNav('platform-workflows')}
            className={`nav-item ${currentRoute === 'platform-workflows' ? 'active' : ''}`}
          >
            <IconWorkflow size={16} />
            <span>{isAr ? 'سير العمل وسياسات الأتمتة' : 'Workflows & Automation'}</span>
          </button>

          <button
            onClick={() => handleNav('platform-reports')}
            className={`nav-item ${currentRoute === 'platform-reports' ? 'active' : ''}`}
          >
            <IconFileText size={16} />
            <span>{isAr ? 'التقارير وسجلات التدقيق' : 'Reports & Audit Trails'}</span>
          </button>

          {/* Group 5: Administration & Settings */}
          <div className="nav-section-title">
            {isAr ? 'الإدارة والسيادة' : 'ADMINISTRATION & TENANCY'}
          </div>

          <button
            onClick={() => handleNav('platform-integrations')}
            className={`nav-item ${currentRoute === 'platform-integrations' ? 'active' : ''}`}
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
            onClick={() => handleNav('platform-organization')}
            className={`nav-item ${currentRoute === 'platform-organization' ? 'active' : ''}`}
          >
            <IconOrganization size={16} />
            <span>{isAr ? 'المؤسسة والفروع والمستخدمين' : 'Organization & Branches'}</span>
          </button>

          <button
            onClick={() => handleNav('platform-billing')}
            className={`nav-item ${currentRoute === 'platform-billing' ? 'active' : ''}`}
          >
            <IconCreditCard size={16} />
            <span>{isAr ? 'الاشتراك والاستحقاقات' : 'Subscription & Quotas'}</span>
          </button>

          <button
            onClick={() => handleNav('platform-settings')}
            className={`nav-item ${currentRoute === 'platform-settings' ? 'active' : ''}`}
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

            {/* Organization / Workspace Switcher */}
            <div className="workspace-badge">
              <span>🏛️</span>
              <select
                value={selectedWorkspace}
                onChange={(e) => setSelectedWorkspace(e.target.value)}
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
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                    {isAr ? w.nameAr : w.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Link back to Website */}
            <button
              onClick={onNavigateHome}
              className="ctrl-btn"
              style={{ fontSize: '11px' }}
            >
              <span>{isAr ? '🌐 الموقع العام' : '🌐 Public Website'}</span>
            </button>
          </div>

          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Live Data Freshness Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', fontSize: '11px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-success)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>
                {isAr ? 'البيانات: متصلة ومحدثة' : 'Feeds: Live & Fresh'}
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

            {/* User Profile */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--accent-subtle)',
                border: '1px solid var(--accent-base)',
                color: 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '12px'
              }}
              title="Saad Al-Mikhlafi (Executive Admin)"
            >
              SM
            </div>
          </div>
        </header>

        {/* Content Body */}
        {children}
      </main>
    </div>
  );
};
