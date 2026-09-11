import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';
import { db } from './db';
import * as schema from './schema';
import { mailEnabled, sendAuthMail } from './auth-mail';

if (!building && (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32)) {
  throw new Error(
    'Set BETTER_AUTH_SECRET (at least 32 random characters) in .env before starting the application.'
  );
}
export const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
export const auth = betterAuth({
  appName: 'Ruang Tryout',
  baseURL: env.BETTER_AUTH_URL || 'http://localhost:5173',
  secret: env.BETTER_AUTH_SECRET || 'build-only-placeholder-not-used-by-running-server',
  database: drizzleAdapter(db, { provider: 'sqlite', schema }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: !mailEnabled,
    minPasswordLength: 12,
    autoSignIn: false,
    revokeSessionsOnPasswordReset: true,
    ...(mailEnabled
      ? {
          sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) =>
            sendAuthMail(user.email, 'Atur ulang password Ruang Tryout', url)
        }
      : {})
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) =>
      sendAuthMail(user.email, 'Verifikasi email Ruang Tryout', url)
  },
  socialProviders: googleEnabled
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID!,
          clientSecret: env.GOOGLE_CLIENT_SECRET!,
          disableSignUp: false,
          prompt: 'select_account'
        }
      }
    : {},
  advanced: { database: { generateId: 'uuid' } },
  rateLimit: { enabled: true, window: 60, max: 30 }
});
