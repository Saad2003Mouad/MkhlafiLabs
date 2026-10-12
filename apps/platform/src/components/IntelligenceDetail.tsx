import React, { useState } from 'react';
import { LocaleMode } from '../types';
import { IconFilter, IconCheckCircle, IconShield } from './Icons';

interface IntelligenceDetailProps {
  locale: LocaleMode;
  onBack: () => void;
}

export const IntelligenceDetail: React.FC<IntelligenceDetailProps> = ({ locale, onBack }) => {
  const isAr = locale === 'ar';
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'anomalies' | 'reconciliation' | 'audit'>('anomalies');
  const [resolved, setResolved] = useState<boolean>(false);

  return (
    <div className="content-scroll">
      {/* Detail Header & Breadcrumb */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
          <button onClick={onBack} style={{ color: 'var(--accent-light)', fontWeight: 700, textDecoration: 'underline' }}>
            {isAr ? '← العودة للمنصة الرئيسية' : '← Back to Overview'}
          </button>
          <span>/</span>
          <span>{isAr ? 'محركات الذكاء' : 'Intelligence Modules'}</span>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            {isAr ? 'الذكاء المالي وكشف الشذوذ (Engine 01)' : 'Financial Intelligence & Anomaly Audit'}
          </span>
        </div>

        <div className="page-intro">
          <div>
            <h1 className="page-title">
              {isAr ? 'الذكاء المالي والتدقيق الجنائي للتدفقات' : 'Financial Intelligence & Forensic Audit'}
            </h1>
            <p className="page-desc">
              {isAr
                ? 'فحص تفصيلي للتدفقات النقدية، كشف مؤشرات تسرب الأرباح، والتحقق الحسابي من سلامة المطالبات المالية عبر مطابقة ثلاثية (PO + GRN + Invoice).'
                : 'Algorithmic auditing of financial flows, early leakage detection, and granular transaction verification via 3-way match triangulation.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="ctrl-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconFilter size={14} />
              <span>{isAr ? 'تصفية السجلات' : 'Filter Records'}</span>
            </button>
            <button className="btn-primary" style={{ fontSize: '12px', padding: '7px 14px' }}>
              <span>{isAr ? 'تصدير تقرير التدقيق الجنائي' : 'Export Forensic Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
        <button
          onClick={() => setActiveTab('anomalies')}
          className={`ctrl-btn ${activeTab === 'anomalies' ? 'active' : ''}`}
        >
          {isAr ? 'الانحرافات النشطة (Active Flags)' : 'Flagged Anomalies'}
        </button>
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`ctrl-btn ${activeTab === 'reconciliation' ? 'active' : ''}`}
        >
          {isAr ? 'المطابقة الحسابية الثلاثية (3-Way Match)' : '3-Way Match Reconciliation'}
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`ctrl-btn ${activeTab === 'audit' ? 'active' : ''}`}
        >
          {isAr ? 'سجل التدقيق والتتبع (Audit Trail)' : 'Immutable Audit Trail'}
        </button>
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 700 }}>
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

      {/* Deep Dive Forensic Investigation Box */}
      <div className="content-panel" style={{ border: '1px solid var(--accent-base)' }}>
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="severity-tag high">HIGH SEVERITY</span>
            <h2 className="panel-title">
              CASE-2026-081: {isAr ? 'تكرار صرف مدفوعات لنفس المورد' : 'Duplicate Vendor Disbursement Match'}
            </h2>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-light)', fontWeight: 700 }}>
            Confidence: 94.2%
          </span>
        </div>

        {/* Forensic Metadata Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'المورد المستفيد' : 'Target Vendor'}</div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>Global Logistics Co.</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'المبلغ المشتبه به' : 'Flagged Amount'}</div>
            <div style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--status-danger)' }}>48,500 SAR</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'الفرع المصدر' : 'Issuing Branch'}</div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>HQ — Riyadh Hub</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isAr ? 'قاعدة الرصد الحتمية' : 'Detection Rule'}</div>
            <div style={{ fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--accent-light)' }}>RULE_DUP_INVOICE_HASH</div>
          </div>
        </div>

        {/* Algorithmic Evidence & Narrative */}
        <div style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>
            {isAr ? 'تفسير الخوارزمية والأدلة المسجلة في دفتر الأستاذ:' : 'Algorithmic Evidence & Context:'}
          </strong>
          <p style={{ marginTop: '6px' }}>
            {isAr
              ? 'تم رصد فاتورتين مختلفتين بالرقم المرجعي (#INV-9022 و #INV-9041) تحملان نفس القيمة المالية، ونفس الحساب البنكي الآيبان، ونفس بنود التوريد خلال فترة 36 ساعة فقط. يُوصى بالتحقق المباشر من إدارة الحسابات الدائنة قبل اعتماد التحويل البنكي الثاني لتفادي تسرب السيولة.'
              : 'Two separate purchase orders matched identical line items, vendor IBAN, and monetary values within a 36-hour timeframe. Server verification rule flags this for CFO review prior to batch payout.'}
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
          {!resolved ? (
            <>
              <button
                onClick={() => setResolved(true)}
                className="btn-primary"
                style={{ background: 'var(--status-success)', borderColor: 'var(--status-success)', fontSize: '12px' }}
              >
                <IconCheckCircle size={15} />
                <span>{isAr ? 'اعتماد كمطالبة صحيحة وغير مكررة' : 'Mark as Legitimate (Dismiss Flag)'}</span>
              </button>

              <button
                onClick={() => setResolved(true)}
                className="btn-secondary"
                style={{ background: 'var(--status-danger-subtle)', color: 'var(--status-danger)', borderColor: 'var(--status-danger)', fontSize: '12px' }}
              >
                <IconShield size={15} />
                <span>{isAr ? 'تجميد أمر الصرف وإحالة للتدقيق' : 'Freeze Disbursement & Initiate Audit'}</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-success)', fontWeight: 700 }}>
              <IconCheckCircle size={18} />
              <span>{isAr ? 'تم تسجيل وتوثيق الإجراء في سجل التدقيق بنجاح.' : 'Action executed and logged to immutable audit trail.'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
