// MIKHLAFI LABS — Public Hero Section
// High-impact executive value proposition, interactive cockpit tab switcher, and sovereign trust credentials

import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { IconArrowRight, IconShield, IconCheckCircle } from '../Icons';

interface HeroSectionProps {
  locale: LocaleMode;
  onExplorePlatform: () => void;
  onRequestDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  locale,
  onExplorePlatform,
  onRequestDemo
}) => {
  const isAr = locale === 'ar';
  const [activeCockpitTab, setActiveCockpitTab] = useState<'finance' | 'risk' | 'decisions' | 'projects'>('finance');

  const cockpitData = {
    finance: {
      image: '/assets/images/corporate-hero-cockpit.jpg',
      badgeAr: 'كشف الهدر المالي',
      badgeEn: 'Financial Leak Detection',
      tagColor: 'var(--status-danger)',
      kpi1: { labelAr: 'الهدر المرصود', labelEn: 'Detected Leak', val: '48,500 SAR', subAr: 'فاتورة مكررة #INV-9041', subEn: 'Duplicate Invoice #INV-9041', color: 'var(--status-danger)' },
      kpi2: { labelAr: 'معدل الدقة', labelEn: 'Audit Accuracy', val: '99.8%', subAr: 'أدلة تدقيق مثبتة', subEn: 'Cryptographic Proof', color: 'var(--status-success)' },
      kpi3: { labelAr: 'تباين الأسعار', labelEn: 'Price Variance', val: '+28.4%', subAr: 'تجاوز تسعيرة العقد', subEn: 'Rate Card Escalation', color: 'var(--status-warning)' },
      alert1: { titleAr: 'اشتباه صرف مكرر #INV-9041 (مورد لوجستي)', titleEn: 'Duplicate payment match #INV-9041', badge: 'CRITICAL', color: 'var(--status-danger)' },
      alert2: { titleAr: 'سعر توريد حديد مخالف للعقد CON-88 بند 4.2', titleEn: 'Steel rebar rate breach CON-88 Clause 4.2', badge: 'WARNING', color: 'var(--status-warning)' }
    },
    risk: {
      image: '/assets/images/hero-platform-cockpit.jpg',
      badgeAr: 'رادار التنبؤ بالمخاطر',
      badgeEn: 'Predictive Risk Radar',
      tagColor: 'var(--status-warning)',
      kpi1: { labelAr: 'فجوة السيولة', labelEn: 'Liquidity Gap', val: '1.8M SAR', subAr: 'خلال 22 يوماً', subEn: 'Forecast in 22 Days', color: 'var(--status-danger)' },
      kpi2: { labelAr: 'مهلة الإنذار', labelEn: 'Warning Runway', val: '42 يوماً', subAr: 'استباق محسوب', subEn: 'Proactive Horizon', color: 'var(--status-success)' },
      kpi3: { labelAr: 'مخاطر التوريد', labelEn: 'Stockout Risk', val: '14 يوماً', subAr: 'صمامات مصنع ينبع', subEn: 'Yanbu Plant Valves', color: 'var(--status-warning)' },
      alert1: { titleAr: 'تزامن رواتب الربع مع دفعة استيراد ضخمة', titleEn: 'Quarterly payroll overlaps with LC settlement', badge: 'ACTION REQUIRED', color: 'var(--status-danger)' },
      alert2: { titleAr: 'معدل استهلاك صمامات ينبع تجاوز سقف الأمان', titleEn: 'Component burn rate exceeded safety buffer', badge: 'STOCKOUT ALERT', color: 'var(--status-warning)' }
    },
    decisions: {
      image: '/assets/images/architecture-intelligence-mesh.jpg',
      badgeAr: 'شبكة القرارات التنفيذية',
      badgeEn: 'Executive Decisions',
      tagColor: 'var(--status-info)',
      kpi1: { labelAr: 'إعادة تخصيص', labelEn: 'Capital Reallocated', val: '1.2M SAR', subAr: 'لمترو الرياض محطة 4', subEn: 'To Riyadh Metro P4', color: 'var(--status-success)' },
      kpi2: { labelAr: 'تسريع القرار', labelEn: 'Decision Velocity', val: '4.2x', subAr: 'من أسابيع لساعات', subEn: 'Weeks down to hours', color: 'var(--status-info)' },
      kpi3: { labelAr: 'وفر تجميع الشراء', labelEn: 'Bulk Sourcing Gain', val: '+245K SAR', subAr: 'عقود إسمنت موحدة', subEn: 'Consolidated Cement', color: 'var(--status-success)' },
      alert1: { titleAr: 'سداد دفعة المولدات لتفادي غرامة 180,000 ريال', titleEn: 'Release generator tranche to avoid 180k penalty', badge: 'TOP DIRECTIVE', color: 'var(--status-success)' },
      alert2: { titleAr: 'تجميد الائتمان لشركة الأفق لتجاوز 90 يوماً سداد', titleEn: 'Hold credit line for Horizon Trading (> 90 days)', badge: 'CREDIT HOLD', color: 'var(--status-warning)' }
    },
    projects: {
      image: '/assets/images/industries-mesh-ecosystem.jpg',
      badgeAr: 'حوكمة هوامش المشاريع',
      badgeEn: 'Project Margin Assurance',
      tagColor: '#8B5CF6',
      kpi1: { labelAr: 'أعمال غير مفوترة', labelEn: 'Unbilled VO', val: '340,000 SAR', subAr: 'مشروع مجمع الملقا', subEn: 'Al-Malqa Complex', color: 'var(--status-danger)' },
      kpi2: { labelAr: 'حماية الهامش', labelEn: 'Margin Protection', val: '+4.2%', subAr: 'كبح التجاوزات', subEn: 'Preventing Overrun', color: 'var(--status-success)' },
      kpi3: { labelAr: 'وفر مسح الحفريات', labelEn: 'Survey Claim Saved', val: '33,000 SAR', subAr: 'تعديل مستخلص المقاول', subEn: 'Subcontractor Audit', color: 'var(--status-success)' },
      alert1: { titleAr: 'أمر تغيير غير معتمد منذ 45 يوماً في الموقع', titleEn: 'Unapproved variation order on site for 45 days', badge: 'BILLING HOLD', color: 'var(--status-danger)' },
      alert2: { titleAr: 'مستخلص مقاول حفريات متجاوز للمسح المساحي 18%', titleEn: 'Excavation claim exceeds GPS survey by 18%', badge: 'VERIFIED OVERBILL', color: 'var(--status-warning)' }
    }
  };

  const currentTab = cockpitData[activeCockpitTab];

  return (
    <section className="hero-section" id="hero" style={{ position: 'relative', overflow: 'hidden', paddingBottom: '3rem' }}>
      <div className="hero-glow-bg" />

      <div className="site-container hero-grid">
        {/* Left Column: Value Proposition & Copy */}
        <div className="hero-content">
          <div className="hero-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-default)', backdropFilter: 'blur(10px)', marginBottom: '1.2rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-success)', boxShadow: '0 0 10px var(--status-success)' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isAr
                ? 'منصة الذكاء والقرارات التنفيذية الحتمية للمؤسسات'
                : 'Enterprise Deterministic Decision Intelligence Platform'}
            </span>
          </div>

          <h1 className="hero-headline" style={{ fontSize: 'clamp(2.3rem, 5vw, 3.8rem)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '1.2rem' }}>
            {isAr ? (
              <>اقرأ الإشارات بوضوح حاسم. أوقف الهدر. اتخذ قرارك القادم بثقة مطلقة.</>
            ) : (
              <>Uncover hidden margin leak. Command enterprise decisions with mathematical proof.</>
            )}
          </h1>

          <p className="hero-description" style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '2rem' }}>
            {isAr
              ? 'طبقة ذكاء سيادية موحدة تربط أنظمة ERP المتفرقة ودفاتر الأستاذ العام، لتكشف الهدر المالي وانحراف هوامش المشاريع لحظياً، وتمنح القيادة توجيهات تنفيذية حتمية بالأدلة القاطعة دون استبدال برامجكم القائمة.'
              : 'A sovereign intelligence layer operating continuously over your siloed ERPs and general ledgers, intercepting financial leaks and contract slippages with zero operational disruption.'}
          </p>

          <div className="hero-ctas" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <button onClick={onExplorePlatform} className="btn-primary" style={{ padding: '14px 28px', fontSize: '15px', fontWeight: 700 }}>
              <span>{isAr ? 'استكشف غرفة القيادة الحية (Live Cockpit)' : 'Explore Live Cockpit'}</span>
              <IconArrowRight size={16} />
            </button>

            <button onClick={onRequestDemo} className="btn-secondary" style={{ padding: '14px 24px', fontSize: '15px', fontWeight: 600 }}>
              <span>{isAr ? 'طلب تجربة على بياناتك' : 'Request Non-Invasive Pilot'}</span>
            </button>
          </div>

          {/* Proof Strip */}
          <div className="hero-stats-row">
            <div className="stat-item">
              <span className="stat-value" style={{ color: 'var(--status-success)' }}>2.4% - 5.1%</span>
              <span className="stat-label">
                {isAr ? 'متوسط استرداد الهدر المالي' : 'Avg Recovered Margin'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-value">8</span>
              <span className="stat-label">
                {isAr ? 'محركات ذكاء حتمية متكاملة' : 'Modular Intelligence Engines'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-value">0%</span>
              <span className="stat-label">
                {isAr ? 'استبدال للأنظمة القائمة' : 'Zero System Replacement'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Purpose-Built Interactive Cockpit Preview */}
        <div className="hero-visual">
          <div className="cockpit-card" style={{ border: '1px solid var(--border-default)', boxShadow: '0 20px 50px rgba(0,0,0,0.6), var(--shadow-glow)' }}>
            {/* Cockpit Window Top Bar */}
            <div className="cockpit-header">
              <div className="cockpit-dots">
                <span className="cockpit-dot" style={{ background: '#EF4444' }} />
                <span className="cockpit-dot" style={{ background: '#F59E0B' }} />
                <span className="cockpit-dot" style={{ background: '#10B981' }} />
              </div>

              {/* Interactive Tabs inside Cockpit Bar */}
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                {[
                  { id: 'finance', labelAr: 'المالية', labelEn: 'Finance' },
                  { id: 'risk', labelAr: 'المخاطر', labelEn: 'Risk' },
                  { id: 'decisions', labelAr: 'القرارات', labelEn: 'Decisions' },
                  { id: 'projects', labelAr: 'المشاريع', labelEn: 'Projects' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCockpitTab(tab.id as any)}
                    style={{
                      border: 'none',
                      background: activeCockpitTab === tab.id ? 'var(--accent-subtle)' : 'transparent',
                      color: activeCockpitTab === tab.id ? 'var(--accent-light)' : 'var(--text-tertiary)',
                      fontSize: '11px',
                      fontWeight: activeCockpitTab === tab.id ? 800 : 600,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isAr ? tab.labelAr : tab.labelEn}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-success)' }} />
                <span style={{ fontSize: '10px', color: 'var(--status-success)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  LIVE
                </span>
              </div>
            </div>

            {/* Live Interactive Preview Body */}
            <div className="cockpit-body">
              {/* Media Frame with Overlay */}
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-sm)', marginBottom: '8px', border: '1px solid var(--border-subtle)', background: '#000' }}>
                <img
                  src={currentTab.image}
                  alt="MIKHLAFI LABS Executive Decision Cockpit"
                  style={{ width: '100%', height: '175px', objectFit: 'cover', display: 'block', transition: 'all 0.3s ease' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,18,23,0.95) 0%, rgba(12,18,23,0.3) 60%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: '8px', insetInlineStart: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', padding: '3px 8px', background: 'rgba(0,0,0,0.85)', borderRadius: '4px', border: `1px solid ${currentTab.tagColor}`, color: currentTab.tagColor, fontWeight: 800 }}>
                    ● {isAr ? currentTab.badgeAr : currentTab.badgeEn}
                  </span>
                  <span style={{ fontSize: '10px', padding: '3px 8px', background: 'rgba(0,0,0,0.85)', borderRadius: '4px', border: '1px solid var(--status-success)', color: 'var(--status-success)', fontWeight: 700 }}>
                    ✓ {isAr ? 'تدقيق مستمر متصل' : 'Continuous Audit On'}
                  </span>
                </div>
              </div>

              {/* Dynamic 3-KPI Row */}
              <div className="preview-kpi-row">
                <div className="preview-kpi-box">
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    {isAr ? currentTab.kpi1.labelAr : currentTab.kpi1.labelEn}
                  </span>
                  <span className="preview-kpi-num" style={{ color: currentTab.kpi1.color }}>
                    {currentTab.kpi1.val}
                  </span>
                  <span style={{ fontSize: '10px', color: currentTab.kpi1.color, fontWeight: 700 }}>
                    {isAr ? currentTab.kpi1.subAr : currentTab.kpi1.subEn}
                  </span>
                </div>

                <div className="preview-kpi-box">
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    {isAr ? currentTab.kpi2.labelAr : currentTab.kpi2.labelEn}
                  </span>
                  <span className="preview-kpi-num" style={{ color: currentTab.kpi2.color }}>
                    {currentTab.kpi2.val}
                  </span>
                  <span style={{ fontSize: '10px', color: currentTab.kpi2.color, fontWeight: 700 }}>
                    {isAr ? currentTab.kpi2.subAr : currentTab.kpi2.subEn}
                  </span>
                </div>

                <div className="preview-kpi-box">
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    {isAr ? currentTab.kpi3.labelAr : currentTab.kpi3.labelEn}
                  </span>
                  <span className="preview-kpi-num" style={{ color: currentTab.kpi3.color }}>
                    {currentTab.kpi3.val}
                  </span>
                  <span style={{ fontSize: '10px', color: currentTab.kpi3.color, fontWeight: 700 }}>
                    {isAr ? currentTab.kpi3.subAr : currentTab.kpi3.subEn}
                  </span>
                </div>
              </div>

              {/* Forensic Anomaly Radar Box */}
              <div className="preview-radar-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {isAr ? 'الإشارات المرصودة في الدفاتر (Live Radar):' : 'Active Ledger Signals:'}
                  </span>
                  <span className="severity-tag high" style={{ fontSize: '9px', padding: '2px 6px' }}>REAL-TIME</span>
                </div>

                <div className="radar-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: currentTab.alert1.color, fontWeight: 800 }}>●</span>
                    <span style={{ fontWeight: 600, fontSize: '12px' }}>
                      {isAr ? currentTab.alert1.titleAr : currentTab.alert1.titleEn}
                    </span>
                  </div>
                  <span style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '3px', background: `${currentTab.alert1.color}22`, color: currentTab.alert1.color, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    {currentTab.alert1.badge}
                  </span>
                </div>

                <div className="radar-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: currentTab.alert2.color, fontWeight: 800 }}>●</span>
                    <span style={{ fontWeight: 600, fontSize: '12px' }}>
                      {isAr ? currentTab.alert2.titleAr : currentTab.alert2.titleEn}
                    </span>
                  </div>
                  <span style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '3px', background: `${currentTab.alert2.color}22`, color: currentTab.alert2.color, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    {currentTab.alert2.badge}
                  </span>
                </div>
              </div>

              {/* Interactive Inspect Button */}
              <button
                onClick={onExplorePlatform}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '13px', fontWeight: 700, padding: '10px' }}
              >
                <span>{isAr ? 'فتح التدقيق الجنائي الكامل في المنصة ←' : 'Open Full Forensic Audit in Platform →'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sovereign Trust & Enterprise Compliance Strip */}
      <div style={{ marginTop: '3.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.8rem' }}>
        <div className="site-container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'clamp(1rem, 3vw, 2.5rem)',
              color: 'var(--text-tertiary)',
              fontSize: '12.5px',
              fontWeight: 700
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🇸🇦</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {isAr ? 'استضافة سيادية داخل المملكة العربية السعودية' : 'Sovereign KSA In-Kingdom Hosting'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconShield size={16} color="var(--status-success)" />
              <span style={{ color: 'var(--text-secondary)' }}>
                {isAr ? 'متوافق مع نظام حماية البيانات الشخصية (PDPL)' : 'Compliant with Saudi PDPL & NCA'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconCheckCircle size={16} color="var(--accent-light)" />
              <span style={{ color: 'var(--text-secondary)' }}>
                {isAr ? 'مطابق لمتطلبات هيئة الزكاة (ZATCA Phase 2)' : 'ZATCA Phase 2 E-Invoice Ready'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '2px 6px', borderRadius: '3px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                ISO 27001
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {isAr ? 'تصنيف أمان بيانات Class C' : 'Class C Data Security Certified'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
