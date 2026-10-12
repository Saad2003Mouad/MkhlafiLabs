// MIKHLAFI LABS — Executive Intelligence Platform Controller (apps/platform)
import { DATA } from './data.js';
import { I18N } from './i18n.js';

export class PlatformApp {
  constructor(state) {
    this.state = state;
    this.activeModule = 'overview';
    this.activeOrg = DATA.organizations[0];
    this.auditLogs = [
      { time: '2026-10-11 08:45', user: 'Saad Al-Mikhlafi', action: 'System Audit Initialization', target: 'Audit Engine v1.0' },
      { time: '2026-10-10 16:30', user: 'Ahmed Al-Sulaiman', action: 'Evidence Inspected', target: 'FAN-2026-081 (INV-8912)' },
      { time: '2026-10-10 11:15', user: 'Khaled Al-Mansour', action: 'Supplier Rate Review', target: 'Al-Yamama Building Materials' }
    ];
  }

  init() {
    this.renderSidebarNav();
    this.renderActiveModule();
    this.bindEvents();
  }

  getLang() {
    return this.state.lang || 'ar';
  }

  getText(key) {
    const lang = this.getLang();
    return (I18N[lang] && I18N[lang][key]) || (I18N['ar'][key] || key);
  }

  setModule(moduleId) {
    this.activeModule = moduleId;
    this.renderSidebarNav();
    this.renderActiveModule();
  }

  renderSidebarNav() {
    const navContainer = document.getElementById('sidebar-nav-list');
    if (!navContainer) return;
    const isAr = this.getLang() === 'ar';

    const menuItems = [
      { id: 'overview', titleAr: 'النظرة العامة التنفيذية', titleEn: 'Executive Overview', icon: 'grid', badge: '' },
      { id: 'executive-decisions', titleAr: 'مركز القرارات', titleEn: 'Decision Center', icon: 'check-circle', badge: '4', badgeType: 'badge-high' },
      { id: 'financial-intelligence', titleAr: 'الذكاء المالي وكشف الهدر', titleEn: 'Financial Intelligence', icon: 'file-text', badge: '14', badgeType: 'badge-critical' },
      { id: 'risk-prediction', titleAr: 'التنبؤ بالمخاطر', titleEn: 'Risk Intelligence', icon: 'alert-triangle', badge: '5', badgeType: 'badge-high' },
      { id: 'project-intelligence', titleAr: 'ذكاء أداء المشاريع', titleEn: 'Project Performance', icon: 'trending-up', badge: '2', badgeType: 'badge-medium' },
      { id: 'supplier-intelligence', titleAr: 'ذكاء الموردين والمشتريات', titleEn: 'Supplier Intelligence', icon: 'truck', badge: '4', badgeType: 'badge-neutral' },
      { id: 'customer-intelligence', titleAr: 'مراقبة العملاء ومخاطر الفقدان', titleEn: 'Customer Intelligence', icon: 'users', badge: '', badgeType: '' },
      { id: 'ai-assistant', titleAr: 'المساعد التنفيذي المؤسسي', titleEn: 'AI Executive Assistant', icon: 'message-square', badge: 'Active', badgeType: 'badge-accent' },
      { id: 'data-quality', titleAr: 'مراقبة جودة البيانات', titleEn: 'Data Quality Intelligence', icon: 'shield', badge: '94.8%', badgeType: 'badge-low' },
      { id: 'integrations', titleAr: 'التكامل والأنظمة المرتبطة', titleEn: 'Integrations & Connectors', icon: 'cpu', badge: '4 Synced', badgeType: 'badge-low' },
      { id: 'audit-log', titleAr: 'سجل التدقيق المؤسسي', titleEn: 'Audit Trail & Compliance', icon: 'list', badge: '', badgeType: '' }
    ];

    navContainer.innerHTML = menuItems.map(item => `
      <div class="sidebar-nav-item ${this.activeModule === item.id ? 'active' : ''}" data-nav-module="${item.id}">
        <span class="nav-icon">${this.getNavSvg(item.icon)}</span>
        <span class="sidebar-nav-text">${isAr ? item.titleAr : item.titleEn}</span>
        ${item.badge ? `<span class="nav-badge badge ${item.badgeType}">${item.badge}</span>` : ''}
      </div>
    `).join('');
  }

  getNavSvg(icon) {
    switch (icon) {
      case 'grid':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`;
      case 'check-circle':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      case 'file-text':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`;
      case 'alert-triangle':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      case 'trending-up':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`;
      case 'truck':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`;
      case 'users':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
      case 'message-square':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
      case 'shield':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
      case 'cpu':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`;
      default:
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`;
    }
  }

  renderActiveModule() {
    const mainArea = document.getElementById('platform-main-content');
    if (!mainArea) return;
    const isAr = this.getLang() === 'ar';

    // Update Topbar Title
    const titleElem = document.getElementById('topbar-title');
    const subElem = document.getElementById('topbar-sub');

    switch (this.activeModule) {
      case 'financial-intelligence':
        if (titleElem) titleElem.textContent = isAr ? 'كشف الهدر المالي والاختلالات' : 'Financial Leak Detection & Anomalies';
        if (subElem) subElem.textContent = isAr ? 'سجل الفواتير المكررة وتفاوت الأسعار وخروقات الميزانية مع أدلة التدقيق.' : 'Registry of flagged transactions, duplicate bills, and contract price variances.';
        this.renderFinancialIntelligence(mainArea);
        break;

      case 'executive-decisions':
        if (titleElem) titleElem.textContent = isAr ? 'مركز القرارات التنفيذية' : 'Executive Decision Center';
        if (subElem) subElem.textContent = isAr ? 'طابور عمل تنفيذى للأولويات مع تعيين المسؤولين ومتابعة الأثر المالي.' : 'Prioritized work queue with assigned owners, status tracking, and measurable bottom line.';
        this.renderDecisionCenter(mainArea);
        break;

      case 'risk-prediction':
        if (titleElem) titleElem.textContent = isAr ? 'التنبؤ بالمخاطر والإنذار المبكر' : 'Predictive Risk Intelligence';
        if (subElem) subElem.textContent = isAr ? 'سجل المخاطر التشغيلية وسلاسل الإمداد ومؤشرات السيولة المبكرة.' : 'Early signals for inventory stockouts, project slippages, and cash-flow bottlenecks.';
        this.renderRiskRegister(mainArea);
        break;

      case 'project-intelligence':
        if (titleElem) titleElem.textContent = isAr ? 'ذكاء أداء المشاريع والإنشاءات' : 'Project Performance Intelligence';
        if (subElem) subElem.textContent = isAr ? 'مقارنة المخطط بالمنفذ، انحراف التكاليف، وحماية هوامش الربحية.' : 'Planned vs actual milestones, budget burn velocity, and contractor claim verification.';
        this.renderProjectPerformance(mainArea);
        break;

      case 'supplier-intelligence':
        if (titleElem) titleElem.textContent = isAr ? 'ذكاء الموردين والمشتريات' : 'Supplier Intelligence';
        if (subElem) subElem.textContent = isAr ? 'تقييم أداء الموردين، رصد التفاوت السعري، وموثوقية التسليم.' : 'Supplier scorecarding, unexplainable price creep detection, and fulfillment reliability.';
        this.renderSupplierIntelligence(mainArea);
        break;

      case 'data-quality':
      case 'integrations':
        if (titleElem) titleElem.textContent = isAr ? 'مراقبة جودة البيانات والتكامل' : 'Data Quality & Connectors';
        if (subElem) subElem.textContent = isAr ? 'حالة الموصلات المتزامنة مع ERP، فحص تكامل الحقول، وسجل التدقيق.' : 'Live status of ERP connectors, mandatory field health checks, and reconciliation rules.';
        this.renderDataQualityAndIntegrations(mainArea);
        break;

      case 'audit-log':
        if (titleElem) titleElem.textContent = isAr ? 'سجل التدقيق المؤسسي والامتثال' : 'Enterprise Audit Log';
        if (subElem) subElem.textContent = isAr ? 'سجل غير قابل للتعديل يوثق جميع الإجراءات والتكليفات والقرارات.' : 'Immutable audit trail capturing all reviews, assignments, and approvals.';
        this.renderAuditLog(mainArea);
        break;

      case 'overview':
      default:
        if (titleElem) titleElem.textContent = this.getText('plat_top_title');
        if (subElem) subElem.textContent = this.getText('plat_top_sub');
        this.renderOverview(mainArea);
        break;
    }
  }

  // View: Executive Overview
  renderOverview(container) {
    const isAr = this.getLang() === 'ar';

    container.innerHTML = `
      <!-- KPI Row -->
      <div class="kpi-cards-grid">
        ${DATA.kpis.map(kpi => `
          <div class="kpi-metric-card" data-kpi-id="${kpi.id}">
            <div class="kpi-card-header">
              <span class="kpi-title">${isAr ? kpi.titleAr : kpi.titleEn}</span>
              <span class="status-dot ${kpi.trend === 'positive' ? 'active' : (kpi.trend === 'danger' ? 'danger' : 'warning')}"></span>
            </div>
            <div class="kpi-value">${isAr ? kpi.valAr : kpi.valEn}</div>
            <div class="kpi-meta-row">
              <span class="body-small">${isAr ? kpi.countAr : kpi.countEn}</span>
              <span class="kpi-trend ${kpi.trend}">${isAr ? kpi.trendTextAr : kpi.trendTextEn}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Executive Dashboard Grid: Attention Queue + Trend Visualizer -->
      <div class="executive-dashboard-grid">
        <!-- "Needs Your Attention" Queue -->
        <div class="attention-queue-card">
          <div class="card-title-bar">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>${this.getText('plat_attention_title')}</span>
            </h3>
            <span class="badge badge-high">${DATA.attentionQueue.length} ${isAr ? 'أولويات نشطة' : 'Active Priorities'}</span>
          </div>

          <div class="attention-items-list">
            ${DATA.attentionQueue.map(item => `
              <div class="attention-item-row" data-attention-id="${item.id}" data-evidence-id="${item.evidenceId}">
                <span class="badge badge-${item.severity}">${isAr ? item.severityAr : item.severityEn}</span>
                <div class="attention-item-main">
                  <span class="attention-item-title">${isAr ? item.titleAr : item.titleEn}</span>
                  <span class="attention-item-reason">${isAr ? item.reasonAr : item.reasonEn}</span>
                </div>
                <span class="attention-impact-tag">${isAr ? item.impactAr : item.impactEn}</span>
                <button class="btn btn-secondary btn-sm inspect-evidence-btn" data-evidence-id="${item.evidenceId}">
                  ${this.getText('plat_evidence_inspect')}
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Trend & Financial Risk Chart -->
        <div class="analytics-card">
          <div class="card-title-bar" style="padding: 0; border: none;">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              <span>${isAr ? 'مسار رصد الهدر المالي (الربع الحالي)' : 'Financial Leak Detection Trajectory'}</span>
            </h3>
            <span class="badge badge-accent">${isAr ? 'تحديث فوري' : 'Live Sync'}</span>
          </div>

          <!-- Clean Native High-Precision SVG Chart -->
          <div class="chart-svg-container">
            <svg viewBox="0 0 400 180" width="100%" height="100%">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--accent-base)" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="var(--accent-base)" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <!-- Grid lines -->
              <line x1="30" y1="30" x2="380" y2="30" stroke="var(--border-hairline)" stroke-dasharray="4"/>
              <line x1="30" y1="75" x2="380" y2="75" stroke="var(--border-hairline)" stroke-dasharray="4"/>
              <line x1="30" y1="120" x2="380" y2="120" stroke="var(--border-hairline)" stroke-dasharray="4"/>
              <line x1="30" y1="160" x2="380" y2="160" stroke="var(--border-strong)"/>
              
              <!-- Area fill -->
              <polygon points="40,140 100,125 160,110 220,135 280,85 340,60 380,45 380,160 40,160" fill="url(#chartGrad)"/>
              
              <!-- Trend Line -->
              <polyline points="40,140 100,125 160,110 220,135 280,85 340,60 380,45" 
                fill="none" stroke="var(--accent-base)" stroke-width="3" stroke-linecap="round"/>
              
              <!-- Points -->
              <circle cx="100" cy="125" r="4" fill="var(--surface)" stroke="var(--accent-base)" stroke-width="2"/>
              <circle cx="280" cy="85" r="4" fill="var(--surface)" stroke="var(--accent-base)" stroke-width="2"/>
              <circle cx="340" cy="60" r="4" fill="var(--surface)" stroke="var(--accent-base)" stroke-width="2"/>
              <circle cx="380" cy="45" r="5" fill="var(--severity-critical)" stroke="var(--surface)" stroke-width="2"/>
              
              <!-- Labels -->
              <text x="40" y="175" font-size="10" fill="var(--text-muted)">يوليو</text>
              <text x="160" y="175" font-size="10" fill="var(--text-muted)">أغسطس</text>
              <text x="280" y="175" font-size="10" fill="var(--text-muted)">سبتمبر</text>
              <text x="360" y="175" font-size="10" fill="var(--text-muted)">أكتوبر</text>
            </svg>
          </div>

          <!-- Bottom Connector status summary -->
          <div style="border-top: 1px solid var(--border-hairline); padding-top: var(--space-sm); display: flex; justify-content: space-between; align-items: center; font-size: 0.6875rem; color: var(--text-muted);">
            <span>${isAr ? 'المصادر المتصلة: SAP · Oracle · Al-Rajhi API' : 'Active Connectors: SAP · Oracle · Bank API'}</span>
            <span class="status-dot active"></span>
          </div>
        </div>
      </div>
    `;
  }

  // View: Financial Intelligence Table
  renderFinancialIntelligence(container) {
    const isAr = this.getLang() === 'ar';

    container.innerHTML = `
      <div class="content-toolbar">
        <div class="filter-group">
          <button class="filter-pill active">${isAr ? 'الكل (14)' : 'All (14)'}</button>
          <button class="filter-pill">${isAr ? 'اشتباه فواتير مكررة (6)' : 'Duplicate Suspects (6)'}</button>
          <button class="filter-pill">${isAr ? 'تفاوت أسعار العقود (5)' : 'Contract Variances (5)'}</button>
          <button class="filter-pill">${isAr ? 'خروقات الميزانية (3)' : 'Policy Breaches (3)'}</button>
        </div>
        <button class="btn btn-secondary btn-sm export-audit-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>${isAr ? 'تصدير تقرير التدقيق' : 'Export Audit Report'}</span>
        </button>
      </div>

      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>${isAr ? 'المعرف' : 'ID'}</th>
              <th>${isAr ? 'المورد / الجهة' : 'Vendor / Counterparty'}</th>
              <th>${isAr ? 'نوع الاختلال' : 'Anomaly Type'}</th>
              <th>${isAr ? 'المبلغ المرصود' : 'Amount'}</th>
              <th>${isAr ? 'رقم الفاتورة' : 'Invoice Ref'}</th>
              <th>${isAr ? 'التاريخ' : 'Date'}</th>
              <th>${isAr ? 'نسبة الثقة الحسابية' : 'Confidence'}</th>
              <th>${isAr ? 'الحالة' : 'Status'}</th>
              <th>${isAr ? 'الإجراء' : 'Action'}</th>
            </tr>
          </thead>
          <tbody>
            ${DATA.financialAnomalies.map(item => `
              <tr>
                <td><span class="record-id-code">${item.id}</span></td>
                <td style="font-weight: 600;">${isAr ? item.vendorAr : item.vendorEn}</td>
                <td><span class="badge badge-accent">${isAr ? item.typeAr : item.typeEn}</span></td>
                <td style="font-weight: 700; font-family: var(--font-mono); color: var(--severity-critical);">${item.amount}</td>
                <td style="font-family: var(--font-mono);">${item.invNum}</td>
                <td>${item.date}</td>
                <td><span class="badge badge-low">${item.confidence}</span></td>
                <td><span class="badge ${item.status === 'flagged' ? 'badge-critical' : 'badge-high'}">${item.status === 'flagged' ? (isAr ? 'مرصود' : 'Flagged') : (isAr ? 'قيد التحقق' : 'Under Review')}</span></td>
                <td>
                  <button class="btn btn-secondary btn-sm inspect-evidence-btn" data-record-id="${item.id}">
                    ${isAr ? 'فحص الأدلة' : 'Inspect'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // View: Decision Center
  renderDecisionCenter(container) {
    const isAr = this.getLang() === 'ar';

    container.innerHTML = `
      <div class="content-toolbar">
        <div class="filter-group">
          <button class="filter-pill active">${isAr ? 'جميع القرارات (4)' : 'All Decisions (4)'}</button>
          <button class="filter-pill">${isAr ? 'بانتظار الاعتماد (2)' : 'Pending Approval (2)'}</button>
          <button class="filter-pill">${isAr ? 'مكلفة (1)' : 'Assigned (1)'}</button>
          <button class="filter-pill">${isAr ? 'تمت التسوية (1)' : 'Resolved (1)'}</button>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-md);">
        ${DATA.attentionQueue.map(item => `
          <div class="card" style="border-inline-start: 4px solid var(--accent-base);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-sm);">
              <div>
                <span class="badge badge-${item.severity}" style="margin-bottom: var(--space-xs);">${isAr ? item.severityAr : item.severityEn}</span>
                <h3 class="title-sm">${isAr ? item.titleAr : item.titleEn}</h3>
              </div>
              <span style="font-weight: 800; font-family: var(--font-mono); color: var(--severity-critical); font-size: var(--text-md);">${isAr ? item.impactAr : item.impactEn}</span>
            </div>

            <p class="body-regular" style="margin-bottom: var(--space-md);">${isAr ? item.reasonAr : item.reasonEn}</p>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-sm); background: var(--surface-subtle); padding: var(--space-sm); border-radius: var(--radius-xs); font-size: var(--text-xs); margin-bottom: var(--space-md);">
              <div><strong>${isAr ? 'المسؤول المكلف:' : 'Assigned Owner:'}</strong> ${isAr ? item.ownerAr : item.ownerEn}</div>
              <div><strong>${isAr ? 'الموعد المحدد:' : 'Due Horizon:'}</strong> ${item.dueDate}</div>
              <div><strong>${isAr ? 'حالة القرار:' : 'Status:'}</strong> ${isAr ? item.statusAr : item.statusEn}</div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: var(--space-sm);">
              <button class="btn btn-secondary btn-sm dismiss-action-btn" data-item-id="${item.id}">
                ${this.getText('plat_dismiss')}
              </button>
              <button class="btn btn-secondary btn-sm assign-owner-btn" data-item-id="${item.id}">
                ${this.getText('plat_assign')}
              </button>
              <button class="btn btn-primary btn-sm authorize-action-btn" data-item-id="${item.id}">
                ${this.getText('plat_acknowledge')}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // View: Risk Register
  renderRiskRegister(container) {
    const isAr = this.getLang() === 'ar';

    container.innerHTML = `
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>${isAr ? 'المعرف' : 'ID'}</th>
              <th>${isAr ? 'فئة الخطر' : 'Risk Category'}</th>
              <th>${isAr ? 'عنوان الخطر التشغيلي' : 'Risk Title'}</th>
              <th>${isAr ? 'المستوى' : 'Severity'}</th>
              <th>${isAr ? 'الأفق الزمني' : 'Horizon'}</th>
              <th>${isAr ? 'نسبة الاحتمال' : 'Confidence'}</th>
              <th>${isAr ? 'خطة التخفيف المقترحة' : 'Mitigation Action'}</th>
            </tr>
          </thead>
          <tbody>
            ${DATA.riskRegister.map(rsk => `
              <tr>
                <td><span class="record-id-code">${rsk.id}</span></td>
                <td><strong>${isAr ? rsk.categoryAr : rsk.categoryEn}</strong></td>
                <td>${isAr ? rsk.titleAr : rsk.titleEn}</td>
                <td><span class="badge badge-${rsk.severity}">${rsk.severity}</span></td>
                <td>${isAr ? rsk.horizonAr : rsk.horizonEn}</td>
                <td><span class="badge badge-low">${rsk.confidence}</span></td>
                <td style="color: var(--text-primary); font-size: var(--text-xs);">${isAr ? rsk.mitigationAr : rsk.mitigationEn}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // View: Project Performance
  renderProjectPerformance(container) {
    const isAr = this.getLang() === 'ar';

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-lg);">
        ${DATA.projects.map(prj => `
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-sm);">
              <h4 class="title-sm">${isAr ? prj.nameAr : prj.nameEn}</h4>
              <span class="badge ${prj.status === 'behind' ? 'badge-critical' : (prj.status === 'on-track' ? 'badge-low' : 'badge-accent')}">
                ${prj.status === 'behind' ? (isAr ? 'متأخر' : 'Behind') : (prj.status === 'on-track' ? (isAr ? 'ملتزم' : 'On Track') : (isAr ? 'متقدم' : 'Ahead'))}
              </span>
            </div>

            <p class="body-small" style="margin-bottom: var(--space-md); color: var(--severity-high);">
              ${isAr ? prj.varianceTextAr : prj.varianceTextEn}
            </p>

            <div style="display: flex; flex-direction: column; gap: var(--space-xs); font-size: var(--text-xs); margin-bottom: var(--space-md);">
              <div style="display: flex; justify-content: space-between;">
                <span>${isAr ? 'الإنجاز المخطط:' : 'Planned:'}</span>
                <strong>${prj.plannedProgress}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>${isAr ? 'الإنجاز الفعلي:' : 'Actual:'}</span>
                <strong style="color: var(--accent-base);">${prj.actualProgress}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>${isAr ? 'الميزانية المعتمدة:' : 'Budget:'}</span>
                <span>${prj.budgetAllocated}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>${isAr ? 'المنصرف الفعلي:' : 'Spent:'}</span>
                <strong>${prj.budgetSpent}</strong>
              </div>
            </div>

            <button class="btn btn-secondary btn-sm" style="width: 100%;">
              ${isAr ? 'استعراض تحليل المستخلصات' : 'Inspect Milestones'}
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // View: Supplier Intelligence
  renderSupplierIntelligence(container) {
    const isAr = this.getLang() === 'ar';

    container.innerHTML = `
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>${isAr ? 'اسم المورد' : 'Supplier Name'}</th>
              <th>${isAr ? 'مؤشر تفاوت الأسعار' : 'Price Deviation Index'}</th>
              <th>${isAr ? 'موثوقية التسليم' : 'Delivery Reliability'}</th>
              <th>${isAr ? 'حجم المعاملات (سنوي)' : 'Annual Spend'}</th>
              <th>${isAr ? 'مؤشر التبعية' : 'Dependency Risk'}</th>
              <th>${isAr ? 'الإجراء الموصى به' : 'Next Step'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>مصنع اليمامة لمواد البناء</strong></td>
              <td><span class="badge badge-critical">+16.5% تفاوت غير مبرر</span></td>
              <td>92%</td>
              <td style="font-family: var(--font-mono);">4,200,000 ر.س</td>
              <td><span class="badge badge-high">مرتفع (مصدر وحيد)</span></td>
              <td>مراجعة ملحق العقد قبل صرف المستخلص</td>
            </tr>
            <tr>
              <td><strong>شركة التوريدات الهندسية الحديثة</strong></td>
              <td><span class="badge badge-critical">اشتباه تكرار فواتير</span></td>
              <td>84%</td>
              <td style="font-family: var(--font-mono);">2,850,000 ر.س</td>
              <td><span class="badge badge-medium">متوسط</span></td>
              <td>إيقاف صرف الفاتورة INV-8912</td>
            </tr>
            <tr>
              <td><strong>مجموعة الأنابيب والبنية التحتية</strong></td>
              <td><span class="badge badge-low">ضمن النطاق (0%)</span></td>
              <td>98%</td>
              <td style="font-family: var(--font-mono);">6,100,000 ر.س</td>
              <td><span class="badge badge-low">منخفض</span></td>
              <td>مورد مفضل — تجديد العقد السنوي</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  // View: Data Quality & Integrations
  renderDataQualityAndIntegrations(container) {
    const isAr = this.getLang() === 'ar';

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-xl);">
        <div class="card">
          <h3 class="title-sm" style="margin-bottom: var(--space-md);">${isAr ? 'الموصلات والأنظمة المرتبطة (Connectors)' : 'Active Connectors'}</h3>
          <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
            ${DATA.connectors.map(c => `
              <div style="padding: var(--space-sm); background: var(--surface-subtle); border-radius: var(--radius-xs); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 700; font-size: var(--text-xs);">${c.name}</div>
                  <div style="font-size: 0.6875rem; color: var(--text-muted);">${c.type} · ${c.recordsCount}</div>
                </div>
                <div style="text-align: end;">
                  <span class="badge ${c.status === 'connected' ? 'badge-low' : 'badge-high'}">${isAr ? c.statusAr : c.statusEn}</span>
                  <div style="font-size: 0.625rem; color: var(--text-muted); margin-top: 2px;">${isAr ? c.lastSyncAr : c.lastSyncEn}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card">
          <h3 class="title-sm" style="margin-bottom: var(--space-md);">${isAr ? 'فحص جودة وتناسق البيانات' : 'Data Integrity Checks'}</h3>
          <ul style="display: flex; flex-direction: column; gap: var(--space-sm); font-size: var(--text-xs);">
            <li style="display: flex; justify-content: space-between; padding-bottom: var(--space-xs); border-bottom: 1px solid var(--border-hairline);">
              <span>اكتمال الحقول الإلزامية (Mandatory Fields):</span>
              <span class="badge badge-low">99.4% سليم</span>
            </li>
            <li style="display: flex; justify-content: space-between; padding-bottom: var(--space-xs); border-bottom: 1px solid var(--border-hairline);">
              <span>مطابقة مسميات الموردين (Entity Deduplication):</span>
              <span class="badge badge-low">100% موحد</span>
            </li>
            <li style="display: flex; justify-content: space-between; padding-bottom: var(--space-xs); border-bottom: 1px solid var(--border-hairline);">
              <span>فحص أسعار الصرف والعملات (Currency Alignment):</span>
              <span class="badge badge-low">SAR / USD متطابق</span>
            </li>
            <li style="display: flex; justify-content: space-between;">
              <span>توقف أو تأخر التحديثات (Data Drift):</span>
              <span class="badge badge-low">0 انقطاعات</span>
            </li>
          </ul>

          <div style="margin-top: var(--space-lg); padding: var(--space-md); background: var(--surface-subtle); border: 1px dashed var(--border-subtle); border-radius: var(--radius-xs); text-align: center;">
            <p class="body-small" style="margin-bottom: var(--space-xs);">${isAr ? 'استيراد يدوي لملفات إكسل / CSV للتدقيق' : 'Import CSV/Excel for manual audit'}</p>
            <button class="btn btn-secondary btn-sm" id="trigger-csv-import">
              ${isAr ? 'اختيار ملف للرفع' : 'Select File'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // View: Audit Log
  renderAuditLog(container) {
    const isAr = this.getLang() === 'ar';

    container.innerHTML = `
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>${isAr ? 'الوقت' : 'Timestamp'}</th>
              <th>${isAr ? 'المستخدم' : 'Actor'}</th>
              <th>${isAr ? 'الإجراء المسجل' : 'Action'}</th>
              <th>${isAr ? 'السجل المستهدف' : 'Target Entity'}</th>
              <th>${isAr ? 'التحقق' : 'Verification'}</th>
            </tr>
          </thead>
          <tbody>
            ${this.auditLogs.map(log => `
              <tr>
                <td style="font-family: var(--font-mono);">${log.time}</td>
                <td><strong>${log.user}</strong></td>
                <td><span class="badge badge-accent">${log.action}</span></td>
                <td style="font-family: var(--font-mono);">${log.target}</td>
                <td><span class="badge badge-low">Immutable Hash OK</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Open Evidence Slide-out Drawer
  openEvidence(evidenceOrRecordId) {
    const isAr = this.getLang() === 'ar';
    const drawer = document.getElementById('slide-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (!drawer || !backdrop) return;

    // Locate related record
    let anomaly = DATA.financialAnomalies.find(a => a.id === evidenceOrRecordId);
    if (!anomaly) {
      anomaly = DATA.financialAnomalies[0];
    }

    const drawerBody = document.getElementById('drawer-body-content');
    if (drawerBody) {
      drawerBody.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="badge badge-critical">${isAr ? 'حالة مؤكدة برقم' : 'Case ID'}: ${anomaly.id}</span>
          <span class="badge badge-low">${isAr ? 'درجة الثقة الحسابية' : 'Confidence'}: ${anomaly.confidence}</span>
        </div>

        <div class="evidence-box">
          <span class="evidence-label">${isAr ? 'المورد المسجل' : 'Registered Vendor'}</span>
          <div class="evidence-val" style="font-weight: 700;">${isAr ? anomaly.vendorAr : anomaly.vendorEn}</div>
        </div>

        <div class="evidence-box">
          <span class="evidence-label">${isAr ? 'المبلغ المرصود والانحراف' : 'Flagged Amount'}</span>
          <div class="evidence-val" style="font-weight: 800; font-family: var(--font-mono); color: var(--severity-critical); font-size: var(--text-lg);">
            ${anomaly.amount}
          </div>
        </div>

        <div class="evidence-box">
          <span class="evidence-label">${isAr ? 'الخوارزمية وقاعدة الرصد المطبقة' : 'Detection Rule'}</span>
          <div class="evidence-val">${isAr ? anomaly.ruleAr : anomaly.ruleEn}</div>
        </div>

        <div class="evidence-box">
          <span class="evidence-label">${isAr ? 'الأساس المرجعي للمقارنة (Baseline)' : 'Comparison Baseline'}</span>
          <div class="evidence-val">${isAr ? anomaly.baselineAr : anomaly.baselineEn}</div>
        </div>

        <div>
          <span class="evidence-label" style="display: block; margin-bottom: var(--space-xs);">${isAr ? 'السجلات المصدرية للمطابقة' : 'Source Evidence Documents'}</span>
          <div class="matching-records-grid">
            <div class="matching-record-card">
              <strong>${isAr ? 'الفاتورة محل الاشتباه' : 'Flagged Invoice'}</strong>
              <span style="font-family: var(--font-mono);">${anomaly.invNum}</span>
              <span>${isAr ? 'المبلغ:' : 'Amount:'} ${anomaly.amount}</span>
              <span>${isAr ? 'التاريخ:' : 'Date:'} ${anomaly.date}</span>
              <span class="badge badge-critical">${isAr ? 'قيد الحجز' : 'Hold Requested'}</span>
            </div>
            <div class="matching-record-card">
              <strong>${isAr ? 'الفاتورة المرجعية المسددة' : 'Baseline Paid Invoice'}</strong>
              <span style="font-family: var(--font-mono);">INV-8841</span>
              <span>${isAr ? 'المبلغ:' : 'Amount:'} ${anomaly.amount}</span>
              <span>${isAr ? 'مسددة بتاريخ:' : 'Paid on:'} 2026-09-25</span>
              <span class="badge badge-low">${isAr ? 'سداد سابق' : 'Paid in Full'}</span>
            </div>
          </div>
        </div>

        <div style="padding: var(--space-sm); background: var(--severity-critical-bg); border: 1px solid var(--severity-critical-border); border-radius: var(--radius-xs); font-size: var(--text-xs); color: var(--severity-critical);">
          <strong>${isAr ? 'تنبيه التدقيق المؤسسي:' : 'Audit Note:'}</strong>
          ${isAr ? 'لا يصنف هذا التنبيه كاحتيال تلقائياً، بل كاشتباه تطابق يتطلب إيقاف الصرف مؤقتاً ومراجعة المستودع.' : 'This flag is an arithmetic duplicate match, requiring temporary payment freeze and warehouse check before conclusion.'}
        </div>
      `;
    }

    drawer.classList.add('open');
    backdrop.classList.add('open');
  }

  closeEvidence() {
    const drawer = document.getElementById('slide-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  }

  // Handle Action taken inside Evidence / Decision Center
  recordDecisionAction(actionName, recordId) {
    const isAr = this.getLang() === 'ar';
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.auditLogs.unshift({
      time: now,
      user: 'Saad Al-Mikhlafi',
      action: actionName,
      target: recordId || 'ATT-101'
    });
    alert(isAr ? `تم تسجيل الإجراء (${actionName}) وتوثيق المعاملة بنجاح في سجل التدقيق غير القابل للتعديل.` : `Action (${actionName}) authorized and recorded to immutable audit log.`);
    this.closeEvidence();
    this.renderActiveModule();
  }

  bindEvents() {
    // Nav Click inside Sidebar
    document.addEventListener('click', (e) => {
      const navItem = e.target.closest('[data-nav-module]');
      if (navItem) {
        const modId = navItem.getAttribute('data-nav-module');
        this.setModule(modId);
      }
    });

    // Inspect Evidence Buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.inspect-evidence-btn');
      if (btn) {
        const id = btn.getAttribute('data-evidence-id') || btn.getAttribute('data-record-id');
        this.openEvidence(id);
      }
    });

    // Close Drawer Buttons
    document.getElementById('close-drawer-btn')?.addEventListener('click', () => this.closeEvidence());
    document.getElementById('drawer-backdrop')?.addEventListener('click', () => {
      this.closeEvidence();
      document.getElementById('ai-assistant-drawer')?.classList.remove('open');
    });

    // Authorize Action
    document.addEventListener('click', (e) => {
      if (e.target.closest('.authorize-action-btn') || e.target.closest('#drawer-approve-btn')) {
        this.recordDecisionAction('Authorized Payment Freeze', 'FAN-2026-081');
      }
      if (e.target.closest('.assign-owner-btn') || e.target.closest('#drawer-assign-btn')) {
        this.recordDecisionAction('Assigned to Internal Audit', 'FAN-2026-081');
      }
      if (e.target.closest('.dismiss-action-btn') || e.target.closest('#drawer-dismiss-btn')) {
        const reason = prompt(this.getLang() === 'ar' ? 'يرجى إدخال سبب التبرير لتوثيقه في سجل التدقيق:' : 'Please enter justification rationale:');
        if (reason) {
          this.recordDecisionAction(`Dismissed: ${reason}`, 'FAN-2026-081');
        }
      }
    });

    // AI Assistant Drawer Toggle
    const aiToggleBtn = document.getElementById('toggle-ai-assistant-btn');
    const aiDrawer = document.getElementById('ai-assistant-drawer');
    const closeAiBtn = document.getElementById('close-ai-drawer-btn');

    if (aiToggleBtn && aiDrawer) {
      aiToggleBtn.addEventListener('click', () => {
        aiDrawer.classList.toggle('open');
        document.getElementById('drawer-backdrop')?.classList.toggle('open');
      });
    }

    if (closeAiBtn && aiDrawer) {
      closeAiBtn.addEventListener('click', () => {
        aiDrawer.classList.remove('open');
        document.getElementById('drawer-backdrop')?.classList.remove('open');
      });
    }

    // AI Prompt Suggestions Click
    document.querySelectorAll('.suggested-prompt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const queryType = btn.getAttribute('data-query');
        this.handleAiQuery(queryType, btn.textContent);
      });
    });

    // AI Input Form
    const aiForm = document.getElementById('ai-query-form');
    if (aiForm) {
      aiForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('ai-user-input');
        if (input && input.value.trim()) {
          const val = input.value.trim();
          input.value = '';
          this.handleAiQuery('default', val);
        }
      });
    }

    // Organization Switcher
    const orgBtn = document.getElementById('org-switch-btn');
    if (orgBtn) {
      orgBtn.addEventListener('click', () => {
        const currentIndex = DATA.organizations.findIndex(o => o.id === this.activeOrg.id);
        const nextIndex = (currentIndex + 1) % DATA.organizations.length;
        this.activeOrg = DATA.organizations[nextIndex];
        const isAr = this.getLang() === 'ar';
        const nameDisplay = document.getElementById('active-org-name');
        const branchDisplay = document.getElementById('active-org-branch');
        if (nameDisplay) nameDisplay.textContent = isAr ? this.activeOrg.nameAr : this.activeOrg.nameEn;
        if (branchDisplay) branchDisplay.textContent = isAr ? this.activeOrg.branchAr : this.activeOrg.branchEn;
        alert(isAr ? `تم التبديل بنجاح إلى سياق: ${this.activeOrg.nameAr}` : `Switched context to: ${this.activeOrg.nameEn}`);
      });
    }

    // Global Search (Ctrl + K)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const term = prompt(this.getLang() === 'ar' ? 'بحث شامل في السجلات والفواتير والموردين:' : 'Global Search across records:');
        if (term) {
          alert(this.getLang() === 'ar' ? `جاري البحث عن: ${term} ... تم العثور على 3 نتائج مرتبطة في الذكاء المالي والمشاريع.` : `Searching for "${term}" ... 3 matching records found.`);
          this.setModule('financial-intelligence');
        }
      }
    });
  }

  handleAiQuery(queryType, userText) {
    const isAr = this.getLang() === 'ar';
    const messagesBox = document.getElementById('ai-messages-container');
    if (!messagesBox) return;

    // Append User Message
    const userMsgElem = document.createElement('div');
    userMsgElem.className = 'ai-msg user';
    userMsgElem.textContent = userText;
    messagesBox.appendChild(userMsgElem);

    // Get grounded response
    const respObj = DATA.aiAssistantResponses[queryType] || DATA.aiAssistantResponses['default'];
    const respText = isAr ? respObj.ar : respObj.en;
    const citations = respObj.citations || [];

    // Simulate instant grounded streaming
    setTimeout(() => {
      const aiMsgElem = document.createElement('div');
      aiMsgElem.className = 'ai-msg assistant';
      aiMsgElem.innerHTML = `
        <div>${respText}</div>
        ${citations.length > 0 ? `
          <div class="ai-citations-box">
            <span style="font-size: 0.625rem; color: var(--text-muted);">${isAr ? 'الأدلة والسجلات المصدرية المستشهد بها:' : 'Evidence Citations:'}</span>
            ${citations.map(c => `<span class="citation-chip" onclick="window.platform.openEvidence('${c}')">${c}</span>`).join('')}
          </div>
        ` : ''}
      `;
      messagesBox.appendChild(aiMsgElem);
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }, 250);
  }
}
