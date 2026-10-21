// MIKHLAFI LABS — Public Contact & Enterprise Inquiry Page (/contact)
// Official engagement channels + inquiry form posting real leads via api.submitLeadInquiry.

import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import {
  IconArrowRight,
  IconCheckCircle,
  IconGlobe,
  IconOrganization,
  IconShield
} from '../../components/Icons';
import { api } from '../../api/client';

interface ContactPageProps {
  locale: LocaleMode;
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

const initialForm = {
  name: '',
  email: '',
  company: '',
  role: '',
  industry: 'manufacturing',
  message: ''
};

export const ContactPage: React.FC<ContactPageProps> = ({ locale }) => {
  const isAr = locale === 'ar';

  const [formState, setFormState] = useState({ ...initialForm });
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [serverMessage, setServerMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await api.submitLeadInquiry({
        name: formState.name,
        email: formState.email,
        companyName: formState.company,
        message: [
          `Role: ${formState.role || '—'}`,
          `Industry: ${formState.industry}`,
          formState.message
        ].join(' | '),
        inquiryType: 'ENTERPRISE_DEMO'
      });

      if (res && res.success) {
        setServerMessage(res.message || '');
        setStatus('success');
      } else {
        setErrorMessage(
          (res && res.message) ||
            (isAr
              ? 'تعذّر استلام الطلب حالياً. بقيت بياناتك محفوظة في النموذج — أعد المحاولة أو راسلنا مباشرة.'
              : 'We could not register your request right now. Your details are kept in the form — retry, or email us directly.')
        );
        setStatus('error');
      }
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : isAr
            ? 'تعذّر استلام الطلب حالياً. بقيت بياناتك محفوظة في النموذج — أعد المحاولة أو راسلنا مباشرة.'
            : 'We could not register your request right now. Your details are kept in the form — retry, or email us directly.';
      setErrorMessage(msg);
      setStatus('error');
    }
  };

  const resetForm = () => {
    setFormState({ ...initialForm });
    setServerMessage('');
    setErrorMessage('');
    setStatus('idle');
  };

  return (
    <div className="public-page contact-page">
      {/* Hero */}
      <section className="pp-hero pp-hero--center">
        <div className="site-container">
          <div className="pp-hero__inner">
            <span className="pp-eyebrow">
              {isAr ? 'قنوات التواصل المباشر' : 'Executive Consultation & Inquiry'}
            </span>
            <h1 className="ml-display pp-hero__title">
              {isAr
                ? 'تواصل مع فريق مخلافي لابس التقني'
                : 'Connect with our systems architects'}
            </h1>
            <p className="pp-hero__lede">
              {isAr
                ? 'سواء كنت بحاجة إلى استشارة فنية حول ربط أنظمة ERP، أو ترغب في جدولة عرض توضيحي حي لبيانات شركتك، فريقنا مستعد لخدمتك.'
                : 'Whether you need technical guidance on ERP integration or want to schedule a live walkthrough on your own data, our team is ready to assist.'}
            </p>
          </div>
        </div>
      </section>

      {/* Channels + Inquiry form */}
      <section className="pp-section">
        <div className="site-container">
          <div className="pp-contact">
            {/* Left: channels & confidentiality */}
            <div className="pp-contact__aside">
              <div className="pp-contact__panel">
                <h2 className="pp-contact__title">
                  {isAr ? 'المقر والقنوات المعتمدة' : 'Headquarters & official channels'}
                </h2>

                <div className="pp-contact__item">
                  <span className="pp-contact__note-head">
                    <IconGlobe size={17} aria-hidden="true" />
                    <span className="pp-contact__note-title">
                      {isAr ? 'المقر الإقليمي' : 'Regional headquarters'}
                    </span>
                  </span>
                  <span className="pp-contact__v">
                    {isAr ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Kingdom of Saudi Arabia'}
                  </span>
                  <span className="pp-contact__v">
                    {isAr ? 'منطقة الأعمال والتقنية، طريق الملك فهد' : 'King Fahd Tech Corridor, Riyadh'}
                  </span>
                </div>

                <div className="pp-contact__item">
                  <span className="pp-contact__note-head">
                    <IconOrganization size={17} aria-hidden="true" />
                    <span className="pp-contact__note-title">
                      {isAr ? 'البريد المؤسسي' : 'Enterprise correspondence'}
                    </span>
                  </span>
                  <span className="pp-contact__mono">contact@mikhlafi-labs.com</span>
                  <span className="pp-contact__mono">enterprise@mikhlafi-labs.com</span>
                </div>

                <div className="pp-contact__note">
                  <span className="pp-contact__note-head">
                    <IconShield size={17} aria-hidden="true" />
                    <span className="pp-contact__note-title">
                      {isAr ? 'بروتوكول السرية المشدد' : 'Strict non-disclosure protocol'}
                    </span>
                  </span>
                  <span className="pp-contact__v">
                    {isAr
                      ? 'كافة الاستفسارات والبيانات الفنية المشاركة تخضع تلقائياً لاتفاقيات سرية وحماية بيانات صارمة وفقاً للأنظمة واللوائح المعتمدة.'
                      : 'All inquiries and shared architecture metadata are automatically bound by bilateral confidentiality and data-protection covenants.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: inquiry form */}
            <div className="pp-contact__panel">
              {status === 'success' ? (
                <div className="pp-success">
                  <span className="pp-success__icon" aria-hidden="true">
                    <IconCheckCircle size={44} />
                  </span>
                  <h2 className="pp-success__title">
                    {isAr ? 'تم استلام طلبك' : 'Your inquiry has been received'}
                  </h2>
                  <p className="pp-success__desc">
                    {serverMessage ||
                      (isAr
                        ? 'شكراً لتواصلك مع مخلافي لابس. سيقوم أحد مهندسي الأنظمة لدينا بمراجعة نطاق المتطلبات والتواصل معك لتأكيد موعد الجلسة.'
                        : 'Thank you for reaching out to MIKHLAFI LABS. A systems architect will review your scope and contact you to confirm the session.')}
                  </p>
                  <button type="button" className="ml-btn ml-btn--ghost" onClick={resetForm}>
                    <span>{isAr ? 'إرسال استفسار آخر' : 'Send another inquiry'}</span>
                  </button>
                </div>
              ) : (
                <form className="pp-form" onSubmit={handleSubmit} noValidate={false}>
                  <h2 className="pp-contact__title">
                    {isAr ? 'طلب استشارة أو عرض توضيحي' : 'Request consultation or a live demo'}
                  </h2>

                  {status === 'error' && errorMessage && (
                    <div className="pp-status pp-status--error" role="alert">
                      {errorMessage}
                    </div>
                  )}

                  <div className="ml-field">
                    <label className="ml-label" htmlFor="pp-contact-name">
                      {isAr ? 'الاسم الكامل *' : 'Full name *'}
                    </label>
                    <input
                      id="pp-contact-name"
                      type="text"
                      required
                      className="ml-input"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder={isAr ? 'سعد محمد المخلافي' : 'Saad M. Al-Mikhlafi'}
                    />
                  </div>

                  <div className="pp-form__row">
                    <div className="ml-field">
                      <label className="ml-label" htmlFor="pp-contact-email">
                        {isAr ? 'البريد الإلكتروني المهني *' : 'Work email *'}
                      </label>
                      <input
                        id="pp-contact-email"
                        type="email"
                        required
                        className="ml-input"
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        placeholder="executive@company.com"
                      />
                    </div>

                    <div className="ml-field">
                      <label className="ml-label" htmlFor="pp-contact-company">
                        {isAr ? 'اسم المؤسسة *' : 'Organization name *'}
                      </label>
                      <input
                        id="pp-contact-company"
                        type="text"
                        required
                        className="ml-input"
                        value={formState.company}
                        onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                        placeholder={isAr ? 'مجموعة اليسر القابضة' : 'Al-Yusr Holding'}
                      />
                    </div>
                  </div>

                  <div className="pp-form__row">
                    <div className="ml-field">
                      <label className="ml-label" htmlFor="pp-contact-role">
                        {isAr ? 'المسمى الوظيفي' : 'Job title / role'}
                      </label>
                      <input
                        id="pp-contact-role"
                        type="text"
                        className="ml-input"
                        value={formState.role}
                        onChange={(e) => setFormState({ ...formState, role: e.target.value })}
                        placeholder={isAr ? 'الرئيس التنفيذي / مدير العمليات' : 'COO / VP of Operations'}
                      />
                    </div>

                    <div className="ml-field">
                      <label className="ml-label" htmlFor="pp-contact-industry">
                        {isAr ? 'القطاع التشغيلي' : 'Industry sector'}
                      </label>
                      <select
                        id="pp-contact-industry"
                        className="ml-select"
                        value={formState.industry}
                        onChange={(e) => setFormState({ ...formState, industry: e.target.value })}
                      >
                        <option value="manufacturing">
                          {isAr ? 'الصناعات الثقيلة والتصنيع' : 'Manufacturing & Industrial'}
                        </option>
                        <option value="logistics">
                          {isAr ? 'اللوجستيات وسلاسل الإمداد' : 'Logistics & Distribution'}
                        </option>
                        <option value="retail">
                          {isAr ? 'التجزئة وتجارة الجملة' : 'Retail & FMCG'}
                        </option>
                        <option value="contracting">
                          {isAr ? 'المقاولات والمشاريع الكبرى' : 'Contracting & Projects'}
                        </option>
                        <option value="services">
                          {isAr ? 'الخدمات والقطاعات المتخصصة' : 'Services & Specialized Sectors'}
                        </option>
                        <option value="conglomerate">
                          {isAr ? 'مجموعة قابضة متعددة الأنشطة' : 'Holding Group / Multi-Entity'}
                        </option>
                        <option value="other">{isAr ? 'قطاع آخر' : 'Other domain'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="ml-field">
                    <label className="ml-label" htmlFor="pp-contact-message">
                      {isAr ? 'تفاصيل الاستفسار والأنظمة المستخدمة' : 'Requirements & current systems'}
                    </label>
                    <textarea
                      id="pp-contact-message"
                      rows={4}
                      className="ml-textarea"
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder={
                        isAr
                          ? 'نستخدم نظام SAP ونود تدقيق انحرافات المشتريات في أربعة فروع…'
                          : 'We run Oracle NetSuite and wish to audit procurement price variances across four branches…'
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="ml-btn ml-btn--primary ml-btn--block"
                  >
                    <span>
                      {status === 'submitting'
                        ? isAr
                          ? 'جاري الإرسال…'
                          : 'Submitting…'
                        : status === 'error'
                          ? isAr
                            ? 'إعادة إرسال الطلب'
                            : 'Retry submission'
                          : isAr
                            ? 'إرسال طلب الاستشارة'
                            : 'Submit consultation request'}
                    </span>
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
