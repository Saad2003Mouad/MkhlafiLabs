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
  className = '',
  style = {}
}) => {

  const heights = {
    xs: 28,
    sm: 36,
    md: 48,
    lg: 64,
    xl: 82
  }[size];

  return (
    <div
      className={`mikhlafi-brand-emblem ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        textDecoration: 'none',
        userSelect: 'none',
        ...style
      }}
    >
      <img
        src="/brand/logo.jpg"
        alt="MIKHLAFI LABS"
        height={heights}
        style={{
          height: `${heights}px`,
          width: 'auto',
          display: 'block',
          objectFit: 'contain'
        }}
      />
    </div>
  );
};
