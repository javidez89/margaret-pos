import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { loadEnvironment, localServerAddress, requireLocalDemo, validateVersion, validateReleaseTag, projectVersion, root } from '../scripts/environment.mjs';

test('local permite únicamente el demo en loopback', async () => {
  const local = await loadEnvironment('local');
  assert.equal(local.seedTestData, true);
  assert.deepEqual(localServerAddress(local, {}), { host: '127.0.0.1', port: 4173 });
  assert.throws(() => localServerAddress(local, { HOST: '0.0.0.0' }));
  assert.throws(() => localServerAddress(local, { NODE_ENV: 'production' }));
  assert.throws(() => localServerAddress(local, { PORT: 'invalid' }));
});
test('producción no comparte el demo, datos ni almacenamiento local', async () => {
  const production = await loadEnvironment('production');
  assert.equal(production.demoEnabled, false);
  assert.equal(production.seedTestData, false);
  assert.equal(production.storageNamespace, null);
  assert.equal(production.deploymentEnabled, false);
  assert.throws(() => requireLocalDemo(production));
  assert.throws(() => localServerAddress(production, {}));
  await assert.rejects(() => loadEnvironment('../../local'));
});
test('versión y etiqueta deben coincidir con los archivos de paquete', async () => {
  const version = await projectVersion();
  assert.equal(validateReleaseTag(`v${version}`, version), `v${version}`);
  for (const invalid of ['1.2', '01.2.3', '1.2.3-01', '1.2.3;echo unsafe']) assert.throws(() => validateVersion(invalid));
  assert.equal(validateVersion('1.2.3-rc.1'), '1.2.3-rc.1');
  assert.throws(() => validateReleaseTag('v9.9.9', version));
});
test('el servidor y la compilación rechazan producción en ejecución real', () => {
  for (const script of ['scripts/serve.mjs', 'scripts/build.mjs']) {
    const result = spawnSync(process.execPath, [script], { cwd: root, env: { ...process.env, APP_ENV: 'production' }, encoding: 'utf8', timeout: 15000 });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /solo puede compilarse o ejecutarse en local/);
  }
});
test('el control de preparación no afirma que exista producción operativa', () => {
  const strict = spawnSync(process.execPath, ['scripts/production-readiness.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(strict.status, 2);
  const report = JSON.parse(strict.stdout);
  assert.equal(report.operationalReady, false);
  assert.ok(report.pending.includes('central_backend'));
});
