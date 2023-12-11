import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { strip } from 'ansicolor';

const packages = await readdir(path.join('dist', 'packages'));

for (const pkg of packages) {
  const inputDir = path.join('dist', 'packages', pkg);

  /* Save to variable to strip colors */
  const result = spawnSync('publint', [inputDir])
    .output.toString()
    .split(',')
    .map(strip)
    .join('');

  console.log(result);
}
