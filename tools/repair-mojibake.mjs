// MIKHLAFI LABS — Mojibake repair
//
// Large parts of the Arabic copy were saved as UTF-8 bytes that had then been
// re-decoded through the Windows-1256 code page. On screen that renders as
// something like "ط§ظ„ط¨ظٹط§ظ†ط§طھ" instead of "البيانات" — which is exactly what the
// owner described as "spelling mistakes on many pages".
//
// The repair is exact rather than heuristic:
//   1. Take a maximal run of non-ASCII characters that all exist in windows-1256.
//   2. Map each character back to the byte it came from.
//   3. Decode those bytes as UTF-8.
// A run is only rewritten when the decoded result is clean UTF-8, is shorter
// than the run, contains real Arabic letters, and actually differs. That never
// touches ordinary English, and it never rewrites already-correct Arabic: a run
// of genuine Arabic letters decodes to invalid UTF-8 and is left alone.
//
//   node tools/repair-mojibake.mjs          # dry run, writes a report only
//   node tools/repair-mojibake.mjs --write  # apply the repair

import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'D:/mikhlafi-labs';
const WRITE = process.argv.includes('--write');
const OUT = path.join(ROOT, 'tools/mojibake-repair.txt');

const SCAN_ROOTS = [
  'apps/platform/src',
  'apps/platform/index.html',
  'apps/api/src',
  'server.js'
];

// ── windows-1256 decode table, inverted to char -> byte ──────────────────────
// Only non-ASCII is indexed, so runs always break on spaces, quotes and code.
const decoder = new TextDecoder('windows-1256');
const inverse = new Map();

for (let byte = 0x80; byte <= 0xff; byte++) {
  const ch = decoder.decode(Uint8Array.of(byte));
  if (ch === '\uFFFD' || ch.length !== 1) continue;
  if (!inverse.has(ch)) inverse.set(ch, byte);
}

const ARABIC_LETTER = /[\u0621-\u064A]/;

// Punctuation and Latin letters also got double-encoded on their own — an em
// dash became "â€”", a curly quote "â€œ". Those runs contain no Arabic, so they
// need their own, deliberately narrow, allow-list of decoded characters.
const SAFE_NON_ARABIC =
  /^[\u00A0-\u024F\u2000-\u206F\u20A0-\u20BF\u2100-\u214F\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u0192\u02C6\u02DC\u2122]+$/;

/** Decode one candidate run. Returns the repaired text, or null to keep it. */
function repairRun(run) {
  const bytes = [];

  for (const ch of run) {
    const byte = inverse.get(ch);
    if (byte === undefined) return null;
    bytes.push(byte);
  }

  const decoded = Buffer.from(bytes).toString('utf8');

  if (decoded.includes('\uFFFD')) return null;
  if (decoded.length >= run.length) return null;
  if (decoded === run) return null;

  const hasArabicLetter = ARABIC_LETTER.test(decoded);
  if (!hasArabicLetter && !SAFE_NON_ARABIC.test(decoded)) return null;

  return decoded;
}


/** Repair every qualifying run inside one line of text. */
function repairText(line) {
  const parts = [];
  let run = '';
  let changed = 0;

  const flush = () => {
    if (!run) return;
    const fixed = repairRun(run);
    if (fixed) {
      parts.push(fixed);
      changed++;
    } else {
      parts.push(run);
    }
    run = '';
  };

  for (const ch of line) {
    if (inverse.has(ch)) run += ch;
    else {
      flush();
      parts.push(ch);
    }
  }
  flush();

  return { text: parts.join(''), changed };
}

function collect(entry, acc) {
  const stat = fs.statSync(entry);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(entry, { withFileTypes: true })) {
      if (['node_modules', 'dist', 'build', '.git', '.data'].includes(child.name)) continue;
      collect(path.join(entry, child.name), acc);
    }
    return acc;
  }
  if (/\.(ts|tsx|js|jsx|css|html|json|sql|md)$/i.test(entry)) acc.push(entry);
  return acc;
}

const files = [];
for (const root of SCAN_ROOTS) {
  const abs = path.join(ROOT, root);
  if (fs.existsSync(abs)) collect(abs, files);
}

const report = [];
let totalRuns = 0;
let changedFiles = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const hadCRLF = original.includes('\r\n');
  const lines = original.split(/\r?\n/);

  let fileRuns = 0;

  const nextLines = lines.map((line, index) => {
    if (!line) return line;
    const { text, changed } = repairText(line);
    if (changed === 0) return line;

    fileRuns += changed;
    report.push(
      `${path.relative(ROOT, file).split(path.sep).join('/')}:${index + 1}\n` +
      `  BEFORE: ${line.trim().slice(0, 200)}\n` +
      `  AFTER : ${text.trim().slice(0, 200)}`
    );
    return text;
  });

  if (fileRuns === 0) continue;

  totalRuns += fileRuns;
  changedFiles++;
  report.push('');

  if (WRITE) {
    fs.writeFileSync(file, nextLines.join(hadCRLF ? '\r\n' : '\n'), 'utf8');
  }
}

fs.writeFileSync(
  OUT,
  `${WRITE ? 'APPLIED' : 'DRY RUN'} — runs: ${totalRuns} in ${changedFiles} files\n\n${report.join('\n')}\n`,
  'utf8'
);

console.log(`${WRITE ? 'APPLIED' : 'DRY RUN'} — runs: ${totalRuns} in ${changedFiles} files`);
console.log('report ->', OUT);
