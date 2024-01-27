import { execSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';

import { getPckagesInfo } from '../shared/packages.mjs';

const [, , branch] = process.argv;

console.log(`Canary name is ${branch}`);

const packages = await getPckagesInfo();

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

console.log(
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
  console.log(`Latest canary version: ${latestCanaryVerison}`);

  for (const { root } of packages) {
    const packageJsonPath = path.join(process.cwd(), root, 'package.json');

    const originalPackageJson = await readFile(packageJsonPath, 'utf-8').then(
      JSON.parse
    );

    const nextPackageJson = {
      ...originalPackageJson,
      version: latestCanaryVerison,
    };

    await writeFile(packageJsonPath, JSON.stringify(nextPackageJson));

    console.log(
      `Updated ${packageJsonPath} with version: ${nextPackageJson.version}`
    );
  }
} else {
  console.log(`No canary versions found`);
}
