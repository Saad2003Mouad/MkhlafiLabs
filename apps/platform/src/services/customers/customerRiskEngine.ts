// MIKHLAFI LABS — Enterprise Customer Health, Receivables Aging & Silent Churn Prevention Engine (Service 06)
// Deterministic Algorithms: Multivariate Customer Health Score (CHS 0-100),
// Order Frequency Velocity Decay Telemetry, Days Sales Outstanding (DSO) Credit Exposure,
// Executive Account Retention Revenue Simulator, and Board-Ready Commercial Governance Dossiers.

export type AccountTier = 'STRATEGIC_KEY_ACCOUNT' | 'ENTERPRISE_COMMERCIAL' | 'MID_MARKET';
export type CustomerHealthStatus = 'HEALTHY' | 'AT_RISK' | 'CRITICAL_CHURN';
export type CreditRiskCategory = 'SECURE' | 'MODERATE_AGING' | 'HIGH_DELINQUENCY';

export interface CustomerAccountRecord {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  industryAr: string;
  industryEn: string;
  tier: AccountTier;
  annualContractValueSAR: number;
  monthlyBaselineSpendSAR: number;
  recentMonthlySpendSAR: number;
  spendVelocityDecayPct: number; // e.g. -24.5% drop from baseline
  healthScore: number; // 0 to 100
  healthStatus: CustomerHealthStatus;
  daysSalesOutstanding: number; // DSO in days
  creditLimitSAR: number;
  outstandingReceivablesSAR: number;
  overdueReceivablesSAR: number; // > 60 days
  daysUntilContractRenewal: number;
  activeDisputedInvoicesCount: number;
  creditRisk: CreditRiskCategory;
  primaryDecayFactorAr: string;
  primaryDecayFactorEn: string;
  recommendedPlaybookAr: string;
  recommendedPlaybookEn: string;
  assignedAccountDirector: string;
  commercialRegistrationCR: string;
  cryptographicProofHash: string;
}

export interface PortfolioCustomerMetrics {
  totalMonitoredRevenueSAR: number;
  totalAccountCount: number;
  totalRevenueAtRiskSAR: number;
  projectedRetainedRevenueSAR: number; // revenue protected via slider
  portfolioAvgHealthScore: number;
  criticalChurnAccountCount: number;
  atRiskAccountCount: number;
  healthyAccountCount: number;
  totalOverdueReceivablesSAR: number;
  avgDaysSalesOutstanding: number;
}

function computeCustomerHash(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex1 = Math.abs(hash).toString(16).padStart(8, '0');
  const hex2 = Math.abs(hash * 43).toString(16).padStart(8, '0');
  return `ACC-${hex1.toUpperCase()}-${hex2.toUpperCase()}`;
}

// ── Realistic Pre-Seeded Saudi Enterprise Customer Portfolios ────────────────

export const PRESET_CUSTOMER_SCENARIOS: Record<
  string,
  {
    nameAr: string;
    nameEn: string;
    industryAr: string;
    industryEn: string;
    descriptionAr: string;
    descriptionEn: string;
    accounts: CustomerAccountRecord[];
  }
> = {
  b2b_tech: {
    nameAr: 'حلول التقنية والاتصالات المؤسسية (B2B Enterprise Technology)',
    nameEn: 'Enterprise Tech & Telecommunications Portfolio',
    industryAr: 'تقنية المعلومات، الحوسبة السحابية، وشبكات الاتصالات للشركات',
    industryEn: 'Cloud Infrastructure, Cybersecurity & Telecom Managed Services',
    descriptionAr: 'محفظة عملاء شركات بقيمة 65 مليون ر.س تشمل بنوكاً وجهات شبه حكومية، تعاني من مؤشرات انسحاب صامت لبنكين وتراجع وتيرة الطلبات بنسبة 35%.',
    descriptionEn: '65M SAR ARR portfolio featuring major banking and quasi-government accounts showing subtle 35% order decay prior to annual renewal.',
    accounts: [
      {
        id: 'CUST-TECH-01',
        code: 'ACC-101',
        nameAr: 'بنك الرياض الاستثماري — قطاع الخزينة والتحول الرقمي',
        nameEn: 'Riyadh Investment Bank — Digital Treasury Div.',
        industryAr: 'الخدمات المصرفية والاستثمارية',
        industryEn: 'Banking & Financial Services',
        tier: 'STRATEGIC_KEY_ACCOUNT',
        annualContractValueSAR: 18500000,
        monthlyBaselineSpendSAR: 1540000,
        recentMonthlySpendSAR: 980000,
        spendVelocityDecayPct: -36.4,
        healthScore: 42,
        healthStatus: 'CRITICAL_CHURN',
        daysSalesOutstanding: 88,
        creditLimitSAR: 5000000,
        outstandingReceivablesSAR: 4200000,
        overdueReceivablesSAR: 2100000,
        daysUntilContractRenewal: 48,
        activeDisputedInvoicesCount: 3,
        creditRisk: 'HIGH_DELINQUENCY',
        primaryDecayFactorAr: 'هبوط حاد في استهلاك سعة السحابة بنسبة 36.4% وتأخر سداد الفواتير لـ 88 يوماً قبل موعد التجديد بـ 48 يوماً.',
        primaryDecayFactorEn: '36.4% cloud capacity spend contraction and 88-day DSO aging with renewal deadline 48 days away.',
        recommendedPlaybookAr: 'جدولة اجتماع فوري بين الرئيس التنفيذي ومساعد محافظ البنك مع حل نزاع فاتورة الصيانة وتقديم ترقية أمنية مجانية.',
        recommendedPlaybookEn: 'Executive C-level alignment meeting with Bank CIO, resolve disputed billing and offer complimentary cyber audit upgrade.',
        assignedAccountDirector: 'م. فهد الهذلول - مدير كبار عملاء القطاع المالي',
        commercialRegistrationCR: '1010001244',
        cryptographicProofHash: computeCustomerHash('ACC-101-BANK')
      },
      {
        id: 'CUST-TECH-02',
        code: 'ACC-102',
        nameAr: 'مجموعة المستشفيات الطبية التخصصية القابضة',
        nameEn: 'Specialized Healthcare Group Holding',
        industryAr: 'الرعاية الصحية والمستشفيات الخاصة',
        industryEn: 'Private Healthcare & Clinical Systems',
        tier: 'STRATEGIC_KEY_ACCOUNT',
        annualContractValueSAR: 14200000,
        monthlyBaselineSpendSAR: 1180000,
        recentMonthlySpendSAR: 890000,
        spendVelocityDecayPct: -24.6,
        healthScore: 56,
        healthStatus: 'AT_RISK',
        daysSalesOutstanding: 62,
        creditLimitSAR: 3500000,
        outstandingReceivablesSAR: 2800000,
        overdueReceivablesSAR: 950000,
        daysUntilContractRenewal: 75,
        activeDisputedInvoicesCount: 1,
        creditRisk: 'MODERATE_AGING',
        primaryDecayFactorAr: 'تراجع طلبيات ترخيص البرمجيات بـ 24.6% ووجود شكاوى عالقة حول بطء استجابة الدعم الفني في فرع جدة.',
        primaryDecayFactorEn: '24.6% software seat contraction alongside open support SLA tickets regarding Jeddah branch uptime.',
        recommendedPlaybookAr: 'تخصيص مهندس دعم ميداني مقيم (Dedicated Site Engineer) وتقديم تسعيرة حجم تفضيلية للمستشفيات الجديدة.',
        recommendedPlaybookEn: 'Assign dedicated resident on-site engineer and restructure tiered enterprise license pricing for expansion units.',
        assignedAccountDirector: 'أ. لمى القحطاني - مسؤولة حسابات القطاع الصحي',
        commercialRegistrationCR: '1010394812',
        cryptographicProofHash: computeCustomerHash('ACC-102-HEALTH')
      },
      {
        id: 'CUST-TECH-03',
        code: 'ACC-103',
        nameAr: 'الشركة السعودية لخدمات النقل والخدمات اللوجستية',
        nameEn: 'Saudi Freight & Supply Chain Logistics Corp',
        industryAr: 'النقل واللوجستيات والمستودعات الذكية',
        industryEn: 'Logistics & Fleet Telematics',
        tier: 'ENTERPRISE_COMMERCIAL',
        annualContractValueSAR: 12000000,
        monthlyBaselineSpendSAR: 1000000,
        recentMonthlySpendSAR: 1040000,
        spendVelocityDecayPct: 4.0,
        healthScore: 89,
        healthStatus: 'HEALTHY',
        daysSalesOutstanding: 34,
        creditLimitSAR: 2500000,
        outstandingReceivablesSAR: 1200000,
        overdueReceivablesSAR: 0,
        daysUntilContractRenewal: 140,
        activeDisputedInvoicesCount: 0,
        creditRisk: 'SECURE',
        primaryDecayFactorAr: 'أداء ممتاز، سداد منضبط في 34 يوماً، وتوسع في استخدام حلول تتبع الأسطول الذكي.',
        primaryDecayFactorEn: 'Pristine health metrics, 34-day prompt DSO, and ongoing expansion in IoT fleet sensors.',
        recommendedPlaybookAr: 'عرض حزمة التوسع بالذكاء الاصطناعي (AI Fleet Route Optimizer) لتوسيع قيمة العقد بـ 2.5M ريال.',
        recommendedPlaybookEn: 'Pitch predictive AI route optimization suite to up-sell contract value by additional 2.5M SAR.',
        assignedAccountDirector: 'م. عبدالله السبيعي - مدير الحسابات اللوجستية',
        commercialRegistrationCR: '2050192834',
        cryptographicProofHash: computeCustomerHash('ACC-103-LOGISTICS')
      },
      {
        id: 'CUST-TECH-04',
        code: 'ACC-104',
        nameAr: 'شركة المدارس والجامعات الأهلية المتقدمة',
        nameEn: 'Advanced Private Education & Universities',
        industryAr: 'التعليم والتدريب الرقمي',
        industryEn: 'Higher Education & EdTech',
        tier: 'ENTERPRISE_COMMERCIAL',
        annualContractValueSAR: 11500000,
        monthlyBaselineSpendSAR: 958000,
        recentMonthlySpendSAR: 680000,
        spendVelocityDecayPct: -29.0,
        healthScore: 48,
        healthStatus: 'CRITICAL_CHURN',
        daysSalesOutstanding: 95,
        creditLimitSAR: 2000000,
        outstandingReceivablesSAR: 1950000,
        overdueReceivablesSAR: 1400000,
        daysUntilContractRenewal: 35,
        activeDisputedInvoicesCount: 2,
        creditRisk: 'HIGH_DELINQUENCY',
        primaryDecayFactorAr: 'تأخر سداد تجاوز سقف الائتمان مع تراكم فواتير متعثرة لـ 95 يوماً وتراجع الفصول الافتراضية بنسبة 29%.',
        primaryDecayFactorEn: 'Receivables crossing credit ceiling with 95-day delinquency and 29% decline in virtual classroom licenses.',
        recommendedPlaybookAr: 'إلزام العميل بجدولة سداد نقدية 50% كشرط لتجديد البوابة السنوية وإيقاف فتح حسابات جديدة.',
        recommendedPlaybookEn: 'Condition renewal on 50% upfront arrears settlement and restructure platform SLA billing.',
        assignedAccountDirector: 'أ. نورة الغامدي - رئيس قطاع التعليم',
        commercialRegistrationCR: '1010482910',
        cryptographicProofHash: computeCustomerHash('ACC-104-EDTECH')
      },
      {
        id: 'CUST-TECH-05',
        code: 'ACC-105',
        nameAr: 'مؤسسة التطوير العقاري والمراكز التجارية',
        nameEn: 'Commercial Real Estate & Malls Development',
        industryAr: 'إدارة وتأجير العقارات التجارية',
        industryEn: 'Commercial Real Estate & Retail Centers',
        tier: 'MID_MARKET',
        annualContractValueSAR: 8800000,
        monthlyBaselineSpendSAR: 733000,
        recentMonthlySpendSAR: 710000,
        spendVelocityDecayPct: -3.1,
        healthScore: 82,
        healthStatus: 'HEALTHY',
        daysSalesOutstanding: 42,
        creditLimitSAR: 1500000,
        outstandingReceivablesSAR: 850000,
        overdueReceivablesSAR: 0,
        daysUntilContractRenewal: 190,
        activeDisputedInvoicesCount: 0,
        creditRisk: 'SECURE',
        primaryDecayFactorAr: 'استقرار تشغيلي وسداد منتظم ضمن شروط الائتمان المعتمدة.',
        primaryDecayFactorEn: 'Stable operational cadence and prompt adherence to approved commercial credit terms.',
        recommendedPlaybookAr: 'تأمين تجديد مبكر للعقد السنوي بخصم 5% مقابل التوقيع لمدة سنتين متتاليتين.',
        recommendedPlaybookEn: 'Lock in multi-year 24-month renewal early in exchange for 5% enterprise term incentive.',
        assignedAccountDirector: 'م. فهد الهذلول - مدير كبار العملاء',
        commercialRegistrationCR: '1010293847',
        cryptographicProofHash: computeCustomerHash('ACC-105-PROPERTY')
      }
    ]
  },

  wholesale_distribution: {
    nameAr: 'تجارة الجملة والتوزيع اللوجستي (Wholesale & Distribution)',
    nameEn: 'Wholesale Commercial Distribution Portfolio',
    industryAr: 'تجارة الجملة، التوريدات السريعة، والمواد الغذائية',
    industryEn: 'Wholesale Trade, FMCG & Commercial Bulk Supply',
    descriptionAr: 'محفظة مستحقات عملاء بقيمة 92 مليون ر.س تعاني من تباطؤ سداد سلاسل التموينات وارتفاع متوسط DSO إلى 78 يوماً مع مخاطر ديون معدومة.',
    descriptionEn: '92M SAR B2B receivables ledger facing supermarket chain aging drift and DSO spike to 78 days.',
    accounts: [
      {
        id: 'CUST-WHL-01',
        code: 'ACC-201',
        nameAr: 'شركة أسواق التموين المركزية للمنطقة الغربية',
        nameEn: 'Western Province Hypermarkets Network',
        industryAr: 'سلاسل السوبرماركت والتجزئة الكبرى',
        industryEn: 'Retail Supermarket Chain',
        tier: 'STRATEGIC_KEY_ACCOUNT',
        annualContractValueSAR: 32000000,
        monthlyBaselineSpendSAR: 2660000,
        recentMonthlySpendSAR: 1750000,
        spendVelocityDecayPct: -34.2,
        healthScore: 44,
        healthStatus: 'CRITICAL_CHURN',
        daysSalesOutstanding: 104,
        creditLimitSAR: 8000000,
        outstandingReceivablesSAR: 7800000,
        overdueReceivablesSAR: 4100000,
        daysUntilContractRenewal: 40,
        activeDisputedInvoicesCount: 4,
        creditRisk: 'HIGH_DELINQUENCY',
        primaryDecayFactorAr: 'تجاوز فترة السداد لـ 104 أيام مع هبوط الطلبيات بنسبة 34.2% ونقل جزء من التوريد لموزع محلي منافس.',
        primaryDecayFactorEn: 'DSO protracted to 104 days with 34.2% order contraction and volume siphoned to regional competitor.',
        recommendedPlaybookAr: 'إيقاف التوريد بالآجل فوراً وإلزام العميل بسداد 2M ريال كاش قبل شحن طلبيات الأسبوع القادم.',
        recommendedPlaybookEn: 'Enforce immediate credit stop, demand 2M SAR cash arrears payment before releasing next dispatch.',
        assignedAccountDirector: 'أ. طارق العمري - مدير المبيعات الإقليمية',
        commercialRegistrationCR: '4030192831',
        cryptographicProofHash: computeCustomerHash('ACC-201-WESTERN')
      },
      {
        id: 'CUST-WHL-02',
        code: 'ACC-202',
        nameAr: 'مؤسسة الإعاشة والتوريدات الفندقية والضيافة',
        nameEn: 'Hospitality Catering & Hotel Bulk Procurement',
        industryAr: 'الفنادق، المنتجعات، وخدمات الضيافة الكبرى',
        industryEn: 'Hospitality & Luxury Resorts Sourcing',
        tier: 'STRATEGIC_KEY_ACCOUNT',
        annualContractValueSAR: 24000000,
        monthlyBaselineSpendSAR: 2000000,
        recentMonthlySpendSAR: 1520000,
        spendVelocityDecayPct: -24.0,
        healthScore: 58,
        healthStatus: 'AT_RISK',
        daysSalesOutstanding: 72,
        creditLimitSAR: 5000000,
        outstandingReceivablesSAR: 4100000,
        overdueReceivablesSAR: 1200000,
        daysUntilContractRenewal: 65,
        activeDisputedInvoicesCount: 1,
        creditRisk: 'MODERATE_AGING',
        primaryDecayFactorAr: 'تراجع طلبيات اللحوم والمجمدات بنسبة 24% نتيجة تأخر توريدات الصباح الباكر.',
        primaryDecayFactorEn: '24% contraction in protein items resulting from recurring morning transit delays.',
        recommendedPlaybookAr: 'تعديل نافذة التسليم إلى الساعة 4:00 فجراً وتقديم جدول تسوية للدين المتعثر على 3 دفعات.',
        recommendedPlaybookEn: 'Reschedule delivery window to 4:00 AM dedicated route and structure 3-part receivables amortization.',
        assignedAccountDirector: 'م. زياد الحربي - مدير قطاع الضيافة',
        commercialRegistrationCR: '1010392812',
        cryptographicProofHash: computeCustomerHash('ACC-202-HOTELS')
      },
      {
        id: 'CUST-WHL-03',
        code: 'ACC-203',
        nameAr: 'شركة المخابز والحلويات الصناعية الوطنية',
        nameEn: 'National Industrial Bakeries & Confectionery',
        industryAr: 'الصناعات الغذائية والمخابز الآلية',
        industryEn: 'Commercial Bakeries & Food Processing',
        tier: 'ENTERPRISE_COMMERCIAL',
        annualContractValueSAR: 19500000,
        monthlyBaselineSpendSAR: 1625000,
        recentMonthlySpendSAR: 1680000,
        spendVelocityDecayPct: 3.4,
        healthScore: 91,
        healthStatus: 'HEALTHY',
        daysSalesOutstanding: 28,
        creditLimitSAR: 4000000,
        outstandingReceivablesSAR: 1800000,
        overdueReceivablesSAR: 0,
        daysUntilContractRenewal: 180,
        activeDisputedInvoicesCount: 0,
        creditRisk: 'SECURE',
        primaryDecayFactorAr: 'عميل استراتيجي عالي الانضباط، سداد دوري ممتاز خلال 28 يوماً، ونمو مستمر في حجم الاستهلاك.',
        primaryDecayFactorEn: 'Elite Tier-1 account with spotless 28-day DSO and organic volume growth.',
        recommendedPlaybookAr: 'تثبيت أسعار الدقيق والسكر للسنة القادمة بموجب عقد توريد حصري طويل الأجل.',
        recommendedPlaybookEn: 'Lock in flour and sugar pricing via long-term exclusive supply framework agreement.',
        assignedAccountDirector: 'أ. طارق العمري - مدير المبيعات الإقليمية',
        commercialRegistrationCR: '2050293841',
        cryptographicProofHash: computeCustomerHash('ACC-203-BAKERY')
      },
      {
        id: 'CUST-WHL-04',
        code: 'ACC-204',
        nameAr: 'سلسلة مطاعم الوجبات السريعة والامتياز التجاري',
        nameEn: 'Fast Casual Franchise Restaurant Chain',
        industryAr: 'المطاعم والفرانشايز',
        industryEn: 'Quick Service Restaurants (QSR)',
        tier: 'ENTERPRISE_COMMERCIAL',
        annualContractValueSAR: 16500000,
        monthlyBaselineSpendSAR: 1375000,
        recentMonthlySpendSAR: 1120000,
        spendVelocityDecayPct: -18.5,
        healthScore: 65,
        healthStatus: 'AT_RISK',
        daysSalesOutstanding: 68,
        creditLimitSAR: 3000000,
        outstandingReceivablesSAR: 2600000,
        overdueReceivablesSAR: 750000,
        daysUntilContractRenewal: 85,
        activeDisputedInvoicesCount: 1,
        creditRisk: 'MODERATE_AGING',
        primaryDecayFactorAr: 'إغلاق بعض الفروع الضعيفة مما أدى لتراجع المشتريات وتأخر سداد الفواتير الشهرية.',
        primaryDecayFactorEn: 'Branch consolidation reducing total order volume with mild invoice aging drift.',
        recommendedPlaybookAr: 'إعادة موازنة كميات الحد الأدنى للطلب (MOQ) وتعديل سقف الائتمان ليتناسب مع شبكة الفروع الحالية.',
        recommendedPlaybookEn: 'Recalibrate minimum order quantities (MOQ) and right-size credit limit to active store footprint.',
        assignedAccountDirector: 'م. زياد الحربي - مدير قطاع الضيافة',
        commercialRegistrationCR: '1010482931',
        cryptographicProofHash: computeCustomerHash('ACC-204-QSR')
      }
    ]
  },

  industrial_petrochem: {
    nameAr: 'التوريدات الصناعية والبتروكيماوية (Industrial Materials)',
    nameEn: 'Industrial & Petrochemical Offtake Portfolio',
    industryAr: 'الصناعات التحويلية، البوليمرات، والمذيبات الصناعية',
    industryEn: 'Chemical Intermediates, Polymers & Resins',
    descriptionAr: 'محفظة عملاء تصنيع بقيمة 130 مليون ر.س تعاني من خلافات في مواصفات الاستلام وتأخر السداد إلى 92 يوماً وتراجع طلب مصنعين رئيسيين.',
    descriptionEn: '130M SAR corporate receivables portfolio facing specification acceptance disputes and 92-day payment lags.',
    accounts: [
      {
        id: 'CUST-PET-01',
        code: 'ACC-301',
        nameAr: 'مصنع الأنابيب والمنتجات البلاستيكية الحرارية',
        nameEn: 'Thermoplastic Piping & Polyethylene Extrusion',
        industryAr: 'تصنيع الأنابيب ومواد البنية التحتية',
        industryEn: 'Plastics & Pipe Manufacturing',
        tier: 'STRATEGIC_KEY_ACCOUNT',
        annualContractValueSAR: 52000000,
        monthlyBaselineSpendSAR: 4330000,
        recentMonthlySpendSAR: 2850000,
        spendVelocityDecayPct: -34.2,
        healthScore: 39,
        healthStatus: 'CRITICAL_CHURN',
        daysSalesOutstanding: 112,
        creditLimitSAR: 15000000,
        outstandingReceivablesSAR: 14200000,
        overdueReceivablesSAR: 8400000,
        daysUntilContractRenewal: 30,
        activeDisputedInvoicesCount: 5,
        creditRisk: 'HIGH_DELINQUENCY',
        primaryDecayFactorAr: 'اعتراض العميل على اختبارات جودة حبيبات البوليمر وتأخير سداد 14.2M ريال مع تراجع السحب بـ 34.2%.',
        primaryDecayFactorEn: 'Polymer resin melt-flow dispute stalling 14.2M SAR in receivables alongside 34.2% volume drop.',
        recommendedPlaybookAr: 'إيفاد خبير مختبرات معتمد لموقع المصنع لإجراء اختبار فوري وفصل النزاع الفني عن الالتزام بالسداد.',
        recommendedPlaybookEn: 'Dispatch certified technical lab specialist to perform joint re-testing and de-couple technical claim from cash debt.',
        assignedAccountDirector: 'د. خالد السليمان - رئيس قطاع الكيماويات',
        commercialRegistrationCR: '2051029381',
        cryptographicProofHash: computeCustomerHash('ACC-301-PIPES')
      },
      {
        id: 'CUST-PET-02',
        code: 'ACC-302',
        nameAr: 'الشركة العربية لحلول العزل والمواد الإنشائية',
        nameEn: 'Arabian Insulation & Bituminous Membrane Co',
        industryAr: 'العوازل المائية والحرارية ومواد البناء',
        industryEn: 'Insulation & Bitumen Materials',
        tier: 'STRATEGIC_KEY_ACCOUNT',
        annualContractValueSAR: 44000000,
        monthlyBaselineSpendSAR: 3660000,
        recentMonthlySpendSAR: 2950000,
        spendVelocityDecayPct: -19.4,
        healthScore: 61,
        healthStatus: 'AT_RISK',
        daysSalesOutstanding: 76,
        creditLimitSAR: 10000000,
        outstandingReceivablesSAR: 8200000,
        overdueReceivablesSAR: 2500000,
        daysUntilContractRenewal: 80,
        activeDisputedInvoicesCount: 2,
        creditRisk: 'MODERATE_AGING',
        primaryDecayFactorAr: 'تراجع الطلب بنسبة 19.4% بسبب تأخر تسليم مشاريع العميل في الرياض والمنطقة الشرقية.',
        primaryDecayFactorEn: 'Downstream site delays curbing client off-take by 19.4% with mounting 76-day aging receivables.',
        recommendedPlaybookAr: 'إعادة جدولة الشحنات وتقديم تمويل فاتورة مشترك مع البنك لتخفيف الضغط على السيولة.',
        recommendedPlaybookEn: 'Restructure delivery milestones and integrate supply chain invoice factoring to relieve liquidity bottlenecks.',
        assignedAccountDirector: 'م. عمر الفايز - مدير الحسابات الصناعية',
        commercialRegistrationCR: '1010394821',
        cryptographicProofHash: computeCustomerHash('ACC-302-INSULATION')
      },
      {
        id: 'CUST-PET-03',
        code: 'ACC-303',
        nameAr: 'مجمع تصنيع الكابلات والأسلاك النحاسية المعزولة',
        nameEn: 'Insulated Power Cables & Wire Fabrication',
        industryAr: 'صناعة الكابلات الكهربائية ونقل الطاقة',
        industryEn: 'Electrical Cable Fabrication',
        tier: 'STRATEGIC_KEY_ACCOUNT',
        annualContractValueSAR: 34000000,
        monthlyBaselineSpendSAR: 2830000,
        recentMonthlySpendSAR: 2920000,
        spendVelocityDecayPct: 3.2,
        healthScore: 88,
        healthStatus: 'HEALTHY',
        daysSalesOutstanding: 38,
        creditLimitSAR: 8000000,
        outstandingReceivablesSAR: 3200000,
        overdueReceivablesSAR: 0,
        daysUntilContractRenewal: 210,
        activeDisputedInvoicesCount: 0,
        creditRisk: 'SECURE',
        primaryDecayFactorAr: 'شريك استراتيجي منضبط، سداد فوري، واستهلاك متصاعد لمركبات البولي فينيل كلورايد (PVC).',
        primaryDecayFactorEn: 'Model Tier-1 partner with prompt 38-day settlement and growing PVC compound off-take.',
        recommendedPlaybookAr: 'توقيع اتفاقية توريد سنوية ممتدة لعامين مع ربط السعر بمؤشر ICIS العالمي للبتروكيماويات.',
        recommendedPlaybookEn: 'Execute 2-year indexed offtake contract linked directly to global ICIS petrochemical benchmark.',
        assignedAccountDirector: 'د. خالد السليمان - رئيس قطاع الكيماويات',
        commercialRegistrationCR: '2050392814',
        cryptographicProofHash: computeCustomerHash('ACC-303-CABLES')
      }
    ]
  }
};

// ── Portfolio Customer & Retention Calculation Algorithm ──────────────────────

export function calculatePortfolioCustomerMetrics(
  accounts: CustomerAccountRecord[],
  remediationSuccessRatePct = 80 // 0% to 100%
): PortfolioCustomerMetrics {
  let totalRevenue = 0;
  let totalAtRiskRevenue = 0;
  let totalOverdue = 0;
  let sumHealth = 0;
  let sumDso = 0;
  let criticalCount = 0;
  let atRiskCount = 0;
  let healthyCount = 0;

  for (const a of accounts) {
    totalRevenue += a.annualContractValueSAR;
    totalOverdue += a.overdueReceivablesSAR;
    sumHealth += a.healthScore;
    sumDso += a.daysSalesOutstanding;

    if (a.healthStatus === 'CRITICAL_CHURN') {
      criticalCount++;
      totalAtRiskRevenue += a.annualContractValueSAR;
    } else if (a.healthStatus === 'AT_RISK') {
      atRiskCount++;
      totalAtRiskRevenue += a.annualContractValueSAR * 0.5; // weighted risk
    } else {
      healthyCount++;
    }
  }

  const avgHealth = accounts.length > 0 ? sumHealth / accounts.length : 100;
  const avgDso = accounts.length > 0 ? sumDso / accounts.length : 45;
  const projectedRetained = totalAtRiskRevenue * (remediationSuccessRatePct / 100);

  return {
    totalMonitoredRevenueSAR: Math.round(totalRevenue),
    totalAccountCount: accounts.length,
    totalRevenueAtRiskSAR: Math.round(totalAtRiskRevenue),
    projectedRetainedRevenueSAR: Math.round(projectedRetained),
    portfolioAvgHealthScore: Math.round(avgHealth * 10) / 10,
    criticalChurnAccountCount: criticalCount,
    atRiskAccountCount: atRiskCount,
    healthyAccountCount: healthyCount,
    totalOverdueReceivablesSAR: Math.round(totalOverdue),
    avgDaysSalesOutstanding: Math.round(avgDso)
  };
}

// ── Real CSV Parser for Custom Customer Portfolios ────────────────────────────

export function parseCustomerLedgerCsv(csvContent: string): CustomerAccountRecord[] {
  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());

  const getColIdx = (aliases: string[]) => {
    return header.findIndex((h) => aliases.some((a) => h.includes(a)));
  };

  const codeIdx = getColIdx(['code', 'id', 'ref', 'كود', 'رقم']);
  const nameIdx = getColIdx(['name', 'client', 'customer', 'عميل', 'شركة', 'اسم']);
  const industryIdx = getColIdx(['industry', 'sector', 'قطاع', 'نشاط']);
  const revenueIdx = getColIdx(['revenue', 'contract', 'value', 'إيراد', 'عقد', 'قيمة']);
  const dsoIdx = getColIdx(['dso', 'days', 'سداد', 'أيام']);
  const overdueIdx = getColIdx(['overdue', 'متأخر', 'متعثر']);
  const decayIdx = getColIdx(['decay', 'velocity', 'drop', 'تراجع', 'انخفاض', 'وتيرة']);
  const renewalIdx = getColIdx(['renewal', 'تجديد']);

  const accounts: CustomerAccountRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    if (row.length < 3) continue;

    const code = (codeIdx !== -1 && row[codeIdx]) ? row[codeIdx] : `ACC-${600 + i}`;
    const name = (nameIdx !== -1 && row[nameIdx]) ? row[nameIdx] : `عميل استراتيجي رقم ${i}`;
    const industry = (industryIdx !== -1 && row[industryIdx]) ? row[industryIdx] : 'خدمات عامة وتجارة';
    const rev = (revenueIdx !== -1 && !isNaN(parseFloat(row[revenueIdx]))) ? parseFloat(row[revenueIdx]) : 12000000;
    const dso = (dsoIdx !== -1 && !isNaN(parseInt(row[dsoIdx]))) ? parseInt(row[dsoIdx]) : 55;
    const overdue = (overdueIdx !== -1 && !isNaN(parseFloat(row[overdueIdx]))) ? parseFloat(row[overdueIdx]) : rev * 0.12;
    const decay = (decayIdx !== -1 && !isNaN(parseFloat(row[decayIdx]))) ? parseFloat(row[decayIdx]) : -15.0;
    const renewal = (renewalIdx !== -1 && !isNaN(parseInt(row[renewalIdx]))) ? parseInt(row[renewalIdx]) : 60;

    let healthScore = 85;
    if (decay < -25 || dso > 90) healthScore = 42;
    else if (decay < -12 || dso > 65) healthScore = 62;

    let healthStatus: CustomerHealthStatus = 'HEALTHY';
    if (healthScore < 50) healthStatus = 'CRITICAL_CHURN';
    else if (healthScore < 75) healthStatus = 'AT_RISK';

    const monthlyBaseline = rev / 12;
    const recentSpend = monthlyBaseline * (1 + decay / 100);

    accounts.push({
      id: `CSV-ACC-${i}`,
      code,
      nameAr: name,
      nameEn: name,
      industryAr: industry,
      industryEn: industry,
      tier: rev > 25000000 ? 'STRATEGIC_KEY_ACCOUNT' : rev > 10000000 ? 'ENTERPRISE_COMMERCIAL' : 'MID_MARKET',
      annualContractValueSAR: rev,
      monthlyBaselineSpendSAR: Math.round(monthlyBaseline),
      recentMonthlySpendSAR: Math.round(recentSpend),
      spendVelocityDecayPct: Math.round(decay * 10) / 10,
      healthScore,
      healthStatus,
      daysSalesOutstanding: dso,
      creditLimitSAR: Math.round(rev * 0.25),
      outstandingReceivablesSAR: Math.round(overdue * 1.5),
      overdueReceivablesSAR: Math.round(overdue),
      daysUntilContractRenewal: renewal,
      activeDisputedInvoicesCount: dso > 80 ? 2 : 0,
      creditRisk: dso > 80 ? 'HIGH_DELINQUENCY' : dso > 60 ? 'MODERATE_AGING' : 'SECURE',
      primaryDecayFactorAr: `تراجع وتيرة الطلبات بنسبة ${decay}% مع مدة سداد ${dso} يوماً.`,
      primaryDecayFactorEn: `Purchasing velocity decay of ${decay}% alongside ${dso}-day DSO collection lag.`,
      recommendedPlaybookAr: 'جدولة زيارة تنفيذية وتعديل شروط الائتمان وسرعة إغلاق الفواتير المتنازع عليها.',
      recommendedPlaybookEn: 'Initiate C-level retention touchpoint and resolve pending invoice frictions.',
      assignedAccountDirector: 'مدير الحسابات التجارية',
      commercialRegistrationCR: `1010${Math.floor(100000 + Math.random() * 900000)}`,
      cryptographicProofHash: computeCustomerHash(`CSV-${code}-${rev}`)
    });
  }

  return accounts;
}
