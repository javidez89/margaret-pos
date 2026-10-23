import { resolve } from 'node:path';
import { root, loadEnvironment, requireLocalDemo } from './environment.mjs';
import { candidate, writeBundle } from './site.mjs';
requireLocalDemo(await loadEnvironment());
const target = process.argv[2] || 'testing';
await writeBundle(resolve(root, '.build/candidate'), await candidate(target));
console.log(`Candidato ${target} preparado con versión, commit y SHA-256.`);
