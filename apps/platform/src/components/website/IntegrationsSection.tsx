import React from 'react';
import { LocaleMode } from '../../types';

interface IntegrationsProps {
  locale: LocaleMode;
}

export const IntegrationsSection: React.FC<IntegrationsProps> = ({ locale }) => {
  const isAr = locale === 'ar';

  const systems = [
    { name: 'SAP S/4HANA & ECC', status: 'Direct Connector' },
    { name: 'Oracle Cloud ERP', status: 'API & Views' },
    { name: 'Microsoft Dynamics 365', status: 'Sync Bridge' },
    { name: 'Odoo Enterprise', status: 'REST / XML-RPC' },
    { name: 'Salesforce CRM', status: 'OAuth Ingestion' },
    { name: 'ZATCA المرحلة 2 (الفوترة الإلكترونية)', status: 'Compliant Bridge' },
    { name: 'PostgreSQL / SQL Server', status: 'Direct Read-Only' },
    { name: 'CSV / Excel Forensic Feeds', status: 'Batch Import' }
  ];

  return (
    <section className="site-section" id="integrations" style={{ background: 'var(--bg-surface)' }}>
      <div className="site-container">
        <div className="section-head">
          <span className="section-eyebrow">
            {isAr ? 'التكامل والتوافق المؤسسي' : 'ENTERPRISE INTEROPERABILITY'}
          </span>
          <h2 className="section-title">
            {isAr
              ? 'تتكامل بسلاسة مع أنظمة ERP القائمة دون استبدال أو تعطيل'
              : 'Seamlessly sits on top of your existing ERP & database stack'}
          </h2>
          <p className="section-subtitle">
            {isAr
              ? 'طبقة ذكاء غير تطفلية (Non-Invasive) تقرأ السجلات عبر مسارات آمنة ومشفرة بصلاحيات قراءة فقط (Read-Only).'
              : 'Zero operational disruption: MIKHLAFI LABS establishes encrypted read-only telemetry pipelines directly into your operational systems.'}
          </p>
        </div>

        <div className="trust-badges-flow">
          {systems.map((sys) => (
            <div key={sys.name} className="trust-pill">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-base)' }} />
              <strong style={{ color: 'var(--text-primary)' }}>{sys.name}</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                [{sys.status}]
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
