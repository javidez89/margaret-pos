import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root } from '../scripts/environment.mjs';
import { renderSite, siteConfig, digest, validateBundle, assertPromotion } from '../scripts/site.mjs';
test('pruebas tiene datos, respaldos y bloqueo de escritura separados del sitio estable', async () => {
  const config = await siteConfig();
  const source = await readFile(resolve(root, 'demo/index.html'), 'utf8');
  const testing = renderSite(source, 'testing', config), stable = renderSite(source, 'production', config);
  for (const key of ['storageKey', 'backupStore', 'writeLock']) {
    assert.notEqual(config.testing[key], config.production[key]);
    assert.ok(testing.includes(config.testing[key]));
    assert.ok(!stable.includes(config.testing[key]));
  }
  assert.ok(stable.includes("KEY='margaret-demo-v1'"), 'Conserva el almacenamiento existente del sitio estable');
  assert.ok(testing.includes('PRUEBAS · DEMO'));
  assert.ok(stable.includes('ESTABLE · DEMO'));
  assert.throws(() => renderSite(source, '../production', config));
});
test('un paquete incompleto o alterado no puede publicarse', () => {
  const good = { html: '<html>demo</html>', metadata: { sha256: digest('<html>demo</html>'), operationalReady: false } };
  assert.equal(validateBundle(good), good);
  assert.throws(() => validateBundle({ ...good, html: 'alterado' }));
  assert.throws(() => validateBundle({ ...good, metadata: { ...good.metadata, operationalReady: true } }));
});
test('la promoción rechaza versiones sin QA correcto del mismo código', () => {
  const production = { environment: 'production', sourceTree: 'tree-a', version: '0.3.0' };
  const testing = { environment: 'testing', sourceTree: 'tree-a', version: '0.3.0', workflowRun: '123', commit: 'abc' };
  const run = { id: 123, conclusion: 'success', status: 'completed', head_branch: 'develop', head_sha: 'abc', path: '.github/workflows/pages.yml' };
  assert.doesNotThrow(() => assertPromotion(production, testing, run));
  for (const change of [{ conclusion: 'failure' }, { status: 'in_progress' }, { head_branch: 'feature/otro' }, { head_sha: 'otro' }, { path: '.github/workflows/otro.yml' }]) assert.throws(() => assertPromotion(production, testing, { ...run, ...change }));
  assert.throws(() => assertPromotion({ ...production, sourceTree: 'tree-b' }, testing, run));
  assert.throws(() => assertPromotion({ ...production, version: '0.4.0' }, testing, run));
});
