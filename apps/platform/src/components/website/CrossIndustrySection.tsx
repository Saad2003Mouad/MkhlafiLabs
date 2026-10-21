// MIKHLAFI LABS — Public Website: Cross-Industry Readiness
// The platform is industry-neutral. Industry briefs come from the canonical
// marketing content; no sector-specific metrics are invented.

import React from 'react';
import { LocaleMode } from '../../types';
import { INDUSTRY_BRIEFS } from '../../data/marketingContent';
import { IconTruck, IconProjects, IconWorkflow, IconUsers, IconLayers, IconArrowRight } from '../Icons';
import { SectionMediaBand } from './SectionMediaBand';

interface CrossIndustryProps {
  locale: LocaleMode;
  onNavigateIndustries?: () => void;
}

export const CrossIndustrySection: React.FC<CrossIndustryProps> = ({ locale, onNavigateIndustries }) => {
  const isAr = locale === 'ar';

  const getIndustryIcon = (id: string) => {
    switch (id) {
      case 'commerce': return <IconTruck size={20} />;
      case 'contracting': return <IconProjects size={20} />;
      case 'manufacturing': return <IconWorkflow size={20} />;
      case 'services': return <IconUsers size={20} />;
      default: return <IconLayers size={20} />;
    }
  };

  const sectors = [
    { ar: 'المقاولات', en: 'Contracting' },
    { ar: 'التصنيع', en: 'Manufacturing' },
    { ar: 'اللوجستيات', en: 'Logistics' },
    { ar: 'التجزئة', en: 'Retail' },
    { ar: 'الخدمات', en: 'Services' },
    { ar: 'المجموعات القابضة', en: 'Holding groups' }
  ];

  return (
    <section className="site-section site-section--alt" id="industries">
      <div className="ml-container">
        <div className="site-section__head">
          <span className="ml-eyebrow">{isAr ? 'حياد قطاعي' : 'INDUSTRY-NEUTRAL BY DESIGN'}</span>
          <h2 className="ml-heading site-section__title">
            {isAr
              ? 'منطق تشغيلي واحد يخدم قطاعات متعددة'
              : 'One operational logic, serving many sectors'}
          </h2>
          <p className="ml-lead site-section__lead">
            {isAr
              ? 'لا تفرض المنصة قالباً مالياً واحداً: القواعد نفسها تُطبَّق على أسعار التوريد، وأوامر التغيير، وتكلفة المواد، وسلاسل النقل، وعقود الخدمات، وتقارير الفروع داخل المجموعات القابضة.'
              : 'The platform imposes no single finance template: the same rules apply to supply pricing, change orders, material cost, transport networks, service agreements, and branch reporting inside holding groups.'}
          </p>
        </div>

        <SectionMediaBand
          src="/assets/images/industries-mesh-ecosystem.jpg"
          eyebrow={isAr ? 'منطق واحد، قطاعات متعددة' : 'ONE LOGIC, MANY SECTORS'}
          title={
            isAr
              ? 'القواعد ذاتها تُقرأ بها المقاولات والتصنيع والتجزئة'
              : 'The same rules read contracting, manufacturing and retail'
          }
          body={
            isAr
              ? 'أسعار التوريد، وأوامر التغيير، وتكلفة المواد، وسلاسل النقل، وعقود الخدمات، وتقارير الفروع — كلها تُقاس بالمنطق التشغيلي نفسه، دون قالب مالي مفروض.'
              : 'Supply pricing, change orders, material cost, transport networks, service agreements and branch reporting are all measured by the same operational logic, with no imposed finance template.'
          }
        />

        <div className="site-grid site-grid--2">
          {INDUSTRY_BRIEFS.map((industry) => (
            <article key={industry.id} className="site-tile" style={{ cursor: 'default' }}>
              <span className="site-tile__icon" style={{ margin: 0 }}>
                {getIndustryIcon(industry.id)}
              </span>
              <h3 className="site-tile__title">{isAr ? industry.titleAr : industry.titleEn}</h3>
              <p className="site-tile__desc">{isAr ? industry.descAr : industry.descEn}</p>
            </article>
          ))}
        </div>

        <div className="home-sectors">
          <span className="home-sectors__label">
            {isAr ? 'قطاعات نخدمها' : 'Sectors we serve'}
          </span>
          {sectors.map((sector, i) => (
            <span key={i} className="ml-badge">
              {isAr ? sector.ar : sector.en}
            </span>
          ))}
        </div>

        {onNavigateIndustries && (
          <div className="home-industries__cta">
            <button type="button" onClick={onNavigateIndustries} className="ml-btn ml-btn--ghost">
              <span>{isAr ? 'استعرض جاهزية كل قطاع' : 'Explore sector readiness'}</span>
              <IconArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
