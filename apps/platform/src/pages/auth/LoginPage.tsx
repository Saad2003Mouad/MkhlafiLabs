// MIKHLAFI LABS — Dedicated Login Page (/login)
// Full-page authentication with secure session establishment, returnUrl restoration, and tenant context resolution

import React, { useState, useEffect } from 'react';
import { LocaleMode, ThemeMode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
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
    // Ensure returnUrl is a safe internal /app or /admin route to prevent open redirect vulnerabilities
    if (returnUrl && (returnUrl.startsWith('/app') || returnUrl.startsWith('/admin')) && !returnUrl.startsWith('//')) {
      return returnUrl;
    }
    return '/app';
  };

  const returnUrl = getReturnUrl();

  // If already authenticated, redirect strictly according to role
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.isPlatformAdmin) {
        onLoginSuccess('/admin');
      } else {
        onLoginSuccess(returnUrl.startsWith('/app') ? returnUrl : '/app');
      }
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await login(email, password);
      const me = await api.getMe().catch(() => null);
      if (me?.user?.isPlatformAdmin) {
        onLoginSuccess('/admin');
      } else {
        onLoginSuccess(returnUrl.startsWith('/app') ? returnUrl : '/app');
      }
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

  const handleOwnerFill = () => {
    setEmail('saad@mikhlafi-labs.com');
    setPassword('MikhlafiSecure2026!');
  };

  const handleClientFill = () => {
    setEmail('client@mikhlafi-holding.com');
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

          {/* Quick Credentials Autofill */}
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={handleOwnerFill}
              style={{
                background: 'rgba(239, 68, 68, 0.09)',
                border: '1px solid rgba(239, 68, 68, 0.45)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 0.9rem',
                color: '#f87171',
                fontSize: '0.82rem',
                cursor: 'pointer',
                width: '100%',
                fontWeight: 700,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '2px',
                textAlign: 'start'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🛡️</span>
                <span>{isAr ? 'حساب مالك ومزود المنصة (Platform Owner)' : 'Platform Owner / Vendor Account'}</span>
              </div>
              <span style={{ fontSize: '10px', color: '#fca5a5', fontWeight: 400 }}>
                {isAr ? 'البريد: saad@mikhlafi-labs.com · يفتح غرفة العمليات (/admin) حصرياً دون بيانات العملاء' : 'Email: saad@mikhlafi-labs.com · Opens /admin exclusively without client data'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleClientFill}
              style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 0.9rem',
                color: '#38bdf8',
                fontSize: '0.82rem',
                cursor: 'pointer',
                width: '100%',
                fontWeight: 700,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '2px',
                textAlign: 'start'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🏛️</span>
                <span>{isAr ? 'حساب عميل المنصة (مجموعة المخلافي القابضة)' : 'Client Account (Mikhlafi Holding Group)'}</span>
              </div>
              <span style={{ fontSize: '10px', color: '#7dd3fc', fontWeight: 400 }}>
                {isAr ? 'البريد: client@mikhlafi-holding.com · يفتح مساحة عمل المنشأة الخاصة (/app)' : 'Email: client@mikhlafi-holding.com · Opens client workspace (/app)'}
              </span>
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
