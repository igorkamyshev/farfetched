import { readFile, readdir, stat } from 'node:fs/promises';
import * as path from 'node:path';

export async function getPckagesInfo() {
  const [, , branch] = process.argv;

  console.log(`Canary name is ${branch}`);

  const PACKAGES_PATH = 'packages';

  const inDirList = await readdir(PACKAGES_PATH);

  const packages = [];

  await Promise.all(
    inDirList.map(async (dir) => {
      const stats = await stat(path.join(PACKAGES_PATH, dir));
      if (!stats.isDirectory()) {
        return;
      }

      const packageJson = await readFile(
        path.join(PACKAGES_PATH, dir, 'package.json'),
        'utf-8'
      ).then(JSON.parse);

      packages.push({
        name: packageJson.name.replace('@farfetched/', ''),
        root: path.join(PACKAGES_PATH, dir),
      });
    })
  );

  return packages;
}
