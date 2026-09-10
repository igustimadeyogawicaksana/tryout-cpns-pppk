import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, uniqueIndex, index, check } from 'drizzle-orm/sqlite-core';
import type { QuestionInput } from '../question-input';

export const user = sqliteTable('user', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
});
export const session = sqliteTable(
  'session',
  {
    id: text('id').primaryKey().notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' })
  },
  (t) => [index('session_user_idx').on(t.userId)]
);
export const account = sqliteTable(
  'account',
  {
    id: text('id').primaryKey().notNull(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
  },
  (t) => [
    index('account_user_idx').on(t.userId),
    uniqueIndex('account_provider_unique').on(t.providerId, t.accountId)
  ]
);
export const verification = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey().notNull(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
  },
  (t) => [index('verification_identifier_idx').on(t.identifier)]
);
export const adminUsers = sqliteTable('admin_users', {
  userId: text('user_id')
    .primaryKey()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at').notNull()
});
export const questions = sqliteTable('questions', {
  id: text('id').primaryKey().notNull(),
  externalKey: text('external_key').notNull().unique(),
  createdAt: integer('created_at').notNull()
});
export const questionVersions = sqliteTable(
  'question_versions',
  {
    id: text('id').primaryKey().notNull(),
    questionId: text('question_id')
      .notNull()
      .references(() => questions.id),
    version: integer('version').notNull(),
    revision: integer('revision').notNull().default(1),
    status: text('status', { enum: ['draft', 'in_review', 'approved', 'published', 'archived'] })
      .notNull()
      .default('draft'),
    examType: text('exam_type').notNull(),
    subtestCode: text('subtest_code').notNull(),
    topicCode: text('topic_code').notNull(),
    // Immutable structured content after publication. Normalize into options/assets tables when exam delivery is built.
    content: text('content', { mode: 'json' }).$type<QuestionInput>().notNull(),
    changeNote: text('change_note').notNull().default(''),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull()
  },
  (t) => [
    uniqueIndex('question_version_unique').on(t.questionId, t.version),
    index('question_status_idx').on(t.status, t.updatedAt),
    index('question_filter_idx').on(t.examType, t.subtestCode),
    check('version_positive', sql`${t.version} > 0 AND ${t.revision} > 0`),
    check(
      'valid_editorial_status',
      sql`${t.status} IN ('draft','in_review','approved','published','archived')`
    )
  ]
);
export const importBatches = sqliteTable('import_batches', {
  batchKey: text('batch_key').primaryKey().notNull(),
  hash: text('hash').notNull(),
  count: integer('count').notNull(),
  createdAt: integer('created_at').notNull(),
  actorId: text('actor_id')
    .notNull()
    .references(() => user.id)
});
export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey().notNull(),
  actorId: text('actor_id')
    .notNull()
    .references(() => user.id),
  action: text('action').notNull(),
  entityId: text('entity_id').notNull(),
  note: text('note').notNull(),
  createdAt: integer('created_at').notNull()
});
