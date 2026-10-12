import React from 'react';
import { LocaleMode } from '../../types';
import { IconShield } from '../Icons';

interface SecurityProps {
  locale: LocaleMode;
}

export const SecurityGovernanceSection: React.FC<SecurityProps> = ({ locale }) => {
  const isAr = locale === 'ar';

  const pillars = [
    {
      titleAr: 'خيارات نشر سيادية بالكامل (Sovereign & On-Premise)',
      titleEn: 'Sovereign On-Premise & Private Cloud Deployment',
      descAr: 'إمكانية النشر المباشر داخل مراكز بيانات مؤسستك (Bare-Metal / Private Kubernetes) مع بقاء البيانات محصورة داخل حدودك الجغرافية والسيادية.',
      descEn: 'Full deployment capability inside your private corporate data centers with complete data residency sovereignty.'
    },
    {
      titleAr: 'عزل تام للبيانات وانعدام التدريب الخارجي',
      titleEn: 'Strict Tenant Isolation & Zero External AI Training',
      descAr: 'بياناتك ودفاترك الحسابية ملكك المطلق ولا تُستخدم إطلاقاً لتدريب أي نماذج عامة. تشفير متقدم في وضع السكون وأثناء النقل (AES-256 / TLS 1.3).',
      descEn: 'Your transactions remain strictly yours. Zero data egress, zero third-party model training, with AES-256 encryption at rest.'
    },
    {
      titleAr: 'حوكمة الصلاحيات وسجلات التدقيق (RBAC & Audit Trails)',
      titleEn: 'Granular RBAC & Immutable Forensic Audit Trails',
      descAr: 'تحكم دقيق بمستويات الصلاحيات للقيادات والمدراء، مع تسجيل كل استعلام أو تعديل في سجلات تدقيق حسابية غير قابلة للتلاعب.',
      descEn: 'Fine-grained role-based access control paired with immutable timestamped audit logs for every ledger query.'
    }
  ];

  return (
    <section className="site-section" id="security" style={{ background: 'var(--bg-surface)' }}>
      <div className="site-container">
        <div className="section-head">
          <span className="section-eyebrow">
            {isAr ? 'الأمان والسيادة المؤسسية' : 'SECURITY & SOVEREIGN GOVERNANCE'}
          </span>
          <h2 className="section-title">
            {isAr
              ? 'أمان بمعايير سيادية مصمم لأكثر القطاعات حساسية'
              : 'Sovereign-grade security engineered for mission-critical operations'}
          </h2>
          <p className="section-subtitle">
            {isAr
              ? 'حماية مطلقة لسرية وسجلات المؤسسة متوافقة مع الأطر التنظيمية الوطنية (NCA & NDMO).'
              : 'Architected to meet stringent enterprise compliance, data residency standards, and sovereign privacy mandates.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {pillars.map((p, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ color: 'var(--accent-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconShield size={20} />
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-tertiary)' }}>
                  PILLAR 0{idx + 1}
                </span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isAr ? p.titleAr : p.titleEn}
              </h3>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {isAr ? p.descAr : p.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
