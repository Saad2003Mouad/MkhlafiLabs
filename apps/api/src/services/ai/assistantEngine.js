import { query } from '../../db/connection.js';
import { getAIProvider } from './aiProvider.js';

export async function processAssistantQuery(orgId, userId, queryText, locale = 'ar') {
  const isAr = locale === 'ar';
  const qLower = queryText.toLowerCase().trim();
  const provider = getAIProvider();

  // 1. Fetch live tenant context across operational tables
  const [anomaliesRes, decisionsRes, risksRes, projectsRes, suppliersRes, customersRes] = await Promise.all([
    query('SELECT * FROM financial_anomalies WHERE organization_id = $1 ORDER BY flagged_amount DESC', [orgId]),
    query('SELECT * FROM tenant_decisions WHERE organization_id = $1 ORDER BY impact_amount DESC', [orgId]),
    query('SELECT * FROM tenant_risks WHERE organization_id = $1 ORDER BY financial_exposure_sar DESC', [orgId]),
    query('SELECT * FROM tenant_projects WHERE organization_id = $1 ORDER BY budget_total_sar DESC', [orgId]),
    query('SELECT * FROM tenant_suppliers WHERE organization_id = $1 ORDER BY active_contracts_val_sar DESC', [orgId]),
    query('SELECT * FROM tenant_customers WHERE organization_id = $1 ORDER BY revenue_at_risk_sar DESC', [orgId])
  ]);

  const anomalies = anomaliesRes.rows;
  const decisions = decisionsRes.rows;
  const risks = risksRes.rows;
  const projects = projectsRes.rows;
  const suppliers = suppliersRes.rows;
  const customers = customersRes.rows;

  const totalLeakageSAR = anomalies.reduce((sum, a) => sum + parseFloat(a.flagged_amount || 0), 0);
  const frozenAnomalies = anomalies.filter(a => a.status === 'FROZEN');
  const frozenAmountSAR = frozenAnomalies.reduce((sum, a) => sum + parseFloat(a.flagged_amount || 0), 0);
  const pendingDecisions = decisions.filter(d => d.status === 'PENDING');
  const pendingImpactSAR = pendingDecisions.reduce((sum, d) => sum + parseFloat(d.impact_amount || 0), 0);

  const citations = [];

  // Add factual citations based on actual tenant tables
  if (anomalies.length > 0) {
    citations.push({
      source: 'Forensic Financial Anomalies Ledger',
      docId: anomalies[0].case_number || 'CASE-LIVE',
      confidence: `${anomalies[0].confidence_pct || 95.0}%`
    });
  }
  if (decisions.length > 0) {
    citations.push({
      source: 'Tenant Executive Decision Pipeline',
      docId: `DEC-${decisions[0].id.substring(0, 6)}`,
      confidence: '99.0%'
    });
  }

  // 2. Prepare structured context for LLM execution
  const dbContextSummary = isAr
    ? `سياق قاعدة بيانات المؤسسة الحالية (PostgreSQL):
- معرف المؤسسة: ${orgId}
- إجمالي حالات الشذوذ والتسرب المالي: ${anomalies.length} حالة (المبلغ المرصود: ${totalLeakageSAR.toLocaleString()} ر.س، المجمد: ${frozenAmountSAR.toLocaleString()} ر.س).
- تفاصيل الحالات المرصودة:
${anomalies.map(a => `  * القضية ${a.case_number}: المورد "${a.target_vendor}" بمبلغ ${parseFloat(a.flagged_amount).toLocaleString()} ر.س، الحالة: ${a.status}، التوصيف: ${a.narrative_ar || a.narrative_en}`).join('\n')}
- القرارات التنفيذية: ${decisions.length} قرار (معلقة: ${pendingDecisions.length}، الأثر المالي: ${pendingImpactSAR.toLocaleString()} ر.س).
- المخاطر التشغيلية والمالية: ${risks.length} مخاطر (إجمالي التعرض: ${risks.reduce((s, r) => s + parseFloat(r.financial_exposure_sar || 0), 0).toLocaleString()} ر.س).
- المشاريع الرأسمالية: ${projects.length} مشاريع (المشاريع تحت الخطر: ${projects.filter(p => p.health === 'at-risk').length}).
- شبكة الموردين: ${suppliers.length} موردين (موردين في وضع حرج: ${suppliers.filter(s => s.risk_status === 'critical').length}).
- العملاء ومخاطر الإيراد: ${customers.length} عملاء (عملاء في خطر فقدان مرتفع: ${customers.filter(c => c.churn_probability > 0.5).length}).`
    : `TENANT OPERATIONAL DATABASE CONTEXT:
- Organization ID: ${orgId}
- Total Financial Anomalies: ${anomalies.length} (Total Flagged: ${totalLeakageSAR.toLocaleString()} SAR, Frozen: ${frozenAmountSAR.toLocaleString()} SAR)
- Active Anomaly Cases: ${JSON.stringify(anomalies.map(a => ({ case: a.case_number, vendor: a.target_vendor, amount: a.flagged_amount, severity: a.severity, rule: a.rule_code, status: a.status })))}
- Executive Decisions: ${decisions.length} (Pending: ${pendingDecisions.length}, Impact: ${pendingImpactSAR.toLocaleString()} SAR)
- Monitored Risks: ${risks.length} (Total Exposure: ${risks.reduce((s, r) => s + parseFloat(r.financial_exposure_sar || 0), 0).toLocaleString()} SAR)
- Capital Projects: ${projects.length} (At-Risk: ${projects.filter(p => p.health === 'at-risk').length})
- Suppliers: ${suppliers.length} (Critical Price Creep: ${suppliers.filter(s => s.risk_status === 'critical').length})
- Customers: ${customers.length} (High Churn Risk: ${customers.filter(c => c.churn_probability > 0.5).length}).`;

  const systemPrompt = isAr
    ? `أنت المساعد الذكي للقرارات التنفيذية في منصة مخلافي لابس (MIKHLAFI LABS).
أنت تقدم إجابات تنفيذية ودقيقة وحسابية مبنية حصرياً على سياق قاعدة بيانات المؤسسة أدناه.
القواعد الصارمة:
1. أجب باللغة العربية بأسلوب تنفيذي موجز ومنظم بنقاط واضحة.
2. اذكر الأرقام والمبالغ بالريال السعودي وأسماء الموردين والقضايا كما هي في البيانات دون اختلاق أو تزييف.
3. قدم توصيات وإجراءات تنفيذية وقائية وعلاجية مباشرة.

${dbContextSummary}`
    : `You are MIKHLAFI LABS Executive Decision Intelligence Assistant.
You provide executive, factual, and mathematically rigorous answers to business questions based STRICTLY on the tenant's PostgreSQL database context provided.
RULES:
1. Always answer in English.
2. If there are 0 records in the database for the requested category, state clearly and honestly that no records exist yet.
3. NEVER invent fake numbers or hallucinate metrics not present in the database context.
4. Format responses clearly with executive bullet points.

${dbContextSummary}`;

  // Try real AI generation (Gemini or Ollama)
  let answerText = '';
  let providerUsedName = provider.name;
  let isLocal = true;

  try {
    const aiResult = await provider.generate({
      prompt: queryText,
      systemPrompt,
      locale
    });

    if (aiResult && aiResult.text) {
      answerText = aiResult.text;
      providerUsedName = aiResult.provider;
      isLocal = aiResult.isLocal;
    }
  } catch (err) {
    console.warn('[AI Generation error, falling back to deterministic synthesis]:', err.message);
  }

  // 3. Fallback Deterministic Engine (Zero fake numbers, strictly computed from real rows)
  if (!answerText) {
    if (
      qLower.includes('لماذا') ||
      qLower.includes('سبب') ||
      qLower.includes('أسباب') ||
      qLower.includes('فسر') ||
      qLower.includes('تفسير') ||
      qLower.includes('خسائر') ||
      qLower.includes('خسارة') ||
      qLower.includes('قلت') ||
      qLower.includes('انخفضت') ||
      qLower.includes('حلول') ||
      qLower.includes('حل') ||
      qLower.includes('why') ||
      qLower.includes('cause') ||
      qLower.includes('reason') ||
      qLower.includes('explain') ||
      qLower.includes('solution')
    ) {
      if (anomalies.length === 0) {
        answerText = isAr
          ? `📊 التفسير التنفيذي والتحليل السببي:
• بناءً على قاعدة بيانات مؤسستكم الحالية في PostgreSQL: لا توجد أي حالات تسرب مالي أو خسائر مرصودة حالياً.
• لإجراء التحليل السببي واكتشاف الانحرافات، يرجى استيراد قيود دفتر الأستاذ العام (CSV) عبر شاشة التكاملات أو تفعيل قنوات الربط مع ERP.`
          : `📊 Executive Causal Analysis:
• Based on your current tenant database in PostgreSQL: Zero financial leakage cases or operational losses are recorded.
• To generate empirical causal analysis and variance detection, import general ledger entries via CSV or connect ERP telemetry.`;
      } else {
        answerText = isAr
          ? `📊 التفسير التنفيذي والتحليل السببي من واقع السجلات الحالية:
1️⃣ المؤشرات المالية المرصودة:
• إجمالي التسربات المالية المرصودة: ${totalLeakageSAR.toLocaleString()} ريال عبر ${anomalies.length} حالات شذوذ حسابي.
• السيولة المحمية بالتجميد المباشر: ${frozenAmountSAR.toLocaleString()} ريال (${frozenAnomalies.length} حالات مجمدة).

2️⃣ الأسباب الجذرية الدقيقة:
${anomalies.slice(0, 3).map((a, idx) => `• السبب 0${idx + 1} (${a.rule_code}): المورد "${a.target_vendor}" بمبلغ ${parseFloat(a.flagged_amount).toLocaleString()} ريال. الملاحظة: ${a.narrative_ar}`).join('\n')}

3️⃣ الحلول والإجراءات التنفيذية المعتمدة:
• تفعيل بوابة الاعتماد المسبقة (Pre-Payment Gate) للمطابقة الثلاثية (PO + GRN + Invoice).
• حظر صرف المطالبات المعلقة حتى التحقق من سلامة القيود مع الإدارة المالية.`
          : `📊 Executive Causal Analysis from Live Database Records:
1️⃣ Detected Financial Metrics:
• Total Flagged Leakage: ${totalLeakageSAR.toLocaleString()} SAR across ${anomalies.length} anomaly cases.
• Protected Capital: ${frozenAmountSAR.toLocaleString()} SAR frozen across ${frozenAnomalies.length} disbursements.

2️⃣ Identified Root Causes:
${anomalies.slice(0, 3).map((a, idx) => `• Cause 0${idx + 1} (${a.rule_code}): Vendor "${a.target_vendor}" for ${parseFloat(a.flagged_amount).toLocaleString()} SAR (${a.narrative_en})`).join('\n')}

3️⃣ Prescriptive Executive Solutions:
• Enforce 3-way matching gate prior to wire disbursement.
• Freeze flagged disbursements pending CFO forensic review.`;
      }
    } else if (qLower.includes('هدر') || qLower.includes('تسرب') || qLower.includes('فواتير') || qLower.includes('leak') || qLower.includes('invoice') || qLower.includes('anomaly')) {
      if (anomalies.length === 0) {
        answerText = isAr
          ? 'تم فحص السجلات المحاسبية الحالية: لا توجد أي حالات تسرب مالي أو فواتير مشبوهة مسجلة في قاعدة البيانات.'
          : 'Verified ledger records: Zero active financial leakage anomalies detected in the tenant database.';
      } else {
        const topCase = anomalies[0];
        answerText = isAr
          ? `تم رصد ${anomalies.length} حالات شذوذ مالي وتسرب بقيمة إجمالية ${totalLeakageSAR.toLocaleString()} ريال سعودي. أبرزها الحالة (${topCase.case_number}) للمورد "${topCase.target_vendor}" بمبلغ ${parseFloat(topCase.flagged_amount).toLocaleString()} ريال (${topCase.narrative_ar}).`
          : `${anomalies.length} financial anomaly cases detected totaling ${totalLeakageSAR.toLocaleString()} SAR. Top case is (${topCase.case_number}) for vendor "${topCase.target_vendor}" at ${parseFloat(topCase.flagged_amount).toLocaleString()} SAR (${topCase.narrative_en}).`;
      }
    } else if (qLower.includes('قرار') || qLower.includes('قرارات') || qLower.includes('decision') || qLower.includes('action')) {
      if (decisions.length === 0) {
        answerText = isAr
          ? 'لا توجد قرارات تنفيذية مسجلة حالياً في جدول tenant_decisions لمؤسستكم.'
          : 'Zero executive decisions currently recorded in tenant_decisions for your organization.';
      } else {
        answerText = isAr
          ? `يوجد ${pendingDecisions.length} قرارات تنفيذية معلقة بأثر مالي مستهدف قدره ${pendingImpactSAR.toLocaleString()} ريال سعودي. أهمها: "${decisions[0].title}" بقيمة ${parseFloat(decisions[0].impact_amount).toLocaleString()} ريال.`
          : `${pendingDecisions.length} pending executive decisions recorded with target financial impact of ${pendingImpactSAR.toLocaleString()} SAR. Top decision: "${decisions[0].title}" (${parseFloat(decisions[0].impact_amount).toLocaleString()} SAR).`;
      }
    } else {
      // General factual overview
      answerText = isAr
        ? `ملخص الاستخبارات التنفيذية من واقع قاعدة البيانات الحقيقية:
• الانحرافات المالية: ${anomalies.length} حالات مرصودة (إجمالي: ${totalLeakageSAR.toLocaleString()} ريال).
• القرارات التنفيذية: ${pendingDecisions.length} قرارات معلقة (الأثر: ${pendingImpactSAR.toLocaleString()} ريال).
• رادار المخاطر: ${risks.length} مخاطر مسجلة.
• المشاريع: ${projects.length} مشاريع قيد المراقبة.
• الموردون: ${suppliers.length} موردين مسجلين.`
        : `Executive Decision Intelligence Brief from Live PostgreSQL:
• Financial Anomalies: ${anomalies.length} flagged cases (${totalLeakageSAR.toLocaleString()} SAR).
• Executive Decisions: ${pendingDecisions.length} pending actions (${pendingImpactSAR.toLocaleString()} SAR).
• Operational Risks: ${risks.length} registered risks.
• Capital Projects: ${projects.length} monitored.
• Monitored Suppliers: ${suppliers.length} vendors.`;
    }
  }

  // Persist interaction to ai_assistant_logs
  await query(
    `INSERT INTO ai_assistant_logs (organization_id, user_id, query_text, response_text, citations)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      orgId,
      userId,
      queryText,
      answerText,
      JSON.stringify(citations)
    ]
  );

  return {
    response: answerText,
    citations,
    aiProvider: {
      name: providerUsedName,
      isLocal,
      sovereignty: isLocal ? 'AIR_GAPPED_OR_LOCAL' : 'CLOUD_MANAGED_AI'
    }
  };
}
