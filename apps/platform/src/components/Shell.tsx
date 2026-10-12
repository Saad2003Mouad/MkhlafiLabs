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
  IconShield,
  IconServer,
  IconMenu,
  IconX,
  IconGlobe,
  IconSun,
  IconMoon
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
            onClick={() => {
              onNavigateRoute('platform');
              setMobileSidebarOpen(false);
            }}
            className={`nav-item ${currentRoute === 'platform' ? 'active' : ''}`}
          >
            <IconDashboard size={16} />
            <span>{isAr ? 'مركز القيادة التنفيذي' : 'Executive Command Center'}</span>
          </button>

          {/* Group 2: Intelligence Suite */}
          <div className="nav-section-title">
            {isAr ? 'محركات الذكاء والتحليل' : 'INTELLIGENCE SUITE'}
          </div>

          <button
            onClick={() => {
              onNavigateRoute('detail');
              setMobileSidebarOpen(false);
            }}
            className={`nav-item ${currentRoute === 'detail' ? 'active' : ''}`}
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
            onClick={() => {
              onNavigateRoute('platform');
              setMobileSidebarOpen(false);
            }}
            className="nav-item"
          >
            <IconDecisions size={16} />
            <span>{isAr ? 'مركز القرارات التنفيذية' : 'Decision Center'}</span>
          </button>

          <button
            onClick={() => {
              onNavigateRoute('platform');
              setMobileSidebarOpen(false);
            }}
            className="nav-item"
          >
            <IconRisk size={16} />
            <span>{isAr ? 'ذكاء إدارة المخاطر' : 'Risk Intelligence'}</span>
          </button>

          <button
            onClick={() => {
              onNavigateRoute('platform');
              setMobileSidebarOpen(false);
            }}
            className="nav-item"
          >
            <IconProjects size={16} />
            <span>{isAr ? 'ذكاء أداء المشاريع' : 'Project Intelligence'}</span>
          </button>

          <button
            onClick={() => {
              onNavigateRoute('platform');
              setMobileSidebarOpen(false);
            }}
            className="nav-item"
          >
            <IconSupplier size={16} />
            <span>{isAr ? 'ذكاء الموردين والمشتريات' : 'Supplier Intelligence'}</span>
          </button>

          <button
            onClick={() => {
              onNavigateRoute('platform');
              setMobileSidebarOpen(false);
            }}
            className="nav-item"
          >
            <IconCustomer size={16} />
            <span>{isAr ? 'ذكاء ومراقبة العملاء' : 'Customer Intelligence'}</span>
          </button>

          <button
            onClick={() => {
              onNavigateRoute('platform');
              setMobileSidebarOpen(false);
            }}
            className="nav-item"
          >
            <IconDataQuality size={16} />
            <span>{isAr ? 'جودة وحوكمة البيانات' : 'Data Quality Intelligence'}</span>
          </button>

          {/* Group 3: AI Assistant */}
          <div className="nav-section-title">
            {isAr ? 'الذكاء الاصطناعي المدعوم بالأدلة' : 'AI ASSISTANT'}
          </div>

          <button
            onClick={() => {
              onNavigateRoute('platform');
              setMobileSidebarOpen(false);
            }}
            className="nav-item"
          >
            <IconAssistant size={16} />
            <span>{isAr ? 'المساعد التنفيذي الذكي' : 'Executive AI Assistant'}</span>
          </button>

          {/* Group 4: Administration & Settings */}
          <div className="nav-section-title">
            {isAr ? 'الإدارة والسيادة' : 'ADMINISTRATION'}
          </div>

          <button className="nav-item">
            <IconServer size={16} />
            <span>{isAr ? 'مصادر البيانات وتكامل ERP' : 'Data Sources & ERP'}</span>
          </button>

          <button className="nav-item">
            <IconShield size={16} />
            <span>{isAr ? 'الصلاحيات وسجلات التدقيق' : 'RBAC & Audit Trails'}</span>
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
              style={{ display: 'none' }} // styled for small screens
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
