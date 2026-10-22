import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvironment, localServerAddress } from './environment.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config = await loadEnvironment();
const {host, port} = localServerAddress(config);
const server = createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  const path = new URL(req.url, 'http://127.0.0.1').pathname;
  if (!['/', '/index.html'].includes(path)) { res.writeHead(404); res.end('No encontrado'); return; }
  try {
    const content = await readFile(resolve(root, 'demo/index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch { res.writeHead(500); res.end('No se encontró el demo. Ejecuta npm run build.'); }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, host, () => console.log(`Margaret · LOCAL · http://${host === '::1' ? '[::1]' : host}:${port}`));
