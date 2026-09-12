// Preview by default; --apply creates a new edition without rewriting old exams.
import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['--import', 'tsx', '--env-file-if-exists=.env', 'scripts/install-skd-edition.ts', ...process.argv.slice(2)], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
