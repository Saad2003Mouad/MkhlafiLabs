// MIKHLAFI LABS — Public Contact & Enterprise Inquiry Page (/contact)
// Official enterprise engagement channels, headquarters info, and interactive inquiry form

import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import {
  IconArrowRight,
  IconCheckCircle,
  IconShield
} from '../../components/Icons';

interface ContactPageProps {
  locale: LocaleMode;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  locale
}) => {
  const isAr = locale === 'ar';

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    industry: 'manufacturing',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate enterprise inquiry submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="public-page contact-page">
      {/* Hero */}
      <section className="public-hero" style={{ padding: '6rem 0 3.5rem', background: 'radial-gradient(circle at 50% 0%, var(--accent-subtle) 0%, transparent 70%)' }}>
        <div className="site-container" style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto' }}>
          <div className="severity-tag optimal" style={{ display: 'inline-flex', marginBottom: '1.5rem', padding: '0.4rem 1rem' }}>
            {isAr ? 'قنوات التواصل المباشر' : 'EXECUTIVE CONSULTATION & INQUIRY'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem' }}>
            {isAr ? (
              <>تواصل مع فريق مخلافي لابس التقني</>
            ) : (
              <>Connect With Our Systems Architects</>
            )}
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '700px', margin: '0 auto' }}>
            {isAr
              ? 'سواء كنت بحاجة إلى استشارة فنية حول ربط أنظمة ERP، أو ترغب في جدولة عرض توضيحي حي لبيانات شركتك، فريقنا مستعد لخدمتك.'
              : 'Whether seeking technical guidance on ERP integration or scheduling an executive briefing, our team is ready to assist.'}
          </p>
        </div>
      </section>

      {/* Main Form & Info Grid */}
      <section className="site-section" style={{ padding: '3rem 0 6rem' }}>
        <div className="site-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '3rem', alignItems: 'start' }}>
            {/* Left: Contact Info & Credentials */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="kpi-card" style={{ padding: '2rem', background: 'var(--bg-surface)' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>
                  {isAr ? 'المقر الرئيسي والقنوات المعتمدة' : 'Headquarters & Certified Channels'}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {isAr ? '📍 المقر الإقليمي:' : '📍 Regional HQ:'}
                    </div>
                    <div>Riyadh, Kingdom of Saudi Arabia</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                      {isAr ? 'منطقة الأعمال والتقنية، طريق الملك فهد' : 'King Fahd Tech Corridor, Riyadh'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {isAr ? '✉️ البريد المؤسسي:' : '✉️ Enterprise Correspondence:'}
                    </div>
                    <div style={{ fontFamily: 'monospace', color: 'var(--accent-light)' }}>
                      contact@mikhlafi-labs.com
                    </div>
                    <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      enterprise@mikhlafi-labs.com
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {isAr ? '⏱️ سرعة الاستجابة:' : '⏱️ Response Service Level:'}
                    </div>
                    <div>
                      {isAr
                        ? 'يتم الرد على استفسارات المؤسسات خلال أقل من ٤ ساعات عمل.'
                        : 'Enterprise briefing requests are acknowledged within 4 business hours.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Confidentiality Box */}
              <div className="kpi-card" style={{ padding: '1.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--status-optimal)', marginBottom: '0.6rem' }}>
                  <IconShield size={20} />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {isAr ? 'بروتوكول السرية المشدد (NDA)' : 'Strict Non-Disclosure Protocol'}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {isAr
                    ? 'كافة الاستفسارات والبيانات الفنية المشاركة تخضع تلقائياً لاتفاقيات سرية وحماية بيانات صارمة وفقاً للأنظمة واللوائح المعتمدة.'
                    : 'All inquiries and shared architecture metadata are bound by bilateral confidentiality covenants.'}
                </p>
              </div>
            </div>

            {/* Right: Interactive Inquiry Form */}
            <div className="kpi-card" style={{ padding: '2.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ color: 'var(--status-optimal)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                    <IconCheckCircle size={48} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.8rem' }}>
                    {isAr ? 'تم استلام طلبك بنجاح' : 'Inquiry Received Successfully'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                    {isAr
                      ? 'شكراً لتواصلك مع مخلاfi لابس. سيقوم أحد مهندسي الأنظمة لدينا بمراجعة المتطلبات والتواصل معك لتأكيد موعد الجلسة الاستشارية.'
                      : 'Thank you for reaching out. A systems architect will review your technical scope and contact you to schedule the briefing.'}
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormState({ name: '', email: '', company: '', role: '', industry: 'manufacturing', message: '' });
                    }}
                    className="btn-secondary"
                  >
                    <span>{isAr ? 'إرسال استفسار آخر' : 'Send Another Inquiry'}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    {isAr ? 'طلب استشارة أو عرض توضيحي' : 'Request Consultation or Technical Demo'}
                  </h2>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                      {isAr ? 'الاسم الكامل *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder={isAr ? 'سعد محمد المخلافي' : 'Saad M. Al-Mikhlafi'}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                        {isAr ? 'البريد الإلكتروني المهني *' : 'Work Email *'}
                      </label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        placeholder="executive@company.com"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          fontFamily: 'inherit',
                          fontSize: '0.95rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                        {isAr ? 'اسم المؤسسة / الشركة *' : 'Organization Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.company}
                        onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                        placeholder={isAr ? 'مجموعة اليسر القابضة' : 'Al-Yusr Holding'}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          fontFamily: 'inherit',
                          fontSize: '0.95rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                        {isAr ? 'المسمى الوظيفي' : 'Job Title / Role'}
                      </label>
                      <input
                        type="text"
                        value={formState.role}
                        onChange={(e) => setFormState({ ...formState, role: e.target.value })}
                        placeholder={isAr ? 'الرئيس التنفيذي / مدير العمليات' : 'COO / VP of Operations'}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          fontFamily: 'inherit',
                          fontSize: '0.95rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                        {isAr ? 'القطاع التشغيلي' : 'Industry Sector'}
                      </label>
                      <select
                        value={formState.industry}
                        onChange={(e) => setFormState({ ...formState, industry: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          fontFamily: 'inherit',
                          fontSize: '0.95rem'
                        }}
                      >
                        <option value="manufacturing">{isAr ? 'الصناعات الثقيلة والتصنيع' : 'Manufacturing & Industrial'}</option>
                        <option value="logistics">{isAr ? 'اللوجستيات وسلاسل الإمداد' : 'Logistics & Distribution'}</option>
                        <option value="retail">{isAr ? 'التجزئة وتجارة الجملة' : 'Retail & FMCG'}</option>
                        <option value="conglomerate">{isAr ? 'مجموعة قابضة متعددة الأنشطة' : 'Holding Group / Multi-Entity'}</option>
                        <option value="other">{isAr ? 'قطاع آخر' : 'Other Domain'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                      {isAr ? 'تفاصيل الاستفسار أو الأنظمة المستخدمة' : 'Requirements & ERP Environment'}
                    </label>
                    <textarea
                      rows={3}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder={isAr ? 'نستخدم نظام SAP ونود تدقيق الانحرافات المالية في ٤ فروع...' : 'We run Oracle NetSuite and wish to audit procurement price variances...'}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                    style={{ padding: '0.85rem', width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                  >
                    <span>{submitting ? (isAr ? 'جاري الإرسال...' : 'Submitting...') : (isAr ? 'إرسال طلب الاستشارة' : 'Submit Consultation Request')}</span>
                    <IconArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
