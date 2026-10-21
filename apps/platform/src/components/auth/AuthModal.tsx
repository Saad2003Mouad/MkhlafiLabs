// MIKHLAFI LABS — Enterprise Authentication Modal
// Secure sign-in and organization registration dialog. All authentication goes
// through the real API; loading, error, and success states reflect its response.

import React, { useEffect, useRef, useState } from 'react';
import { LocaleMode } from '../../types';
import { api, UserProfile, TenantContext } from '../../api/client';
import {
  IconAlert,
  IconCheckCircle,
  IconLock,
  IconShield,
  IconX
} from '../Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: LocaleMode;
  onAuthSuccess: (user: UserProfile, tenant: TenantContext | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  locale,
  onAuthSuccess
}) => {
  const isAr = locale === 'ar';
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [orgNameEn, setOrgNameEn] = useState('');
  const [orgNameAr, setOrgNameAr] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const dismissedRef = useRef(false);

  // Focus the first field whenever the dialog opens or the mode changes
  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => emailRef.current?.focus(), 60);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, mode]);

  // Escape closes the dialog
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Reset transient state when the dialog is (re)opened
  useEffect(() => {
    if (isOpen) {
      dismissedRef.current = false;
      setErrorMessage(null);
      setIsSuccess(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Never leave a pending confirmation behind
  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const resolveErrorMessage = (err: unknown): string => {
    const msg = err instanceof Error ? err.message.trim() : '';
    if (!msg || msg === 'Failed to fetch' || msg.startsWith('NetworkError')) {
      return isAr
        ? 'تعذّر الوصول إلى الخادم. تحقّق من اتصالك بالشبكة وحاول مرة أخرى.'
        : 'Could not reach the server. Check your connection and try again.';
    }
    return msg;
  };

  // User-initiated dismissal (close button, overlay, Escape)
  const requestClose = () => {
    dismissedRef.current = true;
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    onClose();
  };

  const completeAuth = (user: UserProfile, tenant: TenantContext | null) => {
    setIsLoading(false);
    setIsSuccess(true);
    // Hold the confirmation briefly, then hand the session to the application
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      if (dismissedRef.current) return;
      onAuthSuccess(user, tenant);
      onClose();
    }, 750);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        completeAuth(res.user, res.activeTenant);
      } else {
        await api.register({
          email,
          password,
          nameEn,
          nameAr: nameAr || nameEn,
          orgNameEn,
          orgNameAr: orgNameAr || orgNameEn
        });
        const meRes = await api.getMe();
        completeAuth(meRes.user, meRes.tenant);
      }
    } catch (err) {
      setErrorMessage(resolveErrorMessage(err));
      setIsLoading(false);
    }
  };

  const switchMode = (next: 'login' | 'register') => {
    if (isLoading || isSuccess) return;
    setMode(next);
    setErrorMessage(null);
  };

  const busy = isLoading || isSuccess;

  const secureLabel = isAr ? 'جلسة مؤسسية مشفرة' : 'Secure enterprise session';
  const closeLabel = isAr ? 'إغلاق' : 'Close';
  const modeGroupLabel = isAr ? 'طريقة المصادقة' : 'Authentication mode';

  return (
    <div
      className="ml-modal-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        className="ml-modal auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Head */}
        <div className="auth-modal__head">
          <div className="auth-modal__headings">
            <span className="ml-eyebrow">
              <IconLock size={13} />
              {secureLabel}
            </span>
            <h2 className="auth-modal__title" id="auth-modal-title">
              {mode === 'login'
                ? (isAr ? 'تسجيل الدخول إلى المنصة' : 'Sign in to MIKHLAFI LABS')
                : (isAr ? 'إنشاء حساب ومؤسسة جديدة' : 'Register a new organization')}
            </h2>
          </div>
          <button
            type="button"
            className="ml-icon-btn auth-modal__close"
            onClick={requestClose}
            aria-label={closeLabel}
            title={closeLabel}
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Mode switch */}
        <div className="auth-modal__tabs">
          <div className="ml-segmented" role="group" aria-label={modeGroupLabel}>
            <button
              type="button"
              className={`ml-segmented__item ${mode === 'login' ? 'is-active' : ''}`}
              aria-pressed={mode === 'login'}
              onClick={() => switchMode('login')}
            >
              {isAr ? 'تسجيل الدخول' : 'Sign in'}
            </button>
            <button
              type="button"
              className={`ml-segmented__item ${mode === 'register' ? 'is-active' : ''}`}
              aria-pressed={mode === 'register'}
              onClick={() => switchMode('register')}
            >
              {isAr ? 'حساب جديد' : 'New account'}
            </button>
          </div>
        </div>

        {/* Form */}
        <form className="auth-modal__body" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="auth-alert auth-alert--danger" role="alert">
              <span className="auth-alert__icon" aria-hidden="true"><IconAlert size={15} /></span>
              <span className="auth-alert__text">{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="auth-alert auth-alert--success" role="status">
              <span className="auth-alert__icon" aria-hidden="true"><IconCheckCircle size={15} /></span>
              <span className="auth-alert__text">
                {mode === 'login'
                  ? (isAr ? 'تم التحقق من الجلسة… جارٍ التحويل.' : 'Session verified. Redirecting you now…')
                  : (isAr ? 'تم إنشاء الحساب والتحقق من الجلسة… جارٍ التحويل.' : 'Account created and session verified. Redirecting you now…')}
              </span>
            </div>
          )}

          <div className="ml-field">
            <label className="ml-label" htmlFor="auth-modal-email">
              {isAr ? 'البريد الإلكتروني المؤسسي' : 'Work email address'}
            </label>
            <input
              ref={emailRef}
              id="auth-modal-email"
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
            <label className="ml-label" htmlFor="auth-modal-password">
              {isAr ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="auth-input-wrap">
              <input
                id="auth-modal-password"
                name={mode === 'register' ? 'new-password' : 'current-password'}
                type={showPassword ? 'text' : 'password'}
                required
                minLength={mode === 'register' ? 8 : undefined}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
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
            {mode === 'register' && (
              <span className="ml-hint">
                {isAr ? 'ثمانية خانات على الأقل' : 'At least 8 characters'}
              </span>
            )}
          </div>

          {mode === 'register' && (
            <>
              <div className="auth-grid-2">
                <div className="ml-field">
                  <label className="ml-label" htmlFor="auth-modal-name-en">
                    {isAr ? 'الاسم (بالإنجليزية)' : 'Full name (EN)'}
                  </label>
                  <input
                    id="auth-modal-name-en"
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
                  <label className="ml-label" htmlFor="auth-modal-name-ar">
                    {isAr ? 'الاسم (بالعربية)' : 'Full name (AR)'}
                  </label>
                  <input
                    id="auth-modal-name-ar"
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

              <div className="ml-field">
                <label className="ml-label" htmlFor="auth-modal-org-en">
                  {isAr ? 'اسم المؤسسة (بالإنجليزية)' : 'Organization name (EN)'}
                </label>
                <input
                  id="auth-modal-org-en"
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
                <label className="ml-label" htmlFor="auth-modal-org-ar">
                  {isAr ? 'اسم المؤسسة (بالعربية)' : 'Organization name (AR)'}
                </label>
                <input
                  id="auth-modal-org-ar"
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
            </>
          )}

          <button
            type="submit"
            disabled={busy}
            className="ml-btn ml-btn--primary ml-btn--lg ml-btn--block auth-submit"
          >
            {isLoading && (
              <>
                <span className="auth-spinner" aria-hidden="true" />
                <span>{isAr ? 'جارٍ التحقق…' : 'Verifying…'}</span>
              </>
            )}
            {!isLoading && isSuccess && (
              <>
                <IconCheckCircle size={16} />
                <span>{isAr ? 'تم التحقق' : 'Verified'}</span>
              </>
            )}
            {!isLoading && !isSuccess && (
              <span>
                {mode === 'login'
                  ? (isAr ? 'تسجيل الدخول' : 'Sign in')
                  : (isAr ? 'إنشاء الحساب والبدء' : 'Create account & start')}
              </span>
            )}
          </button>
        </form>

        {/* Foot */}
        <div className="auth-modal__foot">
          <span className="auth-trust__icon" aria-hidden="true"><IconShield size={14} /></span>
          <span>
            {isAr
              ? 'جلسات مشفرة وعزل متعدد المستأجرين'
              : 'Encrypted sessions · multi-tenant isolation'}
          </span>
        </div>
      </div>
    </div>
  );
};
