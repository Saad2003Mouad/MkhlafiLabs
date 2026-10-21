// MIKHLAFI LABS — Primary Brand Mark
//
// The identity is deliberately reduced to three elements: a squircle plate, two
// horizontal strata, and a single-weight monogram. The strata read as the three
// operational layers the platform is built on (connect → analyse → decide); the
// monogram is drawn as one continuous plume so it stays legible at 16px and in
// greyscale. Everything is inline SVG, so it inherits the theme tokens, costs no
// request, and stays razor sharp on any display.
//
// Palette note: the whole product speaks "sovereign bronze" (--accent-*), so the
// mark does too. Earlier artwork mixed cyan/emerald into a bronze interface, which
// read as a stock asset rather than a brand.

import React from 'react';

export interface BrandMarkProps {
  /** Rendered square size in px. The artwork is drawn on a 40×40 grid. */
  size?: number;
  /** Adds a soft bronze aura behind the plate. Off inside dense UI chrome. */
  glow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * The MIKHLAFI LABS monogram.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 36,
  glow = false,
  className = '',
  style
}) => {
  return (
    <span
      className={`mk-mark ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        ...style
      }}
    >
      {glow && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-22%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 160, 32, 0.45) 0%, transparent 70%)',
            filter: 'blur(10px)',
            pointerEvents: 'none'
          }}
        />
      )}

      <img
        src="/brand/favicon-base.png"
        alt="MIKHLAFI LABS"
        width={size}
        height={size}
        style={{
          position: 'relative',
          display: 'block',
          width: size,
          height: size,
          borderRadius: `${Math.round(size * 0.22)}px`,
          objectFit: 'contain',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)'
        }}
      />
    </span>
  );
};

export interface BrandWordmarkProps {
  locale?: 'ar' | 'en';
  /** Font size of the Latin wordmark in px. */
  size?: number;
  /** Renders the Arabic descriptor line beneath the wordmark. */
  withDescriptor?: boolean;
  isOperator?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * The MIKHLAFI LABS wordmark. Latin wordmark is locked to Inter with a wide
 * tracking; LABS carries the bronze gradient so the lock-up has one point of
 * colour rather than two competing ones.
 */
export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  locale = 'ar',
  size = 17,
  withDescriptor = true,
  isOperator = false,
  className = '',
  style
}) => {
  const isAr = locale === 'ar';

  return (
    <span
      className={`mk-wordmark ${className}`}
      style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, textAlign: 'start', ...style }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.5em' }}>
        <span
          style={{
            fontFamily: 'var(--font-latin)',
            fontWeight: 800,
            fontSize: size,
            letterSpacing: '0.16em',
            color: 'var(--text-primary)',
            lineHeight: 1.1
          }}
        >
          MIKHLAFI
        </span>
        <span
          style={{
            fontFamily: 'var(--font-latin)',
            fontWeight: 800,
            fontSize: size,
            letterSpacing: '0.24em',
            backgroundImage: 'linear-gradient(100deg, var(--accent-hover), var(--accent-base))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            paddingInlineStart: '2px'
          }}
        >
          LABS
        </span>
      </span>

      {withDescriptor && (
        <span
          style={{
            marginTop: 4,
            fontSize: Math.max(8.5, size * 0.55),
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap'
          }}
        >
          {isOperator
            ? (isAr ? 'غرفة عمليات المالك' : 'MASTER OPERATOR SUITE')
            : (isAr ? 'ذكاء القرار المؤسسي' : 'ENTERPRISE DECISION INTELLIGENCE')}
        </span>
      )}
    </span>
  );
};

export interface BrandLockupProps extends BrandMarkProps, BrandWordmarkProps {}

/**
 * Mark + wordmark, the standard horizontal lock-up.
 */
export const BrandLockup: React.FC<BrandLockupProps> = ({
  size = 36,
  glow = false,
  locale = 'ar',
  withDescriptor = true,
  isOperator = false,
  className = '',
  style
}) => (
  <span
    className={`mk-lockup ${className}`}
    style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.32), ...style }}
  >
    <BrandMark size={size} glow={glow} />
    <BrandWordmark
      locale={locale}
      size={Math.round(size * 0.47)}
      withDescriptor={withDescriptor}
      isOperator={isOperator}
    />
  </span>
);
