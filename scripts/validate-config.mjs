import { readFile } from 'node:fs/promises';
import { validateConfig } from '../src/config.js';
validateConfig(JSON.parse(await readFile(new URL('../public/config.json', import.meta.url), 'utf8')));
console.log('Cấu hình QR hợp lệ.');
