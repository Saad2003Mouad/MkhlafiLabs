// MIKHLAFI LABS — Enterprise Executive Decision Mesh & Capital Allocation Engine (Service 02)
// Deterministic Algorithms: Capital Constraint Knapsack Optimizer, Payback Velocity Scoring,
// Delegation of Authority (DoA) Resolution, Trade-Off & Opportunity Cost Comparative Matrix,
// and Executive Board Resolution Generation.

export type DecisionCategory =
  | 'CAPITAL_ALLOCATION'
  | 'OPEX_OPTIMIZATION'
  | 'CONTRACT_RENEGOTIATION'
  | 'RISK_MITIGATION'
  | 'STRATEGIC_DIVESTMENT';

export type DecisionRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type DecisionStatus = 'RECOMMENDED' | 'APPROVED' | 'REJECTED' | 'IN_EXECUTION';
export type DoaAuthority = 'BOARD' | 'CEO' | 'CFO' | 'VP_OPS';

export interface ExecutiveDecision {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  category: DecisionCategory;
  categoryLabelAr: string;
  categoryLabelEn: string;
  capexRequiredSAR: number;
  expectedPaybackSAR: number;
  paybackPeriodMonths: number;
  netGainSAR: number;
  roiPct: number;
  capitalEfficiencyScore: number; // 0 - 100
  riskLevel: DecisionRiskLevel;
  departmentAr: string;
  departmentEn: string;
  assignedOwner: string;
  deadlineDays: number;
  status: DecisionStatus;
  doaAuthority: DoaAuthority;
  executiveRationaleAr: string;
  executiveRationaleEn: string;
  opportunityCostAr: string;
  opportunityCostEn: string;
  statutoryFramework: string;
  cryptographicSignHash: string;
}

export interface CapitalAllocationResult {
  availableBudgetSAR: number;
  allocatedCapexSAR: number;
  remainingBudgetSAR: number;
  projectedTotalReturnSAR: number;
  netValueCreationSAR: number;
  portfolioRoiPct: number;
  allocatedDecisions: ExecutiveDecision[];
  unallocatedDecisions: ExecutiveDecision[];
  efficiencyIndex: number; // 0 - 100
}

export interface DecisionTradeoffAnalysis {
  decisionA: ExecutiveDecision;
  decisionB: ExecutiveDecision;
  capexDifferenceSAR: number;
  netGainDifferenceSAR: number;
  roiDifferencePct: number;
  paybackSpeedWinner: 'A' | 'B' | 'TIE';
  recommendedChoice: 'A' | 'B';
  comparativeRationaleAr: string;
  comparativeRationaleEn: string;
}

// Helper to compute deterministic hash
function computeDeterministicHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const hex2 = Math.abs(hash * 37).toString(16).padStart(8, '0');
  return `EDM-${hex.toUpperCase()}-${hex2.toUpperCase()}`;
}

// Helper to calculate Capital Efficiency Score (0 - 100)
export function computeCapitalEfficiencyScore(
  capex: number,
  payback: number,
  months: number,
  risk: DecisionRiskLevel
): number {
  const netGain = payback - capex;
  const roi = capex > 0 ? (netGain / capex) * 100 : 100;
  
  // Payback speed component: Faster payback (< 6 months) scores high
  const speedScore = Math.max(0, Math.min(40, (1 / Math.max(1, months)) * 120));
  
  // ROI component: Up to 40 points
  const roiScore = Math.max(0, Math.min(40, roi * 0.4));
  
  // Risk modifier component: Low risk gives 20 pts, Med gives 12 pts, High gives 5 pts
  const riskScore = risk === 'LOW' ? 20 : risk === 'MEDIUM' ? 12 : 5;
  
  return Math.min(100, Math.round(speedScore + roiScore + riskScore));
}

// ── Realistic Pre-Seeded Saudi Enterprise Scenarios ───────────────────────────

export const PRESET_DECISION_SCENARIOS: Record<
  string,
  {
    nameAr: string;
    nameEn: string;
    industryAr: string;
    industryEn: string;
    suggestedBudgetSAR: number;
    descriptionAr: string;
    descriptionEn: string;
    decisions: ExecutiveDecision[];
  }
> = {
  retail: {
    nameAr: 'مجموعة التجزئة وسلاسل الإمداد الكبرى',
    nameEn: 'Omnichannel Retail & Supply Chain Group',
    industryAr: 'التجزئة والأغذية وسلاسل التوريد',
    industryEn: 'Retail, FMCG & Logistics',
    suggestedBudgetSAR: 6000000,
    descriptionAr: 'شبكة فروع ومستودعات بإنفاق تشغيلي 140 مليون ر.س تعاني من بطء اتخاذ قرارات تدوير السيولة وإعادة تخصيص المخزون.',
    descriptionEn: 'National retail chain with 140M SAR operating spend facing capital allocation delays between branch logistics and supplier discounting.',
    decisions: [
      {
        id: 'DEC-RET-01',
        code: 'DEC-101',
        titleAr: 'التسوية المبكرة لفواتير كبار الموردين بخصم نقدي 4.5%',
        titleEn: 'Early Supplier Settlement for 4.5% Dynamic Cash Discount',
        category: 'OPEX_OPTIMIZATION',
        categoryLabelAr: 'تحسين المصاريف التشغيلية',
        categoryLabelEn: 'Opex Optimization',
        capexRequiredSAR: 3200000,
        expectedPaybackSAR: 3584000,
        paybackPeriodMonths: 2.0,
        netGainSAR: 384000,
        roiPct: 12.0,
        capitalEfficiencyScore: 94,
        riskLevel: 'LOW',
        departmentAr: 'المالية والخزينة',
        departmentEn: 'Finance & Treasury',
        assignedOwner: 'أ. طارق الغامدي - رئيس إدارة الخزينة',
        deadlineDays: 2,
        status: 'RECOMMENDED',
        doaAuthority: 'CFO',
        executiveRationaleAr: 'استغلال فوائض السيولة اللحظية لسداد موردي الأغذية الأساسيين خلال 10 أيام مقابل خصم فوري 4.5% يولد عائداً سنوياً مكافئاً لـ 27%.',
        executiveRationaleEn: 'Deploying transient treasury surplus to capture a 4.5% 10-day cash discount with tier-1 dairy and FMCG suppliers (annualized IRR 27%).',
        opportunityCostAr: 'خسارة 384,000 ريال نقداً لصالح المنافسين في حال بقاء السيولة في حسابات جارية صفرية العائد.',
        opportunityCostEn: 'Forfeiture of 384k SAR cash arbitrage to industry peers if surplus sits in zero-interest current accounts.',
        statutoryFramework: 'لائحة إدارة الخزينة والسيولة النقدية / معايير SOCPA للمحاسبة المالية',
        cryptographicSignHash: computeDeterministicHash('DEC-RET-01-EARLY-DISCOUNT')
      },
      {
        id: 'DEC-RET-02',
        code: 'DEC-102',
        titleAr: 'تحويل أسطول النقل المبرد من الملكية للتأجير التشغيلي',
        titleEn: 'Transition Refrigerated Fleet to Full-Service Operating Lease',
        category: 'CAPITAL_ALLOCATION',
        categoryLabelAr: 'توجيه رأس المال',
        categoryLabelEn: 'Capital Allocation',
        capexRequiredSAR: 1850000,
        expectedPaybackSAR: 3100000,
        paybackPeriodMonths: 6.5,
        netGainSAR: 1250000,
        roiPct: 67.5,
        capitalEfficiencyScore: 88,
        riskLevel: 'LOW',
        departmentAr: 'اللوجستيات والعمليات',
        departmentEn: 'Logistics & Fleet',
        assignedOwner: 'م. فهد السبيعي - مدير عام الإمداد اللوجستي',
        deadlineDays: 5,
        status: 'RECOMMENDED',
        doaAuthority: 'CEO',
        executiveRationaleAr: 'بيع 32 شاحنة تبريد قديمة متكررة الأعطال واستبدالها بعقد إيجار تشغيلي شامل الصيانة والتأمين، مما يخفض تكلفة الكيلومتر بـ 22%.',
        executiveRationaleEn: 'Divesting 32 aging reefer trucks into an operating lease structure with guaranteed uptime SLA, slashing logistics cost/km by 22%.',
        opportunityCostAr: 'استمرار نزيف صيانة طارئة بقيمة 780,000 ريال سنوياً وتلف 3 شحنات بضائع مبردة.',
        opportunityCostEn: 'Annual breakdown drag of 780k SAR plus spoilage risk across perishables supply lines.',
        statutoryFramework: 'نظام المعاملات المدنية السعودي / معيار إعداد التقارير الدولي IFRS 16',
        cryptographicSignHash: computeDeterministicHash('DEC-RET-02-FLEET-LEASE')
      },
      {
        id: 'DEC-RET-03',
        code: 'DEC-103',
        titleAr: 'إغلاق فرع حائل المتعثر وتحويل مخزونه لمركز الرياض الرقمي',
        titleEn: 'Decommission Underperforming Hail Branch & Repurpose to E-Com',
        category: 'STRATEGIC_DIVESTMENT',
        categoryLabelAr: 'تصفية وإعادة توجيه الأصول',
        categoryLabelEn: 'Strategic Divestment',
        capexRequiredSAR: 450000,
        expectedPaybackSAR: 1850000,
        paybackPeriodMonths: 4.0,
        netGainSAR: 1400000,
        roiPct: 311.1,
        capitalEfficiencyScore: 91,
        riskLevel: 'MEDIUM',
        departmentAr: 'تطوير شبكة الفروع',
        departmentEn: 'Retail Network Development',
        assignedOwner: 'أ. ريم المنصور - نائب الرئيس للتجزئة',
        deadlineDays: 7,
        status: 'RECOMMENDED',
        doaAuthority: 'BOARD',
        executiveRationaleAr: 'الفرع يحقق عائداً سلبياً منذ 14 شهراً. تسييل المخزون البالغ 1.85M ر.س وتحويله لمبيعات التجارة الإلكترونية ذات الهامش المرتفع.',
        executiveRationaleEn: 'Hail branch generating negative cash flow for 14 months; liquidating 1.85M SAR stagnant inventory to higher-margin e-commerce fulfillment.',
        opportunityCostAr: 'استنزاف إيجار ورسوم تشغيلية قدرها 55,000 ريال شهرياً دون تحقيق نقطة التعادل.',
        opportunityCostEn: 'Continued operational lease bleed of 55k SAR monthly with zero prospects of reaching breakeven.',
        statutoryFramework: 'نظام الشركات السعودي - مادة 76 (مسؤوليات مجلس الإدارة في حماية أصول الشركة)',
        cryptographicSignHash: computeDeterministicHash('DEC-RET-03-HAIL-CLOSURE')
      },
      {
        id: 'DEC-RET-04',
        code: 'DEC-104',
        titleAr: 'إعادة التفاوض الجماعي على أسعار كراتين التعبئة والتغليف',
        titleEn: 'Consolidated Packaging Procurement RFP Renegotiation',
        category: 'CONTRACT_RENEGOTIATION',
        categoryLabelAr: 'إعادة تفاوض تعاقدي',
        categoryLabelEn: 'Contract Renegotiation',
        capexRequiredSAR: 120000,
        expectedPaybackSAR: 890000,
        paybackPeriodMonths: 3.0,
        netGainSAR: 770000,
        roiPct: 641.7,
        capitalEfficiencyScore: 96,
        riskLevel: 'LOW',
        departmentAr: 'المشتريات المركزية',
        departmentEn: 'Central Procurement',
        assignedOwner: 'أ. خالد التميمي - مدير العقود والمشتريات',
        deadlineDays: 3,
        status: 'RECOMMENDED',
        doaAuthority: 'CFO',
        executiveRationaleAr: 'توحيد مواصفات الكراتين المضلعة لـ 60 صنفاً وطرح منافسة موحدة لمصانع البلاستيك والورق في الخرج وجدة.',
        executiveRationaleEn: 'Harmonizing corrugated box specifications across 60 SKU families into a unified volume RFP across Riyadh and Jeddah converters.',
        opportunityCostAr: 'دفع هامش تسعيري متضخم بنسبة 18% بسبب تشتت المشتريات بين الفروع.',
        opportunityCostEn: 'Paying 18% fragmented buying premium to regional distributors instead of mill-direct pricing.',
        statutoryFramework: 'سياسات الحوكمة والمشتريات المؤسسية المعتمدة',
        cryptographicSignHash: computeDeterministicHash('DEC-RET-04-PACKAGING-RFP')
      },
      {
        id: 'DEC-RET-05',
        code: 'DEC-105',
        titleAr: 'أتمتة جرد المستودعات المركزية بتقنية RFID وإنترنت الأشياء',
        titleEn: 'Central Warehouse Automated RFID Inventory Scanning',
        category: 'CAPITAL_ALLOCATION',
        categoryLabelAr: 'توجيه رأس المال',
        categoryLabelEn: 'Capital Allocation',
        capexRequiredSAR: 2400000,
        expectedPaybackSAR: 3600000,
        paybackPeriodMonths: 14.0,
        netGainSAR: 1200000,
        roiPct: 50.0,
        capitalEfficiencyScore: 68,
        riskLevel: 'HIGH',
        departmentAr: 'التحول الرقمي والمستودعات',
        departmentEn: 'Digital Logistics & Warehousing',
        assignedOwner: 'م. سامي الحربي - مدير تقنية المعلومات',
        deadlineDays: 14,
        status: 'RECOMMENDED',
        doaAuthority: 'CEO',
        executiveRationaleAr: 'نشر بوابات مسح RFID آلية في المستودع الرئيسي بالسلي لتقليص زمن الجرد السنوي من 5 أيام إلى 4 ساعات والقضاء على الفروقات.',
        executiveRationaleEn: 'Deploying RFID scanning tunnels at main DC in Sulai, reducing annual physical counts from 5 days to 4 hours and preventing phantom stock.',
        opportunityCostAr: 'تكرار عجز المخزون غير المكتشف والبالغ 920,000 ريال سنوياً.',
        opportunityCostEn: 'Recurring unidentified inventory shrinkage exceeding 920k SAR per fiscal cycle.',
        statutoryFramework: 'استراتيجية التحول الرقمي وأمن المعلومات (NCA ECC)',
        cryptographicSignHash: computeDeterministicHash('DEC-RET-05-RFID-INVENTORY')
      },
      {
        id: 'DEC-RET-06',
        code: 'DEC-106',
        titleAr: 'تأمين تغطية تقلب أسعار الطاقة والديزل للعام القادم',
        titleEn: 'Commercial Fuel & Energy Cost Hedging Framework',
        category: 'RISK_MITIGATION',
        categoryLabelAr: 'التحوط والحد من المخاطر',
        categoryLabelEn: 'Risk Mitigation',
        capexRequiredSAR: 600000,
        expectedPaybackSAR: 1450000,
        paybackPeriodMonths: 8.0,
        netGainSAR: 850000,
        roiPct: 141.7,
        capitalEfficiencyScore: 84,
        riskLevel: 'LOW',
        departmentAr: 'إدارة المخاطر والخزينة',
        departmentEn: 'Risk & Treasury',
        assignedOwner: 'د. عادل القحطاني - رئيس إدارة المخاطر',
        deadlineDays: 4,
        status: 'RECOMMENDED',
        doaAuthority: 'CFO',
        executiveRationaleAr: 'تثبيت أسعار وقود النقل الداخلي عبر اتفاقية توريد مباشر بأسعار ثابتة مع المحطات البترولية الكبرى لحماية هوامش التوصيل.',
        executiveRationaleEn: 'Fixing fleet diesel tariffs through direct corporate fuel agreements with national distributors to safeguard last-mile margins.',
        opportunityCostAr: 'تآكل هوامش الربح بنسبة 1.8% في حال حدوث أي تصحيح في أسعار مدخلات النقل.',
        opportunityCostEn: 'Gross margin erosion of 1.8% across transport logistics upon regional fuel index adjustment.',
        statutoryFramework: 'دليل سياسات التحوط المالي وإدارة مخاطر السوق',
        cryptographicSignHash: computeDeterministicHash('DEC-RET-06-FUEL-HEDGE')
      }
    ]
  },

  contracting: {
    nameAr: 'مجموعة المقاولات والمشاريع الكبرى (EPC)',
    nameEn: 'Infrastructure & EPC Contracting Conglomerate',
    industryAr: 'المقاولات والبنية التحتية والهندسة',
    industryEn: 'Infrastructure, Civil & Mega Projects',
    suggestedBudgetSAR: 12000000,
    descriptionAr: 'محفظة مشاريع إنشائية بقيمة 85 مليون ر.س ترتبط بمشاريع رؤية 2030 وتتطلب ترشيد شراء المعدات وإدارة مقاولي الباطن بحزم.',
    descriptionEn: 'Major Tier-1 EPC contractor executing 85M SAR infrastructure packages requiring strict sub-contractor enforcement and capex leasing discipline.',
    decisions: [
      {
        id: 'DEC-EPC-01',
        code: 'DEC-201',
        titleAr: 'استئجار الرافعات البرجية الثقيلة بدلاً من الشراء الرأسمالي لمشروع المترو',
        titleEn: 'Dry-Lease Heavy Tower Cranes Instead of Capex Acquisition',
        category: 'CAPITAL_ALLOCATION',
        categoryLabelAr: 'توجيه رأس المال',
        categoryLabelEn: 'Capital Allocation',
        capexRequiredSAR: 3800000,
        expectedPaybackSAR: 9200000,
        paybackPeriodMonths: 5.0,
        netGainSAR: 5400000,
        roiPct: 142.1,
        capitalEfficiencyScore: 95,
        riskLevel: 'LOW',
        departmentAr: 'المعدات وإدارة الأصول',
        departmentEn: 'Heavy Equipment & Plant',
        assignedOwner: 'م. عبدالمجيد الزهراني - مدير عام المعدات والآليات',
        deadlineDays: 3,
        status: 'RECOMMENDED',
        doaAuthority: 'CEO',
        executiveRationaleAr: 'الشراء الرأسمالي سيكلف 12.5M ريال ويستنزف السيولة البنكية. استئجار الرافعات يحرر 5.4M ريال سيولة نقدية ويخفض تكلفة الإهلاك الدفتري.',
        executiveRationaleEn: 'Capex purchase demands 12.5M SAR and exhausts bank credit lines. Dry-leasing frees 5.4M SAR net liquidity with zero post-project depreciation risk.',
        opportunityCostAr: 'تجميد السيولة في أصول بطيئة التصريف وصعوبة إعادة بيع الرافعات بعد انتهاء المشروع.',
        opportunityCostEn: 'Trapping liquid capital in illiquid heavy plant with severe secondary market residual value discount.',
        statutoryFramework: 'نظام المنافسات والمشتريات الحكومية / المعايير المحاسبية للمشاريع طويلة الأجل',
        cryptographicSignHash: computeDeterministicHash('DEC-EPC-01-CRANE-LEASE')
      },
      {
        id: 'DEC-EPC-02',
        code: 'DEC-202',
        titleAr: 'فرض غرامات التأخير واستبدال مقاول الأنظمة الكهروميكانيكية (MEP)',
        titleEn: 'Execute Delay Liquidated Damages & Subcontractor Replacement',
        category: 'CONTRACT_RENEGOTIATION',
        categoryLabelAr: 'إعادة تفاوض تعاقدي',
        categoryLabelEn: 'Contract Renegotiation',
        capexRequiredSAR: 1500000,
        expectedPaybackSAR: 4800000,
        paybackPeriodMonths: 3.5,
        netGainSAR: 3300000,
        roiPct: 220.0,
        capitalEfficiencyScore: 92,
        riskLevel: 'MEDIUM',
        departmentAr: 'إدارة المشاريع والعقود',
        departmentEn: 'PMO & Contracts',
        assignedOwner: 'م. ناصر الدوسري - مدير مشروع محطة المترو',
        deadlineDays: 2,
        status: 'RECOMMENDED',
        doaAuthority: 'BOARD',
        executiveRationaleAr: 'مقاول الباطن متأخر 48 يوماً عن المسار الحرج (Critical Path). تطبيق غرامة 10% وسحب الأعمال ينقذ المشروع من غرامة المالك الكبرى.',
        executiveRationaleEn: 'Subcontractor is 48 days behind Critical Path. Liquidating 10% performance bond and re-assigning work mitigates severe client penalty risk.',
        opportunityCostAr: 'تحمل غرامة تأخير من المالك بقيمة 120,000 ريال يومياً مع خطر سحب المشروع كاملاً.',
        opportunityCostEn: 'Facing client liquidated damages of 120k SAR/day with imminent risk of overall contract termination.',
        statutoryFramework: 'عقد فيديك الهندسي (FIDIC Red Book) / نظام المنافسات والمشتريات',
        cryptographicSignHash: computeDeterministicHash('DEC-EPC-02-MEP-SUB-TAKEOVER')
      },
      {
        id: 'DEC-EPC-03',
        code: 'DEC-203',
        titleAr: 'تثبيت أسعار حديد التسليح لـ 8 أشهر قادمة مع سابك وحديد الراجحي',
        titleEn: 'Execute 8-Month Rebar Volume Price-Lock Agreement',
        category: 'RISK_MITIGATION',
        categoryLabelAr: 'التحوط والحد من المخاطر',
        categoryLabelEn: 'Risk Mitigation',
        capexRequiredSAR: 4200000,
        expectedPaybackSAR: 6800000,
        paybackPeriodMonths: 6.0,
        netGainSAR: 2600000,
        roiPct: 61.9,
        capitalEfficiencyScore: 89,
        riskLevel: 'LOW',
        departmentAr: 'المشتريات الإنشائية',
        departmentEn: 'Construction Procurement',
        assignedOwner: 'أ. سلطان العتيبي - مدير المشتريات الاستراتيجية',
        deadlineDays: 4,
        status: 'RECOMMENDED',
        doaAuthority: 'CFO',
        executiveRationaleAr: 'توقيع اتفاقية تثبيت سعر لطن الحديد عند 2,420 ريال للطن لدفعة 14,000 طن، مما يقي ميزانية المشروع من موجة الارتفاع العالمية المتوقعة.',
        executiveRationaleEn: 'Locking rebar price at 2,420 SAR/ton across a 14,000-ton allocation, protecting gross project margin from global raw material inflation.',
        opportunityCostAr: 'احتمال زيادة سعر الطن إلى 2,750 ريال مما يولد عجزاً مالياً قدره 4.6 مليون ريال في بند التسليح.',
        opportunityCostEn: 'Spot price spikes to 2,750 SAR/ton triggering a direct unbudgeted variance of 4.6M SAR.',
        statutoryFramework: 'سياسات إدارة مخاطر المواد الأولية ومشتريات المشاريع الضخمة',
        cryptographicSignHash: computeDeterministicHash('DEC-EPC-03-REBAR-HEDGE')
      },
      {
        id: 'DEC-EPC-04',
        code: 'DEC-204',
        titleAr: 'التحول للتصنيع المسبق للعناصر الخرسانية (Precast) خارج الموقع',
        titleEn: 'Shift to Modular Off-Site Precast Structural Production',
        category: 'OPEX_OPTIMIZATION',
        categoryLabelAr: 'تحسين المصاريف التشغيلية',
        categoryLabelEn: 'Opex Optimization',
        capexRequiredSAR: 2100000,
        expectedPaybackSAR: 3900000,
        paybackPeriodMonths: 7.0,
        netGainSAR: 1800000,
        roiPct: 85.7,
        capitalEfficiencyScore: 86,
        riskLevel: 'MEDIUM',
        departmentAr: 'الإدارة الفنية والهندسة',
        departmentEn: 'Technical Engineering & Methods',
        assignedOwner: 'م. إبراهيم الخالدي - المدير الفني',
        deadlineDays: 6,
        status: 'RECOMMENDED',
        doaAuthority: 'CEO',
        executiveRationaleAr: 'صب الجدران الاستنادية والقواعد في مصنع مسبق الصنع يخفض ساعات العمالة الميدانية بـ 35% ويسرع تسليم مرحلة الأساسات بـ 4 أسابيع.',
        executiveRationaleEn: 'Off-site precasting reduces field manual man-hours by 35% and accelerates foundation substructure milestone delivery by 4 weeks.',
        opportunityCostAr: 'استمرار التكاليف غير المباشرة لإعاشة العمالة والسكن الميداني بقيمة 180,000 ريال شهرياً.',
        opportunityCostEn: 'Ongoing site overhead, manpower accommodation and scaffolding rental running at 180k SAR/month.',
        statutoryFramework: 'كود البناء السعودي (SBC) / اشتراطات الجودة والسلامة المهنية',
        cryptographicSignHash: computeDeterministicHash('DEC-EPC-04-PRECAST-SHIFT')
      }
    ]
  },

  industrial: {
    nameAr: 'مجمع الصناعات البتروكيماوية والميكانيكية',
    nameEn: 'Petrochemical & Heavy Industrial Complex',
    industryAr: 'التصنيع والخدمات الصناعية والبتروكيماوية',
    industryEn: 'Heavy Manufacturing & Process Plants',
    suggestedBudgetSAR: 10000000,
    descriptionAr: 'منشآت تصنيع في الجبيل وينبع بإنفاق تشغيلي يتجاوز 210 مليون ر.س تركز على خفض استهلاك الطاقة وأتمتة الصيانة التنبؤية.',
    descriptionEn: 'Continuous process industrial plants in Jubail & Yanbu with 210M SAR opex targeting energy efficiency, heat recovery, and predictive maintenance.',
    decisions: [
      {
        id: 'DEC-IND-01',
        code: 'DEC-301',
        titleAr: 'أتمتة خط التعبئة والتغليف النهائي بمصنع ينبع (Robotic Palletizing)',
        titleEn: 'Automated Robotic Palletizing Line for Yanbu Polymers Facility',
        category: 'CAPITAL_ALLOCATION',
        categoryLabelAr: 'توجيه رأس المال',
        categoryLabelEn: 'Capital Allocation',
        capexRequiredSAR: 4500000,
        expectedPaybackSAR: 10200000,
        paybackPeriodMonths: 9.0,
        netGainSAR: 5700000,
        roiPct: 126.7,
        capitalEfficiencyScore: 93,
        riskLevel: 'LOW',
        departmentAr: 'هندسة العمليات والإنتاج',
        departmentEn: 'Plant Operations & Production',
        assignedOwner: 'م. حسام الشهري - مدير مجمع مصانع ينبع',
        deadlineDays: 4,
        status: 'RECOMMENDED',
        doaAuthority: 'CEO',
        executiveRationaleAr: 'تركيب 4 أذرع روبوتية للتعبئة يخفض تكلفة العمالة المباشرة بـ 28% ويرفع الطاقة الإنتاجية للفرز والتغليف من 600 إلى 1,400 كيس/ساعة.',
        executiveRationaleEn: 'Installing 4 robotic palletizers reduces manual packing shifts by 28% and scales output throughput from 600 to 1,400 bags/hour with zero downtime.',
        opportunityCostAr: 'خسارة عقود تصدير خارجية بقيمة 4.2 مليون ريال بسبب عنق زجاجة التعبئة اليدوية الحالية.',
        opportunityCostEn: 'Missing export supply window worth 4.2M SAR due to manual packaging bottlenecks at export docks.',
        statutoryFramework: 'استراتيجية الصناعة الوطنية (برنامج ندلب NIDLP) / حوافز صندوق التنمية الصناعية (SIDF)',
        cryptographicSignHash: computeDeterministicHash('DEC-IND-01-ROBOTIC-PALLET')
      },
      {
        id: 'DEC-IND-02',
        code: 'DEC-302',
        titleAr: 'استرجاع الحرارة المهدرة من المداخن لتوليد البخار التشغيلي (Waste Heat Recovery)',
        titleEn: 'Flue Gas Waste Heat Recovery Steam Generation System',
        category: 'OPEX_OPTIMIZATION',
        categoryLabelAr: 'تحسين المصاريف التشغيلية',
        categoryLabelEn: 'Opex Optimization',
        capexRequiredSAR: 3200000,
        expectedPaybackSAR: 6800000,
        paybackPeriodMonths: 11.0,
        netGainSAR: 3600000,
        roiPct: 112.5,
        capitalEfficiencyScore: 87,
        riskLevel: 'LOW',
        departmentAr: 'المرافق والطاقة المستدامة',
        departmentEn: 'Utilities & Sustainability',
        assignedOwner: 'د. مروان بكر - رئيس قطاع كفاءة الطاقة',
        deadlineDays: 7,
        status: 'RECOMMENDED',
        doaAuthority: 'BOARD',
        executiveRationaleAr: 'تركيب مبادل حراري لاستغلال غازات العادم يخفض استهلاك الغاز الطبيعي بـ 19% ويحقق متطلبات المركز السعودي لكفاءة الطاقة (SEEC).',
        executiveRationaleEn: 'Retrofitting economizers captures stack exhaust heat, reducing fuel gas intake by 19% and meeting Saudi Energy Efficiency Center (SEEC) benchmarks.',
        opportunityCostAr: 'غرامات تدقيق الطاقة البيئية وفقدان 280,000 ريال شهرياً كطاقة حرارية مهدورة.',
        opportunityCostEn: 'Energy non-compliance surcharges plus 280k SAR monthly waste in unrecovered high-enthalpy thermal gas.',
        statutoryFramework: 'المعايير الوطنية لكفاءة الطاقة (SEEC) / اللائحة البيئية للهيئة الملكية بالجبيل وينبع',
        cryptographicSignHash: computeDeterministicHash('DEC-IND-02-HEAT-RECOVERY')
      },
      {
        id: 'DEC-IND-03',
        code: 'DEC-303',
        titleAr: 'تطبيق الصيانة التنبؤية القائمة على مستشعرات الاهتزاز والحرارة (IIoT)',
        titleEn: 'Predictive Vibration & Ultrasound Asset Monitoring Deployment',
        category: 'RISK_MITIGATION',
        categoryLabelAr: 'التحوط والحد من المخاطر',
        categoryLabelEn: 'Risk Mitigation',
        capexRequiredSAR: 1400000,
        expectedPaybackSAR: 4900000,
        paybackPeriodMonths: 4.5,
        netGainSAR: 3500000,
        roiPct: 250.0,
        capitalEfficiencyScore: 94,
        riskLevel: 'LOW',
        departmentAr: 'الصيانة والاعتمادية',
        departmentEn: 'Reliability Engineering & Maintenance',
        assignedOwner: 'م. بندر المري - كبير مهندسي الاعتمادية',
        deadlineDays: 3,
        status: 'RECOMMENDED',
        doaAuthority: 'CFO',
        executiveRationaleAr: 'مراقبة التوربينات والمضخات الحرجة لاسلكياً لاكتشاف اهتراء المحامل قبل 3 أسابيع من التوقف المفاجئ الذي يكلف 1.2M ريال يومياً.',
        executiveRationaleEn: 'Wireless monitoring on rotating machinery provides 3-week advance bearing failure notice, avoiding 1.2M SAR/day unbudgeted plant shutdowns.',
        opportunityCostAr: 'خطر حدوث توقف مفاجئ للخط الرئيسي قد يكبد المنشأة خسائر تتجاوز 7 ملايين ريال في دورة إنتاجية واحدة.',
        opportunityCostEn: 'Catastrophic failure risk on primary reactor feed pumps risking 7M SAR in spoiled product batches.',
        statutoryFramework: 'معايير إدارة الأصول المادية ISO 55001 / كود السلامة الصناعية العليا (HCIS)',
        cryptographicSignHash: computeDeterministicHash('DEC-IND-03-PREDICTIVE-IIOT')
      }
    ]
  }
};

// ── Deterministic Knapsack & Capital Budget Optimizer ─────────────────────────

export function optimizeCapitalAllocation(
  decisions: ExecutiveDecision[],
  availableBudgetSAR: number
): CapitalAllocationResult {
  // Sort by Capital Efficiency Score descending, then by ROI descending
  const sorted = [...decisions].sort((a, b) => {
    if (b.capitalEfficiencyScore !== a.capitalEfficiencyScore) {
      return b.capitalEfficiencyScore - a.capitalEfficiencyScore;
    }
    return b.roiPct - a.roiPct;
  });

  let currentBudgetLeft = availableBudgetSAR;
  const allocated: ExecutiveDecision[] = [];
  const unallocated: ExecutiveDecision[] = [];

  for (const item of sorted) {
    if (item.capexRequiredSAR <= currentBudgetLeft) {
      allocated.push({ ...item, status: 'APPROVED' });
      currentBudgetLeft -= item.capexRequiredSAR;
    } else {
      unallocated.push(item);
    }
  }

  const allocatedCapex = allocated.reduce((sum, d) => sum + d.capexRequiredSAR, 0);
  const projectedReturn = allocated.reduce((sum, d) => sum + d.expectedPaybackSAR, 0);
  const netValueCreation = projectedReturn - allocatedCapex;
  const portfolioRoi = allocatedCapex > 0 ? (netValueCreation / allocatedCapex) * 100 : 0;
  
  const avgEfficiency = allocated.length
    ? Math.round(allocated.reduce((sum, d) => sum + d.capitalEfficiencyScore, 0) / allocated.length)
    : 0;

  return {
    availableBudgetSAR,
    allocatedCapexSAR: allocatedCapex,
    remainingBudgetSAR: currentBudgetLeft,
    projectedTotalReturnSAR: projectedReturn,
    netValueCreationSAR: netValueCreation,
    portfolioRoiPct: Math.round(portfolioRoi * 10) / 10,
    allocatedDecisions: allocated,
    unallocatedDecisions: unallocated,
    efficiencyIndex: avgEfficiency
  };
}

// ── Comparative Trade-off Analysis ───────────────────────────────────────────

export function compareDecisionTradeoffs(
  decisionA: ExecutiveDecision,
  decisionB: ExecutiveDecision
): DecisionTradeoffAnalysis {
  const capexDiff = decisionA.capexRequiredSAR - decisionB.capexRequiredSAR;
  const netGainDiff = decisionA.netGainSAR - decisionB.netGainSAR;
  const roiDiff = Math.round((decisionA.roiPct - decisionB.roiPct) * 10) / 10;
  
  let speedWinner: 'A' | 'B' | 'TIE' = 'TIE';
  if (decisionA.paybackPeriodMonths < decisionB.paybackPeriodMonths) speedWinner = 'A';
  else if (decisionB.paybackPeriodMonths < decisionA.paybackPeriodMonths) speedWinner = 'B';

  const recommendedChoice: 'A' | 'B' =
    decisionA.capitalEfficiencyScore >= decisionB.capitalEfficiencyScore ? 'A' : 'B';

  const recDecision = recommendedChoice === 'A' ? decisionA : decisionB;
  const otherDecision = recommendedChoice === 'A' ? decisionB : decisionA;

  const comparativeRationaleAr = `الخيار (${recDecision.code}) يتفوق بمؤشر كفاءة ${recDecision.capitalEfficiencyScore} مقابل ${otherDecision.capitalEfficiencyScore}، محققاً صافي قيمة إضافية قدرها ${Math.abs(netGainDiff).toLocaleString('ar-SA')} ر.س مع عائد استثماري يبلغ ${recDecision.roiPct.toFixed(1)}%.`;
  const comparativeRationaleEn = `Option (${recDecision.code}) outperforms with an efficiency index of ${recDecision.capitalEfficiencyScore} vs ${otherDecision.capitalEfficiencyScore}, capturing additional net value of ${Math.abs(netGainDiff).toLocaleString('en-US')} SAR with ${recDecision.roiPct.toFixed(1)}% ROI.`;

  return {
    decisionA,
    decisionB,
    capexDifferenceSAR: capexDiff,
    netGainDifferenceSAR: netGainDiff,
    roiDifferencePct: roiDiff,
    paybackSpeedWinner: speedWinner,
    recommendedChoice,
    comparativeRationaleAr,
    comparativeRationaleEn
  };
}

// ── Real CSV Parser for Custom Executive Portfolios ───────────────────────────

export function parseDecisionsCsv(csvContent: string): ExecutiveDecision[] {
  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());

  const getColIdx = (aliases: string[]) => {
    return header.findIndex((h) => aliases.some((a) => h.includes(a)));
  };

  const codeIdx = getColIdx(['code', 'id', 'ref', 'رقم', 'كود']);
  const titleIdx = getColIdx(['title', 'name', 'initiative', 'decision', 'عنوان', 'مبادرة', 'قرار']);
  const capexIdx = getColIdx(['capex', 'cost', 'investment', 'required', 'تكلفة', 'استثمار', 'مبلغ']);
  const returnIdx = getColIdx(['return', 'payback', 'savings', 'عائد', 'استرداد', 'وفر']);
  const monthsIdx = getColIdx(['months', 'period', 'duration', 'فترة', 'أشهر', 'مدة']);
  const deptIdx = getColIdx(['dept', 'department', 'قسم', 'إدارة']);
  const ownerIdx = getColIdx(['owner', 'assignee', 'manager', 'مسؤول', 'المكلف']);
  const riskIdx = getColIdx(['risk', 'مخاطرة', 'مخاطر']);

  const decisions: ExecutiveDecision[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    if (row.length < 3) continue;

    const code = (codeIdx !== -1 && row[codeIdx]) ? row[codeIdx] : `DEC-${100 + i}`;
    const title = (titleIdx !== -1 && row[titleIdx]) ? row[titleIdx] : `مبادرة استراتيجية رقم ${i}`;
    const capex = (capexIdx !== -1 && !isNaN(parseFloat(row[capexIdx]))) ? parseFloat(row[capexIdx]) : 500000;
    const payback = (returnIdx !== -1 && !isNaN(parseFloat(row[returnIdx]))) ? parseFloat(row[returnIdx]) : capex * 1.5;
    const months = (monthsIdx !== -1 && !isNaN(parseFloat(row[monthsIdx]))) ? Math.max(1, parseFloat(row[monthsIdx])) : 6;
    const dept = (deptIdx !== -1 && row[deptIdx]) ? row[deptIdx] : 'الإدارة العامة';
    const owner = (ownerIdx !== -1 && row[ownerIdx]) ? row[ownerIdx] : 'المدير التنفيذي المعني';
    
    let risk: DecisionRiskLevel = 'LOW';
    if (riskIdx !== -1 && row[riskIdx]) {
      const r = row[riskIdx].toLowerCase();
      if (r.includes('high') || r.includes('عالي') || r.includes('حرجة')) risk = 'HIGH';
      else if (r.includes('med') || r.includes('متوسط')) risk = 'MEDIUM';
    }

    const netGain = payback - capex;
    const roi = capex > 0 ? (netGain / capex) * 100 : 100;
    const efficiency = computeCapitalEfficiencyScore(capex, payback, months, risk);
    
    let doa: DoaAuthority = 'CFO';
    if (capex >= 5000000) doa = 'BOARD';
    else if (capex >= 1500000) doa = 'CEO';
    else if (capex >= 500000) doa = 'CFO';
    else doa = 'VP_OPS';

    decisions.push({
      id: `CSV-DEC-${i}`,
      code,
      titleAr: title,
      titleEn: title,
      category: 'CAPITAL_ALLOCATION',
      categoryLabelAr: 'توجيه رأس المال',
      categoryLabelEn: 'Capital Allocation',
      capexRequiredSAR: capex,
      expectedPaybackSAR: payback,
      paybackPeriodMonths: months,
      netGainSAR: netGain,
      roiPct: Math.round(roi * 10) / 10,
      capitalEfficiencyScore: efficiency,
      riskLevel: risk,
      departmentAr: dept,
      departmentEn: dept,
      assignedOwner: owner,
      deadlineDays: 7,
      status: 'RECOMMENDED',
      doaAuthority: doa,
      executiveRationaleAr: `تحليل مالي مستورد من دفتر القرارات المرفوع: المبادرة تتطلب ${capex.toLocaleString('ar-SA')} ر.س بعائد متوقع ${payback.toLocaleString('ar-SA')} ر.س خلال ${months} أشهر.`,
      executiveRationaleEn: `Uploaded portfolio entry: Initiative demands ${capex.toLocaleString('en-US')} SAR with projected cash generation of ${payback.toLocaleString('en-US')} SAR over ${months} months.`,
      opportunityCostAr: 'تأخير التنفيذ يؤدي إلى تفويت العائد الشهري المقدر واحتجاز رأس المال في أنشطة أقل كفاءة.',
      opportunityCostEn: 'Execution slippage results in missed monthly yield and traps capital in suboptimal activities.',
      statutoryFramework: 'لائحة تفويض الصلاحيات المالية والمشتريات (DoA)',
      cryptographicSignHash: computeDeterministicHash(`CSV-${code}-${capex}`)
    });
  }

  return decisions;
}
