import React from 'react';
import { KpiItem, LocaleMode, AnomalyRecord } from '../types';
import { KpiCard } from './KpiCard';
import { ChartPreview } from './ChartPreview';

interface ExecutiveDashboardProps {
  locale: LocaleMode;
  onNavigateDetail: () => void;
}

const mockKpis: KpiItem[] = [
  {
    id: 'kpi-1',
    titleAr: 'مؤشر الكفاءة التشغيلية',
    titleEn: 'Operational Efficiency Index',
    value: '94.2%',
    delta: '+3.8%',
    isPositive: true,
    unitAr: 'معدل',
    unitEn: 'Rate',
    sourceAr: 'تحليل الأنشطة التشغيلية',
    sourceEn: 'Operations Stream',
    qualityStatus: 'fresh'
  },
  {
    id: 'kpi-2',
    titleAr: 'حجم التدفقات النقدية الصافية',
    titleEn: 'Net Cash Flow Velocity',
    value: '2.84M',
    delta: '+12.4%',
    isPositive: true,
    unitAr: 'SAR (افتراضي)',
    unitEn: 'Units',
    sourceAr: 'دفتر الأستاذ والمدفوعات',
    sourceEn: 'General Ledger',
    qualityStatus: 'fresh'
  },
  {
    id: 'kpi-3',
    titleAr: 'الانحرافات المرصودة النشطة',
    titleEn: 'Active Detected Anomalies',
    value: '7',
    delta: '-2',
    isPositive: true, // Lower anomalies is positive
    unitAr: 'حالات فحص',
    unitEn: 'Cases',
    sourceAr: 'محرك كشف الشذوذ المالي',
    sourceEn: 'Anomaly Engine',
    qualityStatus: 'fresh'
  },
  {
    id: 'kpi-4',
    titleAr: 'معدل مخاطر الموردين الكلي',
    titleEn: 'Aggregate Supplier Risk',
    value: '18.5%',
    delta: '+1.2%',
    isPositive: false, // Higher risk is negative
    unitAr: 'نسبة مخاطرة',
    unitEn: 'Risk Index',
    sourceAr: 'سلاسل الإمداد ومواعيد التسليم',
    sourceEn: 'Supply Ingestion',
    qualityStatus: 'fresh'
  }
];

const mockRecentAnomalies: AnomalyRecord[] = [
  {
    id: 'an-1',
    code: 'ANOM-2026-081',
    titleAr: 'تكرار صرف مدفوعات لمستفيد واحد خلال 48 ساعة',
    titleEn: 'Duplicate payment disbursement pattern within 48h',
    categoryAr: 'تسرب مالي',
    categoryEn: 'Financial Leakage',
    impactValue: '48,500',
    severity: 'high',
    confidenceScore: 0.94,
    detectedAt: '2026-10-12 02:15',
    statusAr: 'قيد الفحص',
    statusEn: 'Under Review'
  },
  {
    id: 'an-2',
    code: 'ANOM-2026-079',
    titleAr: 'انحراف تسعير عقود توريد مقارنة بمتوسط السوق',
    titleEn: 'Procurement variance above contractual baseline',
    categoryAr: 'كفاءة المشتريات',
    categoryEn: 'Procurement',
    impactValue: '124,000',
    severity: 'medium',
    confidenceScore: 0.88,
    detectedAt: '2026-10-11 18:30',
    statusAr: 'مؤكد جزئياً',
    statusEn: 'Partially Verified'
  },
  {
    id: 'an-3',
    code: 'ANOM-2026-075',
    titleAr: 'تأخر استلام بضائع يؤثر على تسليم 3 مشاريع',
    titleEn: 'Milestone delay impact on dependent project delivery',
    categoryAr: 'سلاسل الإمداد',
    categoryEn: 'Supply Chain',
    impactValue: 'N/A',
    severity: 'low',
    confidenceScore: 0.79,
    detectedAt: '2026-10-11 11:20',
    statusAr: 'مغلق ومصحح',
    statusEn: 'Resolved'
  }
];

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ locale, onNavigateDetail }) => {
  const isAr = locale === 'ar';

  return (
    <div className="content-scroll">
      {/* Page Intro */}
      <div className="page-intro">
        <div>
          <h1 className="page-title">{isAr ? 'نظرة عامة على مساحة عمل المنصة' : 'Executive Intelligence Overview'}</h1>
          <p className="page-desc">
            {isAr
              ? 'مراقبة حية وشاملة لأداء المؤسسة، كشف الانحرافات المالية والتشغيلية، ودعم اتخاذ القرارات الاستراتيجية.'
              : 'Holistic business monitoring, early operational anomaly detection, and unified decision intelligence.'}
          </p>
        </div>
        <div className="period-pill">
          <span>📅</span>
          <span>{isAr ? 'الربع المالي الحالي (Q4 2026)' : 'Current Quarter (Q4 2026)'}</span>
        </div>
      </div>

      {/* Honest Empty / Demo Disclaimer Alert */}
      <div className="honest-alert">
        <span style={{ fontSize: '18px' }}>ℹ️</span>
        <div>
          <strong>{isAr ? 'وضع العرض الاسترشادي المدار (Demo Mode):' : 'Controlled Demo Environment:'}</strong>{' '}
          {isAr
            ? 'البيانات المعروضة أدناه هي بيانات نموذجية استرشادية لاختبار وتدقيق تجربة الاستخدام ونظام التصميم قبل ربط قاعدة بيانات PostgreSQL.'
            : 'Metrics displayed are demonstration benchmarks designed to evaluate UI responsiveness and the design system prior to live PostgreSQL connection.'}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {mockKpis.map((kpi) => (
          <KpiCard key={kpi.id} item={kpi} locale={locale} />
        ))}
      </div>

      {/* Bento Grid Analytics Area */}
      <div className="bento-grid">
        {/* Trend Chart Panel */}
        <div className="content-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">{isAr ? 'منحنى مؤشر الاستقرار التشغيلي' : 'Operational Stability Index Trend'}</h2>
              <span className="panel-subtitle">
                {isAr ? 'تطور الأداء المجمع ومعدل تلافي المخاطر الشهرية' : 'Aggregate operational performance vs mitigation baselines'}
              </span>
            </div>
            <button
              onClick={onNavigateDetail}
              style={{
                fontSize: '12px',
                color: 'var(--accent-light)',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
            >
              {isAr ? 'التفاصيل والتدقيق ←' : 'Deep-Dive Details →'}
            </button>
          </div>

          <ChartPreview locale={locale} />
        </div>

        {/* Priority Decisions / Action Summary */}
        <div className="content-panel">
          <div className="panel-header">
            <h2 className="panel-title">{isAr ? 'التوصيات التنفيذية العاجلة' : 'Executive Action Priorities'}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', borderLeft: isAr ? 'none' : '3px solid var(--status-danger)', borderRight: isAr ? '3px solid var(--status-danger)' : 'none' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '2px' }}>
                {isAr ? 'مراجعة أمر الصرف رقم #482' : 'Audit Disbursement Order #482'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {isAr ? 'اشتباه في تكرار المطالبة مع فرع الرياض' : 'Suspected duplicate invoice matched across Riyadh branch'}
              </div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', borderLeft: isAr ? 'none' : '3px solid var(--status-warning)', borderRight: isAr ? '3px solid var(--status-warning)' : 'none' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '2px' }}>
                {isAr ? 'تجديد عقود الموردين الرئيسيين' : 'Primary Vendor Contract Renewal'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {isAr ? 'فرصة تفاوض لتخفيض 8% بناءً على حجم التوريد السنوي' : '8% volume discount renegotiation window identified'}
              </div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', borderLeft: isAr ? 'none' : '3px solid var(--status-info)', borderRight: isAr ? '3px solid var(--status-info)' : 'none' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '2px' }}>
                {isAr ? 'اكتمال مزامنة مصادر بيانات المستودعات' : 'Warehouse Data Sync Verified'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {isAr ? 'تم استيراد 1,420 حركة مخزون دون أي انحرافات' : '1,420 transactions processed with 100% integrity score'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anomalies Table Panel */}
      <div className="content-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">{isAr ? 'أحدث الانحرافات المرصودة للتدقيق' : 'Recent Detected Anomalies'}</h2>
            <span className="panel-subtitle">
              {isAr ? 'قائمة الحالات التي تتطلب مراجعة من الإدارة المالية والتشغيلية' : 'Audit logs flagged by algorithmic verification rules'}
            </span>
          </div>
          <button
            onClick={onNavigateDetail}
            className="ctrl-btn"
            style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
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
                <th>{isAr ? 'عنوان الانحراف' : 'Anomaly Description'}</th>
                <th>{isAr ? 'التصنيف' : 'Category'}</th>
                <th>{isAr ? 'الأثر المقدر' : 'Estimated Impact'}</th>
                <th>{isAr ? 'مستوى الخطورة' : 'Severity'}</th>
                <th>{isAr ? 'نسبة الثقة' : 'Confidence'}</th>
                <th>{isAr ? 'وقت الرصد' : 'Detected At'}</th>
                <th>{isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {mockRecentAnomalies.map((an) => (
                <tr key={an.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{an.code}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {isAr ? an.titleAr : an.titleEn}
                  </td>
                  <td>{isAr ? an.categoryAr : an.categoryEn}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{an.impactValue}</td>
                  <td>
                    <span className={`severity-tag ${an.severity}`}>
                      {an.severity}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {(an.confidenceScore * 100).toFixed(0)}%
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{an.detectedAt}</td>
                  <td>{isAr ? an.statusAr : an.statusEn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
