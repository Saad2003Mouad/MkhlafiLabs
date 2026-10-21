// MIKHLAFI LABS — Public Website: Sovereign Architecture
// Non-invasive connectivity, deterministic verification, deployment options,
// and audit trails. Structural capability statements only — no fabricated
// performance or certification figures.

import React from 'react';
import { LocaleMode } from '../../types';
import { IconDatabase, IconCheckCircle, IconServer, IconLock } from '../Icons';
import { SectionMediaBand } from './SectionMediaBand';

interface SovereignArchitectureSectionProps {
  locale: LocaleMode;
}

export const SovereignArchitectureSection: React.FC<SovereignArchitectureSectionProps> = ({ locale }) => {
  const isAr = locale === 'ar';

  const pillars = [
    {
      icon: <IconDatabase size={20} />,
      badgeAr: 'قراءة فقط',
      badgeEn: 'Read-only',
      badgeTone: 'accent' as const,
      titleAr: 'ربط غير تدخّلي بالأنظمة القائمة',
      titleEn: 'Non-invasive connection to existing systems',
      descAr: 'مسارات قراءة مشفّرة تصل إلى أنظمة ERP وقواعد البيانات وملفات الدفاتر دون تغيير في مخططاتها ودون تعطيل العمل اليومي.',
      descEn: 'Encrypted read paths reach your ERP, databases, and ledger files without altering their schemas and without interrupting daily operations.'
    },
    {
      icon: <IconCheckCircle size={20} />,
      badgeAr: 'قابل للتتبع',
      badgeEn: 'Traceable',
      badgeTone: 'success' as const,
      titleAr: 'تحليل حتمي مرتبط بمصدره',
      titleEn: 'Deterministic analysis tied to its source',
      descAr: 'قواعد حسابية قطعية تفصل الحقائق المؤكدة عن الاحتمالات، وكل نتيجة تحمل رابطاً إلى السجل الذي أُخذت منه.',
      descEn: 'Deterministic arithmetic separates verified facts from probabilities, and every finding carries a link to the record it came from.'
    },
    {
      icon: <IconServer size={20} />,
      badgeAr: 'سيادي أو محلي',
      badgeEn: 'Sovereign or on-prem',
      badgeTone: 'info' as const,
      titleAr: 'خيارات نشر تحترم حدود بياناتكم',
      titleEn: 'Deployment options that respect your data boundaries',
      descAr: 'استضافة سيادية داخل المملكة، أو نشر كامل داخل مراكز بياناتكم عبر خوادم مخصّصة أو Kubernetes خاص.',
      descEn: 'Sovereign hosting inside the Kingdom, or full deployment inside your own data centers on bare-metal or private Kubernetes.'
    },
    {
      icon: <IconLock size={20} />,
      badgeAr: 'سجل غير قابل للتعديل',
      badgeEn: 'Tamper-evident log',
      badgeTone: 'accent' as const,
      titleAr: 'مسار تدقيق دائم لكل استعلام',
      titleEn: 'A permanent audit trail for every query',
      descAr: 'كل استعلام أو تعديل يُسجَّل بطابع زمني ضمن مسار تدقيق غير قابل للتلاعب، جاهز للمراجعة الداخلية والخارجية.',
      descEn: 'Every query and change is timestamped in a tamper-evident audit trail, ready for internal and external review.'
    }
  ];

  const sources = [
    { ar: 'SAP S/4HANA', en: 'SAP S/4HANA' },
    { ar: 'Oracle NetSuite و Oracle Cloud', en: 'Oracle NetSuite & Oracle Cloud' },
    { ar: 'Microsoft Dynamics 365', en: 'Microsoft Dynamics 365' },
    { ar: 'Odoo Enterprise', en: 'Odoo Enterprise' },
    { ar: 'SAGE', en: 'SAGE' },
    { ar: 'PostgreSQL و SQL Server', en: 'PostgreSQL & SQL Server' },
    { ar: 'ملفات الدفاتر Excel/CSV', en: 'Excel / CSV ledger files' },
    { ar: 'أنظمة مخصّصة وموروثة', en: 'Custom and legacy systems' }
  ];

  return (
    <section className="site-section site-section--alt" id="architecture">
      <div className="ml-container">
        <div className="site-section__head">
          <span className="ml-eyebrow">{isAr ? 'المعمارية والسيادة' : 'ARCHITECTURE & SOVEREIGNTY'}</span>
          <h2 className="ml-heading site-section__title">
            {isAr
              ? 'ذكاء مؤسسي مستقل يجلس فوق بنيتكم التحتية'
              : 'An independent intelligence layer that sits above your infrastructure'}
          </h2>
          <p className="ml-lead site-section__lead">
            {isAr
              ? 'لا نستبدل الأنظمة القائمة ولا نعيد هندستها. نقرأ منها بأمان، ونحوّل ما نراه إلى قرارات موثّقة — مع بقاء البيانات ضمن الحدود التي تختارونها.'
              : 'We do not replace or re-engineer the systems you run. We read from them safely and turn what we see into evidenced decisions — with data staying within the boundaries you choose.'}
          </p>
        </div>

        <SectionMediaBand
          src="/assets/images/sovereign-security-vault.jpg"
          eyebrow={isAr ? 'السيادة والاحتواء' : 'SOVEREIGNTY & CONTAINMENT'}
          title={
            isAr
              ? 'بياناتكم تبقى داخل الحدود التي تختارونها'
              : 'Your data stays inside the boundary you choose'
          }
          body={
            isAr
              ? 'استضافة سيادية داخل المملكة، أو نشر كامل داخل مراكز بياناتكم. لا تُنقل أي بيانات خارج النطاق الذي تحدّدونه، وكل مسار قراءة يخضع للتشفير وللتسجيل الكامل.'
              : 'Sovereign hosting inside the Kingdom, or a full deployment inside your own data centres. Nothing leaves the boundary you define, and every read path is encrypted and fully logged.'
          }
        >
          <span className="ml-badge">PDPL</span>
          <span className="ml-badge">ISO 27001</span>
          <span className="ml-badge">ZATCA P2</span>
        </SectionMediaBand>

        <div className="site-grid site-grid--2">
          {pillars.map((pillar, i) => (
            <article key={i} className="site-tile" style={{ cursor: 'default' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12
                }}
              >
                <span className="site-tile__icon" style={{ margin: 0 }}>
                  {pillar.icon}
                </span>
                <span className={`ml-badge ml-badge--${pillar.badgeTone}`}>
                  {isAr ? pillar.badgeAr : pillar.badgeEn}
                </span>
              </div>
              <h3 className="site-tile__title">{isAr ? pillar.titleAr : pillar.titleEn}</h3>
              <p className="site-tile__desc">{isAr ? pillar.descAr : pillar.descEn}</p>
            </article>
          ))}
        </div>

        <div className="home-connectors">
          <div className="home-connectors__head">
            <span className="home-connectors__title">
              {isAr
                ? 'تقرأ المنصة من الأنظمة التي تستخدمونها بالفعل'
                : 'The platform reads from the systems you already run'}
            </span>
            <span className="ml-badge ml-badge--success">
              <span className="ml-dot" />
              {isAr ? 'مسارات قراءة آمنة' : 'Secure read-only paths'}
            </span>
          </div>
          <div className="home-connectors__list">
            {sources.map((source, i) => (
              <span key={i} className="ml-badge">
                {isAr ? source.ar : source.en}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
