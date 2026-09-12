import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { openDatabase } from '../src/lib/server/database';
import { adminUsers } from '../src/lib/server/schema';
import { buildQuestions, installEdition } from './content/skd-edition';

const content = buildQuestions();
console.log(JSON.stringify({ questions: content.length, subtests: { TWK: 30, TIU: 35, TKP: 45 }, validation: 'Structure, normalized uniqueness, weights; human editorial review pending' }));
if (process.argv.includes('--apply')) {
  const path = resolve(process.env.DATABASE_PATH || './data/app.sqlite');
  if (!existsSync(path)) throw new Error('Existing database required; refusing to create an empty database.');
  const { db, sqlite } = openDatabase(path);
  try {
    const actor = db.select().from(adminUsers).get()?.userId;
    if (!actor) throw new Error('Local administrator required.');
    mkdirSync('backups', { recursive: true });
    const backup = resolve(`backups/before-content-edition-${Date.now()}.sqlite`);
    await sqlite.backup(backup);
    console.log(JSON.stringify({ backup, ...installEdition(db, actor) }));
  } finally { sqlite.close(); }
}
