import { readFile, writeFile } from 'node:fs/promises';

export async function renameForCanary() {
  const originalPackageJson = await readFile('package.json', 'utf-8').then(
    JSON.parse
  );

  await writeFile(
    'package.json',
    JSON.stringify({
      ...originalPackageJson,
      name: adjustPackageName(originalPackageJson.name),
      peerDependencies: mapValues(
        originalPackageJson.peerDependencies ?? {},
        (version, name) =>
          name.includes('@farfetched')
            ? `npm:${adjustPackageName(name)}@${version}`
            : version
      ),
    })
  );
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
