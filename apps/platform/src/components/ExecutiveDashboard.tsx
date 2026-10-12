import React, { useState } from 'react';
import { LocaleMode } from '../types';
import { MOCK_KPIS, MOCK_ANOMALIES } from '../data/mockData';
import { KpiCard } from './KpiCard';
import { ChartPreview } from './ChartPreview';
import { IconArrowRight } from './Icons';

interface ExecutiveDashboardProps {
  locale: LocaleMode;
  onNavigateDetail: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ locale, onNavigateDetail }) => {
  const isAr = locale === 'ar';
  const [selectedPeriod, setSelectedPeriod] = useState('q4');

  return (
    <div className="content-scroll">
      {/* Top Header & Date Range Controls */}
      <div className="page-intro">
        <div>
          <h1 className="page-title">
            {isAr ? 'مركز القيادة والذكاء التنفيذي الموحد' : 'Executive Command Center'}
          </h1>
          <p className="page-desc">
            {isAr
              ? 'مراقبة حية وشاملة لأداء المؤسسة، كشف الانحرافات المالية والتشغيلية، ودعم اتخاذ القرارات الاستراتيجية.'
              : 'Holistic business monitoring, early operational anomaly detection, and unified decision intelligence.'}
          </p>
        </div>

        {/* Date Range Selector & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
            <button
              onClick={() => setSelectedPeriod('m')}
              className={`ctrl-btn ${selectedPeriod === 'm' ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '11px', border: 'none' }}
            >
              {isAr ? 'الشهر الحالي' : 'Month'}
            </button>
            <button
              onClick={() => setSelectedPeriod('q4')}
              className={`ctrl-btn ${selectedPeriod === 'q4' ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '11px', border: 'none' }}
            >
              {isAr ? 'الربع المالي Q4' : 'Q4 Quarter'}
            </button>
            <button
              onClick={() => setSelectedPeriod('y')}
              className={`ctrl-btn ${selectedPeriod === 'y' ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '11px', border: 'none' }}
            >
              {isAr ? 'العام الحالي' : 'YTD'}
            </button>
          </div>

          <button
            onClick={onNavigateDetail}
            className="btn-primary"
            style={{ fontSize: '12px', padding: '7px 14px' }}
          >
            <span>{isAr ? 'التدقيق المالي الكامل' : 'Open Financial Audit'}</span>
            <IconArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Honest Demo Mode Disclaimer Banner */}
      <div className="honest-alert">
        <span style={{ fontSize: '20px' }}>ℹ️</span>
        <div style={{ flex: 1 }}>
          <strong style={{ color: 'var(--text-primary)' }}>
            {isAr ? 'وضع العرض الاسترشادي المدار (Demonstration Dataset):' : 'Controlled Benchmark Evaluation Mode:'}
          </strong>{' '}
          {isAr
            ? 'البيانات والأرقام المعروضة أدناه هي بيانات نموذجية استرشادية مصممة لتقييم تجربة الاستخدام وسرعة الاستجابة قبل إتمام ربط قاعدة بيانات PostgreSQL.'
            : 'Metrics displayed are demonstration benchmarks designed to evaluate UI responsiveness and the design system prior to live PostgreSQL connection.'}
        </div>
        <span style={{ fontSize: '11px', color: 'var(--accent-light)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          STATUS: DEMO_INTEGRITY_VERIFIED
        </span>
      </div>

      {/* KPI Summary Cards Grid */}
      <div className="kpi-grid">
        {MOCK_KPIS.map((kpi) => (
          <KpiCard key={kpi.id} item={kpi} locale={locale} />
        ))}
      </div>

      {/* Bento Grid: Trend Chart & Executive Action Queue */}
      <div className="bento-grid">
        {/* Trend Chart Panel */}
        <div className="content-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">
                {isAr ? 'منحنى مؤشر الاستقرار التشغيلي ومعدل تلافي الهدر' : 'Operational Stability Index & Loss Mitigation Trend'}
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {isAr ? 'تطور الأداء المجمع ومعدل تلافي المخاطر الشهرية مقابل الحدود المرجعية' : 'Aggregate operational performance vs mitigation baselines over rolling quarters'}
              </span>
            </div>
            <button
              onClick={onNavigateDetail}
              style={{
                fontSize: '12px',
                color: 'var(--accent-light)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{isAr ? 'التفاصيل والتدقيق' : 'Deep-Dive'}</span>
              <IconArrowRight size={13} />
            </button>
          </div>

          <ChartPreview locale={locale} />
        </div>

        {/* Priority Action Items / Executive Decisions Queue */}
        <div className="content-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              {isAr ? 'التوصيات والقرارات التنفيذية العاجلة' : 'Executive Action Priorities'}
            </h2>
            <span className="severity-tag high">3 PENDING</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', borderInlineStart: '3px solid var(--status-danger)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                  {isAr ? 'مراجعة أمر الصرف رقم #INV-9041' : 'Audit Disbursement #INV-9041'}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--status-danger)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  48,500 SAR
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {isAr ? 'اشتباه في تكرار المطالبة مع فرع الرياض خلال 48 ساعة' : 'Suspected duplicate invoice matched across Riyadh branch within 48h'}
              </div>
              <button
                onClick={onNavigateDetail}
                style={{ fontSize: '11px', color: 'var(--accent-light)', fontWeight: 700, marginTop: '6px' }}
              >
                {isAr ? 'فحص الأدلة واتخاذ إجراء ←' : 'Inspect Evidence & Mitigate →'}
              </button>
            </div>

            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', borderInlineStart: '3px solid var(--status-warning)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                  {isAr ? 'تجديد عقود الموردين الرئيسيين' : 'Primary Vendor Contract Review'}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--status-warning)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  -8.0% Window
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {isAr ? 'فرصة تفاوض لتخفيض 8% بناءً على إجمالي حجم التوريد السنوي' : 'Volume renegotiation window open based on annualized aggregate procurement'}
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', borderInlineStart: '3px solid var(--status-info)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                  {isAr ? 'مزامنة بيانات المستودعات الموحدة' : 'Warehouse Data Sync Verified'}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--status-success)', fontWeight: 700 }}>
                  100% Match
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {isAr ? 'تم استيراد 1,420 حركة مخزون دون أي انحرافات محاسبية' : '1,420 transaction records reconciled across central hubs with zero discrepancies'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anomalies Table Panel */}
      <div className="content-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              {isAr ? 'سجل الانحرافات وحالات التدقيق الجنائي المفتوحة' : 'Open Forensic Anomaly Audit Log'}
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {isAr ? 'قائمة الحالات التي تتطلب مراجعة من الإدارة المالية والتشغيلية' : 'Algorithmic flags generated via deterministic reconciliation rules'}
            </span>
          </div>

          <button
            onClick={onNavigateDetail}
            className="ctrl-btn"
            style={{ fontSize: '12px' }}
          >
            <span>🔍</span>
            <span>{isAr ? 'فتح شاشة التدقيق المالي الكامل' : 'Open Financial Intelligence'}</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{isAr ? 'رمز الحالة' : 'Code'}</th>
                <th>{isAr ? 'عنوان الانحراف المرصود' : 'Anomaly Description'}</th>
                <th>{isAr ? 'التصنيف' : 'Category'}</th>
                <th>{isAr ? 'الأثر المالي' : 'Impact Value'}</th>
                <th>{isAr ? 'مستوى الخطورة' : 'Severity'}</th>
                <th>{isAr ? 'نسبة الثقة' : 'Confidence'}</th>
                <th>{isAr ? 'وقت الرصد' : 'Detected At'}</th>
                <th>{isAr ? 'الحالة' : 'Status'}</th>
                <th>{isAr ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ANOMALIES.map((an) => (
                <tr key={an.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-light)' }}>
                    {an.code}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {isAr ? an.titleAr : an.titleEn}
                  </td>
                  <td>{isAr ? an.categoryAr : an.categoryEn}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {an.impactValue}
                  </td>
                  <td>
                    <span className={`severity-tag ${an.severity}`}>
                      {an.severity}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {(an.confidenceScore * 100).toFixed(1)}%
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                    {an.detectedAt}
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>
                      {isAr ? an.statusAr : an.statusEn}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={onNavigateDetail}
                      style={{
                        fontSize: '11px',
                        color: 'var(--accent-light)',
                        fontWeight: 700,
                        textDecoration: 'underline'
                      }}
                    >
                      {isAr ? 'فحص الأدلة' : 'Inspect'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
