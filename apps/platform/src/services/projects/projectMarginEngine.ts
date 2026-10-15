// MIKHLAFI LABS — Enterprise Project Margin & Contract Assurance Engine (Service 04)
// Deterministic Algorithms: Earned Value Management (EVM) Telemetry (CPI, SPI, EAC, VAC),
// Variation Order (VO) Leakage Settlement Optimizer, Subcontractor Progress Claim Reconciler,
// and FIDIC-Compliant Executive Board Project Governance Dossiers.

export type ContractType = 'LUMP_SUM_TURNKEY' | 'UNIT_RATE_EPC' | 'COST_PLUS_GMP';
export type ProjectHealth = 'HEALTHY' | 'AT_RISK' | 'CRITICAL';

export interface ProjectContractRecord {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  clientNameAr: string;
  clientNameEn: string;
  contractValueSAR: number;
  budgetCostSAR: number;
  baselineMarginSAR: number;
  baselineMarginPct: number;
  currentIncurredCostSAR: number;
  billedMilestonesSAR: number;
  completionPercentage: number; // 0 - 100%
  // EVM Metrics
  plannedValueSAR: number; // PV
  earnedValueSAR: number;  // EV = contractValueSAR * (completion / 100)
  actualCostSAR: number;   // AC
  costPerformanceIndex: number; // CPI = EV / AC
  schedulePerformanceIndex: number; // SPI = EV / PV
  estimateAtCompletionSAR: number; // EAC = budgetCost / CPI
  forecastedFinalMarginSAR: number;
  forecastedFinalMarginPct: number;
  marginVarianceSAR: number; // forecasted - baseline
  unbilledVariationOrdersSAR: number;
  disputedClaimsSAR: number;
  healthStatus: ProjectHealth;
  assignedDirector: string;
  contractType: ContractType;
  statutoryRegulation: string;
  cryptographicSignHash: string;
}

export interface PortfolioProjectMetrics {
  totalContractValueSAR: number;
  totalBudgetCostSAR: number;
  totalActualCostSAR: number;
  totalBilledSAR: number;
  totalBaselineMarginSAR: number;
  totalForecastedMarginSAR: number;
  netMarginVarianceSAR: number;
  portfolioBlendedMarginPct: number;
  portfolioCpi: number;
  portfolioSpi: number;
  totalUnbilledVariationOrdersSAR: number;
  totalDisputedClaimsSAR: number;
  criticalProjectCount: number;
  atRiskProjectCount: number;
  healthyProjectCount: number;
}

function computeProjectHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const hex2 = Math.abs(hash * 47).toString(16).padStart(8, '0');
  return `PRJ-${hex.toUpperCase()}-${hex2.toUpperCase()}`;
}

// ── Realistic Pre-Seeded Saudi Enterprise Project Scenarios ───────────────────

export const PRESET_PROJECT_SCENARIOS: Record<
  string,
  {
    nameAr: string;
    nameEn: string;
    industryAr: string;
    industryEn: string;
    descriptionAr: string;
    descriptionEn: string;
    projects: ProjectContractRecord[];
  }
> = {
  infrastructure: {
    nameAr: 'مشاريع البنية التحتية والمدن الكبرى (Giga-Projects)',
    nameEn: 'Giga-Projects & Mega-Infrastructure Portfolio',
    industryAr: 'المقاولات الكبرى والبنية التحتية والأنفاق',
    industryEn: 'Infrastructure, Civil & Transportation',
    descriptionAr: 'محفظة مشاريع إنشائية بقيمة 240 مليون ر.س ترتبط بمشاريع رؤية 2030 وتتطلب تدقيقاً صارماً لأوامر التغيير ونسب الإنجاز.',
    descriptionEn: 'Major 240M SAR infrastructure portfolio connected to Vision 2030 gigaprojects facing variation order slippage and claim delays.',
    projects: [
      {
        id: 'PRJ-INF-01',
        code: 'PRJ-401',
        nameAr: 'محطة مترو الرياض المركزية — حزمة الأعمال الكهروميكانيكية والتشطيبات',
        nameEn: 'Riyadh Central Metro Station MEP & Architectural Finishes',
        clientNameAr: 'الهيئة الملكية لمدينة الرياض',
        clientNameEn: 'Royal Commission for Riyadh City',
        contractValueSAR: 84000000,
        budgetCostSAR: 68880000,
        baselineMarginSAR: 15120000,
        baselineMarginPct: 18.0,
        currentIncurredCostSAR: 49500000,
        billedMilestonesSAR: 52000000,
        completionPercentage: 68,
        plannedValueSAR: 60480000,
        earnedValueSAR: 57120000,
        actualCostSAR: 49500000,
        costPerformanceIndex: 1.15,
        schedulePerformanceIndex: 0.94,
        estimateAtCompletionSAR: 59895000,
        forecastedFinalMarginSAR: 24105000,
        forecastedFinalMarginPct: 28.7,
        marginVarianceSAR: 8985000,
        unbilledVariationOrdersSAR: 4200000,
        disputedClaimsSAR: 1850000,
        healthStatus: 'AT_RISK',
        assignedDirector: 'م. ناصر الدوسري - مدير المشروع العام',
        contractType: 'UNIT_RATE_EPC',
        statutoryRegulation: 'عقد فيديك الهندسي (FIDIC Red Book) / نظام المنافسات الحكومية',
        cryptographicSignHash: computeProjectHash('PRJ-INF-01-METRO-MEP')
      },
      {
        id: 'PRJ-INF-02',
        code: 'PRJ-402',
        nameAr: 'شبكة المياه المعالجة ونفق الخدمات الموحد — مشروع البحر الأحمر',
        nameEn: 'Treated Sewage Effluent & Utility Tunnel — Red Sea Global',
        clientNameAr: 'شركة البحر الأحمر الدولية',
        clientNameEn: 'Red Sea Global (RSG)',
        contractValueSAR: 62000000,
        budgetCostSAR: 50840000,
        baselineMarginSAR: 11160000,
        baselineMarginPct: 18.0,
        currentIncurredCostSAR: 46200000,
        billedMilestonesSAR: 38400000,
        completionPercentage: 74,
        plannedValueSAR: 49600000,
        earnedValueSAR: 45880000,
        actualCostSAR: 46200000,
        costPerformanceIndex: 0.99,
        schedulePerformanceIndex: 0.92,
        estimateAtCompletionSAR: 51350000,
        forecastedFinalMarginSAR: 10650000,
        forecastedFinalMarginPct: 17.2,
        marginVarianceSAR: -510000,
        unbilledVariationOrdersSAR: 3600000,
        disputedClaimsSAR: 2400000,
        healthStatus: 'HEALTHY',
        assignedDirector: 'م. فيصل الشمري - مدير مشاريع الساحل الغربي',
        contractType: 'LUMP_SUM_TURNKEY',
        statutoryRegulation: 'عقد الفيديك الفضي (FIDIC Silver Book) EPC Turnkey',
        cryptographicSignHash: computeProjectHash('PRJ-INF-02-RED-SEA-TUNNEL')
      },
      {
        id: 'PRJ-INF-03',
        code: 'PRJ-403',
        nameAr: 'مجمع المستودعات اللوجستية الذكية — أوكساچون نيوم (OXAGON)',
        nameEn: 'Smart Automated Logistics Hub — OXAGON NEOM',
        clientNameAr: 'شركة نيوم (NEOM)',
        clientNameEn: 'NEOM Company',
        contractValueSAR: 54000000,
        budgetCostSAR: 44820000,
        baselineMarginSAR: 9180000,
        baselineMarginPct: 17.0,
        currentIncurredCostSAR: 36800000,
        billedMilestonesSAR: 29500000,
        completionPercentage: 55,
        plannedValueSAR: 37800000,
        earnedValueSAR: 29700000,
        actualCostSAR: 36800000,
        costPerformanceIndex: 0.81,
        schedulePerformanceIndex: 0.79,
        estimateAtCompletionSAR: 55333000,
        forecastedFinalMarginSAR: -1333000,
        forecastedFinalMarginPct: -2.5,
        marginVarianceSAR: -10513000,
        unbilledVariationOrdersSAR: 5800000,
        disputedClaimsSAR: 3900000,
        healthStatus: 'CRITICAL',
        assignedDirector: 'م. عبدالمجيد الزهراني - كبير مدراء المشاريع',
        contractType: 'COST_PLUS_GMP',
        statutoryRegulation: 'لوائح العقود الإنشائية لمدينة نيوم / معايير PMBOK الدولية',
        cryptographicSignHash: computeProjectHash('PRJ-INF-03-NEOM-OXAGON')
      },
      {
        id: 'PRJ-INF-04',
        code: 'PRJ-404',
        nameAr: 'خط نقل المياه المعالجة الجبيل - الدمام (المرحلة الثالثة)',
        nameEn: 'Jubail-Dammam Water Transmission Pipeline Phase III',
        clientNameAr: 'المؤسسة العامة للري وشركة نقل وتقنيات المياه',
        clientNameEn: 'Water Transmission & Technologies Co. (WTTCO)',
        contractValueSAR: 40000000,
        budgetCostSAR: 33200000,
        baselineMarginSAR: 6800000,
        baselineMarginPct: 17.0,
        currentIncurredCostSAR: 28100000,
        billedMilestonesSAR: 32000000,
        completionPercentage: 82,
        plannedValueSAR: 32800000,
        earnedValueSAR: 32800000,
        actualCostSAR: 28100000,
        costPerformanceIndex: 1.17,
        schedulePerformanceIndex: 1.00,
        estimateAtCompletionSAR: 28376000,
        forecastedFinalMarginSAR: 11624000,
        forecastedFinalMarginPct: 29.1,
        marginVarianceSAR: 4824000,
        unbilledVariationOrdersSAR: 1200000,
        disputedClaimsSAR: 650000,
        healthStatus: 'HEALTHY',
        assignedDirector: 'م. سلطان العتيبي - مدير قطاع خطوط الأنابيب',
        contractType: 'UNIT_RATE_EPC',
        statutoryRegulation: 'نظام المنافسات والمشتريات الحكومية السعودي',
        cryptographicSignHash: computeProjectHash('PRJ-INF-04-WTTCO-PIPELINE')
      }
    ]
  },

  commercial: {
    nameAr: 'المجمعات التجارية والضيافة (Commercial & Hospitality)',
    nameEn: 'Commercial Malls & Mixed-Use Developments',
    industryAr: 'التطوير العقاري والمراكز التجارية والفنادق',
    industryEn: 'Commercial Real Estate & Mixed-Use',
    descriptionAr: 'محفظة مشاريع مجمعات تجارية وفندقية بقيمة 95 مليون ر.س تعاني من تعديلات المستأجرين وزيادة تكاليف التشطيبات.',
    descriptionEn: 'Commercial hospitality & lifestyle retail developments valued at 95M SAR battling tenant fit-out change order scope creep.',
    projects: [
      {
        id: 'PRJ-COM-01',
        code: 'PRJ-501',
        nameAr: 'توسعة وتطوير مجمع بوليفارد الرياض — حزمة المطاعم الفاخرة',
        nameEn: 'Riyadh Boulevard Expansion — Luxury Dining Zone',
        clientNameAr: 'شركة صروح التطوير العقاري',
        clientNameEn: 'Sorouh Real Estate Development Co.',
        contractValueSAR: 48000000,
        budgetCostSAR: 38880000,
        baselineMarginSAR: 9120000,
        baselineMarginPct: 19.0,
        currentIncurredCostSAR: 34200000,
        billedMilestonesSAR: 31000000,
        completionPercentage: 76,
        plannedValueSAR: 38400000,
        earnedValueSAR: 36480000,
        actualCostSAR: 34200000,
        costPerformanceIndex: 1.07,
        schedulePerformanceIndex: 0.95,
        estimateAtCompletionSAR: 36336000,
        forecastedFinalMarginSAR: 11664000,
        forecastedFinalMarginPct: 24.3,
        marginVarianceSAR: 2544000,
        unbilledVariationOrdersSAR: 2800000,
        disputedClaimsSAR: 1200000,
        healthStatus: 'HEALTHY',
        assignedDirector: 'م. خالد التميمي - مدير مشاريع التطوير التجاري',
        contractType: 'LUMP_SUM_TURNKEY',
        statutoryRegulation: 'عقد المقاولات التجاري الموحد / كود البناء السعودي (SBC)',
        cryptographicSignHash: computeProjectHash('PRJ-COM-01-BLVD-RETAIL')
      },
      {
        id: 'PRJ-COM-02',
        code: 'PRJ-502',
        nameAr: 'فندق واجهة الخبر البحرية (5 نجوم) — أعمال الواجهات الزجاجية والإنارة',
        nameEn: 'Khobar Waterfront 5-Star Hotel Facade & Lighting Package',
        clientNameAr: 'مجموعة الأفق القابضة للضيافة',
        clientNameEn: 'Horizon Hospitality Holding Group',
        contractValueSAR: 47000000,
        budgetCostSAR: 38540000,
        baselineMarginSAR: 8460000,
        baselineMarginPct: 18.0,
        currentIncurredCostSAR: 31800000,
        billedMilestonesSAR: 24500000,
        completionPercentage: 58,
        plannedValueSAR: 32900000,
        earnedValueSAR: 27260000,
        actualCostSAR: 31800000,
        costPerformanceIndex: 0.86,
        schedulePerformanceIndex: 0.83,
        estimateAtCompletionSAR: 44813000,
        forecastedFinalMarginSAR: 2187000,
        forecastedFinalMarginPct: 4.7,
        marginVarianceSAR: -6273000,
        unbilledVariationOrdersSAR: 4100000,
        disputedClaimsSAR: 2900000,
        healthStatus: 'CRITICAL',
        assignedDirector: 'م. إبراهيم الخالدي - مدير مشاريع المنطقة الشرقية',
        contractType: 'UNIT_RATE_EPC',
        statutoryRegulation: 'معايير تصنيف المنشآت الفندقية لوزارة السياحة',
        cryptographicSignHash: computeProjectHash('PRJ-COM-02-KHOBAR-HOTEL')
      }
    ]
  },

  industrial: {
    nameAr: 'عقود المصانع ومشاريع الطاقة (Industrial EPC)',
    nameEn: 'Industrial Plants & Process Facility Contracts',
    industryAr: 'المصانع البتروكيماوية ومحطات التحلية والطاقة',
    industryEn: 'Heavy Industrial & Energy Process Facilities',
    descriptionAr: 'عقود مشاريع مصانع بالجبيل ورابغ بقيمة 160 مليون ر.س تتطلب التزاماً دقيقاً بجداول الفحص والتسليم.',
    descriptionEn: 'Heavy industrial process plant packages valued at 160M SAR requiring strict quality assurance milestone certification.',
    projects: [
      {
        id: 'PRJ-IND-01',
        code: 'PRJ-601',
        nameAr: 'تحديث وحدة نزع الكبريت من غاز العادم (FGD) — مجمع ينبع للبتروكيماويات',
        nameEn: 'Yanbu Petrochemicals Flue Gas Desulfurization (FGD) Upgrade',
        clientNameAr: 'شركة التصنيع الوطنية',
        clientNameEn: 'National Industrialization Co. (Tasnee)',
        contractValueSAR: 95000000,
        budgetCostSAR: 76000000,
        baselineMarginSAR: 19000000,
        baselineMarginPct: 20.0,
        currentIncurredCostSAR: 52000000,
        billedMilestonesSAR: 58000000,
        completionPercentage: 71,
        plannedValueSAR: 67450000,
        earnedValueSAR: 67450000,
        actualCostSAR: 52000000,
        costPerformanceIndex: 1.30,
        schedulePerformanceIndex: 1.00,
        estimateAtCompletionSAR: 58461000,
        forecastedFinalMarginSAR: 36539000,
        forecastedFinalMarginPct: 38.5,
        marginVarianceSAR: 17539000,
        unbilledVariationOrdersSAR: 2100000,
        disputedClaimsSAR: 800000,
        healthStatus: 'HEALTHY',
        assignedDirector: 'م. حسام الشهري - مدير مشاريع الطاقة والصناعة',
        contractType: 'LUMP_SUM_TURNKEY',
        statutoryRegulation: 'معايير السلامة الصناعية العليا (HCIS) / لوائح الهيئة الملكية',
        cryptographicSignHash: computeProjectHash('PRJ-IND-01-YANBU-FGD')
      },
      {
        id: 'PRJ-IND-02',
        code: 'PRJ-602',
        nameAr: 'محطة الطاقة الشمسية الكهروضوئية الميدانية (50 ميجاوات) — رابغ',
        nameEn: 'Rabigh 50MW Captive Solar PV Plant EPC Package',
        clientNameAr: 'شركة رابغ للتكرير والبتروكيماويات (بترورابغ)',
        clientNameEn: 'Petro Rabigh',
        contractValueSAR: 65000000,
        budgetCostSAR: 53300000,
        baselineMarginSAR: 11700000,
        baselineMarginPct: 18.0,
        currentIncurredCostSAR: 43500000,
        billedMilestonesSAR: 39000000,
        completionPercentage: 62,
        plannedValueSAR: 45500000,
        earnedValueSAR: 40300000,
        actualCostSAR: 43500000,
        costPerformanceIndex: 0.93,
        schedulePerformanceIndex: 0.89,
        estimateAtCompletionSAR: 57311000,
        forecastedFinalMarginSAR: 7689000,
        forecastedFinalMarginPct: 11.8,
        marginVarianceSAR: -4011000,
        unbilledVariationOrdersSAR: 3400000,
        disputedClaimsSAR: 2100000,
        healthStatus: 'AT_RISK',
        assignedDirector: 'د. مروان بكر - رئيس قطاع الطاقة المتجددة',
        contractType: 'UNIT_RATE_EPC',
        statutoryRegulation: 'اشتراطات هيئة تنظيم المياه والكهرباء (WERA)',
        cryptographicSignHash: computeProjectHash('PRJ-IND-02-RABIGH-SOLAR')
      }
    ]
  }
};

// ── Portfolio EVM Calculation Algorithm ───────────────────────────────────────

export function calculatePortfolioEVM(
  projects: ProjectContractRecord[],
  variationSettlementRatePct = 75 // 0% to 100%
): PortfolioProjectMetrics {
  let totalContract = 0;
  let totalBudget = 0;
  let totalActual = 0;
  let totalBilled = 0;
  let totalBaselineMargin = 0;
  let totalForecastedMargin = 0;
  let totalEV = 0;
  let totalPV = 0;
  let totalVO = 0;
  let totalClaims = 0;
  let criticalCount = 0;
  let atRiskCount = 0;
  let healthyCount = 0;

  for (const p of projects) {
    totalContract += p.contractValueSAR;
    totalBudget += p.budgetCostSAR;
    totalActual += p.actualCostSAR;
    totalBilled += p.billedMilestonesSAR;
    totalBaselineMargin += p.baselineMarginSAR;

    // Settle VOs based on slider rate: Recovered VO cash adds to final forecasted margin
    const settledVoGain = p.unbilledVariationOrdersSAR * (variationSettlementRatePct / 100);
    const adjustedForecastedMargin = p.forecastedFinalMarginSAR + settledVoGain;
    totalForecastedMargin += adjustedForecastedMargin;

    totalEV += p.earnedValueSAR;
    totalPV += p.plannedValueSAR;
    totalVO += p.unbilledVariationOrdersSAR;
    totalClaims += p.disputedClaimsSAR;

    if (p.healthStatus === 'CRITICAL') criticalCount++;
    else if (p.healthStatus === 'AT_RISK') atRiskCount++;
    else healthyCount++;
  }

  const cpi = totalActual > 0 ? totalEV / totalActual : 1.0;
  const spi = totalPV > 0 ? totalEV / totalPV : 1.0;
  const blendedMarginPct = totalContract > 0 ? (totalForecastedMargin / totalContract) * 100 : 0;
  const netVariance = totalForecastedMargin - totalBaselineMargin;

  return {
    totalContractValueSAR: Math.round(totalContract),
    totalBudgetCostSAR: Math.round(totalBudget),
    totalActualCostSAR: Math.round(totalActual),
    totalBilledSAR: Math.round(totalBilled),
    totalBaselineMarginSAR: Math.round(totalBaselineMargin),
    totalForecastedMarginSAR: Math.round(totalForecastedMargin),
    netMarginVarianceSAR: Math.round(netVariance),
    portfolioBlendedMarginPct: Math.round(blendedMarginPct * 10) / 10,
    portfolioCpi: Math.round(cpi * 100) / 100,
    portfolioSpi: Math.round(spi * 100) / 100,
    totalUnbilledVariationOrdersSAR: Math.round(totalVO),
    totalDisputedClaimsSAR: Math.round(totalClaims),
    criticalProjectCount: criticalCount,
    atRiskProjectCount: atRiskCount,
    healthyProjectCount: healthyCount
  };
}

// ── Real CSV Parser for Custom PMO Project Portfolios ─────────────────────────

export function parseProjectPortfolioCsv(csvContent: string): ProjectContractRecord[] {
  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());

  const getColIdx = (aliases: string[]) => {
    return header.findIndex((h) => aliases.some((a) => h.includes(a)));
  };

  const codeIdx = getColIdx(['code', 'id', 'ref', 'رقم', 'كود']);
  const nameIdx = getColIdx(['name', 'title', 'project', 'مشروع', 'اسم']);
  const clientIdx = getColIdx(['client', 'owner', 'عميل', 'مالك', 'جهة']);
  const valueIdx = getColIdx(['value', 'contract', 'قيمة', 'عقد']);
  const budgetIdx = getColIdx(['budget', 'ميزانية', 'تكلفة']);
  const costIdx = getColIdx(['actual', 'incurred', 'منصرف', 'فعلي']);
  const billedIdx = getColIdx(['billed', 'مفوتر', 'مستخلص']);
  const progressIdx = getColIdx(['progress', 'completion', 'إنجاز', 'نسبة']);
  const voIdx = getColIdx(['vo', 'variation', 'تغيير', 'أوامر']);

  const projects: ProjectContractRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    if (row.length < 3) continue;

    const code = (codeIdx !== -1 && row[codeIdx]) ? row[codeIdx] : `PRJ-${400 + i}`;
    const name = (nameIdx !== -1 && row[nameIdx]) ? row[nameIdx] : `عقد مشروع استراتيجي رقم ${i}`;
    const client = (clientIdx !== -1 && row[clientIdx]) ? row[clientIdx] : 'الجهة المالكة';
    const val = (valueIdx !== -1 && !isNaN(parseFloat(row[valueIdx]))) ? parseFloat(row[valueIdx]) : 50000000;
    const budget = (budgetIdx !== -1 && !isNaN(parseFloat(row[budgetIdx]))) ? parseFloat(row[budgetIdx]) : val * 0.82;
    const cost = (costIdx !== -1 && !isNaN(parseFloat(row[costIdx]))) ? parseFloat(row[costIdx]) : budget * 0.6;
    const billed = (billedIdx !== -1 && !isNaN(parseFloat(row[billedIdx]))) ? parseFloat(row[billedIdx]) : val * 0.55;
    const progress = (progressIdx !== -1 && !isNaN(parseFloat(row[progressIdx]))) ? Math.min(100, parseFloat(row[progressIdx])) : 65;
    const vo = (voIdx !== -1 && !isNaN(parseFloat(row[voIdx]))) ? parseFloat(row[voIdx]) : val * 0.05;

    const baselineMargin = val - budget;
    const baselineMarginPct = val > 0 ? (baselineMargin / val) * 100 : 18;

    const ev = val * (progress / 100);
    const pv = val * (Math.min(100, progress + 4) / 100);
    const cpi = cost > 0 ? ev / cost : 1.0;
    const spi = pv > 0 ? ev / pv : 0.95;
    const eac = cpi > 0 ? budget / cpi : budget;
    const forecastedMargin = val - eac;
    const forecastedMarginPct = val > 0 ? (forecastedMargin / val) * 100 : 0;
    const marginVariance = forecastedMargin - baselineMargin;

    let health: ProjectHealth = 'HEALTHY';
    if (cpi < 0.88 || spi < 0.85 || forecastedMarginPct < 5) health = 'CRITICAL';
    else if (cpi < 0.98 || spi < 0.95) health = 'AT_RISK';

    projects.push({
      id: `CSV-PRJ-${i}`,
      code,
      nameAr: name,
      nameEn: name,
      clientNameAr: client,
      clientNameEn: client,
      contractValueSAR: val,
      budgetCostSAR: budget,
      baselineMarginSAR: Math.round(baselineMargin),
      baselineMarginPct: Math.round(baselineMarginPct * 10) / 10,
      currentIncurredCostSAR: cost,
      billedMilestonesSAR: billed,
      completionPercentage: progress,
      plannedValueSAR: Math.round(pv),
      earnedValueSAR: Math.round(ev),
      actualCostSAR: cost,
      costPerformanceIndex: Math.round(cpi * 100) / 100,
      schedulePerformanceIndex: Math.round(spi * 100) / 100,
      estimateAtCompletionSAR: Math.round(eac),
      forecastedFinalMarginSAR: Math.round(forecastedMargin),
      forecastedFinalMarginPct: Math.round(forecastedMarginPct * 10) / 10,
      marginVarianceSAR: Math.round(marginVariance),
      unbilledVariationOrdersSAR: Math.round(vo),
      disputedClaimsSAR: Math.round(vo * 0.6),
      healthStatus: health,
      assignedDirector: 'مدير قطاع المشاريع',
      contractType: 'UNIT_RATE_EPC',
      statutoryRegulation: 'عقد فيديك الهندسي / نظام المنافسات الحكومية',
      cryptographicSignHash: computeProjectHash(`CSV-${code}-${val}`)
    });
  }

  return projects;
}
