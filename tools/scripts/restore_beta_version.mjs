import {
  createProjectGraphAsync,
  logger,
  readJsonFile,
  writeJsonFile,
} from '@nrwl/devkit';
import { execSync } from 'child_process';
import { join } from 'path';

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

let latestBetaVerisonSuffix = -1;
let latestBetaVerison = null;

for (const betaVersion of betaVersions.values()) {
  const [_, suffix] = betaVersion.split(`-${branch}.`);

  const suffixNumber = Number(suffix);

  if (suffixNumber > latestBetaVerisonSuffix) {
    latestBetaVerisonSuffix = suffixNumber;
    latestBetaVerison = betaVersion;
  }
}

if (latestBetaVerison) {
  logger.info(`Latest beta version: ${latestBetaVerison}`);

  for (const { root } of packages) {
    const packageJsonPath = join(process.cwd(), root, 'package.json');

    const originalPackageJson = readJsonFile(packageJsonPath);

    const nextPackageJson = {
      ...originalPackageJson,
      version: latestBetaVerison,
    };

    writeJsonFile(packageJsonPath, nextPackageJson);

    logger.info(
      `Updated ${packageJsonPath} with version: ${nextPackageJson.version}`
    );
  }
} else {
  logger.info(`No beta versions found`);
}
