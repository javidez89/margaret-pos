import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root } from './environment.mjs';
const routes = new Map([['/', 'index.html'], ['/pruebas/', 'pruebas/index.html']]);
createServer(async (request, response) => {
  const path = routes.get(new URL(request.url, 'http://127.0.0.1:4174').pathname);
  if (!path || !['GET', 'HEAD'].includes(request.method)) { response.writeHead(404).end(); return; }
  try {
    const body = await readFile(resolve(root, '.build/e2e', path));
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(503).end(); }
}).listen(4174, '127.0.0.1');
