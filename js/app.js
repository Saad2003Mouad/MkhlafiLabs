// MIKHLAFI LABS — Master Application Coordinator
import { I18N } from './i18n.js';
import { WebsiteApp } from './website.js';
import { PlatformApp } from './platform.js';

class AppMaster {
  constructor() {
    this.mode = 'website'; // 'website' | 'platform'
    this.lang = localStorage.getItem('mikhlafi_lang') || 'ar';
    this.theme = localStorage.getItem('mikhlafi_theme') || 'light';
    this.isAuthenticated = sessionStorage.getItem('mikhlafi_auth') === 'true';
    
    this.website = new WebsiteApp(this);
    this.platform = new PlatformApp(this);
  }

  init() {
    this.applyTheme(this.theme);
    this.applyLang(this.lang);

    this.website.init();
    this.platform.init();

    this.bindGlobalEvents();
    this.updateModeView();

    // Check URL query for direct platform launch (only if authenticated)
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'platform') {
      if (this.isAuthenticated) {
        this.switchMode('platform');
      } else {
        this.promptAuthModal('query_attempt');
      }
    }
  }

  switchMode(targetMode) {
    if (targetMode === 'platform' && !this.isAuthenticated) {
      this.promptAuthModal('require_auth');
      return;
    }
    this.mode = targetMode;
    this.updateModeView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  authenticate(user = 'Saad Al-Mikhlafi', activePkg = 'enterprise') {
    this.isAuthenticated = true;
    sessionStorage.setItem('mikhlafi_auth', 'true');
    sessionStorage.setItem('mikhlafi_user', user);
    sessionStorage.setItem('mikhlafi_package', activePkg);
    this.closeAllModals();
    this.switchMode('platform');
  }

  logout() {
    this.isAuthenticated = false;
    sessionStorage.removeItem('mikhlafi_auth');
    sessionStorage.removeItem('mikhlafi_user');
    sessionStorage.removeItem('mikhlafi_package');
    this.switchMode('website');
  }

  promptAuthModal(reason = '') {
    this.closeAllModals();
    const modal = document.getElementById('portal-auth-modal');
    if (modal) {
      modal.style.display = 'flex';
      const emailInput = document.getElementById('auth-email-input');
      if (emailInput) emailInput.focus();
    }
  }

  promptTrialModal(packageId = 'professional') {
    this.closeAllModals();
    this.website.openTrialModal(packageId);
  }

  showEvidencePeek(evidenceId = 'leak-001') {
    this.closeAllModals();
    const modal = document.getElementById('evidence-peek-modal');
    if (modal) modal.style.display = 'flex';
  }

  closeAllModals() {
    document.querySelectorAll('.enterprise-modal-overlay').forEach(modal => {
      modal.style.display = 'none';
    });
  }

  updateModeView() {
    const websiteRoot = document.getElementById('website-root');
    const platformRoot = document.getElementById('platform-root');

    if (this.mode === 'platform') {
      if (websiteRoot) websiteRoot.style.display = 'none';
      if (platformRoot) platformRoot.style.display = 'flex';
      this.platform.renderActiveModule();
    } else {
      if (websiteRoot) websiteRoot.style.display = 'block';
      if (platformRoot) platformRoot.style.display = 'none';
    }
  }

  openPlatformModule(moduleId) {
    if (!this.isAuthenticated) {
      this.promptAuthModal('module_access');
      return;
    }
    this.platform.setModule(moduleId);
    this.switchMode('platform');
  }

  toggleTheme() {
    const nextTheme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(nextTheme);
  }

  applyTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mikhlafi_theme', theme);
    
    const themeBtns = document.querySelectorAll('.theme-toggle-btn');
    themeBtns.forEach(btn => {
      btn.innerHTML = theme === 'light' 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    });
  }

  toggleLang() {
    const nextLang = this.lang === 'ar' ? 'en' : 'ar';
    this.applyLang(nextLang);
  }

  applyLang(lang) {
    this.lang = lang;
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('mikhlafi_lang', lang);

    // Update Language Toggle Buttons label
    const langBtns = document.querySelectorAll('.lang-toggle-btn');
    langBtns.forEach(btn => {
      btn.textContent = lang === 'ar' ? 'EN' : 'عربي';
    });

    // Translate all elements with data-i18n
    const dict = I18N[lang] || I18N['ar'];
    document.querySelectorAll('[data-i18n]').forEach(elem => {
      const key = elem.getAttribute('data-i18n');
      if (dict[key]) {
        if (elem.tagName === 'INPUT' && elem.getAttribute('placeholder')) {
          elem.setAttribute('placeholder', dict[key]);
        } else {
          elem.textContent = dict[key];
        }
      }
    });

    // Re-render components with localized state
    this.website.renderChallenges();
    this.website.renderFlow();
    this.website.renderSolutions();
    this.website.renderIndustries();
    this.website.renderDeployment();
    this.website.renderPackages();
    this.website.initQuoteCalculator();
    this.platform.renderSidebarNav();
    this.platform.renderActiveModule();
  }

  bindGlobalEvents() {
    // Mode Switching & Access Gateway Buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('#nav-launch-platform-btn')) {
        if (!this.isAuthenticated) {
          this.promptAuthModal('nav_btn');
        } else {
          this.switchMode('platform');
        }
      }

      if (e.target.closest('.inspect-evidence-trigger') || e.target.closest('#preview-inspect-live-btn-main')) {
        const trigger = e.target.closest('.inspect-evidence-trigger');
        const evId = trigger ? trigger.getAttribute('data-evidence-id') : 'leak-001';
        this.showEvidencePeek(evId);
      }

      if (e.target.closest('#return-to-site-btn') || e.target.closest('#platform-brand-home-link')) {
        this.switchMode('website');
      }
    });

    // Theme & Lang Toggles
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => this.toggleTheme());
    });

    document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => this.toggleLang());
    });

    // Request Demo Buttons scroll to pricing/quote section
    document.querySelectorAll('.request-demo-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.mode === 'platform') {
          this.switchMode('website');
        }
        setTimeout(() => {
          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
          document.getElementById('quote-name')?.focus();
        }, 100);
      });
    });
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AppMaster();
  window.platform = window.app.platform;
  window.app.init();
});
