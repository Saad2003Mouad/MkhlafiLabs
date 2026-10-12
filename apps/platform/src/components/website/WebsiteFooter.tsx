import React from 'react';
import { LocaleMode } from '../../types';

interface FooterProps {
  locale: LocaleMode;
  onExplorePlatform: () => void;
  onRequestDemo: () => void;
}

export const WebsiteFooter: React.FC<FooterProps> = ({ locale, onExplorePlatform, onRequestDemo }) => {
  const isAr = locale === 'ar';

  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="footer-grid">
          {/* Col 1: Brand & Mission */}
          <div className="footer-col">
            <div className="brand-emblem">
              <div className="brand-symbol">M</div>
              <div className="brand-meta">
                <span className="brand-name">MIKHLAFI LABS</span>
                <span className="brand-sub">
                  {isAr ? 'أنظمة · ذكاء · ابتكار' : 'INTELLIGENCE · SYSTEMS · INNOVATION'}
                </span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.6', maxWidth: '320px' }}>
              {isAr
                ? 'نبني تقنيات تساعد المؤسسات على اتخاذ قرارات أفضل، كشف الانحرافات المالية والتشغيلية، وحماية هوامش الربحية.'
                : 'Building sovereign technology that empowers enterprises to uncover hidden financial variance and make confident decisions.'}
            </p>
            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
              HQ — Riyadh, Kingdom of Saudi Arabia
            </div>
          </div>

          {/* Col 2: Platform Engines */}
          <div className="footer-col">
            <span className="footer-col-title">
              {isAr ? 'محركات الذكاء' : 'Intelligence Suite'}
            </span>
            <a href="#solutions" className="footer-link">
              {isAr ? 'كشف الهدر المالي' : 'Financial Leak Detection'}
            </a>
            <a href="#solutions" className="footer-link">
              {isAr ? 'مركز القرارات التنفيذية' : 'Executive Decision Center'}
            </a>
            <a href="#solutions" className="footer-link">
              {isAr ? 'التنبؤ بالمخاطر التشغيلية' : 'Predictive Risk Intelligence'}
            </a>
            <a href="#solutions" className="footer-link">
              {isAr ? 'ذكاء أداء المشاريع' : 'Project Intelligence'}
            </a>
            <a href="#solutions" className="footer-link">
              {isAr ? 'ذكاء الموردين والمشتريات' : 'Supplier Intelligence'}
            </a>
          </div>

          {/* Col 3: Architecture & Security */}
          <div className="footer-col">
            <span className="footer-col-title">
              {isAr ? 'المعمارية والأمان' : 'Architecture & Trust'}
            </span>
            <a href="#how-it-works" className="footer-link">
              {isAr ? 'المنهجية الحتمية' : 'Deterministic Methodology'}
            </a>
            <a href="#integrations" className="footer-link">
              {isAr ? 'تكامل أنظمة ERP' : 'ERP Integrations'}
            </a>
            <a href="#security" className="footer-link">
              {isAr ? 'النشر المحلي السيادي' : 'On-Premise Deployment'}
            </a>
            <a href="#security" className="footer-link">
              {isAr ? 'حوكمة وسجلات التدقيق' : 'Audit Trails & RBAC'}
            </a>
          </div>

          {/* Col 4: Solutions & Access */}
          <div className="footer-col">
            <span className="footer-col-title">
              {isAr ? 'الوصول والتجربة' : 'Evaluation'}
            </span>
            <a href="#pricing" className="footer-link">
              {isAr ? 'باقات الاشتراك الشهرية' : 'Subscription Packages'}
            </a>
            <button onClick={onRequestDemo} className="footer-link" style={{ textAlign: 'start' }}>
              {isAr ? 'طلب عرض مخصص' : 'Request Tailored Demo'}
            </button>
            <button onClick={onExplorePlatform} className="footer-link" style={{ textAlign: 'start', color: 'var(--accent-light)', fontWeight: 700 }}>
              {isAr ? 'دخول لوحة التحكم الحية ←' : 'Open Live Cockpit →'}
            </button>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} MIKHLAFI LABS. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ cursor: 'pointer' }}>{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
            <span style={{ cursor: 'pointer' }}>{isAr ? 'شروط الاستخدام' : 'Terms of Service'}</span>
            <span style={{ cursor: 'pointer' }}>{isAr ? 'الامتثال الوطني (NCA)' : 'Sovereign Compliance'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
