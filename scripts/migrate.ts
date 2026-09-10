import { openDatabase, migrateDatabase } from '../src/lib/server/database';
const { db, sqlite } = openDatabase(process.env.DATABASE_PATH || './data/app.sqlite');
migrateDatabase(db);
sqlite.close();
console.log('Migrasi SQLite selesai.');
