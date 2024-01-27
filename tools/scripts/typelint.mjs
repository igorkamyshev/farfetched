import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { readdir, stat } from 'node:fs/promises';

const packages = await readdir(path.join('packages'));

for (const pkg of packages) {
  const stats = await stat(path.join('packages', pkg));
  if (!stats.isDirectory()) continue;

  const inputDir = path.join('packages', pkg);

  spawnSync('attw', ['--pack', inputDir, '--format', 'ascii'], {
    stdio: 'inherit',
  });
}
