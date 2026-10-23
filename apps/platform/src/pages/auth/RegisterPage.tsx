// MIKHLAFI LABS — Dedicated Registration Page (/register)
// Onboarding and tenant workspace initialization. The account and its isolated
// tenant are created through the real API; every state shown here is a direct
// result of the API response — nothing is simulated.

import React, { useEffect, useRef, useState } from 'react';
import { LocaleMode, ThemeMode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  IconArrowRight,
  IconGlobe,
  IconLock,
  IconShield,
  IconCheckCircle,
  IconFileText,
  IconAlert
} from '../../components/Icons';
import { BrandLogo } from '../../components/common/BrandLogo';

interface RegisterPageProps {
  locale: LocaleMode;
  theme?: ThemeMode;
  onToggleLocale: () => void;
  onToggleTheme?: () => void;
  onNavigateHome: () => void;
  onNavigateLogin: (returnUrl?: string) => void;
  onRegisterSuccess: (destination: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  locale,
  onToggleLocale,
  onNavigateHome,
  onNavigateLogin,
  onRegisterSuccess
}) => {
  const isAr = locale === 'ar';
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [orgNameEn, setOrgNameEn] = useState('');
  const [orgNameAr, setOrgNameAr] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const successTimerRef = useRef<number | null>(null);
  const navigatedRef = useRef(false);

  const getReturnUrl = (): string => {
    const params = new URLSearchParams(window.location.search);
    const returnUrl = params.get('returnUrl');
    if (returnUrl && returnUrl.startsWith('/app') && !returnUrl.startsWith('//')) {
      return returnUrl;
    }
    return '/app';
  };

  const returnUrl = getReturnUrl();

  const resolveErrorMessage = (err: unknown): string => {
    const msg = err instanceof Error ? err.message.trim() : '';
    if (!msg || msg === 'Failed to fetch' || msg.startsWith('NetworkError')) {
      return isAr
        ? 'تعذّر الوصول إلى الخادم. تحقّق من اتصالك بالشبكة وحاول مرة أخرى.'
        : 'Could not reach the server. Check your connection and try again.';
    }
    return msg;
  };

  // Cancel a pending redirect only if the page unmounts for another reason.
  useEffect(() => {
    return () => {
      if (!navigatedRef.current && successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const busy = status !== 'idle';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    if (password.length < 8) {
      setErrorMessage(
        isAr ? 'يجب أن تتكون كلمة المرور من ٨ خانات على الأقل.' : 'Password must be at least 8 characters long.'
      );
      passwordRef.current?.focus();
      return;
    }

    setStatus('submitting');
    setErrorMessage(null);

    try {
      await register({
        email,
        password,
        nameEn,
        nameAr: nameAr || nameEn,
        orgNameEn,
        orgNameAr: orgNameAr || orgNameEn
      });
      setStatus('success');
      successTimerRef.current = window.setTimeout(() => {
        navigatedRef.current = true;
        onRegisterSuccess(returnUrl);
      }, 850);
    } catch (err) {
      setErrorMessage(resolveErrorMessage(err));
      setStatus('idle');
      emailRef.current?.focus();
    }
  };

  const trustMarks = [
    { icon: <IconShield size={14} />, textAr: 'استضافة سيادية داخل المملكة', textEn: 'Sovereign hosting in the Kingdom' },
    { icon: <IconCheckCircle size={14} />, textAr: 'متوافق مع PDPL وأطر الأمن الوطني', textEn: 'Aligned with PDPL and national security frameworks' },
    { icon: <IconFileText size={14} />, textAr: 'جاهزية الفوترة الإلكترونية ZATCA المرحلة الثانية', textEn: 'ZATCA Phase 2 e-invoicing ready' },
    { icon: <IconLock size={14} />, textAr: 'معمارية أمن معلومات مؤسسية ISO 27001', textEn: 'ISO 27001 information security architecture' }
  ];

  const architectureSpecs = [
    { label: isAr ? 'التشفير' : 'ENCRYPTION', value: 'AES-256-GCM' },
    { label: isAr ? 'النقل' : 'TRANSPORT', value: 'TLS 1.3' },
    { label: isAr ? 'العزل' : 'ISOLATION', value: isAr ? 'عزل المستأجرين' : 'TENANT RLS' }
  ];

  return (
    <div className="auth-shell">
      {/* Brand & isolation panel */}
      <aside className="auth-aside" aria-label={isAr ? 'عن منصة MIKHLAFI LABS' : 'About MIKHLAFI LABS'}>
        <div className="auth-aside__inner">
          <button
            type="button"
            onClick={onNavigateHome}
            className="auth-brand"
            title="MIKHLAFI LABS"
            aria-label={isAr ? 'العودة إلى الصفحة الرئيسية' : 'Back to home'}
          >
            <BrandLogo size="md" locale={locale} glow={false} />
          </button>

          <span className="auth-aside__kicker">
            {isAr
              ? 'MIKHLAFI LABS · منصة ذكاء تشغيلي مؤسسية'
              : 'MIKHLAFI LABS · Enterprise operational intelligence'}
          </span>

          <h2 className="auth-aside__title">
            {isAr
              ? 'لكل مؤسسة مساحة عمل معزولة، وصلاحياتها بيد أصحابها.'
              : 'One isolated workspace per organization — under its owners’ control.'}
          </h2>

          <p className="auth-aside__lead">
            {isAr
              ? 'يُهيَّأ التسجيل مستأجراً مخصصاً لمؤسستك وحدها، بصلاحيات مالك وسجل تدقيق كامل، دون أي سجلات مشتركة مع مستأجرين آخرين.'
              : 'Registration provisions a tenant dedicated to your organization alone, with owner permissions and a complete audit trail — and no records shared with any other tenant.'}
          </p>

          <ul className="auth-trust">
            {trustMarks.map((item, i) => (
              <li key={i} className="auth-trust__item">
                <span className="auth-trust__icon" aria-hidden="true">{item.icon}</span>
                <span>{isAr ? item.textAr : item.textEn}</span>
              </li>
            ))}
          </ul>

          <div className="auth-aside__specs" aria-hidden="true">
            {architectureSpecs.map((spec) => (
              <div key={spec.label} className="auth-aside__spec">
                <span className="auth-aside__spec-label">{spec.label}</span>
                <span className="auth-aside__spec-value">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <section className="auth-panel">
        <header className="auth-topbar">
          <button
            type="button"
            onClick={onToggleLocale}
            className="ml-icon-btn"
            title={isAr ? 'English' : 'العربية'}
            aria-label={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <IconGlobe size={15} />
          </button>

          <button type="button" onClick={onNavigateHome} className="ml-btn ml-btn--subtle ml-btn--sm">
            {isAr ? 'الموقع العام' : 'Public website'}
          </button>
        </header>

        <main className="auth-panel__main">
          <div className="auth-card auth-card--wide">
            <div className="auth-card__head">
              <h1 className="auth-card__title">
                {isAr ? 'إنشاء مساحة عمل مؤسسية' : 'Create organization workspace'}
              </h1>
              <p className="auth-card__sub">
                {isAr
                  ? 'منح إنشاء الحساب صلاحيات المالك على مساحة عمل معزولة خاصة بمؤسستك.'
                  : 'Creating your account grants Owner permissions on an isolated workspace dedicated to your organization.'}
              </p>
            </div>

            {/* Errors & success confirmation (announced to assistive tech) */}
            {errorMessage && (
              <div className="auth-alert auth-alert--danger" role="alert">
                <span className="auth-alert__icon" aria-hidden="true"><IconAlert size={15} /></span>
                <span className="auth-alert__text">{errorMessage}</span>
              </div>
            )}

            {status === 'success' && (
              <div className="auth-alert auth-alert--success" role="status">
                <span className="auth-alert__icon" aria-hidden="true"><IconCheckCircle size={15} /></span>
                <span className="auth-alert__text">
                  {isAr
                    ? 'تم إنشاء مساحة العمل والتحقق من الجلسة… جارٍ التحويل.'
                    : 'Workspace created and session verified. Redirecting you now…'}
                </span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Organization names */}
              <div className="auth-grid-2">
                <div className="ml-field">
                  <label className="ml-label" htmlFor="auth-register-org-en">
                    {isAr ? 'اسم المؤسسة (بالإنجليزية)' : 'Organization name (EN)'}
                  </label>
                  <input
                    id="auth-register-org-en"
                    name="organization"
                    type="text"
                    required
                    autoComplete="organization"
                    className="ml-input"
                    value={orgNameEn}
                    onChange={(e) => setOrgNameEn(e.target.value)}
                    placeholder="Northbridge Contracting Group"
                    disabled={busy}
                  />
                </div>

                <div className="ml-field">
                  <label className="ml-label" htmlFor="auth-register-org-ar">
                    {isAr ? 'اسم المؤسسة (بالعربية)' : 'Organization name (AR)'}
                  </label>
                  <input
                    id="auth-register-org-ar"
                    name="organizationAr"
                    type="text"
                    autoComplete="organization"
                    className="ml-input"
                    value={orgNameAr}
                    onChange={(e) => setOrgNameAr(e.target.value)}
                    placeholder="مجموعة شمال للمقاولات"
                    disabled={busy}
                  />
                </div>
              </div>

              {/* Administrator names */}
              <div className="auth-grid-2">
                <div className="ml-field">
                  <label className="ml-label" htmlFor="auth-register-name-en">
                    {isAr ? 'اسم مدير الحساب (بالإنجليزية)' : 'Account administrator name (EN)'}
                  </label>
                  <input
                    id="auth-register-name-en"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    className="ml-input"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Rana Al-Otaibi"
                    disabled={busy}
                  />
                </div>

                <div className="ml-field">
                  <label className="ml-label" htmlFor="auth-register-name-ar">
                    {isAr ? 'اسم مدير الحساب (بالعربية)' : 'Account administrator name (AR)'}
                  </label>
                  <input
                    id="auth-register-name-ar"
                    name="nameAr"
                    type="text"
                    autoComplete="name"
                    className="ml-input"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="رنا العتيبي"
                    disabled={busy}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="ml-field">
                <label className="ml-label" htmlFor="auth-register-email">
                  {isAr ? 'البريد الإلكتروني المهني' : 'Work email address'}
                </label>
                <input
                  ref={emailRef}
                  id="auth-register-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  inputMode="email"
                  spellCheck={false}
                  dir="ltr"
                  className="ml-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  disabled={busy}
                />
              </div>

              {/* Password */}
              <div className="ml-field">
                <label className="ml-label" htmlFor="auth-register-password">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="auth-input-wrap">
                  <input
                    ref={passwordRef}
                    id="auth-register-password"
                    name="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="ml-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    dir="ltr"
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className="auth-input-wrap__toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-pressed={showPassword}
                    disabled={busy}
                  >
                    {showPassword ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'إظهار' : 'Show')}
                  </button>
                </div>
                <span className="ml-hint">
                  {isAr ? 'ثمانية خانات على الأقل' : 'At least 8 characters'}
                </span>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="ml-btn ml-btn--primary ml-btn--lg ml-btn--block auth-submit"
              >
                {status === 'submitting' && (
                  <>
                    <span className="auth-spinner" aria-hidden="true" />
                    <span>{isAr ? 'جارٍ إنشاء مساحة العمل…' : 'Provisioning workspace…'}</span>
                  </>
                )}
                {status === 'success' && (
                  <>
                    <IconCheckCircle size={16} />
                    <span>{isAr ? 'تم الإنشاء' : 'Workspace created'}</span>
                  </>
                )}
                {status === 'idle' && (
                  <>
                    <span>{isAr ? 'إنشاء مساحة العمل' : 'Create workspace'}</span>
                    <IconArrowRight size={15} className="auth-arrow" />
                  </>
                )}
              </button>
            </form>

            <div className="auth-swap">
              <span>{isAr ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}</span>
              <button
                type="button"
                className="auth-linkbtn"
                onClick={() => onNavigateLogin(returnUrl)}
              >
                {isAr ? 'تسجيل الدخول' : 'Sign in'}
              </button>
            </div>
          </div>
        </main>

        <footer className="auth-foot">
          <span>© {new Date().getFullYear()} MIKHLAFI LABS</span>
          <span className="auth-foot__sep" aria-hidden="true">·</span>
          <span>
            {isAr
              ? 'بيانات مشفرة وعزل متعدد المستأجرين'
              : 'Encrypted data · multi-tenant isolation'}
          </span>
        </footer>
      </section>
    </div>
  );
};
