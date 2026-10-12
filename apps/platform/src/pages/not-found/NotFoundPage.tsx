import React from 'react';
import { LocaleMode } from '../../types';
import { IconArrowRight } from '../../components/Icons';

interface NotFoundPageProps {
  locale: LocaleMode;
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ locale, onNavigate }) => {
  const isAr = locale === 'ar';

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '560px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '3rem 2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{
          fontSize: '4rem',
          fontWeight: 900,
          fontFamily: 'var(--font-mono)',
          color: 'var(--accent-base)',
          lineHeight: 1,
          marginBottom: '1rem'
        }}>
          404
        </div>

        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          marginBottom: '0.75rem',
          color: 'var(--text-primary)'
        }}>
          {isAr ? 'الصفحة غير موجودة' : 'Page Not Found'}
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          marginBottom: '2rem'
        }}>
          {isAr
            ? 'المسار المطلوب غير متوفر أو تم نقله في الهيكلية الجديدة للمنصة. يمكنك العودة للموقع العام أو تسجيل الدخول لمساحة عملك.'
            : 'The requested path is not available or has been moved in the new platform architecture. You can return to the public site or enter your workspace.'}
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => onNavigate('/')}
            className="btn-primary"
            style={{ fontSize: '13px', padding: '10px 18px' }}
          >
            <span>{isAr ? 'العودة للصفحة الرئيسية' : 'Return to Home'}</span>
            <IconArrowRight size={14} />
          </button>

          <button
            onClick={() => onNavigate('/app')}
            className="btn-secondary"
            style={{ fontSize: '13px', padding: '10px 18px' }}
          >
            <span>{isAr ? 'مساحة عمل العملاء' : 'Customer Workspace'}</span>
          </button>

          <button
            onClick={() => onNavigate('/contact')}
            className="ctrl-btn"
            style={{ fontSize: '13px', padding: '10px 14px' }}
          >
            <span>{isAr ? 'الدعم والتواصل' : 'Contact Support'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
