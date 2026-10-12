// MIKHLAFI LABS — Public Website Layout
// Provides universal public header, marketing footer, language/theme controls, and demo request modal
// Never contains customer sidebar or requires authenticated session

import React, { useState } from 'react';
import { LocaleMode, ThemeMode } from '../types';
import { WebsiteHeader } from '../components/website/WebsiteHeader';
import { WebsiteFooter } from '../components/website/WebsiteFooter';
import { DemoModal } from '../components/website/DemoModal';

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
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="website-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Public Marketing Header */}
      <WebsiteHeader
        locale={locale}
        theme={theme}
        onToggleLocale={onToggleLocale}
        onToggleTheme={onToggleTheme}
        onLaunchPlatform={() => onNavigate('/login')}
        onRequestDemo={() => setIsDemoModalOpen(true)}
        onNavigate={onNavigate}
      />

      {/* Main Page Body */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Public Marketing Footer */}
      <WebsiteFooter
        locale={locale}
        onExplorePlatform={() => onNavigate('/platform')}
        onRequestDemo={() => setIsDemoModalOpen(true)}
        onNavigate={onNavigate}
      />

      {/* Interactive Demo Request Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        locale={locale}
        onSuccessLaunch={() => {
          setIsDemoModalOpen(false);
          onNavigate('/platform');
        }}
      />
    </div>
  );
};
