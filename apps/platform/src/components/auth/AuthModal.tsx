// MIKHLAFI LABS — Enterprise Authentication Modal & Drawer
// Secure login, registration, and active tenant switching dialog

import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { api, UserProfile, TenantContext } from '../../api/client';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        onAuthSuccess(res.user, res.activeTenant);
        onClose();
      } else {
        await api.register({
          email,
          password,
          nameEn,
          nameAr: nameAr || nameEn,
          orgNameEn,
          orgNameAr: orgNameAr || orgNameEn
        });
        // Now fetch active tenant
        const meRes = await api.getMe();
        onAuthSuccess(meRes.user, meRes.tenant);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (demoRole: 'owner' | 'new') => {
    if (demoRole === 'owner') {
      setMode('login');
      setEmail('saad@mikhlafi-labs.com');
      setPassword('MikhlafiSecure2026!');
    } else {
      setMode('register');
      const stamp = Date.now().toString(36).substring(4);
      setEmail(`executive.${stamp}@alyusr-holding.sa`);
      setPassword('MikhlafiEnterprise2026!');
      setNameEn('Dr. Sultan Al-Ghamdi');
      setNameAr('د. سلطان الغامدي');
      setOrgNameEn('Al-Yusr Contracting & Logistics');
      setOrgNameAr('مجموعة اليسر للمقاولات والخدمات اللوجستية');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(5, 7, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        padding: '1.5rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--surface-primary, #0c1017)',
          border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent-emerald, #10b981)',
                  boxShadow: '0 0 10px var(--accent-emerald, #10b981)'
                }}
              />
              <span
                style={{
                  fontSize: '0.72rem',
                  letterSpacing: '0.12em',
                  color: 'var(--accent-emerald, #10b981)',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}
              >
                {isAr ? 'مصادقة السيرفر المشفرة' : 'Secure Enterprise Session'}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#f3f4f6' }}>
              {mode === 'login'
                ? (isAr ? 'تسجيل الدخول إلى المنصة' : 'Sign in to MIKHLAFI LABS')
                : (isAr ? 'إنشاء حساب ومؤسسة جديدة' : 'Register New Tenant & Account')}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              fontSize: '1.5rem',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))' }}>
          <button
            type="button"
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '0.85rem',
              background: mode === 'login' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
              color: mode === 'login' ? 'var(--accent-emerald, #10b981)' : '#9ca3af',
              border: 'none',
              borderBottom: mode === 'login' ? '2px solid var(--accent-emerald, #10b981)' : 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {isAr ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              padding: '0.85rem',
              background: mode === 'register' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
              color: mode === 'register' ? 'var(--accent-emerald, #10b981)' : '#9ca3af',
              border: 'none',
              borderBottom: mode === 'register' ? '2px solid var(--accent-emerald, #10b981)' : 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {isAr ? 'تسجيل مؤسسة جديدة' : 'Register Organization'}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          {errorMessage && (
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.88rem'
              }}
            >
              {errorMessage}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.35rem' }}>
                {isAr ? 'البريد الإلكتروني المؤسسي' : 'Corporate Email'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="executive@company.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f9fafb',
                  fontSize: '0.92rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.35rem' }}>
                {isAr ? 'كلمة المرور المشفرة' : 'Password (min 8 chars)'}
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f9fafb',
                  fontSize: '0.92rem'
                }}
              />
            </div>

            {mode === 'register' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.35rem' }}>
                      {isAr ? 'الاسم بالإنجليزية' : 'Full Name (English)'}
                    </label>
                    <input
                      type="text"
                      required
                      value={nameEn}
                      onChange={e => setNameEn(e.target.value)}
                      placeholder="Fahad Al-Maktoum"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#f9fafb',
                        fontSize: '0.92rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.35rem' }}>
                      {isAr ? 'الاسم بالعربية' : 'Full Name (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={nameAr}
                      onChange={e => setNameAr(e.target.value)}
                      placeholder="فهد المكتوم"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#f9fafb',
                        fontSize: '0.92rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.35rem' }}>
                    {isAr ? 'اسم المؤسسة / الشركة (بالإنجليزية)' : 'Organization Name (English)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={orgNameEn}
                    onChange={e => setOrgNameEn(e.target.value)}
                    placeholder="Al-Khobar Infrastructure Ltd."
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#f9fafb',
                      fontSize: '0.92rem'
                    }}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '0.5rem',
                padding: '0.85rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.95rem',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
              }}
            >
              {isLoading
                ? (isAr ? 'جاري التحقق والمصادقة...' : 'Authenticating...')
                : mode === 'login'
                ? (isAr ? 'تسجيل الدخول الفوري' : 'Sign In to Workspace')
                : (isAr ? 'إنشاء حساب والبدء فوراً' : 'Create Account & Launch')}
            </button>
          </div>

          {/* Quick Demo Credentials Autofill */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>
              {isAr ? 'تجربة سريعة:' : 'Quick Demo:'}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleDemoFill('new')}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#9ca3af',
                  cursor: 'pointer'
                }}
              >
                {isAr ? 'تعبئة مؤسسة جديدة' : 'New Org Template'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
