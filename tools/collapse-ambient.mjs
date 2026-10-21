// One-shot edit: collapse the multi-layer ambient backdrop in motion.css into a
// single wash. Kept as a script because the block is long and every layer has to
// be removed together with its keyframes.
import fs from 'node:fs';

const file = 'D:/mikhlafi-labs/apps/platform/src/styles/motion.css';
let css = fs.readFileSync(file, 'utf8');

const START = '/* --------------------------------------------------------------------------\n   Ambient backdrop';
const END = '/* --------------------------------------------------------------------------\n   Scroll-linked reveals';

const start = css.indexOf(START);
const end = css.indexOf(END);

if (start === -1 || end === -1 || end <= start) {
  console.error('markers not found', { start, end });
  process.exit(1);
}

const replacement = `/* --------------------------------------------------------------------------
   Ambient backdrop — ONE layer, everywhere
   The public site paints a single warm wash plus one cool corner on the app
   surface. Earlier revisions stacked three drifting orbs, a technical grid, a
   conic sweep and film grain; those layers fought each other and every page
   ended up reading as muddy. One wash. One moving highlight. No pattern.
   -------------------------------------------------------------------------- */

.ml-ambient {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background-color: var(--bg-app);
  background-image:
    radial-gradient(1100px 620px at 84% -14%, var(--accent-glow) 0%, transparent 62%),
    radial-gradient(900px 560px at 4% 106%, rgba(56, 106, 158, 0.12) 0%, transparent 66%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.016) 0%, transparent 34%);
  background-repeat: no-repeat;
}

/* The only movement: one warm highlight drifting very slowly. */
.ml-ambient::before {
  content: '';
  position: absolute;
  inset: -18% -8%;
  background: radial-gradient(560px 440px at 32% 34%, var(--accent-glow) 0%, transparent 70%);
  opacity: 0.42;
  animation: ml-ambient-drift 38s var(--ease-swift) infinite;
}

@keyframes ml-ambient-drift {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.34; }
  50% { transform: translate3d(5vw, 3vw, 0) scale(1.14); opacity: 0.58; }
}

/* Content always sits above the backdrop */
.site-shell > .site-header,
.site-shell > .site-main,
.site-shell > .site-footer,
.site-shell > .site-skip-link {
  position: relative;
  z-index: 1;
}

`;

css = css.slice(0, start) + replacement + css.slice(end);

// The old ambient keyframes are now orphaned.
css = css
  .replace(/@keyframes ml-orb-drift-a \{[\s\S]*?\n\}\n\n/, '')
  .replace(/@keyframes ml-orb-drift-b \{[\s\S]*?\n\}\n\n/, '')
  .replace(/@keyframes ml-orb-drift-c \{[\s\S]*?\n\}\n\n/, '')
  .replace(/@keyframes ml-grid-breathe \{[\s\S]*?\n\}\n\n/, '')
  .replace(/@keyframes ml-sweep-rotate \{[\s\S]*?\n\}\n\n/, '');

// Reduced-motion block still names the removed layers.
css = css.replace(/  \.ml-ambient__orb,\n  \.ml-ambient__grid,\n  \.ml-ambient__sweep,\n/, '  .ml-ambient::before,\n');
css = css.replace(/  \.site-hero__ambient::before,\n/, '');

fs.writeFileSync(file, css, 'utf8');

const leftovers = ['ml-ambient__orb', 'ml-ambient__grid', 'ml-ambient__sweep', 'ml-ambient__grain', 'ml-sweep-rotate', 'ml-grid-breathe', 'ml-orb-drift'];
console.log('bytes', css.length);
for (const l of leftovers) console.log(l, '->', (css.match(new RegExp(l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length);
