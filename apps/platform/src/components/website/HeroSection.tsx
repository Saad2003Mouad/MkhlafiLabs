// MIKHLAFI LABS — Public Website Hero
//
// Editorial enterprise hero. The right-hand side is an image plate: a real
// photograph of an intelligence mesh, held down by a scrim, with the three
// operational layers stated as a quiet hairline rail on top of it and the
// security posture as a single spec line underneath.
//
// This replaces an earlier "card of three boxes" treatment that read as a
// wireframe rather than a product. Nothing here simulates a live console: the
// plate is decoration plus labels, and every figure shown is a standing fact.

import React, { useState, useEffect, useRef } from 'react';
import { LocaleMode } from '../../types';
import { IconArrowRight, IconShield, IconCheckCircle, IconLock, IconActivity, IconDatabase } from '../Icons';

interface HeroSectionProps {
  locale: LocaleMode;
  onExplorePlatform: () => void;
  onRequestConsultation?: () => void;
}

type LayerKey = 'act' | 'analyze' | 'connect';

export const HeroSection: React.FC<HeroSectionProps> = ({
  locale,
  onExplorePlatform,
  onRequestConsultation
}) => {
  const isAr = locale === 'ar';
  const [mounted, setMounted] = useState(false);
  const [activeLayer, setActiveLayer] = useState<LayerKey>('analyze');
  const [userInteracted, setUserInteracted] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Pointer-driven depth: the plate leans very slightly toward the cursor.
  const handleStagePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (event.pointerType !== 'mouse') return;

    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) return;
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

    setTilt({
      x: Number((-offsetY * 5).toFixed(2)),
      y: Number((offsetX * 6).toFixed(2))
    });
  };

  const resetStageTilt = () => setTilt({ x: 0, y: 0 });

  // The rail walks itself down the stack until the visitor takes over.
  useEffect(() => {
    if (userInteracted) return;
    const order: LayerKey[] = ['connect', 'analyze', 'act'];
    let idx = 1;
    const timer = setInterval(() => {
      idx = (idx + 1) % order.length;
      setActiveLayer(order[idx]);
    }, 3800);
    return () => clearInterval(timer);
  }, [userInteracted]);

  const layers: Record<LayerKey, {
    index: string;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    metaAr: string;
    metaEn: string;
    icon: React.ReactNode;
  }> = {
    act: {
      index: '03',
      titleAr: 'طبقة القرار والإجراء',
      titleEn: 'Decide and act',
      descAr: 'طابور أولويات تنفيذي، إسناد مسؤوليات، وتتبّع الأثر المتحقق لكل إجراء مع توثيق كامل لسجل التدقيق.',
      descEn: 'A prioritised executive queue with accountable owners, tracked realised impact and a complete audit trail.',
      metaAr: 'سجل تدقيق كامل',
      metaEn: 'Audit trail',
      icon: <IconActivity size={15} />
    },
    analyze: {
      index: '02',
      titleAr: 'طبقة التحليل الدقيق',
      titleEn: 'Deterministic analysis',
      descAr: 'قواعد حسابية قطعية تفصل الحقائق المؤكدة عن الاحتمالات، وتربط كل نتيجة بمصدرها وقيدها المحاسبي.',
      descEn: 'Deterministic arithmetic routines that separate verified facts from probabilities and tie every finding back to its source entry.',
      metaAr: 'نتيجة مرتبطة بالمصدر',
      metaEn: 'Source-linked',
      icon: <IconLock size={15} />
    },
    connect: {
      index: '01',
      titleAr: 'طبقة الربط غير التدخّلي',
      titleEn: 'Non-invasive connection',
      descAr: 'قراءة آمنة ومشفّرة من أنظمة ERP وقواعد البيانات والملفات الحالية، دون استبدال أي نظام ودون تعطيل العمليات.',
      descEn: 'Secure, encrypted reads from your existing ERP, databases and files — with no system replaced and no downtime.',
      metaAr: 'قراءة فقط',
      metaEn: 'Read-only',
      icon: <IconDatabase size={15} />
    }
  };

  const capabilityFacts = [
    { value: '8', labelAr: 'محركات ذكاء تشغيلية', labelEn: 'Operational intelligence engines' },
    { value: '0', labelAr: 'تعديلات على أنظمتكم الحالية', labelEn: 'Changes required to your systems' },
    { value: 'RTL/LTR', labelAr: 'دعم كامل للعربية والإنجليزية', labelEn: 'Full Arabic and English support' }
  ];

  const stackLayers: LayerKey[] = ['act', 'analyze', 'connect'];

  return (
    <section ref={heroRef} className="site-hero" id="hero">
      <div className="ml-container site-hero__inner">
        {/* Copy */}
        <div
          className="site-hero__copy"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'none' : 'translateY(14px)',
            transition: 'opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out)'
          }}
        >
          <span className="site-hero__pill">
            <span className="site-hero__pill-dot" />
            <span>
              {isAr ? 'منصة ذكاء تشغيلي مؤسسي' : 'Enterprise operational intelligence'}
            </span>
          </span>

          <h1 className="ml-display site-hero__title">
            {isAr ? (
              <>
                اكتشف ما تُخفيه أنظمتكم
                <br />
                <em>قبل أن يتحوّل إلى خسارة.</em>
              </>
            ) : (
              <>
                Surface what your systems
                <br />
                <em>keep hidden — before it costs you.</em>
              </>
            )}
          </h1>

          <p className="ml-lead site-hero__lead">
            {isAr
              ? 'طبقة ذكاء محايدة على مستوى القطاعات تعمل فوق أنظمة المؤسسة القائمة: ترصد الانحرافات في القيود والموردين والمشاريع، وتربط كل إشارة بمصدرها، ثم تسند القرار إلى مسؤول له اسم.'
              : 'An industry-neutral intelligence layer that sits above the systems you already run: it watches for drift across ledgers, suppliers and projects, ties every signal to its source, and hands the decision to a named owner.'}
          </p>

          <div className="site-hero__actions">
            <button onClick={onExplorePlatform} className="ml-btn ml-btn--primary ml-btn--lg">
              <span>{isAr ? 'استكشف المنصة' : 'Explore the platform'}</span>
              <IconArrowRight size={15} />
            </button>
            <a
              href="/contact"
              onClick={(e) => {
                if (onRequestConsultation) {
                  e.preventDefault();
                  onRequestConsultation();
                }
              }}
              className="ml-btn ml-btn--ghost ml-btn--lg"
            >
              {isAr ? 'تحدّث مع فريقنا' : 'Talk to our team'}
            </a>
          </div>

          <dl className="site-hero__facts">
            {capabilityFacts.map((fact, index) => (
              <div key={index}>
                <dt className="site-fact__value">{fact.value}</dt>
                <dd className="site-fact__label">{isAr ? fact.labelAr : fact.labelEn}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Image plate — decoration plus labels, never a simulated console */}
        <div
          className="site-hero__visual ml-stage"
          onPointerMove={handleStagePointerMove}
          onPointerLeave={resetStageTilt}
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'none' : 'translateY(18px)',
            transition: 'opacity 0.8s var(--ease-out) 0.1s, transform 0.8s var(--ease-out) 0.1s'
          }}
        >
          <div
            className="ml-stage__tilt"
            style={{ '--tilt-x': `${tilt.x}deg`, '--tilt-y': `${tilt.y}deg` } as React.CSSProperties}
          >
            <figure className="hero-plate">
              <img
                className="hero-plate__media"
                src="/assets/images/architecture-intelligence-mesh.jpg"
                alt=""
                aria-hidden="true"
                decoding="async"
              />
              <span className="hero-plate__scrim" aria-hidden="true" />
              <span className="hero-plate__sheen" aria-hidden="true" />

              <div className="hero-plate__head">
                <span className="hero-plate__eyebrow">
                  <IconShield size={13} />
                  {isAr ? 'معمارية من ثلاث طبقات' : 'Three-layer architecture'}
                </span>
                <span className="ml-mono hero-plate__tag">{isAr ? 'غير تدخّلي' : 'NON-INVASIVE'}</span>
              </div>

              <ol className="hero-rail">
                {stackLayers.map((key) => {
                  const layer = layers[key];
                  const isActive = activeLayer === key;
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        className={`hero-rail__row ${isActive ? 'is-active' : ''}`}
                        onClick={() => {
                          setUserInteracted(true);
                          setActiveLayer(key);
                        }}
                        aria-pressed={isActive}
                      >
                        <span className="ml-mono hero-rail__index">{layer.index}</span>
                        <span className="hero-rail__icon">{layer.icon}</span>
                        <span className="hero-rail__body">
                          <span className="hero-rail__title">{isAr ? layer.titleAr : layer.titleEn}</span>
                          <span className="hero-rail__desc">{isAr ? layer.descAr : layer.descEn}</span>
                        </span>
                        <span className="hero-rail__meta">{isAr ? layer.metaAr : layer.metaEn}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <figcaption className="hero-plate__specs">
                {[
                  { label: isAr ? 'التشفير' : 'ENCRYPTION', value: 'AES-256-GCM' },
                  { label: isAr ? 'النقل' : 'TRANSPORT', value: 'TLS 1.3' },
                  { label: isAr ? 'العزل' : 'ISOLATION', value: isAr ? 'عزل المستأجرين' : 'TENANT RLS' }
                ].map((spec) => (
                  <div key={spec.label} className="hero-plate__spec">
                    <span className="hero-plate__spec-label">{spec.label}</span>
                    <span className="ml-mono hero-plate__spec-value">{spec.value}</span>
                  </div>
                ))}
              </figcaption>
            </figure>
          </div>
        </div>
      </div>

      {/* Compliance / trust strip */}
      <div
        className="ml-container site-hero__trust"
        style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.9s var(--ease-out) 0.25s' }}
      >
        {[
          { icon: <IconShield size={15} />, textAr: 'استضافة وسيادة بيانات محلية داخل اليمن', textEn: 'Sovereign local hosting in Yemen' },
          { icon: <IconCheckCircle size={15} />, textAr: 'عزل مشدد للبيانات وحماية كاملة للخصوصية', textEn: 'Strict data protection & enterprise isolation' },
          { icon: <IconCheckCircle size={15} />, textAr: 'حوكمة مالية متوافقة مع الأنظمة التجارية والمعايير الدولية', textEn: 'Governance aligned with commercial laws & IFRS standards' },
          { icon: <IconLock size={15} />, textAr: 'معمارية أمن معلومات مؤسسية وفق ISO 27001', textEn: 'ISO 27001 information security architecture' }
        ].map((item, index) => (
          <div key={index} className="site-hero__trust-item">
            <span className="site-hero__trust-icon">{item.icon}</span>
            <span>{isAr ? item.textAr : item.textEn}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
