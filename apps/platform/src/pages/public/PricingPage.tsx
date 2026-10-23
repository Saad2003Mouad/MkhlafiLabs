// MIKHLAFI LABS — Public Pricing & Deployment Models Page (/pricing)
// Shows the 3 deployment engagement models with clear CTAs
// Cloud SaaS → triggers the full SaaS Onboarding Wizard with real pricing
// On-Premise   → triggers the On-Premise Inquiry Modal
// Hybrid       → triggers the general inquiry/demo modal

import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { CLOUD_TIERS } from '../../components/website/SaaSOnboardingWizard';
import { SaaSOnboardingWizard } from '../../components/website/SaaSOnboardingWizard';
import { OnPremiseInquiryModal } from '../../components/website/OnPremiseInquiryModal';
import { FAQS } from '../../data/marketingContent';
import {
  IconCheckCircle,
  IconArrowRight,
  IconChevronDown,
  IconShield,
} from '../../components/Icons';

interface PricingPageProps {
  locale: LocaleMode;
  onNavigateRegister: () => void;
  onRequestDemo: () => void;
}

type ActiveModal = 'saas-wizard' | 'onpremise' | 'hybrid-contact' | null;

export const PricingPage: React.FC<PricingPageProps> = ({
  locale,
  onNavigateRegister,
  onRequestDemo,
}) => {
  const isAr = locale === 'ar';
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [billingView, setBillingView] = useState<'monthly' | 'yearly'>('monthly');

  const openSaaSWizard = (tierId?: string) => {
    setSelectedTierId(tierId ?? null);
    setActiveModal('saas-wizard');
  };

  const deploymentModels = [
    {
      id: 'saas',
      icon: '☁️',
      color: '#d4a017',
      titleAr: 'السحابة المشتركة (SaaS)',
      titleEn: 'Shared Cloud (SaaS)',
      subtitleAr: 'جاهز في دقائق · صفر بنية تحتية',
      subtitleEn: 'Ready in minutes · Zero infrastructure',
      descAr: 'اشترك مباشرة وابدأ الاستخدام فوراً. نتكفّل بالبنية التحتية والتحديثات والأمان.',
      descEn: 'Subscribe directly and start immediately. We handle infrastructure, updates, and security.',
      badgesAr: ['بدون خادم خاص', 'تحديثات تلقائية', 'ابدأ في دقائق'],
      badgesEn: ['No private server', 'Automatic updates', 'Start in minutes'],
      ctaAr: 'ابدأ الاشتراك الآن',
      ctaEn: 'Start Subscription Now',
      action: () => openSaaSWizard(),
    },
    {
      id: 'onpremise',
      icon: '🏗️',
      color: '#6366f1',
      titleAr: 'النشر المحلي السيادي',
      titleEn: 'Sovereign On-Premise',
      subtitleAr: 'البيانات عندك · لا أي اتصال خارجي',
      subtitleEn: 'Your data stays local · Zero external connectivity',
      descAr: 'نثبّت المنظومة على خوادمك الداخلية بالكامل. مثالي للمؤسسات ذات متطلبات السيادة الصارمة.',
      descEn: 'We deploy the full suite inside your own infrastructure. Ideal for organizations with strict sovereignty requirements.',
      badgesAr: ['بياناتك لا تغادر خوادمك', 'يدعم Air-Gapped', 'تثبيت مخصص كامل'],
      badgesEn: ['Data never leaves your servers', 'Air-Gapped support', 'Full custom installation'],
      ctaAr: 'طلب تثبيت محلي',
      ctaEn: 'Request On-Premise Setup',
      action: () => setActiveModal('onpremise'),
    },
    {
      id: 'hybrid',
      icon: '🔀',
      color: '#10b981',
      titleAr: 'النموذج الهجين المتكيّف',
      titleEn: 'Adaptive Hybrid Model',
      subtitleAr: 'معالجة محلية + لوحة تحكم سحابية',
      subtitleEn: 'Local processing + Cloud dashboard',
      descAr: 'عقدة معالجة محلية تعمل داخل شبكتك، مع لوحة تحكم سحابية آمنة للوصول من أي مكان.',
      descEn: 'A local worker node runs inside your network, paired with a secure cloud dashboard for anywhere access.',
      badgesAr: ['أفضل الحالتين', 'معالجة بياناتك محلياً', 'واجهة سحابية آمنة'],
      badgesEn: ['Best of both worlds', 'Data processed locally', 'Secure cloud dashboard'],
      ctaAr: 'تحدث مع فريقنا',
      ctaEn: 'Talk to Our Team',
      action: onRequestDemo,
    },
  ];

  return (
    <div className="public-page pricing-page">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pp-hero pp-hero--center">
        <div className="site-container">
          <div className="pp-hero__inner">
            <span className="pp-eyebrow">
              {isAr ? 'باقات الاشتراك ونماذج النشر' : 'Subscription Plans & Deployment'}
            </span>
            <h1 className="ml-display pp-hero__title">
              {isAr
                ? 'ابدأ بالطريقة التي تناسب بيئتك'
                : 'Start the way that fits your environment'}
            </h1>
            <p className="pp-hero__lede">
              {isAr
                ? 'سواء اخترت السحابة المشتركة أو النشر المحلي السيادي أو النموذج الهجين — لديك تحكم كامل ببياناتك.'
                : 'Whether you choose shared cloud, sovereign on-premise, or hybrid — you retain full control of your data.'}
            </p>

            {/* Toggle monthly/yearly for SaaS */}
            <div style={{
              display: 'inline-flex', borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)', overflow: 'hidden',
              background: 'var(--surface-2)', marginTop: 8,
            }}>
              {(['monthly', 'yearly'] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingView(cycle)}
                  style={{
                    padding: '8px 20px', border: 'none', cursor: 'pointer',
                    background: billingView === cycle ? 'var(--accent-base)' : 'transparent',
                    color: billingView === cycle ? '#000' : 'var(--text-secondary)',
                    fontWeight: billingView === cycle ? 700 : 400,
                    fontSize: 13, transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {cycle === 'monthly'
                    ? (isAr ? 'شهري' : 'Monthly')
                    : (isAr ? 'سنوي' : 'Annual')}
                  {cycle === 'yearly' && (
                    <span style={{
                      fontSize: 10, background: 'var(--status-success)', color: '#fff',
                      padding: '1px 6px', borderRadius: 20, fontWeight: 700,
                    }}>
                      {isAr ? 'وفّر 20%' : 'Save 20%'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Cloud SaaS Pricing Tiers ──────────────────────────────────────── */}
      <section className="pp-section pp-section--tight">
        <div className="site-container">
          <div className="pp-section__head">
            <span className="pp-eyebrow">☁️ {isAr ? 'السحابة المشتركة · SaaS' : 'Shared Cloud · SaaS'}</span>
            <h2 className="pp-section__title">
              {isAr ? '3 باقات جاهزة للاشتراك الفوري' : '3 plans ready for immediate subscription'}
            </h2>
            <p className="pp-section__lede">
              {isAr
                ? 'أسعار واضحة وشفافة. لا رسوم خفية. يمكنك الترقية أو الإلغاء في أي وقت.'
                : 'Clear, transparent pricing. No hidden fees. Upgrade or cancel anytime.'}
            </p>
          </div>

          <div className="site-pricing">
            {CLOUD_TIERS.map((tier) => {
              const price = billingView === 'yearly' ? tier.priceYearly : tier.priceMonthly;
              return (
                <article
                  key={tier.id}
                  className={`price-card ${tier.popular ? 'price-card--featured' : ''}`}
                  style={{ position: 'relative', overflow: 'hidden' }}
                >
                  {tier.popular && (
                    <div style={{
                      position: 'absolute', top: 0, insetInlineStart: 0, insetInlineEnd: 0,
                      height: 3, background: `linear-gradient(90deg, ${tier.color}, ${tier.color}aa)`,
                    }} />
                  )}

                  <span className="ml-badge price-card__badge">
                    {isAr ? tier.badgeAr : tier.badgeEn}
                  </span>

                  <div>
                    <h3 className="price-card__name">{isAr ? tier.nameAr : tier.nameEn}</h3>
                    <p className="price-card__desc">{isAr ? tier.subtitleAr : tier.subtitleEn}</p>
                  </div>

                  {/* Price display */}
                  <div style={{ margin: '16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>$</span>
                      <span style={{ fontSize: 38, fontWeight: 800, color: tier.color, lineHeight: 1 }}>
                        {price}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        /{isAr ? 'شهر' : 'mo'}
                      </span>
                    </div>
                    {billingView === 'yearly' && (
                      <div style={{ fontSize: 12, color: 'var(--status-success)', marginTop: 4 }}>
                        {isAr ? `يُدفع $${price * 12} سنوياً` : `$${price * 12} billed annually`}
                      </div>
                    )}
                    {billingView === 'monthly' && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        {isAr ? `$${tier.priceYearly}/شهر عند الدفع سنوياً` : `$${tier.priceYearly}/mo when billed annually`}
                      </div>
                    )}
                  </div>

                  {/* Limits row */}
                  <div style={{
                    display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16,
                    padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
                  }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      🔧 {isAr ? `${tier.engines} محركات` : `${tier.engines} engines`}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>·</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      👥 {tier.maxUsers === 'unlimited' ? (isAr ? 'غير محدود' : 'Unlimited') : tier.maxUsers} {isAr ? 'مستخدم' : 'users'}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>·</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      📊 {tier.recordsPerMonth} {isAr ? 'حركة/شهر' : 'rec/mo'}
                    </span>
                  </div>

                  <div className="price-card__list">
                    {(isAr ? tier.featuresAr : tier.featuresEn).map((feat, fIdx) => (
                      <div key={fIdx} className="price-card__item">
                        <IconCheckCircle size={15} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className={`ml-btn ${tier.popular ? 'ml-btn--primary' : 'ml-btn--ghost'} pp-price__cta`}
                    onClick={() => openSaaSWizard(tier.id)}
                  >
                    <span>{isAr ? 'ابدأ الاشتراك' : 'Start Subscription'}</span>
                    <IconArrowRight size={15} />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Deployment Models ─────────────────────────────────────────────── */}
      <section className="pp-section pp-section--muted">
        <div className="site-container">
          <div className="pp-section__head">
            <span className="pp-eyebrow">{isAr ? 'نماذج النشر' : 'Deployment Models'}</span>
            <h2 className="pp-section__title">
              {isAr ? 'اختر كيف تعمل المنصة في بيئتك' : 'Choose how the platform runs in your environment'}
            </h2>
            <p className="pp-section__lede">
              {isAr
                ? 'سواء كنت في السحابة، أو تدير بنيتك الخاصة، أو تحتاج نموذجاً هجيناً — لدينا الخيار المناسب.'
                : 'Whether you\'re in the cloud, running your own infrastructure, or need a hybrid approach — we have you covered.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {deploymentModels.map((model) => (
              <div
                key={model.id}
                style={{
                  padding: '28px 24px', borderRadius: 'var(--radius-lg)',
                  background: 'var(--surface-1)', border: '1px solid var(--border-subtle)',
                  display: 'flex', flexDirection: 'column', gap: 16,
                  transition: 'all 0.25s ease',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseOver={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = model.color + '44';
                  el.style.boxShadow = `0 8px 32px ${model.color}14, 0 0 0 1px ${model.color}22`;
                  el.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--border-subtle)';
                  el.style.boxShadow = 'none';
                  el.style.transform = 'translateY(0)';
                }}
              >
                {/* Top accent line */}
                <div style={{
                  position: 'absolute', top: 0, insetInlineStart: 0, insetInlineEnd: 0,
                  height: 2, background: `linear-gradient(90deg, ${model.color}88, transparent)`,
                }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <span style={{
                    fontSize: 28, width: 52, height: 52, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    borderRadius: 'var(--radius-md)',
                    background: `${model.color}14`, border: `1px solid ${model.color}33`,
                    flexShrink: 0,
                  }}>
                    {model.icon}
                  </span>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                      {isAr ? model.titleAr : model.titleEn}
                    </h3>
                    <span style={{ fontSize: 12, color: model.color, fontWeight: 600 }}>
                      {isAr ? model.subtitleAr : model.subtitleEn}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  {isAr ? model.descAr : model.descEn}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(isAr ? model.badgesAr : model.badgesEn).map((badge, i) => (
                    <span key={i} style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 20,
                      background: `${model.color}14`, border: `1px solid ${model.color}33`,
                      color: model.color, fontWeight: 600,
                    }}>
                      ✓ {badge}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={model.action}
                  style={{
                    marginTop: 'auto', padding: '12px 20px', borderRadius: 'var(--radius-md)',
                    background: `${model.color}18`, border: `1.5px solid ${model.color}44`,
                    color: model.color, fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLElement).style.background = `${model.color}28`;
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.background = `${model.color}18`;
                  }}
                >
                  {isAr ? model.ctaAr : model.ctaEn}
                  <IconArrowRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Assurance ─────────────────────────────────────────────────────── */}
      <section className="pp-section">
        <div className="site-container">
          <div className="pp-assure">
            <span className="pp-assure__icon" aria-hidden="true">
              <IconShield size={26} />
            </span>
            <div className="pp-assure__body">
              <h2 className="pp-assure__title">
                {isAr ? 'ضمانات السيادة والامتثال المؤسسي' : 'Sovereignty & Enterprise Commitments'}
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

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
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
                    onClick={() => setOpenFaqIndex((prev) => (prev === idx ? null : idx))}
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

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="pp-cta">
        <div className="site-container">
          <div className="pp-cta__inner">
            <span className="pp-eyebrow">{isAr ? 'الخطوة التالية' : 'Next Step'}</span>
            <h2 className="pp-cta__title">
              {isAr ? 'ابدأ اليوم أو تحدث مع فريقنا' : 'Start today or talk to our team'}
            </h2>
            <p className="pp-cta__lede">
              {isAr
                ? 'ابدأ باشتراك السحابة فوراً أو دعنا نجهز لك عرضاً مخصصاً للنشر المحلي أو الهجين.'
                : 'Start with a cloud subscription immediately, or let us prepare a custom quote for on-premise or hybrid deployment.'}
            </p>
            <div className="pp-cta__actions">
              <button type="button" className="ml-btn ml-btn--primary" onClick={() => openSaaSWizard()}>
                <span>{isAr ? 'ابدأ الاشتراك بالسحابة' : 'Start Cloud Subscription'}</span>
                <IconArrowRight size={16} />
              </button>
              <button type="button" className="ml-btn ml-btn--ghost" onClick={() => setActiveModal('onpremise')}>
                <span>{isAr ? 'طلب نشر محلي' : 'Request On-Premise'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <SaaSOnboardingWizard
        locale={locale}
        isOpen={activeModal === 'saas-wizard'}
        initialTierId={selectedTierId}
        onClose={() => setActiveModal(null)}
        onComplete={() => {
          setActiveModal(null);
          onNavigateRegister();
        }}
      />

      <OnPremiseInquiryModal
        locale={locale}
        isOpen={activeModal === 'onpremise'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
};
