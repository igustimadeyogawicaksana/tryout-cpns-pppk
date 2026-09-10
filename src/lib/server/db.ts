import { env } from '$env/dynamic/private';
import { openDatabase } from './database';
export const { db, sqlite } = openDatabase(env.DATABASE_PATH || './data/app.sqlite');
