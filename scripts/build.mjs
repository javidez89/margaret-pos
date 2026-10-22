import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let source = await readFile(resolve(root, 'src/index.template.html'), 'utf8');
for (const [token, path] of [['__LOGO__', 'logo.png'], ['__ICON__', 'icon.png']]) {
  if (!source.includes(token)) throw new Error(`Falta el marcador ${token}`);
  const bytes = await readFile(resolve(root, 'assets/brand', path));
  source = source.replaceAll(token, `data:image/png;base64,${bytes.toString('base64')}`);
}
const match = source.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error('No se encontró el script de la aplicación');
await mkdir(resolve(root, '.build'), { recursive: true });
await mkdir(resolve(root, 'demo'), { recursive: true });
const checkPath = resolve(root, '.build/demo-check.js');
await writeFile(checkPath, match[1], 'utf8');
const checked = spawnSync(process.execPath, ['--check', checkPath], { stdio: 'inherit' });
if (checked.status !== 0) process.exit(checked.status || 1);
await writeFile(resolve(root, 'demo/index.html'), source, 'utf8');
console.log('Demo compilado: demo/index.html');
