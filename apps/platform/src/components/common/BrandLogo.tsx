// MIKHLAFI LABS — Master Brand Identity Emblem & Wordmark
// Luxury Geometric Intelligence Core with Dynamic Gradients & Micro-Glow

import React from 'react';
import { LocaleMode } from '../../types';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'symbol-only' | 'wordmark-only' | 'compact';
  locale?: LocaleMode;
  glow?: boolean;
  isOperator?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'full',
  locale = 'ar',
  glow = true,
  isOperator = false,
  className = '',
  style = {}
}) => {
  const isAr = locale === 'ar';

  // Dimension scaling
  const dimensions = {
    xs: { symbol: 22, fontTitle: 12, fontSub: 8, gap: 6 },
    sm: { symbol: 28, fontTitle: 14, fontSub: 9, gap: 8 },
    md: { symbol: 38, fontTitle: 17, fontSub: 9.5, gap: 10 },
    lg: { symbol: 52, fontTitle: 22, fontSub: 11, gap: 14 },
    xl: { symbol: 72, fontTitle: 30, fontSub: 13, gap: 18 }
  }[size];

  // Theme palettes: Operator (Crimson/Gold) vs Standard (Cyan/Emerald/Sapphire)
  const colors = isOperator
    ? {
        primary: '#ef4444',
        secondary: '#f59e0b',
        core: '#dc2626',
        accentGlow: 'rgba(239, 68, 68, 0.45)',
        badgeBg: 'rgba(239, 68, 68, 0.12)',
        badgeBorder: 'rgba(239, 68, 68, 0.35)',
        badgeText: '#fca5a5'
      }
    : {
        primary: '#06b6d4',
        secondary: '#10b981',
        core: '#3b82f6',
        accentGlow: 'rgba(6, 182, 212, 0.45)',
        badgeBg: 'rgba(6, 182, 212, 0.12)',
        badgeBorder: 'rgba(6, 182, 212, 0.35)',
        badgeText: '#67e8f9'
      };

  const gradientId = isOperator ? 'mikhlafi-op-grad' : 'mikhlafi-std-grad';
  const filterId = isOperator ? 'mikhlafi-op-glow' : 'mikhlafi-std-glow';

  return (
    <div
      className={`mikhlafi-brand-emblem ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${dimensions.gap}px`,
        textDecoration: 'none',
        userSelect: 'none',
        ...style
      }}
    >
      {/* ── Geometric Neural SVG Emblem ───────────────────────────────── */}
      {variant !== 'wordmark-only' && (
        <div
          style={{
            position: 'relative',
            width: `${dimensions.symbol}px`,
            height: `${dimensions.symbol}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {/* Ambient Glow Aura */}
          {glow && (
            <div
              style={{
                position: 'absolute',
                inset: '-15%',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${colors.accentGlow} 0%, transparent 70%)`,
                filter: 'blur(8px)',
                pointerEvents: 'none',
                opacity: 0.85
              }}
            />
          )}

          <svg
            width={dimensions.symbol}
            height={dimensions.symbol}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}
          >
            <defs>
              <linearGradient id={`${gradientId}-main`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.primary} />
                <stop offset="50%" stopColor={colors.secondary} />
                <stop offset="100%" stopColor={colors.core} />
              </linearGradient>

              <linearGradient id={`${gradientId}-sheen`} x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.8)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.05)" stopOpacity="0" />
              </linearGradient>

              <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Hexagonal Isometric Base Ring */}
            <path
              d="M50 5 L88 27 L88 73 L50 95 L12 73 L12 27 Z"
              stroke={`url(#${gradientId}-main)`}
              strokeWidth="3"
              strokeLinejoin="round"
              fill="rgba(10, 15, 29, 0.75)"
              filter={`url(#${filterId})`}
            />

            {/* Inner Precision Architecture: The Iconic "M" Intertwined with Quantum Nodes */}
            {/* Left Pillar */}
            <path
              d="M26 71 L26 31 L38 31 L44 50 L38 65 L26 71 Z"
              fill={`url(#${gradientId}-main)`}
              opacity="0.95"
            />

            {/* Right Pillar */}
            <path
              d="M74 71 L74 31 L62 31 L56 50 L62 65 L74 71 Z"
              fill={`url(#${gradientId}-main)`}
              opacity="0.95"
            />

            {/* Central Apex Node / Diamond Heart */}
            <polygon
              points="50,22 61,38 50,54 39,38"
              fill={`url(#${gradientId}-main)`}
            />

            {/* Cross-Link Quantum Struts */}
            <path
              d="M26 31 L50 54 L74 31"
              stroke={`url(#${gradientId}-sheen)`}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Bottom Foundation Keystone */}
            <polygon
              points="50,62 58,74 50,86 42,74"
              fill={colors.secondary}
              opacity="0.9"
            />

            {/* Core Telemetry Pulsing Dot */}
            <circle
              cx="50"
              cy="54"
              r="4.5"
              fill="#ffffff"
              filter={`url(#${filterId})`}
            />
          </svg>
        </div>
      )}

      {/* ── Typographic Wordmark & Bilingual Hierarchy ───────────────── */}
      {variant !== 'symbol-only' && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, textAlign: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontFamily: 'var(--font-latin, Inter, sans-serif)',
                fontWeight: 900,
                fontSize: `${dimensions.fontTitle}px`,
                letterSpacing: '0.08em',
                color: 'var(--text-primary, #ffffff)',
                textTransform: 'uppercase'
              }}
            >
              MIKHLAFI
            </span>
            <span
              style={{
                fontFamily: 'var(--font-latin, Inter, sans-serif)',
                fontWeight: 900,
                fontSize: `${dimensions.fontTitle}px`,
                letterSpacing: '0.12em',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              LABS
              <span
                style={{
                  display: 'inline-block',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: colors.secondary,
                  boxShadow: `0 0 6px ${colors.secondary}`
                }}
              />
            </span>
          </div>

          {variant !== 'compact' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '3px'
              }}
            >
              <span
                style={{
                  fontSize: `${dimensions.fontSub}px`,
                  fontWeight: 700,
                  color: isOperator ? '#fca5a5' : 'var(--text-tertiary, #94a3b8)',
                  letterSpacing: isAr ? '0.02em' : '0.12em',
                  textTransform: 'uppercase'
                }}
              >
                {isOperator
                  ? (isAr ? 'غرفة عمليات المالك والسيادة' : 'MASTER OPERATOR SUITE')
                  : (isAr ? 'مختبرات الذكاء والقرارات المؤسسية' : 'ENTERPRISE INTELLIGENCE SYSTEMS')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
