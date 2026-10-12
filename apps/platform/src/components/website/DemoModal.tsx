import React, { useState } from 'react';
import { LocaleMode, PricingPackage } from '../../types';
import { IconCheckCircle, IconX, IconShield } from '../Icons';

interface DemoModalProps {
  locale: LocaleMode;
  isOpen: boolean;
  selectedPackage?: PricingPackage | null;
  onClose: () => void;
  onSuccessLaunch: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  locale,
  isOpen,
  selectedPackage,
  onClose,
  onSuccessLaunch
}) => {
  if (!isOpen) return null;

  const isAr = locale === 'ar';
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    deploy: 'cloud'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: 'var(--accent-light)' }}>
              <IconShield size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {isAr ? 'تفعيل التجربة المجانية والوصول للمنصة' : 'Activate Free Trial & Request Demo'}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {isAr ? 'وصول فوري لمحركات الذكاء دون بطاقة ائتمانية' : 'Instant evaluation access with zero credit card required'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="ctrl-btn" style={{ padding: '6px' }}>
            <IconX size={16} />
          </button>
        </div>

        {/* Selected Package Banner */}
        {selectedPackage && (
          <div style={{ padding: '10px 14px', background: 'var(--accent-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-base)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                {isAr ? 'الباقة المختارة:' : 'Selected Package:'}
              </span>
              <strong style={{ marginInlineStart: '6px', color: 'var(--text-primary)' }}>
                {isAr ? selectedPackage.nameAr : selectedPackage.nameEn}
              </strong>
            </div>
            <span className="solution-badge">
              {selectedPackage.servicesCount} {isAr ? 'محركات' : 'Engines'}
            </span>
          </div>
        )}

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {isAr ? 'الاسم الكامل والمنصب' : 'Full Name & Title'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'م. خالد — مدير العمليات' : 'CFO / Operations Director'}
                  className="modal-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {isAr ? 'اسم الشركة أو المؤسسة' : 'Company Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مجموعة التقنية القابضة' : 'Enterprise Holdings'}
                  className="modal-input"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {isAr ? 'البريد المهني الرسمي' : 'Official Work Email'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="modal-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {isAr ? 'رقم الهاتف للتواصل' : 'Contact Phone'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+966 5x xxx xxxx"
                  className="modal-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                {isAr ? 'بيئة النشر المفضلة للتجربة' : 'Preferred Deployment Architecture'}
              </label>
              <select
                className="modal-input"
                value={formData.deploy}
                onChange={(e) => setFormData({ ...formData, deploy: e.target.value })}
              >
                <option value="cloud">
                  {isAr ? 'السحابة المؤسسية المدارة (تفعيل فوري)' : 'Managed Sovereign Cloud (Instant)'}
                </option>
                <option value="on-premise">
                  {isAr ? 'نشر محلي سيادي في خوادم المؤسسة (On-Premise)' : 'Sovereign On-Premise (Private DC)'}
                </option>
                <option value="hybrid">
                  {isAr ? 'نموذج هجين (Hybrid)' : 'Hybrid Architecture'}
                </option>
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '6px' }}>
              <span>{isAr ? 'تأكيد التسجيل والدخول للمنصة فوراً' : 'Confirm & Launch Platform Access'}</span>
            </button>

            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
              {isAr ? 'اشتراك شهري مرن بعد انتهاء التجربة دون أي التزام مسبق.' : 'Flexible monthly subscription after trial period.'}
            </span>
          </form>
        ) : (
          /* Success Screen */
          <div style={{ textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--status-success-subtle)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconCheckCircle size={32} />
            </div>

            <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isAr ? 'تم تفعيل حساب التجربة المجانية بنجاح!' : 'Trial Access Granted Successfully!'}
            </h4>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '400px' }}>
              {isAr
                ? 'تم منحك ترخيصاً تجريبياً مؤقتاً لاستكشاف محركات الذكاء والتحقق من لوحة التحكم التنفيذية.'
                : 'Temporary evaluation credentials have been generated. You can now explore the live executive cockpit.'}
            </p>

            <button
              onClick={() => {
                onClose();
                onSuccessLaunch();
              }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              <span>{isAr ? 'دخول لوحة التحكم التنفيذية الآن ←' : 'Open Executive Cockpit Now →'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
