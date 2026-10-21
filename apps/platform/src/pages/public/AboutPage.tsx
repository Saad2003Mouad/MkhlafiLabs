// MIKHLAFI LABS — About & Sovereign Vision Page (/about)
// Luxury Enterprise Aesthetic, Forensic Laboratory Pillars & Visual Command Cockpit Showcase

import React from 'react';
import { LocaleMode } from '../../types';
import {
  IconArrowRight,
  IconShield,
  IconServer,
  IconCheckCircle,
  IconLayers
} from '../../components/Icons';

interface AboutPageProps {
  locale: LocaleMode;
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ locale, onNavigate }) => {
  const isAr = locale === 'ar';

  const principles = [
    {
      icon: <IconShield size={22} />,
      titleAr: 'أدلة حتمية وقابلة للتتبع',
      titleEn: 'Deterministic, traceable evidence',
      descAr: 'كل نتيجة مرتبطة بسجلها المصدر مباشرة، بلا تخمين أو افتراضات إحصائية.',
      descEn: 'Every finding is anchored to its original source record — no speculation.'
    },
    {
      icon: <IconLayers size={22} />,
      titleAr: 'محايد على مستوى القطاعات',
      titleEn: 'Cross-industry neutral',
      descAr: 'يعمل في المقاولات والتصنيع واللوجستيات والتجزئة والخدمات ومجموعات الأعمال.',
      descEn: 'Designed for contracting, manufacturing, logistics, retail, services, and holding groups.'
    },
    {
      icon: <IconServer size={22} />,
      titleAr: 'نشر سيادي وغير تطفلي',
      titleEn: 'Sovereign, non-invasive',
      descAr: 'يدعم النشر السحابي السيادي داخل السعودية أو النشر المحلي المغلق (Air-Gapped).',
      descEn: 'Sovereign deployment in KSA or air-gapped on-prem, with read-only integration.'
    },
    {
      icon: <IconCheckCircle size={22} />,
      titleAr: 'فصل صارم للبيانات بين الكيانات',
      titleEn: 'Strict tenant isolation',
      descAr: 'عزل على مستوى الصفوف وحماية صارمة للحدود بين المؤسسات والكيانات التابعة.',
      descEn: 'Row-level isolation and enforced boundaries across entities and tenants.'
    }
  ];

  return (
    <div>
      {/* Hero */}
      <section className="pp-hero">
        <div className="ml-container pp-hero__inner">
          <span className="pp-hero__eyebrow">
            {isAr ? 'نبذة عن المنصة' : 'ABOUT'}
          </span>
          <h1 className="ml-display pp-hero__title">
            {isAr
              ? 'منصة استخبارات تشغيلية مبنية على أدلة حتمية'
              : 'An industry-neutral, evidence-based operational intelligence platform'}
          </h1>
          <p className="ml-lead pp-hero__lead">
            {isAr
              ? 'تم تصميم MIKHLAFI LABS لمساعدة القيادات على اتخاذ قرارات أكثر دقة من خلال تحليل حتمي للبيانات التشغيلية، مع إبقاء التكامل غير تطفلي والبيانات تحت سيطرة المؤسسة بالكامل.'
              : 'MIKHLAFI LABS helps leadership teams make well-grounded decisions by applying deterministic checks to operational data, with minimal integration footprint and full control over sovereignty.'}
          </p>
          <div className="pp-hero__actions">
            <button onClick={() => onNavigate('/platform')} className="ml-btn ml-btn--primary ml-btn--lg">
              <span>{isAr ? 'استعرض المعمارية' : 'Explore platform architecture'}</span>
              <IconArrowRight size={16} />
            </button>
            <button onClick={() => onNavigate('/contact')} className="ml-btn ml-btn--ghost ml-btn--lg">
              <span>{isAr ? 'طلب جلسة تشاورية' : 'Request a briefing'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Positioning / Principles */}
      <section className="site-section">
        <div className="ml-container">
          <div className="site-section__head">
            <span className="ml-eyebrow">{isAr ? 'موقعنا الوظيفي' : 'POSITIONING'}</span>
            <h2 className="ml-heading site-section__title">
              {isAr ? 'ذكاء تشغيلي حتمي محايد للقطاعات' : 'Deterministic operational intelligence, sector-neutral'}
            </h2>
            <p className="ml-lead site-section__lead">
              {isAr
                ? 'تُعد المنصة طبقة استخبارات تشغيلية وليست أداة مالية فقط. يتركز الغرض على ربط الأدلة بالتصرفات التنفيذية، مع الحفاظ على فصل واضح بين ما هو مؤكد وما هو مقترح.'
                : 'MIKHLAFI LABS is an operational decision intelligence layer. The focus is simple: connect verifiable evidence to actionable decisions, with clear separation between established facts and hypotheses.'}
            </p>
          </div>

          <div className="site-grid site-grid--4">
            {principles.map((p, idx) => (
              <article key={idx} className="site-tile">
                <div className="site-tile__icon" aria-hidden="true">
                  {p.icon}
                </div>
                <h3 className="site-tile__title">
                  {isAr ? p.titleAr : p.titleEn}
                </h3>
                <p className="site-tile__desc">
                  {isAr ? p.descAr : p.descEn}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works (4 stages) */}
      <section className="site-section site-section--alt">
        <div className="ml-container">
          <div className="site-section__head">
            <span className="ml-eyebrow">{isAr ? 'كيف نعمل' : 'HOW WE WORK'}</span>
            <h2 className="ml-heading site-section__title">
              {isAr ? 'عملية متسقة للربط والتحقق' : 'A consistent process for integration and verification'}
            </h2>
            <p className="ml-lead site-section__lead">
              {isAr
                ? 'يتم التركيز على تقليل الأثر على أنظمتك القائمة، مع بناء سلسلة أدلة واضحة لكل توصية.'
                : 'Focus on minimal impact to existing systems, with clear provenance for every recommendation.'}
            </p>
          </div>
          <div className="site-steps">
            {[
              {
                n: '01',
                tAr: 'ربط غير تطفلي',
                tEn: 'Read-only integration',
                dAr: 'ربط آمن للقراءة فقط مع ERP وقواعد البيانات دون تعديل البنية التحتية.',
                dEn: 'Secure read-only access to ERPs and databases with no schema changes.'
              },
              {
                n: '02',
                tAr: 'توحيد الكيانات',
                tEn: 'Entity normalization',
                dAr: 'توحيد الجهات والعملات والمصطلحات لضمان المقارنة الدقيقة بين السجلات.',
                dEn: 'Normalize entities, currencies, and terms for consistent cross-matching.'
              },
              {
                n: '03',
                tAr: 'تحقق حتمي',
                tEn: 'Deterministic checks',
                dAr: 'تطبيق قواعد حسابية قطعية ومقارنات مباشرة بين السجلات الموثقة.',
                dEn: 'Apply arithmetic rules and direct comparisons against verifiable records.'
              },
              {
                n: '04',
                tAr: 'إجراء قابل للتنفيذ',
                tEn: 'Actionable outcomes',
                dAr: 'عرض النتائج مع الأدلة والمسؤولية المقترحة دون فرض إجراءات تلقائية غير مصرح بها.',
                dEn: 'Present evidence-backed findings with proposed ownership, never forcing unauthorized actions.'
              }
            ].map((s) => (
              <article key={s.n} className="site-step">
                <span className="site-step__num">{s.n}</span>
                <h3 className="site-step__title">{isAr ? s.tAr : s.tEn}</h3>
                <p className="site-step__desc">{isAr ? s.dAr : s.dEn}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Sovereignty & Trust */}
      <section className="site-section">
        <div className="ml-container">
          <div className="pp-split">
            <div>
              <span className="ml-eyebrow">{isAr ? 'السيادة والامتثال' : 'SOVEREIGNTY & COMPLIANCE'}</span>
              <h2 className="ml-heading pp-split__title">
                {isAr ? 'بياناتك ضمن حدودك وتحت إشرافك' : 'Your data stays within your boundaries and under your control'}
              </h2>
              <p className="ml-lead pp-split__lead">
                {isAr
                  ? 'تدعم المنصة النشر داخل المملكة أو داخل مراكز بيانات مؤسستك، مع عزل صارم بين الكيانات وسجلات تدقيق لا يمكن تعديلها، بما يحقق متطلبات حماية البيانات والالتزامات التنظيمية.'
                  : 'Deploy within the Kingdom of Saudi Arabia or inside your own data centers, with strict per-tenant isolation and tamper-evident audit trails that support data protection and regulatory obligations.'}
              </p>
              <div className="pp-split__list">
                <div className="pp-split__item">
                  <span className="pp-split__dot" aria-hidden="true" />
                  <span>
                    {isAr
                      ? 'مواءمة مع ضوابط الأمن السيبراني الوطنية (NCA) ونظام حماية البيانات الشخصية (PDPL).'
                      : 'Aligned with national cybersecurity controls (NCA) and personal data protection law (PDPL).'}
                  </span>
                </div>
                <div className="pp-split__item">
                  <span className="pp-split__dot" aria-hidden="true" />
                  <span>
                    {isAr
                      ? 'عزل بين المستأجرين على مستوى قاعدة البيانات مع مخططات منفصلة لكل مؤسسة.'
                      : 'Database-level tenant isolation with separate schemas per organization.'}
                  </span>
                </div>
                <div className="pp-split__item">
                  <span className="pp-split__dot" aria-hidden="true" />
                  <span>
                    {isAr
                      ? 'تكامل قراءة فقط لا يكتب ولا يعدّل سجلات أنظمتك الأساسية.'
                      : 'Read-only integration that neither writes to nor alters your core systems.'}
                  </span>
                </div>
              </div>
            </div>

            <div className="ml-panel">
              <div className="ml-panel__head">
                <span className="ml-title">{isAr ? 'التزامنا التحريري' : 'Our commitment'}</span>
                <span className="ml-badge ml-badge--accent">{isAr ? 'مؤسسات' : 'ENTERPRISE'}</span>
              </div>
              <div className="ml-panel__body">
                <div className="pp-contact__item">
                  <span className="pp-contact__k">{isAr ? 'المقر الرئيسي' : 'Headquarters'}</span>
                  <span className="pp-contact__v">
                    {isAr ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Kingdom of Saudi Arabia'}
                  </span>
                </div>
                <div className="pp-gap-lg" />
                <div className="pp-contact__item">
                  <span className="pp-contact__k">{isAr ? 'النسخة السيادية' : 'Sovereign options'}</span>
                  <span className="pp-contact__v">
                    {isAr
                      ? 'سحابة سيادية داخل السعودية أو نشر محلي مغلق بالكامل داخل مراكز بياناتك.'
                      : 'Sovereign cloud in KSA, or a fully air-gapped deployment in your own data centers.'}
                  </span>
                </div>
                <div className="pp-gap-lg" />
                <div className="pp-contact__item">
                  <span className="pp-contact__k">{isAr ? 'حدود الاستخدام' : 'Scope of use'}</span>
                  <span className="pp-contact__v">
                    {isAr
                      ? 'تشمل القطاعات: المقاولات والمشاريع، الصناعة، اللوجستيات، التجزئة، الخدمات، والمجموعات القابضة.'
                      : 'Sectors served: contracting and projects, manufacturing, logistics, retail, services, and holding groups.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="site-section site-section--tight">
        <div className="ml-container">
          <div className="site-cta">
            <span className="ml-eyebrow">{isAr ? 'الخطوة التالية' : 'NEXT STEP'}</span>
            <h2 className="ml-heading site-section__title">
              {isAr ? 'ابدأ باستكشاف المنصة' : 'Start by exploring the platform'}
            </h2>
            <p className="ml-lead site-section__lead" style={{ marginInline: 'auto', textAlign: 'center' }}>
              {isAr
                ? 'استعرض المعمارية والمحركات الثمانية، أو تواصل مع فريقنا لمناقشة متطلبات مؤسستك.'
                : 'Review the architecture and eight engines, or contact us to discuss your organization’s requirements.'}
            </p>
            <div className="site-cta__actions">
              <button onClick={() => onNavigate('/platform')} className="ml-btn ml-btn--primary ml-btn--lg">
                <span>{isAr ? 'استعراض المنصة' : 'Explore the platform'}</span>
                <IconArrowRight size={16} />
              </button>
              <button onClick={() => onNavigate('/contact')} className="ml-btn ml-btn--ghost ml-btn--lg">
                <span>{isAr ? 'تواصل معنا' : 'Contact us'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
