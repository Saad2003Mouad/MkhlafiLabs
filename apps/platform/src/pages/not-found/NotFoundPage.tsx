import React from 'react';
import { LocaleMode } from '../../types';
import {
  IconArrowRight,
  IconFinance,
  IconDecisions,
  IconRisk,
  IconProjects,
  IconSupplier,
  IconDataQuality,
  IconAssistant,
  IconDashboard
} from '../../components/Icons';

interface NotFoundPageProps {
  locale: LocaleMode;
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ locale, onNavigate }) => {
  const isAr = locale === 'ar';

  const quickLinks = [
    { titleAr: 'لوحة القيادة التنفيذية', titleEn: 'Executive Dashboard', path: '/app', icon: <IconDashboard size={18} /> },
    { titleAr: 'الذكاء المالي وكشف الهدر', titleEn: 'Financial Variance', path: '/app/finance', icon: <IconFinance size={18} /> },
    { titleAr: 'مركز القرارات التنفيذية', titleEn: 'Decision Center', path: '/app/decisions', icon: <IconDecisions size={18} /> },
    { titleAr: 'رادار المخاطر والإنذار المبكر', titleEn: 'Predictive Risk Radar', path: '/app/risk', icon: <IconRisk size={18} /> },
    { titleAr: 'ذكاء المشاريع والعقود', titleEn: 'Project Telemetry', path: '/app/projects', icon: <IconProjects size={18} /> },
    { titleAr: 'ذكاء الموردين والمشتريات', titleEn: 'Supplier Reliability', path: '/app/suppliers', icon: <IconSupplier size={18} /> },
    { titleAr: 'حوكمة وجودة البيانات', titleEn: 'Data Observability', path: '/app/data-quality', icon: <IconDataQuality size={18} /> },
    { titleAr: 'المساعد التنفيذي الذكي', titleEn: 'Executive AI Assistant', path: '/app/assistant', icon: <IconAssistant size={18} /> }
  ];

  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '780px',
        width: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '3rem 2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{
          fontSize: '3.5rem',
          fontWeight: 900,
          fontFamily: 'var(--font-mono)',
          color: 'var(--accent-base)',
          lineHeight: 1,
          marginBottom: '0.75rem'
        }}>
          404
        </div>

        <h1 style={{
          fontSize: '1.6rem',
          fontWeight: 800,
          marginBottom: '0.75rem',
          color: 'var(--text-primary)'
        }}>
          {isAr ? 'الصفحة غير موجودة أو تم تحديث مسارها' : 'Page Not Found or Moved'}
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          marginBottom: '2rem',
          maxWidth: '580px',
          margin: '0 auto 2rem'
        }}>
          {isAr
            ? 'المسار المطلوب غير متاح، ولكن كافة خدمات المنصة ومحركات الذكاء الثمانية متاحة وجاهزة. يمكنك الانتقال مباشرة للوجهة التي تريدها أدناه:'
            : 'The requested path is not found, but all platform engines and tools are active. Jump directly to any view below:'}
        </p>

        {/* Quick Access Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '10px',
          marginBottom: '2rem',
          textAlign: 'start'
        }}>
          {quickLinks.map((ql, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(ql.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ color: 'var(--accent-light)' }}>{ql.icon}</span>
              <span style={{ flex: 1 }}>{isAr ? ql.titleAr : ql.titleEn}</span>
              <IconArrowRight size={12} />
            </button>
          ))}
        </div>

        {/* Bottom Actions */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem'
        }}>
          <button
            onClick={() => onNavigate('/')}
            className="btn-primary"
            style={{ fontSize: '13px', padding: '10px 18px' }}
          >
            <span>{isAr ? 'العودة للموقع العام' : 'Return to Website'}</span>
          </button>

          <button
            onClick={() => onNavigate('/platform')}
            className="btn-secondary"
            style={{ fontSize: '13px', padding: '10px 18px' }}
          >
            <span>{isAr ? 'استعراض معمارية المنظومة' : 'Platform Architecture'}</span>
          </button>

          <button
            onClick={() => onNavigate('/contact')}
            className="ctrl-btn"
            style={{ fontSize: '13px', padding: '10px 14px' }}
          >
            <span>{isAr ? 'التواصل والدعم' : 'Contact Support'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
