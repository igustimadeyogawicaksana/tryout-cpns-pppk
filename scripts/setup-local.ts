import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { loadEnvFile } from 'node:process';
import { spawnSync } from 'node:child_process';
import { openDatabase, migrateDatabase } from '../src/lib/server/database';
import { user } from '../src/lib/server/schema';

if (process.env.NODE_ENV === 'production')
  throw new Error('Setup ini hanya untuk pengembangan lokal.');
if (!existsSync('.env'))
  writeFileSync(
    '.env',
    `DATABASE_PATH=./data/app.sqlite\nORIGIN=http://localhost:5173\nBETTER_AUTH_URL=http://localhost:5173\nBETTER_AUTH_SECRET=${randomBytes(48).toString('hex')}\n`,
    { mode: 0o600, flag: 'wx' }
  );
loadEnvFile('.env');
if (!['http://localhost:5173', 'http://127.0.0.1:5173'].includes(process.env.BETTER_AUTH_URL || ''))
  throw new Error('Setup lokal hanya untuk localhost:5173.');
const { db, sqlite } = openDatabase(process.env.DATABASE_PATH || './data/app.sqlite');
migrateDatabase(db);
const existing = db.select().from(user).limit(1).get();
sqlite.close();
if (!existing) {
  const password = randomBytes(18).toString('base64url');
  const result = spawnSync(
    process.execPath,
    ['--import', 'tsx', 'scripts/create-admin.ts', 'pengelola@localhost.test', 'Pengelola Lokal'],
    {
      env: { ...process.env, ADMIN_PASSWORD: password },
      encoding: 'utf8'
    }
  );
  if (result.status !== 0) throw new Error('Pembuatan akun lokal gagal. ' + result.stderr);
  mkdirSync('.local', { recursive: true });
  writeFileSync(
    '.local/akses-lokal.txt',
    `Akun pengembangan lokal — jangan digunakan di produksi atau dibagikan.\nURL: http://localhost:5173/login\nEmail: pengelola@localhost.test\nPassword: ${password}\n`,
    { mode: 0o600, flag: 'wx' }
  );
  console.log(
    'Akun lokal dibuat. Detail login tersimpan privat di .local/akses-lokal.txt (diabaikan Git).'
  );
} else console.log('Database sudah memiliki akun; tidak ada akun atau password yang diubah.');
console.log('Siap. Jalankan npm run dev.');
