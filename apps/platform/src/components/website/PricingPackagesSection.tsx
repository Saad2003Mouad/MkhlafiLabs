import React from 'react';
import { LocaleMode, PricingPackage } from '../../types';
import { PACKAGES } from '../../data/mockData';
import { IconCheckCircle, IconArrowRight } from '../Icons';

interface PricingProps {
  locale: LocaleMode;
  onSelectPackage: (pkg: PricingPackage) => void;
}

export const PricingPackagesSection: React.FC<PricingProps> = ({ locale, onSelectPackage }) => {
  const isAr = locale === 'ar';

  return (
    <section className="site-section" id="pricing">
      <div className="site-container">
        <div className="section-head">
          <span className="section-eyebrow">
            {isAr ? 'خطط الاشتراك والأسعار' : 'TRANSPARENT SUBSCRIPTION TIERS'}
          </span>
          <h2 className="section-title">
            {isAr
              ? 'باقات استخباراتية مرنة مصممة للتوسع مع نمو مؤسستك'
              : 'Flexible monthly intelligence tiers tailored to your scale'}
          </h2>
          <p className="section-subtitle">
            {isAr
              ? 'ابدأ بفترة تجريبية مجانية ومحدودة لفحص بيانات مؤسستك دون التزام، مع اشتراك شهري مرن بعد ذلك.'
              : 'Evaluate with a limited free trial on your actual ledgers, followed by predictable monthly subscription billing.'}
          </p>
        </div>

        <div className="pricing-grid">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`pricing-card ${pkg.popular ? 'featured' : ''}`}
            >
              {pkg.popular && (
                <div className="pricing-badge">
                  {isAr ? pkg.badgeAr : pkg.badgeEn}
                </div>
              )}

              <div>
                <span style={{ fontSize: '11px', color: 'var(--accent-light)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {pkg.servicesCount} {isAr ? 'محركات نشطة' : 'ACTIVE ENGINES'}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {isAr ? pkg.nameAr : pkg.nameEn}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.5' }}>
                  {isAr ? pkg.subtitleAr : pkg.subtitleEn}
                </p>
              </div>

              <div style={{ padding: '12px 14px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-light)' }}>
                  {isAr ? 'فترة تجريبية مجانية متاحة' : 'Free Trial Period Available'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  {isAr ? 'اشتراك شهري مرن بعد انتهاء التجربة' : 'Flexible monthly billing afterwards'}
                </div>
              </div>

              <div className="feature-list">
                {(isAr ? pkg.featuresAr : pkg.featuresEn).map((feat, fIdx) => (
                  <div key={fIdx} className="feature-point">
                    <span style={{ color: 'var(--accent-light)', marginTop: '2px', flexShrink: 0 }}>
                      <IconCheckCircle size={15} />
                    </span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onSelectPackage(pkg)}
                className={pkg.popular ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
              >
                <span>{isAr ? 'بدء التجربة المجانية للباقة' : 'Start Free Package Trial'}</span>
                <IconArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
