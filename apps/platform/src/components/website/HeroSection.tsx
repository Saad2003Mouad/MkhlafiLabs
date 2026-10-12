import React from 'react';
import { LocaleMode } from '../../types';
import { IconArrowRight } from '../Icons';

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

  return (
    <section className="hero-section" id="hero">
      <div className="hero-glow-bg" />

      <div className="site-container hero-grid">
        {/* Left Column: Value Proposition & Copy */}
        <div className="hero-content">
          <div className="hero-pill">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-success)' }} />
            <span>
              {isAr
                ? 'منصة الذكاء والقرارات التنفيذية للمؤسسات'
                : 'Enterprise Decision Intelligence Platform'}
            </span>
          </div>

          <h1 className="hero-headline">
            {isAr
              ? 'اقرأ الإشارات بوضوح. اتخذ قرارك القادم بثقة حاسمة.'
              : 'See your business clearly. Make your next move with confidence.'}
          </h1>

          <p className="hero-description">
            {isAr
              ? 'توحيد البيانات المؤسسية المتفرقة، كشف الانحرافات المالية والتشغيلية المبكرة، وتمكين فرق القيادة من اتخاذ قرارات دقيقة مدعومة بالأدلة القاطعة دون استبدال أنظمتك الحالية.'
              : 'Bring your business data together, uncover critical financial and operational variance, and give your leadership a clearer path to confident decisions.'}
          </p>

          <div className="hero-ctas">
            <button onClick={onExplorePlatform} className="btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }}>
              <span>{isAr ? 'استكشف المنصة الحية (Live Cockpit)' : 'Explore Live Platform'}</span>
              <IconArrowRight size={16} />
            </button>

            <button onClick={onRequestDemo} className="btn-secondary" style={{ padding: '12px 20px', fontSize: '14px' }}>
              <span>{isAr ? 'طلب عرض مخصص لمؤسستك' : 'Request Tailored Demo'}</span>
            </button>
          </div>

          {/* Proof Strip */}
          <div className="hero-stats-row">
            <div className="stat-item">
              <span className="stat-value">8</span>
              <span className="stat-label">
                {isAr ? 'محركات ذكاء موحدة' : 'Modular Intelligence Engines'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-value">0%</span>
              <span className="stat-label">
                {isAr ? 'استبدال للأنظمة القائمة' : 'Zero System Replacement'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-value">100%</span>
              <span className="stat-label">
                {isAr ? 'أدلة تدقيق مثبتة' : 'Verifiable Ledger Evidence'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Purpose-Built Realistic Product Composition */}
        <div className="hero-visual">
          <div className="cockpit-card">
            {/* Window Bar */}
            <div className="cockpit-header">
              <div className="cockpit-dots">
                <span className="cockpit-dot" style={{ background: '#EF4444' }} />
                <span className="cockpit-dot" style={{ background: '#F59E0B' }} />
                <span className="cockpit-dot" style={{ background: '#10B981' }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                MIKHLAFI_COMMAND_CENTER // V1.0_PROD
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-success)' }} />
                <span style={{ fontSize: '10px', color: 'var(--status-success)', fontWeight: 700 }}>
                  {isAr ? 'متصل بالبيانات' : 'LIVE FEED'}
                </span>
              </div>
            </div>

            {/* Live Interactive Preview Body */}
            <div className="cockpit-body">
              {/* Media Showcase Frame */}
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-sm)', marginBottom: '12px', border: '1px solid var(--border-subtle)', background: '#000' }}>
                <img
                  src="/assets/images/corporate-hero-cockpit.jpg"
                  alt="MIKHLAFI LABS Executive Decision Cockpit"
                  style={{ width: '100%', height: '175px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,18,23,0.92) 0%, rgba(12,18,23,0.2) 60%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: '8px', insetInlineStart: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', padding: '2px 7px', background: 'rgba(0,0,0,0.75)', borderRadius: '4px', border: '1px solid var(--status-success)', color: 'var(--status-success)', fontWeight: 700 }}>
                    ● {isAr ? 'دقة التدقيق 99.8%' : 'Audit Precision 99.8%'}
                  </span>
                  <span style={{ fontSize: '10px', padding: '2px 7px', background: 'rgba(0,0,0,0.75)', borderRadius: '4px', border: '1px solid var(--status-danger)', color: 'var(--status-danger)', fontWeight: 700 }}>
                    ⚠️ {isAr ? 'كشف الهدر: 48,500 ريال' : 'Leak: 48,500 SAR'}
                  </span>
                </div>
              </div>

              {/* Preview KPI Strip */}
              <div className="preview-kpi-row">
                <div className="preview-kpi-box">
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    {isAr ? 'الهدر المرصود' : 'Detected Leak'}
                  </span>
                  <span className="preview-kpi-num" style={{ color: 'var(--status-danger)' }}>
                    48,500 <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>SAR</span>
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--status-danger)', fontWeight: 700 }}>
                    {isAr ? 'فاتورة مكررة' : 'Duplicate Invoice'}
                  </span>
                </div>

                <div className="preview-kpi-box">
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    {isAr ? 'الكفاءة التشغيلية' : 'Ops Efficiency'}
                  </span>
                  <span className="preview-kpi-num" style={{ color: 'var(--status-success)' }}>
                    94.2%
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--status-success)', fontWeight: 700 }}>
                    +3.8% ↑
                  </span>
                </div>

                <div className="preview-kpi-box">
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    {isAr ? 'مخاطر الموردين' : 'Supplier Risk'}
                  </span>
                  <span className="preview-kpi-num" style={{ color: 'var(--status-warning)' }}>
                    18.5%
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--status-warning)', fontWeight: 700 }}>
                    {isAr ? 'تفاوت أسعار' : 'Price Creep'}
                  </span>
                </div>
              </div>

              {/* Forensic Anomaly Radar Box */}
              <div className="preview-radar-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {isAr ? 'طابور الأولويات التنفيذية (Live Radar):' : 'Executive Attention Queue:'}
                  </span>
                  <span className="severity-tag high">HIGH PRIORITY</span>
                </div>

                <div className="radar-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--status-danger)', fontWeight: 800 }}>●</span>
                    <span style={{ fontWeight: 600 }}>
                      {isAr ? 'اشتباه صرف مكرر #INV-9041 (مورد لوجستي)' : 'Duplicate payment match #INV-9041'}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-light)', fontWeight: 700 }}>
                    94.2% {isAr ? 'ثقة' : 'conf'}
                  </span>
                </div>

                <div className="radar-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--status-warning)', fontWeight: 800 }}>●</span>
                    <span style={{ fontWeight: 600 }}>
                      {isAr ? 'انحراف تكلفة توريد حديد عن العقد الأساسي (+16.5%)' : 'Material price creep vs contract CTR-04'}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-light)', fontWeight: 700 }}>
                    88.4% {isAr ? 'ثقة' : 'conf'}
                  </span>
                </div>
              </div>

              {/* Interactive Inspect Button */}
              <button
                onClick={onExplorePlatform}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}
              >
                <span>{isAr ? 'فتح التدقيق الجنائي الكامل في المنصة ←' : 'Open Full Forensic Audit in Platform →'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
