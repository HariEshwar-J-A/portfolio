import { gzipSync } from 'node:zlib';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = resolve('dist/assets/js');
const name = readdirSync(dir).find((file) => file.startsWith('main-') && file.endsWith('.js'));
if (!name) throw new Error('dist/assets/js has no main bundle');

const source = readFileSync(resolve(dir, name));
writeFileSync(
  resolve('dist/ops-meta.json'),
  JSON.stringify({ jsBytes: source.length, jsGzipBytes: gzipSync(source).length }),
);
console.log(`ops meta ${name} ${source.length} bytes`);
