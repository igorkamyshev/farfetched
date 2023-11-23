import {
  createProjectGraphAsync,
  logger,
  readJsonFile,
  writeJsonFile,
} from '@nrwl/devkit';
import { spawnSync, execSync } from 'child_process';
import { renameForGitHub } from './rename.mjs';

import { invariant } from './shared/invariant.mjs';

const graph = await createProjectGraphAsync();

const packages = Object.entries(graph.nodes)
  .filter(([_name, { type }]) => type === 'lib')
  .map(([name, { data }]) => ({ name, root: data.root }));
// .map(([name]) => `@igorkamyshev/farfetched-${name}`);

const betaNames = packages.map(
  ({ name }) => `@igorkamyshev/farfetched-${name}`
);

const betaVersions = betaNames.flatMap((betaName) => {
  const versions = JSON.parse(
    execSync(`npm view ${betaName} versions --json`).toString().trim()
  );

  return versions;
});

console.log(betaVersions);
