// MIKHLAFI LABS — Public Website Layout
// Shell for the unauthenticated marketing site: sticky header, page body, footer,
// and the inbound inquiry dialog. Never renders customer navigation and never
// requires a session. There is no entrance animation gating page content.

import React, { useState } from 'react';
import { LocaleMode, ThemeMode } from '../types';
import { WebsiteHeader } from '../components/website/WebsiteHeader';
import { WebsiteFooter } from '../components/website/WebsiteFooter';
import { DemoModal } from '../components/website/DemoModal';
import { AmbientBackdrop } from '../components/common/AmbientBackdrop';
import { RevealEngine } from '../components/common/RevealEngine';

interface PublicLayoutProps {
  locale: LocaleMode;
  theme: ThemeMode;
  onToggleLocale: () => void;
  onToggleTheme: () => void;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  locale,
  theme,
  onToggleLocale,
  onToggleTheme,
  onNavigate,
  children
}) => {
  const isAr = locale === 'ar';
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="site-shell">
      {/* Decorative animated light field — presentational only */}
      <AmbientBackdrop />
      {/* Scroll-linked entrance motion for section content */}
      <RevealEngine />

      {/* Skip link — first focusable element on the page */}
      <a className="site-skip-link" href="#main-content">
        {isAr ? 'تجاوز إلى المحتوى الرئيسي' : 'Skip to main content'}
      </a>

      <WebsiteHeader
        locale={locale}
        theme={theme}
        onToggleLocale={onToggleLocale}
        onToggleTheme={onToggleTheme}
        onLaunchPlatform={() => onNavigate('/login')}
        onRequestDemo={() => setIsDemoModalOpen(true)}
        onNavigate={onNavigate}
      />

      <main id="main-content" className="site-main" tabIndex={-1}>
        {children}
      </main>

      <WebsiteFooter
        locale={locale}
        onExplorePlatform={() => onNavigate('/platform')}
        onRequestDemo={() => setIsDemoModalOpen(true)}
        onNavigate={onNavigate}
      />

      {/* Inbound inquiry — records a real lead; grants no access by itself */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        locale={locale}
        onSuccessLaunch={() => {
          setIsDemoModalOpen(false);
          onNavigate('/register');
        }}
      />
    </div>
  );
};
