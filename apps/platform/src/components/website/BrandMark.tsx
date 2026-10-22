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
  size = 48,
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
        height: size,
        flexShrink: 0,
        ...style
      }}
    >
      <img
        src="/brand/logo.png"
        alt="MIKHLAFI LABS"
        height={size}
        style={{
          height: `${size}px`,
          width: 'auto',
          display: 'block',
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.45))'
        }}
      />
    </span>
  );
};

export interface BrandWordmarkProps {
  locale?: 'ar' | 'en';
  size?: number;
  withDescriptor?: boolean;
  isOperator?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Text wordmark has been removed as the brand uses the complete logo.jpg image.
 */
export const BrandWordmark: React.FC<BrandWordmarkProps> = () => {
  return null;
};

export interface BrandLockupProps extends BrandMarkProps, BrandWordmarkProps {}

/**
 * Standard brand logo lock-up using logo.jpg
 */
export const BrandLockup: React.FC<BrandLockupProps> = ({
  size = 48,
  className = '',
  style
}) => (
  <span
    className={`mk-lockup ${className}`}
    style={{ display: 'inline-flex', alignItems: 'center', ...style }}
  >
    <BrandMark size={size} />
  </span>
);
