// MIKHLAFI LABS — Cloud SaaS Onboarding Wizard
// Full multi-step flow: Package Selection → Mock Payment → Company Setup → Connection Test → Success

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LocaleMode } from '../../types';
import {
  IconCheckCircle,
  IconX,
  IconArrowRight,
  IconShield,
  IconAlertTriangle,
} from '../Icons';

/* ─── Pricing Tiers ──────────────────────────────────────────────────────── */

export interface CloudTier {
  id: 'starter' | 'professional' | 'enterprise';
  nameAr: string;
  nameEn: string;
  subtitleAr: string;
  subtitleEn: string;
  badgeAr: string;
  badgeEn: string;
  priceMonthly: number;  // USD
  priceYearly: number;   // USD per month when billed annually
  engines: number;
  maxUsers: number | 'unlimited';
  maxSources: number | 'unlimited';
  recordsPerMonth: string;
  popular: boolean;
  featuresAr: string[];
  featuresEn: string[];
  color: string;
}

export const CLOUD_TIERS: CloudTier[] = [
  {
    id: 'starter',
    nameAr: 'الباقة الأساسية',
    nameEn: 'Foundation',
    subtitleAr: 'للفرق التي تبدأ بتوحيد بياناتها',
    subtitleEn: 'For teams starting to unify their data',
    badgeAr: '3 محركات',
    badgeEn: '3 Engines',
    priceMonthly: 99,
    priceYearly: 79,
    engines: 3,
    maxUsers: 5,
    maxSources: 2,
    recordsPerMonth: '100K',
    popular: false,
    color: '#6b7280',
    featuresAr: [
      '3 محركات ذكاء (كشف الانحراف، مركز القرار، جودة البيانات)',
      'حتى مصدري بيانات مرتبطين (ERP أو محاسبة)',
      'حتى 5 مستخدمين',
      '100,000 حركة تشغيلية شهرياً',
      'تقارير دورية قابلة للتصدير',
      'دعم عبر البريد الإلكتروني',
    ],
    featuresEn: [
      '3 intelligence engines (Anomaly, Decisions, Data Quality)',
      'Up to 2 connected data sources (ERP or accounting)',
      'Up to 5 users',
      '100K operating records/month',
      'Exportable periodic reports',
      'Email support',
    ],
  },
  {
    id: 'professional',
    nameAr: 'الباقة الاحترافية',
    nameEn: 'Professional',
    subtitleAr: 'للشركات المتوسعة تحكم أوسع بالمخاطر',
    subtitleEn: 'Wider risk and supplier control for scaling orgs',
    badgeAr: '5 محركات · الأكثر اختياراً',
    badgeEn: '5 Engines · Most Popular',
    priceMonthly: 299,
    priceYearly: 239,
    engines: 5,
    maxUsers: 25,
    maxSources: 'unlimited',
    recordsPerMonth: '1M',
    popular: true,
    color: '#d4a017',
    featuresAr: [
      '5 محركات تشمل المخاطر والموردين والمشاريع',
      'مصادر بيانات غير محدودة',
      'حتى 25 مستخدماً مع صلاحيات متدرجة (RBAC)',
      '1,000,000 حركة تشغيلية شهرياً',
      'تنبيهات فورية للانحرافات الحرجة',
      'دعم ذو أولوية + جلسة مراجعة شهرية',
    ],
    featuresEn: [
      '5 engines: Risk, Suppliers, Projects + core 3',
      'Unlimited data source connections',
      'Up to 25 users with granular RBAC',
      '1M operating records/month',
      'Real-time critical anomaly alerts',
      'Priority support + monthly review session',
    ],
  },
  {
    id: 'enterprise',
    nameAr: 'باقة المؤسسات',
    nameEn: 'Enterprise',
    subtitleAr: 'المنظومة الكاملة للمجموعات الكبرى',
    subtitleEn: 'Full suite for holding groups and multinationals',
    badgeAr: '8 محركات · كاملة',
    badgeEn: '8 Engines · Full Suite',
    priceMonthly: 799,
    priceYearly: 649,
    engines: 8,
    maxUsers: 'unlimited',
    maxSources: 'unlimited',
    recordsPerMonth: '10M+',
    popular: false,
    color: '#10b981',
    featuresAr: [
      'جميع المحركات الثمانية بلا أي قيود',
      'مساعد تنفيذي مدعوم بالأدلة (AI)',
      'مستخدمون ومصادر بيانات غير محدودة',
      '+10 ملايين حركة تشغيلية شهرياً',
      'SLA مؤسسي 99.9% مع مدير حساب مخصص',
      'تكاملات ERP مخصصة وإعداد مؤسسي كامل',
    ],
    featuresEn: [
      'All 8 engines with zero limitations',
      'Evidence-grounded AI Executive Assistant',
      'Unlimited users and data sources',
      '10M+ operating records/month',
      'Enterprise 99.9% SLA + dedicated account manager',
      'Custom ERP bridges and enterprise onboarding',
    ],
  },
];

/* ─── Wizard Step Types ──────────────────────────────────────────────────── */

type WizardStep =
  | 'select-plan'
  | 'billing-cycle'
  | 'payment'
  | 'company-setup'
  | 'connection-test'
  | 'success';

interface WizardState {
  step: WizardStep;
  selectedTier: CloudTier | null;
  billingCycle: 'monthly' | 'yearly';
  paymentDone: boolean;
  companyName: string;
  companyWebsite: string;
  companyIndustry: string;
  companyLogo: string | null;  // base64 data URL
  adminName: string;
  adminEmail: string;
  connectionMethod: 'api' | 'csv' | 'erp';
  connectionTested: boolean;
  connectionSuccess: boolean;
}

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface SaaSOnboardingWizardProps {
  locale: LocaleMode;
  isOpen: boolean;
  initialTierId?: string | null;
  onClose: () => void;
  onComplete: (tenantEmail: string) => void;
}

/* ─── Helper sub-components ─────────────────────────────────────────────── */

const StepIndicator: React.FC<{ current: WizardStep; isAr: boolean }> = ({ current, isAr }) => {
  const steps: Array<{ key: WizardStep; labelAr: string; labelEn: string }> = [
    { key: 'select-plan', labelAr: 'الباقة', labelEn: 'Plan' },
    { key: 'payment', labelAr: 'الدفع', labelEn: 'Payment' },
    { key: 'company-setup', labelAr: 'الشركة', labelEn: 'Company' },
    { key: 'connection-test', labelAr: 'الربط', labelEn: 'Connect' },
    { key: 'success', labelAr: 'تم', labelEn: 'Done' },
  ];

  const normalizedSteps = ['select-plan', 'billing-cycle', 'payment', 'company-setup', 'connection-test', 'success'];
  const currentIdx = normalizedSteps.indexOf(current);
  const displayIdx = currentIdx <= 1 ? 0 : currentIdx - 1;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
      {steps.map((step, idx) => {
        const done = idx < displayIdx;
        const active = idx === displayIdx;
        return (
          <React.Fragment key={step.key}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: done ? 'var(--status-success)' : active ? 'var(--accent-base)' : 'var(--surface-2)',
                border: active ? '2px solid var(--accent-light)' : done ? 'none' : '1.5px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                color: done ? '#fff' : active ? '#000' : 'var(--text-muted)',
                transition: 'all 0.3s ease',
                boxShadow: active ? '0 0 0 4px rgba(212,160,23,0.15)' : 'none',
              }}>
                {done ? '✓' : idx + 1}
              </div>
              <span style={{ fontSize: 10, color: active ? 'var(--accent-light)' : done ? 'var(--status-success)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {isAr ? step.labelAr : step.labelEn}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div style={{
                flex: 2, height: 1.5,
                background: idx < displayIdx ? 'var(--status-success)' : 'var(--border-subtle)',
                marginBottom: 18,
                transition: 'background 0.3s ease',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ─── Main Wizard Component ──────────────────────────────────────────────── */

export const SaaSOnboardingWizard: React.FC<SaaSOnboardingWizardProps> = ({
  locale,
  isOpen,
  initialTierId,
  onClose,
  onComplete,
}) => {
  const isAr = locale === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [state, setState] = useState<WizardState>({
    step: 'select-plan',
    selectedTier: null,
    billingCycle: 'monthly',
    paymentDone: false,
    companyName: '',
    companyWebsite: '',
    companyIndustry: '',
    companyLogo: null,
    adminName: '',
    adminEmail: '',
    connectionMethod: 'api',
    connectionTested: false,
    connectionSuccess: false,
  });

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      const initial = initialTierId
        ? CLOUD_TIERS.find((t) => t.id === initialTierId) ?? null
        : null;
      setState({
        step: initial ? 'billing-cycle' : 'select-plan',
        selectedTier: initial,
        billingCycle: 'monthly',
        paymentDone: false,
        companyName: '',
        companyWebsite: '',
        companyIndustry: '',
        companyLogo: null,
        adminName: '',
        adminEmail: '',
        connectionMethod: 'api',
        connectionTested: false,
        connectionSuccess: false,
      });
      setTestingConnection(false);
    }
  }, [isOpen, initialTierId]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const update = useCallback(<K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const go = useCallback((step: WizardStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      update('companyLogo', ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    // Simulate a connection test
    await new Promise((r) => setTimeout(r, 2200));
    setTestingConnection(false);
    update('connectionTested', true);
    update('connectionSuccess', true);
  };

  if (!isOpen) return null;

  const currentTierPrice = state.selectedTier
    ? state.billingCycle === 'yearly'
      ? state.selectedTier.priceYearly
      : state.selectedTier.priceMonthly
    : 0;

  /* ─── Render steps ─────────────────────────────────────────────────────── */

  const renderStep = () => {
    switch (state.step) {

      /* Step 1: Select Plan */
      case 'select-plan':
        return (
          <div>
            <h3 className="ml-title" style={{ marginBottom: 6 }}>
              {isAr ? 'اختر الباقة المناسبة' : 'Choose Your Plan'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              {isAr
                ? 'يمكنك ترقية أو تخفيض باقتك في أي وقت من لوحة التحكم.'
                : 'You can upgrade or downgrade your plan anytime from the dashboard.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CLOUD_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => {
                    update('selectedTier', tier);
                    go('billing-cycle');
                  }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 12,
                    alignItems: 'center',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: tier.popular ? 'rgba(212,160,23,0.06)' : 'var(--surface-2)',
                    border: tier.popular
                      ? '1.5px solid rgba(212,160,23,0.4)'
                      : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    textAlign: isAr ? 'right' : 'left',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = tier.color;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 3px ${tier.color}22`;
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = tier.popular ? 'rgba(212,160,23,0.4)' : 'var(--border-subtle)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {isAr ? tier.nameAr : tier.nameEn}
                      </span>
                      {tier.popular && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px',
                          borderRadius: 20, background: 'var(--accent-subtle)',
                          color: 'var(--accent-light)', border: '1px solid var(--border-glow)'
                        }}>
                          {isAr ? '★ الأكثر اختياراً' : '★ Most Popular'}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                      {isAr ? tier.subtitleAr : tier.subtitleEn}
                    </p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        🔧 {isAr ? `${tier.engines} محركات` : `${tier.engines} engines`}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        👥 {isAr
                          ? tier.maxUsers === 'unlimited' ? 'مستخدمون غير محدودون' : `${tier.maxUsers} مستخدم`
                          : tier.maxUsers === 'unlimited' ? 'Unlimited users' : `${tier.maxUsers} users`}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        📊 {tier.recordsPerMonth} {isAr ? 'حركة/شهر' : 'records/mo'}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: tier.color, lineHeight: 1 }}>
                      ${tier.priceMonthly}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      {isAr ? '/شهر' : '/month'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--status-success)', marginTop: 3 }}>
                      {isAr ? `$${tier.priceYearly} سنوياً` : `$${tier.priceYearly} yearly`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      /* Step 1b: Billing Cycle */
      case 'billing-cycle':
        if (!state.selectedTier) { go('select-plan'); return null; }
        return (
          <div>
            <h3 className="ml-title" style={{ marginBottom: 6 }}>
              {isAr ? 'اختر دورة الفوترة' : 'Choose Billing Cycle'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              {isAr
                ? `الباقة المختارة: ${state.selectedTier.nameAr}`
                : `Selected plan: ${state.selectedTier.nameEn}`}
            </p>
            <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
              {(['monthly', 'yearly'] as const).map((cycle) => {
                const price = cycle === 'yearly' ? state.selectedTier!.priceYearly : state.selectedTier!.priceMonthly;
                const isActive = state.billingCycle === cycle;
                const savings = Math.round((1 - state.selectedTier!.priceYearly / state.selectedTier!.priceMonthly) * 100);
                return (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => update('billingCycle', cycle)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 20px', borderRadius: 'var(--radius-md)',
                      background: isActive ? 'var(--accent-subtle)' : 'var(--surface-2)',
                      border: isActive ? '2px solid var(--accent-base)' : '1.5px solid var(--border-subtle)',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ textAlign: isAr ? 'right' : 'left' }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                        {cycle === 'monthly'
                          ? (isAr ? 'فوترة شهرية' : 'Monthly billing')
                          : (isAr ? 'فوترة سنوية' : 'Annual billing')}
                      </div>
                      {cycle === 'yearly' && (
                        <span style={{ fontSize: 11, color: 'var(--status-success)', fontWeight: 600 }}>
                          {isAr ? `وفّر ${savings}% سنوياً` : `Save ${savings}% per year`}
                        </span>
                      )}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-light)' }}>${price}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {isAr ? '/شهر' : '/month'}
                        {cycle === 'yearly' && (isAr ? ' · يُدفع سنوياً' : ' · billed annually')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button type="button" className="ml-btn ml-btn--ghost" onClick={() => go('select-plan')}>
                {isAr ? 'رجوع' : 'Back'}
              </button>
              <button type="button" className="ml-btn ml-btn--primary" style={{ flex: 1 }} onClick={() => go('payment')}>
                <span>{isAr ? 'المتابعة للدفع' : 'Continue to Payment'}</span>
                <IconArrowRight size={15} />
              </button>
            </div>
          </div>
        );

      /* Step 2: Payment */
      case 'payment':
        if (!state.selectedTier) { go('select-plan'); return null; }
        return (
          <div>
            <h3 className="ml-title" style={{ marginBottom: 6 }}>
              {isAr ? 'بوابة الدفع الآمنة' : 'Secure Payment Gateway'}
            </h3>
            {/* Order summary */}
            <div style={{
              padding: '14px 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', marginBottom: 18
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {isAr ? state.selectedTier.nameAr : state.selectedTier.nameEn}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  ${currentTierPrice}/{isAr ? 'شهر' : 'mo'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                <span>{isAr ? `فوترة ${state.billingCycle === 'yearly' ? 'سنوية' : 'شهرية'}` : `${state.billingCycle} billing`}</span>
                <span>{state.billingCycle === 'yearly' ? `$${currentTierPrice * 12}/${isAr ? 'سنة' : 'yr'}` : ''}</span>
              </div>
            </div>

            {/* Mock card form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div className="ml-field">
                <label className="ml-label">{isAr ? 'اسم حامل البطاقة' : 'Cardholder name'}</label>
                <input className="ml-input" placeholder={isAr ? 'الاسم كما في البطاقة' : 'Full name on card'} dir="auto" />
              </div>
              <div className="ml-field">
                <label className="ml-label">{isAr ? 'رقم البطاقة' : 'Card number'}</label>
                <input className="ml-input" placeholder="•••• •••• •••• ••••" dir="ltr" maxLength={19} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="ml-field">
                  <label className="ml-label">{isAr ? 'تاريخ الانتهاء' : 'Expiry'}</label>
                  <input className="ml-input" placeholder="MM / YY" dir="ltr" maxLength={7} />
                </div>
                <div className="ml-field">
                  <label className="ml-label">CVV</label>
                  <input className="ml-input" placeholder="•••" dir="ltr" maxLength={4} />
                </div>
              </div>
              <div className="ml-field">
                <label className="ml-label">{isAr ? 'البريد الإلكتروني للفاتورة' : 'Billing email'}</label>
                <input
                  className="ml-input" type="email" dir="ltr"
                  placeholder="billing@company.com"
                  value={state.adminEmail}
                  onChange={(e) => update('adminEmail', e.target.value)}
                />
              </div>
            </div>

            {/* Security badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginTop: 14,
              padding: '8px 12px', borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-2)', border: '1px solid var(--border-subtle)'
            }}>
              <IconShield size={14} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {isAr
                  ? 'مدفوعاتك مشفرة بـ SSL 256-bit. لا نحتفظ ببيانات بطاقتك.'
                  : 'Your payment is secured by 256-bit SSL encryption. We never store card data.'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button type="button" className="ml-btn ml-btn--ghost" onClick={() => go('billing-cycle')}>
                {isAr ? 'رجوع' : 'Back'}
              </button>
              <button
                type="button"
                className="ml-btn ml-btn--primary"
                style={{ flex: 1 }}
                onClick={() => { update('paymentDone', true); go('company-setup'); }}
              >
                <span>{isAr ? `إتمام الدفع $${currentTierPrice}` : `Pay $${currentTierPrice}`}</span>
                <IconArrowRight size={15} />
              </button>
            </div>
            <p style={{ fontSize: 10.5, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
              {isAr
                ? 'هذه بوابة دفع تجريبية. لن يتم خصم أي مبلغ فعلي الآن.'
                : 'This is a demo payment gateway. No actual charge will occur.'}
            </p>
          </div>
        );

      /* Step 3: Company Setup */
      case 'company-setup':
        return (
          <div>
            <h3 className="ml-title" style={{ marginBottom: 4 }}>
              {isAr ? 'إعداد معلومات شركتك' : 'Set Up Your Company'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              {isAr
                ? 'هذه المعلومات تظهر في تقاريرك ولوحة التحكم الخاصة بك.'
                : 'This information appears in your reports and workspace.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {/* Logo upload */}
              <div>
                <label className="ml-label" style={{ display: 'block', marginBottom: 8 }}>
                  {isAr ? 'شعار الشركة (اختياري)' : 'Company Logo (optional)'}
                </label>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '12px 16px', borderRadius: 'var(--radius-md)',
                    border: '1.5px dashed var(--border-subtle)', background: 'var(--surface-2)',
                    cursor: 'pointer',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {state.companyLogo ? (
                    <img
                      src={state.companyLogo}
                      alt="Logo"
                      style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6, background: '#fff' }}
                    />
                  ) : (
                    <div style={{
                      width: 48, height: 48, borderRadius: 8,
                      background: 'var(--surface-3)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 22
                    }}>
                      🏢
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {state.companyLogo
                        ? (isAr ? 'تم رفع الشعار ✓' : 'Logo uploaded ✓')
                        : (isAr ? 'انقر لرفع الشعار' : 'Click to upload logo')}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {isAr ? 'PNG أو JPG أو SVG (أقصى 2MB)' : 'PNG, JPG, or SVG (max 2MB)'}
                    </div>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleLogoUpload}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div className="ml-field">
                  <label className="ml-label">{isAr ? 'اسم الشركة *' : 'Company Name *'}</label>
                  <input
                    className="ml-input" dir="auto" required
                    placeholder={isAr ? 'مثال: شركة النور للتجارة' : 'e.g. Acme Trading Co.'}
                    value={state.companyName}
                    onChange={(e) => update('companyName', e.target.value)}
                  />
                </div>
                <div className="ml-field">
                  <label className="ml-label">{isAr ? 'القطاع' : 'Industry'}</label>
                  <select className="ml-select" value={state.companyIndustry} onChange={(e) => update('companyIndustry', e.target.value)}>
                    <option value="">{isAr ? 'اختر القطاع' : 'Select industry'}</option>
                    <option value="commerce">{isAr ? 'التجارة والتجزئة' : 'Commerce & Retail'}</option>
                    <option value="contracting">{isAr ? 'المقاولات والإنشاءات' : 'Contracting & Construction'}</option>
                    <option value="manufacturing">{isAr ? 'الصناعة والتصنيع' : 'Manufacturing'}</option>
                    <option value="services">{isAr ? 'الخدمات المهنية' : 'Professional Services'}</option>
                    <option value="logistics">{isAr ? 'اللوجستيات والنقل' : 'Logistics & Transport'}</option>
                    <option value="other">{isAr ? 'أخرى' : 'Other'}</option>
                  </select>
                </div>
              </div>

              <div className="ml-field">
                <label className="ml-label">{isAr ? 'الموقع الإلكتروني (اختياري)' : 'Website (optional)'}</label>
                <input
                  className="ml-input" type="url" dir="ltr"
                  placeholder="https://yourcompany.com"
                  value={state.companyWebsite}
                  onChange={(e) => update('companyWebsite', e.target.value)}
                />
              </div>

              <div className="ml-field">
                <label className="ml-label">{isAr ? 'اسم المسؤول الرئيسي *' : 'Primary Admin Name *'}</label>
                <input
                  className="ml-input" dir="auto" required
                  placeholder={isAr ? 'مثال: خالد العنزي' : 'e.g. John Smith'}
                  value={state.adminName}
                  onChange={(e) => update('adminName', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button type="button" className="ml-btn ml-btn--ghost" onClick={() => go('payment')}>
                {isAr ? 'رجوع' : 'Back'}
              </button>
              <button
                type="button"
                className="ml-btn ml-btn--primary"
                style={{ flex: 1 }}
                disabled={!state.companyName.trim() || !state.adminName.trim()}
                onClick={() => go('connection-test')}
              >
                <span>{isAr ? 'المتابعة لإعداد الربط' : 'Continue to Connection Setup'}</span>
                <IconArrowRight size={15} />
              </button>
            </div>
          </div>
        );

      /* Step 4: Connection Test */
      case 'connection-test':
        return (
          <div>
            <h3 className="ml-title" style={{ marginBottom: 4 }}>
              {isAr ? 'اختر طريقة ربط البيانات' : 'Choose Your Integration Method'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              {isAr
                ? 'جميع طرق الربط آمنة (قراءة فقط) ولا تؤثر على أنظمتك الحالية.'
                : 'All integration methods are secure (read-only) and non-intrusive to your systems.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                {
                  id: 'api' as const,
                  icon: '🔌',
                  titleAr: 'ربط API مباشر',
                  titleEn: 'Direct API Connection',
                  descAr: 'ربط آمن مع SAP وOracle وMS Dynamics وOdoo',
                  descEn: 'Secure connection with SAP, Oracle, Dynamics, Odoo',
                },
                {
                  id: 'csv' as const,
                  icon: '📄',
                  titleAr: 'رفع ملفات Excel/CSV',
                  titleEn: 'Excel / CSV Upload',
                  descAr: 'استيراد بياناتك من ملفات الإكسل أو CSV',
                  descEn: 'Import data directly from Excel or CSV files',
                },
                {
                  id: 'erp' as const,
                  icon: '🏗️',
                  titleAr: 'موصّل ERP جاهز',
                  titleEn: 'Pre-built ERP Connector',
                  descAr: 'اتصال مباشر عبر موصّل مُعتمد لنظامك',
                  descEn: 'Connect via a certified connector for your ERP',
                },
              ].map((method) => {
                const isActive = state.connectionMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      update('connectionMethod', method.id);
                      update('connectionTested', false);
                      update('connectionSuccess', false);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', borderRadius: 'var(--radius-md)',
                      background: isActive ? 'var(--accent-subtle)' : 'var(--surface-2)',
                      border: isActive ? '2px solid var(--accent-base)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer', transition: 'all 0.2s',
                      textAlign: isAr ? 'right' : 'left',
                    }}
                  >
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{method.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {isAr ? method.titleAr : method.titleEn}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {isAr ? method.descAr : method.descEn}
                      </div>
                    </div>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      border: isActive ? '5px solid var(--accent-base)' : '1.5px solid var(--border-subtle)',
                      flexShrink: 0, transition: 'all 0.2s',
                    }} />
                  </button>
                );
              })}
            </div>

            {/* API key field (shown for API method) */}
            {state.connectionMethod === 'api' && (
              <div className="ml-field" style={{ marginBottom: 16 }}>
                <label className="ml-label">{isAr ? 'مفتاح API (للاختبار)' : 'API Key (for testing)'}</label>
                <input className="ml-input" dir="ltr" placeholder="sk-••••••••••••••••••••••••" />
                <span className="ml-hint">
                  {isAr
                    ? 'يمكنك الحصول على مفتاح API من إعدادات نظامك الحالي.'
                    : 'You can find your API key in your current system settings.'}
                </span>
              </div>
            )}

            {state.connectionMethod === 'csv' && (
              <div style={{
                padding: '14px', borderRadius: 'var(--radius-md)',
                border: '1.5px dashed var(--border-subtle)', background: 'var(--surface-2)',
                textAlign: 'center', marginBottom: 16, cursor: 'pointer',
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>📁</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {isAr ? 'اسحب ملف CSV/Excel هنا أو انقر للرفع' : 'Drag & drop CSV/Excel or click to upload'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {isAr ? 'أقصى حجم 50MB لكل ملف' : 'Max 50MB per file'}
                </div>
              </div>
            )}

            {/* Test button */}
            {!state.connectionTested ? (
              <button
                type="button"
                className="ml-btn ml-btn--primary"
                style={{ width: '100%', marginBottom: 10 }}
                disabled={testingConnection}
                onClick={handleTestConnection}
              >
                {testingConnection ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    {isAr ? 'جارٍ اختبار الاتصال…' : 'Testing connection…'}
                  </span>
                ) : (
                  <span>{isAr ? 'اختبار الاتصال الآن' : 'Test Connection Now'}</span>
                )}
              </button>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', borderRadius: 'var(--radius-md)',
                background: state.connectionSuccess ? 'rgba(16,185,129,0.08)' : 'var(--status-danger-subtle)',
                border: `1.5px solid ${state.connectionSuccess ? 'rgba(16,185,129,0.3)' : 'rgba(248,113,113,0.3)'}`,
                marginBottom: 16,
              }}>
                {state.connectionSuccess ? (
                  <>
                    <IconCheckCircle size={18} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--status-success)' }}>
                        {isAr ? 'تم الاتصال بنجاح!' : 'Connection successful!'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {isAr ? 'تم الكشف عن 3 مصادر بيانات جاهزة للاستيراد.' : 'Detected 3 data sources ready for ingestion.'}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <IconAlertTriangle size={18} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--status-danger)' }}>
                        {isAr ? 'تعذّر الاتصال' : 'Connection failed'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {isAr ? 'تحقق من بيانات الاتصال وأعد المحاولة.' : 'Check your credentials and try again.'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="ml-btn ml-btn--ghost" onClick={() => go('company-setup')}>
                {isAr ? 'رجوع' : 'Back'}
              </button>
              <button
                type="button"
                className="ml-btn ml-btn--primary"
                style={{ flex: 1 }}
                disabled={!state.connectionTested || !state.connectionSuccess}
                onClick={() => go('success')}
              >
                <span>{isAr ? 'إتمام الإعداد' : 'Complete Setup'}</span>
                <IconArrowRight size={15} />
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
              {isAr
                ? 'يمكنك تخطي هذه الخطوة وإعداد الربط لاحقاً من لوحة التحكم.'
                : 'You can skip this step and set up the connection later from the dashboard.'}
            </p>
            <button
              type="button"
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, marginTop: 4, padding: 4 }}
              onClick={() => go('success')}
            >
              {isAr ? 'تخطي الآن →' : 'Skip for now →'}
            </button>
          </div>
        );

      /* Step 5: Success */
      case 'success':
        return (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            {/* Animated success icon */}
            <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 20px' }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
                border: '2px solid rgba(16,185,129,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(16,185,129,0.2)',
              }}>
                <span style={{ fontSize: 38 }}>✓</span>
              </div>
            </div>

            <h3 className="ml-title" style={{ fontSize: 22, marginBottom: 8, color: 'var(--status-success)' }}>
              {isAr ? '🎉 تم الربط بنجاح!' : '🎉 Setup Complete!'}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 22 }}>
              {isAr
                ? `تهانينا ${state.adminName ? state.adminName + '،' : ''} لقد تم إعداد مساحة عمل "${state.companyName || 'شركتك'}" بنجاح على المنصة. يمكنك الآن الدخول إلى لوحة التحكم وبدء استخدام محركات الذكاء.`
                : `Congratulations${state.adminName ? ', ' + state.adminName : ''}! Your workspace "${state.companyName || 'your company'}" has been set up successfully. You can now access your dashboard and start using the intelligence engines.`}
            </p>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
              {[
                { icon: '🔧', label: isAr ? 'الباقة' : 'Plan', value: isAr ? state.selectedTier?.nameAr : state.selectedTier?.nameEn },
                { icon: '🔌', label: isAr ? 'طريقة الربط' : 'Integration', value: isAr ? (state.connectionMethod === 'api' ? 'API' : state.connectionMethod === 'csv' ? 'Excel/CSV' : 'ERP') : state.connectionMethod.toUpperCase() },
                { icon: '💰', label: isAr ? 'الاشتراك' : 'Billing', value: `$${currentTierPrice}/${isAr ? 'شهر' : 'mo'}` },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '12px 10px', borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value || '—'}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                className="ml-btn ml-btn--primary ml-btn--block"
                onClick={() => onComplete(state.adminEmail)}
              >
                <span>{isAr ? 'الدخول إلى لوحة التحكم' : 'Go to Dashboard'}</span>
                <IconArrowRight size={15} />
              </button>
              <button type="button" className="ml-btn ml-btn--ghost ml-btn--block" onClick={onClose}>
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
        aria-labelledby="saas-wizard-title"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ maxWidth: 560, width: '100%' }}
      >
        {/* Header */}
        <div className="ml-modal__head">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38, borderRadius: 'var(--radius-md)',
                background: 'var(--accent-subtle)', border: '1px solid var(--border-glow)',
                color: 'var(--accent-light)', flexShrink: 0, fontSize: 18,
              }}>
                ☁️
              </span>
              <div>
                <h3 id="saas-wizard-title" className="ml-title" style={{ fontSize: 15, margin: 0 }}>
                  {isAr ? 'الاشتراك بالسحابة المشتركة' : 'Cloud SaaS Subscription'}
                </h3>
                <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)', margin: '3px 0 0' }}>
                  {isAr ? 'مخلافي لابس · SaaS' : 'MIKHLAFI LABS · SaaS'}
                </p>
              </div>
            </div>
            <button className="ml-icon-btn" aria-label={isAr ? 'إغلاق' : 'Close'} onClick={onClose}>
              <IconX size={16} />
            </button>
          </div>
        </div>

        {/* Step indicator */}
        <div className="ml-modal__body" style={{ paddingBottom: 0 }}>
          {state.step !== 'success' && <StepIndicator current={state.step} isAr={isAr} />}
        </div>

        {/* Step content */}
        <div className="ml-modal__body" style={{ paddingTop: 0 }}>
          {renderStep()}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};
