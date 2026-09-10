import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import * as schema from './schema';

export function openDatabase(path: string) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const sqlite = new Database(path);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('synchronous = FULL');
  sqlite.pragma('busy_timeout = 3000');
  const db = drizzle(sqlite, { schema });
  return { db, sqlite };
}
export type AppDatabase = ReturnType<typeof openDatabase>['db'];
export function migrateDatabase(db: AppDatabase) {
  migrate(db, { migrationsFolder: './drizzle' });
}
