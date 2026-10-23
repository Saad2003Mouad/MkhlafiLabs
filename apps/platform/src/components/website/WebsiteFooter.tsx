// MIKHLAFI LABS — Public Website Footer
// Structured footer with platform navigation, capability index, and legal links.

import React from 'react';
import { LocaleMode } from '../../types';
import { ROUTES } from '../../router/routes';

interface WebsiteFooterProps {
  locale: LocaleMode;
  onExplorePlatform?: () => void;
  onRequestDemo?: () => void;
  onNavigate?: (path: string) => void;
}

export const WebsiteFooter: React.FC<WebsiteFooterProps> = ({
  locale,
  onNavigate
}) => {
  const isAr = locale === 'ar';

  const handleLink = (e: React.MouseEvent, path: string) => {
    if (path === '#') {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    if (onNavigate) onNavigate(path);
  };

  const cols = [
    {
      titleEn: 'Platform',
      titleAr: 'المنصة',
      links: [
        { en: 'Platform overview', ar: 'نظرة عامة', path: ROUTES.PUBLIC.PLATFORM },
        { en: 'Engines & solutions', ar: 'المحركات والحلول', path: ROUTES.PUBLIC.SOLUTIONS },
        { en: 'Industries', ar: 'القطاعات', path: ROUTES.PUBLIC.INDUSTRIES },
        { en: 'Deployment & Plans', ar: 'نماذج التشغيل والباقات', path: ROUTES.PUBLIC.DEPLOYMENT }
      ]
    },
    {
      titleEn: 'Capabilities',
      titleAr: 'القدرات',
      links: [
        { en: 'Anomaly detection', ar: 'كشف الانحرافات', path: '/services/financial-leak-detection' },
        { en: 'Executive decisions', ar: 'مركز القرارات', path: '/services/decision-intelligence' },
        { en: 'Risk intelligence', ar: 'ذكاء المخاطر', path: '/services/predictive-risk-radar' },
        { en: 'Data quality', ar: 'جودة البيانات', path: '/services/data-quality-governance' }
      ]
    },
    {
      titleEn: 'Company',
      titleAr: 'الشركة',
      links: [
        { en: 'About us', ar: 'من نحن', path: ROUTES.PUBLIC.ABOUT },
        { en: 'Contact', ar: 'تواصل معنا', path: ROUTES.PUBLIC.CONTACT },
        { en: 'Privacy policy', ar: 'سياسة الخصوصية', path: '#' },
        { en: 'Terms of service', ar: 'شروط الخدمة', path: '#' }
      ]
    }
  ];

  return (
    <footer className="site-footer">
      <div className="ml-container">
        <div className="site-footer__grid">
          {/* Brand column */}
          <div>
            <img
              src="/brand/logo.png"
              alt="MIKHLAFI LABS"
              style={{
                height: '52px',
                width: 'auto',
                display: 'block',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.45))'
              }}
            />
            <p
              style={{
                marginTop: 16,
                fontSize: 13.5,
                lineHeight: 1.7,
                color: 'var(--text-tertiary)',
                maxWidth: '38ch'
              }}
            >
              {isAr
                ? 'طبقة ذكاء تشغيلية حتمية فوق أنظمة المؤسسات القائمة — تُظهر الانحرافات وتُوثّق الأدلة قبل أن تتحوّل إلى خسائر.'
                : 'A deterministic operational intelligence layer that sits above your existing enterprise systems — surfacing deviations and evidencing them before they become losses.'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 20 }}>
              <span className="ml-badge">{isAr ? 'صنعاء، اليمن' : "Sana'a, Yemen"}</span>
              <span className="ml-badge">{isAr ? 'استضافة سيادية' : 'Sovereign Hosting'}</span>
              <span className="ml-badge">ISO 27001</span>
              <span className="ml-badge">{isAr ? 'عزل كامل للبيانات' : 'Air-Gapped Ready'}</span>
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col, i) => (
            <div key={i}>
              <h4 className="site-footer__col-title">{isAr ? col.titleAr : col.titleEn}</h4>
              <div className="site-footer__links">
                {col.links.map((link, j) => (
                  <a
                    key={j}
                    href={link.path}
                    onClick={(e) => handleLink(e, link.path)}
                    className="site-footer__link"
                  >
                    {isAr ? link.ar : link.en}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="site-footer__bottom">
          <span>
            © {new Date().getFullYear()} Mikhlafi Labs.
            {isAr ? ' جميع الحقوق محفوظة.' : ' All rights reserved.'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--status-success)'
                }}
              />
              {isAr ? 'كل الأنظمة تعمل' : 'All systems operational'}
            </span>
            <a href="#" className="site-footer__link" onClick={(e) => e.preventDefault()}>
              LinkedIn
            </a>
            <a href="#" className="site-footer__link" onClick={(e) => e.preventDefault()}>
              X
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
