import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { readdir, stat } from 'node:fs/promises';
import { strip } from 'ansicolor';

const packages = await readdir(path.join('packages'));

for (const pkg of packages) {
  const inputDir = path.join('packages', pkg);

  const stats = await stat(path.join('packages', pkg));
  if (!stats.isDirectory()) continue;

  /* Save to variable to strip colors */
  const result = spawnSync('publint', [inputDir])
    .output.toString()
    .split(',')
    .map(strip)
    .join('')
    .replaceAll('\n', '\n\n');

  console.log(result);
}
