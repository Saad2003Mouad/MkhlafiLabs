// MIKHLAFI LABS — Master Domain & UI Types
export type ThemeMode = 'dark' | 'light';
export type LocaleMode = 'ar' | 'en';
export type AppRoute = 'website' | 'platform' | 'detail';
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

export interface SolutionItem {
  id: string;
  num: string;
  titleAr: string;
  titleEn: string;
  outcomeAr: string;
  outcomeEn: string;
  badgeAr: string;
  badgeEn: string;
  icon: string;
}

export interface ChallengeItem {
  num: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
}

export interface PricingPackage {
  id: string;
  nameAr: string;
  nameEn: string;
  subtitleAr: string;
  subtitleEn: string;
  badgeAr: string;
  badgeEn: string;
  popular?: boolean;
  servicesCount: number;
  featuresAr: string[];
  featuresEn: string[];
}

export interface WorkflowStep {
  index: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  tags: string[];
}
