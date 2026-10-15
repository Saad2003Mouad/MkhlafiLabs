// MIKHLAFI LABS — Platform Operator Dedicated Layout
// Architecturally decoupled from customer workspaces (/admin/*)
// Displays high-contrast privileged session indicator and audit accountability

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
  IconMoon
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
    <div className="app-layout" style={{ background: '#05070a' }}>
      {/* High-Security Privileged Top Banner */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '28px',
          background: 'linear-gradient(90deg, #7f1d1d, #991b1b, #7f1d1d)',
          color: '#fef2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.04em',
          zIndex: 2000,
          padding: '0 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
        }}
      >
        <span>🛡️</span>
        <span>
          {isAr
            ? 'جلسة مشغّل منصة معتمدة — كافة العمليات تخضع للتدقيق المباشر في سجل platform_audit_logs'
            : 'PRIVILEGED PLATFORM OPERATOR SESSION — All administrative actions are recorded in platform_audit_logs'}
        </span>
      </div>

      {/* Operator Sidebar */}
      <aside
        className="app-sidebar"
        style={{
          marginTop: '28px',
          height: 'calc(100vh - 28px)',
          borderInlineEnd: '1px solid rgba(239, 68, 68, 0.25)',
          background: 'linear-gradient(180deg, #090d14 0%, #06090f 100%)',
          display: mobileSidebarOpen ? 'flex' : undefined,
          position: mobileSidebarOpen ? 'fixed' : undefined,
          zIndex: mobileSidebarOpen ? 1500 : undefined,
          top: 0,
          insetInlineStart: 0
        }}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header" style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <button
            onClick={() => handleNav(ROUTES.ADMIN.OVERVIEW)}
            className="brand-emblem"
            style={{ textAlign: 'start', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div
              className="brand-symbol"
              style={{
                width: '32px',
                height: '32px',
                fontSize: '15px',
                background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                boxShadow: '0 0 14px rgba(220, 38, 38, 0.4)'
              }}
            >
              M
            </div>
            <div className="brand-meta">
              <span className="brand-name" style={{ fontSize: '13px', color: '#f87171' }}>
                MIKHLAFI CONTROL
              </span>
              <span className="brand-sub" style={{ fontSize: '8px', color: '#fca5a5' }}>
                {isAr ? 'غرفة عمليات إدارة المنظومة' : 'PLATFORM ADMINISTRATION'}
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
          <div className="nav-section-title" style={{ color: '#f87171' }}>
            {isAr ? 'لوحة تحكم المشغّل' : 'OPERATOR SWITCHBOARD'}
          </div>

          <button
            onClick={() => handleNav(ROUTES.ADMIN.OVERVIEW)}
            className={`nav-item ${isActive(ROUTES.ADMIN.OVERVIEW) ? 'active' : ''}`}
          >
            <IconDashboard size={16} />
            <span>{isAr ? 'المؤشرات والوضع العام' : 'Platform Overview'}</span>
          </button>

          <button
            onClick={() => handleNav(ROUTES.ADMIN.ORGANIZATIONS)}
            className={`nav-item ${isActive(ROUTES.ADMIN.ORGANIZATIONS) ? 'active' : ''}`}
          >
            <IconOrganization size={16} />
            <span>{isAr ? 'إدارة المؤسسات والمستأجرين' : 'Tenant Organizations'}</span>
          </button>

          <button
            onClick={() => handleNav(ROUTES.ADMIN.USERS)}
            className={`nav-item ${isActive(ROUTES.ADMIN.USERS) ? 'active' : ''}`}
          >
            <IconCustomer size={16} />
            <span>{isAr ? 'المستخدمون والحسابات' : 'Global Users Directory'}</span>
          </button>

          <button
            onClick={() => handleNav(ROUTES.ADMIN.LEADS)}
            className={`nav-item ${isActive(ROUTES.ADMIN.LEADS) ? 'active' : ''}`}
          >
            <IconFileText size={16} />
            <span>{isAr ? 'طلبات العروض والتواصل' : 'Inbound Demo Inquiries'}</span>
          </button>

          <button
            onClick={() => handleNav(ROUTES.ADMIN.PACKAGES)}
            className={`nav-item ${isActive(ROUTES.ADMIN.PACKAGES) ? 'active' : ''}`}
          >
            <span>📦</span>
            <span>{isAr ? 'إدارة الباقات والتسعير' : 'Packages & Pricing'}</span>
          </button>

          <button
            onClick={() => handleNav(ROUTES.ADMIN.LICENSES)}
            className={`nav-item ${isActive(ROUTES.ADMIN.LICENSES) ? 'active' : ''}`}
          >
            <span>🔑</span>
            <span>{isAr ? 'مولّد التراخيص المشفرة' : 'Offline License Generator'}</span>
          </button>

          <button
            onClick={() => handleNav(ROUTES.ADMIN.AUDIT)}
            className={`nav-item ${isActive(ROUTES.ADMIN.AUDIT) ? 'active' : ''}`}
          >
            <IconServer size={16} />
            <span>{isAr ? 'سجل التدقيق الأمني العام' : 'Security Audit Trail'}</span>
          </button>

          <div className="nav-section-title" style={{ marginTop: '24px' }}>
            {isAr ? 'روابط المنصة الخارجية' : 'PUBLIC LINKS'}
          </div>

          <button
            onClick={() => handleNav(ROUTES.PUBLIC.HOME)}
            className="nav-item"
            style={{ opacity: 0.8 }}
          >
            <span>🌐 {isAr ? 'زيارة الموقع التعريفي العام (/)' : 'Visit Public Site (/)'}</span>
          </button>
        </nav>
      </aside>

      {/* Main Admin Content */}
      <main className="app-main" style={{ marginTop: '28px', minHeight: 'calc(100vh - 28px)' }}>
        {/* Top Header */}
        <header
          className="app-header"
          style={{
            borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
            background: 'rgba(9, 13, 20, 0.85)'
          }}
        >
          <div className="header-left">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="ctrl-btn"
              style={{ display: 'none' }}
            >
              <IconMenu size={18} />
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '11px',
                color: '#fca5a5',
                fontWeight: 700
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              <span>{isAr ? 'وضع التحكم الإداري الأعلى' : 'GLOBAL PLATFORM ROOT ACCESS'}</span>
            </div>
          </div>

          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Lang Toggle */}
            <button onClick={onToggleLocale} className="ctrl-btn" style={{ padding: '6px 9px' }} title="Toggle Language">
              <IconGlobe size={14} />
              <span>{isAr ? 'EN' : 'عربي'}</span>
            </button>

            {/* Theme Toggle */}
            <button onClick={onToggleTheme} className="ctrl-btn" style={{ padding: '6px 9px' }} title="Toggle Theme">
              {theme === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />}
            </button>

            {/* Operator Identity Badge */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(220, 38, 38, 0.2)',
                    border: '1px solid #ef4444',
                    color: '#fecaca',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  <span>{user.email}</span>
                  <span
                    style={{
                      fontSize: '9px',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      background: '#ef4444',
                      color: '#fff'
                    }}
                  >
                    ROOT ADMIN
                  </span>
                </div>

                <button
                  onClick={handleSignOut}
                  className="ctrl-btn"
                  style={{ fontSize: '11px', padding: '5px 8px', color: '#f87171' }}
                  title={isAr ? 'إنهاء جلسة المشغّل' : 'Sign Out'}
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
