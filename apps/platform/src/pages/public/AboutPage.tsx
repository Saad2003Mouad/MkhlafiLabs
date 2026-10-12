import React from 'react';
import { LocaleMode } from '../../types';
import { IconArrowRight, IconServer, IconCheck } from '../../components/Icons';

interface AboutPageProps {
  locale: LocaleMode;
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ locale, onNavigate }) => {
  const isAr = locale === 'ar';

  return (
    <div className="content-scroll" style={{ padding: '0 0 4rem' }}>
      {/* Hero Intro */}
      <section style={{
        padding: '5rem 1.5rem 3rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-base) 100%)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '999px',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--border-accent)',
            color: 'var(--accent-light)',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '1.25rem'
          }}>
            <span>🏛️</span>
            <span>{isAr ? 'عن مخلافي لابس · MIKHLAFI LABS' : 'ABOUT MIKHLAFI LABS'}</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: '1.25rem',
            color: 'var(--text-primary)'
          }}>
            {isAr
              ? 'نبني تكنولوجيا تساعد المؤسسات على اتخاذ قرارات أفضل'
              : 'Building Technology That Helps Businesses Make Better Decisions'}
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            maxWidth: '720px',
            margin: '0 auto 2rem'
          }}>
            {isAr
              ? 'مخلافي لابس منصة ذكاء عمليات وقرارات عابرة للقطاعات، صُممت لتمكين القيادات التنفيذية من كشف الانحرافات المحاسبية وحماية هوامش الربحية بالاعتماد على أدلة رقمية قطعية وحتمية.'
              : 'MIKHLAFI LABS is a cross-industry decision intelligence platform designed to empower executive leadership with deterministic operational forensics, risk mitigation, and margin protection.'}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('/platform')}
              className="btn-primary"
              style={{ fontSize: '13px', padding: '10px 20px' }}
            >
              <span>{isAr ? 'استعراض معمارية المنظومة' : 'Explore Platform Architecture'}</span>
              <IconArrowRight size={14} />
            </button>

            <button
              onClick={() => onNavigate('/contact')}
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '10px 18px' }}
            >
              <span>{isAr ? 'طلب جلسة تشاورية' : 'Request Consultation'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Philosophy & Pillars */}
      <section style={{ maxWidth: '1100px', margin: '4rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            {isAr ? 'ركائزنا الجوهرية وفلسفة التصميم' : 'Our Core Pillars & Philosophy'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {isAr ? 'المبادئ الصارمة التي تحكم كل سطر برمجي وكل خوارزمية في مخلافي لابس' : 'The strict principles governing every algorithm and pipeline in MIKHLAFI LABS'}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {/* Card 1 */}
          <div className="decision-card" style={{ padding: '24px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--accent-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-light)',
              fontSize: '20px',
              marginBottom: '1rem'
            }}>
              ⚖️
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              {isAr ? 'الذكاء الحتمي القائم على الأدلة' : 'Deterministic Evidence-First'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {isAr
                ? 'لا نعتمد على نماذج التوليد الاحتمالية العشوائية في القرارات المالية والمحاسبية الحساسة. كل توصية تقترن بسجل قيد محاسبي مثبت ومسار تدقيق غير قابل للتلاعب.'
                : 'We reject probabilistic guessing for core financial and forensic audits. Every recommendation is backed by verifiable accounting records and immutable audit logs.'}
            </p>
          </div>

          {/* Card 2 */}
          <div className="decision-card" style={{ padding: '24px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--accent-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-light)',
              fontSize: '20px',
              marginBottom: '1rem'
            }}>
              🌐
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              {isAr ? 'منصة عابرة للقطاعات (Cross-Industry)' : 'Cross-Industry by Design'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {isAr
                ? 'المنصة غير مقتصرة على المقاولات أو المالية وحدها؛ بل توفر محركات تدقيق قياسية صالحة لسلاسل الإمداد، والتصنيع، والخدمات اللوجستية، وتجارة التجزئة.'
                : 'Architected universally across sectors: supply chain, distribution, logistics, industrial contracting, retail, and business operations.'}
            </p>
          </div>

          {/* Card 3 */}
          <div className="decision-card" style={{ padding: '24px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--accent-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-light)',
              fontSize: '20px',
              marginBottom: '1rem'
            }}>
              🛡️
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              {isAr ? 'السيادة والخصوصية وعزل البيانات' : 'Strict Sovereign Tenancy'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {isAr
                ? 'عزل خادمي صارم للمستأجرين في طبقة البيانات، ودعم النشر السحابي السيادي والمحلي (On-Premise) مع التوافق التام مع ضوابط الأمن السيبراني السعودية.'
                : 'Guaranteed server-side tenant isolation in PostgreSQL, support for sovereign cloud and on-premise hosting, compliant with enterprise security standards.'}
            </p>
          </div>
        </div>
      </section>

      {/* Corporate Summary & Leadership */}
      <section style={{ maxWidth: '1100px', margin: '4rem auto 0', padding: '0 1.5rem' }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--accent-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isAr ? 'الهوية والرسالة' : 'IDENTITY & MISSION'}
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '8px 0 16px', color: 'var(--text-primary)' }}>
              MIKHLAFI LABS
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              {isAr
                ? 'تأسست مخلافي لابس لتكون شريك التكنولوجيا الاستراتيجي للمؤسسات الكبرى والشركات الساعية لرفع كفاءة قراراتها. نركز على تحويل البيانات المتناثرة إلى رؤى قيادية قابلة للتنفيذ.'
                : 'Founded to deliver sovereign enterprise intelligence that eliminates accounting leakage and drives high-conviction decision making across fragmented business units.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconCheck size={14} />
                <span>{isAr ? 'المقر الرئيسي: الرياض، المملكة العربية السعودية' : 'Headquarters: Riyadh, Kingdom of Saudi Arabia'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconCheck size={14} />
                <span>{isAr ? 'الترخيص والأنظمة: منظومة أعمال وتقنية معلومات مؤسسية' : 'Enterprise Technology & SaaS Systems'}</span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <IconServer size={32} />
            <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '1rem', color: 'var(--text-primary)' }}>
              {isAr ? 'هل أنت مستعد لتأمين هوامش مؤسستك؟' : 'Ready to Secure Enterprise Margins?'}
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '8px 0 1.5rem' }}>
              {isAr
                ? 'ابدأ حساب تجريبي أو تواصل مع فريق مهندسي الحلول للربط الآمن مع ERP.'
                : 'Create your enterprise workspace or speak with our solutions architects.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => onNavigate('/register')} className="btn-primary" style={{ fontSize: '12px', padding: '8px 16px' }}>
                <span>{isAr ? 'إنشاء حساب جديد' : 'Create Account'}</span>
              </button>
              <button onClick={() => onNavigate('/contact')} className="btn-secondary" style={{ fontSize: '12px', padding: '8px 14px' }}>
                <span>{isAr ? 'تواصل معنا' : 'Contact Us'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
