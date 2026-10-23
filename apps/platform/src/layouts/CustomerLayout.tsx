// MIKHLAFI LABS — Customer Workspace Layout
// Authenticated shell for /app/*: grouped navigation, organization switcher,
// session controls, and platform-owner escalation. Navigation labels are
// industry-neutral; no counts or badges are shown unless they come from the API.

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
  IconSettings,
  IconShield,
  IconMessageSquare
} from '../components/Icons';
import { BrandLogo } from '../components/common/BrandLogo';

interface CustomerLayoutProps {
  theme: ThemeMode;
  locale: LocaleMode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onToggleTheme: () => void;
  onToggleLocale: () => void;
  children: React.ReactNode;
}

interface NavItem {
  route: string;
  icon: React.ReactNode;
  ar: string;
  en: string;
}

interface NavGroup {
  labelAr: string;
  labelEn: string;
  items: NavItem[];
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
  const [railOpen, setRailOpen] = useState(false);

  const availableWorkspaces =
    tenant?.availableOrganizations && tenant.availableOrganizations.length > 0
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
    setRailOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      onNavigate(ROUTES.AUTH.LOGIN);
    }
  };

  const isActive = (routePath: string) => currentPath === routePath;

  const groups: NavGroup[] = [
    {
      labelAr: 'مساحة العمل',
      labelEn: 'Workspace',
      items: [
        { route: ROUTES.APP.OVERVIEW, icon: <IconDashboard size={16} />, ar: 'مركز القيادة', en: 'Command Center' },
        { route: ROUTES.APP.ALERTS, icon: <IconBell size={16} />, ar: 'التنبيهات والإشارات', en: 'Alerts & Signals' }
      ]
    },
    {
      labelAr: 'محركات الذكاء',
      labelEn: 'Intelligence Engines',
      items: [
        { route: ROUTES.APP.FINANCE, icon: <IconFinance size={16} />, ar: 'كشف الانحرافات', en: 'Anomaly Detection' },
        { route: ROUTES.APP.DECISIONS, icon: <IconDecisions size={16} />, ar: 'مركز القرارات', en: 'Decision Center' },
        { route: ROUTES.APP.RISK, icon: <IconRisk size={16} />, ar: 'ذكاء المخاطر', en: 'Risk Intelligence' },
        { route: ROUTES.APP.PROJECTS, icon: <IconProjects size={16} />, ar: 'المشاريع والعقود', en: 'Projects & Contracts' },
        { route: ROUTES.APP.SUPPLIERS, icon: <IconSupplier size={16} />, ar: 'الموردون والمشتريات', en: 'Suppliers & Procurement' },
        { route: ROUTES.APP.CUSTOMERS, icon: <IconCustomer size={16} />, ar: 'العملاء والاحتفاظ', en: 'Customers & Retention' },
        { route: ROUTES.APP.DATA_QUALITY, icon: <IconDataQuality size={16} />, ar: 'جودة البيانات', en: 'Data Quality' }
      ]
    },
    {
      labelAr: 'المساعد',
      labelEn: 'Assistant',
      items: [
        { route: ROUTES.APP.ASSISTANT, icon: <IconAssistant size={16} />, ar: 'المساعد التنفيذي', en: 'Executive Assistant' }
      ]
    },
    {
      labelAr: 'العمليات',
      labelEn: 'Operations',
      items: [
        { route: ROUTES.APP.WORKFLOWS, icon: <IconWorkflow size={16} />, ar: 'سير العمل والسياسات', en: 'Workflows & Policies' },
        { route: ROUTES.APP.REPORTS, icon: <IconFileText size={16} />, ar: 'التقارير وسجل التدقيق', en: 'Reports & Audit Log' }
      ]
    },
    {
      labelAr: 'فريق العمل والتعاون',
      labelEn: 'Team & Collaboration',
      items: [
        { route: ROUTES.APP.TEAM, icon: <IconMessageSquare size={16} />, ar: 'التواصل والمهام', en: 'Team Chat & Tasks' },
        { route: ROUTES.APP.ORGANIZATION, icon: <IconOrganization size={16} />, ar: 'الموظفون والفروع', en: 'Employees & Branches' }
      ]
    },
    {
      labelAr: 'الإدارة',
      labelEn: 'Administration',
      items: [
        { route: ROUTES.APP.INTEGRATIONS, icon: <IconServer size={16} />, ar: 'مصادر البيانات والربط', en: 'Data Sources & Integrations' },
        { route: ROUTES.APP.BILLING, icon: <IconCreditCard size={16} />, ar: 'الاشتراك والفوترة', en: 'Subscription & Billing' },
        { route: ROUTES.APP.SETTINGS, icon: <IconSettings size={16} />, ar: 'الإعدادات', en: 'Settings' }
      ]
    }
  ];

  return (
    <div className="app-shell">
      {/* Workspace navigation rail */}
      <aside className={`app-rail ${railOpen ? 'is-open' : ''}`}>
        <div className="app-rail__brand">
          <button
            onClick={() => handleNav(ROUTES.APP.OVERVIEW)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'start' }}
            title="MIKHLAFI LABS"
          >
            <BrandLogo size="sm" locale={locale} />
          </button>
          <button
            onClick={() => setRailOpen(false)}
            className="ml-icon-btn"
            style={{ marginInlineStart: 'auto', display: railOpen ? 'inline-flex' : 'none' }}
            aria-label="Close navigation"
          >
            <IconX size={16} />
          </button>
        </div>

        <nav className="app-rail__scroll" aria-label={isAr ? 'تنقل مساحة العمل' : 'Workspace navigation'}>
          {user?.isPlatformAdmin && (
            <div style={{ marginBottom: 18 }}>
              <button
                onClick={() => handleNav(ROUTES.ADMIN.OVERVIEW)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-glow)',
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent-light)',
                  cursor: 'pointer',
                  fontSize: 12.5,
                  fontWeight: 600,
                  textAlign: 'start'
                }}
                title={isAr ? 'الانتقال إلى إدارة المنصة' : 'Go to platform administration'}
              >
                <IconShield size={16} />
                <span style={{ flex: 1 }}>{isAr ? 'إدارة المنصة' : 'Platform Administration'}</span>
              </button>
            </div>
          )}

          {groups.map((group, gi) => (
            <div key={gi} className="nav-group">
              <div className="nav-group__label">{isAr ? group.labelAr : group.labelEn}</div>
              {group.items.map((item) => (
                <button
                  key={item.route}
                  onClick={() => handleNav(item.route)}
                  className={`nav-link ${isActive(item.route) ? 'is-active' : ''}`}
                  aria-current={isActive(item.route) ? 'page' : undefined}
                >
                  <span className="nav-link__icon">{item.icon}</span>
                  <span>{isAr ? item.ar : item.en}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="app-rail__foot">
          <div className="org-switcher" title={isAr ? 'عزل المؤسسات متعدد المستأجرين' : 'Multi-tenant isolation'}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-subtle)',
                color: 'var(--accent-light)',
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              {(tenant?.orgNameEn || tenant?.orgNameAr || 'O').charAt(0).toUpperCase()}
            </span>
            <span className="org-switcher__body">
              <span className="org-switcher__name">
                {isAr ? tenant?.orgNameAr || tenant?.orgNameEn : tenant?.orgNameEn || tenant?.orgNameAr}
              </span>
              <span className="org-switcher__meta">
                {tenant?.role ? tenant.role.toUpperCase() : 'MEMBER'} · {tenant?.currency || 'SAR'}
              </span>
            </span>
          </div>

          <select
            value={currentOrgId}
            onChange={(e) => switchOrganization(e.target.value)}
            aria-label={isAr ? 'تبديل مساحة العمل' : 'Switch workspace'}
            style={{
              width: '100%',
              marginTop: 9,
              padding: '7px 9px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-inset)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: 12,
              fontFamily: 'inherit',
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
      </aside>

      {railOpen && <div className="rail-scrim" onClick={() => setRailOpen(false)} />}

      {/* Main column */}
      <div className="app-main">
        <header className="app-topbar">
          <div className="app-topbar__start">
            <button
              onClick={() => setRailOpen(!railOpen)}
              className="ml-icon-btn"
              style={{ display: 'none' }}
              id="rail-toggle"
              aria-label="Open navigation"
            >
              <IconMenu size={18} />
            </button>

            <div className="topbar-context">
              <span className="topbar-context__label">
                {isAr ? 'مساحة العمل النشطة' : 'Active workspace'}
              </span>
              <span className="topbar-context__value">
                {isAr ? tenant?.orgNameAr || tenant?.orgNameEn : tenant?.orgNameEn || tenant?.orgNameAr}
              </span>
            </div>
          </div>

          <div className="app-topbar__end">
            <button
              onClick={() => onNavigate(ROUTES.PUBLIC.HOME)}
              className="ml-btn ml-btn--subtle ml-btn--sm"
              title={isAr ? 'العودة إلى الموقع العام' : 'Back to public site'}
            >
              {isAr ? 'الموقع العام' : 'Public site'}
            </button>

            <button onClick={onToggleLocale} className="ml-icon-btn" title={isAr ? 'English' : 'العربية'} aria-label="Toggle language">
              <IconGlobe size={15} />
            </button>

            <button onClick={onToggleTheme} className="ml-icon-btn" title="Theme" aria-label="Toggle theme">
              {theme === 'dark' ? <IconSun size={15} /> : <IconMoon size={15} />}
            </button>

            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingInlineStart: 6, borderInlineStart: '1px solid var(--border-subtle)' }}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--accent-subtle)',
                    border: '1px solid var(--border-glow)',
                    color: 'var(--accent-light)',
                    fontSize: 12.5,
                    fontWeight: 700
                  }}
                  title={`${user.email}${tenant?.role ? ` · ${tenant.role}` : ''}`}
                >
                  {(user.nameEn || user.email || '?').charAt(0).toUpperCase()}
                </span>

                <button onClick={handleSignOut} className="ml-btn ml-btn--subtle ml-btn--sm">
                  {isAr ? 'خروج' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
};
