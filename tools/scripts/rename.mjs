import { writeJsonFile, readJsonFile } from '@nrwl/devkit';
import { readFile, writeFile } from 'fs/promises';

export async function renameForGitHub() {
  const originalPackageJson = readJsonFile('package.json');

  writeJsonFile('package.json', {
    ...originalPackageJson,
    name: adjustPackageName(originalPackageJson.name),
    peerDependencies: mapKeys(
      originalPackageJson.peerDependencies ?? {},
      adjustPackageName
    ),
  });

  const files = [
    [
      originalPackageJson.module,
      originalPackageJson.main,
      originalPackageJson.types,
    ],
    Object.values(originalPackageJson.exports['.']),
  ].flat();

  await Promise.all(
    files.map(async (fileName) => {
      const content = await readFile(fileName, 'utf-8');

      await writeFile(fileName, adjustPackageName(content));
    })
  );
}

// utils

function adjustPackageName(name) {
  return name.replaceAll('@farfetched/', '@igorkamyshev/farfetched-');
}

export function mapKeys(val, fn) {
  const mappedEntries = Object.entries(val).map(([key, value]) => [
    fn(key),
    value,
  ]);

  return Object.fromEntries(mappedEntries);
}
