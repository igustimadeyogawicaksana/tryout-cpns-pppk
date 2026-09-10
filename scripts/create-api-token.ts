import { randomBytes, createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { eq } from 'drizzle-orm';
import { openDatabase } from '../src/lib/server/database';
import { user, adminUsers } from '../src/lib/server/schema';

const email = process.argv[2];
if (!email) throw new Error('Pemakaian: npm run api:token -- email-admin [--rotate]');
if (!existsSync('.env')) throw new Error('Siapkan .env terlebih dahulu.');
let contents = readFileSync('.env', 'utf8');
if (
  (/^QUESTIONS_API_TOKEN_SHA256=.+$/m.test(contents) ||
    existsSync('.local/question-api-token.txt')) &&
  !process.argv.includes('--rotate')
)
  throw new Error(
    'Token sudah ada. Gunakan --rotate untuk mengganti dan menonaktifkan token lama.'
  );
const { db, sqlite } = openDatabase(process.env.DATABASE_PATH || './data/app.sqlite');
try {
  const actor = db
    .select({ id: user.id })
    .from(user)
    .innerJoin(adminUsers, eq(adminUsers.userId, user.id))
    .where(eq(user.email, email))
    .get();
  if (!actor) throw new Error('Email bukan pengelola aktif. Tidak ada token dibuat.');
  const token = randomBytes(32).toString('base64url');
  const digest = createHash('sha256').update(token).digest('hex');
  contents = contents.replace(/^QUESTIONS_API_(TOKEN_SHA256|USER_ID)=.*\r?\n?/gm, '').trimEnd();
  mkdirSync('.local', { recursive: true });
  writeFileSync('.local/question-api-token.txt', token + '\n', { mode: 0o600 });
  writeFileSync(
    '.env',
    contents + `\nQUESTIONS_API_TOKEN_SHA256=${digest}\nQUESTIONS_API_USER_ID=${actor.id}\n`,
    { mode: 0o600 }
  );
  console.log(
    'Token tersimpan di .local/question-api-token.txt (diabaikan Git). Hash dan pemilik disimpan di .env. Restart aplikasi untuk mengaktifkan. Untuk Dokploy, salin kedua variabel QUESTIONS_API_* ke environment server.'
  );
} finally {
  sqlite.close();
}
