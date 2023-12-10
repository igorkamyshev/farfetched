import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { readdir } from 'node:fs/promises';

const packages = await readdir(path.join('dist', 'packages'));

for (const pkg of packages) {
  const inputDir = path.join('dist', 'packages', pkg);

  spawnSync('attw', ['--pack', inputDir, '--format', 'ascii'], {
    stdio: 'inherit',
  });
}
