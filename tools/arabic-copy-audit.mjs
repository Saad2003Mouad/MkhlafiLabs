// MIKHLAFI LABS — Arabic copy audit (v2)
// Whole-word matching only, so "الا" inside "الاستيراد" is not reported.
import fs from 'node:fs';
import path from 'node:path';

const root = 'D:/mikhlafi-labs/apps/platform/src';

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      walk(full, out);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

// High-confidence misspellings. Whole-word only.
const tokens = [
  'مسئول', 'مسئولية', 'مسئوليات', 'مسؤل',
  'شئ', 'شئون',
  'هاذا', 'هاذه',
  'الذى', 'التى', 'اللذى',
  'اساس', 'أساس',
  'اخطاء',
  'احتمال',
  'استطيع',
  'اكيد', 'اكثر', 'اكثر', 'اكثر',
  'هيئه', 'لجنه', 'شركه', 'مؤسسه', 'اداره', 'منظمه', 'دراسه', 'خدمه',
  'منصه', 'لوحه', 'صفحه', 'مشكله', 'معلومه', 'نتيجه', 'قيمه', 'وثيقه',
  'طريقه', 'بيئه', 'دقيقه', 'شرحه', 'نسخه', 'خطه', 'فكره', 'تجربه',
  'مقارنه', 'معالجه', 'حمايه', 'مراجعه', 'ادخال', 'مساحه', 'سرعه',
  'الان', 'الأن',
  ' ادخال',
  'انشاء', 'انشاءه',
  'استخدام', 'استيراد',
  'اؤيد', 'أؤيد'
];

// Whole-token match on Arabic letters only.
const isArabicChar = (ch) => /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(ch);

function findToken(line, token) {
  const res = [];
  let idx = line.indexOf(token);
  while (idx !== -1) {
    const before = idx > 0 ? line[idx - 1] : ' ';
    const afterIdx = idx + token.length;
    const after = afterIdx < line.length ? line[afterIdx] : ' ';
    const okBefore = !isArabicChar(before);
    const okAfter = !isArabicChar(after);
    if (okBefore && okAfter) res.push(idx);
    idx = line.indexOf(token, idx + 1);
  }
  return res;
}

const files = [];
(function walkDir(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'dist', '.git', '.data'].includes(e.name)) continue;
      walkDir(full);
    } else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) files.push(full);
  }
})(root);

const report = [];
const counts = new Map();

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    if (!/[\u0600-\u06FF]/.test(line)) return;
    // 1) Latin word glued inside Arabic (typical copy error) — skip, noisy.
    // 2) suspected misspellings
    for (const t of tokens) {
      if (findToken(line, t).length) {
        counts.set(t, (counts.get(t) || 0) + 1);
        report.push({ file: path.relative(root, file), line: i + 1, token: t, text: line.trim().slice(0, 180) });
      }
    }
    // 3) double spaces inside Arabic strings
    if (/[\u0600-\u06FF]  +[\u0600-\u06FF]/.test(line)) {
      counts.set('(double space)', (counts.get('(double space)') || 0) + 1);
      report.push({ file: path.relative(root, file), line: i + 1, token: '(double space)', text: line.trim().slice(0, 180) });
    }
    // 4) any CJK / unexpected script inside an Arabic line
    if (/[\u3000-\u9FFF\uAC00-\uD7AF]/.test(line)) {
      counts.set('(unexpected script)', (counts.get('(unexpected script)') || 0) + 1);
      report.push({ file: path.relative(root, file), line: i + 1, token: '(unexpected script)', text: line.trim().slice(0, 180) });
    }
  });
}

console.log('FILES:', files.length, '| HITS:', report.length);
console.log('');
[...counts.entries()].sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + k + ' -> ' + v));
console.log('');
console.log('--- detail ---');
for (const r of report.slice(0, 90)) console.log(`${r.file}:${r.line}  [${r.token}]  ${r.text}`);
