import React, { useState } from 'react';
import { LocaleMode } from '../types';
import { IconFilter, IconCheckCircle } from './Icons';

interface IntelligenceDetailProps {
  locale: LocaleMode;
  onBack: () => void;
}

export const IntelligenceDetail: React.FC<IntelligenceDetailProps> = ({ locale, onBack }) => {
  const isAr = locale === 'ar';
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'anomalies' | 'reconciliation' | 'audit'>('anomalies');

  return (
    <div className="content-scroll">
      {/* Detail Header & Breadcrumb */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
          <button onClick={onBack} style={{ color: 'var(--accent-light)', textDecoration: 'underline' }}>
            {isAr ? '← العودة للمنصة الرئيسية' : '← Back to Overview'}
          </button>
          <span>/</span>
          <span>{isAr ? 'محركات الذكاء' : 'Intelligence Modules'}</span>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {isAr ? 'الذكاء المالي وكشف الشذوذ' : 'Financial Intelligence'}
          </span>
        </div>

        <div className="page-intro">
          <div>
            <h1 className="page-title">{isAr ? 'الذكاء المالي والتدقيق المتقدم' : 'Financial Intelligence & Anomaly Audit'}</h1>
            <p className="page-desc">
              {isAr
                ? 'فحص تفصيلي للتدفقات النقدية، كشف مؤشرات تسرب الأرباح، والتحقق الحسابي من سلامة المطالبات المالية.'
                : 'Algorithmic auditing of financial flows, early leakage detection, and granular transaction verification.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="ctrl-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconFilter size={14} />
              <span>{isAr ? 'تصفية السجلات' : 'Filter Records'}</span>
            </button>
            <button className="ctrl-btn" style={{ background: 'var(--accent-base)', color: '#FFF', fontWeight: 700 }}>
              {isAr ? 'تصدير تقرير التدقيق' : 'Export Audit Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Domain Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
        <button
          onClick={() => setActiveTab('anomalies')}
          className={`ctrl-btn ${activeTab === 'anomalies' ? 'active' : ''}`}
        >
          {isAr ? 'الانحرافات المرصودة (Active Flags)' : 'Flagged Anomalies'}
        </button>
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`ctrl-btn ${activeTab === 'reconciliation' ? 'active' : ''}`}
        >
          {isAr ? 'المطابقة الحسابية (Reconciliation)' : 'Reconciliation Engine'}
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`ctrl-btn ${activeTab === 'audit' ? 'active' : ''}`}
        >
          {isAr ? 'سجل التدقيق والتتبع (Audit Trail)' : 'Audit Trail'}
        </button>
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
          {isAr ? 'تصفية حسب مستوى الخطورة:' : 'Filter Severity:'}
        </span>
        {['all', 'high', 'medium', 'low'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSelectedSeverity(sev)}
            className={`ctrl-btn ${selectedSeverity === sev ? 'active' : ''}`}
            style={{ fontSize: '11px', textTransform: 'uppercase' }}
          >
            {sev === 'all' ? (isAr ? 'الكل' : 'All') : sev}
          </button>
        ))}
      </div>

      {/* Deep Dive Investigation Box */}
      <div className="content-panel">
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="severity-tag high">HIGH SEVERITY</span>
            <h2 className="panel-title">ANOM-2026-081: {isAr ? 'تكرار صرف مدفوعات لنفس المورد' : 'Duplicate Vendor Disbursement Match'}</h2>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Confidence: 94.2%
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'المورد المستفيد' : 'Target Vendor'}</div>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>Global Logistics Co.</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'المبلغ المشتبه به' : 'Flagged Amount'}</div>
            <div style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--status-danger)' }}>48,500 SAR</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'الفرع المصدر' : 'Issuing Branch'}</div>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>HQ — Riyadh Hub</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'قاعدة الرصد' : 'Detection Rule'}</div>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>RULE_DUP_INVOICE_HASH</div>
          </div>
        </div>

        <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{isAr ? 'تفسير الخوارزمية والأدلة المسجلة:' : 'Algorithmic Evidence & Context:'}</strong>
          <p style={{ marginTop: '4px' }}>
            {isAr
              ? 'تم رصد فاتورتين مختلفتين بالرقم المرجعي (#INV-9022 و #INV-9041) تحملان نفس القيمة المالية، ونفس الحساب البنكي، ونفس بنود التوريد خلال فترة 36 ساعة. يُوصى بالتحقق المباشر من إدارة الحسابات الدائنة قبل اعتماد التحويل البنكي الثاني.'
              : 'Two separate purchase orders matched identical line items, bank accounts, and values within a 36-hour timeframe. Server verification rule flags this for manual CFO review prior to batch processing.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button className="ctrl-btn" style={{ background: 'var(--status-success)', color: '#FFF', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconCheckCircle size={14} />
            <span>{isAr ? 'اعتماد كمطالبة صحيحة وغير مكررة' : 'Mark as Legitimate (Dismiss Flag)'}</span>
          </button>
          <button className="ctrl-btn" style={{ background: 'var(--status-danger-subtle)', color: 'var(--status-danger)', border: '1px solid var(--status-danger)', fontWeight: 700 }}>
            {isAr ? 'تجميد أمر الصرف وإحالة للتحقيق' : 'Freeze Disbursement & Initiate Audit'}
          </button>
        </div>
      </div>
    </div>
  );
};
