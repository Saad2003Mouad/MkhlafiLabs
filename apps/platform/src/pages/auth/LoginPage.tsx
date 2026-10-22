// MIKHLAFI LABS — Dedicated Login Page (/login)
// Split-screen enterprise sign-in: brand & trust panel beside a calm, focused
// credential form. Authentication is performed exclusively against the real
// API — loading, error, and success states are all driven by its response.

import React, { useEffect, useRef, useState } from 'react';
import { LocaleMode, ThemeMode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
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

interface LoginPageProps {
  locale: LocaleMode;
  theme?: ThemeMode;
  onToggleLocale: () => void;
  onToggleTheme?: () => void;
  onNavigateHome: () => void;
  onNavigateRegister: (returnUrl?: string) => void;
  onLoginSuccess: (destination: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  locale,
  onToggleLocale,
  onNavigateHome,
  onNavigateRegister,
  onLoginSuccess
}) => {
  const isAr = locale === 'ar';
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const successTimerRef = useRef<number | null>(null);
  const navigatedRef = useRef(false);

  // Parse and sanitize returnUrl from query params
  const getReturnUrl = (): string => {
    const params = new URLSearchParams(window.location.search);
    const returnUrl = params.get('returnUrl');
    // Ensure returnUrl is a safe internal /app or /admin route to prevent open redirect vulnerabilities
    if (returnUrl && (returnUrl.startsWith('/app') || returnUrl.startsWith('/admin')) && !returnUrl.startsWith('//')) {
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

  const navigateAfterSuccess = (destination: string) => {
    setStatus('success');
    successTimerRef.current = window.setTimeout(() => {
      navigatedRef.current = true;
      onLoginSuccess(destination);
    }, 850);
  };

  // If already authenticated, redirect strictly according to role.
  // Skipped while this page drives the flow itself (submitting / success), so
  // the confirmation state is always visible before the redirect.
  useEffect(() => {
    if (isAuthenticated && user && status === 'idle') {
      if (user.isPlatformAdmin) {
        onLoginSuccess('/admin');
      } else {
        onLoginSuccess(returnUrl.startsWith('/app') ? returnUrl : '/app');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, status]);

  // Only cancel a pending redirect if the page unmounts for another reason.
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
    setStatus('submitting');
    setErrorMessage(null);

    try {
      await login(email, password);
      const me = await api.getMe().catch(() => null);
      const destination = me?.user?.isPlatformAdmin
        ? '/admin'
        : returnUrl.startsWith('/app')
          ? returnUrl
          : '/app';
      navigateAfterSuccess(destination);
    } catch (err) {
      setErrorMessage(resolveErrorMessage(err));
      setStatus('idle');
      emailRef.current?.focus();
    }
  };

  const trustMarks = [
    { icon: <IconShield size={14} />, textAr: 'استضافة وسيادة بيانات محلية داخل اليمن', textEn: 'Sovereign local hosting in Yemen' },
    { icon: <IconCheckCircle size={14} />, textAr: 'عزل مشدد للبيانات وحماية كاملة للخصوصية', textEn: 'Strict data protection & enterprise isolation' },
    { icon: <IconFileText size={14} />, textAr: 'حوكمة مالية متوافقة مع الأنظمة التجارية والمعايير الدولية', textEn: 'Governance aligned with commercial laws & IFRS' },
    { icon: <IconLock size={14} />, textAr: 'معمارية أمن معلومات مؤسسية ISO 27001', textEn: 'ISO 27001 information security architecture' }
  ];

  const architectureSpecs = [
    { label: isAr ? 'التشفير' : 'ENCRYPTION', value: 'AES-256-GCM' },
    { label: isAr ? 'النقل' : 'TRANSPORT', value: 'TLS 1.3' },
    { label: isAr ? 'العزل' : 'ISOLATION', value: isAr ? 'عزل المستأجرين' : 'TENANT RLS' }
  ];

  return (
    <div className="auth-shell">
      {/* Brand & trust panel */}
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
              ? 'قرارات مُصرَّح بها، مبنية على أدلة مصدرها أنظمتكم.'
              : 'Authorized decisions, built on evidence from your own systems.'}
          </h2>

          <p className="auth-aside__lead">
            {isAr
              ? 'طبقة ذكاء محايدة على مستوى القطاعات تعمل فوق أنظمة المؤسسات القائمة: ترصد الانحرافات، توثّق الأدلة، وتُحوّلها إلى قرارات قيادية — دون استبدال أي نظام.'
              : 'An industry-neutral intelligence layer that sits above your existing enterprise systems: it detects variance, evidences every finding, and turns it into executive decisions — without replacing anything.'}
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
          <div className="auth-card">
            <div className="auth-card__head">
              <h1 className="auth-card__title">
                {isAr ? 'تسجيل الدخول إلى مساحة العمل' : 'Sign in to your workspace'}
              </h1>
              <p className="auth-card__sub">
                {isAr
                  ? 'أدخل بيانات حسابك المؤسسي للوصول إلى مساحة العمليات المعزولة لمؤسستك.'
                  : 'Enter your organization credentials to reach your isolated operations workspace.'}
              </p>
            </div>

            {/* Protected destination notice */}
            {returnUrl !== '/app' && (
              <div className="auth-alert auth-alert--accent">
                <span className="auth-alert__icon" aria-hidden="true"><IconLock size={15} /></span>
                <span className="auth-alert__text">
                  {isAr ? 'ستتم إعادة توجيهك إلى الوجهة المحمية: ' : 'You will be redirected to the requested destination: '}
                  <span className="auth-dest-path">{returnUrl}</span>
                </span>
              </div>
            )}

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
                  {isAr ? 'تم التحقق من الجلسة بنجاح… جارٍ تحويلك.' : 'Session verified. Redirecting you now…'}
                </span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="ml-field">
                <label className="ml-label" htmlFor="auth-login-email">
                  {isAr ? 'البريد الإلكتروني المؤسسي' : 'Work email address'}
                </label>
                <input
                  ref={emailRef}
                  id="auth-login-email"
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

              <div className="ml-field">
                <label className="ml-label" htmlFor="auth-login-password">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="auth-input-wrap">
                  <input
                    id="auth-login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
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
              </div>

              <button
                type="submit"
                disabled={busy}
                className="ml-btn ml-btn--primary ml-btn--lg ml-btn--block auth-submit"
              >
                {status === 'submitting' && (
                  <>
                    <span className="auth-spinner" aria-hidden="true" />
                    <span>{isAr ? 'جارٍ التحقق…' : 'Verifying…'}</span>
                  </>
                )}
                {status === 'success' && (
                  <>
                    <IconCheckCircle size={16} />
                    <span>{isAr ? 'تم التحقق' : 'Verified'}</span>
                  </>
                )}
                {status === 'idle' && (
                  <>
                    <span>{isAr ? 'تسجيل الدخول' : 'Sign in'}</span>
                    <IconArrowRight size={15} className="auth-arrow" />
                  </>
                )}
              </button>
            </form>

            <div className="auth-swap">
              <span>{isAr ? 'ليس لديك مساحة عمل؟ ' : "Don't have a workspace yet? "}</span>
              <button
                type="button"
                className="auth-linkbtn"
                onClick={() => onNavigateRegister(returnUrl)}
              >
                {isAr ? 'إنشاء مساحة عمل للمؤسسة' : 'Create an organization workspace'}
              </button>
            </div>
          </div>
        </main>

        <footer className="auth-foot">
          <span>© {new Date().getFullYear()} MIKHLAFI LABS</span>
          <span className="auth-foot__sep" aria-hidden="true">·</span>
          <span>
            {isAr
              ? 'جلسات مشفرة وعزل متعدد المستأجرين'
              : 'Encrypted sessions · multi-tenant isolation'}
          </span>
        </footer>
      </section>
    </div>
  );
};
