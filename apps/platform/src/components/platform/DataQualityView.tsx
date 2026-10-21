// MIKHLAFI LABS — Data Quality & Governance Intelligence
// All audits are loaded exclusively from the authenticated backend.
// No simulated or demonstration records are ever rendered.

import React, { useState, useEffect, useCallback } from 'react';
import { LocaleMode } from '../../types';
import { IconDataQuality, IconCheck, IconRefresh, IconRisk } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../common/EmptyState';
import { PageHeader } from '../common/PageHeader';

interface DataQualityViewProps {
  locale: LocaleMode;
}

interface QualityAuditRecord {
  id: string;
  check_code: string;
  rule_name: string;
  source_system: string;
  compliance_rate: string | number;
  unmapped_records: string | number;
  status: string;
  last_checked: string;
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, openAuthModal } = useAuth();
  const [audits, setAudits] = useState<QualityAuditRecord[]>([]);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'attention'>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAudits = useCallback(async () => {
    if (!isAuthenticated) {
      setAudits([]);
      setOverallScore(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDataQualityAudits();
      const rows = Array.isArray(res.audits) ? res.audits : [];
      setAudits(rows);
      setOverallScore(rows.length > 0 ? Number(res.overallComplianceScore) : null);
    } catch (err: any) {
      setAudits([]);
      setOverallScore(null);
      setError(err.message || (isAr ? 'تعذّر تحميل نتائج تدقيق جودة البيانات.' : 'Unable to load data quality audits.'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAr]);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  const handleRunScan = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setIsScanning(true);
    try {
      const res = await api.runDataQualityScan();
      const rows = Array.isArray(res.audits) ? res.audits : [];
      setError(null);
      setNotice({
        type: 'success',
        message: isAr
          ? `اكتمل فحص سلامة البيانات وتسجيل حدث التدقيق.${rows.length > 0 ? ` متوسط الامتثال المحسوب: ${Number(res.overallComplianceScore)}%.` : ''}`
          : `Data integrity scan complete and audit event recorded.${rows.length > 0 ? ` Computed average compliance: ${Number(res.overallComplianceScore)}%.` : ''}`
      });
      await fetchAudits();
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || (isAr ? 'تعذّر تنفيذ الفحص.' : 'Unable to run the scan.') });
    } finally {
      setIsScanning(false);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const isPassed = (a: QualityAuditRecord) => (a.status || '').toLowerCase() === 'passed';

  const filteredAudits = audits.filter((a) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'passed') return isPassed(a);
    return !isPassed(a);
  });

  const counts = {
    all: audits.length,
    passed: audits.filter(isPassed).length,
    attention: audits.filter((a) => !isPassed(a)).length
  };

  return (
    <div className="platform-page-container">
      <PageHeader
        locale={locale}
        icon={<IconDataQuality size={22} />}
        breadcrumb={[isAr ? 'المنصة' : 'Platform', isAr ? 'محركات الذكاء' : 'Intelligence Suite']}
        title={isAr ? 'جودة البيانات وحوكمة السجلات' : 'Data Quality & Governance Intelligence'}
        subtitle={
          isAr
            ? 'فحص اكتمال القيود والسجلات ورصد الحقول الشاغرة وعدم تطابق المصادر عبر أنظمة مؤسستك، مع امتثال محسوب من نتائج التدقيق الفعلية.'
            : 'Auditing record completeness, flagging missing fields and cross-system mismatches across your organization’s sources, with compliance computed from actual audit results.'
        }
        action={
          <button onClick={handleRunScan} disabled={isScanning} className="ml-btn ml-btn--primary">
            <IconRefresh size={14} className={isScanning ? 'vb-spin' : undefined} />
            {isScanning
              ? (isAr ? 'جارِ الفحص...' : 'Scanning...')
              : (isAr ? 'تشغيل فحص سلامة البيانات' : 'Run Integrity Scan')}
          </button>
        }
      />

      {notice && (
        <div className={`alert-feedback-banner ${notice.type === 'error' ? 'error' : 'success'}`}>
          {notice.type === 'error' ? <IconRisk size={16} /> : <IconCheck size={16} />}
          <span>{notice.message}</span>
        </div>
      )}

          {!isAuthenticated ? (
            <EmptyState
              icon={<IconDataQuality size={30} />}
              title={isAr ? 'سجّل الدخول لعرض نتائج تدقيق البيانات' : 'Sign in to view your data quality audits'}
              description={
                isAr
                  ? 'تُسترجَع نتائج تدقيق جودة البيانات ومؤشرات الامتثال مباشرة من مساحة عمل مؤسستك بعد تسجيل الدخول.'
                  : 'Data quality audit results and compliance metrics are loaded directly from your organization workspace after signing in.'
              }
              action={
                <button onClick={openAuthModal} className="ml-btn ml-btn--primary">
                  {isAr ? 'تسجيل الدخول' : 'Sign In'}
                </button>
              }
            />
          ) : (
            <>
              <div className="stat-grid">
                <div className="stat-tile">
                  <div className="stat-tile__label">{isAr ? 'متوسط الامتثال العام' : 'Overall Compliance'}</div>
                  <div className="stat-tile__value">
                    {overallScore !== null ? `${overallScore}%` : '—'}
                  </div>
                  <div className="stat-tile__hint">
                    {overallScore !== null
                      ? (isAr ? 'محسوب من نتائج التدقيق الفعلية' : 'Computed from actual audit results')
                      : (isAr ? 'لا توجد نتائج تدقيق بعد' : 'No audit results yet')}
                  </div>
                </div>
                <div className="stat-tile">
                  <div className="stat-tile__label">{isAr ? 'قواعد التدقيق' : 'Audit Rules'}</div>
                  <div className="stat-tile__value">{counts.all}</div>
                  <div className="stat-tile__hint">
                    {isAr ? 'قواعد مسجلة لهذه المؤسسة' : 'Rules registered for this organization'}
                  </div>
                </div>
                <div className="stat-tile">
                  <div className="stat-tile__label">{isAr ? 'تحتاج مراجعة' : 'Need Attention'}</div>
                  <div className="stat-tile__value">{counts.attention}</div>
                  <div className="stat-tile__hint">
                    {isAr ? 'نتائج غير مطابقة للقاعدة' : 'Results not passing their rule'}
                  </div>
                </div>
              </div>

              {error ? (
                <EmptyState
                  icon={<IconRisk size={30} />}
                  title={isAr ? 'تعذّر تحميل نتائج التدقيق' : 'Unable to load audit results'}
                  description={error}
                  action={
                    <button onClick={fetchAudits} className="ml-btn ml-btn--primary">
                      {isAr ? 'إعادة المحاولة' : 'Retry'}
                    </button>
                  }
                />
              ) : (
                <>
                  <div className="page-filter-bar">
                    <div className="filter-group">
                      <span className="filter-label">{isAr ? 'الحالة:' : 'Status:'}</span>
                      <button onClick={() => setFilterStatus('all')} className={`filter-chip ${filterStatus === 'all' ? 'active' : ''}`}>
                        {isAr ? `الكل (${counts.all})` : `All (${counts.all})`}
                      </button>
                      <button onClick={() => setFilterStatus('passed')} className={`filter-chip ${filterStatus === 'passed' ? 'active' : ''}`}>
                        <span className="dot high" style={{ background: 'var(--status-success)' }} />
                        {isAr ? `مطابق (${counts.passed})` : `Passed (${counts.passed})`}
                      </button>
                      <button onClick={() => setFilterStatus('attention')} className={`filter-chip ${filterStatus === 'attention' ? 'active' : ''}`}>
                        <span className="dot critical" />
                        {isAr ? `يحتاج مراجعة (${counts.attention})` : `Needs Attention (${counts.attention})`}
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="skeleton-grid">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="skeleton-card" />
                      ))}
                    </div>
                  ) : filteredAudits.length === 0 ? (
                    <EmptyState
                      icon={<IconDataQuality size={30} />}
                      title={isAr ? 'لا توجد نتائج تدقيق جودة بيانات' : 'No data quality audits yet'}
                      description={
                        isAr
                          ? 'شغّل فحص السلامة لقياس اكتمال السجلات وعدم تطابق المصادر عبر أنظمة مؤسستك، وستظهر نتائج قواعد التدقيق هنا مباشرة من قاعدة البيانات.'
                          : 'Run the integrity scan to measure record completeness and source mismatches across your organization’s systems. Rule results will appear here directly from the database.'
                      }
                      action={
                        <button onClick={handleRunScan} disabled={isScanning} className="ml-btn ml-btn--primary">
                          <IconRefresh size={14} className={isScanning ? 'vb-spin' : undefined} />
                          {isScanning
                            ? (isAr ? 'جارِ الفحص...' : 'Scanning...')
                            : (isAr ? 'تشغيل فحص السلامة' : 'Run Integrity Scan')}
                        </button>
                      }
                    />
                  ) : (
                    <div className="record-list">
                      {filteredAudits.map((a) => {
                        const passed = isPassed(a);
                        const compliance = Number(a.compliance_rate);
                        const unmapped = Number(a.unmapped_records) || 0;

                        return (
                          <div key={a.id} className="record-row">
                            <span className="vb-record-icon" aria-hidden="true">
                              <IconDataQuality size={18} />
                            </span>

                            <div className="record-row__main">
                              <div className="vb-record-title-row">
                                <span className="record-row__title">{a.rule_name}</span>
                                <span className={`vb-sev ${passed ? 'vb-sev--success' : 'vb-sev--warning'}`}>
                                  {passed ? (isAr ? 'مطابق' : 'Passed') : (isAr ? 'يحتاج مراجعة' : 'Needs Attention')}
                                </span>
                                <span className="ml-badge">{a.check_code}</span>
                              </div>
                              <div className="record-row__meta">
                                <span className="vb-metric">
                                  {isAr ? 'المصدر:' : 'Source:'} {a.source_system || '—'}
                                </span>
                                <span className="vb-metric">
                                  {isAr ? 'قيود غير مطابقة:' : 'Unmapped Records:'} {unmapped.toLocaleString()}
                                </span>
                                <span className="vb-metric">
                                  {isAr ? 'آخر فحص:' : 'Last Checked:'} {a.last_checked || '—'}
                                </span>
                              </div>
                            </div>

                            <div className="vb-record-stats">
                              <span className="vb-stat">
                                <span className="k">{isAr ? 'معدل الامتثال' : 'Compliance Rate'}</span>
                                <span className={`v ${passed ? 'is-success' : 'is-warning'}`}>
                                  {Number.isFinite(compliance) ? `${compliance}%` : '—'}
                                </span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          )}
    </div>
  );
};
