import React, { useState } from 'react';
import { LocaleMode, ThemeMode } from '../../types';
import { IconGlobe, IconSun, IconMoon, IconMenu, IconX, IconArrowRight } from '../Icons';

interface WebsiteHeaderProps {
  locale: LocaleMode;
  theme: ThemeMode;
  onToggleLocale: () => void;
  onToggleTheme: () => void;
  onLaunchPlatform: () => void;
  onRequestDemo: () => void;
}

export const WebsiteHeader: React.FC<WebsiteHeaderProps> = ({
  locale,
  theme,
  onToggleLocale,
  onToggleTheme,
  onLaunchPlatform,
  onRequestDemo
}) => {
  const isAr = locale === 'ar';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-navbar">
      <div className="site-container navbar-inner">
        {/* Brand Wordmark & Emblem */}
        <a href="#hero" className="brand-emblem">
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
          <a href="#solutions" className="nav-anchor">
            {isAr ? 'المحركات' : 'Intelligence'}
          </a>
          <a href="#how-it-works" className="nav-anchor">
            {isAr ? 'المنهجية' : 'Methodology'}
          </a>
          <a href="#integrations" className="nav-anchor">
            {isAr ? 'التكامل المؤسسي' : 'Integrations'}
          </a>
          <a href="#industries" className="nav-anchor">
            {isAr ? 'القطاعات' : 'Industries'}
          </a>
          <a href="#security" className="nav-anchor">
            {isAr ? 'الأمان والسيادة' : 'Security'}
          </a>
          <a href="#pricing" className="nav-anchor">
            {isAr ? 'الباقات' : 'Packages'}
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

          {/* Launch Customer Platform */}
          <button
            onClick={onLaunchPlatform}
            className="btn-secondary"
            style={{ display: 'none' }} // shown via media query or default
          >
            <span>{isAr ? 'دخول المنصة' : 'Client Login'}</span>
          </button>

          {/* Request Demo CTA */}
          <button
            onClick={onRequestDemo}
            className="btn-primary"
          >
            <span>{isAr ? 'طلب عرض مخصص' : 'Request Demo'}</span>
            <IconArrowRight size={14} />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ctrl-btn"
            style={{ display: 'none' }} // enabled on mobile
          >
            {mobileMenuOpen ? <IconX size={18} /> : <IconMenu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};
