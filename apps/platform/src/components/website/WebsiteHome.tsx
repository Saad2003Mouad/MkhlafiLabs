// MIKHLAFI LABS — Public Homepage
// Grand Sovereign Master Website — Full-page experience with cinematic hero, threat vectors, 8 engines, sovereign architecture, ROI simulator, trajectory, and executive FAQ

import React from 'react';
import { LocaleMode } from '../../types';
import { HeroSection } from './HeroSection';
import { ChallengesSection } from './ChallengesSection';
import { IntelligenceSuiteSection } from './IntelligenceSuiteSection';
import { SovereignArchitectureSection } from './SovereignArchitectureSection';
import { HowItWorksSection } from './HowItWorksSection';
import { CrossIndustrySection } from './CrossIndustrySection';
import { FaqSection } from './FaqSection';
import { IconArrowRight } from '../Icons';

interface WebsiteHomeProps {
  locale: LocaleMode;
  onNavigatePlatform: () => void;
  onNavigateDetail: (moduleId?: string) => void;
  onNavigateContact?: () => void;
  onNavigateIndustries?: () => void;
}

export const WebsiteHome: React.FC<WebsiteHomeProps> = ({
  locale,
  onNavigatePlatform,
  onNavigateDetail,
  onNavigateContact,
  onNavigateIndustries
}) => {
  const isAr = locale === 'ar';

  const handleContactAction = () => {
    if (onNavigateContact) {
      onNavigateContact();
    } else {
      window.history.pushState({}, '', '/contact');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleIndustriesAction = () => {
    if (onNavigateIndustries) {
      onNavigateIndustries();
    } else {
      window.history.pushState({}, '', '/industries');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // All sections render naturally and immediately on mount without delayed DOM painting


  return (
    <div className="home-v2">
      {/* ═══ 01: HERO SECTION (CINEMATIC & SOVEREIGN CORE) ═══ */}
      <HeroSection
        locale={locale}
        onExplorePlatform={() => {
          const el = document.getElementById('engines');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else onNavigatePlatform();
        }}
        onRequestConsultation={handleContactAction}
      />

      {/* ═══ 02: THE SILENT MARGIN DRAIN & COMPARISON ═══ */}
      <ChallengesSection locale={locale} />

      {/* ═══ 03: THE 8 DETERMINISTIC ENGINES ═══ */}
      <IntelligenceSuiteSection
        locale={locale}
        onSelectModule={onNavigateDetail}
      />

      {/* ═══ 04: SOVEREIGN ARCHITECTURE & ZERO-DISRUPTION INTEGRATION ═══ */}
      <SovereignArchitectureSection locale={locale} />

      {/* ═══ 05: 4-STAGE OPERATIONAL TRAJECTORY ═══ */}
      <HowItWorksSection locale={locale} />

      {/* ═══ 06: CROSS-INDUSTRY DOMAIN READINESS ═══ */}
      <CrossIndustrySection
        locale={locale}
        onNavigateIndustries={handleIndustriesAction}
      />

      {/* ═══ 07: EXECUTIVE FREQUENTLY ASKED QUESTIONS ═══ */}
      <FaqSection locale={locale} />

      {/* ═══ 08: STRATEGIC CLOSING ACTION BANNER ═══ */}
      <section className="ml-section">
        <div className="ml-container">
          <div className="site-cta">
            <span className="ml-eyebrow" style={{ position: 'relative' }}>
              {isAr ? 'الخطوة التالية' : 'Next step'}
            </span>
            <h2 className="ml-heading" style={{ marginTop: 16, position: 'relative' }}>
              {isAr
                ? 'هل ترغب أن نُظهر لك ما تُخفيه أنظمتكم؟'
                : 'Want us to show you what your systems keep hidden?'}
            </h2>
            <p className="ml-lead" style={{ margin: '16px auto 0', position: 'relative' }}>
              {isAr
                ? 'نبدأ بتقييم أولي غير مقتحم لبياناتكم التشغيلية عبر مسارات قراءة آمنة — دون أي التزام ودون أي تغيير في برامجكم القائمة.'
                : 'We start with a non-invasive assessment of your operational data through secure read-only paths — with no commitment and no changes to your existing software.'}
            </p>
            <div className="site-cta__actions">
              <button onClick={handleContactAction} className="ml-btn ml-btn--primary ml-btn--lg">
                <span>{isAr ? 'احجز جلسة تعارف' : 'Book an introduction call'}</span>
                <IconArrowRight size={16} />
              </button>
              <button onClick={onNavigatePlatform} className="ml-btn ml-btn--ghost ml-btn--lg">
                {isAr ? 'استعرض المنصة' : 'Review the platform'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
