// MIKHLAFI LABS — Enterprise Supplier Intelligence & Procurement Risk Engine (Service 05)
// Deterministic Algorithms: Herfindahl-Hirschman Concentration Index (HHI),
// Cross-Branch Price Divergence Arbitrage, Lead-Time Drift SLA Telemetry,
// Spend Volume Consolidation Optimizer, and Board-Ready Vendor Governance Dossiers.

export type SupplierTier = 'TIER_1_STRATEGIC' | 'TIER_2_OPERATIONAL' | 'TIER_3_TACTICAL';
export type SupplierRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DependencyCategory = 'MONOPOLY_SINGLE_SOURCE' | 'MODERATE_DUAL' | 'DIVERSIFIED';

export interface SupplierRecord {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  categoryAr: string;
  categoryEn: string;
  tier: SupplierTier;
  annualSpendSAR: number;
  spendSharePct: number; // market share in corporate category spend
  branchCount: number; // branches purchasing from this vendor
  priceVariancePct: number; // max price divergence across branches (+% above lowest rate)
  promisedLeadTimeDays: number;
  actualAvgLeadTimeDays: number;
  leadTimeDriftDays: number; // actual - promised
  onTimeDeliveryPct: number; // SLA %
  qualityRejectionPct: number; // % of lots rejected
  paymentTermsDays: number; // 30, 60, 90 days
  creditExposureSAR: number; // open POs + unbilled deliverables
  dependencyCategory: DependencyCategory;
  riskLevel: SupplierRiskLevel;
  primaryRiskFactorAr: string;
  primaryRiskFactorEn: string;
  recommendedActionAr: string;
  recommendedActionEn: string;
  commercialRegistrationCR: string;
  vatTaxNumber: string;
  cryptographicProofHash: string;
}

export interface PortfolioSupplierMetrics {
  totalAnnualSpendSAR: number;
  totalSupplierCount: number;
  herfindahlHirschmanIndex: number; // HHI score (0 to 10000)
  hhiClassification: 'HEALTHY_DIVERSIFIED' | 'MODERATE_CONCENTRATION' | 'HIGH_MONOPOLY_RISK';
  aggregatePriceLeakageSAR: number; // annual loss from uncoordinated branch pricing
  projectedVolumeConsolidationSavingsSAR: number; // savings at slider discount rate
  criticalVendorCount: number;
  highRiskVendorCount: number;
  avgOnTimeDeliveryRatePct: number;
  top3VendorSpendConcentrationPct: number;
}

function computeSupplierHash(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex1 = Math.abs(hash).toString(16).padStart(8, '0');
  const hex2 = Math.abs(hash * 37).toString(16).padStart(8, '0');
  return `VND-${hex1.toUpperCase()}-${hex2.toUpperCase()}`;
}

// ── Realistic Pre-Seeded Saudi Enterprise Supplier Portfolios ────────────────

export const PRESET_SUPPLIER_SCENARIOS: Record<
  string,
  {
    nameAr: string;
    nameEn: string;
    industryAr: string;
    industryEn: string;
    descriptionAr: string;
    descriptionEn: string;
    suppliers: SupplierRecord[];
  }
> = {
  fmcg_retail: {
    nameAr: 'سلاسل التجزئة والمراكز التجارية الكبرى (FMCG & Retail)',
    nameEn: 'National FMCG Hypermarket & Retail Chain',
    industryAr: 'التجزئة، المواد الاستهلاكية، وسلاسل الإمداد الغذائية',
    industryEn: 'Retail, FMCG & Supermarket Logistics',
    descriptionAr: 'شبكة توريد تضم 32 فرعاً في الرياض وجدة والشرقية، تعاني من تباين أسعار كرتون التعبئة والألبان واحتكار مورد أحادي لخدمات التبريد.',
    descriptionEn: '32-branch retail network experiencing 24% cross-branch packaging price variance and sole-source refrigeration dependency.',
    suppliers: [
      {
        id: 'SUP-RET-01',
        code: 'VND-301',
        nameAr: 'الشركة المتحدة لحلول التغليف والكرتون المموج',
        nameEn: 'United Corrugated Packaging & Paper Co.',
        categoryAr: 'مواد التعبئة والتغليف والكرتون',
        categoryEn: 'Packaging & Cartons',
        tier: 'TIER_1_STRATEGIC',
        annualSpendSAR: 14200000,
        spendSharePct: 29.5,
        branchCount: 32,
        priceVariancePct: 22.4, // Riyadh pays 4.20 SAR vs Jeddah 5.15 SAR for identical box
        promisedLeadTimeDays: 7,
        actualAvgLeadTimeDays: 14,
        leadTimeDriftDays: 7,
        onTimeDeliveryPct: 76.5,
        qualityRejectionPct: 3.8,
        paymentTermsDays: 60,
        creditExposureSAR: 2850000,
        dependencyCategory: 'MONOPOLY_SINGLE_SOURCE',
        riskLevel: 'CRITICAL',
        primaryRiskFactorAr: 'احتكار بنسبة 85% لمواد التغليف مع تباين أسعار الفروع بنسبة 22.4% وتأخر الشحنات بـ 7 أيام.',
        primaryRiskFactorEn: '85% packaging monopoly with 22.4% cross-branch pricing drift and 7-day average delivery lag.',
        recommendedActionAr: 'تأهيل مورد كرتون ثانوي في المنطقة الغربية وتوحيد أمر التوريد السنوي لخفض 14% من الفاتورة.',
        recommendedActionEn: 'Qualify secondary packaging vendor in Western region and consolidate bulk master purchase agreement.',
        commercialRegistrationCR: '1010349812',
        vatTaxNumber: '310192837400003',
        cryptographicProofHash: computeSupplierHash('VND-301-PACKAGING')
      },
      {
        id: 'SUP-RET-02',
        code: 'VND-302',
        nameAr: 'مؤسسة التبريد المتقدم والأنظمة الميكانيكية',
        nameEn: 'Advanced Cold Chain & HVAC Maintenance',
        categoryAr: 'صيانة غرف التبريد واللوجستيات الحرارية',
        categoryEn: 'Refrigeration & Cold Chain SLA',
        tier: 'TIER_1_STRATEGIC',
        annualSpendSAR: 9800000,
        spendSharePct: 20.4,
        branchCount: 28,
        priceVariancePct: 18.0,
        promisedLeadTimeDays: 2,
        actualAvgLeadTimeDays: 5,
        leadTimeDriftDays: 3,
        onTimeDeliveryPct: 81.0,
        qualityRejectionPct: 1.2,
        paymentTermsDays: 45,
        creditExposureSAR: 1420000,
        dependencyCategory: 'MONOPOLY_SINGLE_SOURCE',
        riskLevel: 'CRITICAL',
        primaryRiskFactorAr: 'عقود صيانة فردية لكل متجر، مما ضاعف التكاليف الشهرية وأخّر أوقات استجابة الطوارئ.',
        primaryRiskFactorEn: 'Fragmented store-level SLAs driving high maintenance billing and erratic breakdown response.',
        recommendedActionAr: 'دمج عقود غرف التبريد في اتفاقية صيانة مركزية (Group SLA) مع شروط جزائية على زمن الاستجابة.',
        recommendedActionEn: 'Consolidate into enterprise-level master maintenance SLA with strict SLA delay penalties.',
        commercialRegistrationCR: '4030192834',
        vatTaxNumber: '300291827400003',
        cryptographicProofHash: computeSupplierHash('VND-302-COLDCHAIN')
      },
      {
        id: 'SUP-RET-03',
        code: 'VND-303',
        nameAr: 'شركة المزارع الوطنية للمنتجات الطازجة واللحوم',
        nameEn: 'National Fresh Produce & Proteins Corp.',
        categoryAr: 'الأغذية الطازجة والخضار واللحوم',
        categoryEn: 'Fresh Agro & Meats',
        tier: 'TIER_1_STRATEGIC',
        annualSpendSAR: 12500000,
        spendSharePct: 26.0,
        branchCount: 32,
        priceVariancePct: 8.5,
        promisedLeadTimeDays: 1,
        actualAvgLeadTimeDays: 2,
        leadTimeDriftDays: 1,
        onTimeDeliveryPct: 91.2,
        qualityRejectionPct: 4.5,
        paymentTermsDays: 30,
        creditExposureSAR: 950000,
        dependencyCategory: 'MODERATE_DUAL',
        riskLevel: 'MEDIUM',
        primaryRiskFactorAr: 'نسبة هدر ورفض جودة 4.5% بسبب تذبذب درجات حرارة أسطول النقل أثناء التوزيع الصباحي.',
        primaryRiskFactorEn: '4.5% quality rejection rate caused by fleet temperature fluctuations during morning dispatch.',
        recommendedActionAr: 'ربط أجهزة تتبع الحرارة الرقمية (IoT Temperature Loggers) وخصم تلفيات التوريد من الفواتير.',
        recommendedActionEn: 'Mandate digital temperature IoT tracking and auto-debit damaged produce from monthly invoice.',
        commercialRegistrationCR: '2050183921',
        vatTaxNumber: '310928374600003',
        cryptographicProofHash: computeSupplierHash('VND-303-PRODUCE')
      },
      {
        id: 'SUP-RET-04',
        code: 'VND-304',
        nameAr: 'شركة النقل السريع واللوجستيات الجافة',
        nameEn: 'Dry Logistics & Inter-Branch Freight',
        categoryAr: 'النقل بين المستودعات والفروع',
        categoryEn: 'Inter-Branch Transport',
        tier: 'TIER_2_OPERATIONAL',
        annualSpendSAR: 6800000,
        spendSharePct: 14.1,
        branchCount: 24,
        priceVariancePct: 12.0,
        promisedLeadTimeDays: 3,
        actualAvgLeadTimeDays: 4,
        leadTimeDriftDays: 1,
        onTimeDeliveryPct: 88.0,
        qualityRejectionPct: 0.8,
        paymentTermsDays: 45,
        creditExposureSAR: 620000,
        dependencyCategory: 'DIVERSIFIED',
        riskLevel: 'LOW',
        primaryRiskFactorAr: 'أسطول إضافي مرن، ولكن تباين تكلفة شحن الطبلية بين فروع المنطقة الوسطى والغربية.',
        primaryRiskFactorEn: 'Flexible fleet, but pallet transit rate diverges by 12% across central and western corridors.',
        recommendedActionAr: 'توحيد تسعيرة نقل الطبلية لكل كيلومتر وتثبيت الأسعار بعقد سنوي موحد.',
        recommendedActionEn: 'Standardize per-pallet KM pricing and lock in rates via 12-month framework contract.',
        commercialRegistrationCR: '1010482910',
        vatTaxNumber: '300182736400003',
        cryptographicProofHash: computeSupplierHash('VND-304-LOGISTICS')
      },
      {
        id: 'SUP-RET-05',
        code: 'VND-305',
        nameAr: 'المؤسسة التقنية لحلول أجهزة الدفع والباركود',
        nameEn: 'POS Terminals & Barcode Automation Tech',
        categoryAr: 'أجهزة نقاط البيع والشبكات',
        categoryEn: 'IT Hardware & POS',
        tier: 'TIER_3_TACTICAL',
        annualSpendSAR: 4700000,
        spendSharePct: 9.9,
        branchCount: 32,
        priceVariancePct: 6.0,
        promisedLeadTimeDays: 5,
        actualAvgLeadTimeDays: 6,
        leadTimeDriftDays: 1,
        onTimeDeliveryPct: 94.0,
        qualityRejectionPct: 0.5,
        paymentTermsDays: 30,
        creditExposureSAR: 380000,
        dependencyCategory: 'DIVERSIFIED',
        riskLevel: 'LOW',
        primaryRiskFactorAr: 'مورد معتمد عالي الكفاءة، مع فرص تحسين شروط الدفع من 30 إلى 60 يوماً.',
        primaryRiskFactorEn: 'Reliable supplier, with opportunity to optimize payment terms from 30 to 60 days.',
        recommendedActionAr: 'تمديد فترة السداد لتحسين دورة رأس المال العامل دون التأثير على التوريد.',
        recommendedActionEn: 'Extend payment terms to 60 days to strengthen corporate working capital cycle.',
        commercialRegistrationCR: '1010293847',
        vatTaxNumber: '310293847500003',
        cryptographicProofHash: computeSupplierHash('VND-305-POS')
      }
    ]
  },

  industrial: {
    nameAr: 'المجمعات الصناعية وتصنيع المعادن (Heavy Manufacturing)',
    nameEn: 'Heavy Industrial & Metal Fabrication Complex',
    industryAr: 'الصناعات الثقيلة، المعادن، والمواد الكيماوية',
    industryEn: 'Heavy Metals, Polymers & Chemical Processing',
    descriptionAr: 'محفظة مشتريات صناعية بقيمة 85 مليون ر.س تعاني من مخاطر انقطاع سلاسل إمداد صفائح الصلب والبتروكيماويات بسبب اضطرابات الشحن البحري.',
    descriptionEn: '85M SAR procurement spend facing raw steel and polymer supply chain disruptions via Red Sea maritime routes.',
    suppliers: [
      {
        id: 'SUP-IND-01',
        code: 'VND-401',
        nameAr: 'الشركة العالمية لصفائح الصلب والسبائك المعدنية',
        nameEn: 'Global Steel Plates & Alloy Rolling Mills',
        categoryAr: 'لفائف الصلب المسحوب على الساخن',
        categoryEn: 'Raw Steel Coils & Plates',
        tier: 'TIER_1_STRATEGIC',
        annualSpendSAR: 34500000,
        spendSharePct: 40.5,
        branchCount: 4,
        priceVariancePct: 14.8,
        promisedLeadTimeDays: 21,
        actualAvgLeadTimeDays: 38,
        leadTimeDriftDays: 17,
        onTimeDeliveryPct: 62.0,
        qualityRejectionPct: 2.1,
        paymentTermsDays: 90,
        creditExposureSAR: 8400000,
        dependencyCategory: 'MONOPOLY_SINGLE_SOURCE',
        riskLevel: 'CRITICAL',
        primaryRiskFactorAr: 'تركز بنسبة 40.5% من ميزانية الشركة في مورد واحد، وتأخر التوريد بمتوسط 17 يوماً مما هدد خطوط تصنيع الأنابيب.',
        primaryRiskFactorEn: '40.5% spend concentration in sole steel source with 17-day lead-time drift threatening fabrication lines.',
        recommendedActionAr: 'توقيع اتفاقية توريد استراتيجية بديلة مع مصنع حديد محلي (حديد سابك) لتغطية 35% من الاحتياج.',
        recommendedActionEn: 'Execute secondary long-term supply framework with local mill (Hadeed) for 35% baseline quota.',
        commercialRegistrationCR: '2051029384',
        vatTaxNumber: '300293847100003',
        cryptographicProofHash: computeSupplierHash('VND-401-STEEL')
      },
      {
        id: 'SUP-IND-02',
        code: 'VND-402',
        nameAr: 'مؤسسة المركبات الكيميائية والبوليمرات العازلة',
        nameEn: 'Industrial Polymers & Chemical Coating Co.',
        categoryAr: 'المواد الكيماوية والطلاء الإيبوكسي المقاوم',
        categoryEn: 'Epoxy Resins & Industrial Chemicals',
        tier: 'TIER_1_STRATEGIC',
        annualSpendSAR: 19800000,
        spendSharePct: 23.3,
        branchCount: 3,
        priceVariancePct: 11.5,
        promisedLeadTimeDays: 14,
        actualAvgLeadTimeDays: 24,
        leadTimeDriftDays: 10,
        onTimeDeliveryPct: 71.5,
        qualityRejectionPct: 3.2,
        paymentTermsDays: 60,
        creditExposureSAR: 4200000,
        dependencyCategory: 'MODERATE_DUAL',
        riskLevel: 'HIGH',
        primaryRiskFactorAr: 'تأخر الشحنات البحرية وتفاوت تسعير براميل الإيبوكسي بين مصنع الجبيل ومصنع ينبع.',
        primaryRiskFactorEn: 'Maritime transit bottlenecks and 11.5% pricing divergence between Jubail and Yanbu plants.',
        recommendedActionAr: 'إلزام المورد بالاحتفاظ بمخزون أمان (Consignment Stock) داخل مستودع الجبيل على حسابه.',
        recommendedActionEn: 'Enforce vendor-managed consignment inventory buffer at Jubail warehouse facility.',
        commercialRegistrationCR: '2055019283',
        vatTaxNumber: '310928374100003',
        cryptographicProofHash: computeSupplierHash('VND-402-CHEMICALS')
      },
      {
        id: 'SUP-IND-03',
        code: 'VND-403',
        nameAr: 'الشركة الفنية لقطع الغيار والمحركات الهيدروليكية',
        nameEn: 'Hydraulic Spares & Heavy Actuators Ltd.',
        categoryAr: 'قطع الغيار الميكانيكية الثقيلة',
        categoryEn: 'Hydraulics & Heavy Valves',
        tier: 'TIER_2_OPERATIONAL',
        annualSpendSAR: 15400000,
        spendSharePct: 18.1,
        branchCount: 4,
        priceVariancePct: 19.2,
        promisedLeadTimeDays: 10,
        actualAvgLeadTimeDays: 18,
        leadTimeDriftDays: 8,
        onTimeDeliveryPct: 78.0,
        qualityRejectionPct: 1.5,
        paymentTermsDays: 45,
        creditExposureSAR: 2900000,
        dependencyCategory: 'MODERATE_DUAL',
        riskLevel: 'HIGH',
        primaryRiskFactorAr: 'تفاوت كبير في هوامش تسعير قطع الغيار بين المصانع لغياب كاتالوج أسعار موحد.',
        primaryRiskFactorEn: 'Substantial margin discrepancies for OEM replacement parts due to missing enterprise price list.',
        recommendedActionAr: 'تثبيت جدول أسعار قطع الغيار الاستهلاكية (Rate Card) بنسب خصم 18% على أسعار الوكالة.',
        recommendedActionEn: 'Implement enterprise fixed rate card with mandatory 18% discount off agency catalog pricing.',
        commercialRegistrationCR: '1010394821',
        vatTaxNumber: '300192837400003',
        cryptographicProofHash: computeSupplierHash('VND-403-HYDRAULICS')
      },
      {
        id: 'SUP-IND-04',
        code: 'VND-404',
        nameAr: 'مؤسسة الغازات الصناعية والأكسجين المسال',
        nameEn: 'Cryogenic Industrial Gases & Argon Supply',
        categoryAr: 'الغازات الصناعية للحام والتقطيع',
        categoryEn: 'Industrial Gases & Argon',
        tier: 'TIER_2_OPERATIONAL',
        annualSpendSAR: 9200000,
        spendSharePct: 10.8,
        branchCount: 4,
        priceVariancePct: 4.0,
        promisedLeadTimeDays: 2,
        actualAvgLeadTimeDays: 2,
        leadTimeDriftDays: 0,
        onTimeDeliveryPct: 98.5,
        qualityRejectionPct: 0.2,
        paymentTermsDays: 30,
        creditExposureSAR: 850000,
        dependencyCategory: 'DIVERSIFIED',
        riskLevel: 'LOW',
        primaryRiskFactorAr: 'أداء تشغيلي ممتاز وتوريد فوري، مع فرصة إعادة التفاوض لخفض السعر بنسبة 7% لكميات العام القادم.',
        primaryRiskFactorEn: 'Flawless SLA fulfillment with volume rebate potential on next year committed cryogenic volumes.',
        recommendedActionAr: 'تجديد العقد لمدة 3 سنوات مقابل خصم سنوي مستمر بنسبة 8% من قيمة التوريد.',
        recommendedActionEn: 'Execute 3-year term contract in exchange for 8% annual volume rebate tranche.',
        commercialRegistrationCR: '2050293847',
        vatTaxNumber: '310492837100003',
        cryptographicProofHash: computeSupplierHash('VND-404-GASES')
      },
      {
        id: 'SUP-IND-05',
        code: 'VND-405',
        nameAr: 'شركة معايرة واختبارات الجودة غير التدميرية (NDT)',
        nameEn: 'NDT Inspection & Metrology Testing Services',
        categoryAr: 'الفحص المخبري واختبارات الجودة',
        categoryEn: 'Inspection & Metrology',
        tier: 'TIER_3_TACTICAL',
        annualSpendSAR: 6100000,
        spendSharePct: 7.3,
        branchCount: 3,
        priceVariancePct: 5.0,
        promisedLeadTimeDays: 3,
        actualAvgLeadTimeDays: 4,
        leadTimeDriftDays: 1,
        onTimeDeliveryPct: 93.0,
        qualityRejectionPct: 0.1,
        paymentTermsDays: 45,
        creditExposureSAR: 580000,
        dependencyCategory: 'DIVERSIFIED',
        riskLevel: 'LOW',
        primaryRiskFactorAr: 'مورد فحص معتمد وفق معايير أرامكو السعودية وهيئة المواصفات (SASO).',
        primaryRiskFactorEn: 'Fully certified NDT vendor compliant with Saudi Aramco and SASO quality inspection codes.',
        recommendedActionAr: 'تثبيت العقد واعتماد تقارير الفحص آلياً عبر بوابة الموردين الرقمية.',
        recommendedActionEn: 'Automate NDT certificate verification via digital vendor integration API.',
        commercialRegistrationCR: '2051928374',
        vatTaxNumber: '300392817400003',
        cryptographicProofHash: computeSupplierHash('VND-405-NDT')
      }
    ]
  },

  construction: {
    nameAr: 'مقاولات الإنشاءات ومواد البناء الكبرى (EPC Contracting)',
    nameEn: 'EPC Contracting & Infrastructure Materials',
    industryAr: 'المقاولات، أعمال الخرسانة، ومشاريع البنية التحتية',
    industryEn: 'Infrastructure, Civil Works & Bulk Concrete',
    descriptionAr: 'شبكة مشتريات مشاريع بقيمة 110 مليون ر.س ترتبط بمشاريع كبرى، تعاني من تسعير متباين للإسمنت وحديد التسليح وتأخر توريد المولدات.',
    descriptionEn: '110M SAR construction procurement spend with critical cement price disparities and transformer delivery bottlenecks.',
    suppliers: [
      {
        id: 'SUP-CON-01',
        code: 'VND-501',
        nameAr: 'شركة الإسمنت والخرسانة الجاهزة الكبرى',
        nameEn: 'National Ready-Mix & Bulk Cement Group',
        categoryAr: 'الخرسانة الجاهزة والإسمنت البورتلاندي',
        categoryEn: 'Ready-Mix Concrete & Cement',
        tier: 'TIER_1_STRATEGIC',
        annualSpendSAR: 42000000,
        spendSharePct: 38.2,
        branchCount: 12,
        priceVariancePct: 21.0, // Project A pays 210 SAR/m3 vs Project B 255 SAR/m3
        promisedLeadTimeDays: 1,
        actualAvgLeadTimeDays: 3,
        leadTimeDriftDays: 2,
        onTimeDeliveryPct: 79.0,
        qualityRejectionPct: 2.8,
        paymentTermsDays: 60,
        creditExposureSAR: 9500000,
        dependencyCategory: 'MONOPOLY_SINGLE_SOURCE',
        riskLevel: 'CRITICAL',
        primaryRiskFactorAr: 'تباين سعر متر الخرسانة بـ 45 ريالاً بين مواقع المشاريع في الرياض، مما تسبب في هدر مالي تجاوز 3.4M ر.س.',
        primaryRiskFactorEn: '45 SAR/m3 ready-mix price disparity across Riyadh project sites causing 3.4M SAR in uncoordinated margin loss.',
        recommendedActionAr: 'توحيد اتفاقية شراء الخرسانة للمحفظة بالكامل وتثبيت سعر موحد بخصم 16% لكافة مشاريع المجموعة.',
        recommendedActionEn: 'Unify corporate concrete procurement across all job sites with 16% volume-pegged discount.',
        commercialRegistrationCR: '1010192837',
        vatTaxNumber: '310182736400003',
        cryptographicProofHash: computeSupplierHash('VND-501-CONCRETE')
      },
      {
        id: 'SUP-CON-02',
        code: 'VND-502',
        nameAr: 'مصنع حديد التسليح والهياكل المعدنية',
        nameEn: 'Rebar & Heavy Structural Steel Fabricators',
        categoryAr: 'حديد التسليح والشبك الإنشائي',
        categoryEn: 'Rebar & Structural Beams',
        tier: 'TIER_1_STRATEGIC',
        annualSpendSAR: 31000000,
        spendSharePct: 28.2,
        branchCount: 10,
        priceVariancePct: 15.2,
        promisedLeadTimeDays: 10,
        actualAvgLeadTimeDays: 19,
        leadTimeDriftDays: 9,
        onTimeDeliveryPct: 70.0,
        qualityRejectionPct: 1.1,
        paymentTermsDays: 90,
        creditExposureSAR: 6800000,
        dependencyCategory: 'MONOPOLY_SINGLE_SOURCE',
        riskLevel: 'HIGH',
        primaryRiskFactorAr: 'تأخر تسليم حديد التسليح بمتوسط 9 أيام في مشروع الأبراج السكنية مما عطل صب الأسقف الخرسانية.',
        primaryRiskFactorEn: '9-day average rebar delivery lag on high-rise residential project stalling structural slab pours.',
        recommendedActionAr: 'إلزام المصنع بجدولة التوريد أسبوعياً وربط الدفعات بنسبة دقة مواعيد الوصول لموقع المشروع.',
        recommendedActionEn: 'Mandate weekly staged mill deliveries with invoice milestones tied directly to on-time site arrival.',
        commercialRegistrationCR: '2050394812',
        vatTaxNumber: '300283746100003',
        cryptographicProofHash: computeSupplierHash('VND-502-REBAR')
      },
      {
        id: 'SUP-CON-03',
        code: 'VND-503',
        nameAr: 'الشركة الهندسية للمحولات والمعدات الكهروميكانيكية',
        nameEn: 'High-Voltage Transformers & MEP Plant',
        categoryAr: 'المحولات، القواطع الكهربائية، والمضخات الكبرى',
        categoryEn: 'Transformers & Heavy MEP Gear',
        tier: 'TIER_1_STRATEGIC',
        annualSpendSAR: 18500000,
        spendSharePct: 16.8,
        branchCount: 6,
        priceVariancePct: 18.5,
        promisedLeadTimeDays: 60,
        actualAvgLeadTimeDays: 95,
        leadTimeDriftDays: 35,
        onTimeDeliveryPct: 58.0,
        qualityRejectionPct: 1.9,
        paymentTermsDays: 45,
        creditExposureSAR: 5200000,
        dependencyCategory: 'MONOPOLY_SINGLE_SOURCE',
        riskLevel: 'CRITICAL',
        primaryRiskFactorAr: 'تأخر توريد محولات الضغط العالي 35 يوماً إضافية، مما يهدد بتطبيق غرامات تأخير بقيمة 120,000 ريال شهرياً.',
        primaryRiskFactorEn: '35-day transformer shipment lag exposing project to 120,000 SAR/month owner liquidated delay penalties.',
        recommendedActionAr: 'إرسال مهندس جودة وتفتيش فوري لمصنع المورد ومطالبته بشحن جوي طارئ للمكونات الحرجة.',
        recommendedActionEn: 'Dispatch field inspection engineer to factory and trigger expedited air-freight clause for critical relays.',
        commercialRegistrationCR: '1010492831',
        vatTaxNumber: '310394827100003',
        cryptographicProofHash: computeSupplierHash('VND-503-TRANSFORMERS')
      },
      {
        id: 'SUP-CON-04',
        code: 'VND-504',
        nameAr: 'مؤسسة السقالات والقوالب الإنشائية الألمانية',
        nameEn: 'Formwork & Heavy Scaffolding Systems',
        categoryAr: 'تأجير وشراء الشدات المعدنية والقوالب',
        categoryEn: 'Scaffolding & Modular Formwork',
        tier: 'TIER_2_OPERATIONAL',
        annualSpendSAR: 11500000,
        spendSharePct: 10.5,
        branchCount: 8,
        priceVariancePct: 8.0,
        promisedLeadTimeDays: 7,
        actualAvgLeadTimeDays: 9,
        leadTimeDriftDays: 2,
        onTimeDeliveryPct: 86.5,
        qualityRejectionPct: 0.6,
        paymentTermsDays: 60,
        creditExposureSAR: 1800000,
        dependencyCategory: 'MODERATE_DUAL',
        riskLevel: 'LOW',
        primaryRiskFactorAr: 'عقود إيجار شهرية تتراكم دون إعادة الشدات الزائدة عن الحاجة فور انتهاء الصب.',
        primaryRiskFactorEn: 'Idle scaffolding rentals accumulating monthly charges post-concrete curing due to delayed demobilization.',
        recommendedActionAr: 'تفعيل الجرد الرقمي الفوري وإعادة المعدات غير المستغلة لتوفير 450,000 ريال سنوياً.',
        recommendedActionEn: 'Implement automated digital scaffolding tracking and prompt demobilization to save 450K SAR/year.',
        commercialRegistrationCR: '4030293847',
        vatTaxNumber: '300192847500003',
        cryptographicProofHash: computeSupplierHash('VND-504-FORMWORK')
      },
      {
        id: 'SUP-CON-05',
        code: 'VND-505',
        nameAr: 'شركة توريد أنظمة مكافحة الحريق والسلامة',
        nameEn: 'Fire Fighting Systems & Life Safety Equipment',
        categoryAr: 'مضخات الحريق والرشاشات الآلية المعتمدة',
        categoryEn: 'Fire Protection & UL/FM Safety',
        tier: 'TIER_3_TACTICAL',
        annualSpendSAR: 7000000,
        spendSharePct: 6.3,
        branchCount: 6,
        priceVariancePct: 5.5,
        promisedLeadTimeDays: 14,
        actualAvgLeadTimeDays: 16,
        leadTimeDriftDays: 2,
        onTimeDeliveryPct: 92.0,
        qualityRejectionPct: 0.4,
        paymentTermsDays: 30,
        creditExposureSAR: 920000,
        dependencyCategory: 'DIVERSIFIED',
        riskLevel: 'LOW',
        primaryRiskFactorAr: 'توريد معتمد من الدفاع المدني السعودي، أسعار منضبطة وجودة عالية.',
        primaryRiskFactorEn: 'Civil Defense certified vendor with high quality compliance and stable pricing.',
        recommendedActionAr: 'إبقاء المورد كشريك استراتيجي في قائمة الموردين المعتمدين لمشاريع 2026-2027.',
        recommendedActionEn: 'Maintain vendor on approved master vendor list for all upcoming 2026-2027 bids.',
        commercialRegistrationCR: '1010593821',
        vatTaxNumber: '310492817400003',
        cryptographicProofHash: computeSupplierHash('VND-505-FIRE')
      }
    ]
  }
};

// ── Herfindahl-Hirschman Concentration Index (HHI) Algorithm ──────────────────

export function calculatePortfolioSupplierMetrics(
  suppliers: SupplierRecord[],
  targetConsolidationDiscountPct = 12 // 0% to 25%
): PortfolioSupplierMetrics {
  let totalSpend = 0;
  let totalPriceLeakage = 0;
  let criticalCount = 0;
  let highRiskCount = 0;
  let sumOnTimePct = 0;

  for (const s of suppliers) {
    totalSpend += s.annualSpendSAR;
    if (s.riskLevel === 'CRITICAL') criticalCount++;
    else if (s.riskLevel === 'HIGH') highRiskCount++;
    sumOnTimePct += s.onTimeDeliveryPct;

    // Price leakage calculation: (priceVariancePct / 100) * branch uncoordinated portion
    if (s.priceVariancePct > 5) {
      const branchSpend = s.annualSpendSAR * (Math.max(1, s.branchCount - 1) / Math.max(1, s.branchCount));
      const leakage = branchSpend * (s.priceVariancePct / 100) * 0.45;
      totalPriceLeakage += leakage;
    }
  }

  // Calculate HHI = sum of squared market share percentages
  let hhi = 0;
  const sortedBySpend = [...suppliers].sort((a, b) => b.annualSpendSAR - a.annualSpendSAR);

  for (const s of suppliers) {
    const sharePct = totalSpend > 0 ? (s.annualSpendSAR / totalSpend) * 100 : 0;
    hhi += Math.pow(sharePct, 2);
  }

  // Top 3 vendor concentration
  const top3Spend = sortedBySpend.slice(0, 3).reduce((acc, curr) => acc + curr.annualSpendSAR, 0);
  const top3ConcentrationPct = totalSpend > 0 ? (top3Spend / totalSpend) * 100 : 0;

  // Savings realization: spend * discount * slider rate
  const projectedSavings = totalSpend * (targetConsolidationDiscountPct / 100);

  let hhiClassification: 'HEALTHY_DIVERSIFIED' | 'MODERATE_CONCENTRATION' | 'HIGH_MONOPOLY_RISK' = 'HEALTHY_DIVERSIFIED';
  if (hhi > 2500) {
    hhiClassification = 'HIGH_MONOPOLY_RISK';
  } else if (hhi >= 1500) {
    hhiClassification = 'MODERATE_CONCENTRATION';
  }

  const avgOnTime = suppliers.length > 0 ? sumOnTimePct / suppliers.length : 100;

  return {
    totalAnnualSpendSAR: Math.round(totalSpend),
    totalSupplierCount: suppliers.length,
    herfindahlHirschmanIndex: Math.round(hhi),
    hhiClassification,
    aggregatePriceLeakageSAR: Math.round(totalPriceLeakage),
    projectedVolumeConsolidationSavingsSAR: Math.round(projectedSavings),
    criticalVendorCount: criticalCount,
    highRiskVendorCount: highRiskCount,
    avgOnTimeDeliveryRatePct: Math.round(avgOnTime * 10) / 10,
    top3VendorSpendConcentrationPct: Math.round(top3ConcentrationPct * 10) / 10
  };
}

// ── Real CSV Parser for Custom Procurement Spend Portfolios ───────────────────

export function parseSupplierLedgerCsv(csvContent: string): SupplierRecord[] {
  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());

  const getColIdx = (aliases: string[]) => {
    return header.findIndex((h) => aliases.some((a) => h.includes(a)));
  };

  const codeIdx = getColIdx(['code', 'id', 'ref', 'كود', 'رقم']);
  const nameIdx = getColIdx(['name', 'vendor', 'supplier', 'مورد', 'شركة', 'اسم']);
  const categoryIdx = getColIdx(['category', 'type', 'صنف', 'تصنيف', 'قطاع']);
  const spendIdx = getColIdx(['spend', 'amount', 'value', 'إنفاق', 'مشتريات', 'مبلغ']);
  const branchesIdx = getColIdx(['branch', 'count', 'فروع', 'عدد']);
  const varianceIdx = getColIdx(['variance', 'price', 'تفاوت', 'سعر', 'انحراف']);
  const leadIdx = getColIdx(['lead', 'days', 'توريد', 'أيام']);
  const onTimeIdx = getColIdx(['ontime', 'sla', 'التزام', 'نسبة']);

  const suppliers: SupplierRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    if (row.length < 3) continue;

    const code = (codeIdx !== -1 && row[codeIdx]) ? row[codeIdx] : `VND-${500 + i}`;
    const name = (nameIdx !== -1 && row[nameIdx]) ? row[nameIdx] : `مورد معتمد رقم ${i}`;
    const cat = (categoryIdx !== -1 && row[categoryIdx]) ? row[categoryIdx] : 'مستلزمات عامة';
    const spend = (spendIdx !== -1 && !isNaN(parseFloat(row[spendIdx]))) ? parseFloat(row[spendIdx]) : 10000000;
    const branches = (branchesIdx !== -1 && !isNaN(parseInt(row[branchesIdx]))) ? parseInt(row[branchesIdx]) : 8;
    const variance = (varianceIdx !== -1 && !isNaN(parseFloat(row[varianceIdx]))) ? parseFloat(row[varianceIdx]) : 12.0;
    const lead = (leadIdx !== -1 && !isNaN(parseInt(row[leadIdx]))) ? parseInt(row[leadIdx]) : 14;
    const onTime = (onTimeIdx !== -1 && !isNaN(parseFloat(row[onTimeIdx]))) ? Math.min(100, parseFloat(row[onTimeIdx])) : 82;

    let risk: SupplierRiskLevel = 'LOW';
    let dep: DependencyCategory = 'DIVERSIFIED';

    if (variance > 18 || onTime < 75) {
      risk = 'CRITICAL';
      dep = 'MONOPOLY_SINGLE_SOURCE';
    } else if (variance > 10 || onTime < 85) {
      risk = 'HIGH';
      dep = 'MODERATE_DUAL';
    } else if (variance > 6) {
      risk = 'MEDIUM';
    }

    suppliers.push({
      id: `CSV-VND-${i}`,
      code,
      nameAr: name,
      nameEn: name,
      categoryAr: cat,
      categoryEn: cat,
      tier: spend > 20000000 ? 'TIER_1_STRATEGIC' : spend > 8000000 ? 'TIER_2_OPERATIONAL' : 'TIER_3_TACTICAL',
      annualSpendSAR: spend,
      spendSharePct: 15.0,
      branchCount: branches,
      priceVariancePct: variance,
      promisedLeadTimeDays: Math.max(2, Math.round(lead * 0.7)),
      actualAvgLeadTimeDays: lead,
      leadTimeDriftDays: Math.max(0, Math.round(lead * 0.3)),
      onTimeDeliveryPct: onTime,
      qualityRejectionPct: 1.5,
      paymentTermsDays: 60,
      creditExposureSAR: Math.round(spend * 0.18),
      dependencyCategory: dep,
      riskLevel: risk,
      primaryRiskFactorAr: `تفاوت أسعار بين الفروع بنسبة ${variance}% مع التزام تسليم بمعدل ${onTime}%.`,
      primaryRiskFactorEn: `Cross-branch pricing variance of ${variance}% with ${onTime}% SLA delivery fulfillment.`,
      recommendedActionAr: 'توحيد اتفاقية الشراء وربط الأسعار بكتالوج مركزي موحد.',
      recommendedActionEn: 'Consolidate spend and enforce unified master pricing catalog.',
      commercialRegistrationCR: `1010${Math.floor(100000 + Math.random() * 900000)}`,
      vatTaxNumber: `310${Math.floor(1000000000 + Math.random() * 9000000000)}0003`,
      cryptographicProofHash: computeSupplierHash(`CSV-${code}-${spend}`)
    });
  }

  // Normalize spend shares
  const totalSpend = suppliers.reduce((acc, s) => acc + s.annualSpendSAR, 0);
  if (totalSpend > 0) {
    suppliers.forEach((s) => {
      s.spendSharePct = Math.round((s.annualSpendSAR / totalSpend) * 1000) / 10;
    });
  }

  return suppliers;
}
