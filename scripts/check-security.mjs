import { execFileSync } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root } from './environment.mjs';
import { inspectFile } from './security-rules.mjs';
const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const findings = [];
for (const path of files) findings.push(...inspectFile(path, await readFile(resolve(root, path), 'utf8')));
const result = { files: files.length, passed: findings.length === 0, findings };
await mkdir(resolve(root, '.artifacts/test-results'), { recursive: true });
await writeFile(resolve(root, '.artifacts/test-results/security.json'), JSON.stringify(result, null, 2) + '\n');
if (findings.length) { console.error(JSON.stringify(findings)); process.exit(1); }
console.log(`Seguridad básica: ${files.length} archivos revisados, sin secretos reconocidos ni acciones sin fijar. No sustituye una auditoría de servidor.`);
