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
export const participantProfiles = sqliteTable('participant_profiles', {
  userId: text('user_id')
    .primaryKey()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  province: text('province'),
  updatedAt: integer('updated_at').notNull()
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

export const examPackages = sqliteTable(
  'exam_packages',
  {
    id: text('id').primaryKey().notNull(),
    title: text('title').notNull(),
    examType: text('exam_type').notNull(),
    formation: text('formation').notNull(),
    targetYear: integer('target_year').notNull(),
    reference: text('reference').notNull(),
    durationMinutes: integer('duration_minutes').notNull(),
    quotas: text('quotas', { mode: 'json' }).$type<Record<string, number>>().notNull(),
    status: text('status', { enum: ['draft', 'published', 'archived'] })
      .notNull()
      .default('draft'),
    createdAt: integer('created_at').notNull()
  },
  (t) => [
    check('exam_duration_valid', sql`${t.durationMinutes} BETWEEN 1 AND 240`),
    check('exam_status_valid', sql`${t.status} IN ('draft','published','archived')`)
  ]
);
export const examItems = sqliteTable(
  'exam_items',
  {
    id: text('id').primaryKey().notNull(),
    packageId: text('package_id')
      .notNull()
      .references(() => examPackages.id),
    versionId: text('version_id')
      .notNull()
      .references(() => questionVersions.id),
    position: integer('position').notNull(),
    content: text('content', { mode: 'json' }).$type<QuestionInput>().notNull()
  },
  (t) => [
    uniqueIndex('exam_item_position').on(t.packageId, t.position),
    uniqueIndex('exam_item_version').on(t.packageId, t.versionId)
  ]
);
export const examOptions = sqliteTable(
  'exam_options',
  {
    id: text('id').primaryKey().notNull(),
    itemId: text('item_id')
      .notNull()
      .references(() => examItems.id),
    code: text('code').notNull(),
    text: text('text').notNull(),
    score: integer('score').notNull()
  },
  (t) => [uniqueIndex('exam_option_code').on(t.itemId, t.code)]
);
export const examAttempts = sqliteTable(
  'exam_attempts',
  {
    id: text('id').primaryKey().notNull(),
    packageId: text('package_id')
      .notNull()
      .references(() => examPackages.id),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    startedAt: integer('started_at').notNull(),
    deadlineAt: integer('deadline_at').notNull(),
    revision: integer('revision').notNull().default(1),
    resultRevision: integer('result_revision').notNull().default(1),
    scoringPolicy: text('scoring_policy').notNull().default('total-v1'),
    status: text('status', { enum: ['in_progress', 'scored'] })
      .notNull()
      .default('in_progress'),
    answers: text('answers', { mode: 'json' }).$type<Record<string, string>>().notNull(),
    result: text('result', { mode: 'json' }).$type<{
      total: number;
      maximum: number;
      subscores: Record<string, { score: number; maximum: number }>;
    }>(),
    endedReason: text('ended_reason'),
    finishedAt: integer('finished_at')
  },
  (t) => [
    index('exam_attempt_deadline').on(t.status, t.deadlineAt),
    check('exam_result_revision_positive', sql`${t.resultRevision} > 0`),
    check('exam_attempt_status', sql`${t.status} IN ('in_progress','scored')`)
  ]
);

export const rankingCohorts = sqliteTable('ranking_cohorts', {
  id: text('id').primaryKey().notNull(),
  packageId: text('package_id')
    .notNull()
    .unique()
    .references(() => examPackages.id),
  endsAt: integer('ends_at').notNull(),
  policy: text('policy').notNull().default('total-v1'),
  createdAt: integer('created_at').notNull()
});
export const rankingMembers = sqliteTable(
  'ranking_members',
  {
    id: text('id').primaryKey().notNull(),
    cohortId: text('cohort_id')
      .notNull()
      .references(() => rankingCohorts.id),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    alias: text('alias').notNull(),
    province: text('province'),
    visible: integer('visible', { mode: 'boolean' }).notNull().default(false)
  },
  (t) => [uniqueIndex('ranking_member_once').on(t.cohortId, t.userId)]
);

// Payment preparation only: no gateway requests or access activation yet.
export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey().notNull(),
    title: text('title').notNull(),
    priceIdr: integer('price_idr').notNull(),
    accessDays: integer('access_days').notNull(),
    active: integer('active', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at').notNull()
  },
  (t) => [
    check(
      'product_price_valid',
      sql`typeof(${t.priceIdr}) = 'integer' AND ${t.priceIdr} BETWEEN 0 AND 1000000000`
    ),
    check('product_access_valid', sql`${t.accessDays} BETWEEN 1 AND 3650`)
  ]
);
export const productPackages = sqliteTable(
  'product_packages',
  {
    id: text('id').primaryKey().notNull(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id),
    packageId: text('package_id')
      .notNull()
      .references(() => examPackages.id)
  },
  (t) => [uniqueIndex('product_package_unique').on(t.productId, t.packageId)]
);
export const orders = sqliteTable(
  'orders',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    productId: text('product_id')
      .notNull()
      .references(() => products.id),
    productTitle: text('product_title').notNull(),
    amountIdr: integer('amount_idr').notNull(),
    currency: text('currency').notNull().default('IDR'),
    accessDays: integer('access_days').notNull(),
    status: text('status').notNull().default('pending'),
    idempotencyKey: text('idempotency_key').notNull(),
    requestHash: text('request_hash').notNull(),
    createdAt: integer('created_at').notNull(),
    expiresAt: integer('expires_at').notNull(),
    paidAt: integer('paid_at')
  },
  (t) => [
    uniqueIndex('order_user_idempotency').on(t.userId, t.idempotencyKey),
    index('order_user_created').on(t.userId, t.createdAt),
    check(
      'order_amount_valid',
      sql`typeof(${t.amountIdr}) = 'integer' AND ${t.amountIdr} BETWEEN 0 AND 1000000000 AND ${t.currency} = 'IDR'`
    ),
    check('order_access_valid', sql`${t.accessDays} BETWEEN 1 AND 3650`),
    check(
      'order_status_valid',
      sql`${t.status} IN ('pending','paid','expired','cancelled','partially_refunded','refunded','review_required')`
    )
  ]
);
// Snapshot of the editions purchased, independent of later product changes.
export const orderPackages = sqliteTable(
  'order_packages',
  {
    id: text('id').primaryKey().notNull(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id),
    packageId: text('package_id')
      .notNull()
      .references(() => examPackages.id)
  },
  (t) => [uniqueIndex('order_package_unique').on(t.orderId, t.packageId)]
);
export const payments = sqliteTable(
  'payments',
  {
    id: text('id').primaryKey().notNull(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id),
    provider: text('provider').notNull(), // 'manual' is supported as an adapter later.
    environment: text('environment').notNull().default('sandbox'),
    merchantAccount: text('merchant_account').notNull(), // Non-secret configuration identifier.
    externalId: text('external_id'),
    idempotencyKey: text('idempotency_key').notNull().unique(),
    amountIdr: integer('amount_idr').notNull(),
    currency: text('currency').notNull().default('IDR'),
    status: text('status').notNull().default('created'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    settledAt: integer('settled_at')
  },
  (t) => [
    uniqueIndex('payment_external_unique').on(
      t.provider,
      t.environment,
      t.merchantAccount,
      t.externalId
    ),
    index('payment_order_idx').on(t.orderId),
    check(
      'payment_amount_valid',
      sql`typeof(${t.amountIdr}) = 'integer' AND ${t.amountIdr} BETWEEN 1 AND 1000000000 AND ${t.currency} = 'IDR'`
    ),
    check('payment_environment_valid', sql`${t.environment} IN ('sandbox','production')`),
    check(
      'payment_status_valid',
      sql`${t.status} IN ('created','pending','succeeded','failed','expired','cancelled','review_required')`
    )
  ]
);
export const paymentEvents = sqliteTable(
  'payment_events',
  {
    id: text('id').primaryKey().notNull(),
    provider: text('provider').notNull(),
    environment: text('environment').notNull(),
    merchantAccount: text('merchant_account').notNull(),
    eventKey: text('event_key').notNull(),
    paymentId: text('payment_id').references(() => payments.id),
    payloadHash: text('payload_hash').notNull(),
    verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
    status: text('status').notNull().default('received'),
    attempts: integer('attempts').notNull().default(0),
    errorCode: text('error_code'),
    receivedAt: integer('received_at').notNull(),
    processedAt: integer('processed_at')
  },
  (t) => [
    uniqueIndex('payment_event_unique').on(
      t.provider,
      t.environment,
      t.merchantAccount,
      t.eventKey
    ),
    index('payment_event_retry').on(t.status, t.receivedAt),
    check('payment_event_status', sql`${t.status} IN ('received','processed','ignored','failed')`),
    check('payment_event_verified', sql`${t.status} != 'processed' OR ${t.verified} = 1`)
  ]
);
export const manualPaymentProofs = sqliteTable(
  'manual_payment_proofs',
  {
    id: text('id').primaryKey().notNull(),
    paymentId: text('payment_id').notNull().references(() => payments.id),
    submittedBy: text('submitted_by').notNull().references(() => user.id),
    reference: text('reference').notNull(),
    senderName: text('sender_name').notNull(),
    amountIdr: integer('amount_idr').notNull(),
    paidAt: integer('paid_at').notNull(),
    status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
    reviewNote: text('review_note'),
    reviewedBy: text('reviewed_by').references(() => user.id),
    reviewedAt: integer('reviewed_at'),
    createdAt: integer('created_at').notNull()
  },
  (t) => [
    uniqueIndex('manual_proof_reference').on(t.paymentId, t.reference),
    index('manual_proof_status').on(t.status, t.createdAt),
    check('manual_proof_amount_valid', sql`typeof(${t.amountIdr}) = 'integer' AND ${t.amountIdr} BETWEEN 1 AND 1000000000`),
    check('manual_proof_status_valid', sql`${t.status} IN ('pending','approved','rejected')`)
  ]
);
// Owner and package are derived through order_packages -> orders; no mismatched user IDs.
export const accessGrants = sqliteTable(
  'access_grants',
  {
    id: text('id').primaryKey().notNull(),
    orderPackageId: text('order_package_id')
      .notNull()
      .unique()
      .references(() => orderPackages.id),
    startsAt: integer('starts_at').notNull(),
    expiresAt: integer('expires_at').notNull(),
    revokedAt: integer('revoked_at'),
    revokeReason: text('revoke_reason'),
    createdAt: integer('created_at').notNull()
  },
  (t) => [check('grant_period_valid', sql`${t.expiresAt} > ${t.startsAt}`)]
);
export const refunds = sqliteTable(
  'refunds',
  {
    id: text('id').primaryKey().notNull(),
    paymentId: text('payment_id')
      .notNull()
      .references(() => payments.id),
    externalId: text('external_id'),
    idempotencyKey: text('idempotency_key').notNull().unique(),
    amountIdr: integer('amount_idr').notNull(),
    reason: text('reason').notNull(),
    status: text('status').notNull().default('requested'),
    actorId: text('actor_id')
      .notNull()
      .references(() => user.id),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull()
  },
  (t) => [
    uniqueIndex('refund_external_unique').on(t.paymentId, t.externalId),
    check(
      'refund_amount_valid',
      sql`typeof(${t.amountIdr}) = 'integer' AND ${t.amountIdr} BETWEEN 1 AND 1000000000`
    ),
    check('refund_status_valid', sql`${t.status} IN ('requested','pending','succeeded','failed')`)
  ]
);

export const rankingSnapshots = sqliteTable('ranking_snapshots', {
  id: text('id').primaryKey().notNull(),
  cohortId: text('cohort_id').notNull().references(() => rankingCohorts.id),
  generation: integer('generation').notNull().default(1),
  policy: text('policy').notNull().default('total-v1'),
  reason: text('reason').notNull().default('Penutupan cohort'),
  generatedAt: integer('generated_at').notNull()
}, (t) => [
  uniqueIndex('ranking_snapshot_generation').on(t.cohortId, t.generation),
  check('ranking_snapshot_generation_positive', sql`${t.generation} > 0`)
]);
export const rankingSnapshotEntries = sqliteTable(
  'ranking_snapshot_entries',
  {
    id: text('id').primaryKey().notNull(),
    snapshotId: text('snapshot_id').notNull().references(() => rankingSnapshots.id),
    userId: text('user_id').notNull().references(() => user.id),
    alias: text('alias').notNull(),
    province: text('province'),
    total: integer('total').notNull(),
    maximum: integer('maximum').notNull(),
    visible: integer('visible', { mode: 'boolean' }).notNull().default(true)
  },
  (t) => [uniqueIndex('ranking_snapshot_user').on(t.snapshotId, t.userId)]
);

export const resultCorrections = sqliteTable(
  'result_corrections',
  {
    id: text('id').primaryKey().notNull(),
    attemptId: text('attempt_id').notNull().references(() => examAttempts.id),
    cohortId: text('cohort_id').notNull().references(() => rankingCohorts.id),
    fromRevision: integer('from_revision').notNull(),
    toRevision: integer('to_revision').notNull(),
    policy: text('policy').notNull(),
    previousResult: text('previous_result', { mode: 'json' }).$type<{
      total: number;
      maximum: number;
      subscores: Record<string, { score: number; maximum: number }>;
    }>().notNull(),
    correctedResult: text('corrected_result', { mode: 'json' }).$type<{
      total: number;
      maximum: number;
      subscores: Record<string, { score: number; maximum: number }>;
    }>().notNull(),
    reason: text('reason').notNull(),
    actorId: text('actor_id').notNull().references(() => user.id),
    createdAt: integer('created_at').notNull()
  },
  (t) => [
    uniqueIndex('result_correction_revision').on(t.attemptId, t.toRevision),
    check('result_correction_revision_valid', sql`${t.toRevision} = ${t.fromRevision} + 1`)
  ]
);
