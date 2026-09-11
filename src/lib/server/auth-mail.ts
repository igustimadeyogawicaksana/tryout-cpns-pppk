import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import nodemailer from 'nodemailer';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

export const localMail =
  dev ||
  (env.AUTH_MAIL_MODE === 'test' &&
    env.AUTH_MAIL_TEST_DIR &&
    new URL(env.BETTER_AUTH_URL || 'http://localhost').hostname === '127.0.0.1');
export const mailEnabled = Boolean(
  localMail || (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD && env.MAIL_FROM)
);
export async function sendAuthMail(to: string, subject: string, url: string) {
  if (localMail) {
    const folder = dev ? '.local/mail' : env.AUTH_MAIL_TEST_DIR!;
    await mkdir(folder, { recursive: true });
    await writeFile(
      `${folder}/${Date.now()}-${randomUUID()}.json`,
      JSON.stringify({ to, subject, url }),
      { mode: 0o600 }
    );
    return;
  }
  if (!mailEnabled) throw new Error('Email delivery is not configured.');
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT || 587),
    secure: env.SMTP_PORT === '465',
    requireTLS: env.SMTP_PORT !== '465',
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    connectionTimeout: 10000,
    socketTimeout: 15000
  });
  await transporter.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    text: `${subject}\n\nBuka tautan berikut untuk melanjutkan:\n${url}\n\nJika Anda tidak meminta ini, abaikan pesan ini.`
  });
}
