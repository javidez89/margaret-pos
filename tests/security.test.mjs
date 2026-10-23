import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectFile } from '../scripts/security-rules.mjs';
test('bloquea credenciales reconocidas y archivos privados sin imprimir su valor', () => {
  const secret = 'ghp_' + 'A'.repeat(36);
  const findings = inspectFile('src/config.js', secret);
  assert.equal(findings.length, 1);
  assert.ok(!JSON.stringify(findings).includes(secret));
  assert.equal(inspectFile('.env.production', 'CONFIG=private').length, 1);
  assert.equal(inspectFile('environments/local.env.example', 'APP_ENV=local').length, 0);
});
test('rechaza acciones mutables y eventos de PR con privilegios', () => {
  assert.equal(inspectFile('.github/workflows/test.yml', '- uses: actions/checkout@v7').length, 1);
  assert.equal(inspectFile('.github/workflows/test.yml', 'on:\n  pull_request_target:').length, 1);
  assert.equal(inspectFile('.github/workflows/test.yml', '- uses: actions/checkout@' + 'a'.repeat(40)).length, 0);
});
