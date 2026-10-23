import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { root, projectVersion } from './environment.mjs';

export const digest = text => createHash('sha256').update(text).digest('hex');
export async function siteConfig() { return JSON.parse(await readFile(resolve(root, 'environments/sites.json'), 'utf8')); }
export function siteTarget(config, target) {
  if (!['testing', 'production'].includes(target)) throw new Error('El destino debe ser testing o production.');
  return config[target];
}
export function renderSite(source, target, config) {
  const selected = siteTarget(config, target);
  const replacements = [
    ['<meta name="margaret:environment" content="local">', `<meta name="margaret:environment" content="${target}">`],
    ['LOCAL · PRUEBAS', selected.label],
    ["KEY='margaret-demo-v1'", `KEY='${selected.storageKey}'`],
    ["indexedDB.open('margaret-daily-backups-v1'", `indexedDB.open('${selected.backupStore}'`],
    ["locks.request('margaret-platform-write-v1'", `locks.request('${selected.writeLock}'`],
  ];
  let html = source;
  for (const [from, to] of replacements) {
    if (!html.includes(from)) throw new Error(`La fuente no contiene el marcador esperado: ${from}`);
    html = html.replaceAll(from, to);
  }
  return html;
}
export async function candidate(target) {
  const config = await siteConfig();
  const html = renderSite(await readFile(resolve(root, 'demo/index.html'), 'utf8'), target, config);
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  const metadata = { schemaVersion: 2, mode: 'public-demo', environment: target, version: await projectVersion(), commit: git('rev-parse', 'HEAD'), sourceTree: git('rev-parse', 'HEAD^{tree}'), sha256: digest(html), workflowRun: process.env.GITHUB_RUN_ID || null, operationalReady: false, storage: 'browser-local' };
  return { html, metadata };
}
export async function writeBundle(directory, bundle) {
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), bundle.html, 'utf8');
  await writeFile(resolve(directory, 'deployment.json'), JSON.stringify(bundle.metadata, null, 2) + '\n', 'utf8');
}
export function validateBundle(bundle) {
  if (!bundle || typeof bundle.html !== 'string' || !bundle.metadata || digest(bundle.html) !== bundle.metadata.sha256) throw new Error('El HTML no coincide con su SHA-256.');
  if (bundle.metadata.operationalReady !== false) throw new Error('Este publicador solo admite el demo.');
  return bundle;
}
export function assertPromotion(production, testing, run) {
  if (production.environment !== 'production' || testing.environment !== 'testing' || !testing.sourceTree || production.sourceTree !== testing.sourceTree || production.version !== testing.version) throw new Error('La versión estable debe corresponder exactamente al código validado en pruebas.');
  if (String(run.id) !== String(testing.workflowRun) || run.conclusion !== 'success' || run.status !== 'completed' || run.head_branch !== 'develop' || run.head_sha !== testing.commit || run.path !== '.github/workflows/pages.yml') throw new Error('La publicación de pruebas no tiene una ejecución de QA válida y completada.');
}
export async function remoteBundle(path = '', optional = false) {
  const config = await siteConfig();
  const read = async name => {
    const response = await fetch(config.baseUrl + path + name + '?verify=' + Date.now(), { signal: AbortSignal.timeout(30000), headers: { 'Cache-Control': 'no-cache' } });
    if (response.status === 404 && optional) return null;
    if (!response.ok) throw new Error(`No se pudo descargar ${path}${name}: HTTP ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length > 15_000_000) throw new Error('El archivo web excede el tamaño permitido.');
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  };
  const json = await read('deployment.json');
  if (json === null) return null;
  return validateBundle({ metadata: JSON.parse(json), html: await read('index.html') });
}
export async function github(path) {
  if (!path.startsWith('/')) throw new Error('Ruta de GitHub inválida.');
  const response = await fetch('https://api.github.com/repos/javidez89/margaret-pos' + path, { signal: AbortSignal.timeout(30000), headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Margaret-CI', ...(process.env.GH_TOKEN ? { Authorization: `Bearer ${process.env.GH_TOKEN}` } : {}) } });
  if (!response.ok) throw new Error(`GitHub no pudo verificar la promoción: HTTP ${response.status}`);
  return response.json();
}
