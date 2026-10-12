// MIKHLAFI LABS — Dedicated Registration Page (/register)
// Onboarding and tenant workspace initialization with automated owner role provisioning

import React, { useState } from 'react';
import { LocaleMode, ThemeMode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  IconArrowRight,
  IconSun,
  IconMoon,
  IconGlobe
} from '../../components/Icons';

interface RegisterPageProps {
  locale: LocaleMode;
  theme: ThemeMode;
  onToggleLocale: () => void;
  onToggleTheme: () => void;
  onNavigateHome: () => void;
  onNavigateLogin: (returnUrl?: string) => void;
  onRegisterSuccess: (destination: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  locale,
  theme,
  onToggleLocale,
  onToggleTheme,
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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getReturnUrl = (): string => {
    const params = new URLSearchParams(window.location.search);
    const returnUrl = params.get('returnUrl');
    if (returnUrl && returnUrl.startsWith('/app') && !returnUrl.startsWith('//')) {
      return returnUrl;
    }
    return '/app';
  };

  const returnUrl = getReturnUrl();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMessage(
        isAr ? 'يجب أن تتكون كلمة المرور من ٨ خانات على الأقل.' : 'Password must be at least 8 characters long.'
      );
      return;
    }

    setLoading(true);
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
      onRegisterSuccess(returnUrl);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          (isAr
            ? 'تعذر إنشاء الحساب المؤسسي. قد يكون البريد الإلكتروني مستخدماً بالفعل.'
            : 'Registration failed. The email address may already be in use.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    const stamp = Date.now().toString(36).substring(4);
    setEmail(`executive.${stamp}@alyusr-holding.sa`);
    setPassword('MikhlafiEnterprise2026!');
    setNameEn('Dr. Sultan Al-Ghamdi');
    setNameAr('د. سلطان الغامدي');
    setOrgNameEn('Al-Yusr Contracting & Logistics');
    setOrgNameAr('مجموعة اليسر للمقاولات والخدمات اللوجستية');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-base)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 2rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)'
        }}
      >
        <button
          onClick={onNavigateHome}
          className="brand-emblem"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div className="brand-symbol">M</div>
          <div className="brand-meta" style={{ textAlign: isAr ? 'right' : 'left' }}>
            <span className="brand-name">MIKHLAFI LABS</span>
            <span className="brand-sub">
              {isAr ? 'أنظمة · ذكاء · ابتكار' : 'INTELLIGENCE · SYSTEMS · INNOVATION'}
            </span>
          </div>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={onToggleLocale} className="ctrl-btn" title="Toggle Language">
            <IconGlobe size={14} />
            <span>{isAr ? 'EN' : 'عربي'}</span>
          </button>
          <button onClick={onToggleTheme} className="ctrl-btn" title="Toggle Theme">
            {theme === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />}
          </button>
          <button onClick={onNavigateHome} className="ctrl-btn" style={{ fontSize: '12px' }}>
            <span>{isAr ? 'الموقع العام' : 'Public Website'}</span>
          </button>
        </div>
      </header>

      {/* Main Registration Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1rem',
          background: 'radial-gradient(ellipse at 50% 20%, var(--accent-subtle) 0%, transparent 70%)'
        }}
      >
        <div
          className="kpi-card"
          style={{
            width: '100%',
            maxWidth: '520px',
            padding: '2.5rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--status-optimal), var(--accent-base))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: '22px',
                margin: '0 auto 1rem'
              }}
            >
              +
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              {isAr ? 'إنشاء مساحة عمل مؤسسية' : 'Create Organization Workspace'}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {isAr
                ? 'يبدأ التسجيل مساحة عمل معزولة خاصة بمؤسستك مع منحك صلاحيات المالك تلقائياً'
                : 'Initializes a dedicated, cryptographically isolated tenant workspace with Owner role.'}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--status-danger)',
                fontSize: '0.85rem',
                color: 'var(--status-danger)',
                marginBottom: '1.25rem'
              }}
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Organization Names */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  {isAr ? 'اسم المؤسسة (بالإنجليزية) *' : 'Organization Name (EN) *'}
                </label>
                <input
                  type="text"
                  required
                  value={orgNameEn}
                  onChange={(e) => setOrgNameEn(e.target.value)}
                  placeholder="Al-Yusr Logistics Group"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  {isAr ? 'اسم المؤسسة (بالعربية)' : 'Organization Name (AR)'}
                </label>
                <input
                  type="text"
                  value={orgNameAr}
                  onChange={(e) => setOrgNameAr(e.target.value)}
                  placeholder="مجموعة اليسر اللوجستية"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            {/* User Names */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  {isAr ? 'اسم المدير التنفيذي (بالإنجليزية) *' : 'Administrator Name (EN) *'}
                </label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Dr. Sultan Al-Ghamdi"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  {isAr ? 'الاسم (بالعربية)' : 'Administrator Name (AR)'}
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="د. سلطان الغامدي"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                {isAr ? 'البريد الإلكتروني المهني *' : 'Work Email Address *'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="executive@alyusr-holding.sa"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {isAr ? 'كلمة المرور (٨ خانات على الأقل) *' : 'Password (8+ chars) *'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-light)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {showPassword ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'إظهار' : 'Show')}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                justifyContent: 'center',
                fontSize: '1rem',
                marginTop: '0.5rem'
              }}
            >
              <span>{loading ? (isAr ? 'جاري تهيئة مساحة العمل...' : 'Provisioning Workspace...') : (isAr ? 'إنشاء مساحة العمل وتفعيل الحساب' : 'Create Organization Workspace')}</span>
              <IconArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Fill */}
          <div style={{ marginTop: '1.2rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              style={{
                background: 'transparent',
                border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 0.8rem',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              ⚡ {isAr ? 'تعبئة بيانات مؤسسة تجريبية للاختبار' : 'Auto-fill New Enterprise Test Data'}
            </button>
          </div>

          {/* Link to Login */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}
          >
            <span>{isAr ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}</span>
            <button
              onClick={() => onNavigateLogin(returnUrl)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-light)',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0
              }}
            >
              {isAr ? 'تسجيل الدخول ←' : 'Sign In →'}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '1rem 2rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-tertiary)',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        © {new Date().getFullYear()} MIKHLAFI LABS. {isAr ? 'بيانات مشفرة ومعزولة كلياً وفق أعلى المعايير.' : 'Zero-Trust Tenant Isolation.'}
      </footer>
    </div>
  );
};
