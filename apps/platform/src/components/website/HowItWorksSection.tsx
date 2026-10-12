import React from 'react';
import { LocaleMode } from '../../types';
import { WORKFLOW } from '../../data/mockData';

interface HowItWorksProps {
  locale: LocaleMode;
}

export const HowItWorksSection: React.FC<HowItWorksProps> = ({ locale }) => {
  const isAr = locale === 'ar';

  return (
    <section className="site-section" id="how-it-works">
      <div className="site-container">
        <div className="section-head">
          <span className="section-eyebrow">
            {isAr ? 'منهجية العمل والتحليل' : 'FORENSIC METHODOLOGY'}
          </span>
          <h2 className="section-title">
            {isAr
              ? 'من البيانات المشتتة إلى القرارات الحاسمة في 4 مراحل'
              : 'From fragmented ledger feeds to verifiable executive action'}
          </h2>
          <p className="section-subtitle">
            {isAr
              ? 'معمارية حتمية مصممة للربط الآمن والتدقيق الجنائي دون إرباك فرق العمل أو المساس بسلامة الأنظمة القائمة.'
              : 'A deterministic pipeline engineered for non-invasive ingestion, reconciliation, and audit-grade decision support.'}
          </p>
        </div>

        <div className="workflow-grid">
          {WORKFLOW.map((step) => (
            <div key={step.index} className="workflow-card">
              <span className="workflow-idx">{step.index}</span>

              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isAr ? step.titleAr : step.titleEn}
              </h3>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {isAr ? step.descAr : step.descEn}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'auto', paddingTop: '10px' }}>
                {step.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '10px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--text-tertiary)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
