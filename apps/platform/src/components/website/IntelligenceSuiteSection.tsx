import React from 'react';
import { LocaleMode } from '../../types';
import { SOLUTIONS } from '../../data/mockData';
import {
  IconFinance,
  IconDecisions,
  IconRisk,
  IconProjects,
  IconSupplier,
  IconCustomer,
  IconAssistant,
  IconDataQuality,
  IconArrowRight
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

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'file-text': return <IconFinance size={22} />;
      case 'check-circle': return <IconDecisions size={22} />;
      case 'alert-triangle': return <IconRisk size={22} />;
      case 'trending-up': return <IconProjects size={22} />;
      case 'truck': return <IconSupplier size={22} />;
      case 'users': return <IconCustomer size={22} />;
      case 'bot': return <IconAssistant size={22} />;
      case 'database': return <IconDataQuality size={22} />;
      default: return <IconFinance size={22} />;
    }
  };

  return (
    <section className="site-section" id="solutions">
      <div className="site-container">
        <div className="section-head">
          <span className="section-eyebrow">
            {isAr ? 'منظومة الذكاء المتكاملة' : 'THE 8 INTELLIGENCE ENGINES'}
          </span>
          <h2 className="section-title">
            {isAr
              ? 'ثمانية محركات حتمية لتغطية أدق مفاصل الأداء المؤسسي'
              : 'Eight deterministic engines engineered for granular enterprise control'}
          </h2>
          <p className="section-subtitle">
            {isAr
              ? 'تعمل معاً كطبقة استخباراتية موحدة فوق أنظمتك القائمة، أو تتكامل تدريجياً بحسب أولويات مؤسستك.'
              : 'Functioning as a unified intelligence layer on top of your existing systems, deployable modularly based on organizational priority.'}
          </p>
        </div>

        <div className="solutions-grid">
          {SOLUTIONS.map((item) => (
            <div key={item.id} className="solution-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'var(--accent-light)' }}>
                  {getIcon(item.icon)}
                </div>
                <span className="solution-badge">
                  {isAr ? item.badgeAr : item.badgeEn}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  ENGINE #{item.num}
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {isAr ? item.titleAr : item.titleEn}
                </h3>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', flex: 1 }}>
                {isAr ? item.outcomeAr : item.outcomeEn}
              </p>

              <button
                onClick={() => onSelectModule(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12.5px',
                  color: 'var(--accent-light)',
                  fontWeight: 700,
                  marginTop: '10px',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.15s ease'
                }}
                className="engine-card-cta"
              >
                <span>{isAr ? 'شرح المحرك والمحاكاة الحية' : 'Full Engine Specs & Demo'}</span>
                <IconArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
