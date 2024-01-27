import { readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';

import { getPackagesInfo } from '../shared/packages.mjs';

const packages = await getPackagesInfo();

for (const pkg of packages) {
  const packageJsonPath = path.join(process.cwd(), pkg.root, 'package.json');

  const originalPackageJson = await readFile(packageJsonPath, 'utf-8').then(
    JSON.parse
  );

  const nextPackageJson = {
    ...originalPackageJson,
    name: adjustPackageName(originalPackageJson.name),
    peerDependencies: mapValues(
      originalPackageJson.peerDependencies ?? {},
      (version, name) =>
        name.includes('@farfetched')
          ? `npm:${adjustPackageName(name)}@${originalPackageJson.version}`
          : version
    ),
  };

  await writeFile(packageJsonPath, JSON.stringify(nextPackageJson));
}

function adjustPackageName(name) {
  return name.replaceAll('@farfetched/', '@farfetched-canary/');
}

export function mapValues(val, fn) {
  const mappedEntries = Object.entries(val).map(([key, value]) => [
    key,
    fn(value, key),
  ]);

  return Object.fromEntries(mappedEntries);
}
