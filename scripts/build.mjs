import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadEnvironment, requireLocalDemo, projectVersion } from './environment.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const environment = await loadEnvironment();
requireLocalDemo(environment);
const version = await projectVersion();
let source = await readFile(resolve(root, 'src/index.template.html'), 'utf8');
source = source.replaceAll('__APP_VERSION__', version).replaceAll('__APP_ENV_LABEL__', environment.label);
for (const [token, path] of [['__LOGO__', 'logo.png'], ['__ICON__', 'icon.png']]) {
  if (!source.includes(token)) throw new Error(`Falta el marcador ${token}`);
  const bytes = await readFile(resolve(root, 'assets/brand', path));
  source = source.replaceAll(token, `data:image/png;base64,${bytes.toString('base64')}`);
}
// Extrae el bloque de la plantilla controlada; no es un filtro de HTML de usuarios.
const scriptStart = source.indexOf('<script>');
const scriptEnd = source.indexOf('</script>', scriptStart + 8);
if (scriptStart < 0 || scriptEnd < 0) throw new Error('No se encontró el script de la aplicación');
const applicationScript = source.slice(scriptStart + 8, scriptEnd);
await mkdir(resolve(root, '.build'), { recursive: true });
await mkdir(resolve(root, 'demo'), { recursive: true });
const checkPath = resolve(root, '.build/demo-check.js');
await writeFile(checkPath, applicationScript, 'utf8');
const checked = spawnSync(process.execPath, ['--check', checkPath], { stdio: 'inherit' });
if (checked.status !== 0) process.exit(checked.status || 1);
await writeFile(resolve(root, 'demo/index.html'), source, 'utf8');
console.log('Demo compilado: demo/index.html');
