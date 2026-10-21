// MIKHLAFI LABS — Public Pricing & Engagement Models Page (/pricing)
// Published commercial tiers (PACKAGES), engagement structure, assurance, and FAQ.

import React, { useEffect, useState } from 'react';
import { LocaleMode } from '../../types';
import { PACKAGES as PUBLISHED_TIERS, FAQS } from '../../data/marketingContent';
import type { PricingPackage } from '../../types';
import { api } from '../../api/client';

/** Read a bilingual capability label out of a catalogue row. */
function capabilityLabel(entry: unknown, locale: 'ar' | 'en'): string | null {
  if (!entry || typeof entry !== 'object') return null;
  const record = entry as Record<string, unknown>;
  const value = locale === 'ar' ? record.nameAr ?? record.name_ar : record.nameEn ?? record.name_en;
  return typeof value === 'string' && value.trim() ? value : null;
}

/** Format a large operating-record count compactly. */
function formatCount(value: number): string {
  if (value >= 1_000_000_000) return `${value / 1_000_000_000}B`;
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

/**
 * Shape a package from the public catalogue endpoint into a published tier.
 * The platform owner creates and retires packages in /admin, so this page reads the
 * live catalogue and only falls back to the editorial tiers when it is unreachable.
 */
function toPublishedTier(row: Record<string, unknown>, index: number, total: number): PricingPackage {
  const rawCapabilities: unknown[] = Array.isArray(row.capabilities) ? (row.capabilities as unknown[]) : [];
  const enLabels = rawCapabilities.map((entry) => capabilityLabel(entry, 'en')).filter(Boolean) as string[];
  const arLabels = rawCapabilities.map((entry) => capabilityLabel(entry, 'ar')).filter(Boolean) as string[];

  const maxSources = Number(row.max_branches ?? row.maxBranches ?? 0);
  const maxLeaders = Number(row.max_members ?? row.maxMembers ?? 0);
  const recordLimit = Number(row.monthly_record_limit ?? row.monthlyRecordLimit ?? 0);

  const featuresEn = [...enLabels];
  const featuresAr = [...arLabels];

  if (maxSources > 0) {
    featuresEn.push(maxSources >= 999 ? 'Unlimited connected data sources' : `Up to ${maxSources} connected data sources`);
    featuresAr.push(maxSources >= 999 ? 'مصادر بيانات غير محدودة' : `حتى ${maxSources} مصادر بيانات مرتبطة`);
  }
  if (maxLeaders > 0) {
    featuresEn.push(maxLeaders >= 999 ? 'Unlimited leadership accounts' : `Up to ${maxLeaders} leadership accounts`);
    featuresAr.push(maxLeaders >= 999 ? 'حسابات قيادية غير محدودة' : `حتى ${maxLeaders} حساباً قيادياً`);
  }
  if (recordLimit > 0) {
    featuresEn.push(`${formatCount(recordLimit)} operating records per month`);
    featuresAr.push(`${formatCount(recordLimit)} حركة تشغيلية شهرياً`);
  }

  const tierLevel = Number(row.tier_level ?? row.tierLevel ?? index + 1);
  const engineCount = rawCapabilities.length;

  return {
    id: String(row.id),
    nameAr: String(row.name_ar ?? row.nameAr ?? ''),
    nameEn: String(row.name_en ?? row.nameEn ?? ''),
    subtitleAr: 'باقة منشورة من كتالوج المنصة',
    subtitleEn: 'A tier published from the platform catalogue',
    badgeAr: engineCount > 0 ? `${engineCount} محركات` : `المستوى ${tierLevel}`,
    badgeEn: engineCount > 0 ? `${engineCount} Engines` : `Tier ${tierLevel}`,
    popular: total > 1 && index === Math.floor((total - 1) / 2),
    servicesCount: engineCount,
    featuresAr,
    featuresEn
  };
}
import {
  IconCheckCircle,
  IconArrowRight,
  IconChevronDown,
  IconShield
} from '../../components/Icons';

interface PricingPageProps {
  locale: LocaleMode;
  onNavigateRegister: () => void;
  onRequestDemo: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  locale,
  onNavigateRegister,
  onRequestDemo
}) => {
  const isAr = locale === 'ar';
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [liveTiers, setLiveTiers] = useState<PricingPackage[] | null>(null);

  // Read the live commercial catalogue so packages published or retired by the
  // platform owner appear here immediately. Falls back to the editorial tiers when
  // the catalogue is unreachable or has no published packages.
  useEffect(() => {
    let cancelled = false;

    api
      .getPackages()
      .then((response) => {
        if (cancelled) return;
        const rows = Array.isArray(response?.packages) ? (response.packages as Record<string, unknown>[]) : [];
        if (rows.length === 0) return;
        setLiveTiers(rows.map((row, index) => toPublishedTier(row, index, rows.length)));
      })
      .catch(() => {
        /* Catalogue unavailable — the editorial tiers remain on screen. */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const packages = liveTiers ?? PUBLISHED_TIERS;

  const engagementFactors = [
    {
      id: 'engines',
      titleEn: 'Engines in scope',
      titleAr: 'نطاق المحركات',
      descEn: 'Packages scale from 3 core engines to the complete 8-engine suite.',
      descAr: 'تتراوح الباقات من 3 محركات أساسية إلى المنظومة الكاملة من 8 محركات.'
    },
    {
      id: 'sources',
      titleEn: 'Connected data sources',
      titleAr: 'مصادر البيانات المرتبطة',
      descEn: 'From two ERP or accounting connections to unlimited enterprise sources.',
      descAr: 'من اتصالين بـ ERP أو نظام محاسبي إلى مصادر مؤسسية غير محدودة.'
    },
    {
      id: 'accounts',
      titleEn: 'Leadership accounts',
      titleAr: 'الحسابات القيادية',
      descEn: 'From 3 executive seats to unlimited accounts with custom role hierarchies.',
      descAr: 'من 3 مقاعد تنفيذية إلى حسابات غير محدودة مع هيكل صلاحيات مخصص.'
    },
    {
      id: 'deployment',
      titleEn: 'Deployment architecture',
      titleAr: 'هندسة النشر',
      descEn: 'Shared cloud, isolated private cloud, or sovereign on-premise deployment.',
      descAr: 'سحابة مشتركة، أو سحابة خاصة معزولة، أو نشر محلي سيادي.'
    }
  ];

  return (
    <div className="public-page pricing-page">
      {/* Hero */}
      <section className="pp-hero pp-hero--center">
        <div className="site-container">
          <div className="pp-hero__inner">
            <span className="pp-eyebrow">
              {isAr ? 'الباقات ونماذج التعاقد' : 'Deployment & Licensing Models'}
            </span>
            <h1 className="ml-display pp-hero__title">
              {isAr
                ? 'عقود شفافة مصمّمة حسب حجم وبيئة مؤسستك'
                : 'Enterprise licensing tailored to your scale'}
            </h1>
            <p className="pp-hero__lede">
              {isAr
                ? 'تعتمد التكلفة على عدد الكيانات وحجم تدفق الحركات التشغيلية ونموذج النشر (سحابي سيادي أو محلي مغلق). لا رسوم خفية أو تكاليف غير معلنة.'
                : 'Licensing is structured around transactional ingestion volume, operating subsidiaries, and deployment architecture — with no ambiguous seat markups.'}
            </p>
            <div className="pp-hero__actions">
              <button type="button" className="ml-btn ml-btn--primary" onClick={onRequestDemo}>
                <span>{isAr ? 'طلب تسعير مخصص للمؤسسة' : 'Request Enterprise Quote'}</span>
                <IconArrowRight size={16} />
              </button>
              <button type="button" className="ml-btn ml-btn--ghost" onClick={onNavigateRegister}>
                <span>{isAr ? 'إنشاء حساب تجريبي للمؤسسة' : 'Create Trial Workspace'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Published packages */}
      <section className="pp-section pp-section--tight">
        <div className="site-container">
          <div className="pp-section__head">
            <span className="pp-eyebrow">{isAr ? 'الباقات المنشورة' : 'Published Packages'}</span>
            <h2 className="pp-section__title">
              {isAr
                ? `${packages.length} باقات… تتوسع مع اتساع نطاق مؤسستك`
                : `${packages.length} packages that widen with your scope`}
            </h2>
            <p className="pp-section__lede">
              {isAr
                ? 'كل باقة تحدد عدد المحركات ومصادر البيانات والحسابات القيادية بوضوح، ويُسعّر نطاق التشغيل الفعلي بعد جلسة الاستكشاف.'
                : 'Each package states its engines, data sources, and leadership accounts explicitly; the operating scope is priced after the discovery session.'}
            </p>
            {liveTiers && (
              <span className="ml-badge">
                {isAr ? 'منشورة الآن من كتالوج المنصة' : 'Published live from the platform catalogue'}
              </span>
            )}
          </div>

          <div className="site-pricing">
            {packages.map((pkg) => (
              <article
                key={pkg.id}
                className={`price-card ${pkg.popular ? 'price-card--featured' : ''}`}
              >
                <span className="ml-badge price-card__badge">
                  {isAr ? pkg.badgeAr : pkg.badgeEn}
                </span>

                <div>
                  <span className="pp-price__count">
                    {pkg.servicesCount} {isAr ? 'محركات نشطة' : 'Active Engines'}
                  </span>
                  <h3 className="price-card__name">{isAr ? pkg.nameAr : pkg.nameEn}</h3>
                  <p className="price-card__desc">{isAr ? pkg.subtitleAr : pkg.subtitleEn}</p>
                </div>

                <div className="pp-price__quote">
                  <div className="pp-price__quote-main">
                    {isAr ? 'تسعير مخصص للمؤسسة' : 'Custom enterprise quote'}
                  </div>
                  <div className="pp-price__quote-sub">
                    {isAr
                      ? 'يُحدَّد بعد جلسة الاستكشاف حسب النطاق والنشر'
                      : 'Set after discovery, based on scope and deployment'}
                  </div>
                </div>

                <div className="price-card__list">
                  {(isAr ? pkg.featuresAr : pkg.featuresEn).map((feat, fIdx) => (
                    <div key={fIdx} className="price-card__item">
                      <IconCheckCircle size={15} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className={`ml-btn ${pkg.popular ? 'ml-btn--primary' : 'ml-btn--ghost'} pp-price__cta`}
                  onClick={onRequestDemo}
                >
                  <span>{isAr ? 'طلب عرض سعر مفصل' : 'Request Custom Proposal'}</span>
                  <IconArrowRight size={15} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement structure */}
      <section className="pp-section pp-section--muted">
        <div className="site-container">
          <div className="pp-section__head">
            <span className="pp-eyebrow">{isAr ? 'بنية التعاقد' : 'Engagement Structure'}</span>
            <h2 className="pp-section__title">
              {isAr ? 'ما الذي يحدّد نطاق عقدك' : 'What defines the scope of your agreement'}
            </h2>
          </div>

          <div className="site-grid site-grid--4">
            {engagementFactors.map((factor, idx) => (
              <div key={factor.id} className="pp-factor">
                <span className="pp-factor__index">{String(idx + 1).padStart(2, '0')}</span>
                <h3 className="pp-factor__title">{isAr ? factor.titleAr : factor.titleEn}</h3>
                <p className="pp-factor__desc">{isAr ? factor.descAr : factor.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assurance */}
      <section className="pp-section">
        <div className="site-container">
          <div className="pp-assure">
            <span className="pp-assure__icon" aria-hidden="true">
              <IconShield size={26} />
            </span>
            <div className="pp-assure__body">
              <h2 className="pp-assure__title">
                {isAr ? 'ضمانات الامتثال واستمرارية الأعمال' : 'Sovereignty & enterprise commitments'}
              </h2>
              <p className="pp-assure__text">
                {isAr
                  ? 'تلتزم مخلافي لابس باتفاقيات سرية صارمة (NDA) وعدم مشاركة البيانات مع أي أطراف خارجية، مع إمكانية مراجعة الكود البرمجي والتدقيق المستقل لشهادات الأمن السيبراني.'
                  : 'MIKHLAFI LABS guarantees strict bilateral NDAs, zero third-party telemetry exposure, independent penetration audits, and formal source escrow agreements upon request.'}
              </p>
              <div className="pp-assure__points">
                <span className="ml-badge">{isAr ? 'اتفاقيات NDA متبادلة' : 'Bilateral NDAs'}</span>
                <span className="ml-badge">{isAr ? 'لا بيانات لأطراف ثالثة' : 'Zero third-party telemetry'}</span>
                <span className="ml-badge">{isAr ? 'تدقيق أمني مستقل' : 'Independent security audits'}</span>
                <span className="ml-badge">{isAr ? 'إيداع الكود عند الطلب' : 'Source escrow on request'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pp-section pp-section--muted">
        <div className="site-container">
          <div className="pp-section__head">
            <span className="pp-eyebrow">{isAr ? 'الأسئلة الشائعة' : 'Frequently Asked'}</span>
            <h2 className="pp-section__title">
              {isAr ? 'أسئلة تُطرح قبل التعاقد' : 'Questions asked before contracting'}
            </h2>
          </div>

          <div className="faq-list" style={{ maxWidth: 860, marginInline: 'auto' }}>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className={`faq-row ${isOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="faq-row__trigger"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  >
                    <span>{isAr ? faq.qAr : faq.qEn}</span>
                    <IconChevronDown size={18} />
                  </button>
                  <div className="faq-row__answer">
                    <div className="faq-row__answer-inner">
                      {isAr ? faq.aAr : faq.aEn}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pp-cta">
        <div className="site-container">
          <div className="pp-cta__inner">
            <span className="pp-eyebrow">{isAr ? 'الخطوة التالية' : 'Next Step'}</span>
            <h2 className="pp-cta__title">
              {isAr ? 'حدّد نطاق مؤسستك مع فريقنا' : 'Scope your organization with our team'}
            </h2>
            <p className="pp-cta__lede">
              {isAr
                ? 'جلسة استكشاف واحدة تحدد المحركات المناسبة ومصادر البيانات ونموذج النشر المناسب لبيئتك.'
                : 'A single discovery session determines the right engines, data sources, and deployment model for your environment.'}
            </p>
            <div className="pp-cta__actions">
              <button type="button" className="ml-btn ml-btn--primary" onClick={onRequestDemo}>
                <span>{isAr ? 'طلب تسعير مخصص' : 'Request Enterprise Quote'}</span>
                <IconArrowRight size={16} />
              </button>
              <button type="button" className="ml-btn ml-btn--ghost" onClick={onNavigateRegister}>
                <span>{isAr ? 'إنشاء حساب مؤسسي' : 'Create Organization Account'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
