import { eq } from 'drizzle-orm';
import type { AppDatabase } from './database';
import { user, participantProfiles } from './schema';
import { validProvince } from '../provinces';
import { DomainError } from './question-service';
export function profileService(db: AppDatabase) {
  return {
    get(actor: string) {
      const person = db.select({ name: user.name }).from(user).where(eq(user.id, actor)).get();
      if (!person) throw new DomainError('Silakan login.', 401);
      return {
        name: person.name,
        province:
          db.select().from(participantProfiles).where(eq(participantProfiles.userId, actor)).get()
            ?.province || ''
      };
    },
    save(actor: string, name: string, province: string) {
      name = name.trim();
      if (name.length < 2 || name.length > 100) throw new DomainError('Nama harus 2–100 karakter.');
      if (!validProvince(province)) throw new DomainError('Pilih provinsi dari daftar.');
      db.transaction(
        () => {
          if (!db.select({ id: user.id }).from(user).where(eq(user.id, actor)).get())
            throw new DomainError('Silakan login.', 401);
          db.update(user).set({ name, updatedAt: new Date() }).where(eq(user.id, actor)).run();
          db.insert(participantProfiles)
            .values({ userId: actor, province: province || null, updatedAt: Date.now() })
            .onConflictDoUpdate({
              target: participantProfiles.userId,
              set: { province: province || null, updatedAt: Date.now() }
            })
            .run();
        },
        { behavior: 'immediate' }
      );
    }
  };
}
