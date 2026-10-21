import crypto from 'node:crypto';
import fs from 'node:fs';

// Pull the real hash straight out of the migration so this can never drift.
const sql = fs.readFileSync(
  'D:/mikhlafi-labs/apps/api/src/db/migrations/004_seed_executive_demo.sql',
  'utf8'
);
const hash = (sql.match(/'(scrypt\$[0-9a-f]+\$[0-9a-f]+)'/) || [])[1];
if (!hash) {
  console.log('could not read hash');
  process.exit(1);
}

const [, salt, expected] = hash.split('$');
const want = Buffer.from(expected, 'hex');

const candidates = [
  'Admin@2026', 'Admin@2025', 'admin123', 'Admin@123',
  'Saad@2026', 'saad@2026', 'Owner@2026', 'Platform@2026',
  'Mikhlafi@2026', 'Mikhlafi@2025', 'Mikhlafi#2026', 'Mikhlafi!2026',
  'Mikhlafi2026', 'MikhLafi@2026', 'Client@2026', 'Demo@2026',
  'Mikhlafi-Labs@2026', 'Mikhlafi_Labs@2026'
];

const derive = (pw) =>
  new Promise((resolve, reject) =>
    crypto.scrypt(pw, salt, 64, (err, key) => (err ? reject(err) : resolve(key)))
  );

for (const candidate of candidates) {
  const derived = await derive(candidate);
  if (derived.length === want.length && crypto.timingSafeEqual(derived, want)) {
    console.log('MATCH:', candidate);
  }
}
console.log('checked', candidates.length, 'candidates');
