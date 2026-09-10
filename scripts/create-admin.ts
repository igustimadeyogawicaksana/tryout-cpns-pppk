import { randomUUID } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { hashPassword } from 'better-auth/crypto';
import { eq } from 'drizzle-orm';
import { openDatabase, migrateDatabase } from '../src/lib/server/database';
import { user, account, adminUsers } from '../src/lib/server/schema';

const email = process.argv[2]?.trim().toLowerCase();
const name = process.argv[3]?.trim() || 'Pengelola';
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  throw new Error('Gunakan: npm run admin:create -- email@domain.id "Nama Pengelola"');
let password = process.env.ADMIN_PASSWORD || '';
if (!password) {
  if (!process.stdin.isTTY)
    throw new Error('Set ADMIN_PASSWORD atau jalankan dari terminal interaktif.');
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  password = await readline.question(
    'Password baru (minimal 12 karakter; input terlihat di terminal lokal): '
  );
  readline.close();
}
if (password.length < 12 || password.length > 128)
  throw new Error('Password harus 12–128 karakter.');
const hashed = await hashPassword(password);
password = '';
const { db, sqlite } = openDatabase(process.env.DATABASE_PATH || './data/app.sqlite');
try {
  migrateDatabase(db);
  db.transaction(() => {
    if (db.select().from(user).where(eq(user.email, email)).get())
      throw new Error('Email sudah ada. Akun lama tidak diubah otomatis.');
    const id = randomUUID(),
      now = new Date();
    db.insert(user)
      .values({ id, email, name, emailVerified: false, createdAt: now, updatedAt: now })
      .run();
    db.insert(account)
      .values({
        id: randomUUID(),
        userId: id,
        providerId: 'credential',
        accountId: id,
        password: hashed,
        createdAt: now,
        updatedAt: now
      })
      .run();
    db.insert(adminUsers).values({ userId: id, createdAt: Date.now() }).run();
  });
  console.log('Akun pengelola dibuat. Gunakan halaman /login.');
} finally {
  sqlite.close();
}
