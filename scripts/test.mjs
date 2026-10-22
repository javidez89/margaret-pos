import { mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await mkdir(resolve(root, '.artifacts/test-results'), { recursive: true });
for (const file of ['scripts/check-version.mjs', 'scripts/build.mjs', 'tests/environments.test.mjs', 'tests/data-tools.cjs', 'tests/backup-roundtrip.cjs', 'tests/shift-approval.cjs', 'tests/returns.cjs']) {
  console.log(`\nEjecutando ${file}`);
  const result = spawnSync(process.execPath, [file], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log('\nTodas las validaciones finalizaron correctamente.');
