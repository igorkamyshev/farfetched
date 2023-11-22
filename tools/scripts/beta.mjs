import { spawnSync } from 'child_process';

const branch = spawnSync('git', ['branch', '--show-current'], {
  stdio: 'pipe',
})
  .stdout.toString()
  .trim();

spawnSync('pnpm', ['changeset', 'pre', 'enter', branch], {
  stdio: 'inherit',
});

spawnSync('pnpm', ['changeset', 'version'], {
  stdio: 'inherit',
});
