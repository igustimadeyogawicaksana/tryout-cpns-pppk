import { db } from './db';
import { examService } from './exam-service';
export function startExamWorker() {
  const state = globalThis as typeof globalThis & { tryoutExpiry?: ReturnType<typeof setInterval> };
  if (state.tryoutExpiry) return;
  state.tryoutExpiry = setInterval(() => {
    try {
      examService(db).expire();
    } catch {
      console.error('Exam deadline processing failed; will retry.');
    }
  }, 15000);
  state.tryoutExpiry.unref();
}
