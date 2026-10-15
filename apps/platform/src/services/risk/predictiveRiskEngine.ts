// MIKHLAFI LABS — Enterprise Predictive Risk Intelligence & Early Warning Engine (Service 03)
// Deterministic Algorithms: 13-Week Rolling Cash Runway Telemetry, Probability-Weighted Exposure,
// Operational Stress-Testing Simulator, 5x5 Enterprise Risk Heatmap Matrix, and ISO 31000 Mitigation Dossiers.

export type RiskCategory =
  | 'LIQUIDITY_RUNWAY'
  | 'SUPPLY_CHAIN_SINGLE_SOURCE'
  | 'CONTRACTUAL_PENALTY'
  | 'INVENTORY_STOCKOUT'
  | 'REGULATORY_COMPLIANCE'
  | 'OPERATIONAL_EQUIPMENT';

export type RiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type LeadTimeVelocity = 'IMMINENT' | 'ACCELERATING' | 'MONITORED';

export interface RiskSignal {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  category: RiskCategory;
  categoryLabelAr: string;
  categoryLabelEn: string;
  severity: RiskSeverity;
  probabilityPct: number; // 0 - 100%
  potentialLossSAR: number;
  riskExposureSAR: number; // potentialLossSAR * (probabilityPct / 100)
  earlyWarningHorizonDays: number;
  leadTimeVelocity: LeadTimeVelocity;
  isMitigated: boolean;
  mitigationCostSAR: number;
  mitigationActionAr: string;
  mitigationActionEn: string;
  mitigationOwner: string;
  statutoryRegulation: string;
  leadingIndicatorMetric: string;
  cryptographicAuditProof: string;
}

export interface PortfolioRiskMetrics {
  totalMonitoredExposureSAR: number;
  netUnmitigatedExposureSAR: number;
  protectedExposureSAR: number;
  compositeThreatScore: number; // 0 - 100
  activeCriticalCount: number;
  activeHighCount: number;
  averageWarningHorizonDays: number;
  dailyRiskBurnRateSAR: number;
}

export interface WeeklyCashRunwayPoint {
  weekNumber: number;
  weekLabelAr: string;
  weekLabelEn: string;
  projectedInflowsSAR: number;
  committedOutflowsSAR: number;
  baselineCashBalanceSAR: number;
  stressedCashBalanceSAR: number;
  isDeficit: boolean;
  deficitAmountSAR: number;
}

// Deterministic Hash Generator
function computeRiskHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const hex2 = Math.abs(hash * 41).toString(16).padStart(8, '0');
  return `RISK-${hex.toUpperCase()}-${hex2.toUpperCase()}`;
}

// ── Realistic Pre-Seeded Saudi Enterprise Risk Scenarios ───────────────────────

export const PRESET_RISK_SCENARIOS: Record<
  string,
  {
    nameAr: string;
    nameEn: string;
    industryAr: string;
    industryEn: string;
    initialCashReserveSAR: number;
    minimumSafetyBufferSAR: number;
    descriptionAr: string;
    descriptionEn: string;
    signals: RiskSignal[];
  }
> = {
  contracting: {
    nameAr: 'مجموعة المقاولات والمشاريع الكبرى (EPC)',
    nameEn: 'Infrastructure & EPC Mega-Contractor',
    industryAr: 'المقاولات والبنية التحتية والمشاريع التنموية',
    industryEn: 'Infrastructure & EPC Engineering',
    initialCashReserveSAR: 18500000,
    minimumSafetyBufferSAR: 5000000,
    descriptionAr: 'محفظة مشاريع بقيمة 180 مليون ر.س تواجه فجوة تدفقات نقدية متوقعة في الأسبوع السادس مع مخاطر تركز الموردين.',
    descriptionEn: 'Major EPC contractor executing 180M SAR portfolio exposed to a projected week-6 liquidity squeeze and single-source supplier dependencies.',
    signals: [
      {
        id: 'RSK-EPC-01',
        code: 'RSK-101',
        titleAr: 'اختناق سيولة حاد في الأسبوع السادس لتأخر مستخلص الدفعة الرابعة',
        titleEn: 'Week-6 Liquidity Squeeze from Delayed Milestone Certificate',
        category: 'LIQUIDITY_RUNWAY',
        categoryLabelAr: 'مدرج السيولة النقدية',
        categoryLabelEn: 'Liquidity Runway',
        severity: 'CRITICAL',
        probabilityPct: 84,
        potentialLossSAR: 14800000,
        riskExposureSAR: 12432000,
        earlyWarningHorizonDays: 32,
        leadTimeVelocity: 'ACCELERATING',
        isMitigated: false,
        mitigationCostSAR: 250000,
        mitigationActionAr: 'تفعيل خط ائتماني متجدد (Revolving Credit) مع بنك الإنماء وصرف التمويل التجسيري فوراً لتغطية الرواتب وسندات الموردين.',
        mitigationActionEn: 'Activate secondary revolving credit tranche with corporate bank and issue bridge liquidity for payroll and critical subcontractors.',
        mitigationOwner: 'أ. حسام الغامدي - المدير المالي التنفيذي',
        statutoryRegulation: 'معايير بازل 3 للسيولة السريعة (LCR) / متطلبات البنك المركزي السعودي (SAMA)',
        leadingIndicatorMetric: 'مؤشر السيولة السريعة (Quick Ratio) ينخفض إلى 0.62 في الأسبوع السادس دون المستخلص',
        cryptographicAuditProof: computeRiskHash('RSK-EPC-01-WEEK6-CASH-CRUNCH')
      },
      {
        id: 'RSK-EPC-02',
        code: 'RSK-102',
        titleAr: 'احتكار توريد حديد التسليح عبر مورد منفرد لمشروع المترو',
        titleEn: 'Single-Source Rebar Supply Monopoly Vulnerability',
        category: 'SUPPLY_CHAIN_SINGLE_SOURCE',
        categoryLabelAr: 'سلاسل الإمداد ومخاطر التركز',
        categoryLabelEn: 'Supply Chain Single-Source',
        severity: 'HIGH',
        probabilityPct: 68,
        potentialLossSAR: 8500000,
        riskExposureSAR: 5780000,
        earlyWarningHorizonDays: 45,
        leadTimeVelocity: 'MONITORED',
        isMitigated: false,
        mitigationCostSAR: 180000,
        mitigationActionAr: 'تأهيل مصنعي حديد محليين بديلين (حديد الاتفاق وحديد اليمامة) وتوزيع حصص التوريد بنسبة 60/40 لمنع التوقف.',
        mitigationActionEn: 'Pre-qualify two secondary domestic steel mills and allocate a 60/40 dual-sourcing quota to prevent single-point site stoppage.',
        mitigationOwner: 'م. راشد القحطاني - رئيس قطاع المشتريات الإنشائية',
        statutoryRegulation: 'نظام المنافسات والمشتريات الحكومية / لائحة إدارة مخاطر سلاسل الإمداد',
        leadingIndicatorMetric: 'درجة تركز المورد (Herfindahl Index) = 0.88 لصالح مورد منفرد',
        cryptographicAuditProof: computeRiskHash('RSK-EPC-02-REBAR-MONOPOLY')
      },
      {
        id: 'RSK-EPC-03',
        code: 'RSK-103',
        titleAr: 'تراكم غرامات تأخير تعاقدية نتيجة بطء اعتماد مخططات Shop Drawings',
        titleEn: 'Contractual Liquidated Damages from Consultant Review Delays',
        category: 'CONTRACTUAL_PENALTY',
        categoryLabelAr: 'الغرامات والالتزامات التعاقدية',
        categoryLabelEn: 'Contractual Penalties',
        severity: 'CRITICAL',
        probabilityPct: 75,
        potentialLossSAR: 4200000,
        riskExposureSAR: 3150000,
        earlyWarningHorizonDays: 24,
        leadTimeVelocity: 'IMMINENT',
        isMitigated: false,
        mitigationCostSAR: 95000,
        mitigationActionAr: 'إرسال إشعار قانوني رسمي للمهندس الاستشاري بطلب تمديد زمني (EOT Claim) مع إسناد المخططات لمكتب هندسي خارجي مساند.',
        mitigationActionEn: 'Serve formal notice of delay to supervising consultant requesting Extension of Time (EOT) and outsource detailing backlog.',
        mitigationOwner: 'م. فهد التميمي - مدير العقود والمطالبات',
        statutoryRegulation: 'عقد فيديك (FIDIC Clause 20.1) / نظام المعاملات المدنية السعودي',
        leadingIndicatorMetric: 'تأخر 18 مخططاً معمارياً عن المسار الحرج بنسبة تجاوزت 21 يوماً',
        cryptographicAuditProof: computeRiskHash('RSK-EPC-03-EOT-PENALTY')
      },
      {
        id: 'RSK-EPC-04',
        code: 'RSK-104',
        titleAr: 'انتهاء سريان الضمان البنكي الابتدائي دون تجديد لدى الجهة المالكة',
        titleEn: 'Expiring Tender Performance Bond Without Automatic Renewal',
        category: 'REGULATORY_COMPLIANCE',
        categoryLabelAr: 'الامتثال والضمانات البنكية',
        categoryLabelEn: 'Regulatory & Bond Compliance',
        severity: 'HIGH',
        probabilityPct: 52,
        potentialLossSAR: 6100000,
        riskExposureSAR: 3172000,
        earlyWarningHorizonDays: 14,
        leadTimeVelocity: 'IMMINENT',
        isMitigated: false,
        mitigationCostSAR: 45000,
        mitigationActionAr: 'إصدار ملحق تمديد فوري للضمان البنكي عبر منصة اعتماد الإلكترونية ومخاطبة البنك لإتمام الخصم الائتماني.',
        mitigationActionEn: 'Issue urgent bank guarantee extension rider via Etimad portal and reconcile credit margin with issuing bank.',
        mitigationOwner: 'أ. سعود الخالدي - مدير العلاقات البنكية',
        statutoryRegulation: 'لائحة الضمانات البنكية الحكومية / منصة اعتماد الرقمية',
        leadingIndicatorMetric: '14 يوماً متبقية على صلاحية الضمان النهائي قبل مصادرته نظامياً',
        cryptographicAuditProof: computeRiskHash('RSK-EPC-04-BANK-GUARANTEE')
      }
    ]
  },

  retail: {
    nameAr: 'مجموعة التجزئة والمستودعات الكبرى (FMCG)',
    nameEn: 'National FMCG & Retail Distribution Network',
    industryAr: 'التجزئة وسلاسل التبريد والمنتجات الاستهلاكية',
    industryEn: 'FMCG, Cold Chain & Supermarkets',
    initialCashReserveSAR: 24000000,
    minimumSafetyBufferSAR: 7500000,
    descriptionAr: 'شبكة توزيع بـ 42 فرعاً بإنفاق 140 مليون ر.س تواجه مخاطر نفاد السلع الاستهلاكية واختناقات الشحن المبرد.',
    descriptionEn: 'Omnichannel retail network operating 42 outlets facing perishable stockout crunches and seasonal demand surge spikes.',
    signals: [
      {
        id: 'RSK-RET-01',
        code: 'RSK-201',
        titleAr: 'نفاد مخزون الزيوت ومنتجات الألبان الحساسة قبل موسم الذروة',
        titleEn: 'Critical FMCG Dairy & Cooking Oil Stockout Before Demand Surge',
        category: 'INVENTORY_STOCKOUT',
        categoryLabelAr: 'المخزون وسلاسل الإمداد',
        categoryLabelEn: 'Inventory Stockout',
        severity: 'CRITICAL',
        probabilityPct: 79,
        potentialLossSAR: 11200000,
        riskExposureSAR: 8848000,
        earlyWarningHorizonDays: 38,
        leadTimeVelocity: 'ACCELERATING',
        isMitigated: false,
        mitigationCostSAR: 320000,
        mitigationActionAr: 'إصدار أوامر شراء استباقية بحجم مضاعف لمصانع الخرج وجدة مع تثبيت مساحة تخزين مبردة إضافية بسوق العزيزية.',
        mitigationActionEn: 'Trigger advanced volume release to primary dairy producers and secure surge buffer cold storage in central distribution hubs.',
        mitigationOwner: 'أ. ريم المنصور - نائب الرئيس للتجزئة وسلاسل الإمداد',
        statutoryRegulation: 'نظام حماية المستهلك / لائحة توفر السلع التموينية لوزارة التجارة',
        leadingIndicatorMetric: 'معدل نفاد الصنف (Stockout Velocity) يتوقع وصوله لـ 42% خلال 28 يوماً',
        cryptographicAuditProof: computeRiskHash('RSK-RET-01-DAIRY-STOCKOUT')
      },
      {
        id: 'RSK-RET-02',
        code: 'RSK-202',
        titleAr: 'تأخر التخليص الجمركي للشحنات المبردة بميناء الملك عبد العزيز برابغ',
        titleEn: 'Reefer Cargo Customs Clearance Backlog at Rabigh Port',
        category: 'SUPPLY_CHAIN_SINGLE_SOURCE',
        categoryLabelAr: 'الشحن والجمارك',
        categoryLabelEn: 'Port Logistics Backlog',
        severity: 'HIGH',
        probabilityPct: 65,
        potentialLossSAR: 4800000,
        riskExposureSAR: 3120000,
        earlyWarningHorizonDays: 20,
        leadTimeVelocity: 'IMMINENT',
        isMitigated: false,
        mitigationCostSAR: 110000,
        mitigationActionAr: 'التحويل لمسار الفسح المسبق (منصة فسح FASAH) وتفويض مخلص جمركي معتمد للإنزال السريع.',
        mitigationActionEn: 'Shift consignment to FASAH pre-clearance green channel with dedicated 24/7 cold-chain handling agent.',
        mitigationOwner: 'م. فيصل الشمري - مدير التخليص وسلاسل التوريد',
        statutoryRegulation: 'نظام الجمارك الموحد / اشتراطات هيئة الغذاء والدواء (SFDA)',
        leadingIndicatorMetric: 'متوسط زمن الانتظار المينائي يرتفع من 3.2 أيام إلى 11.4 يوماً',
        cryptographicAuditProof: computeRiskHash('RSK-RET-02-PORT-CUSTOMS')
      },
      {
        id: 'RSK-RET-03',
        code: 'RSK-203',
        titleAr: 'مخاطر تركز الائتمان وتعثر التحصيل لدى كبار موزعي الجملة',
        titleEn: 'Credit Default Risk Across Top-3 Wholesale Distributor Receivables',
        category: 'LIQUIDITY_RUNWAY',
        categoryLabelAr: 'مدرج السيولة والنقد',
        categoryLabelEn: 'Receivables & Default',
        severity: 'HIGH',
        probabilityPct: 58,
        potentialLossSAR: 7400000,
        riskExposureSAR: 4292000,
        earlyWarningHorizonDays: 50,
        leadTimeVelocity: 'MONITORED',
        isMitigated: false,
        mitigationCostSAR: 150000,
        mitigationActionAr: 'إلزام الموزعين بتقديم سندات لأمر نافذة وتطبيق نظام التأمين الائتماني على الصادرات والمبيعات.',
        mitigationActionEn: 'Enforce promissory note backing (Sanad Amr) and bind sales under domestic trade credit insurance policies.',
        mitigationOwner: 'أ. طارق الغامدي - رئيس الائتمان والتحصيل',
        statutoryRegulation: 'نظام الأوراق التجارية السعودي / معيار خسائر الائتمان IFRS 9',
        leadingIndicatorMetric: 'أيام التحصيل الفعلية (DSO) تتجاوز 98 يوماً مقابل سقف 60 يوماً التعاقدي',
        cryptographicAuditProof: computeRiskHash('RSK-RET-03-CREDIT-DEFAULT')
      }
    ]
  },

  industrial: {
    nameAr: 'مجمع الصناعات البتروكيماوية والميكانيكية',
    nameEn: 'Petrochemical Refining & Heavy Industrial Plants',
    industryAr: 'الصناعات التحويلية والبتروكيماويات الثقيلة',
    industryEn: 'Petrochemicals & Continuous Process Plants',
    initialCashReserveSAR: 42000000,
    minimumSafetyBufferSAR: 15000000,
    descriptionAr: 'منشآت تكرير وبلمرة بالجبيل وينبع بإنفاق 210 مليون ر.س ترصد احتمالات التوقف المفاجئ وغرامات الانبعاثات.',
    descriptionEn: 'Continuous manufacturing complex in Jubail & Yanbu with 210M SAR opex monitoring catastrophic machinery failures and environmental compliance.',
    signals: [
      {
        id: 'RSK-IND-01',
        code: 'RSK-301',
        titleAr: 'اهتراء محامل التوربينة البخارية رقم 2 بمصنع بلمرة ينبع',
        titleEn: 'Impending Bearing Degradation on Steam Turbine #2 at Yanbu Plant',
        category: 'OPERATIONAL_EQUIPMENT',
        categoryLabelAr: 'المعدات والتشغيل الصناعي',
        categoryLabelEn: 'Machinery Reliability',
        severity: 'CRITICAL',
        probabilityPct: 82,
        potentialLossSAR: 18500000,
        riskExposureSAR: 15170000,
        earlyWarningHorizonDays: 21,
        leadTimeVelocity: 'IMMINENT',
        isMitigated: false,
        mitigationCostSAR: 420000,
        mitigationActionAr: 'جدولة إيقاف مبرمج لمدة 18 ساعة لتبديل المحمل الاحتياطي الموجود بالمستودع بدلاً من انتظار الانهيار الكارثي.',
        mitigationActionEn: 'Schedule proactive 18-hour turnaround to replace bearing assembly using warehouse spare, avoiding catastrophic shutdown.',
        mitigationOwner: 'م. حسام الشهري - مدير مجمع مصانع ينبع',
        statutoryRegulation: 'معايير السلامة الصناعية العليا (HCIS) / مواصفات معهد البترول الأمريكي API 612',
        leadingIndicatorMetric: 'سعة الاهتزاز الطيفي تتجاوز 7.8 mm/s مقابل الحد الآمن 2.5 mm/s',
        cryptographicAuditProof: computeRiskHash('RSK-IND-01-TURBINE-FAILURE')
      },
      {
        id: 'RSK-IND-02',
        code: 'RSK-302',
        titleAr: 'تجاوز انبعاثات غاز ثاني أكسيد الكبريت لسقف المركز الوطني للرقابة البيئية',
        titleEn: 'Sulfur Dioxide Flue Gas Emission Exceeding NCVC Regulatory Caps',
        category: 'REGULATORY_COMPLIANCE',
        categoryLabelAr: 'الامتثال البيئي والتراخيص',
        categoryLabelEn: 'Environmental Compliance',
        severity: 'HIGH',
        probabilityPct: 71,
        potentialLossSAR: 5200000,
        riskExposureSAR: 3692000,
        earlyWarningHorizonDays: 16,
        leadTimeVelocity: 'ACCELERATING',
        isMitigated: false,
        mitigationCostSAR: 260000,
        mitigationActionAr: 'حقن محفزات كيميائية إضافية في وحدة نزع الكبريت (FGD) واستبدال فلاتر الهواء الميكانيكية.',
        mitigationActionEn: 'Inject supplementary scrubbing catalyst into FGD unit and replace dry sorbent particulate filter bags.',
        mitigationOwner: 'د. مروان بكر - رئيس قطاع السلامة والبيئة',
        statutoryRegulation: 'نظام البيئة السعودي / المعايير التنفيذية للمركز الوطني للرقابة على الالتزام البيئي',
        leadingIndicatorMetric: 'تركيز الانبعاثات عند المدخنة = 485 mg/Nm³ مقابل الحد الأقصى 350 mg/Nm³',
        cryptographicAuditProof: computeRiskHash('RSK-IND-02-EMISSION-CAP')
      }
    ]
  }
};

// ── Portfolio Metrics Calculation Algorithm ───────────────────────────────────

export function calculatePortfolioRiskMetrics(
  signals: RiskSignal[],
  stressFactorMultiplier = 1.0 // 1.0 to 1.5
): PortfolioRiskMetrics {
  let totalMonitored = 0;
  let netUnmitigated = 0;
  let protectedExposure = 0;
  let activeCritical = 0;
  let activeHigh = 0;
  let totalDays = 0;

  for (const s of signals) {
    const adjustedProb = Math.min(100, Math.round(s.probabilityPct * stressFactorMultiplier));
    const effectiveExposure = s.potentialLossSAR * (adjustedProb / 100);

    totalMonitored += effectiveExposure;
    totalDays += s.earlyWarningHorizonDays;

    if (s.isMitigated) {
      protectedExposure += effectiveExposure;
    } else {
      netUnmitigated += effectiveExposure;
      if (s.severity === 'CRITICAL') activeCritical++;
      if (s.severity === 'HIGH') activeHigh++;
    }
  }

  const avgDays = signals.length ? Math.round(totalDays / signals.length) : 30;
  const compositeThreatScore = Math.min(
    100,
    Math.round((netUnmitigated / (totalMonitored || 1)) * 75 + activeCritical * 8 + activeHigh * 3)
  );

  const dailyBurn = Math.round(netUnmitigated / Math.max(1, avgDays));

  return {
    totalMonitoredExposureSAR: Math.round(totalMonitored),
    netUnmitigatedExposureSAR: Math.round(netUnmitigated),
    protectedExposureSAR: Math.round(protectedExposure),
    compositeThreatScore,
    activeCriticalCount: activeCritical,
    activeHighCount: activeHigh,
    averageWarningHorizonDays: avgDays,
    dailyRiskBurnRateSAR: dailyBurn
  };
}

// ── 13-Week Rolling Cash Runway Simulation Algorithm ──────────────────────────

export function simulate13WeekCashRunway(
  initialCashSAR: number,
  safetyBufferSAR: number,
  signals: RiskSignal[],
  stressLevelPct = 0 // 0 to 50%
): WeeklyCashRunwayPoint[] {
  const weeks: WeeklyCashRunwayPoint[] = [];
  let currentBaselineCash = initialCashSAR;
  let currentStressedCash = initialCashSAR;

  // Unmitigated cash drain distribution
  const unmitigatedCashRisks = signals.filter((s) => !s.isMitigated && s.category === 'LIQUIDITY_RUNWAY');
  const totalLiquidityRiskLoss = unmitigatedCashRisks.reduce((sum, s) => sum + s.riskExposureSAR, 0);

  // Typical weekly operational inflow/outflow trajectory
  const baseWeeklyInflow = initialCashSAR * 0.18;
  const baseWeeklyOutflow = initialCashSAR * 0.17;

  for (let w = 1; w <= 13; w++) {
    // Week 6 or 7 usually has high cluster impact
    const isStressShockWeek = w >= 6 && w <= 8;
    const shockImpact = isStressShockWeek ? (totalLiquidityRiskLoss * 0.35 * (1 + stressLevelPct / 100)) : 0;

    const inflow = baseWeeklyInflow * (1 - (stressLevelPct * 0.005));
    const outflow = baseWeeklyOutflow * (1 + (stressLevelPct * 0.004)) + shockImpact;

    currentBaselineCash = currentBaselineCash + (baseWeeklyInflow - baseWeeklyOutflow);
    currentStressedCash = currentStressedCash + (inflow - outflow);

    const isDeficit = currentStressedCash < safetyBufferSAR;
    const deficitAmount = isDeficit ? safetyBufferSAR - currentStressedCash : 0;

    weeks.push({
      weekNumber: w,
      weekLabelAr: `الأسبوع ${w}`,
      weekLabelEn: `Week ${w}`,
      projectedInflowsSAR: Math.round(inflow),
      committedOutflowsSAR: Math.round(outflow),
      baselineCashBalanceSAR: Math.round(currentBaselineCash),
      stressedCashBalanceSAR: Math.round(currentStressedCash),
      isDeficit,
      deficitAmountSAR: Math.round(deficitAmount)
    });
  }

  return weeks;
}

// ── Real CSV Parser for Custom Risk Registers ─────────────────────────────────

export function parseRiskLedgerCsv(csvContent: string): RiskSignal[] {
  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());

  const getColIdx = (aliases: string[]) => {
    return header.findIndex((h) => aliases.some((a) => h.includes(a)));
  };

  const codeIdx = getColIdx(['code', 'id', 'ref', 'رقم', 'كود']);
  const titleIdx = getColIdx(['title', 'name', 'risk', 'threat', 'خطر', 'عنوان', 'تهديد']);
  const lossIdx = getColIdx(['loss', 'exposure', 'impact', 'potential', 'خسارة', 'أثر', 'مبلغ']);
  const probIdx = getColIdx(['prob', 'probability', 'likelihood', 'احتمالية', 'نسبة']);
  const horizonIdx = getColIdx(['days', 'horizon', 'time', 'lead', 'أيام', 'مهلة']);
  const categoryIdx = getColIdx(['category', 'type', 'تصنيف', 'نوع']);
  const ownerIdx = getColIdx(['owner', 'assignee', 'مسؤول']);
  const costIdx = getColIdx(['mitigation', 'cost', 'وقاية', 'تكلفة']);

  const signals: RiskSignal[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    if (row.length < 3) continue;

    const code = (codeIdx !== -1 && row[codeIdx]) ? row[codeIdx] : `RSK-${100 + i}`;
    const title = (titleIdx !== -1 && row[titleIdx]) ? row[titleIdx] : `مؤشر خطر تشغيلي رقم ${i}`;
    const loss = (lossIdx !== -1 && !isNaN(parseFloat(row[lossIdx]))) ? parseFloat(row[lossIdx]) : 2000000;
    const prob = (probIdx !== -1 && !isNaN(parseFloat(row[probIdx]))) ? Math.min(100, parseFloat(row[probIdx])) : 65;
    const days = (horizonIdx !== -1 && !isNaN(parseFloat(row[horizonIdx]))) ? parseFloat(row[horizonIdx]) : 30;
    const owner = (ownerIdx !== -1 && row[ownerIdx]) ? row[ownerIdx] : 'مدير إدارة المخاطر';
    const mitigationCost = (costIdx !== -1 && !isNaN(parseFloat(row[costIdx]))) ? parseFloat(row[costIdx]) : loss * 0.05;

    let cat: RiskCategory = 'LIQUIDITY_RUNWAY';
    if (categoryIdx !== -1 && row[categoryIdx]) {
      const c = row[categoryIdx].toLowerCase();
      if (c.includes('supply') || c.includes('مورد') || c.includes('توريد')) cat = 'SUPPLY_CHAIN_SINGLE_SOURCE';
      else if (c.includes('penalty') || c.includes('عقد') || c.includes('غرامة')) cat = 'CONTRACTUAL_PENALTY';
      else if (c.includes('inventory') || c.includes('مخزون')) cat = 'INVENTORY_STOCKOUT';
      else if (c.includes('reg') || c.includes('امتثال') || c.includes('نظام')) cat = 'REGULATORY_COMPLIANCE';
      else if (c.includes('equip') || c.includes('صيانة') || c.includes('معدات')) cat = 'OPERATIONAL_EQUIPMENT';
    }

    const exposure = loss * (prob / 100);
    let severity: RiskSeverity = 'MEDIUM';
    if (exposure >= 5000000 || prob >= 75) severity = 'CRITICAL';
    else if (exposure >= 2000000 || prob >= 55) severity = 'HIGH';

    signals.push({
      id: `CSV-RSK-${i}`,
      code,
      titleAr: title,
      titleEn: title,
      category: cat,
      categoryLabelAr: 'مخاطر تشغيلية ومالية',
      categoryLabelEn: 'Operational & Financial Risk',
      severity,
      probabilityPct: prob,
      potentialLossSAR: loss,
      riskExposureSAR: Math.round(exposure),
      earlyWarningHorizonDays: days,
      leadTimeVelocity: days <= 20 ? 'IMMINENT' : days <= 40 ? 'ACCELERATING' : 'MONITORED',
      isMitigated: false,
      mitigationCostSAR: Math.round(mitigationCost),
      mitigationActionAr: `تفعيل إجراءات التحوط وخطة الطوارئ لحماية ${loss.toLocaleString('ar-SA')} ر.س.`,
      mitigationActionEn: `Deploy contingency mitigation protocols to safeguard ${loss.toLocaleString('en-US')} SAR downside.`,
      mitigationOwner: owner,
      statutoryRegulation: 'معايير إدارة المخاطر المؤسسية ISO 31000',
      leadingIndicatorMetric: `مؤشر خطر مستورد من سجل المخاطر — مهلة إنذار ${days} يوماً`,
      cryptographicAuditProof: computeRiskHash(`CSV-${code}-${loss}`)
    });
  }

  return signals;
}
