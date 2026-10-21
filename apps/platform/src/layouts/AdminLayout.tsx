// MIKHLAFI LABS — Platform Administration Layout
// Dedicated shell for /admin/*, architecturally decoupled from customer workspaces.
// Communicates a privileged, fully audited session clearly without alarmist styling.

import React, { useState } from 'react';
import { LocaleMode, ThemeMode } from '../types';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../router/routes';
import {
  IconDashboard,
  IconOrganization,
  IconCustomer,
  IconFileText,
  IconServer,
  IconX,
  IconMenu,
  IconGlobe,
  IconSun,
  IconMoon,
  IconShield,
  IconCreditCard,
  IconSettings,
  IconLayers
} from '../components/Icons';

interface AdminLayoutProps {
  theme: ThemeMode;
  locale: LocaleMode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onToggleTheme: () => void;
  onToggleLocale: () => void;
  children: React.ReactNode;
}

interface AdminNavItem {
  route: string;
  icon: React.ReactNode;
  ar: string;
  en: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  theme,
  locale,
  currentPath,
  onNavigate,
  onToggleTheme,
  onToggleLocale,
  children
}) => {
  const isAr = locale === 'ar';
  const { user, logout } = useAuth();
  const [railOpen, setRailOpen] = useState(false);

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

  const groups: Array<{ labelAr: string; labelEn: string; items: AdminNavItem[] }> = [
    {
      labelAr: 'المؤشرات',
      labelEn: 'Overview',
      items: [
        { route: ROUTES.ADMIN.OVERVIEW, icon: <IconDashboard size={16} />, ar: 'حالة المنصة', en: 'Platform Status' }
      ]
    },
    {
      labelAr: 'التجاري',
      labelEn: 'Commercial',
      items: [
        { route: ROUTES.ADMIN.ORGANIZATIONS, icon: <IconOrganization size={16} />, ar: 'المؤسسات والمستأجرون', en: 'Organizations & Tenants' },
        { route: ROUTES.ADMIN.SERVICES, icon: <IconLayers size={16} />, ar: 'إدارة الخدمات', en: 'Service Catalog' },
        { route: ROUTES.ADMIN.PACKAGES, icon: <IconCreditCard size={16} />, ar: 'الباقات والتسعير', en: 'Packages & Pricing' },
        { route: ROUTES.ADMIN.LEADS, icon: <IconFileText size={16} />, ar: 'طلبات التواصل', en: 'Inbound Inquiries' },
        { route: ROUTES.ADMIN.LICENSES, icon: <IconSettings size={16} />, ar: 'التراخيص', en: 'Licenses' }
      ]
    },
    {
      labelAr: 'الأمن والحوكمة',
      labelEn: 'Security & Governance',
      items: [
        { route: ROUTES.ADMIN.USERS, icon: <IconCustomer size={16} />, ar: 'دليل المستخدمين', en: 'User Directory' },
        { route: ROUTES.ADMIN.AUDIT, icon: <IconServer size={16} />, ar: 'سجل التدقيق', en: 'Audit Log' }
      ]
    }
  ];

  return (
    <div className="admin-shell">
      {/* Privileged session ribbon */}
      <div
        style={{
          position: 'fixed',
          insetInline: 0,
          top: 0,
          height: 30,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
          padding: '0 16px',
          background: 'linear-gradient(90deg, #1B1206, #2A1C08, #1B1206)',
          borderBottom: '1px solid rgba(184, 137, 74, 0.4)',
          color: 'var(--accent-light)',
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: '0.03em',
          textAlign: 'center'
        }}
        role="status"
      >
        <IconShield size={13} />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {isAr
            ? 'جلسة إدارية معتمدة — كل إجراء يُسجَّل في سجل التدقيق غير القابل للتعديل'
            : 'Privileged administration session — every action is written to the immutable audit log'}
        </span>
      </div>

      {/* Administration rail */}
      <aside className={`admin-rail ${railOpen ? 'is-open' : ''}`} style={{ top: 30, height: 'calc(100vh - 30px)' }}>
        <div className="admin-rail__brand">
          <span className="admin-rail__crest">ML</span>
          <span>
            <span className="admin-rail__title">MIKHLAFI LABS</span>
            <span className="admin-rail__sub">{isAr ? 'إدارة المنصة' : 'Platform Admin'}</span>
          </span>
          <button
            onClick={() => setRailOpen(false)}
            className="ml-icon-btn"
            style={{ marginInlineStart: 'auto', display: railOpen ? 'inline-flex' : 'none' }}
            aria-label="Close navigation"
          >
            <IconX size={16} />
          </button>
        </div>

        <nav className="admin-rail__scroll" aria-label={isAr ? 'تنقل الإدارة' : 'Administration'}>
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

          <div className="nav-group">
            <div className="nav-group__label">{isAr ? 'روابط' : 'Links'}</div>
            <button onClick={() => handleNav(ROUTES.PUBLIC.HOME)} className="nav-link">
              <span className="nav-link__icon">
                <IconFileText size={16} />
              </span>
              <span>{isAr ? 'الموقع العام' : 'Public website'}</span>
            </button>
            <button onClick={() => handleNav(ROUTES.APP.OVERVIEW)} className="nav-link">
              <span className="nav-link__icon">
                <IconOrganization size={16} />
              </span>
              <span>{isAr ? 'مساحة العمل' : 'Customer workspace'}</span>
            </button>
          </div>
        </nav>
      </aside>

      {railOpen && <div className="rail-scrim" onClick={() => setRailOpen(false)} />}

      {/* Main column */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="app-topbar__start">
            <button
              onClick={() => setRailOpen(!railOpen)}
              className="ml-icon-btn"
              style={{ display: 'none' }}
              id="admin-rail-toggle"
              aria-label="Open navigation"
            >
              <IconMenu size={18} />
            </button>

            <div className="topbar-context">
              <span className="topbar-context__label">{isAr ? 'الصلاحية' : 'Privilege'}</span>
              <span className="topbar-context__value" style={{ color: 'var(--accent-light)' }}>
                {isAr ? 'مدير المنصة' : 'Platform administrator'}
              </span>
            </div>
          </div>

          <div className="app-topbar__end">
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
                  title={user.email}
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

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};
