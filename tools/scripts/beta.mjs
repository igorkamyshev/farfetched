import {
  createProjectGraphAsync,
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

spawnSync('pnpm', ['changeset', 'pre', 'exit'], {
  stdio: 'inherit',
});

const graph = await createProjectGraphAsync();

for (const [_name, project] of Object.entries(graph.nodes)) {
  if (project.type !== 'lib') {
    continue;
  }

  const packageJsonPath = join(
    process.cwd(),
    project.data.sourceRoot,
    '..',
    'package.json'
  );

  const originalPackageJson = readJsonFile(packageJsonPath);

  writeJsonFile(packageJsonPath, {
    ...originalPackageJson,
    name: adjustPackageName(originalPackageJson.name),
  });
}

function adjustPackageName(name) {
  return name.replace('@farfetched/', '@igorkamyshev/farfetched-');
}
