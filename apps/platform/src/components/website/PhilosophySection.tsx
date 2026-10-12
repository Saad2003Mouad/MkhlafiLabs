import React from 'react';
import { LocaleMode } from '../../types';

interface PhilosophySectionProps {
  locale: LocaleMode;
}

export const PhilosophySection: React.FC<PhilosophySectionProps> = ({ locale }) => {
  const isAr = locale === 'ar';

  return (
    <section className="site-section" id="philosophy" style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="site-container">
        <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          <div className="section-kicker" style={{ justifyContent: 'center' }}>
            {isAr ? 'فلسفة المنظومة والمبادئ الهندسية' : 'OUR SYSTEM PHILOSOPHY'}
          </div>

          <blockquote
            style={{
              fontSize: '22px',
              fontWeight: 800,
              lineHeight: 1.5,
              color: 'var(--text-primary)',
              margin: '20px 0 24px',
              fontStyle: 'normal'
            }}
          >
            {isAr
              ? '«لا تُبنى القرارات الاستراتيجية للمؤسسات على الاحتمالات والتخمين، بل على الحقائق المحاسبية الموثقة وسلاسل الأدلة القاطعة.»'
              : '"Enterprise leadership decisions cannot rest on statistical guesswork, but on verifiable accounting facts and immutable audit trails."'}
          </blockquote>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '720px', margin: '0 auto 30px' }}>
            {isAr
              ? 'صممت MIKHLAFI LABS لتكون طبقة ذكاء سيادية موحدة تعمل فوق أنظمتك الحالية دون فرض استبدال مكلف، وتلتزم بأعلى معايير حوكمة البيانات والامتثال المحلي.'
              : 'MIKHLAFI LABS was engineered as a sovereign intelligence layer operating non-invasively above legacy ERPs, upholding the highest standards of data residency and deterministic verification.'}
          </p>

          {/* Architecture Mesh Media Showcase */}
          <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <img
              src="/assets/images/architecture-intelligence-mesh.jpg"
              alt="MIKHLAFI LABS Architecture Intelligence Mesh"
              style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,18,23,0.95) 0%, rgba(12,18,23,0.3) 60%, transparent 100%)' }} />
            <div style={{ position: 'absolute', bottom: '20px', insetInlineStart: '24px', textAlign: 'start' }}>
              <span style={{ fontSize: '11px', color: 'var(--accent-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {isAr ? 'المعمارية التقنية الموحدة' : 'INTELLIGENCE MESH ARCHITECTURE'}
              </span>
              <h4 style={{ margin: '4px 0 0', color: '#FFFFFF', fontSize: '16px', fontWeight: 700 }}>
                {isAr ? 'طبقة ذكاء فوقية غير تطفلية (Non-Invasive Telemetry Mesh)' : 'Non-Invasive Telemetry Mesh Above Existing ERPs'}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
