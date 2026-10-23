// MIKHLAFI LABS — On-Premise / Air-Gapped Inquiry Modal
// Collects deployment requirements and routes to WhatsApp or Email

import React, { useState, useEffect, useRef } from 'react';
import { LocaleMode } from '../../types';
import { IconX, IconCheckCircle, IconShield } from '../Icons';

const WHATSAPP_NUMBER = '+967716420699';
const CONTACT_EMAIL = 'saad2003almikhlafi@gmail.com';

interface OnPremiseInquiryModalProps {
  locale: LocaleMode;
  isOpen: boolean;
  onClose: () => void;
}

type SendMethod = 'whatsapp' | 'email' | null;

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  serverCount: string;
  os: string;
  services: string[];
  notes: string;
}

const SERVICES_LIST = [
  { id: 'anomaly', nameAr: 'كشف الانحراف والشذوذ المالي', nameEn: 'Financial Anomaly Detection' },
  { id: 'decisions', nameAr: 'مركز القرارات التنفيذي', nameEn: 'Executive Decisions Hub' },
  { id: 'risk', nameAr: 'تحليل المخاطر التشغيلية', nameEn: 'Operational Risk Analysis' },
  { id: 'suppliers', nameAr: 'مراقبة الموردين والعقود', nameEn: 'Supplier & Contract Monitoring' },
  { id: 'projects', nameAr: 'متابعة هوامش المشاريع', nameEn: 'Project Margin Tracking' },
  { id: 'customers', nameAr: 'تحليل مخاطر العملاء', nameEn: 'Customer Churn & Risk' },
  { id: 'data-quality', nameAr: 'حوكمة وجودة البيانات', nameEn: 'Data Governance & Quality' },
  { id: 'assistant', nameAr: 'المساعد التنفيذي بالذكاء الاصطناعي', nameEn: 'AI Executive Assistant' },
];

export const OnPremiseInquiryModal: React.FC<OnPremiseInquiryModalProps> = ({
  locale,
  isOpen,
  onClose,
}) => {
  const isAr = locale === 'ar';
  const nameRef = useRef<HTMLInputElement>(null);
  const [sent, setSent] = useState<SendMethod>(null);
  const [form, setForm] = useState<FormData>({
    name: '', company: '', email: '', phone: '',
    serverCount: '', os: '', services: [], notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      setSent(null);
      setForm({ name: '', company: '', email: '', phone: '', serverCount: '', os: '', services: [], notes: '' });
      setTimeout(() => nameRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleService = (id: string) => {
    setField('services', form.services.includes(id)
      ? form.services.filter((s) => s !== id)
      : [...form.services, id]
    );
  };

  const buildMessage = () => {
    const selectedServices = SERVICES_LIST.filter((s) => form.services.includes(s.id));
    const serviceList = selectedServices.map((s) => isAr ? s.nameAr : s.nameEn).join(', ');
    if (isAr) {
      return encodeURIComponent(
        `🔒 طلب نشر محلي (On-Premise) — مخلافي لابس\n\n` +
        `👤 الاسم: ${form.name}\n` +
        `🏢 الشركة: ${form.company}\n` +
        `📧 الإيميل: ${form.email}\n` +
        `📞 الهاتف: ${form.phone}\n` +
        `🖥️ عدد الخوادم: ${form.serverCount || 'غير محدد'}\n` +
        `💻 نظام التشغيل: ${form.os || 'غير محدد'}\n` +
        `⚙️ الخدمات المطلوبة: ${serviceList || 'جميع الخدمات'}\n\n` +
        `📝 ملاحظات:\n${form.notes || 'لا توجد ملاحظات إضافية'}`
      );
    } else {
      return encodeURIComponent(
        `🔒 On-Premise Deployment Inquiry — MIKHLAFI LABS\n\n` +
        `👤 Name: ${form.name}\n` +
        `🏢 Company: ${form.company}\n` +
        `📧 Email: ${form.email}\n` +
        `📞 Phone: ${form.phone}\n` +
        `🖥️ Servers: ${form.serverCount || 'Not specified'}\n` +
        `💻 OS: ${form.os || 'Not specified'}\n` +
        `⚙️ Services: ${serviceList || 'All services'}\n\n` +
        `📝 Notes:\n${form.notes || 'None'}`
      );
    }
  };

  const handleSendWhatsApp = () => {
    const msg = buildMessage();
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${msg}`, '_blank');
    setSent('whatsapp');
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(
      isAr ? `طلب نشر محلي — ${form.company}` : `On-Premise Inquiry — ${form.company}`
    );
    const body = buildMessage();
    window.open(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`, '_blank');
    setSent('email');
  };

  const isFormValid = form.name.trim() && form.company.trim() && (form.email.trim() || form.phone.trim());

  return (
    <div
      className="ml-modal-overlay"
      style={{ zIndex: 9999 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="ml-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onprem-dialog-title"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ maxWidth: 580, width: '100%', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="ml-modal__head">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38, borderRadius: 'var(--radius-md)',
                background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                fontSize: 18, flexShrink: 0,
              }}>
                🏗️
              </span>
              <div>
                <h3 id="onprem-dialog-title" className="ml-title" style={{ fontSize: 15, margin: 0 }}>
                  {isAr ? 'طلب نشر محلي (On-Premise)' : 'Sovereign On-Premise Deployment'}
                </h3>
                <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)', margin: '3px 0 0' }}>
                  {isAr
                    ? 'أخبرنا باحتياجاتك وسنتواصل معك خلال 24 ساعة'
                    : 'Tell us your requirements and we\'ll respond within 24h'}
                </p>
              </div>
            </div>
            <button className="ml-icon-btn" aria-label="Close" onClick={onClose}>
              <IconX size={16} />
            </button>
          </div>
        </div>

        <div className="ml-modal__body">
          {sent ? (
            /* Success state */
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', color: 'var(--status-success)',
              }}>
                <IconCheckCircle size={32} />
              </div>
              <h4 className="ml-title" style={{ marginBottom: 10 }}>
                {sent === 'whatsapp'
                  ? (isAr ? 'تم فتح واتساب بنجاح ✓' : 'WhatsApp opened successfully ✓')
                  : (isAr ? 'تم فتح بريدك الإلكتروني ✓' : 'Email client opened successfully ✓')}
              </h4>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {isAr
                  ? 'طلبك جاهز للإرسال. بعد إرساله سيتواصل معك فريقنا التقني خلال يوم عمل واحد لمناقشة تفاصيل النشر وتقديم عرض سعر مخصص.'
                  : 'Your inquiry is ready to send. After sending, our technical team will contact you within one business day to discuss deployment details and provide a custom quote.'}
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  className="ml-btn ml-btn--ghost"
                  style={{ flex: 1 }}
                  onClick={() => setSent(null)}
                >
                  {isAr ? 'إرسال عبر طريقة أخرى' : 'Send via another method'}
                </button>
                <button type="button" className="ml-btn ml-btn--primary" style={{ flex: 1 }} onClick={onClose}>
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <div>
              {/* Contact info */}
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                  {isAr ? '1. بيانات التواصل' : '1. Contact Information'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'الاسم والمنصب *' : 'Name & Title *'}</label>
                    <input
                      ref={nameRef}
                      className="ml-input" dir="auto" required
                      placeholder={isAr ? 'مثال: محمد العتيبي — مدير IT' : 'e.g. Mohammed Al-Otaibi — IT Manager'}
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                    />
                  </div>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'اسم الشركة *' : 'Company Name *'}</label>
                    <input
                      className="ml-input" dir="auto" required
                      placeholder={isAr ? 'مثال: شركة النور' : 'e.g. Al-Noor Group'}
                      value={form.company}
                      onChange={(e) => setField('company', e.target.value)}
                    />
                  </div>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'البريد الإلكتروني' : 'Work Email'}</label>
                    <input
                      className="ml-input" type="email" dir="ltr"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                    />
                  </div>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'رقم الهاتف / واتساب *' : 'Phone / WhatsApp *'}</label>
                    <input
                      className="ml-input" type="tel" dir="ltr"
                      placeholder="+966 5x xxx xxxx"
                      value={form.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Infrastructure info */}
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                  {isAr ? '2. بيئة البنية التحتية (اختياري)' : '2. Infrastructure Environment (optional)'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'عدد الخوادم المتوقع' : 'Expected Server Count'}</label>
                    <select className="ml-select" value={form.serverCount} onChange={(e) => setField('serverCount', e.target.value)}>
                      <option value="">{isAr ? 'اختر' : 'Select'}</option>
                      <option value="1-3">{isAr ? '1-3 خوادم' : '1-3 servers'}</option>
                      <option value="4-10">{isAr ? '4-10 خوادم' : '4-10 servers'}</option>
                      <option value="10+">{isAr ? 'أكثر من 10' : '10+ servers'}</option>
                    </select>
                  </div>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'نظام التشغيل' : 'Operating System'}</label>
                    <select className="ml-select" value={form.os} onChange={(e) => setField('os', e.target.value)}>
                      <option value="">{isAr ? 'اختر' : 'Select'}</option>
                      <option value="ubuntu">Ubuntu Linux</option>
                      <option value="rhel">RHEL / CentOS</option>
                      <option value="windows">Windows Server</option>
                      <option value="kubernetes">Kubernetes Cluster</option>
                      <option value="other">{isAr ? 'أخرى' : 'Other'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Services checkboxes */}
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                  {isAr ? '3. الخدمات المطلوبة' : '3. Required Services'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                  {SERVICES_LIST.map((svc) => {
                    const checked = form.services.includes(svc.id);
                    return (
                      <label
                        key={svc.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                          background: checked ? 'var(--accent-subtle)' : 'var(--surface-2)',
                          border: checked ? '1.5px solid var(--border-glow)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer', transition: 'all 0.2s',
                          fontSize: 12.5, color: checked ? 'var(--text-primary)' : 'var(--text-secondary)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleService(svc.id)}
                          style={{ display: 'none' }}
                        />
                        <span style={{
                          width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                          background: checked ? 'var(--accent-base)' : 'transparent',
                          border: checked ? 'none' : '1.5px solid var(--border-subtle)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, color: '#000', transition: 'all 0.2s',
                        }}>
                          {checked && '✓'}
                        </span>
                        {isAr ? svc.nameAr : svc.nameEn}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="ml-field" style={{ marginBottom: 20 }}>
                <label className="ml-label">{isAr ? '4. ملاحظات إضافية' : '4. Additional Notes'}</label>
                <textarea
                  className="ml-input"
                  dir="auto"
                  rows={4}
                  placeholder={isAr
                    ? 'أضف أي تفاصيل إضافية: متطلبات الأمان، حجم البيانات، الجدول الزمني، القيود التقنية…'
                    : 'Add any additional details: security requirements, data volume, timeline, technical constraints…'
                  }
                  value={form.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                  style={{ resize: 'vertical', minHeight: 90 }}
                />
              </div>

              {/* Security note */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
              }}>
                <IconShield size={14} />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  {isAr
                    ? 'معلوماتك محمية تماماً ولن تُشارك مع أطراف ثالثة.'
                    : 'Your information is fully protected and will never be shared with third parties.'}
                </span>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={!isFormValid}
                  onClick={handleSendWhatsApp}
                  style={{
                    flex: '1 1 180px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    padding: '13px 20px', borderRadius: 'var(--radius-md)',
                    background: isFormValid ? '#25D366' : 'var(--surface-2)',
                    border: 'none', cursor: isFormValid ? 'pointer' : 'not-allowed',
                    color: isFormValid ? '#fff' : 'var(--text-muted)',
                    fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
                    opacity: isFormValid ? 1 : 0.6,
                  }}
                >
                  <span style={{ fontSize: 18 }}>💬</span>
                  {isAr ? 'إرسال عبر واتساب' : 'Send via WhatsApp'}
                </button>

                <button
                  type="button"
                  disabled={!isFormValid}
                  onClick={handleSendEmail}
                  style={{
                    flex: '1 1 180px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    padding: '13px 20px', borderRadius: 'var(--radius-md)',
                    background: isFormValid ? 'var(--accent-base)' : 'var(--surface-2)',
                    border: 'none', cursor: isFormValid ? 'pointer' : 'not-allowed',
                    color: isFormValid ? '#000' : 'var(--text-muted)',
                    fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
                    opacity: isFormValid ? 1 : 0.6,
                  }}
                >
                  <span style={{ fontSize: 18 }}>📧</span>
                  {isAr ? 'إرسال عبر الإيميل' : 'Send via Email'}
                </button>
              </div>

              {!isFormValid && (
                <p style={{ fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                  {isAr ? '* يرجى ملء الاسم واسم الشركة ورقم التواصل على الأقل' : '* Please fill in name, company and contact info'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
