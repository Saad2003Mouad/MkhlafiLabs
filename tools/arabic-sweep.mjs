// MIKHLAFI LABS — targeted Arabic spelling sweep.
// Writes a UTF-8 report file (console mangles Arabic) covering the mistakes
// that actually recur in Arabic UI copy.
import fs from 'node:fs';
import path from 'node:path';

const root = 'D:/mikhlafi-labs/apps/platform/src';
const outFile = 'D:/mikhlafi-labs/tools/audit-report.txt';

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'dist', '.git'].includes(e.name)) continue;
      walk(full);
    } else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) files.push(full);
  }
})(root);

/**
 * Every rule is a literal Arabic sequence that is wrong on its own.
 * The word-boundary check prevents matching inside a longer correct word.
 */
const rules = [
  { id: 'إست (hamza on isti-)', needle: 'إست' },
  ['إستخدم', 'استخدم'],
  ['إستخدام', 'استخدام'],
  ['إستخدام', 'استخدام'],
  ['إستيراد', 'استيراد'],
  ['إستكشاف', 'استكشاف'],
  ['إستبدال', 'استبدال'],
  ['إستشراق', ''],
  ['إدارة', 'إدارة'],
  ['ادارة', 'إدارة'],
  ['ادارة', 'إدارة']
];

const report = [];
const counts = new Map();

function arabic(ch) {
  return /[\u0600-\u06FF]/.test(ch);
}

const detectors = [
  { id: 'إست بدل است', find: /(^|[^\u0621-\u064A])إست[\u0621-\u064A]/ },
  { name: 'همزة القطع الصحيحة (لا)', test: () => false }
];

function scanLine(line) {
  const found = [];
  const push = (t) => found.push(t);

  if (line.includes('إست') && /(?:^|[^\u0621-\u064A])إست/.test(line)) push('"إست-" في موضع يجب أن يكون "است-"');
  if (/'\.?\s*إنشاء\s*ه/.test(line)) push('إنشاءه -> إنشاؤه');
  if (line.includes('انشاء')) push('انشاء -> إنشاء');
  if (line.includes('اخطاء')) push('اخطاء -> أخطاء');
  if (line.includes('ادخال')) push('ادخال -> إدخال');
  if (line.includes('ادارة')) push('ادارة -> إدارة');
  if (line.includes('اداره')) push('اداره -> إدارة');
  if (line.includes('مسئول')) push('مسئول -> مسؤول');
  if (line.includes('مسؤل')) push('مسؤل -> مسؤول');
  if (line.includes('هيئه')) push('هيئه -> هيئة');
  if (line.includes('شركه')) push('شركه -> شركة');
  if (line.includes('هذه هذه')) push('تكرار');
  if (/[\u0600-\u06FF]  +[\u06FF]/.test(line)) push('فراغ مزدوج داخل نص عربي');
  if (/[\u0600-\u06FF][A-Za-z]{2,}/.test(line) === false) return found;
  return found;
}

const summary = new Map();
const details = [];

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    if (!/[\u0600-\u06FF]/.test(line)) return;
    for (const t of scanLine(line)) {
      summary.set(t, (summary.get(t) || 0) + 1);
      details.push(`${path.relative(root, file).replace(/\\/g, '/')}:${i + 1}\n   ${t}\n   ${line.trim().slice(0, 260)}`);
    }
  });
}

let out = `MIKHLAFI LABS — Arabic copy sweep\nScanned files: ${files.length}\nFindings: ${details.length}\n\n`;
out += 'SUMMARY BY RULE\n----------------\n';
[...summary.entries()].sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
  out += `${v}\t${k}\n`;
});
out += `\nDETAIL\n------\n${details.join('\n')}\n`;

fs.writeFileSync(outFile, out, 'utf8');
console.log('written', outFile, 'findings', details.length, 'files', files.length);
