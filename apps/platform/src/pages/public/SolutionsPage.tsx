// MIKHLAFI LABS — Public Enterprise Solutions & Engines Directory (/solutions)
// Comprehensive catalog of the 8 deterministic engines with interactive filtering and direct access to dedicated service pages

import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { SERVICES_CATALOG } from '../../data/servicesData';
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
  IconX
} from '../../components/Icons';

interface SolutionsPageProps {
  locale: LocaleMode;
  onNavigate?: (path: string) => void;
  onNavigateRegister: () => void;
  onRequestDemo: (serviceName?: string) => void;
}

export const SolutionsPage: React.FC<SolutionsPageProps> = ({
  locale,
  onNavigate,
  onNavigateRegister,
  onRequestDemo
}) => {
  const isAr = locale === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleServiceClick = (serviceId: string) => {
    if (onNavigate) {
      onNavigate(`/services/${serviceId}`);
    } else {
      window.history.pushState({}, '', `/services/${serviceId}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const getEngineIcon = (iconName: string, size = 22) => {
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

  const categories = [
    { id: 'all', labelAr: 'كافة المحركات (8)', labelEn: 'All Engines (8)' },
    { id: 'finance', labelAr: 'المالية والسيولة', labelEn: 'Finance & Liquidity' },
    { id: 'operations', labelAr: 'المشاريع والعمليات', labelEn: 'Projects & Operations' },
    { id: 'supply', labelAr: 'سلاسل الإمداد والمشتريات', labelEn: 'Supply & Procurement' },
    { id: 'governance', labelAr: 'الحوكمة والذكاء', labelEn: 'Governance & AI' }
  ];

  const mapCategory = (id: string): string => {
    if (id === 'financial-leak-detection' || id === 'risk-radar') return 'finance';
    if (id === 'executive-decisions' || id === 'project-margins') return 'operations';
    if (id === 'supplier-intelligence' || id === 'customer-retention') return 'supply';
    if (id === 'executive-assistant' || id === 'data-quality-governance') return 'governance';
    return 'all';
  };

  const filteredServices = SERVICES_CATALOG.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || mapCategory(s.id) === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      (isAr ? s.titleAr.toLowerCase() : s.titleEn.toLowerCase()).includes(searchQuery.toLowerCase()) ||
      (isAr ? s.heroDescriptionAr.toLowerCase() : s.heroDescriptionEn.toLowerCase()).includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="public-page solutions-page" style={{ position: 'relative' }}>
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '500px',
          background: 'radial-gradient(circle at 50% 0%, rgba(197, 160, 89, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Hero Header */}
      <section className="public-hero" style={{ padding: '6rem 0 3.5rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className="site-container" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div className="severity-tag optimal" style={{ display: 'inline-flex', marginBottom: '1.5rem', padding: '0.4rem 1.2rem', backdropFilter: 'blur(8px)' }}>
            {isAr ? 'منظومة المحركات المؤسسية' : 'ENTERPRISE INTELLIGENCE ENGINES'}
          </div>

          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            {isAr ? (
              <>ثمانية محركات حتمية لحماية الهوامش وتسريع القرار</>
            ) : (
              <>Eight Deterministic Engines for Uncompromised Enterprise Control</>
            )}
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: '800px', margin: '0 auto 2.5rem' }}>
            {isAr
              ? 'طبقة ذكاء سيادية موحدة تعمل فوق أنظمة ERP و CRM والقواعد المحاسبية القائمة. اضغط على أي خدمة لاستعراض الشرح الكامل، المحاكاة الحية، والأدلة التوثيقية.'
              : 'A unified sovereign intelligence layer deployed seamlessly over existing ERPs. Click any engine to explore in-depth methodology, live telemetry simulators, and case studies.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => onRequestDemo()} className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
              <span>{isAr ? 'طلب جلسة استعراض حي' : 'Book Executive Walkthrough'}</span>
              <IconArrowRight size={16} />
            </button>
            <button onClick={onNavigateRegister} className="btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
              <span>{isAr ? 'بدء تجربة المنظومة' : 'Start Workspace Pilot'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section style={{ padding: '1rem 0 2rem', position: 'relative', zIndex: 2 }}>
        <div className="site-container">
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            {/* Category Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-sm)',
                      border: isActive ? '1px solid var(--accent-light)' : '1px solid var(--border-subtle)',
                      background: isActive ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                      color: isActive ? 'var(--accent-light)' : 'var(--text-secondary)',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isAr ? cat.labelAr : cat.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Live Search Input */}
            <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 auto', maxWidth: '360px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث في المحركات والخدمات...' : 'Search engines & features...'}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '13px'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    insetInlineEnd: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer'
                  }}
                >
                  <IconX size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid with Direct Links to Dedicated Pages */}
      <section className="site-section" style={{ padding: '2rem 0 5rem' }}>
        <div className="site-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '24px'
            }}
          >
            {filteredServices.map((service) => (
              <div
                key={service.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="solution-card"
              >
                {/* Accent Top Stripe */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${service.accentColor}, transparent)`
                  }}
                />

                {/* Card Header: Icon, Engine Number, Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: `${service.accentColor}18`,
                      color: service.accentColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {getEngineIcon(service.iconName, 22)}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'var(--bg-surface-elevated)',
                        color: 'var(--text-tertiary)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      ENGINE #{service.engineNumber}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: `${service.accentColor}15`,
                        color: service.accentColor,
                        border: `1px solid ${service.accentColor}44`
                      }}
                    >
                      {isAr ? service.badgeAr : service.badgeEn}
                    </span>
                  </div>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3
                    style={{
                      fontSize: '19px',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      lineHeight: 1.35,
                      marginBottom: '6px'
                    }}
                  >
                    {isAr ? service.titleAr : service.titleEn}
                  </h3>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: service.accentColor, lineHeight: 1.4 }}>
                    {isAr ? service.taglineAr : service.taglineEn}
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.65, flex: 1 }}>
                  {isAr ? service.heroDescriptionAr : service.heroDescriptionEn}
                </p>

                {/* Key Metrics Strip */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {service.heroMetrics.map((m, mIdx) => (
                    <div key={mIdx} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '15px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: service.accentColor }}>
                        {m.val}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', lineHeight: 1.3, marginTop: '2px' }}>
                        {isAr ? m.labelAr : m.labelEn}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons: Navigate to Dedicated Service Page */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    onClick={() => handleServiceClick(service.id)}
                    className="btn-primary"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      fontSize: '13px',
                      fontWeight: 700,
                      justifyContent: 'center'
                    }}
                  >
                    <span>{isAr ? 'شرح الخدمة والمحاكاة الكاملة' : 'Full Service Specs & Demo'}</span>
                    <IconArrowRight size={14} />
                  </button>

                  <button
                    onClick={() => onRequestDemo(isAr ? service.titleAr : service.titleEn)}
                    className="btn-secondary"
                    style={{
                      padding: '10px 14px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                    title={isAr ? 'طلب عرض مخصص' : 'Request Demo'}
                  >
                    <span>{isAr ? 'تجربة' : 'Pilot'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section: Comparative Matrix (Traditional ERP/BI vs MIKHLAFI LABS) ── */}
      <section className="site-section" style={{ background: 'var(--bg-surface-subtle)', padding: '5rem 0' }}>
        <div className="site-container">
          <div className="section-head">
            <span className="section-eyebrow">
              {isAr ? 'المقارنة المعمارية الحتمية' : 'ARCHITECTURAL COMPARISON'}
            </span>
            <h2 className="section-title">
              {isAr
                ? 'لماذا تفشل لوحات BI التقليدية وتتفوق منظومة مخلافي لابس؟'
                : 'Why conventional BI fails where MIKHLAFI LABS delivers deterministic certainty'}
            </h2>
            <p className="section-subtitle">
              {isAr
                ? 'لوحات البيانات التقليدية تعرض ما حدث في الماضي بعد فوات الأوان، بينما منظومتنا تتدخل وتمنع الهدر قبل الصرف.'
                : 'Traditional reporting provides passive post-mortems; our deterministic engine executes active pre-settlement defense.'}
            </p>
          </div>

          <div
            style={{
              maxWidth: '980px',
              margin: '0 auto',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-default)' }}>
                    <th style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--text-tertiary)', width: '30%' }}>
                      {isAr ? 'المعيار التشغيلي' : 'Capability Dimension'}
                    </th>
                    <th style={{ padding: '16px 20px', fontWeight: 800, color: '#ef4444', width: '35%' }}>
                      {isAr ? 'لوحات BI والتقارير التقليدية' : 'Standard BI & Manual Audit'}
                    </th>
                    <th style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--status-success)', width: '35%' }}>
                      {isAr ? 'منظومة MIKHLAFI LABS الحتمية' : 'MIKHLAFI LABS Intelligence'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      dimAr: 'طبيعة التدخل',
                      dimEn: 'Intervention Timing',
                      tradAr: 'سلبي بعد الصرف (Post-Mortem Reporting)',
                      tradEn: 'Passive, post-disbursement reporting',
                      mikhAr: 'استباقي قبل اعتماد السندات (Pre-Settlement Shield)',
                      mikhEn: 'Autonomous pre-settlement barrier'
                    },
                    {
                      dimAr: 'مستوى التدقيق',
                      dimEn: 'Audit Granularity',
                      tradAr: 'أرقام مجمعة ومؤشرات عامة (Aggregated Totals)',
                      tradEn: 'High-level aggregated metrics',
                      mikhAr: 'تدقيق جنائي لكل بند وقيد ورقم حساب (Line-Item Forensics)',
                      mikhEn: 'Forensic audit of every individual line-item and IBAN'
                    },
                    {
                      dimAr: 'نسبة الإنذارات الخاطئة',
                      dimEn: 'False Positive Rate',
                      tradAr: 'عالية بسبب التخمين والنماذج الإحصائية العامة',
                      tradEn: 'High noise ratio from heuristic guesswork',
                      mikhAr: '0.00% أدلة حتمية مشفرة ومطابقة للسجلات',
                      mikhEn: '0.00% cryptographic ledger proof'
                    },
                    {
                      dimAr: 'توجيه الإجراءات',
                      dimEn: 'Prescriptive Directives',
                      tradAr: 'رسوم بيانية فقط تترك الحل للمحلل البشري',
                      tradEn: 'Passive visual charts without actionable next steps',
                      mikhAr: 'توجيه تنفيذي محدد بمسؤول وتكلفة ومردود مالي',
                      mikhEn: 'Crisp directives assigned with owner, deadline, and ROI'
                    },
                    {
                      dimAr: 'الأثر المالي المباشر',
                      dimEn: 'Quantified ROI',
                      tradAr: 'صعوبة قياس العائد الاستثماري على برامج التقارير',
                      tradEn: 'Unclear, unverified financial impact',
                      mikhAr: 'استرداد مالي مباشر (2% - 5% وفر من الإنفاق السنوي)',
                      mikhEn: 'Direct clawback (2% - 5% of annual operating spend)'
                    }
                  ].map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: rIdx % 2 === 0 ? 'transparent' : 'var(--bg-surface-subtle)'
                      }}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {isAr ? row.dimAr : row.dimEn}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                        <span style={{ color: '#ef4444', marginInlineEnd: '6px' }}>✕</span>
                        {isAr ? row.tradAr : row.tradEn}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        <span style={{ color: 'var(--status-success)', marginInlineEnd: '6px' }}>✓</span>
                        {isAr ? row.mikhAr : row.mikhEn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section
        style={{
          padding: '5rem 0',
          background: 'radial-gradient(ellipse at 50% 0%, var(--accent-subtle) 0%, var(--bg-surface-elevated) 70%)',
          borderTop: '1px solid var(--border-default)',
          textAlign: 'center'
        }}
      >
        <div className="site-container" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.2rem' }}>
            {isAr ? 'احمِ عملياتك وهوامشك المالية اليوم' : 'Protect Your Enterprise Margins Today'}
          </h2>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            {isAr
              ? 'تحدث مع فريقنا الاستشاري لبدء تشغيل عينة تجريبية على بيانات مؤسستك في بيئة آمنة وسيادية بالكامل.'
              : 'Speak with our enterprise engineers to run a non-invasive pilot across your active ledgers in a sovereign environment.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onRequestDemo()}
              className="btn-primary"
              style={{ padding: '0.9rem 2.4rem', fontSize: '1rem', fontWeight: 700 }}
            >
              <span>{isAr ? 'طلب عرض مخصص وتجربة تجريبية' : 'Request Tailored Demo'}</span>
              <IconArrowRight size={16} />
            </button>
            <button
              onClick={onNavigateRegister}
              className="btn-secondary"
              style={{ padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 600 }}
            >
              <span>{isAr ? 'تسجيل حساب مؤسسي' : 'Create Enterprise Account'}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
