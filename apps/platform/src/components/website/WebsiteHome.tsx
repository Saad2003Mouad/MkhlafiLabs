// MIKHLAFI LABS — Public Homepage Sections
// Renders the marketing narrative, hero cockpit showcase, 8 engines, methodology, and FAQ

import React, { useState } from 'react';
import { LocaleMode, PricingPackage } from '../../types';
import { HeroSection } from './HeroSection';
import { ChallengesSection } from './ChallengesSection';
import { IntelligenceSuiteSection } from './IntelligenceSuiteSection';
import { RoiCalculatorSection } from './RoiCalculatorSection';
import { HowItWorksSection } from './HowItWorksSection';
import { PhilosophySection } from './PhilosophySection';
import { IntegrationsSection } from './IntegrationsSection';
import { CrossIndustrySection } from './CrossIndustrySection';
import { SecurityGovernanceSection } from './SecurityGovernanceSection';
import { PricingPackagesSection } from './PricingPackagesSection';
import { FaqSection } from './FaqSection';
import { DemoModal } from './DemoModal';

interface WebsiteHomeProps {
  locale: LocaleMode;
  onNavigatePlatform: () => void;
  onNavigateDetail: (moduleId?: string) => void;
}

export const WebsiteHome: React.FC<WebsiteHomeProps> = ({
  locale,
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

      {/* Interactive Margin Leak & ROI Simulator */}
      <RoiCalculatorSection
        locale={locale}
        onRequestAudit={() => handleOpenDemo()}
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
