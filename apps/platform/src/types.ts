// MIKHLAFI LABS — Master Domain & UI Types
export type ThemeMode = 'dark' | 'light';
export type LocaleMode = 'ar' | 'en';
export type ViewportMode = 'desktop' | 'mobile';

export type AppRoute =
  | 'website'
  | 'platform-overview'
  | 'platform-finance'
  | 'platform-decisions'
  | 'platform-risk'
  | 'platform-projects'
  | 'platform-suppliers'
  | 'platform-customers'
  | 'platform-data-quality'
  | 'platform-assistant'
  | 'platform-reports'
  | 'platform-alerts'
  | 'platform-integrations'
  | 'platform-workflows'
  | 'platform-organization'
  | 'platform-billing'
  | 'platform-settings';

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
  routeKey: AppRoute;
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

export interface FaqItem {
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
}

// Module-Specific Interfaces
export interface DecisionItem {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  impactAr: string;
  impactEn: string;
  financialImpact: string;
  priority: 'critical' | 'high' | 'medium';
  assignedTo: string;
  statusAr: string;
  statusEn: string;
  deadline: string;
}

export interface RiskItem {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  probability: 'high' | 'medium' | 'low';
  severity: 'critical' | 'high' | 'medium';
  impactSAR: string;
  mitigationPlanAr: string;
  mitigationPlanEn: string;
}

export interface ProjectItem {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  plannedProgress: number;
  actualProgress: number;
  budgetTotal: string;
  varianceSAR: string;
  health: 'on-track' | 'at-risk' | 'delayed';
  changeOrdersCount: number;
}

export interface SupplierItem {
  id: string;
  nameAr: string;
  nameEn: string;
  ratingScore: number;
  priceCreepRate: string;
  onTimeDeliveryRate: string;
  activeContractsVal: string;
  riskStatus: 'critical' | 'moderate' | 'optimal';
}

export interface CustomerRiskItem {
  id: string;
  accountNameAr: string;
  accountNameEn: string;
  volumeTrend: string;
  renewalDate: string;
  churnProbability: number;
  revenueAtRisk: string;
}

export interface DataQualityCheck {
  id: string;
  ruleName: string;
  sourceSystem: string;
  complianceRate: number;
  unmappedRecords: number;
  status: 'passed' | 'warning' | 'failed';
  lastChecked: string;
}

export interface IntegrationSource {
  id: string;
  name: string;
  category: string;
  status: 'connected' | 'syncing' | 'idle' | 'failed';
  recordsSynced: string;
  lastSync: string;
  authType: string;
}

export interface AuditLogItem {
  id: string;
  actor: string;
  actionAr: string;
  actionEn: string;
  targetRecord: string;
  timestamp: string;
  hash: string;
}
