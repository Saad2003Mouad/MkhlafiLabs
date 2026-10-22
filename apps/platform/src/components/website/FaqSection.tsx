// MIKHLAFI LABS — Public Website: Executive FAQ
// Accordion backed by the canonical FAQS export so the answers have a single
// source of truth across the public site.

import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { FAQS } from '../../data/marketingContent';
import { IconChevronDown } from '../Icons';

interface FaqSectionProps {
  locale: LocaleMode;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="site-section" id="faq">
      <div className="ml-container">
        <div className="site-section__head">
          <span className="ml-eyebrow">{isAr ? 'أسئلة تنفيذية' : 'EXECUTIVE QUESTIONS'}</span>
          <h2 className="ml-heading site-section__title">
            {isAr
              ? 'إجابات مباشرة قبل أن تبدأ'
              : 'Direct answers before you begin'}
          </h2>
          <p className="ml-lead site-section__lead">
            {isAr
              ? 'التكامل، والأمان، وسيادة البيانات، وأساس كل نتيجة — بإيجاز ووضوح.'
              : 'Integration, security, data residency, and the basis of every finding — briefly and clearly.'}
          </p>
        </div>

        <div className="faq-list home-faq">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className={`faq-row ${isOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="faq-row__trigger"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFaq(idx);
                  }}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <span>{isAr ? faq.qAr : faq.qEn}</span>
                  <IconChevronDown size={16} />
                </button>
                <div className="faq-row__answer" id={`faq-answer-${idx}`} role="region">
                  <p className="faq-row__answer-inner">{isAr ? faq.aAr : faq.aEn}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
