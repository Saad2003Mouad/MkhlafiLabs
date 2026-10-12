// MIKHLAFI LABS — Corporate Website Logic (apps/website)
import { DATA } from './data.js';
import { I18N } from './i18n.js';

export class WebsiteApp {
  constructor(state) {
    this.state = state;
    this.selectedModules = [
      'financial-intelligence',
      'executive-decisions',
      'risk-prediction',
      'project-intelligence'
    ];
    this.selectedDeployment = 'cloud';
    this.selectedSize = 'mid';
  }

  init() {
    this.renderChallenges();
    this.renderFlow();
    this.renderSolutions();
    this.renderIndustries();
    this.renderDeployment();
    this.renderPackages();
    this.initQuoteCalculator();
    this.bindEvents();
    this.init3DTiltEffects();
  }

  getLang() {
    return this.state.lang || 'ar';
  }

  getText(key) {
    const lang = this.getLang();
    return (I18N[lang] && I18N[lang][key]) || (I18N['ar'][key] || key);
  }

  renderChallenges() {
    const container = document.getElementById('challenges-grid');
    if (!container) return;
    const isAr = this.getLang() === 'ar';

    container.innerHTML = DATA.challenges.map(item => `
      <div class="challenge-card">
        <span class="challenge-number">${item.num}</span>
        <h3 class="challenge-title">${isAr ? item.titleAr : item.titleEn}</h3>
        <p class="challenge-desc">${isAr ? item.descAr : item.descEn}</p>
      </div>
    `).join('');
  }

  renderFlow() {
    const container = document.getElementById('flow-steps-grid');
    if (!container) return;
    const isAr = this.getLang() === 'ar';

    container.innerHTML = DATA.architectureFlow.map((step, idx) => `
      <div class="flow-step-card">
        <span class="flow-step-index">0${idx + 1}</span>
        <h4 class="flow-step-title">${isAr ? step.titleAr : step.titleEn}</h4>
        <p class="flow-step-desc">${isAr ? step.descAr : step.descEn}</p>
        <div class="flow-step-chips">
          ${step.chips.map(chip => `<span class="flow-chip">${chip}</span>`).join('')}
        </div>
        ${idx < 3 ? '<div class="flow-step-arrow">→</div>' : ''}
      </div>
    `).join('');
  }

  renderSolutions() {
    const container = document.getElementById('solutions-grid');
    if (!container) return;
    const isAr = this.getLang() === 'ar';

    const getIconSvg = (icon) => {
      switch (icon) {
        case 'file-text':
          return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
        case 'check-circle':
          return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        case 'alert-triangle':
          return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
        case 'trending-up':
          return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`;
        case 'truck':
          return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`;
        case 'users':
          return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
        case 'message-square':
          return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
        default:
          return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
      }
    };

    container.innerHTML = DATA.solutions.map(sol => `
      <div class="solution-card" data-solution-id="${sol.id}">
        <div class="solution-top">
          <div class="solution-icon-wrap">
            ${getIconSvg(sol.icon)}
          </div>
          <span class="badge badge-accent">${sol.badge}</span>
        </div>
        <h4 class="solution-title">${isAr ? sol.titleAr : sol.titleEn}</h4>
        <p class="solution-outcome">${isAr ? sol.outcomeAr : sol.outcomeEn}</p>
        <span class="solution-action-link">
          <span>${this.getText('solution_learn_more')}</span>
          <span>${isAr ? '←' : '→'}</span>
        </span>
      </div>
    `).join('');
  }

  renderIndustries() {
    const container = document.getElementById('industries-grid');
    if (!container) return;
    const isAr = this.getLang() === 'ar';

    container.innerHTML = DATA.industries.map(ind => {
      const points = isAr ? ind.pointsAr : (ind.pointsEn || ind.pointsAr);
      return `
        <div class="industry-card">
          <h4>${isAr ? ind.titleAr : ind.titleEn}</h4>
          <p>${isAr ? ind.descAr : ind.descEn}</p>
          <ul class="industry-points">
            ${points.map(pt => `<li>${pt}</li>`).join('')}
          </ul>
        </div>
      `;
    }).join('');
  }

  renderDeployment() {
    const container = document.getElementById('deployment-grid');
    if (!container) return;
    const isAr = this.getLang() === 'ar';

    container.innerHTML = DATA.deploymentOptions.map(dep => {
      const features = isAr ? dep.featuresAr : (dep.featuresEn || dep.featuresAr);
      const tag = isAr ? dep.tagAr : (dep.tagEn || dep.tagAr);
      return `
        <div class="deployment-card ${dep.featured ? 'featured' : ''}">
          <div class="deployment-badge-wrap">
            <span class="badge ${dep.featured ? 'badge-accent' : 'badge-neutral'}">${tag}</span>
          </div>
          <h3 class="deployment-title">${isAr ? dep.titleAr : dep.titleEn}</h3>
          <p class="deployment-desc">${isAr ? dep.descAr : dep.descEn}</p>
          <ul class="deployment-features">
            ${features.map(feat => `
              <li><span class="check-icon">✓</span> <span>${feat}</span></li>
            `).join('')}
          </ul>
          <button class="btn ${dep.featured ? 'btn-primary' : 'btn-secondary'} btn-sm go-to-quote-btn" data-deploy="${dep.id}">
            ${this.getText('deployment_contact_btn')}
          </button>
        </div>
      `;
    }).join('');
  }

  renderPackages() {
    const container = document.getElementById('packages-grid');
    if (!container || !DATA.packages) return;
    const isAr = this.getLang() === 'ar';

    container.innerHTML = DATA.packages.map(pkg => {
      const name = isAr ? pkg.nameAr : pkg.nameEn;
      const subtitle = isAr ? pkg.subtitleAr : pkg.subtitleEn;
      const badge = isAr ? pkg.badgeAr : pkg.badgeEn;
      const trialLabel = isAr ? pkg.trialLabelAr : pkg.trialLabelEn;
      const billingNote = isAr ? pkg.billingNoteAr : pkg.billingNoteEn;
      const features = isAr ? pkg.featuresAr : (pkg.featuresEn || pkg.featuresAr);

      // Render the 8 engines coverage
      const engineItemsHtml = DATA.solutions.map(sol => {
        const isIncluded = pkg.includedServices.includes(sol.id);
        const solTitle = isAr ? sol.titleAr : sol.titleEn;
        if (isIncluded) {
          return `
            <li class="pkg-engine-item included">
              <span class="engine-check-icon">✓</span>
              <span class="engine-name">${solTitle}</span>
              <span class="engine-badge-tag">${sol.badge}</span>
            </li>
          `;
        } else {
          return `
            <li class="pkg-engine-item locked">
              <span class="engine-lock-icon">🔒</span>
              <span class="engine-name locked-name">${solTitle}</span>
              <span class="engine-locked-tag">${isAr ? 'يتطلب ترقية' : 'Upgrade Required'}</span>
            </li>
          `;
        }
      }).join('');

      const ctaText = pkg.id === 'starter' 
        ? (isAr ? 'ابدأ التجربة المجانية (3 محركات)' : 'Start Free Trial (3 Engines)')
        : (pkg.id === 'professional' 
          ? (isAr ? 'ابدأ التجربة المجانية (5 محركات)' : 'Start Free Trial (5 Engines)')
          : (isAr ? 'ابدأ التجربة المجانية (المنظومة الكاملة)' : 'Start Free Trial (All 8 Engines)'));

      return `
        <div class="package-card ${pkg.popular ? 'featured' : ''}" data-package-id="${pkg.id}">
          ${pkg.popular ? `<div class="package-popular-ribbon">${isAr ? 'الأكثر طلباً' : 'MOST POPULAR'}</div>` : ''}
          <div class="package-header">
            <div class="package-tier-badge">
              <span class="badge ${pkg.popular ? 'badge-accent' : 'badge-neutral'}">${badge}</span>
            </div>
            <h3 class="package-name">${name}</h3>
            <p class="package-subtitle">${subtitle}</p>
          </div>

          <div class="package-pricing-frame">
            <div class="trial-highlight-pill">
              <span class="pulse-dot-green"></span>
              <strong>${trialLabel}</strong>
            </div>
            <div class="package-billing-caption">${billingNote}</div>
          </div>

          <div class="package-cta-wrap">
            <button class="btn ${pkg.popular ? 'btn-primary' : 'btn-secondary'} btn-block open-trial-trigger" data-package="${pkg.id}">
              ${ctaText}
            </button>
          </div>

          <div class="package-breakdown">
            <h5 class="breakdown-title">${isAr ? `تغطية محركات الذكاء (${pkg.servicesCount} من 8):` : `Engine Coverage (${pkg.servicesCount} of 8):`}</h5>
            <ul class="pkg-engines-list">
              ${engineItemsHtml}
            </ul>

            <h5 class="breakdown-title" style="margin-top: var(--space-md);">${isAr ? 'المواصفات والربط المؤسسي:' : 'Enterprise Specifications:'}</h5>
            <ul class="package-features-list">
              ${features.map(f => `
                <li><span class="feat-check">✦</span> <span>${f}</span></li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;
    }).join('');
  }

  openTrialModal(packageId = 'professional') {
    const modal = document.getElementById('trial-registration-modal');
    if (!modal) return;
    const isAr = this.getLang() === 'ar';
    const pkg = (DATA.packages && DATA.packages.find(p => p.id === packageId)) || DATA.packages[1];

    const pkgNameElem = document.getElementById('trial-active-package-name');
    if (pkgNameElem && pkg) {
      pkgNameElem.textContent = `${isAr ? pkg.nameAr : pkg.nameEn} (${pkg.servicesCount} ${isAr ? 'محركات' : 'engines'})`;
    }

    const form = document.getElementById('trial-activation-form');
    const success = document.getElementById('trial-success-screen');
    if (form) form.style.display = 'block';
    if (success) success.style.display = 'none';

    modal.style.display = 'flex';
    document.getElementById('trial-name')?.focus();
  }

  initQuoteCalculator() {
    const modulesGrid = document.getElementById('quote-modules-grid');
    if (modulesGrid) {
      const isAr = this.getLang() === 'ar';
      modulesGrid.innerHTML = DATA.solutions.map(sol => {
        const isChecked = this.selectedModules.includes(sol.id);
        return `
          <label class="module-check-item ${isChecked ? 'selected' : ''}">
            <input type="checkbox" value="${sol.id}" ${isChecked ? 'checked' : ''} class="module-calc-cb">
            <span>${isAr ? sol.titleAr : sol.titleEn}</span>
          </label>
        `;
      }).join('');
    }

    this.updateQuoteEstimate();
  }

  updateQuoteEstimate() {
    const count = this.selectedModules.length;
    let baseRate = count * 9500; // Monthly indicative SAR rate per engine

    if (this.selectedSize === 'large') baseRate *= 1.6;
    if (this.selectedSize === 'group') baseRate *= 2.4;

    let deployMultiplier = 1.0;
    if (this.selectedDeployment === 'on-premise') deployMultiplier = 1.45;
    if (this.selectedDeployment === 'hybrid') deployMultiplier = 1.2;

    const estimatedTotal = Math.round(baseRate * deployMultiplier);
    const minEst = Math.round(estimatedTotal * 0.9);
    const maxEst = Math.round(estimatedTotal * 1.15);

    const estDisplay = document.getElementById('quote-est-amount');
    const modulesCountDisplay = document.getElementById('quote-summary-count');
    const deployDisplay = document.getElementById('quote-summary-deploy');

    if (estDisplay) {
      estDisplay.textContent = `${minEst.toLocaleString()} - ${maxEst.toLocaleString()} ر.س / شهرياً`;
    }
    if (modulesCountDisplay) {
      modulesCountDisplay.textContent = `${count} محركات مختارة`;
    }
    if (deployDisplay) {
      const deployName = this.selectedDeployment === 'on-premise' ? 'نشر محلي سيادي (On-Premise)' : (this.selectedDeployment === 'hybrid' ? 'نموذج هجين' : 'سحابة مؤسسية مدارة');
      deployDisplay.textContent = deployName;
    }
  }

  bindEvents() {
    // Quote Module Checkboxes
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('module-calc-cb')) {
        const val = e.target.value;
        if (e.target.checked) {
          if (!this.selectedModules.includes(val)) this.selectedModules.push(val);
          e.target.closest('.module-check-item')?.classList.add('selected');
        } else {
          this.selectedModules = this.selectedModules.filter(m => m !== val);
          e.target.closest('.module-check-item')?.classList.remove('selected');
        }
        this.updateQuoteEstimate();
      }
    });

    // Deployment Toggle Buttons in Configurator
    document.querySelectorAll('[data-quote-deploy]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-quote-deploy]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedDeployment = btn.getAttribute('data-quote-deploy');
        this.updateQuoteEstimate();
      });
    });

    // Scale / Size Toggle Buttons
    document.querySelectorAll('[data-quote-size]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-quote-size]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedSize = btn.getAttribute('data-quote-size');
        this.updateQuoteEstimate();
      });
    });

    // Direct jump from deployment cards to quote
    document.addEventListener('click', (e) => {
      const depBtn = e.target.closest('.go-to-quote-btn');
      if (depBtn) {
        const targetDeploy = depBtn.getAttribute('data-deploy');
        const quoteSection = document.getElementById('pricing');
        if (quoteSection) {
          quoteSection.scrollIntoView({ behavior: 'smooth' });
          const targetToggle = document.querySelector(`[data-quote-deploy="${targetDeploy}"]`);
          if (targetToggle) targetToggle.click();
        }
      }
    });

    // Enterprise Demo Form Submission
    const quoteForm = document.getElementById('enterprise-quote-form');
    if (quoteForm) {
      quoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('quote-name');
        const companyInput = document.getElementById('quote-company');
        const emailInput = document.getElementById('quote-email');
        const phoneInput = document.getElementById('quote-phone');

        if (!nameInput?.value || !companyInput?.value || !emailInput?.value) {
          alert(this.getLang() === 'ar' ? 'يرجى إكمال الحقول الإلزامية لتسجيل الطلب.' : 'Please complete all required fields.');
          return;
        }

        const successNotice = document.getElementById('quote-success-notice');
        if (successNotice) {
          successNotice.style.display = 'block';
          quoteForm.style.display = 'none';
        }
      });
    }

    // Solution Card Click: Safe Overview or Guided Trial
    document.addEventListener('click', (e) => {
      const solCard = e.target.closest('.solution-card');
      if (solCard) {
        const solId = solCard.getAttribute('data-solution-id');
        if (solId) {
          if (window.app.isAuthenticated) {
            window.app.openPlatformModule(solId);
          } else {
            // Unauthenticated: Guide to trial or show evidence peek
            window.app.showEvidencePeek('leak-001');
          }
        }
      }
    });

    // Inspect Live Evidence Trigger from 3D Cockpit
    const inspectLiveMain = document.getElementById('preview-inspect-live-btn-main');
    if (inspectLiveMain) {
      inspectLiveMain.addEventListener('click', () => {
        window.app.showEvidencePeek('leak-001');
      });
    }

    // Free Trial Modal Triggers
    document.addEventListener('click', (e) => {
      const trialTrigger = e.target.closest('.open-trial-trigger');
      if (trialTrigger) {
        e.preventDefault();
        const pkgId = trialTrigger.getAttribute('data-package') || 'professional';
        this.openTrialModal(pkgId);
      }
    });

    // Modal Close Buttons
    document.getElementById('close-auth-modal-btn')?.addEventListener('click', () => {
      window.app.closeAllModals();
    });
    document.getElementById('close-trial-modal-btn')?.addEventListener('click', () => {
      window.app.closeAllModals();
    });
    document.getElementById('close-evidence-modal-btn')?.addEventListener('click', () => {
      window.app.closeAllModals();
    });

    // Close on Backdrop Click
    document.querySelectorAll('.enterprise-modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          window.app.closeAllModals();
        }
      });
    });

    // Auth Gateway Modal Tab Switching
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabTrialBtn = document.getElementById('tab-trial-btn');
    const tabLoginContent = document.getElementById('tab-login-content');
    const tabTrialContent = document.getElementById('tab-trial-content');

    if (tabLoginBtn && tabTrialBtn) {
      tabLoginBtn.addEventListener('click', () => {
        tabLoginBtn.classList.add('active');
        tabTrialBtn.classList.remove('active');
        if (tabLoginContent) tabLoginContent.style.display = 'block';
        if (tabTrialContent) tabTrialContent.style.display = 'none';
      });

      tabTrialBtn.addEventListener('click', () => {
        tabTrialBtn.classList.add('active');
        tabLoginBtn.classList.remove('active');
        if (tabLoginContent) tabLoginContent.style.display = 'none';
        if (tabTrialContent) tabTrialContent.style.display = 'block';
      });
    }

    // Portal Login Form Submit
    const portalLoginForm = document.getElementById('portal-login-form');
    if (portalLoginForm) {
      portalLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email-input')?.value || 'saad@mikhlafi-labs.com';
        window.app.authenticate(email.split('@')[0], 'enterprise');
      });
    }

    // One-Click Authorized Demo Login
    document.getElementById('one-click-demo-login-btn')?.addEventListener('click', () => {
      window.app.authenticate('سعد المخلافي (Saad Al-Mikhlafi)', 'enterprise');
    });

    // Trial Registration Form Submit
    const trialForm = document.getElementById('trial-activation-form');
    if (trialForm) {
      trialForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('trial-name')?.value;
        const company = document.getElementById('trial-company')?.value;
        const email = document.getElementById('trial-email')?.value;

        if (!name || !company || !email) {
          alert(this.getLang() === 'ar' ? 'يرجى إكمال البيانات المطلوبة لتفعيل الحساب.' : 'Please fill all required fields.');
          return;
        }

        const successScreen = document.getElementById('trial-success-screen');
        if (successScreen) {
          trialForm.style.display = 'none';
          successScreen.style.display = 'block';
        }
      });
    }

    // Go to Platform after Trial Activation
    document.getElementById('trial-go-to-platform-btn')?.addEventListener('click', () => {
      const name = document.getElementById('trial-name')?.value || 'قيادي معتمد';
      window.app.authenticate(name, 'trial_account');
    });

    // Evidence Peek Modal Actions
    document.getElementById('peek-modal-auth-btn')?.addEventListener('click', () => {
      window.app.promptAuthModal();
    });

    // Footer Newsletter Form Submit
    const newsletterForm = document.getElementById('footer-newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const successElem = document.getElementById('newsletter-success');
        if (successElem) {
          successElem.style.display = 'block';
          newsletterForm.style.display = 'none';
        }
      });
    }
  }

  init3DTiltEffects() {
    const tiltTargets = document.querySelectorAll(
      '.product-preview-card, .flow-mesh-showcase, .industries-mesh-showcase, .deployment-sovereign-banner'
    );

    tiltTargets.forEach(card => {
      card.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease';
      card.style.transformStyle = 'preserve-3d';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }
}
