import React, { useState } from 'react';
import { LocaleMode, ThemeMode, PricingPackage } from '../../types';
import { WebsiteHeader } from './WebsiteHeader';
import { HeroSection } from './HeroSection';
import { ChallengesSection } from './ChallengesSection';
import { IntelligenceSuiteSection } from './IntelligenceSuiteSection';
import { HowItWorksSection } from './HowItWorksSection';
import { PhilosophySection } from './PhilosophySection';
import { IntegrationsSection } from './IntegrationsSection';
import { CrossIndustrySection } from './CrossIndustrySection';
import { SecurityGovernanceSection } from './SecurityGovernanceSection';
import { PricingPackagesSection } from './PricingPackagesSection';
import { FaqSection } from './FaqSection';
import { WebsiteFooter } from './WebsiteFooter';
import { DemoModal } from './DemoModal';

interface WebsiteHomeProps {
  locale: LocaleMode;
  theme: ThemeMode;
  onToggleLocale: () => void;
  onToggleTheme: () => void;
  onNavigatePlatform: () => void;
  onNavigateDetail: (moduleId?: string) => void;
}

export const WebsiteHome: React.FC<WebsiteHomeProps> = ({
  locale,
  theme,
  onToggleLocale,
  onToggleTheme,
  onNavigatePlatform,
  onNavigateDetail
}) => {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<PricingPackage | null>(null);

  const handleOpenDemo = (pkg?: PricingPackage) => {
    setSelectedPkg(pkg || null);
    setDemoModalOpen(true);
  };

  return (
    <div className="website-wrapper">
      {/* Sticky Top Header */}
      <WebsiteHeader
        locale={locale}
        theme={theme}
        onToggleLocale={onToggleLocale}
        onToggleTheme={onToggleTheme}
        onLaunchPlatform={onNavigatePlatform}
        onRequestDemo={() => handleOpenDemo()}
      />

      {/* Main Page Flow */}
      <main>
        {/* Hero Section with Purpose-Built Cockpit Preview */}
        <HeroSection
          locale={locale}
          onExplorePlatform={onNavigatePlatform}
          onRequestDemo={() => handleOpenDemo()}
        />

        {/* The 6 Real Business Challenges */}
        <ChallengesSection locale={locale} />

        {/* The 8 Modular Intelligence Engines */}
        <IntelligenceSuiteSection
          locale={locale}
          onSelectModule={(modId) => onNavigateDetail(modId)}
        />

        {/* 4-Step Deterministic Forensic Methodology */}
        <HowItWorksSection locale={locale} />

        {/* Sovereign Philosophy & Architecture Mesh Showcase */}
        <PhilosophySection locale={locale} />

        {/* Non-Invasive Enterprise ERP Integrations Strip */}
        <IntegrationsSection locale={locale} />

        {/* Cross-Industry Agnosticism & Sectors */}
        <CrossIndustrySection locale={locale} />

        {/* Sovereign Security & Governance */}
        <SecurityGovernanceSection locale={locale} />

        {/* Transparent Subscription Packages */}
        <PricingPackagesSection
          locale={locale}
          onSelectPackage={(pkg) => handleOpenDemo(pkg)}
        />

        {/* Frequently Asked Questions */}
        <FaqSection locale={locale} />
      </main>

      {/* Footer */}
      <WebsiteFooter
        locale={locale}
        onExplorePlatform={onNavigatePlatform}
        onRequestDemo={() => handleOpenDemo()}
      />

      {/* Interactive Demo / Free Trial Modal */}
      <DemoModal
        locale={locale}
        isOpen={demoModalOpen}
        selectedPackage={selectedPkg}
        onClose={() => setDemoModalOpen(false)}
        onSuccessLaunch={onNavigatePlatform}
      />
    </div>
  );
};
