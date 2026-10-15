// MIKHLAFI LABS — Dedicated Service & Engine Showcase Page
// Highly visual, interactive, evidence-grounded presentation for each of the 8 intelligence engines

import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { SERVICES_CATALOG, ServiceDetailItem, getServiceById } from '../../data/servicesData';
import {
  IconCheckCircle,
  IconArrowRight,
  IconShield,
  IconFileText,
  IconAlertTriangle,
  IconTrendingUp,
  IconTruck,
  IconUsers,
  IconBot,
  IconDatabase,
  IconChevronDown
} from '../../components/Icons';
import { ROUTES } from '../../router/routes';
import { ForensicAuditWorkbench } from '../../components/financial/ForensicAuditWorkbench';
import { ExecutiveDecisionWorkbench } from '../../components/decisions/ExecutiveDecisionWorkbench';
import { PredictiveRiskWorkbench } from '../../components/risk/PredictiveRiskWorkbench';
import { ProjectMarginWorkbench } from '../../components/projects/ProjectMarginWorkbench';
import { SupplierRiskWorkbench } from '../../components/suppliers/SupplierRiskWorkbench';
import { CustomerRiskWorkbench } from '../../components/customers/CustomerRiskWorkbench';
import { ExecutiveAssistantWorkbench } from '../../components/assistant/ExecutiveAssistantWorkbench';
import { DataQualityWorkbench } from '../../components/governance/DataQualityWorkbench';

interface ServiceDetailPageProps {
  serviceId: string;
  locale: LocaleMode;
  onNavigate: (path: string) => void;
  onRequestDemo: (serviceName?: string) => void;
  onLaunchPlatform: () => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  serviceId,
  locale,
  onNavigate,
  onRequestDemo,
  onLaunchPlatform
}) => {
  const isAr = locale === 'ar';
  const service: ServiceDetailItem = getServiceById(serviceId) || SERVICES_CATALOG[0];

  const [activeSimIndex, setActiveSimIndex] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const getEngineIcon = (iconName: string, size = 24) => {
    switch (iconName) {
      case 'file-text': return <IconFileText size={size} />;
      case 'check-circle': return <IconCheckCircle size={size} />;
      case 'alert-triangle': return <IconAlertTriangle size={size} />;
      case 'trending-up': return <IconTrendingUp size={size} />;
      case 'truck': return <IconTruck size={size} />;
      case 'users': return <IconUsers size={size} />;
      case 'bot': return <IconBot size={size} />;
      case 'database': return <IconDatabase size={size} />;
      default: return <IconShield size={size} />;
    }
  };

  const currentSimItem = service.simulationData.items[activeSimIndex] || service.simulationData.items[0];

  return (
    <div className="service-detail-page" style={{ position: 'relative', overflowX: 'hidden' }}>
      {/* Dynamic Ambient Background Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '600px',
          background: `radial-gradient(ellipse at 50% 30%, ${service.glowColor} 0%, transparent 70%)`,
          filter: 'blur(80px)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      {/* ── Section 1: Hero Section ────────────────────────────────────────── */}
      <section className="service-hero" style={{ position: 'relative', zIndex: 1, paddingTop: '5rem', paddingBottom: '3.5rem' }}>
        <div className="site-container">
          {/* Breadcrumb Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>
            <a
              href={ROUTES.PUBLIC.HOME}
              onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.PUBLIC.HOME); }}
              style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}
            >
              {isAr ? 'الرئيسية' : 'Home'}
            </a>
            <span>/</span>
            <a
              href={ROUTES.PUBLIC.SOLUTIONS}
              onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.PUBLIC.SOLUTIONS); }}
              style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}
            >
              {isAr ? 'الخدمات والحلول' : 'Solutions'}
            </a>
            <span>/</span>
            <span style={{ color: service.accentColor, fontWeight: 700 }}>
              {isAr ? service.badgeAr : service.badgeEn}
            </span>
          </div>

          <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
            {/* Engine Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '999px',
                background: `rgba(255, 255, 255, 0.05)`,
                border: `1px solid ${service.accentColor}55`,
                marginBottom: '1.5rem',
                backdropFilter: 'blur(10px)'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: service.accentColor,
                  boxShadow: `0 0 10px ${service.accentColor}`
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.08em', color: service.accentColor, fontFamily: 'var(--font-mono)' }}>
                ENGINE #{service.engineNumber} // {isAr ? service.badgeAr : service.badgeEn}
              </span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
                fontWeight: 900,
                lineHeight: 1.15,
                marginBottom: '1.2rem',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em'
              }}
            >
              {isAr ? service.titleAr : service.titleEn}
            </h1>

            {/* Tagline / Subtitle */}
            <p
              style={{
                fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                fontWeight: 600,
                color: service.accentColor,
                marginBottom: '1.5rem',
                lineHeight: 1.5
              }}
            >
              {isAr ? service.taglineAr : service.taglineEn}
            </p>

            {/* In-depth Hero Description */}
            <p
              style={{
                fontSize: '1.1rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
                maxWidth: '820px',
                margin: '0 auto 2.5rem'
              }}
            >
              {isAr ? service.heroDescriptionAr : service.heroDescriptionEn}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
              <button
                onClick={() => onRequestDemo(isAr ? service.titleAr : service.titleEn)}
                className="btn-primary"
                style={{
                  padding: '0.9rem 2.2rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  boxShadow: `0 8px 24px ${service.glowColor}`
                }}
              >
                <span>{isAr ? 'طلب تجربة المحرك على بياناتك' : 'Request Engine Pilot'}</span>
                <IconArrowRight size={16} />
              </button>

              <button
                onClick={onLaunchPlatform}
                className="btn-secondary"
                style={{
                  padding: '0.9rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                <span>{isAr ? 'استعراض في المنصة الحية' : 'Live Platform Cockpit'}</span>
              </button>
            </div>

            {/* Top 3 High-Impact Key Metrics Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.2rem',
                textAlign: 'start'
              }}
            >
              {service.heroMetrics.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-surface-glass)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-card)',
                    backdropFilter: 'blur(16px)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: `linear-gradient(90deg, ${service.accentColor}, transparent)`
                    }}
                  />
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: service.accentColor, marginBottom: '6px' }}>
                    {m.val}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {isAr ? m.labelAr : m.labelEn}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                    {isAr ? m.noteAr : m.noteEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Live Interactive Engine Simulator ──────────────────── */}
      <section className="site-section" style={{ background: 'var(--bg-surface-subtle)', padding: '5rem 0' }}>
        <div className="site-container">
          <div className="section-head">
            <span className="section-eyebrow" style={{ color: service.accentColor }}>
              {isAr ? 'محاكاة تشغيلية حية' : 'LIVE DETERMINISTIC TELEMETRY'}
            </span>
            <h2 className="section-title">
              {isAr ? service.simulationData.tabTitleAr : service.simulationData.tabTitleEn}
            </h2>
            <p className="section-subtitle">
              {isAr
                ? 'استكشف كيف يرصد المحرك الإشارات الحقيقية من دفاتر ERP، ويفكك الأدلة الحسابية، ويوجه الإجراء الفوري.'
                : 'Explore real-time signal detection, evidence parsing, and deterministic directive dispatching.'}
            </p>
          </div>

          {service.id === 'financial-leak-detection' ? (
            <ForensicAuditWorkbench
              locale={locale}
              initialScenario="contracting"
              isEmbeddedInPublicPage={true}
              onRequestAssistance={(details) => onRequestDemo(`${isAr ? service.titleAr : service.titleEn}: ${details}`)}
            />
          ) : service.id === 'executive-decisions' ? (
            <ExecutiveDecisionWorkbench
              locale={locale}
              initialScenario="retail"
              isEmbeddedInPublicPage={true}
              onRequestAssistance={(details) => onRequestDemo(`${isAr ? service.titleAr : service.titleEn}: ${details}`)}
            />
          ) : service.id === 'risk-radar' ? (
            <PredictiveRiskWorkbench
              locale={locale}
              initialScenario="contracting"
              isEmbeddedInPublicPage={true}
              onRequestAssistance={(details) => onRequestDemo(`${isAr ? service.titleAr : service.titleEn}: ${details}`)}
            />
          ) : service.id === 'project-margins' ? (
            <ProjectMarginWorkbench
              locale={locale}
              initialScenario="infrastructure"
              isEmbeddedInPublicPage={true}
              onRequestAssistance={(details) => onRequestDemo(`${isAr ? service.titleAr : service.titleEn}: ${details}`)}
            />
          ) : (service.id === 'supplier-intelligence' || service.id === 'supplier-risk') ? (
            <SupplierRiskWorkbench
              locale={locale}
              initialScenario="fmcg_retail"
              isEmbeddedInPublicPage={true}
              onRequestAssistance={(details) => onRequestDemo(`${isAr ? service.titleAr : service.titleEn}: ${details}`)}
            />
          ) : (service.id === 'customer-retention' || service.id === 'customer-risk') ? (
            <CustomerRiskWorkbench
              locale={locale}
              initialScenario="b2b_tech"
              isEmbeddedInPublicPage={true}
              onRequestAssistance={(details) => onRequestDemo(`${isAr ? service.titleAr : service.titleEn}: ${details}`)}
            />
          ) : (service.id === 'executive-assistant' || service.id === 'ai-assistant') ? (
            <ExecutiveAssistantWorkbench
              locale={locale}
              initialScenario="conglomerate_holding"
              isEmbeddedInPublicPage={true}
              onRequestAssistance={(details) => onRequestDemo(`${isAr ? service.titleAr : service.titleEn}: ${details}`)}
            />
          ) : (service.id === 'data-quality-governance' || service.id === 'data-quality' || service.id === 'data-integrity') ? (
            <DataQualityWorkbench
              locale={locale}
              initialScenario="retail_distribution"
              isEmbeddedInPublicPage={true}
              onRequestAssistance={(details) => onRequestDemo(`${isAr ? service.titleAr : service.titleEn}: ${details}`)}
            />
          ) : (
            <div
              style={{
                maxWidth: '1060px',
                margin: '0 auto',
                background: 'var(--bg-surface)',
                border: `1px solid var(--border-strong)`,
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${service.glowColor}`
              }}
            >
            {/* Cockpit Window Header */}
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginInlineStart: '8px' }}>
                  LABS_ENGINE_{service.engineNumber} // FORENSIC_MONITOR_V1.4
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: service.accentColor }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: service.accentColor, fontFamily: 'var(--font-mono)' }}>
                  {isAr ? 'تدقيق مستمر متصل' : 'CONTINUOUS AUDIT ON'}
                </span>
              </div>
            </div>

            {/* Simulation Cockpit Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(360px, 1.5fr)', gap: '0' }}>
              {/* Left Column: List of Detected Signals */}
              <div style={{ background: 'var(--bg-surface-subtle)', borderInlineEnd: '1px solid var(--border-subtle)', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                  {isAr ? 'الإشارات المرصودة في الدفاتر' : 'DETECTED TELEMETRY SIGNALS'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {service.simulationData.items.map((item, idx) => {
                    const isSelected = idx === activeSimIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSimIndex(idx)}
                        style={{
                          textAlign: 'start',
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? `1px solid ${service.accentColor}` : '1px solid var(--border-subtle)',
                          background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontFamily: 'var(--font-mono)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              background: item.severity === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: item.severity === 'critical' ? '#ef4444' : '#f59e0b'
                            }}
                          >
                            {item.tag}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            {item.timestamp}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {isAr ? item.titleAr : item.titleEn}
                        </div>
                        {item.amount && (
                          <div style={{ fontSize: '12px', fontWeight: 800, color: service.accentColor, fontFamily: 'var(--font-mono)' }}>
                            {item.amount}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Detailed Forensic Inspector */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      SOURCE // {currentSimItem.sourceSystem}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {isAr ? currentSimItem.titleAr : currentSimItem.titleEn}
                    </h3>
                  </div>

                  {currentSimItem.amount && (
                    <div
                      style={{
                        padding: '6px 14px',
                        background: `${service.accentColor}18`,
                        border: `1px solid ${service.accentColor}55`,
                        borderRadius: 'var(--radius-sm)',
                        color: service.accentColor,
                        fontWeight: 900,
                        fontSize: '15px',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {currentSimItem.amount}
                    </div>
                  )}
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', padding: '16px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                    {isAr ? currentSimItem.detailAr : currentSimItem.detailEn}
                  </div>
                </div>

                {/* Audit Evidence Box */}
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <div style={{ color: 'var(--status-success)', marginTop: '2px' }}>
                    <IconCheckCircle size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--status-success)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
                      {isAr ? 'الدليل الحسابي والتدقيق القاطع' : 'DETERMINISTIC CRYPTOGRAPHIC PROOF'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {isAr ? currentSimItem.auditEvidenceAr : currentSimItem.auditEvidenceEn}
                    </div>
                  </div>
                </div>

                {/* Executive Action Trigger */}
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => onRequestDemo(isAr ? currentSimItem.titleAr : currentSimItem.titleEn)}
                    className="btn-primary"
                    style={{ fontSize: '12px', padding: '8px 16px' }}
                  >
                    <span>{isAr ? 'تطبيق هذا التدقيق على حساباتنا' : 'Deploy This Audit On Our Ledger'}</span>
                    <IconArrowRight size={13} />
                  </button>

                  <button
                    onClick={onLaunchPlatform}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 14px' }}
                  >
                    <span>{isAr ? 'فتح في مساحة العمل' : 'Open in Workspace'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </section>

      {/* ── Section 3: Core Corporate Vulnerabilities Solved ─────────────────── */}
      <section className="site-section" style={{ padding: '5rem 0' }}>
        <div className="site-container">
          <div className="section-head">
            <span className="section-eyebrow" style={{ color: service.accentColor }}>
              {isAr ? 'التحديات والمشاكل المعالجة' : 'ENTERPRISE VULNERABILITIES RESOLVED'}
            </span>
            <h2 className="section-title">
              {isAr
                ? 'ثلاث معضلات تشغيلية ومادية يقضي عليها المحرك بشكل حاسم'
                : 'Three critical operational fractures resolved deterministically'}
            </h2>
            <p className="section-subtitle">
              {isAr
                ? 'مقارنة مباشرة بين ما تعاني منه الشركات بالطرق التقليدية، وكيف تعالجه منظومة مخلافي لابس.'
                : 'Direct comparison between standard operational blind spots and sovereign algorithmic mitigation.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.8rem', maxWidth: '1140px', margin: '0 auto' }}>
            {service.painPoints.map((pain) => (
              <div
                key={pain.num}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      fontWeight: 800,
                      color: service.accentColor,
                      background: `${service.accentColor}15`,
                      padding: '3px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    VULNERABILITY #{pain.num}
                  </span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {isAr ? pain.titleAr : pain.titleEn}
                </h3>

                {/* The Conventional Failure */}
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.18)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    {isAr ? 'الواقع التقليدي المؤلم' : 'CONVENTIONAL ENTERPRISE FAILURE'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {isAr ? pain.currentFailureAr : pain.currentFailureEn}
                  </div>
                </div>

                {/* The Mikhlafi Labs Solution */}
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--status-success)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    {isAr ? 'معالجة مخلافي لابس الحتمية' : 'MIKHLAFI LABS DETERMINISTIC FIX'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {isAr ? pain.mikhlafiSolutionAr : pain.mikhlafiSolutionEn}
                  </div>
                </div>

                {/* Quantified Business Impact */}
                <div
                  style={{
                    marginTop: 'auto',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: service.accentColor
                  }}
                >
                  ⚡ {isAr ? pain.impactAr : pain.impactEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Technical Methodology & Architecture ────────────────── */}
      <section className="site-section" style={{ background: 'var(--bg-surface)', padding: '5rem 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container">
          <div className="section-head">
            <span className="section-eyebrow" style={{ color: service.accentColor }}>
              {isAr ? 'المعمارية وخوارزميات العمل' : 'DETERMINISTIC PIPELINE ARCHITECTURE'}
            </span>
            <h2 className="section-title">
              {isAr
                ? 'آلية عمل المحرك برمجياً وحسابياً في 4 مراحل صارمة'
                : 'The 4-stage deterministic processing lifecycle'}
            </h2>
            <p className="section-subtitle">
              {isAr
                ? 'من القراءة غير الجراحية لدفاتر المحاسبة وحتى توليد التوجيه التنفيذي المشفر.'
                : 'From non-invasive ERP ledger ingestion to board-level audit packet delivery.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.2rem', maxWidth: '1100px', margin: '0 auto' }}>
            {service.methodologySteps.map((step) => (
              <div
                key={step.step}
                style={{
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: `${service.accentColor}20`,
                    color: service.accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '15px'
                  }}
                >
                  {step.step}
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {isAr ? step.titleAr : step.titleEn}
                </h3>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
                  {isAr ? step.techDetailAr : step.techDetailEn}
                </p>

                <div
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px dashed var(--border-default)',
                    fontSize: '11px',
                    color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  OUTPUT: <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{isAr ? step.outputAr : step.outputEn}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ERP Compatibility Badges Strip */}
          <div style={{ marginTop: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5rem' }}>
              {isAr ? 'الأنظمة وقواعد البيانات المتوافقة مع هذا المحرك' : 'CERTIFIED ENTERPRISE COMPATIBILITY'}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', maxWidth: '850px', margin: '0 auto' }}>
              {service.integrations.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <IconCheckCircle size={14} color="var(--status-success)" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>({item.type})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: Real-World Case Study ───────────────────────────────── */}
      <section className="site-section" style={{ padding: '5rem 0', background: 'radial-gradient(ellipse at 50% 100%, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%)' }}>
        <div className="site-container">
          <div
            style={{
              maxWidth: '960px',
              margin: '0 auto',
              background: 'var(--bg-surface-glass)',
              border: `1px solid ${service.accentColor}44`,
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(24px, 4vw, 48px)',
              boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 30px ${service.glowColor}`,
              backdropFilter: 'blur(20px)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: service.accentColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {isAr ? 'دراسة حالة واقعية موثقة' : 'VERIFIED ENTERPRISE CASE STUDY'}
                </span>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {isAr ? service.caseStudy.clientTypeAr : service.caseStudy.clientTypeEn}
                </h3>
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                  {isAr ? service.caseStudy.industryAr : service.caseStudy.industryEn}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                {service.caseStudy.metrics.map((cm, idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: service.accentColor }}>
                      {cm.val}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {isAr ? cm.labelAr : cm.labelEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {isAr ? 'التحدي قبل تفعيل المنظومة:' : 'The Operational Challenge:'}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                {isAr ? service.caseStudy.scenarioAr : service.caseStudy.scenarioEn}
              </p>

              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--status-success)', marginBottom: '6px' }}>
                {isAr ? 'النتيجة المحققة بالأرقام:' : 'Verified Business Outcome:'}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {isAr ? service.caseStudy.verifiedResultAr : service.caseStudy.verifiedResultEn}
              </p>
            </div>

            {/* Testimonial Quote */}
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                borderInlineStart: `4px solid ${service.accentColor}`,
                padding: '16px 20px',
                borderRadius: 'var(--radius-xs)',
                fontStyle: 'italic',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6
              }}
            >
              "{isAr ? service.caseStudy.quoteAr : service.caseStudy.quoteEn}"
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6: Specific FAQ Accordion ───────────────────────────────── */}
      <section className="site-section" style={{ padding: '5rem 0', background: 'var(--bg-surface)' }}>
        <div className="site-container">
          <div className="section-head">
            <span className="section-eyebrow" style={{ color: service.accentColor }}>
              {isAr ? 'الأسئلة الشائعة حول هذا المحرك' : 'FREQUENTLY ASKED QUESTIONS'}
            </span>
            <h2 className="section-title">
              {isAr ? 'إجابات واضحة لاستفسارات الإدارة المالية والتقنية' : 'Clear answers for C-suite and IT directors'}
            </h2>
          </div>

          <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {service.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '18px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'start'
                    }}
                  >
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isAr ? faq.qAr : faq.qEn}
                    </span>
                    <span
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease',
                        color: 'var(--text-tertiary)'
                      }}
                    >
                      <IconChevronDown size={18} />
                    </span>
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 20px 18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                      {isAr ? faq.aAr : faq.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 7: Browse Other Engines Switcher ───────────────────────── */}
      <section className="site-section" style={{ padding: '4rem 0', background: 'var(--bg-surface-subtle)' }}>
        <div className="site-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span className="section-eyebrow">{isAr ? 'منظومة المحركات الكاملة' : 'THE INTELLIGENCE MESH'}</span>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {isAr ? 'استكشف المحركات السبعة الأخرى في المنظومة' : 'Explore the remaining 7 modular intelligence engines'}
              </h3>
            </div>

            <button
              onClick={() => onNavigate(ROUTES.PUBLIC.SOLUTIONS)}
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              <span>{isAr ? 'عرض كافة الحلول' : 'View All Solutions'}</span>
              <IconArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {SERVICES_CATALOG.filter((s) => s.id !== service.id).map((other) => (
              <button
                key={other.id}
                onClick={() => onNavigate(`/services/${other.id}`)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  textAlign: 'start',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                className="solution-card"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: other.accentColor }}>
                    {getEngineIcon(other.iconName, 18)}
                  </div>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                    #{other.engineNumber}
                  </span>
                </div>

                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {isAr ? other.titleAr : other.titleEn}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.4, marginTop: 'auto' }}>
                  {isAr ? other.taglineAr : other.taglineEn}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 8: Direct Conversion Banner ────────────────────────────── */}
      <section
        style={{
          padding: '5rem 0',
          background: `radial-gradient(ellipse at 50% 0%, ${service.glowColor} 0%, var(--bg-surface-elevated) 70%)`,
          borderTop: '1px solid var(--border-default)',
          textAlign: 'center'
        }}
      >
        <div className="site-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="severity-tag optimal" style={{ display: 'inline-flex', marginBottom: '1.2rem', padding: '4px 14px' }}>
            {isAr ? 'تجربة حية غير جراحية' : 'NON-INVASIVE PILOT'}
          </div>

          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.25 }}>
            {isAr
              ? `جاهز لتفعيل ${service.titleAr} في مؤسستك؟`
              : `Ready to deploy ${service.titleEn}?`}
          </h2>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            {isAr
              ? 'احجز جلسة استعراض خاصة مع مهندسينا، أو ارفع عينة تجريبية مشفرة من قيودك المحاسبية لرؤية النتائج خلال ساعات وبلا أي التزام.'
              : 'Schedule an executive walkthrough or upload an encrypted ledger sample to view real-world findings within hours.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onRequestDemo(isAr ? service.titleAr : service.titleEn)}
              className="btn-primary"
              style={{
                padding: '0.9rem 2.4rem',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: `0 8px 24px ${service.glowColor}`
              }}
            >
              <span>{isAr ? 'طلب عرض مخصص وتجربة مجانية' : 'Book Executive Demo & Free Pilot'}</span>
              <IconArrowRight size={16} />
            </button>

            <button
              onClick={() => onNavigate(ROUTES.PUBLIC.CONTACT)}
              className="btn-secondary"
              style={{ padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 600 }}
            >
              <span>{isAr ? 'تواصل مع فريق الاستشارات' : 'Contact Enterprise Advisory'}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
