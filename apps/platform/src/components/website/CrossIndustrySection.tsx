import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { INDUSTRIES } from '../../data/mockData';
import { IconLayers } from '../Icons';

interface CrossIndustryProps {
  locale: LocaleMode;
}

export const CrossIndustrySection: React.FC<CrossIndustryProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [selectedIndustry, setSelectedIndustry] = useState<string>(INDUSTRIES[0].id);

  const activeInd = INDUSTRIES.find((i) => i.id === selectedIndustry) || INDUSTRIES[0];

  return (
    <section className="site-section" id="industries">
      <div className="site-container">
        <div className="section-head">
          <span className="section-eyebrow">
            {isAr ? 'المرونة والحياد القطاعي' : 'CROSS-INDUSTRY AGNOSTICISM'}
          </span>
          <h2 className="section-title">
            {isAr
              ? 'معمارية محايدة مصممة لتخدم أي نموذج أعمال دون قيود'
              : 'Universal architectural logic adapting to any operational model'}
          </h2>
          <p className="section-subtitle">
            {isAr
              ? 'لا تفرض المنصة قالباً مسبقاً، بل تتشكل خوارزميات التدقيق الجنائي وفق طبيعة تدفقاتك النقدية ومصادر توريدك.'
              : 'MIKHLAFI LABS is mathematically domain-agnostic. The forensic verification engines calibrate to your specific business flows.'}
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.id}
              onClick={() => setSelectedIndustry(ind.id)}
              className={`ctrl-btn ${selectedIndustry === ind.id ? 'active' : ''}`}
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              <IconLayers size={14} />
              <span>{isAr ? ind.titleAr : ind.titleEn}</span>
            </button>
          ))}
        </div>

        {/* Highlight Card */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            maxWidth: '840px',
            marginInline: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-elevated)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-base)' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isAr ? activeInd.titleAr : activeInd.titleEn}
            </h3>
          </div>

          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
            {isAr ? activeInd.descAr : activeInd.descEn}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                {isAr ? 'مجال كشف الهدر الرئيسي' : 'Primary Leak Target'}
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {isAr ? 'عقود التوريد وتكرار القيود' : 'Supplier Contracts & Duplicates'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                {isAr ? 'طبيعة المطابقة' : 'Reconciliation Type'}
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {isAr ? 'مطابقة ثلاثية (PO + GRN + INV)' : '3-Way Match (PO, GRN, Invoice)'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                {isAr ? 'حماية الهوامش' : 'Margin Protection'}
              </div>
              <div style={{ fontWeight: 600, color: 'var(--status-success)', marginTop: '2px' }}>
                {isAr ? 'رصد فوري لأي انحراف > 2%' : 'Automated flag on variance > 2%'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
