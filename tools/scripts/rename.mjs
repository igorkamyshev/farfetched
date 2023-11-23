import { writeJsonFile, readJsonFile } from '@nrwl/devkit';

export async function renameForGitHub() {
  const originalPackageJson = readJsonFile('package.json');

  writeJsonFile('package.json', {
    ...originalPackageJson,
    name: adjustPackageName(originalPackageJson.name),
    peerDependencies: mapValues(
      originalPackageJson.peerDependencies ?? {},
      (version, name) => `npm:${adjustPackageName(name)}@${version},`
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
