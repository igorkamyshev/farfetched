import {
  readCachedProjectGraph,
  writeJsonFile,
  readJsonFile,
} from '@nrwl/devkit';
import { spawnSync } from 'child_process';
import { join } from 'path';

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

for (const [_name, project] of Object.entries(readCachedProjectGraph().nodes)) {
  if (project.type !== 'lib') {
    continue;
  }

  const packageJsonPath = join(project.data.sourceRoot, 'package.json');

  const originalPackageJson = readJsonFile(packageJsonPath);

  writeJsonFile(packageJsonPath, {
    ...originalPackageJson,
    name: adjustPackageName(originalPackageJson.name),
  });
}

spawnSync('pnpm', ['changeset', 'pre', 'exit'], {
  stdio: 'inherit',
});

function adjustPackageName(name) {
  return name.replace('@farfetched/', '@igorkamyshev/farfetched-');
}
