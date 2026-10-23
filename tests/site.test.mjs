import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { root } from '../scripts/environment.mjs';
import { renderSite, siteConfig, digest, validateBundle, allowedGitHubPath, remoteBundle } from '../scripts/site.mjs';
import { assertQuality, findQuality, verifyQuality } from '../scripts/qa-evidence.mjs';
test('el token de publicación solo puede consultar las ramas y ejecuciones previstas', () => {
  for (const path of ['/git/ref/heads/main', '/git/ref/heads/develop', '/actions/runs/123', '/actions/runs/123/jobs?per_page=100', '/git/commits/' + 'a'.repeat(40), '/actions/workflows/validate.yml/runs?branch=develop&event=push&per_page=100']) assert.ok(allowedGitHubPath(path));
  for (const path of ['//evil.example', '/actions/runs/123/../../secrets', '/actions/runs/123?redirect=evil', '/git/ref/heads/otra', '/actions/runs/abc', '/actions/runs/123/jobs?per_page=100&next=evil', '/git/commits/HEAD', '/actions/workflows/validate.yml/runs?branch=main']) assert.equal(allowedGitHubPath(path), false);
});
test('pruebas tiene datos, respaldos y bloqueo de escritura separados del sitio estable', async () => {
  const config = await siteConfig();
  assert.equal(config.testing.location, 'local');
  assert.equal(config.testing.published, false);
  assert.equal(config.testing.url, 'http://127.0.0.1:4173');
  const source = await readFile(resolve(root, 'demo/index.html'), 'utf8');
  const testing = renderSite(source, 'testing', config), stable = renderSite(source, 'production', config);
  for (const key of ['storageKey', 'backupStore', 'writeLock']) {
    assert.notEqual(config.testing[key], config.production[key]);
    assert.ok(testing.includes(config.testing[key]));
    assert.ok(!stable.includes(config.testing[key]));
  }
  assert.ok(stable.includes("KEY='margaret-demo-v1'"), 'Conserva el almacenamiento existente del sitio estable');
  assert.ok(testing.includes('LOCAL · PRUEBAS'));
  assert.ok(stable.includes('ESTABLE · DEMO'));
  assert.throws(() => renderSite(source, '../production', config));
});
test('un paquete incompleto o alterado no puede publicarse', () => {
  const good = { html: '<html>demo</html>', metadata: { sha256: digest('<html>demo</html>'), operationalReady: false } };
  assert.equal(validateBundle(good), good);
  assert.throws(() => validateBundle({ ...good, html: 'alterado' }));
  assert.throws(() => validateBundle({ ...good, metadata: { ...good.metadata, operationalReady: true } }));
});
const fixture = () => {
  const commitId = 'a'.repeat(40), tree = 'b'.repeat(40), repo = { full_name: 'javidez89/margaret-pos' };
  const evidence = { workflowRun: 123, commit: commitId, sourceTree: tree, version: '0.4.0' };
  const production = { environment: 'production', sourceTree: tree, version: '0.4.0', qa: evidence };
  const run = { id: 123, conclusion: 'success', status: 'completed', event: 'push', head_branch: 'develop', head_sha: commitId, path: '.github/workflows/validate.yml', repository: repo, head_repository: repo };
  const commit = { sha: commitId, tree: { sha: tree } };
  const jobs = { jobs: ['validate', 'security', 'qa-browser'].map(name => ({ name, run_id: 123, conclusion: 'success', status: 'completed' })) };
  return { evidence, production, run, commit, jobs };
};

test('promoción exige contenido, origen y los tres controles CI correctos', () => {
  const { production, evidence, run, commit, jobs } = fixture();
  assert.doesNotThrow(() => assertQuality(production, evidence, run, commit, jobs));
  for (const change of [{ conclusion: 'failure' }, { status: 'in_progress' }, { head_branch: 'otra' }, { event: 'pull_request' }, { head_sha: 'c'.repeat(40) }, { path: '.github/workflows/otro.yml' }, { head_repository: { full_name: 'otro/fork' } }]) assert.throws(() => assertQuality(production, evidence, { ...run, ...change }, commit, jobs));
  assert.throws(() => assertQuality({ ...production, sourceTree: 'c'.repeat(40) }, evidence, run, commit, jobs));
  assert.throws(() => assertQuality({ ...production, version: '0.5.0' }, evidence, run, commit, jobs));
  assert.throws(() => assertQuality(production, evidence, run, { ...commit, tree: { sha: 'c'.repeat(40) } }, jobs));
  for (const name of ['validate', 'security', 'qa-browser']) {
    assert.throws(() => assertQuality(production, evidence, run, commit, { jobs: jobs.jobs.filter(j => j.name !== name) }));
    assert.throws(() => assertQuality(production, evidence, run, commit, { jobs: jobs.jobs.map(j => j.name === name ? { ...j, conclusion: 'failure' } : j) }));
  }
});

test('encuentra y vuelve a verificar QA sin consultar un sitio público de pruebas', async () => {
  const { production, evidence, run, commit, jobs } = fixture();
  const calls = [];
  const reader = async path => {
    calls.push(path);
    if (path.startsWith('/actions/workflows/')) return { workflow_runs: [run] };
    if (path.startsWith('/git/commits/')) return commit;
    return path.endsWith('/jobs?per_page=100') ? jobs : run;
  };
  assert.deepEqual(await findQuality(production, reader), evidence);
  assert.deepEqual(await verifyQuality(production, reader), evidence);
  assert.ok(calls.every(allowedGitHubPath));
  await assert.rejects(() => findQuality(production, async () => ({ workflow_runs: [] })));
  await assert.rejects(() => verifyQuality({ ...production, qa: { ...evidence, workflowRun: '../secrets' } }, reader));
  await assert.rejects(() => remoteBundle('pruebas/'));
});

test('develop y PR no tienen un publicador; producción sigue requiriendo aprobación', async () => {
  const { readdir } = await import('node:fs/promises');
  const dir = resolve(root, '.github/workflows');
  const names = await readdir(dir);
  assert.ok(!names.includes('pages.yml'));
  const quality = await readFile(resolve(dir, 'validate.yml'), 'utf8');
  assert.ok(!quality.includes('deploy-pages@'));
  const production = await readFile(resolve(dir, 'production.yml'), 'utf8');
  assert.match(production, /environment: production/);
  assert.match(production, /workflow_dispatch:/);
  assert.match(production, /needs: \[prepare, approval\]/);
  for (const script of ['scripts/prepare-pages.mjs', 'scripts/assemble-site.mjs']) {
    const attempt = spawnSync(process.execPath, [script, 'testing'], { cwd: root, encoding: 'utf8', timeout: 15000 });
    assert.notEqual(attempt.status, 0, 'No puede producirse una publicación testing');
  }
});
