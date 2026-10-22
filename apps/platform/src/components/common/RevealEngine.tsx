// MIKHLAFI LABS — Reveal Engine
// Applies scroll-linked entrance motion to the public website without requiring any
// page to opt in. It marks matching elements with `data-reveal`, reveals anything
// already on screen as soon as it mounts, and observes the rest. Re-scans after
// client-side navigation and after async content arrives. Fully inert for visitors
// who prefer reduced motion.

import { useEffect } from 'react';

/**
 * Containers whose direct children animate in sequence — section bodies, card grids,
 * comparison tables and FAQ lists.
 */
const STAGGER_CONTAINERS = [
  '.site-section',
  '.ml-section',
  '.site-pricing',
  '.pricing-grid',
  '.pp-engine-grid',
  '.pp-engine-mini-grid',
  '.pp-pain-grid',
  '.pp-ind-grid',
  '.pp-metrics',
  '.pp-steps',
  '.pp-split',
  '.pp-case',
  '.pp-contact',
  '.home-compare'
];

/** Section bodies laid out as a single container per section. */
const SECTION_BODIES = ['.pp-section > .site-container'];

/** Standalone blocks that animate as a single unit. */
const BLOCK_SELECTORS = ['.site-cta', '.pp-cta', '.pp-assure', '.pp-strip', '.faq-list'];

const MAX_STAGGER_MS = 420;
const STAGGER_STEP_MS = 70;

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Reveal everything immediately — used when motion is not wanted at all. */
function revealAll() {
  document
    .querySelectorAll<HTMLElement>('[data-reveal]')
    .forEach((element) => element.classList.add('is-revealed'));
}

/**
 * Mark one element for entrance motion. Anything already inside the viewport is
 * revealed straight away so above-the-fold content never waits for a scroll.
 */
function primeElement(element: HTMLElement, index: number, observer: IntersectionObserver | null) {
  // Never attach data-reveal to interactive FAQ rows or inner accordion controls
  if (element.classList.contains('faq-row') || element.closest('.faq-row') || element.classList.contains('faq-card')) {
    return;
  }
  if (element.hasAttribute('data-reveal')) return;

  element.setAttribute('data-reveal', 'up');
  element.style.setProperty(
    '--reveal-delay',
    `${Math.min(index * STAGGER_STEP_MS, MAX_STAGGER_MS)}ms`
  );

  if (!observer) {
    element.classList.add('is-revealed');
    return;
  }

  const bounds = element.getBoundingClientRect();
  const isOnScreen = bounds.top < window.innerHeight * 0.92 && bounds.bottom > 0;
  // A zero-height element can never cross a non-zero threshold, so reveal it at once.
  const isCollapsed = bounds.height === 0;

  if (isOnScreen || isCollapsed) {
    element.classList.add('is-revealed');
    return;
  }

  observer.observe(element);
}

export const RevealEngine: React.FC = () => {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const reduceMotionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    const observer =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (entry.isIntersecting) {
                  entry.target.classList.add('is-revealed');
                  observer?.unobserve(entry.target);
                }
              }
            },
            // threshold 0 so zero-area targets still report a crossing
            { rootMargin: '0px 0px -8% 0px', threshold: 0 }
          )
        : null;

    const scan = () => {
      if (prefersReducedMotion()) {
        revealAll();
        return;
      }

      for (const selector of STAGGER_CONTAINERS) {
        document.querySelectorAll<HTMLElement>(selector).forEach((container) => {
          Array.from(container.children).forEach((child, index) => {
            if (child instanceof HTMLElement) primeElement(child, index, observer);
          });
        });
      }

      for (const selector of SECTION_BODIES) {
        document.querySelectorAll<HTMLElement>(selector).forEach((container) => {
          Array.from(container.children).forEach((child, index) => {
            if (child instanceof HTMLElement) primeElement(child, index, observer);
          });
        });
      }

      for (const selector of BLOCK_SELECTORS) {
        document.querySelectorAll<HTMLElement>(selector).forEach((element, index) => {
          primeElement(element, index, observer);
        });
      }
    };

    scan();

    // React to client-side navigation and to content that arrives after first paint.
    let debounce: ReturnType<typeof setTimeout> | null = null;
    const scheduleScan = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(scan, 120);
    };

    // Async content (for example packages fetched from the catalogue) can mount late
    // and land below the fold with nothing left to trigger a re-scan.
    const settle = setTimeout(scan, 900);

    const mutationObserver =
      typeof MutationObserver === 'function' ? new MutationObserver(scheduleScan) : null;
    mutationObserver?.observe(document.body, { childList: true, subtree: true });

    const onPreferenceChange = () => {
      if (prefersReducedMotion()) {
        revealAll();
        mutationObserver?.disconnect();
      } else {
        scheduleScan();
      }
    };
    reduceMotionQuery?.addEventListener?.('change', onPreferenceChange);

    return () => {
      if (debounce) clearTimeout(debounce);
      clearTimeout(settle);
      mutationObserver?.disconnect();
      observer?.disconnect();
      reduceMotionQuery?.removeEventListener?.('change', onPreferenceChange);
    };
  }, []);

  return null;
};
