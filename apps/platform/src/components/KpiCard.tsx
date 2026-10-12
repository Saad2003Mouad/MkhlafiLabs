import React from 'react';
import { KpiItem, LocaleMode } from '../types';

interface KpiCardProps {
  item: KpiItem;
  locale: LocaleMode;
}

export const KpiCard: React.FC<KpiCardProps> = ({ item, locale }) => {
  const isAr = locale === 'ar';
  const title = isAr ? item.titleAr : item.titleEn;
  const unit = isAr ? item.unitAr : item.unitEn;
  const source = isAr ? item.sourceAr : item.sourceEn;

  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
          {item.qualityStatus === 'fresh' ? (isAr ? 'بيانات حية' : 'LIVE DATA') : (isAr ? 'استرشادي' : 'DEMO')}
        </span>
      </div>

      <div className="kpi-body">
        <span className="kpi-val">{item.value}</span>
        <span className="kpi-unit">{unit}</span>
      </div>

      <div className="kpi-footer">
        <span className={`kpi-delta ${item.isPositive ? 'pos' : 'neg'}`}>
          {item.isPositive ? '↑' : '↓'} {item.delta}
        </span>
        <span className="kpi-source">{source}</span>
      </div>
    </div>
  );
};
