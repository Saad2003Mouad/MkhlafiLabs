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

import React, { useId } from 'react';

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
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const plate = `mk-plate-${uid}`;
  const ink = `mk-ink-${uid}`;
  const gloss = `mk-gloss-${uid}`;

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
            background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 68%)',
            filter: 'blur(10px)',
            pointerEvents: 'none'
          }}
        />
      )}

      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="MIKHLAFI LABS"
        style={{ position: 'relative', display: 'block' }}
      >
        <defs>
          {/* Plate body: obsidian, faintly lit from the top-left. */}
          <linearGradient id={plate} x1="0%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#22222A" />
            <stop offset="55%" stopColor="#141418" />
            <stop offset="100%" stopColor="#09090B" />
          </linearGradient>

          {/* The single bronze ink used by the monogram and the plate rim. */}
          <linearGradient id={ink} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-hover, #E3C088)" />
            <stop offset="46%" stopColor="var(--accent-light, #D6AB6A)" />
            <stop offset="100%" stopColor="var(--accent-base, #B8894A)" />
          </linearGradient>

          {/* Top-edge gloss, so the plate reads as a polished surface. */}
          <linearGradient id={gloss} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Plate */}
        <rect
          x="0.75"
          y="0.75"
          width="38.5"
          height="38.5"
          rx="12"
          fill={`url(#${plate})`}
          stroke="var(--border-glow)"
          strokeWidth="1"
        />
        <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="12" fill={`url(#${gloss})`} />

        {/* Strata — the three operational layers, stated as hairlines rather than boxes. */}
        <path d="M9 14.25H31" stroke="var(--accent-light)" strokeOpacity="0.16" strokeWidth="1" strokeLinecap="round" />
        <path d="M9 25.75H31" stroke="var(--accent-light)" strokeOpacity="0.16" strokeWidth="1" strokeLinecap="round" />

        {/* Monogram plume */}
        <path
          d="M11.4 29.2V12.1L20 21.3L28.6 12.1V29.2"
          stroke={`url(#${ink})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* The decisive node at the apex of the plume. */}
        <circle cx="20" cy="21.3" r="1.9" fill="var(--accent-hover)" />
      </svg>
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
