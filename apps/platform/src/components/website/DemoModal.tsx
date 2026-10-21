// MIKHLAFI LABS — Inbound Inquiry Modal
// Collects a demo/consultation request and submits it to the public inquiry endpoint.
// Success copy reflects what actually happened: a lead was recorded and a reference
// was returned. No trial credentials, workspace or access is created by this form.

import React, { useState, useEffect, useRef } from 'react';
import { LocaleMode, PricingPackage } from '../../types';
import { api } from '../../api/client';
import { IconCheckCircle, IconX, IconShield, IconAlertTriangle, IconArrowRight } from '../Icons';

interface DemoModalProps {
  locale: LocaleMode;
  isOpen: boolean;
  selectedPackage?: PricingPackage | null;
  onClose: () => void;
  onSuccessLaunch: () => void;
}

type SubmitState = 'idle' | 'submitting' | 'error' | 'success';

export const DemoModal: React.FC<DemoModalProps> = ({
  locale,
  isOpen,
  selectedPackage,
  onClose,
  onSuccessLaunch
}) => {
  const isAr = locale === 'ar';
  const [state, setState] = useState<SubmitState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [firstInvalidField, setFirstInvalidField] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    deploy: 'cloud'
  });

  // Reset each time the modal opens so a previous submission is never presented as current
  useEffect(() => {
    if (isOpen) {
      setState('idle');
      setError(null);
      setReference(null);
      setFirstInvalidField(null);
      const focusTimer = setTimeout(() => nameRef.current?.focus(), 60);
      return () => clearTimeout(focusTimer);
    }
  }, [isOpen]);

  // Escape closes the dialog
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const setField = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFirstInvalidField(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (state === 'submitting') return;

    setState('submitting');
    setError(null);

    const deploymentLabel =
      formData.deploy === 'on-premise'
        ? (isAr ? 'نشر محلي (On-Premise)' : 'On-premise deployment')
        : formData.deploy === 'hybrid'
          ? (isAr ? 'نموذج هجين' : 'Hybrid deployment')
          : (isAr ? 'سحابة مُدارة' : 'Managed cloud');

    const messageLines = [
      selectedPackage ? `${isAr ? 'الباقة المطلوبة' : 'Package of interest'}: ${isAr ? selectedPackage.nameAr : selectedPackage.nameEn}` : null,
      `${isAr ? 'بيئة النشر المفضلة' : 'Preferred deployment'}: ${deploymentLabel}`
    ].filter(Boolean);

    try {
      const result = await api.submitLeadInquiry({
        name: formData.name.trim(),
        email: formData.email.trim(),
        companyName: formData.company.trim(),
        phone: formData.phone.trim(),
        message: messageLines.join(' · '),
        inquiryType: 'demo_request'
      });

      setReference(result.inquiry?.id ?? null);
      setState('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setError(
        message ||
        (isAr
          ? 'تعذّر إرسال الطلب. تحقّق من الاتصال ثم أعد المحاولة.'
          : 'We could not send your request. Check your connection and try again.')
      );
      setFirstInvalidField((prev) => prev ?? 'name');
      setState('error');
    }
  };

  return (
    <div
      className="ml-modal-overlay"
      onClick={onClose}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="ml-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="ml-modal__head">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-subtle)',
                  border: '1px solid var(--border-glow)',
                  color: 'var(--accent-light)',
                  flexShrink: 0
                }}
              >
                <IconShield size={19} />
              </span>
              <div>
                <h3 id="inquiry-dialog-title" className="ml-title">
                  {isAr ? 'اطلب عرضاً تعارفياً' : 'Request an introduction'}
                </h3>
                <p style={{ marginTop: 5, fontSize: 12.5, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                  {isAr
                    ? 'يفتح هذا النموذج طلباً لدى فريق الحلول، ونتواصل معك عادة خلال يوم عمل واحد.'
                    : 'This opens an inquiry with our solutions team. We typically respond within one business day.'}
                </p>
              </div>
            </div>

            <button onClick={onClose} className="ml-icon-btn" aria-label={isAr ? 'إغلاق' : 'Close dialog'}>
              <IconX size={16} />
            </button>
          </div>

          {selectedPackage && (
            <div
              style={{
                marginTop: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                padding: '10px 14px',
                background: 'var(--accent-subtle)',
                border: '1px solid var(--border-glow)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                {isAr ? 'الباقة:' : 'Package:'}{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {isAr ? selectedPackage.nameAr : selectedPackage.nameEn}
                </strong>
              </span>
              <span className="ml-badge ml-badge--accent">
                {selectedPackage.servicesCount} {isAr ? 'محركات' : 'engines'}
              </span>
            </div>
          )}
        </div>

        {state === 'success' ? (
          /* ── Honest confirmation ───────────────────────────────────────── */
          <div className="ml-modal__body" style={{ textAlign: 'center', paddingTop: 26 }}>
            <div
              style={{
                width: 54,
                height: 54,
                margin: '0 auto',
                borderRadius: '50%',
                background: 'var(--status-success-subtle)',
                border: '1px solid rgba(52, 211, 153, 0.35)',
                color: 'var(--status-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconCheckCircle size={28} />
            </div>

            <h4 className="ml-title" style={{ marginTop: 18 }}>
              {isAr ? 'تم استلام طلبك' : 'Your request has been received'}
            </h4>

            <p style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.75, color: 'var(--text-secondary)' }}>
              {isAr
                ? 'سُجّل طلبك لدى فريق الحلول وسنراجع تفاصيل مؤسستك قبل التواصل معك. لم يتم إنشاء أي حساب أو وصول تلقائي.'
                : 'Your inquiry is logged with our solutions team, who will review your organisation details before contacting you. No account or access has been created automatically.'}
            </p>

            {reference && (
              <p
                style={{
                  marginTop: 14,
                  fontSize: 11.5,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {isAr ? 'رقم المرجع' : 'Reference'}: {reference}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 22 }}>
              <button
                onClick={() => {
                  onClose();
                  onSuccessLaunch();
                }}
                className="ml-btn ml-btn--primary ml-btn--block"
              >
                <span>{isAr ? 'أنشئ مساحة العمل الخاصة بك' : 'Create your workspace'}</span>
                <IconArrowRight size={15} />
              </button>
              <button onClick={onClose} className="ml-btn ml-btn--ghost ml-btn--block">
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="ml-modal__body">
              {error && (
                <div
                  role="alert"
                  aria-live="assertive"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 9,
                    padding: '10px 13px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--status-danger-subtle)',
                    border: '1px solid rgba(248, 113, 113, 0.3)',
                    color: 'var(--status-danger)',
                    fontSize: 12.5,
                    lineHeight: 1.6
                  }}
                >
                  <span style={{ display: 'flex', marginTop: 1 }}>
                    <IconAlertTriangle size={15} />
                  </span>
                  <span>{error}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 13 }}>
                <div className="ml-field">
                  <label className="ml-label" htmlFor="inquiry-name">
                    {isAr ? 'الاسم والمنصب' : 'Name & title'}
                  </label>
                  <input
                    id="inquiry-name"
                    ref={nameRef}
                    type="text"
                    required
                    autoComplete="name"
                    className="ml-input"
                    placeholder={isAr ? 'مثال: خالد العنزي — مدير العمليات' : 'e.g. Operations Director'}
                    value={formData.name}
                    onChange={(e) => setField('name', e.target.value)}
                    aria-invalid={firstInvalidField === 'name'}
                  />
                </div>

                <div className="ml-field">
                  <label className="ml-label" htmlFor="inquiry-company">
                    {isAr ? 'المؤسسة' : 'Organisation'}
                  </label>
                  <input
                    id="inquiry-company"
                    type="text"
                    required
                    autoComplete="organization"
                    className="ml-input"
                    placeholder={isAr ? 'اسم الشركة أو المجموعة' : 'Company or group name'}
                    value={formData.company}
                    onChange={(e) => setField('company', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 13 }}>
                <div className="ml-field">
                  <label className="ml-label" htmlFor="inquiry-email">
                    {isAr ? 'البريد المهني' : 'Work email'}
                  </label>
                  <input
                    id="inquiry-email"
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    dir="ltr"
                    className="ml-input"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setField('email', e.target.value)}
                    aria-invalid={firstInvalidField === 'email'}
                  />
                </div>

                <div className="ml-field">
                  <label className="ml-label" htmlFor="inquiry-phone">
                    {isAr ? 'رقم الهاتف' : 'Phone number'}
                  </label>
                  <input
                    id="inquiry-phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    dir="ltr"
                    className="ml-input"
                    placeholder="+966 5x xxx xxxx"
                    value={formData.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="ml-field">
                <label className="ml-label" htmlFor="inquiry-deploy">
                  {isAr ? 'بيئة النشر المفضّلة' : 'Preferred deployment environment'}
                </label>
                <select
                  id="inquiry-deploy"
                  className="ml-select"
                  value={formData.deploy}
                  onChange={(e) => setField('deploy', e.target.value)}
                >
                  <option value="cloud">
                    {isAr ? 'سحابة مؤسسية مُدارة' : 'Managed enterprise cloud'}
                  </option>
                  <option value="on-premise">
                    {isAr ? 'نشر محلي داخل مراكز بيانات المؤسسة' : 'On-premise in your own data centre'}
                  </option>
                  <option value="hybrid">
                    {isAr ? 'نموذج هجين' : 'Hybrid'}
                  </option>
                </select>
                <span className="ml-hint">
                  {isAr
                    ? 'يُستخدم هذا الاختيار فقط لصياغة عرض السعر المناسب لكم.'
                    : 'Used only to shape the quote we prepare for you.'}
                </span>
              </div>
            </div>

            <div className="ml-modal__foot">
              <button
                type="submit"
                className="ml-btn ml-btn--primary ml-btn--block"
                disabled={state === 'submitting'}
                aria-busy={state === 'submitting'}
              >
                {state === 'submitting' ? (
                  <span>{isAr ? 'جارٍ الإرسال…' : 'Sending…'}</span>
                ) : (
                  <span>{isAr ? 'إرسال الطلب' : 'Send request'}</span>
                )}
              </button>

              <p
                style={{
                  marginTop: 11,
                  fontSize: 11.5,
                  lineHeight: 1.6,
                  color: 'var(--text-muted)',
                  textAlign: 'center'
                }}
              >
                {isAr
                  ? 'لا ينشئ هذا النموذج حساباً ولا يمنح أي وصول. لإنشاء مساحة عمل سجّل حساباً مباشرة.'
                  : 'This form does not create an account or grant access. To set up a workspace, register directly.'}
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
