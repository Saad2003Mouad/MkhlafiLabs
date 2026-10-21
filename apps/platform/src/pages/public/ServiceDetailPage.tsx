// MIKHLAFI LABS — Dedicated Engine Showcase Page (/services/:engineId)
// Public, unauthenticated presentation of a single intelligence engine.
// Content source: the static engine catalog (data/servicesData.ts) plus the real
// interactive workbench for engines that have one. There is no scripted or simulated
// walkthrough on this page.

import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { SERVICES_CATALOG, ServiceDetailItem, getServiceById } from '../../data/servicesData';
import { usePublishedEngines } from '../../hooks/publishedEngines';
import {
  IconCheckCircle,
  IconArrowRight,
  IconShield,
  IconFileText,
  IconAlertTriangle,
  IconTrendingUp,
  IconTruck,
  IconUsers,
  IconBot,
  IconDatabase,
  IconChevronDown
} from '../../components/Icons';
import { ROUTES } from '../../router/routes';
import { ForensicAuditWorkbench } from '../../components/financial/ForensicAuditWorkbench';
import { ExecutiveDecisionWorkbench } from '../../components/decisions/ExecutiveDecisionWorkbench';
import { PredictiveRiskWorkbench } from '../../components/risk/PredictiveRiskWorkbench';
import { ProjectMarginWorkbench } from '../../components/projects/ProjectMarginWorkbench';
import { SupplierRiskWorkbench } from '../../components/suppliers/SupplierRiskWorkbench';
import { CustomerRiskWorkbench } from '../../components/customers/CustomerRiskWorkbench';
import { ExecutiveAssistantWorkbench } from '../../components/assistant/ExecutiveAssistantWorkbench';
import { DataQualityWorkbench } from '../../components/governance/DataQualityWorkbench';

interface ServiceDetailPageProps {
  serviceId: string;
  locale: LocaleMode;
  onNavigate: (path: string) => void;
  onRequestDemo: (serviceName?: string) => void;
  onLaunchPlatform: () => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  serviceId,
  locale,
  onNavigate,
  onRequestDemo,
  onLaunchPlatform
}) => {
  const isAr = locale === 'ar';
  const published = usePublishedEngines();

  // The operator owns the engine titles, badges and summaries in the admin
  // console; this page carries the long-form editorial content. Overlay the
  // live values on top of the static detail so a rename is reflected here too.
  const base: ServiceDetailItem = getServiceById(serviceId) || SERVICES_CATALOG[0];
  const live = published.find((engine) => engine.id === base.id);
  const service: ServiceDetailItem = live
    ? {
        ...base,
        engineNumber: live.engineNumber || base.engineNumber,
        badgeAr: live.badgeAr || base.badgeAr,
        badgeEn: live.badgeEn || base.badgeEn,
        titleAr: live.titleAr || base.titleAr,
        titleEn: live.titleEn || base.titleEn,
        taglineAr: live.taglineAr || base.taglineAr,
        taglineEn: live.taglineEn || base.taglineEn
      }
    : base;

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const themeStyle = {
    '--pp-accent': service.accentColor
  } as React.CSSProperties;

  const engineName = isAr ? service.titleAr : service.titleEn;

  const getEngineIcon = (iconName: string, size = 24) => {
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

  /**
   * The real, interactive workbench for this engine. Returning null means the engine
   * has no in-browser demonstration, in which case no sandbox section is rendered at
   * all — we would rather show nothing than show a scripted mock.
   */
  const renderWorkbench = () => {
    switch (service.id) {
      case 'financial-leak-detection':
        return (
          <ForensicAuditWorkbench
            locale={locale}
            initialScenario="contracting"
            isEmbeddedInPublicPage={true}
            onRequestAssistance={(details) => onRequestDemo(`${engineName}: ${details}`)}
          />
        );
      case 'executive-decisions':
        return (
          <ExecutiveDecisionWorkbench
            locale={locale}
            initialScenario="retail"
            isEmbeddedInPublicPage={true}
            onRequestAssistance={(details) => onRequestDemo(`${engineName}: ${details}`)}
          />
        );
      case 'risk-radar':
        return (
          <PredictiveRiskWorkbench
            locale={locale}
            initialScenario="contracting"
            isEmbeddedInPublicPage={true}
            onRequestAssistance={(details) => onRequestDemo(`${engineName}: ${details}`)}
          />
        );
      case 'project-margins':
        return (
          <ProjectMarginWorkbench
            locale={locale}
            initialScenario="infrastructure"
            isEmbeddedInPublicPage={true}
            onRequestAssistance={(details) => onRequestDemo(`${engineName}: ${details}`)}
          />
        );
      case 'supplier-intelligence':
      case 'supplier-risk':
        return (
          <SupplierRiskWorkbench
            locale={locale}
            initialScenario="fmcg_retail"
            isEmbeddedInPublicPage={true}
            onRequestAssistance={(details) => onRequestDemo(`${engineName}: ${details}`)}
          />
        );
      case 'customer-retention':
      case 'customer-risk':
        return (
          <CustomerRiskWorkbench
            locale={locale}
            initialScenario="b2b_tech"
            isEmbeddedInPublicPage={true}
            onRequestAssistance={(details) => onRequestDemo(`${engineName}: ${details}`)}
          />
        );
      case 'executive-assistant':
      case 'ai-assistant':
        return (
          <ExecutiveAssistantWorkbench
            locale={locale}
            initialScenario="conglomerate_holding"
            isEmbeddedInPublicPage={true}
            onRequestAssistance={(details) => onRequestDemo(`${engineName}: ${details}`)}
          />
        );
      case 'data-quality-governance':
      case 'data-quality':
      case 'data-integrity':
        return (
          <DataQualityWorkbench
            locale={locale}
            initialScenario="retail_distribution"
            isEmbeddedInPublicPage={true}
            onRequestAssistance={(details) => onRequestDemo(`${engineName}: ${details}`)}
          />
        );
      default:
        return null;
    }
  };

  const workbench = renderWorkbench();
  const otherEngines = SERVICES_CATALOG.filter((engine) => engine.id !== service.id);

  return (
    <div className="public-page service-detail-page" style={themeStyle}>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pp-hero">
        <div className="site-container">
          <nav className="pp-crumb" aria-label={isAr ? 'مسار التنقل' : 'Breadcrumb'}>
            <button
              type="button"
              className="pp-crumb__link"
              onClick={() => onNavigate(ROUTES.PUBLIC.SOLUTIONS)}
            >
              {isAr ? 'المحركات' : 'Engines'}
            </button>
            <span className="pp-crumb__sep" aria-hidden="true">
              /
            </span>
            <span className="pp-crumb__current">{engineName}</span>
          </nav>

          <div className="pp-hero__inner">
            <span className="pp-eyebrow">
              {`${isAr ? 'المحرك' : 'ENGINE'} ${service.engineNumber} — ${isAr ? service.badgeAr : service.badgeEn}`}
            </span>

            <h1 className="ml-display pp-hero__title">{engineName}</h1>

            <p className="pp-hero__lede">{isAr ? service.taglineAr : service.taglineEn}</p>

            <p className="pp-hero__lead">{isAr ? service.heroDescriptionAr : service.heroDescriptionEn}</p>

            <div className="pp-hero__actions">
              <button
                type="button"
                className="ml-btn ml-btn--primary ml-btn--lg"
                onClick={() => onRequestDemo(engineName)}
              >
                <span>{isAr ? 'طلب تجربة هذا المحرك' : 'Request this engine'}</span>
                <IconArrowRight size={16} />
              </button>
              <button
                type="button"
                className="ml-btn ml-btn--ghost ml-btn--lg"
                onClick={onLaunchPlatform}
              >
                <span>{isAr ? 'استعراض المنصة' : 'View the platform'}</span>
              </button>
            </div>

            <div className="pp-metrics">
              {service.heroMetrics.map((metric, idx) => (
                <div key={idx} className="pp-metric">
                  <span className="pp-metric__val">{metric.val}</span>
                  <span className="pp-metric__label">{isAr ? metric.labelAr : metric.labelEn}</span>
                  <span className="pp-metric__note">{isAr ? metric.noteAr : metric.noteEn}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive sandbox (only when a real workbench exists) ───────── */}
      {workbench && (
        <section className="site-section site-section--alt">
          <div className="site-container">
            <div className="site-section__head site-section__head--center">
              <span className="ml-eyebrow">{isAr ? 'بيئة تجريبية تفاعلية' : 'INTERACTIVE SANDBOX'}</span>
              <h2 className="ml-heading site-section__title">
                {isAr ? 'شغّل المنطق الحتمي بنفسك' : 'Run the deterministic logic yourself'}
              </h2>
              <p className="ml-lead site-section__lead" style={{ marginInline: 'auto', textAlign: 'center' }}>
                {isAr
                  ? 'بيئة تدريب تفاعلية تعمل على بيانات نموذجية موسومة بوضوح. لا تتصل ببياناتك ولا تعرض أي أرقام من مؤسستك.'
                  : 'An interactive training environment running on clearly-labelled sample data. It never connects to your data and shows nothing from your organization.'}
              </p>
            </div>

            <div className="pp-gap-lg">{workbench}</div>
          </div>
        </section>
      )}

      {/* ── Pain points resolved ──────────────────────────────────────────── */}
      <section className="site-section">
        <div className="site-container">
          <div className="site-section__head">
            <span className="ml-eyebrow">{isAr ? 'تحديات ومعالجات' : 'PROBLEMS & RESPONSES'}</span>
            <h2 className="ml-heading site-section__title">
              {isAr
                ? 'ثلاث نقاط ألم يعالجها هذا المحرك'
                : 'Three operational pain points this engine addresses'}
            </h2>
            <p className="ml-lead site-section__lead">
              {isAr
                ? 'كل بند يقارن بين ما يحدث عادةً وبين ما تفعله المنصة، دون افتراضات غير موثقة.'
                : 'Each item contrasts what typically happens with what the platform does — without unverified assumptions.'}
            </p>
          </div>

          <div className="pp-pain-grid">
            {service.painPoints.map((pain) => (
              <article
                key={pain.num}
                className="pp-pain"
                style={{ '--pp-accent': service.accentColor } as React.CSSProperties}
              >
                <div className="pp-pain__head">
                  <span className="ml-badge">{`${isAr ? 'نقطة' : 'POINT'} ${pain.num}`}</span>
                </div>
                <h3 className="pp-pain__title">{isAr ? pain.titleAr : pain.titleEn}</h3>
                <div className="pp-note pp-note--risk">
                  <span className="pp-note__k">{isAr ? 'الواقع التقليدي' : 'Conventional practice'}</span>
                  <span className="pp-note__v">
                    {isAr ? pain.currentFailureAr : pain.currentFailureEn}
                  </span>
                </div>
                <div className="pp-note pp-note--fix">
                  <span className="pp-note__k">{isAr ? 'معالجة المنصة' : 'Platform response'}</span>
                  <span className="pp-note__v">
                    {isAr ? pain.mikhlafiSolutionAr : pain.mikhlafiSolutionEn}
                  </span>
                </div>
                <p className="pp-pain__impact">{isAr ? pain.impactAr : pain.impactEn}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Methodology ───────────────────────────────────────────────────── */}
      <section className="site-section site-section--alt">
        <div className="site-container">
          <div className="site-section__head">
            <span className="ml-eyebrow">{isAr ? 'المنهجية' : 'METHODOLOGY'}</span>
            <h2 className="ml-heading site-section__title">
              {isAr ? 'أربع مراحل من القراءة حتى التوثيق' : 'Four stages from ingestion to documentation'}
            </h2>
            <p className="ml-lead site-section__lead">
              {isAr
                ? 'سير معالجات واضح وقابل للمراجعة، مع مخرَج محدد لكل مرحلة.'
                : 'A reviewable processing sequence with a defined output at each stage.'}
            </p>
          </div>

          <div className="pp-steps">
            {service.methodologySteps.map((step) => (
              <article key={step.step} className="pp-step">
                <span className="pp-step__num">{step.step}</span>
                <h3 className="pp-step__title">{isAr ? step.titleAr : step.titleEn}</h3>
                <p className="pp-step__desc">{isAr ? step.techDetailAr : step.techDetailEn}</p>
                <span className="pp-step__out">
                  {isAr ? 'المخرَج: ' : 'OUTPUT: '}
                  <strong>{isAr ? step.outputAr : step.outputEn}</strong>
                </span>
              </article>
            ))}
          </div>

          <div className="pp-gap-lg">
            <p className="ml-hint" style={{ textAlign: 'center', marginBottom: 16 }}>
              {isAr ? 'أنظمة مدعومة لهذا المحرك' : 'Supported systems for this engine'}
            </p>
            <div className="pp-strip">
              {service.integrations.map((item, idx) => (
                <span key={idx} className="ml-badge">
                  <IconCheckCircle size={13} color="var(--status-success)" />
                  {item.name}
                  <span className="pp-muted">{item.type}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="site-section site-section--alt">
        <div className="site-container">
          <div className="site-section__head site-section__head--center">
            <span className="ml-eyebrow">{isAr ? 'الأسئلة الشائعة' : 'FAQ'}</span>
            <h2 className="ml-heading site-section__title">
              {isAr ? 'أسئلة يطرحها فريق التقنية قبل البدء' : 'Questions technical teams ask before starting'}
            </h2>
          </div>

          <div className="faq-list" style={{ maxWidth: 860, marginInline: 'auto' }}>
            {service.faqs.map((faq, idx) => {
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
                    <div className="faq-row__answer-inner">{isAr ? faq.aAr : faq.aEn}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Browse the rest of the mesh ───────────────────────────────────── */}
      <section className="site-section">
        <div className="site-container">
          <div className="site-section__head">
            <span className="ml-eyebrow">{isAr ? 'منظومة المحركات الكاملة' : 'THE INTELLIGENCE MESH'}</span>
            <h2 className="ml-heading site-section__title">
              {isAr
                ? `استكشف المحركات الـ${otherEngines.length} الأخرى في المنظومة`
                : `Explore the other ${otherEngines.length} engines in the mesh`}
            </h2>
          </div>

          <div className="pp-engine-mini-grid">
            {otherEngines.map((engine) => (
              <button
                key={engine.id}
                type="button"
                className="pp-engine-mini"
                onClick={() => onNavigate(`/services/${engine.id}`)}
              >
                <span className="pp-engine-mini__head">
                  <span className="pp-engine-mini__icon" style={{ color: engine.accentColor }}>
                    {getEngineIcon(engine.iconName, 18)}
                  </span>
                  <span className="pp-engine-mini__num ml-mono">{`#${engine.engineNumber}`}</span>
                </span>
                <span className="pp-engine-mini__title">{isAr ? engine.titleAr : engine.titleEn}</span>
                <span className="pp-engine-mini__tag">
                  {isAr ? engine.taglineAr : engine.taglineEn}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing call to action ────────────────────────────────────────── */}
      <section className="pp-cta">
        <div className="site-container">
          <div className="pp-cta__inner">
            <span className="pp-eyebrow">{isAr ? 'الخطوة التالية' : 'Next Step'}</span>
            <h2 className="pp-cta__title">
              {isAr ? `جاهز لتشغيل ${engineName} في مؤسستك؟` : `Ready to run ${engineName}?`}
            </h2>
            <p className="pp-cta__lede">
              {isAr
                ? 'احجز جلسة استعراض خاصة مع مهندسينا، أو ارفع عيّنة مشفّرة من بياناتك لرؤية المخرجات الفعلية قبل أي التزام.'
                : 'Book a private walkthrough with our engineers, or share an encrypted sample of your data to see real output before any commitment.'}
            </p>
            <div className="pp-cta__actions">
              <button
                type="button"
                className="ml-btn ml-btn--primary"
                onClick={() => onRequestDemo(engineName)}
              >
                <span>{isAr ? 'حجز جلسة استعراض' : 'Book a walkthrough'}</span>
                <IconArrowRight size={16} />
              </button>
              <button
                type="button"
                className="ml-btn ml-btn--ghost"
                onClick={() => onNavigate(ROUTES.PUBLIC.CONTACT)}
              >
                <span>{isAr ? 'تواصل مع الفريق' : 'Contact the team'}</span>
                <IconShield size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
