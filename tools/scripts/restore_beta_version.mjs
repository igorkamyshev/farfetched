import {
  createProjectGraphAsync,
  logger,
  readJsonFile,
  writeJsonFile,
} from '@nrwl/devkit';
import { spawnSync, execSync } from 'child_process';

import { invariant } from './shared/invariant.mjs';

const [, , branch] = process.argv;

logger.info(`Beta name is ${branch}`);

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

logger.info(`Found beta versions: ${JSON.stringify(Array.from(betaVersions))}`);

const latestBetaVerisonSuffix = -1;
const latestBetaVerison = null;

for (const betaVersion of betaVersions.values()) {
  const [_, suffix] = betaVersion.split(`-${branch}.`);

  const suffixNumber = Number(suffix);

  console.log('BEF', { suffixNumber, latestBetaVerisonSuffix, betaVersion });

  if (suffixNumber > latestBetaVerison) {
    console.log('IN', { suffixNumber, latestBetaVerisonSuffix, betaVersion });
    latestBetaVerisonSuffix = suffixNumber;
    latestBetaVerison = betaVersion;
  }
}

invariant(latestBetaVerison, 'Latest beta version is not found');

logger.info(`Latest beta version: ${latestBetaVerison}`);
