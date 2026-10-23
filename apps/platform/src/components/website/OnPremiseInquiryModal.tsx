// MIKHLAFI LABS — Deployment Inquiry Modal (On-Premise, Hybrid Mesh, Dedicated Cloud)
// Custom deployment requirements routing directly to WhatsApp (+967716420699) or Email (saad2003almikhlafi@gmail.com)

import React, { useState, useEffect, useRef } from 'react';
import { LocaleMode } from '../../types';
import { IconX, IconCheckCircle, IconShield } from '../Icons';

const WHATSAPP_NUMBER = '+967716420699';
const CONTACT_EMAIL = 'saad2003almikhlafi@gmail.com';

export type DeploymentType = 'onpremise' | 'hybrid' | 'dedicated_cloud';

interface DeploymentInquiryModalProps {
  locale: LocaleMode;
  isOpen: boolean;
  deploymentType: DeploymentType;
  onClose: () => void;
}

type SendMethod = 'whatsapp' | 'email' | null;

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  envChoice: string;
  serverCount: string;
  services: string[];
  notes: string;
}

const SERVICES_LIST = [
  { id: 'anomaly', nameAr: 'كشف الانحراف والشذوذ المالي', nameEn: 'Financial Anomaly Detection' },
  { id: 'decisions', nameAr: 'مركز القرارات التنفيذي', nameEn: 'Executive Decisions Hub' },
  { id: 'risk', nameAr: 'تحليل المخاطر التشغيلية', nameEn: 'Operational Risk Analysis' },
  { id: 'suppliers', nameAr: 'مراقبة الموردين والعقود', nameEn: 'Supplier & Contract Monitoring' },
  { id: 'projects', nameAr: 'متابعة هوامش المشاريع', nameEn: 'Project Margin Tracking' },
  { id: 'customers', nameAr: 'تحليل مخاطر العملاء والانسحاب', nameEn: 'Customer Churn & Risk' },
  { id: 'data-quality', nameAr: 'حوكمة وجودة البيانات', nameEn: 'Data Governance & Quality' },
  { id: 'assistant', nameAr: 'المساعد التنفيذي بالذكاء الاصطناعي', nameEn: 'AI Executive Assistant' },
];

interface DeploymentConfig {
  icon: string;
  color: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  whatsappHeader: string;
  emailSubjectAr: string;
  emailSubjectEn: string;
  envQuestionAr: string;
  envQuestionEn: string;
  envOptions: { value: string; labelAr: string; labelEn: string }[];
}

const DEPLOYMENT_CONFIGS: Record<DeploymentType, DeploymentConfig> = {
  onpremise: {
    icon: '🏗️',
    color: '#6366f1',
    titleAr: 'طلب النشر الذاتي الكامل (Sovereign On-Premise / Air-Gapped)',
    titleEn: 'Sovereign On-Premise / Air-Gapped Deployment',
    subtitleAr: 'تثبيت المنظومة بالكامل على خوادمكم الداخلية مع سيادة وأمان تام',
    subtitleEn: 'Full deployment on your internal servers with zero external connectivity',
    whatsappHeader: '🔒 طلب نشر محلي ذاتي (Sovereign On-Premise)',
    emailSubjectAr: 'طلب نشر محلي ذاتي (On-Premise) — ',
    emailSubjectEn: 'Sovereign On-Premise Inquiry — ',
    envQuestionAr: 'بيئة الخوادم ونظام التشغيل',
    envQuestionEn: 'Server Environment & OS',
    envOptions: [
      { value: 'baremetal-linux', labelAr: 'خادم حقيقي (Bare Metal Ubuntu / RHEL)', labelEn: 'Bare Metal Linux (Ubuntu/RHEL)' },
      { value: 'virtual-vmware', labelAr: 'بيئة افتراضية (VMware / Hyper-V)', labelEn: 'Virtual Environment (VMware/Hyper-V)' },
      { value: 'airgapped-cluster', labelAr: 'شبكة معزولة بالكامل (Air-Gapped Cluster)', labelEn: 'Air-Gapped Isolated Cluster' },
      { value: 'windows-server', labelAr: 'خوادم ويندوز (Windows Server)', labelEn: 'Windows Server' },
    ],
  },
  hybrid: {
    icon: '🔀',
    color: '#10b981',
    titleAr: 'طلب النموذج الهجين الذكي (Hybrid Mesh / Local Worker Node)',
    titleEn: 'Adaptive Hybrid Mesh Deployment',
    subtitleAr: 'معالجة محلية للبيانات داخل شبكتكم + لوحة تحكم سحابية آمنة للمدراء',
    subtitleEn: 'Local data processing inside your network + secure cloud dashboard',
    whatsappHeader: '🔀 طلب النموذج الهجين الذكي (Hybrid Mesh)',
    emailSubjectAr: 'طلب النموذج الهجين (Hybrid Mesh) — ',
    emailSubjectEn: 'Hybrid Mesh Inquiry — ',
    envQuestionAr: 'طريقة تشغيل الوكيل المحلي (Local Worker)',
    envQuestionEn: 'Local Worker Deployment Preference',
    envOptions: [
      { value: 'docker', labelAr: 'حاوية دوكر داخلية (Docker Container Node)', labelEn: 'Internal Docker Container Node' },
      { value: 'kubernetes', labelAr: 'مجموعة كوبرنيتس (Kubernetes Mesh)', labelEn: 'Kubernetes Mesh' },
      { value: 'local-vm', labelAr: 'جهاز افتراضي محلي (Local VM Worker)', labelEn: 'Dedicated Local VM Worker' },
      { value: 'erp-connector', labelAr: 'رابط مباشر داخل شبكة الـ ERP', labelEn: 'Direct In-LAN ERP Connector' },
    ],
  },
  dedicated_cloud: {
    icon: '🛡️',
    color: '#0ea5e9',
    titleAr: 'طلب السحابة الخاصة المعزولة (Dedicated Private Cloud / Single-Tenant VPC)',
    titleEn: 'Dedicated Private Cloud / Single-Tenant VPC',
    subtitleAr: 'بيئة سحابية مخصصة ومستقلة 100% لمنشأتكم مع عزل كامل للأجهزة والبيانات',
    subtitleEn: '100% dedicated isolated VPC with single-tenant compute & database',
    whatsappHeader: '🛡️ طلب سحابة خاصة معزولة (Dedicated Private Cloud)',
    emailSubjectAr: 'طلب سحابة خاصة معزولة (Dedicated Cloud) — ',
    emailSubjectEn: 'Dedicated Private Cloud Inquiry — ',
    envQuestionAr: 'مزود السحابة المفضل ومقر البيانات',
    envQuestionEn: 'Preferred Cloud Provider & Data Residency',
    envOptions: [
      { value: 'oracle-saudi', labelAr: 'أوراكل كلاود السعودية (Oracle Cloud KSA - الرياض/جدة)', labelEn: 'Oracle Cloud KSA (Riyadh/Jeddah)' },
      { value: 'aws-uae-bahrain', labelAr: 'أمازون ويب سيرفيسز الخليج (AWS UAE / Bahrain)', labelEn: 'AWS Middle East (UAE/Bahrain)' },
      { value: 'azure-mideast', labelAr: 'مايكروسوفت أزور الشرق الأوسط (Azure ME)', labelEn: 'Microsoft Azure Middle East' },
      { value: 'custom-datacenter', labelAr: 'مركز بيانات محلي خاص معتمد', labelEn: 'Certified Local Private Data Center' },
    ],
  },
};

export const OnPremiseInquiryModal: React.FC<DeploymentInquiryModalProps> = ({
  locale,
  isOpen,
  deploymentType,
  onClose,
}) => {
  const isAr = locale === 'ar';
  const nameRef = useRef<HTMLInputElement>(null);
  const [sent, setSent] = useState<SendMethod>(null);
  const config = DEPLOYMENT_CONFIGS[deploymentType] || DEPLOYMENT_CONFIGS.onpremise;

  const [form, setForm] = useState<FormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    envChoice: '',
    serverCount: '',
    services: [],
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      setSent(null);
      setForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        envChoice: '',
        serverCount: '',
        services: [],
        notes: '',
      });
      setTimeout(() => nameRef.current?.focus(), 80);
    }
  }, [isOpen, deploymentType]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleService = (id: string) => {
    setField(
      'services',
      form.services.includes(id)
        ? form.services.filter((s) => s !== id)
        : [...form.services, id]
    );
  };

  const buildMessage = () => {
    const selectedServices = SERVICES_LIST.filter((s) => form.services.includes(s.id));
    const serviceList = selectedServices.map((s) => (isAr ? s.nameAr : s.nameEn)).join(', ');
    const selectedEnv = config.envOptions.find((o) => o.value === form.envChoice);
    const envLabel = selectedEnv ? (isAr ? selectedEnv.labelAr : selectedEnv.labelEn) : 'غير محدد';

    if (isAr) {
      return encodeURIComponent(
        `${config.whatsappHeader} — مخلافي لابس\n\n` +
        `👤 الاسم: ${form.name}\n` +
        `🏢 الشركة: ${form.company}\n` +
        `📧 الإيميل: ${form.email || 'غير مدخل'}\n` +
        `📞 الهاتف: ${form.phone}\n` +
        `⚙️ البيئة المطلوبة: ${envLabel}\n` +
        (form.serverCount ? `🖥️ عدد الخوادم: ${form.serverCount}\n` : '') +
        `🧩 الخدمات المطلوبة: ${serviceList || 'كافة الخدمات والمحركات'}\n\n` +
        `📝 ملاحظات ومتطلبات خاصة:\n${form.notes || 'لا توجد ملاحظات إضافية'}`
      );
    } else {
      return encodeURIComponent(
        `${config.emailSubjectEn} — MIKHLAFI LABS\n\n` +
        `👤 Name: ${form.name}\n` +
        `🏢 Company: ${form.company}\n` +
        `📧 Email: ${form.email || 'N/A'}\n` +
        `📞 Phone: ${form.phone}\n` +
        `⚙️ Environment: ${envLabel}\n` +
        (form.serverCount ? `🖥️ Servers: ${form.serverCount}\n` : '') +
        `🧩 Services: ${serviceList || 'All engines and services'}\n\n` +
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
      (isAr ? config.emailSubjectAr : config.emailSubjectEn) + form.company
    );
    const body = buildMessage();
    window.open(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`, '_blank');
    setSent('email');
  };

  const isFormValid =
    form.name.trim() &&
    form.company.trim() &&
    (form.email.trim() || form.phone.trim());

  return (
    <div
      className="ml-modal-overlay"
      style={{ zIndex: 9999 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="ml-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deployment-dialog-title"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ maxWidth: 600, width: '100%', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="ml-modal__head">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-md)',
                  background: `${config.color}1a`,
                  border: `1px solid ${config.color}40`,
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {config.icon}
              </span>
              <div>
                <h3 id="deployment-dialog-title" className="ml-title" style={{ fontSize: 15, margin: 0 }}>
                  {isAr ? config.titleAr : config.titleEn}
                </h3>
                <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)', margin: '3px 0 0' }}>
                  {isAr ? config.subtitleAr : config.subtitleEn}
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
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background: 'rgba(16,185,129,0.1)',
                  border: '2px solid rgba(16,185,129,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'var(--status-success)',
                }}
              >
                <IconCheckCircle size={36} />
              </div>
              <h4 className="ml-title" style={{ marginBottom: 10, fontSize: 17 }}>
                {sent === 'whatsapp'
                  ? (isAr ? 'تم فتح تطبيق واتساب بنجاح ✓' : 'WhatsApp opened successfully ✓')
                  : (isAr ? 'تم فتح تطبيق البريد الإلكتروني ✓' : 'Email client opened successfully ✓')}
              </h4>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 460, margin: '0 auto' }}>
                {isAr
                  ? 'طلبك جاهز للإرسال بكافة التفاصيل. بعد الإرسال سيتواصل معك مستشار النشر التقني خلال يوم عمل واحد لدراسة البيئة وتجهيز العرض الفني والمالي.'
                  : 'Your inquiry is ready to send. Our deployment engineer will get back to you within one business day with architecture guidance and custom pricing.'}
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'center' }}>
                <button
                  type="button"
                  className="ml-btn ml-btn--ghost"
                  onClick={() => setSent(null)}
                >
                  {isAr ? 'إرسال عبر وسيلة أخرى' : 'Send via another method'}
                </button>
                <button type="button" className="ml-btn ml-btn--primary" onClick={onClose}>
                  {isAr ? 'تم، إغلاق' : 'Done, Close'}
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <div>
              {/* 1. Contact info */}
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                  {isAr ? '1. بيانات التواصل والمنشأة' : '1. Contact & Organization'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'الاسم والمنصب *' : 'Name & Title *'}</label>
                    <input
                      ref={nameRef}
                      className="ml-input"
                      dir="auto"
                      required
                      placeholder={isAr ? 'مثال: محمد العتيبي — مدير IT' : 'e.g. Mohammed Al-Otaibi — IT Lead'}
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                    />
                  </div>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'اسم الشركة / المنشأة *' : 'Company Name *'}</label>
                    <input
                      className="ml-input"
                      dir="auto"
                      required
                      placeholder={isAr ? 'مثال: شركة النور القابضة' : 'e.g. Al-Noor Holding'}
                      value={form.company}
                      onChange={(e) => setField('company', e.target.value)}
                    />
                  </div>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'رقم الهاتف / واتساب *' : 'Phone / WhatsApp *'}</label>
                    <input
                      className="ml-input"
                      type="tel"
                      dir="ltr"
                      required
                      placeholder="+966 5x xxx xxxx"
                      value={form.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                    />
                  </div>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'البريد الإلكتروني المهني' : 'Work Email'}</label>
                    <input
                      className="ml-input"
                      type="email"
                      dir="ltr"
                      placeholder="name@company.com"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Environment specific choices */}
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                  {isAr ? `2. ${config.envQuestionAr}` : `2. ${config.envQuestionEn}`}
                </h4>
                <div className="ml-field" style={{ marginBottom: 10 }}>
                  <select
                    className="ml-select"
                    value={form.envChoice}
                    onChange={(e) => setField('envChoice', e.target.value)}
                  >
                    <option value="">{isAr ? '— حدد الخيار الأنسب لبيئتكم —' : '— Select preferred environment —'}</option>
                    {config.envOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {isAr ? opt.labelAr : opt.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                {deploymentType === 'onpremise' && (
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'عدد الخوادم التقديري' : 'Estimated Server Count'}</label>
                    <select
                      className="ml-select"
                      value={form.serverCount}
                      onChange={(e) => setField('serverCount', e.target.value)}
                    >
                      <option value="">{isAr ? 'اختر' : 'Select'}</option>
                      <option value="1">{isAr ? 'خادم واحد مستقل (Single Server Node)' : 'Single Server Node'}</option>
                      <option value="2-4">{isAr ? '2-4 خوادم (High Availability Cluster)' : '2-4 Servers (HA Cluster)'}</option>
                      <option value="5+">{isAr ? '5 خوادم فأكثر (Enterprise Scalable Mesh)' : '5+ Servers (Enterprise Mesh)'}</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 3. Services checkboxes */}
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  {isAr ? '3. المحركات والخدمات المطلوبة' : '3. Required Intelligence Engines'}
                </h4>
                <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 10 }}>
                  {isAr ? 'اختر الخدمات التي تحتاج لتفعيلها في منشأتكم (يمكنك تركها فارغة لاختيار الحزمة الكاملة):' : 'Select the services you need (leave empty for full suite):'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 8 }}>
                  {SERVICES_LIST.map((svc) => {
                    const checked = form.services.includes(svc.id);
                    return (
                      <label
                        key={svc.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: checked ? 'var(--accent-subtle)' : 'var(--surface-2)',
                          border: checked ? '1.5px solid var(--border-glow)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontSize: 12,
                          color: checked ? 'var(--text-primary)' : 'var(--text-secondary)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleService(svc.id)}
                          style={{ display: 'none' }}
                        />
                        <span
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            flexShrink: 0,
                            background: checked ? 'var(--accent-base)' : 'transparent',
                            border: checked ? 'none' : '1.5px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            color: '#000',
                            transition: 'all 0.2s',
                          }}
                        >
                          {checked && '✓'}
                        </span>
                        {isAr ? svc.nameAr : svc.nameEn}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 4. Notes */}
              <div className="ml-field" style={{ marginBottom: 18 }}>
                <label className="ml-label">{isAr ? '4. ملاحظات ومتطلبات خاصة' : '4. Special Requirements & Notes'}</label>
                <textarea
                  className="ml-input"
                  dir="auto"
                  rows={3}
                  placeholder={
                    isAr
                      ? 'حدد أي متطلبات خاصة: نظام الـ ERP الحالي (SAP/Oracle/Odoo)، حجم الحركات السنوية، متطلبات الشهادات والامتثال…'
                      : 'Specify any details: ERP system (SAP/Oracle/Odoo), annual volume, compliance requirements…'
                  }
                  value={form.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                  style={{ resize: 'vertical', minHeight: 80 }}
                />
              </div>

              {/* Security badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 18,
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <IconShield size={14} />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  {isAr
                    ? 'بياناتك مشفرة ومحمية وفق معايير الخصوصية الصارمة، ولن تُشارك إطلاقاً مع أطراف خارجية.'
                    : 'Your information is encrypted and strictly protected under privacy standards.'}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={!isFormValid}
                  onClick={handleSendWhatsApp}
                  style={{
                    flex: '1 1 180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: '13px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: isFormValid ? '#25D366' : 'var(--surface-2)',
                    border: 'none',
                    cursor: isFormValid ? 'pointer' : 'not-allowed',
                    color: isFormValid ? '#fff' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: 14,
                    transition: 'all 0.2s',
                    opacity: isFormValid ? 1 : 0.6,
                  }}
                >
                  <span style={{ fontSize: 18 }}>💬</span>
                  {isAr ? 'إرسال مباشر عبر واتساب' : 'Send via WhatsApp'}
                </button>

                <button
                  type="button"
                  disabled={!isFormValid}
                  onClick={handleSendEmail}
                  style={{
                    flex: '1 1 180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: '13px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: isFormValid ? 'var(--accent-base)' : 'var(--surface-2)',
                    border: 'none',
                    cursor: isFormValid ? 'pointer' : 'not-allowed',
                    color: isFormValid ? '#000' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: 14,
                    transition: 'all 0.2s',
                    opacity: isFormValid ? 1 : 0.6,
                  }}
                >
                  <span style={{ fontSize: 18 }}>📧</span>
                  {isAr ? 'إرسال عبر البريد الإلكتروني' : 'Send via Email'}
                </button>
              </div>

              {!isFormValid && (
                <p style={{ fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                  {isAr
                    ? '* يرجى إدخال الاسم، اسم المنشأة، ورقم الهاتف للتواصل'
                    : '* Please provide your name, company, and phone number'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
