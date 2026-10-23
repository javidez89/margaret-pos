import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { root, validateVersion } from './environment.mjs';
import { remoteBundle, github, assertPromotion } from './site.mjs';
if (!process.env.GITHUB_EVENT_PATH || process.env.GITHUB_EVENT_NAME !== 'pull_request') process.exit(0);
const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8'));
const pr = event.pull_request;
if (pr.base.ref !== 'main') process.exit(0);
if (pr.head.ref !== 'develop' || pr.head.repo.full_name !== pr.base.repo.full_name) throw new Error('Main recibe promociones desde develop; los cambios individuales deben entrar por pruebas.');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const testing = await remoteBundle('pruebas/');
if (testing.metadata.commit !== pr.head.sha || testing.metadata.sourceTree !== git('rev-parse', pr.head.sha + '^{tree}')) throw new Error('Publica y valida este commit de develop en pruebas antes de promoverlo.');
const before = JSON.parse(git('show', `${pr.base.sha}:package.json`)).version;
const after = JSON.parse(git('show', `${pr.head.sha}:package.json`)).version;
assertPromotion({ environment: 'production', sourceTree: git('rev-parse', pr.head.sha + '^{tree}'), version: after }, testing.metadata, await github('/actions/runs/' + testing.metadata.workflowRun));
const changed = git('diff', '--name-only', `${pr.base.sha}...${pr.head.sha}`).split('\n');
if (changed.some(p => /^(src\/|assets\/|scripts\/|environments\/|\.github\/workflows\/|package)/.test(p))) {
  validateVersion(after);
  const a = after.split('.').map(Number), b = before.split('.').map(Number);
  if (!a.some((n, i) => n > b[i] && a.slice(0, i).every((v, j) => v === b[j]))) throw new Error('La promoción con cambios de código debe aumentar la versión.');
  if (!changed.includes('CHANGELOG.md')) throw new Error('Actualiza CHANGELOG antes de promover.');
}
console.log('Promoción desde develop publicado y versionado correctamente.');
