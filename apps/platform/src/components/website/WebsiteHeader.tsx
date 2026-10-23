// MIKHLAFI LABS — Public Website Header
// Sticky glass navigation. The engines menu is a quiet index rather than a card
// wall: each engine is stated once, by name, with its ordinal. No taglines, no
// icon tiles, no second competing colour — the titles carry the hierarchy.

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LocaleMode } from '../../types';
import {
  IconGlobe,
  IconMenu,
  IconX,
  IconArrowRight,
  IconChevronDown
} from '../Icons';
import { ROUTES } from '../../router/routes';
import { usePublishedEngines } from '../../hooks/publishedEngines';

interface WebsiteHeaderProps {
  locale: LocaleMode;
  onToggleLocale: () => void;
  onLaunchPlatform: () => void;
  onRequestDemo?: () => void;
  onNavigate?: (path: string) => void;
}

export const WebsiteHeader: React.FC<WebsiteHeaderProps> = ({
  locale,
  onToggleLocale,
  onLaunchPlatform,
  onRequestDemo,
  onNavigate
}) => {
  const isAr = locale === 'ar';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [enginesOpen, setEnginesOpen] = useState(false);
  const [pinnedByClick, setPinnedByClick] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const handleLinkClick = useCallback(
    (e: React.MouseEvent, path: string) => {
      e.preventDefault();
      if (onNavigate) onNavigate(path);
      else {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      setMobileMenuOpen(false);
      setEnginesOpen(false);
      setPinnedByClick(false);
    },
    [onNavigate]
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on outside click and on Escape.
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setEnginesOpen(false);
        setPinnedByClick(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setEnginesOpen(false);
        setPinnedByClick(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Comfortable grace delay (350ms) prevents the panel from vanishing when the pointer
  // travels between trigger and panel or moves diagonally.
  const openEngines = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setEnginesOpen(true);
  };

  const scheduleCloseEngines = () => {
    if (pinnedByClick) return; // Kept open if pinned by user click
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setEnginesOpen(false);
    }, 350);
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setEnginesOpen((prev) => {
      const next = !prev;
      setPinnedByClick(next);
      return next;
    });
  };

  useEffect(() => () => { if (closeTimer.current) window.clearTimeout(closeTimer.current); }, []);

  const navLinkClass = (path: string) => {
    const current = typeof window === 'undefined' ? '' : window.location.pathname;
    return `site-nav__link ${current === path || (path !== '/' && current.startsWith(path)) ? 'is-active' : ''}`;
  };

  const engines = usePublishedEngines();

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
      <div className="ml-container site-header__inner">
        {/* Brand */}
        <a
          href={ROUTES.PUBLIC.HOME}
          onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.HOME)}
          className="site-header__brand"
          aria-label="MIKHLAFI LABS"
        >
          <img
            src="/brand/logo.png"
            alt="MIKHLAFI LABS"
            style={{
              height: '46px',
              width: 'auto',
              maxHeight: '46px',
              display: 'block',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.45))'
            }}
          />
        </a>

        {/* Desktop nav */}
        <nav className="site-nav" aria-label={isAr ? 'التنقل الرئيسي' : 'Primary'}>
          <div
            ref={menuRef}
            className="site-nav__menu"
            onMouseEnter={openEngines}
            onMouseLeave={scheduleCloseEngines}
          >
            <button
              type="button"
              onClick={handleTriggerClick}
              className={`site-nav__link site-nav__trigger ${enginesOpen ? 'is-active' : ''}`}
              aria-expanded={enginesOpen}
              aria-haspopup="true"
            >
              <span>{isAr ? 'المحركات' : 'Engines'}</span>
              <IconChevronDown size={12} />
            </button>

            <div
              className={`site-index-anchor ${enginesOpen ? 'is-open' : ''}`}
              onMouseEnter={openEngines}
              onMouseLeave={scheduleCloseEngines}
            >
              <div className="site-index" role="menu">
                <div className="site-index__head">
                  <span>{isAr ? 'محركات الذكاء التشغيلي' : 'Operational Intelligence Engines'}</span>
                  <span className="ml-mono site-index__count">{String(engines.length).padStart(2, '0')}</span>
                </div>

                <div className="site-index__grid">
                  {engines.map((engine, index) => (
                    <a
                      key={engine.id}
                      role="menuitem"
                      href={`/services/${engine.id}`}
                      onClick={(e) => handleLinkClick(e, `/services/${engine.id}`)}
                      className="site-index__item"
                    >
                      <span className="ml-mono site-index__ordinal">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="site-index__title">{isAr ? engine.titleAr : engine.titleEn}</span>
                      <span className="site-index__chevron" aria-hidden="true">
                        <IconArrowRight size={11} />
                      </span>
                    </a>
                  ))}
                </div>

                <a
                  href={ROUTES.PUBLIC.SOLUTIONS}
                  onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.SOLUTIONS)}
                  className="site-index__foot"
                >
                  <span>{isAr ? 'استعراض كافة الحلول' : 'View all solutions'}</span>
                  <IconArrowRight size={12} />
                </a>
              </div>
            </div>
          </div>

          <a href={ROUTES.PUBLIC.PLATFORM} onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.PLATFORM)} className={navLinkClass(ROUTES.PUBLIC.PLATFORM)}>
            {isAr ? 'المنصة' : 'Platform'}
          </a>
          <a href={ROUTES.PUBLIC.ABOUT} onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.ABOUT)} className={navLinkClass(ROUTES.PUBLIC.ABOUT)}>
            {isAr ? 'عنّا' : 'About'}
          </a>
          <a href={ROUTES.PUBLIC.INDUSTRIES} onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.INDUSTRIES)} className={navLinkClass(ROUTES.PUBLIC.INDUSTRIES)}>
            {isAr ? 'القطاعات' : 'Industries'}
          </a>
          <a href={ROUTES.PUBLIC.DEPLOYMENT} onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.DEPLOYMENT)} className={navLinkClass(ROUTES.PUBLIC.DEPLOYMENT)}>
            {isAr ? 'نماذج التشغيل والباقات' : 'Deployment & Plans'}
          </a>
        </nav>

        {/* Actions */}
        <div className="site-header__actions">
          <button onClick={onToggleLocale} className="ml-icon-btn" title={isAr ? 'English' : 'العربية'} aria-label="Toggle language">
            <IconGlobe size={15} />
          </button>

          <button
            onClick={onRequestDemo || onLaunchPlatform}
            className="ml-btn ml-btn--ghost ml-btn--sm site-header__desktop-only"
          >
            {isAr ? 'اطلب عرضاً' : 'Request demo'}
          </button>

          <button onClick={onLaunchPlatform} className="ml-btn ml-btn--primary ml-btn--sm site-header__desktop-only">
            <span>{isAr ? 'دخول المنصة' : 'Sign in'}</span>
            <IconArrowRight size={13} />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-icon-btn site-nav-toggle"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <IconX size={18} /> : <IconMenu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="site-mobile-menu">
          <a href={ROUTES.PUBLIC.PLATFORM} onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.PLATFORM)} className="site-mobile-menu__link">
            {isAr ? 'المنصة' : 'Platform'}
          </a>
          <a href={ROUTES.PUBLIC.SOLUTIONS} onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.SOLUTIONS)} className="site-mobile-menu__link">
            {isAr ? 'المحركات والحلول' : 'Engines & Solutions'}
          </a>
          <a href={ROUTES.PUBLIC.ABOUT} onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.ABOUT)} className="site-mobile-menu__link">
            {isAr ? 'عنّا' : 'About'}
          </a>
          <a href={ROUTES.PUBLIC.INDUSTRIES} onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.INDUSTRIES)} className="site-mobile-menu__link">
            {isAr ? 'القطاعات' : 'Industries'}
          </a>
          <a href={ROUTES.PUBLIC.DEPLOYMENT} onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.DEPLOYMENT)} className="site-mobile-menu__link">
            {isAr ? 'نماذج التشغيل والباقات' : 'Deployment & Plans'}
          </a>
          <a href={ROUTES.PUBLIC.CONTACT} onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.CONTACT)} className="site-mobile-menu__link">
            {isAr ? 'تواصل معنا' : 'Contact'}
          </a>

          <div className="site-mobile-menu__engines">
            {engines.map((engine, index) => (
              <a
                key={engine.id}
                href={`/services/${engine.id}`}
                onClick={(e) => handleLinkClick(e, `/services/${engine.id}`)}
                className="site-index__item"
              >
                <span className="ml-mono site-index__ordinal">{String(index + 1).padStart(2, '0')}</span>
                <span className="site-index__title">{isAr ? engine.titleAr : engine.titleEn}</span>
              </a>
            ))}
          </div>

          <div className="site-mobile-menu__cta">
            <button onClick={onLaunchPlatform} className="ml-btn ml-btn--primary ml-btn--block">
              {isAr ? 'دخول المنصة' : 'Sign in'}
            </button>
            <button onClick={() => { setMobileMenuOpen(false); onRequestDemo?.(); }} className="ml-btn ml-btn--ghost ml-btn--block">
              {isAr ? 'اطلب عرضاً' : 'Request demo'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
