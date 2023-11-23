import {
  createProjectGraphAsync,
  logger,
  readJsonFile,
  writeJsonFile,
} from '@nrwl/devkit';
import { execSync } from 'child_process';
import { join } from 'path';

const [, , branch] = process.argv;

logger.info(`Canary name is ${branch}`);

const graph = await createProjectGraphAsync();

const packages = Object.entries(graph.nodes)
  .filter(([_name, { type, data }]) => type === 'lib' && data.targets.publish)
  .map(([name, { data }]) => ({ name, root: data.root }));

const canaryNames = packages.map(({ name }) => `@farfetched-canary/${name}`);

const canaryVersions = new Set(
  canaryNames
    .flatMap((canaryName) => {
      try {
        const versions = JSON.parse(
          execSync(`npm view ${canaryName} versions --json`).toString().trim()
        );
        return versions;
      } catch (e) {
        return [];
      }
    })
    .filter((version) => version.includes(`-${branch}.`))
);

logger.info(
  `Found canary versions: ${JSON.stringify(Array.from(canaryVersions))}`
);

let latestCanaryVerisonSuffix = -1;
let latestCanaryVerison = null;

for (const canaryVersion of canaryVersions.values()) {
  const [_, suffix] = canaryVersion.split(`-${branch}.`);

  const suffixNumber = Number(suffix);

  if (suffixNumber > latestCanaryVerisonSuffix) {
    latestCanaryVerisonSuffix = suffixNumber;
    latestCanaryVerison = canaryVersion;
  }
}

if (latestCanaryVerison) {
  logger.info(`Latest canary version: ${latestCanaryVerison}`);

  for (const { root } of packages) {
    const packageJsonPath = join(process.cwd(), root, 'package.json');

    const originalPackageJson = readJsonFile(packageJsonPath);

    const nextPackageJson = {
      ...originalPackageJson,
      version: latestCanaryVerison,
    };

    writeJsonFile(packageJsonPath, nextPackageJson);

    logger.info(
      `Updated ${packageJsonPath} with version: ${nextPackageJson.version}`
    );
  }
} else {
  logger.info(`No canary versions found`);
}
