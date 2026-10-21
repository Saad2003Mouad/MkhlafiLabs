// MIKHLAFI LABS — Ambient Backdrop
//
// One element, one wash. The public site used to stack three drifting light
// bodies, a technical grid, a conic sweep and film grain behind every page; the
// layers fought each other and made the whole site read as muddy. There is now
// a single soft light field with one very slow highlight (see `.ml-ambient` in
// styles/motion.css). It renders no information at all, so it is hidden from
// assistive technology and its motion stops for visitors who prefer reduced
// motion.

import React from 'react';

export const AmbientBackdrop: React.FC = () => (
  <div className="ml-ambient" aria-hidden="true" />
);
