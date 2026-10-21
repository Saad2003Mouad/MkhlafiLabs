// MIKHLAFI LABS — Public Website: Operational Intelligence Engines
// The eight engines presented as one cohesive layer above existing systems.
// Renders capability titles and taglines from the shared services catalog.
// Benchmark metrics are intentionally not displayed — no fabricated figures.

import React from 'react';
import { LocaleMode } from '../../types';
import { usePublishedEngines } from '../../hooks/publishedEngines';
import {
  IconArrowRight,
  IconFileText,
  IconCheckCircle,
  IconAlertTriangle,
  IconTrendingUp,
  IconTruck,
  IconUsers,
  IconBot,
  IconDatabase,
  IconShield
} from '../Icons';

interface IntelligenceSuiteSectionProps {
  locale: LocaleMode;
  onSelectModule: (moduleId: string) => void;
}

export const IntelligenceSuiteSection: React.FC<IntelligenceSuiteSectionProps> = ({
  locale,
  onSelectModule
}) => {
  const isAr = locale === 'ar';
  const engines = usePublishedEngines();
  const engineCount = engines.length.toLocaleString(isAr ? 'ar' : 'en');

  const getEngineIcon = (iconName: string, size = 20) => {
    switch (iconName) {
      case 'file-text': return <IconFileText size={size} />;
      case 'check-circle': return <IconCheckCircle size={size} />;
      case 'alert-triangle': return <IconAlertTriangle size={size} />;
      case 'trending-up': return <IconTrendingUp size={size} />;
      case 'truck': return <IconTruck size={size} />;
      case 'users': return <IconUsers size={size} />;
      case 'bot': return <IconBot size={size} />;
      case 'database': return <IconDatabase size={size} />;
      default: return <IconShield size={size} />;
    }
  };

  return (
    <section className="site-section" id="engines">
      <div className="ml-container">
        <div className="site-section__head">
          <span className="ml-eyebrow">{isAr ? 'محركات الذكاء التشغيلية' : 'OPERATIONAL INTELLIGENCE ENGINES'}</span>
          <h2 className="ml-heading site-section__title">
            {isAr
              ? `${engineCount} محركات تعمل كطبقة واحدة فوق أنظمتكم`
              : `${engineCount} engines working as one layer above your systems`}
          </h2>
          <p className="ml-lead site-section__lead">
            {isAr
              ? 'كل محرك يغطي نطاقاً تشغيلياً محدداً — من ضبط الحركات وعلاقات الموردين إلى المخاطر والمشاريع والمساعد التنفيذي — وتتشارك جميعها المصدر ذاته ومسار التدقيق ذاته.'
              : 'Each engine covers a defined operational scope — from record-level control and supplier relationships to risk, projects, and the executive assistant — all sharing the same sources and the same audit trail.'}
          </p>
        </div>

        <div className="site-grid site-grid--4">
          {engines.map((engine) => (
            <button
              type="button"
              key={engine.id}
              className="site-tile home-engine"
              onClick={() => onSelectModule(engine.id)}
              aria-label={`${isAr ? engine.titleAr : engine.titleEn} — ${isAr ? 'استكشف المحرك' : 'Explore engine'}`}
            >
              <span className="site-tile__index">
                {isAr ? `المحرك ${engine.engineNumber}` : `ENGINE ${engine.engineNumber}`}
              </span>
              <span className="site-tile__icon" style={{ color: engine.accentColor }}>
                {getEngineIcon(engine.iconName)}
              </span>
              <span className="site-tile__title">{isAr ? engine.titleAr : engine.titleEn}</span>
              <span className="site-tile__desc">{isAr ? engine.taglineAr : engine.taglineEn}</span>
              <span className="home-tile__link">
                {isAr ? 'استكشف قدرات المحرك' : 'Explore engine capabilities'}
                <IconArrowRight size={13} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
