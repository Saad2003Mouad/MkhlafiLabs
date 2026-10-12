// MIKHLAFI LABS — Public Website Footer
// Provides directory navigation to public sections, architecture docs, solutions, and enterprise compliance

import React from 'react';
import { LocaleMode } from '../../types';
import { ROUTES } from '../../router/routes';

interface FooterProps {
  locale: LocaleMode;
  onExplorePlatform?: () => void;
  onRequestDemo: () => void;
  onNavigate?: (path: string) => void;
}

export const WebsiteFooter: React.FC<FooterProps> = ({
  locale,
  onRequestDemo,
  onNavigate
}) => {
  const isAr = locale === 'ar';

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="footer-grid">
          {/* Col 1: Brand & Mission */}
          <div className="footer-col">
            <a
              href={ROUTES.PUBLIC.HOME}
              onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.HOME)}
              className="brand-emblem"
            >
              <div className="brand-symbol">M</div>
              <div className="brand-meta">
                <span className="brand-name">MIKHLAFI LABS</span>
                <span className="brand-sub">
                  {isAr ? 'أنظمة · ذكاء · ابتكار' : 'INTELLIGENCE · SYSTEMS · INNOVATION'}
                </span>
              </div>
            </a>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.6', maxWidth: '320px' }}>
              {isAr
                ? 'نبني تقنيات تساعد المؤسسات على اتخاذ قرارات أفضل، كشف الانحرافات المالية والتشغيلية، وحماية هوامش الربحية.'
                : 'Building sovereign technology that empowers enterprises to uncover hidden financial variance and make confident decisions.'}
            </p>
            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
              HQ — Riyadh, Kingdom of Saudi Arabia
            </div>
          </div>

          {/* Col 2: Solutions & Capabilities */}
          <div className="footer-col">
            <span className="footer-col-title">
              {isAr ? 'الحلول والمحركات' : 'Enterprise Solutions'}
            </span>
            <a
              href={ROUTES.PUBLIC.SOLUTIONS}
              onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.SOLUTIONS)}
              className="footer-link"
            >
              {isAr ? 'كشف الهدر المالي' : 'Financial Leak Detection'}
            </a>
            <a
              href={ROUTES.PUBLIC.SOLUTIONS}
              onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.SOLUTIONS)}
              className="footer-link"
            >
              {isAr ? 'شبكة القرارات التنفيذية' : 'Executive Decision Mesh'}
            </a>
            <a
              href={ROUTES.PUBLIC.SOLUTIONS}
              onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.SOLUTIONS)}
              className="footer-link"
            >
              {isAr ? 'رادار مخاطر التوريد' : 'Supply Chain Risk Radar'}
            </a>
            <a
              href={ROUTES.PUBLIC.SOLUTIONS}
              onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.SOLUTIONS)}
              className="footer-link"
            >
              {isAr ? 'حماية هوامش المشاريع' : 'Project Margin Assurance'}
            </a>
            <a
              href={ROUTES.PUBLIC.INDUSTRIES}
              onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.INDUSTRIES)}
              className="footer-link"
            >
              {isAr ? 'القطاعات المخدومة' : 'Industries Served'}
            </a>
          </div>

          {/* Col 3: Architecture & Security */}
          <div className="footer-col">
            <span className="footer-col-title">
              {isAr ? 'المنظومة والأمان' : 'Platform & Security'}
            </span>
            <a
              href={ROUTES.PUBLIC.PLATFORM}
              onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.PLATFORM)}
              className="footer-link"
            >
              {isAr ? 'معمارية المنظومة' : 'Platform Architecture'}
            </a>
            <a
              href={ROUTES.PUBLIC.ABOUT}
              onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.ABOUT)}
              className="footer-link"
            >
              {isAr ? 'عن مخلافي لابس' : 'About MIKHLAFI LABS'}
            </a>
            <a
              href={ROUTES.PUBLIC.PRICING}
              onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.PRICING)}
              className="footer-link"
            >
              {isAr ? 'باقات الاشتراك والترخيص' : 'Licensing & Packages'}
            </a>
            <a
              href={ROUTES.PUBLIC.CONTACT}
              onClick={(e) => handleLinkClick(e, ROUTES.PUBLIC.CONTACT)}
              className="footer-link"
            >
              {isAr ? 'التواصل والاستشارات' : 'Consultations & Contact'}
            </a>
          </div>

          {/* Col 4: Customer Access */}
          <div className="footer-col">
            <span className="footer-col-title">
              {isAr ? 'بوابة العملاء' : 'Customer Workspace'}
            </span>
            <a
              href={ROUTES.AUTH.LOGIN}
              onClick={(e) => handleLinkClick(e, ROUTES.AUTH.LOGIN)}
              className="footer-link"
              style={{ color: 'var(--accent-light)', fontWeight: 700 }}
            >
              {isAr ? 'تسجيل دخول العملاء ←' : 'Client Sign In →'}
            </a>
            <a
              href={ROUTES.AUTH.REGISTER}
              onClick={(e) => handleLinkClick(e, ROUTES.AUTH.REGISTER)}
              className="footer-link"
            >
              {isAr ? 'إنشاء مساحة عمل جديدة' : 'Create Organization Workspace'}
            </a>
            <button
              onClick={onRequestDemo}
              className="footer-link"
              style={{ textAlign: 'start', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {isAr ? 'طلب عرض مخصص' : 'Request Tailored Demo'}
            </button>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} MIKHLAFI LABS. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ cursor: 'pointer' }}>{isAr ? 'السيادة والخصوصية' : 'Sovereignty & Privacy'}</span>
            <span style={{ cursor: 'pointer' }}>{isAr ? 'شروط الخدمة' : 'Terms of Service'}</span>
            <span style={{ cursor: 'pointer' }}>{isAr ? 'الامتثال الوطني (NCA)' : 'NCA Compliance'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
