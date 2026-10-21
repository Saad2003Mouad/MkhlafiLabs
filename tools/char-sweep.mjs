// MIKHLAFI LABS — character-level copy integrity sweep.
// Flags characters that should never appear in a UI string and writes a UTF-8
// report file, because the Windows console mangles Arabic output.
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'D:/mikhlafi-labs/apps/platform/src';
const EXTRA = ['D:/mikhlafi-labs/apps/platform/index.html'];
const OUT = 'D:/mikhlafi-labs/tools/char-report.txt';

function collect(entry, acc) {
  const st = fs.statSync(entry);
  if (st.isDirectory()) {
    for (const e of fs.readdirSync(entry, { withFileTypes: true })) {
      if (['node_modules', 'dist', '.git'].includes(e.name)) continue;
      collect(path.join(entry, e.name), acc);
    }
    return acc;
  }
  if (/\.(ts|tsx|js|jsx|css|html|json)$/i.test(entry)) acc.push(entry);
  return acc;
}

const files = [];
collect(SRC, files);
for (const f of EXTRA) if (fs.existsSync(f)) files.push(f);

const LABELS = [
  [0xfffd, 'replacement character'],
  [0x4e00, 'CJK'],
  [0x9fff, 'CJK'],
  [0xac00, 'Hangul'],
  [0xd7af, 'Hangul'],
  [0x3040, 'Kana'],
  [0x30ff, 'Kana']
];

function classify(cp) {
  if (cp === 0xfffd) return 'replacement character';
  if (cp >= 0x80 && cp <= 0x9f) return 'C1 control';
  if (cp >= 0x4e00 && cp <= 0x9fff) return 'CJK';
  if (cp >= 0xac00 && cp <= 0xd7af) return 'Hangul';
  if (cp >= 0x3040 && cp <= 0x30ff) return 'Kana';
  if (cp >= 0xfb50 && cp <= 0xfdff) return 'Arabic presentation form';
  if (cp === 0x200b) return 'zero-width space';
  if (cp === 0x00a0) return 'non-breaking space';
  return null;
}

const rows = [];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      const label = classify(ch.codePointAt(0));
      if (label) {
        rows.push(`${label}\t${path.relative('D:/mikhlafi-labs', file).split('\\').join('/')}:${i + 1}\t${line.trim().slice(0, 200)}`);
      }
    }
  }
}

let counts = {};
for (const r of rows) {
  const k = r.split('\t')[0];
  counts[k] = (counts[k] || 0) + 1;
}

const summary = Object.entries(counts).map(([k, v]) => `${v}\t${k}`).join('\n');
fs.writeFileSync(OUT, `TOTAL ${rows.length} in ${files.length} files\n\nSUMMARY\n${summary}\n\nDETAIL\n${rows.join('\n')}\n`, 'utf8');
console.log('files', files.length, 'rows', rows.length);
console.log(summary || '(none)');
