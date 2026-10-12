// MIKHLAFI LABS — Public Website Header
// Owns brand wordmark, public navigation links, language/theme toggles, and authentication entry points

import React, { useState } from 'react';
import { LocaleMode, ThemeMode } from '../../types';
import { IconGlobe, IconSun, IconMoon, IconMenu, IconX, IconArrowRight } from '../Icons';
import { ROUTES } from '../../router/routes';

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

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-navbar">
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
        <nav className="nav-links" style={{ display: mobileMenuOpen ? 'none' : undefined }}>
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
            className="ctrl-btn"
            style={{ display: 'none' }}
          >
            {mobileMenuOpen ? <IconX size={18} /> : <IconMenu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};
