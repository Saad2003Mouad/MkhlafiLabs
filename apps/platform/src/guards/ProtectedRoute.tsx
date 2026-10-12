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
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  currentPath,
  locale,
  onRedirectToLogin,
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

  // If not authenticated, render null while redirect effect runs
  if (!isAuthenticated || !user) {
    return null;
  }

  // Session verified — render protected customer content
  return <>{children}</>;
};
