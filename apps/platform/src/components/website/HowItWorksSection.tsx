// MIKHLAFI LABS — Public Website: How It Works
// The four-stage operational method, sourced from the canonical marketing
// content so the sequence stays consistent across the public site.

import React from 'react';
import { LocaleMode } from '../../types';
import { WORKFLOW } from '../../data/marketingContent';

interface HowItWorksProps {
  locale: LocaleMode;
}

export const HowItWorksSection: React.FC<HowItWorksProps> = ({ locale }) => {
  const isAr = locale === 'ar';

  return (
    <section className="site-section" id="how-it-works">
      <div className="ml-container">
        <div className="site-section__head">
          <span className="ml-eyebrow">{isAr ? 'المسار التشغيلي' : 'THE OPERATING PATH'}</span>
          <h2 className="ml-heading site-section__title">
            {isAr
              ? 'أربع مراحل من الربط إلى القرار الموثّق'
              : 'Four stages from connection to an evidenced decision'}
          </h2>
          <p className="ml-lead site-section__lead">
            {isAr
              ? 'المنهجية نفسها تنطبق على كل قطاع: تُقرأ البيانات من أنظمتكم، وتُوحَّد وتُعاير، ثم تُفحص بقواعد قطعية، وتُسلَّم كأولويات تنفيذية بمالك مسؤول ومتابعة أثر.'
              : 'The same method applies to every sector: data is read from your systems, normalized and calibrated, tested with deterministic rules, and delivered as executive priorities with accountable owners and tracked impact.'}
          </p>
        </div>

        <div className="site-steps">
          {WORKFLOW.map((step) => (
            <article key={step.index} className="site-step">
              <span className="site-step__num">{step.index}</span>
              <h3 className="site-step__title">{isAr ? step.titleAr : step.titleEn}</h3>
              <p className="site-step__desc">{isAr ? step.descAr : step.descEn}</p>
              {step.tags.length > 0 && (
                <div className="site-step__tags">
                  {step.tags.map((tag, i) => (
                    <span key={i} className="ml-badge">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
