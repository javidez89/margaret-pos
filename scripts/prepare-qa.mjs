import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root } from './environment.mjs';
import { renderSite, siteConfig } from './site.mjs';
const source = await readFile(resolve(root, 'demo/index.html'), 'utf8'), config = await siteConfig();
for (const target of ['testing', 'production']) {
  const directory = resolve(root, '.build/e2e', config[target].path);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), renderSite(source, target, config));
}
