// MIKHLAFI LABS — mojibake sweep
//
// Some Arabic strings in the codebase were saved as UTF-8 bytes that had already
// been read as Windows-1252, so they render on screen as `ط§ظ„ط£طھظ…طھط©` instead of
// readable Arabic. Ordinary spell-checking cannot see this: every character is a
// valid Arabic letter, just the wrong one.
//
// The tell is a Latin-1 / cp1252 punctuation character (§ © ¸ « ° „ …) sitting
// directly against an Arabic letter — something real Arabic never does. For every
// hit we reverse the double decode and print the repaired text so it can be
// verified before being written back.
import fs from 'node:fs';
import path from 'node:path';

const ROOTS = [
  'D:/mikhlafi-labs/apps/platform/src',
  'D:/mikhlafi-labs/apps/api/src',
  'D:/mikhlafi-labs/apps/platform/index.html',
  'D:/mikhlafi-labs/server.js'
];

const OUT = 'D:/mikhlafi-labs/tools/mojibake-report.txt';

// cp1252 reverse table for the range that differs from Latin-1.
const CP1252 = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f
};

function toBytes(text) {
  const bytes = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp <= 0xff) bytes.push(cp);
    else if (CP1252[cp] !== undefined) bytes.push(CP1252[cp]);
    else return null; // cannot be a cp1252 decode
  }
  return Buffer.from(bytes);
}

function repair(text) {
  const bytes = toBytes(text);
  if (!bytes) return null;
  const decoded = bytes.toString('utf8');
  if (decoded.includes('\uFFFD')) return null;
  return decoded;
}

// A Latin-1 punctuation/symbol character glued straight onto an Arabic letter.
const PUNCT = '\\u00A7\\u00A9\\u00AB\\u00AE\\u00B0\\u00B1\\u00B5\\u00B7\\u00B8\\u00BB\\u00BC\\u00BD\\u00BE\\u00D7\\u00F7\\u201A\\u201E\\u2026\\u2020\\u2021\\u02C6\\u2030\\u0160\\u2039\\u0152\\u017D\\u2018\\u2019\\u201C\\u201D\\u2022\\u2013\\u2014\\u02DC\\u2122\\u0161\\u203A\\u0153\\u017E\\u0178\\u00A0';
const MARKER = new RegExp(
  `[\\u0600-\\u06FF][${PUNCT}]|[${PUNCT}][\\u0600-\\u06FF]`
);

function collect(entry, acc) {
  const st = fs.statSync(entry);
  if (st.isDirectory()) {
    for (const e of fs.readdirSync(entry, { withFileTypes: true })) {
      if (['node_modules', 'dist', '.git', '.data'].includes(e.name)) continue;
      collect(path.join(entry, e.name), acc);
    }
    return acc;
  }
  if (/\.(ts|tsx|js|jsx|css|html|json|sql)$/i.test(entry)) acc.push(entry);
  return acc;
}

const files = [];
for (const root of ROOTS) if (fs.existsSync(root)) collect(root, files);

const rows = [];
let hits = 0;

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/[\u0600-\u06FF]/.test(line)) continue;
    if (!MARKER.test(line)) continue;

    hits++;
    // Try to repair just the Arabic-ish runs on the line so we can show a before/after.
    const repaired = repair(line);
    rows.push(
      `${path.relative('D:/mikhlafi-labs', file).split('\\').join('/')}:${i + 1}\n` +
      `  BEFORE: ${line.trim().slice(0, 240)}\n` +
      `  AFTER : ${(repaired ?? '(not a cp1252 double-decode)').trim().slice(0, 240)}`
    );
  }
}

fs.writeFileSync(OUT, `Mojibake hits: ${hits} across ${files.length} files\n\n${rows.join('\n\n')}\n`, 'utf8');
console.log('files', files.length, 'lines with suspicious Arabic', hits);
console.log('report ->', OUT);
