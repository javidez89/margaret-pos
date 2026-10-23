import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { root } from './environment.mjs';
import { remoteBundle } from './site.mjs';
const expected = JSON.parse(await readFile(resolve(root, '.artifacts/publication.json'), 'utf8'));
let lastError;
for (let attempt = 0; attempt < 12; attempt++) {
  try {
    const remote = await remoteBundle('');
    if (remote.metadata.sha256 !== expected.production.sha256 || remote.metadata.commit !== expected.production.commit) throw new Error('Producción todavía no sirve el paquete esperado.');
    console.log('HTTPS, versión e integridad de producción verificados; pruebas permanece local.');
    process.exit(0);
  } catch (error) { lastError = error; await setTimeout(5000); }
}
throw lastError;
