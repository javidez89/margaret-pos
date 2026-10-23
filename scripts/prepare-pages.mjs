import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { root, loadEnvironment, requireLocalDemo, projectVersion } from './environment.mjs';

const environment = await loadEnvironment();
requireLocalDemo(environment);
const source = await readFile(resolve(root, 'demo/index.html'), 'utf8');
const localMeta = '<meta name="margaret:environment" content="local">';
if (!source.includes(localMeta) || !source.includes(environment.label)) throw new Error('Compila el demo local antes de preparar GitHub Pages.');
const html = source.replace(localMeta, '<meta name="margaret:environment" content="public-demo">').replaceAll(environment.label, 'DEMO · PRUEBAS');
const directory = resolve(root, '.build/pages');
await mkdir(directory, { recursive: true });
const allowed = ['index.html', 'deployment.json'];
if ((await readdir(directory)).some(name => !allowed.includes(name))) throw new Error('La carpeta de publicación contiene archivos inesperados. Revísala antes de continuar.');
const metadata = {
  schemaVersion: 1,
  mode: 'public-demo',
  version: await projectVersion(),
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  sha256: createHash('sha256').update(html, 'utf8').digest('hex'),
  operationalReady: false,
  storage: 'browser-local',
};
await writeFile(resolve(directory, 'index.html'), html, 'utf8');
await writeFile(resolve(directory, 'deployment.json'), JSON.stringify(metadata, null, 2) + '\n', 'utf8');
console.log('Demo público preparado en .build/pages (HTML autónomo y metadatos, sin archivos de configuración privados).');
