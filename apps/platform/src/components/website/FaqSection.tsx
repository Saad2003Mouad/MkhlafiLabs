import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { FAQS } from '../../data/mockData';

interface FaqSectionProps {
  locale: LocaleMode;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="site-section" id="faq" style={{ background: 'var(--bg-surface-elevated)' }}>
      <div className="site-container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-kicker">
            {isAr ? 'الأسئلة الشائعة والاستفسارات التقنية' : 'FREQUENTLY ASKED QUESTIONS'}
          </div>
          <h2 className="section-title">
            {isAr
              ? 'إجابات واضحة حول التكامل، الأمان، والذكاء الحتمي'
              : 'Clear answers on integration, security, and deterministic analysis'}
          </h2>
          <p className="section-lead">
            {isAr
              ? 'كل ما يحتاجه الرؤساء التنفيذيون ومديرو التقنية لمعرفة كيفية عمل MIKHLAFI LABS فوق أنظمتهم الحالية.'
              : 'Essential technical and governance details for CEOs, CFOs, and CIOs evaluating our platform.'}
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${isOpen ? 'var(--accent-base)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    fontWeight: 700,
                    textAlign: 'start',
                    cursor: 'pointer'
                  }}
                >
                  <span>{isAr ? faq.qAr : faq.qEn}</span>
                  <span
                    style={{
                      transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      color: 'var(--accent-light)',
                      fontSize: '16px',
                      fontWeight: 800
                    }}
                  >
                    ❯
                  </span>
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 20px 18px 20px',
                      fontSize: '13px',
                      lineHeight: 1.7,
                      color: 'var(--text-secondary)',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '14px'
                    }}
                  >
                    {isAr ? faq.aAr : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
