// MIKHLAFI LABS — Enterprise Protected Route Guard
// Ensures all /app/* customer routes require verified session validation
// Safely preserves intended returnUrl and prevents flashing mock customer data

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LocaleMode } from '../types';

interface ProtectedRouteProps {
  currentPath: string;
  locale: LocaleMode;
  onRedirectToLogin: (returnUrl: string) => void;
  requirePlatformAdmin?: boolean;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  currentPath,
  locale,
  onRedirectToLogin,
  requirePlatformAdmin = false,
  children
}) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Safely preserve the target destination for return after login
      onRedirectToLogin(currentPath);
    }
  }, [isLoading, isAuthenticated, currentPath, onRedirectToLogin]);

  // While checking session with backend /api/v1/auth/me, render a clean spinner
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-base)',
          color: 'var(--text-primary)',
          gap: '1.25rem'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-subtle)',
            borderTopColor: 'var(--accent-base)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
            {isAr ? 'التحقق من جلسة المستأجر...' : 'Verifying Enterprise Session...'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            {isAr ? 'عزل البيانات المشفرة وقيد الصلاحيات' : 'Encrypted Tenant Boundary & Permission Validation'}
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, render loading screen while redirect effect executes
  if (!isAuthenticated || !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-base)',
          color: 'var(--text-primary)',
          gap: '1.25rem'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-subtle)',
            borderTopColor: 'var(--accent-base)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
          {isAr ? 'جارٍ التحويل إلى بوابة تسجيل الدخول...' : 'Redirecting to login portal...'}
        </div>
      </div>
    );
  }

  const isOwner = Boolean(
    user.isPlatformAdmin ||
    user.email === 'saad@mikhlafi-labs.com' ||
    user.email === 'owner@mikhlafi-labs.com'
  );

  // Platform Operator Privilege Check
  if (requirePlatformAdmin && !isOwner) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-base)',
          color: 'var(--text-primary)',
          padding: '2rem',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 10px', color: 'var(--status-critical)' }}>
          {isAr ? '403 — وصول غير مصرح به لغرفة عمليات المنصة' : '403 — Platform Operator Authorization Required'}
        </h1>
        <p style={{ maxWidth: '540px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
          {isAr
            ? 'هذه المنطقة مخصصة حصرياً للمشغلين المعتمدين لمنصة مخلافي لابس. لا تملك حسابات عملاء المؤسسات حق الوصول إلى هذه الواجهة.'
            : 'This console is strictly restricted to verified Mikhlafi Labs platform operators. Customer enterprise credentials do not grant platform-level privileges.'}
        </p>
        <button
          onClick={() => (window.location.href = '/app')}
          className="btn-primary"
          style={{ fontSize: '13px', padding: '10px 22px' }}
        >
          {isAr ? 'العودة إلى مساحة عمل المؤسسة' : 'Return to Customer Workspace'}
        </button>
      </div>
    );
  }

  // Zero-Knowledge Privacy Boundary Check:
  // If user is Platform Admin (Provider) trying to access client customer workspace (/app/*)
  if (!requirePlatformAdmin && isOwner) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-base)',
          color: 'var(--text-primary)',
          padding: '2rem',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '54px', marginBottom: '16px' }}>🔒</div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 10px', color: '#38bdf8' }}>
          {isAr
            ? 'مساحة عمل خاصة بالعملاء — ميثاق الخصوصية المصرفية والسرية التامة'
            : 'Confidential Client Workspace — Zero-Knowledge Privacy Boundary'}
        </h1>
        <p style={{ maxWidth: '580px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
          {isAr
            ? 'بصفتك مالك ومزود المنصة الرسمي (Platform Provider)، لا يحق لحسابك الوصول إلى البيانات المالية أو فواتير الموردين أو القيود المحاسبية الخاصة بالشركات العميلة، امتثالاً لمبدأ الخصوصية الصارمة (Zero-Knowledge Architecture). يمكنك فقط إدارة باقات العملاء، وحساباتهم، وإصدار التراخيص عبر غرفة عمليات المنصة.'
            : 'As the official platform owner and service provider, your clearance is isolated from private corporate books and financial transactions to enforce zero-knowledge banking secrecy. Please manage tenant accounts, packages, and licenses from the Platform Control Center.'}
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => (window.location.href = '/admin')}
            className="btn-primary"
            style={{ fontSize: '13px', padding: '10px 22px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none' }}
          >
            🛡️ {isAr ? 'الانتقال إلى غرفة عمليات مالك المنصة (/admin)' : 'Go to Platform Owner Control Center (/admin)'}
          </button>
          <button
            onClick={() => (window.location.href = '/login')}
            className="ctrl-btn"
            style={{ fontSize: '13px', padding: '10px 18px' }}
          >
            {isAr ? 'تسجيل الدخول بحساب العميل' : 'Log in as Customer'}
          </button>
        </div>
      </div>
    );
  }

  // Session verified — render protected content
  return <>{children}</>;
};
