// MIKHLAFI LABS — Prototype Domain Types
export type ThemeMode = 'dark' | 'light';
export type LocaleMode = 'ar' | 'en';
export type ViewMode = 'dashboard' | 'intelligence-detail';
export type ViewportMode = 'desktop' | 'mobile';

export interface KpiItem {
  id: string;
  titleAr: string;
  titleEn: string;
  value: string;
  delta: string;
  isPositive: boolean;
  neutralInterpretation?: boolean;
  unitAr: string;
  unitEn: string;
  sourceAr: string;
  sourceEn: string;
  qualityStatus: 'fresh' | 'stale' | 'partial';
}

export interface AnomalyRecord {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  impactValue: string;
  severity: 'high' | 'medium' | 'low';
  confidenceScore: number;
  detectedAt: string;
  statusAr: string;
  statusEn: string;
}
