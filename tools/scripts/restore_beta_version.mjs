import {
  createProjectGraphAsync,
  logger,
  readJsonFile,
  writeJsonFile,
} from '@nrwl/devkit';
import { spawnSync, execSync } from 'child_process';
import { renameForGitHub } from './rename.mjs';

import { invariant } from './shared/invariant.mjs';

const [, , branch] = process.argv;

const graph = await createProjectGraphAsync();

const packages = Object.entries(graph.nodes)
  .filter(([_name, { type, data }]) => type === 'lib' && data.targets.publish)
  .map(([name, { data }]) => ({ name, root: data.root }));

const betaNames = packages.map(
  ({ name }) => `@igorkamyshev/farfetched-${name}`
);

const betaVersions = new Set(
  betaNames
    .flatMap((betaName) => {
      const versions = JSON.parse(
        execSync(`npm view ${betaName} versions --json`).toString().trim()
      );

      return versions;
    })
    .filter((version) => version.includes(`-${branch}.`))
);

logger.info(`Found beta versions: ${JSON.stringify(betaVersions.values())}`);

const latestBetaVerisonSuffix = -1;
const latestBetaVerison = null;

for (const betaVersion of betaVersions.values()) {
  const [_, suffix] = betaVersion.split(`-${branch}.`);

  const suffixNumber = Number(suffix);

  if (suffixNumber > latestBetaVerison) {
    latestBetaVerisonSuffix = suffixNumber;
    latestBetaVerison = betaVersion;
  }
}

console.log(latestBetaVerison);
