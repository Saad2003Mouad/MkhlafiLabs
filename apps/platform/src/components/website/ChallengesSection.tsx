import React from 'react';
import { LocaleMode } from '../../types';
import { CHALLENGES } from '../../data/mockData';

interface ChallengesSectionProps {
  locale: LocaleMode;
}

export const ChallengesSection: React.FC<ChallengesSectionProps> = ({ locale }) => {
  const isAr = locale === 'ar';

  return (
    <section className="site-section" id="challenges">
      <div className="site-container">
        <div className="section-head">
          <span className="section-eyebrow">
            {isAr ? 'التحديات التشغيلية والمالية' : 'OPERATIONAL & FINANCIAL REALITIES'}
          </span>
          <h2 className="section-title">
            {isAr
              ? 'أين تكمن المخاطر وتتسرب الموارد في المؤسسات الكبرى؟'
              : 'Where do enterprise risks and financial leaks actually hide?'}
          </h2>
          <p className="section-subtitle">
            {isAr
              ? 'لا تنشأ الخسائر من نقص البيانات، بل من تشتتها وعجز التقارير الروتينية عن تقديم إنذار مبكر مقرون بأدلة قاطعة.'
              : 'Losses do not stem from a lack of data, but from siloed tools and static reports that fail to deliver early, verifiable evidence.'}
          </p>
        </div>

        <div className="challenges-grid">
          {CHALLENGES.map((ch) => (
            <div key={ch.num} className="challenge-card">
              <span className="challenge-num">{ch.num}</span>
              <h3 className="challenge-title">
                {isAr ? ch.titleAr : ch.titleEn}
              </h3>
              <p className="challenge-desc">
                {isAr ? ch.descAr : ch.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
