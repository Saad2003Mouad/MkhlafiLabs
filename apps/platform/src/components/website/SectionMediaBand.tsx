// MIKHLAFI LABS — Section media band
//
// A wide, rounded photographic band used to break up long editorial sections.
// The photograph is purely atmospheric: it is hidden from assistive technology
// and always held down by a scrim, so the caption stays legible no matter what
// the image contains or how the theme is set.

import React from 'react';

export interface SectionMediaBandProps {
  src: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  /** Optional trailing slot, e.g. a row of badges or a button. */
  children?: React.ReactNode;
  className?: string;
}

export const SectionMediaBand: React.FC<SectionMediaBandProps> = ({
  src,
  eyebrow,
  title,
  body,
  children,
  className = ''
}) => (
  <figure className={`site-band ${className}`}>
    <img
      className="site-band__img"
      src={src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      draggable={false}
    />
    <span className="site-band__scrim" aria-hidden="true" />

    {(eyebrow || title || body || children) && (
      <figcaption className="site-band__caption">
        {eyebrow && <span className="ml-eyebrow">{eyebrow}</span>}
        {title && <h3 className="site-band__title">{title}</h3>}
        {body && <p className="site-band__body">{body}</p>}
        {children && <div className="site-band__extra">{children}</div>}
      </figcaption>
    )}
  </figure>
);
