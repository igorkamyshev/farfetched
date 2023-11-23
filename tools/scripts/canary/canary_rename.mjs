import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { writeJsonFile, readJsonFile } = require('@nx/devkit');

export async function renameForCanary() {
  const originalPackageJson = readJsonFile('package.json');

  writeJsonFile('package.json', {
    ...originalPackageJson,
    name: adjustPackageName(originalPackageJson.name),
    peerDependencies: mapValues(
      originalPackageJson.peerDependencies ?? {},
      (version, name) =>
        name.includes('@farfetched')
          ? `npm:${adjustPackageName(name)}@${version}`
          : version
    ),
  });
}

// utils

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
