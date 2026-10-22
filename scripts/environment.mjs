import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export function validateVersion(value) {
  if (typeof value !== 'string' || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(value)) {
    throw new Error('La versión debe usar MAJOR.MINOR.PATCH, por ejemplo 0.2.0.');
  }
  const prerelease = value.split('-').slice(1).join('-');
  if (prerelease && prerelease.split('.').some(part => /^\d+$/.test(part) && part.length > 1 && part.startsWith('0'))) throw new Error('Un identificador numérico de preversión no puede comenzar por cero.');
  return value;
}
export function validateReleaseTag(tag, version) {
  validateVersion(version);
  if (tag !== `v${version}`) throw new Error(`La etiqueta debe ser v${version} y coincidir con package.json.`);
  return tag;
}
export async function projectVersion() {
  const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
  const lock = JSON.parse(await readFile(resolve(root, 'package-lock.json'), 'utf8'));
  validateVersion(pkg.version);
  if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) throw new Error('package.json y package-lock.json tienen versiones diferentes.');
  return pkg.version;
}
export async function loadEnvironment(name = process.env.APP_ENV || 'local') {
  if (!['local', 'production'].includes(name)) throw new Error('APP_ENV debe ser local o production.');
  const config = JSON.parse(await readFile(resolve(root, 'environments', `${name}.json`), 'utf8'));
  if (config.schemaVersion !== 1 || config.name !== name) throw new Error('Configuración de ambiente incompatible.');
  if (name === 'production' && (config.demoEnabled || config.seedTestData || config.storageNamespace)) throw new Error('Producción no puede habilitar el demo ni sus datos de prueba.');
  return config;
}
export function requireLocalDemo(config) {
  if (config.name !== 'local' || config.applicationMode !== 'demo' || !config.server?.enabled) {
    throw new Error('El demo solo puede compilarse o ejecutarse en local. Producción está reservada hasta implementar el servicio central.');
  }
}
export function localServerAddress(config, env = process.env) {
  requireLocalDemo(config);
  if (env.NODE_ENV === 'production') throw new Error('NODE_ENV=production no puede ejecutar el servidor de demostración.');
  const host = env.HOST || config.server.host;
  const port = Number(env.PORT || config.server.port);
  if (!['127.0.0.1', 'localhost', '::1'].includes(host)) throw new Error('El servidor local debe escuchar únicamente en loopback.');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Puerto inválido');
  return { host, port };
}
