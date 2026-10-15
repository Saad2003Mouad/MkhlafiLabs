// MIKHLAFI LABS — Public Website Header
// Owns brand wordmark, public navigation links, services dropdown, language/theme toggles, and authentication entry points

import React, { useState, useRef, useEffect } from 'react';
import { LocaleMode, ThemeMode } from '../../types';
import {
  IconGlobe,
  IconSun,
  IconMoon,
  IconMenu,
  IconX,
  IconArrowRight,
  IconChevronDown,
  IconFileText,
  IconCheckCircle,
  IconAlertTriangle,
  IconTrendingUp,
  IconTruck,
  IconUsers,
  IconBot,
  IconDatabase
} from '../Icons';
import { ROUTES } from '../../router/routes';
import { SERVICES_CATALOG } from '../../data/servicesData';

interface WebsiteHeaderProps {
  locale: LocaleMode;
  theme: ThemeMode;
  onToggleLocale: () => void;
  onToggleTheme: () => void;
  onLaunchPlatform: () => void; // Navigates to /login
  onRequestDemo: () => void;
  onNavigate?: (path: string) => void;
}

export const WebsiteHeader: React.FC<WebsiteHeaderProps> = ({
  locale,
  theme,
  onToggleLocale,
  onToggleTheme,
  onLaunchPlatform,
  onRequestDemo,
  onNavigate
}) => {
  const isAr = locale === 'ar';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    setMobileMenuOpen(false);
    setServicesOpen(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getServiceIcon = (iconName: string, size = 18) => {
    switch (iconName) {
      case 'file-text': return <IconFileText size={size} />;
      case 'check-circle': return <IconCheckCircle size={size} />;
      case 'alert-triangle': return <IconAlertTriangle size={size} />;
      case 'trending-up': return <IconTrendingUp size={size} />;
      case 'truck': return <IconTruck size={size} />;
      case 'users': return <IconUsers size={size} />;
      case 'bot': return <IconBot size={size} />;
      case 'database': return <IconDatabase size={size} />;
      default: return <IconFileText size={size} />;
    }
  };

  return (
    <header className="site-navbar" style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)', background: 'var(--bg-surface-glass)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="site-container navbar-inner">
        {/* Brand Wordmark & Emblem */}
        <a
          href={ROUTES.PUBLIC.HOME}
          onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.HOME)}
          className="brand-emblem"
        >
          <div className="brand-symbol">M</div>
          <div className="brand-meta">
            <span className="brand-name">MIKHLAFI LABS</span>
            <span className="brand-sub">
              {isAr ? 'أنظمة · ذكاء · ابتكار' : 'INTELLIGENCE · SYSTEMS · INNOVATION'}
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="nav-links" style={{ display: mobileMenuOpen ? 'none' : undefined, alignItems: 'center' }}>
          {/* Services & Engines Dropdown Menu */}
          <div
            ref={dropdownRef}
            style={{ position: 'relative' }}
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              onClick={() => setServicesOpen(!servicesOpen)}
              className="nav-anchor"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '14px',
                color: servicesOpen ? 'var(--accent-light)' : 'var(--text-secondary)'
              }}
            >
              <span>{isAr ? 'الخدمات والمحركات' : 'Services & Engines'}</span>
              <span style={{ transform: servicesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', display: 'flex' }}>
                <IconChevronDown size={14} />
              </span>
            </button>

            {/* Mega Dropdown Panel */}
            {servicesOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  insetInlineStart: '-140px',
                  width: '640px',
                  padding: '20px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.6), var(--shadow-glow)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  zIndex: 200,
                  backdropFilter: 'blur(24px)'
                }}
              >
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {isAr ? 'محركات الذكاء المؤسسي الحتمية' : 'DETERMINISTIC INTELLIGENCE ENGINES'}
                  </span>
                  <a
                    href={ROUTES.PUBLIC.SOLUTIONS}
                    onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.SOLUTIONS)}
                    style={{ fontSize: '12px', color: 'var(--text-tertiary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>{isAr ? 'عرض الفهرس الكامل' : 'All Solutions'}</span>
                    <IconArrowRight size={12} />
                  </a>
                </div>

                {SERVICES_CATALOG.map((svc) => (
                  <a
                    key={svc.id}
                    href={`/services/${svc.id}`}
                    onClick={(e) => handleLinkClick(e, `/services/${svc.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease'
                    }}
                    className="dropdown-service-item"
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: `${svc.accentColor}18`,
                        color: svc.accentColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {getServiceIcon(svc.iconName, 16)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {isAr ? svc.titleAr : svc.titleEn}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>
                        {isAr ? svc.taglineAr : svc.taglineEn}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <a
            href={ROUTES.PUBLIC.PLATFORM}
            onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.PLATFORM)}
            className="nav-anchor"
          >
            {isAr ? 'المنظومة' : 'Platform'}
          </a>
          <a
            href={ROUTES.PUBLIC.SOLUTIONS}
            onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.SOLUTIONS)}
            className="nav-anchor"
          >
            {isAr ? 'الحلول' : 'Solutions'}
          </a>
          <a
            href={ROUTES.PUBLIC.INDUSTRIES}
            onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.INDUSTRIES)}
            className="nav-anchor"
          >
            {isAr ? 'القطاعات' : 'Industries'}
          </a>
          <a
            href={ROUTES.PUBLIC.PRICING}
            onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.PRICING)}
            className="nav-anchor"
          >
            {isAr ? 'الباقات' : 'Pricing'}
          </a>
          <a
            href={ROUTES.PUBLIC.ABOUT}
            onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.ABOUT)}
            className="nav-anchor"
          >
            {isAr ? 'عن الشركة' : 'About'}
          </a>
          <a
            href={ROUTES.PUBLIC.CONTACT}
            onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.CONTACT)}
            className="nav-anchor"
          >
            {isAr ? 'تواصل معنا' : 'Contact'}
          </a>
        </nav>

        {/* Action Controls */}
        <div className="nav-actions">
          {/* Language Selector */}
          <button
            onClick={onToggleLocale}
            className="ctrl-btn"
            title={isAr ? 'تبديل إلى الإنجليزية' : 'Switch to Arabic'}
          >
            <IconGlobe size={14} />
            <span>{isAr ? 'EN' : 'عربي'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="ctrl-btn"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />}
          </button>

          {/* Platform Owner / Admin Link */}
          <button
            onClick={(e) => handleLinkClick(e, ROUTES.ADMIN.OVERVIEW)}
            className="ctrl-btn"
            style={{
              fontSize: '11px',
              padding: '6px 10px',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              fontWeight: 700
            }}
            title={isAr ? 'غرفة عمليات إدارة المنصة (مالك المشروع)' : 'Platform Owner Control Room'}
          >
            <span>🛡️</span>
            <span>{isAr ? 'إدارة المنصة' : 'Admin'}</span>
          </button>

          {/* Sign In CTA */}
          <button
            onClick={onLaunchPlatform}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '7px 14px' }}
          >
            <span>{isAr ? 'دخول العملاء' : 'Sign In'}</span>
          </button>

          {/* Request Demo CTA */}
          <button
            onClick={onRequestDemo}
            className="btn-primary"
            style={{ fontSize: '12px', padding: '7px 14px' }}
          >
            <span>{isAr ? 'طلب عرض مخصص' : 'Request Demo'}</span>
            <IconArrowRight size={13} />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ctrl-btn mobile-menu-toggle"
            style={{ display: 'none' }}
          >
            {mobileMenuOpen ? <IconX size={18} /> : <IconMenu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-default)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-light)', textTransform: 'uppercase' }}>
            {isAr ? 'الخدمات والمحركات (8)' : 'SERVICES & ENGINES (8)'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            {SERVICES_CATALOG.map((svc) => (
              <a
                key={svc.id}
                href={`/services/${svc.id}`}
                onClick={(e) => handleLinkClick(e, `/services/${svc.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  textDecoration: 'none'
                }}
              >
                <span style={{ color: svc.accentColor }}>●</span>
                <span>{isAr ? svc.titleAr : svc.titleEn}</span>
              </a>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href={ROUTES.PUBLIC.PLATFORM} onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.PLATFORM)} style={{ fontSize: '14px', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>{isAr ? 'المنظومة' : 'Platform'}</a>
            <a href={ROUTES.PUBLIC.SOLUTIONS} onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.SOLUTIONS)} style={{ fontSize: '14px', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>{isAr ? 'الحلول' : 'Solutions'}</a>
            <a href={ROUTES.PUBLIC.INDUSTRIES} onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.INDUSTRIES)} style={{ fontSize: '14px', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>{isAr ? 'القطاعات' : 'Industries'}</a>
            <a href={ROUTES.PUBLIC.PRICING} onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.PRICING)} style={{ fontSize: '14px', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>{isAr ? 'الباقات' : 'Pricing'}</a>
            <a href={ROUTES.PUBLIC.ABOUT} onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.ABOUT)} style={{ fontSize: '14px', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>{isAr ? 'عن الشركة' : 'About'}</a>
            <a href={ROUTES.PUBLIC.CONTACT} onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.CONTACT)} style={{ fontSize: '14px', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>{isAr ? 'تواصل معنا' : 'Contact'}</a>
          </div>
        </div>
      )}
    </header>
  );
};
