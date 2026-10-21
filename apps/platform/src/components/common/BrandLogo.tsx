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
      {/* ── Brand Symbol ───────────────────────────────── */}
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
                inset: '-18%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(212, 160, 32, 0.45) 0%, transparent 70%)',
                filter: 'blur(8px)',
                pointerEvents: 'none',
                opacity: 0.85
              }}
            />
          )}

          <img
            src="/brand/favicon-base.png"
            alt="MIKHLAFI LABS"
            width={dimensions.symbol}
            height={dimensions.symbol}
            style={{
              position: 'relative',
              zIndex: 1,
              width: `${dimensions.symbol}px`,
              height: `${dimensions.symbol}px`,
              borderRadius: `${Math.round(dimensions.symbol * 0.22)}px`,
              objectFit: 'contain',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)'
            }}
          />
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
                letterSpacing: '0.14em',
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
                letterSpacing: '0.22em',
                backgroundImage: 'linear-gradient(100deg, var(--accent-hover, #E3C088), var(--accent-base, #B8894A))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              LABS
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
