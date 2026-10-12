// MIKHLAFI LABS — Dedicated Login Page (/login)
// Full-page authentication with secure session establishment, returnUrl restoration, and tenant context resolution

import React, { useState, useEffect } from 'react';
import { LocaleMode, ThemeMode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  IconArrowRight,
  IconSun,
  IconMoon,
  IconGlobe
} from '../../components/Icons';

interface LoginPageProps {
  locale: LocaleMode;
  theme: ThemeMode;
  onToggleLocale: () => void;
  onToggleTheme: () => void;
  onNavigateHome: () => void;
  onNavigateRegister: (returnUrl?: string) => void;
  onLoginSuccess: (destination: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  locale,
  theme,
  onToggleLocale,
  onToggleTheme,
  onNavigateHome,
  onNavigateRegister,
  onLoginSuccess
}) => {
  const isAr = locale === 'ar';
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parse and sanitize returnUrl from query params
  const getReturnUrl = (): string => {
    const params = new URLSearchParams(window.location.search);
    const returnUrl = params.get('returnUrl');
    // Ensure returnUrl is a safe internal /app route to prevent open redirect vulnerabilities
    if (returnUrl && returnUrl.startsWith('/app') && !returnUrl.startsWith('//')) {
      return returnUrl;
    }
    return '/app';
  };

  const returnUrl = getReturnUrl();

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      onLoginSuccess(returnUrl);
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await login(email, password);
      onLoginSuccess(returnUrl);
    } catch (err: any) {
      // Avoid revealing user existence; present a clear professional message
      setErrorMessage(
        isAr
          ? 'تعذر التحقق من البيانات. يُرجى التأكد من البريد الإلكتروني وكلمة المرور.'
          : 'Authentication failed. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('saad@mikhlafi-labs.com');
    setPassword('MikhlafiSecure2026!');
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
      {/* Top Header */}
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

      {/* Main Authentication Card */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          background: 'radial-gradient(ellipse at 50% 20%, var(--accent-subtle) 0%, transparent 70%)'
        }}
      >
        <div
          className="kpi-card"
          style={{
            width: '100%',
            maxWidth: '440px',
            padding: '2.5rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent-base), #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: '22px',
                margin: '0 auto 1rem'
              }}
            >
              M
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              {isAr ? 'دخول منصة العملاء' : 'Customer Workspace Sign-In'}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {isAr
                ? 'أدخل بيانات الحساب للوصول إلى لوحة استخبارات الأعمال الخاصة بمؤسستك'
                : 'Enter your credentials to access your private business operations workspace.'}
            </p>
          </div>

          {/* Destination Notification Banner */}
          {returnUrl !== '/app' && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-subtle)',
                border: '1px solid var(--accent-base)',
                fontSize: '0.82rem',
                color: 'var(--accent-light)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>🔒</span>
              <span>
                {isAr
                  ? `ستتم إعادة توجيهك إلى الوجهة المحمية: ${returnUrl}`
                  : `You will be redirected to requested destination: ${returnUrl}`}
              </span>
            </div>
          )}

          {/* Error Alert */}
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                {isAr ? 'البريد الإلكتروني المؤسسي' : 'Work Email Address'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="saad@mikhlafi-labs.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {isAr ? 'كلمة المرور' : 'Password'}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem'
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
              <span>{loading ? (isAr ? 'جاري التحقق...' : 'Verifying Session...') : (isAr ? 'تسجيل الدخول' : 'Sign In to Workspace')}</span>
              <IconArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
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
              ⚡ {isAr ? 'تعبئة بيانات حساب المشرف التنفيذي' : 'Auto-fill Executive Demo Account'}
            </button>
          </div>

          {/* Registration Link */}
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
            <span>{isAr ? 'ليس لديك مساحة عمل مسجلة؟ ' : "Don't have a workspace yet? "}</span>
            <button
              onClick={() => onNavigateRegister(returnUrl)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-light)',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0
              }}
            >
              {isAr ? 'إنشاء حساب جديد للمؤسسة ←' : 'Create Organization Workspace →'}
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
        © {new Date().getFullYear()} MIKHLAFI LABS. {isAr ? 'نظام معزول متعدد المستأجرين محمي بالتشفير.' : 'Isolated Multi-Tenant Architecture.'}
      </footer>
    </div>
  );
};
