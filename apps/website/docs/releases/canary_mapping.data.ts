import { readdir, readFile, stat } from 'node:fs/promises';
import * as path from 'node:path';

export default {
  async load() {
    const PACKAGES_PATH = '../../packages';

    const inDirList = await readdir(PACKAGES_PATH);

    const packageNames: string[] = [];

    await Promise.all(
      inDirList.map(async (dir) => {
        const stats = await stat(`${PACKAGES_PATH}/${dir}`);
        if (!stats.isDirectory()) {
          return;
        }

        const packageJson = await readFile(
          path.join(PACKAGES_PATH, dir, 'package.json'),
          'utf-8'
        ).then(JSON.parse);

        packageNames.push(packageJson.name);
      })
    );

    return packageNames.map((packageName) => ({
      release: packageName,
      canary: packageName.replace('@farfetched', '@farfetched-canary'),
    }));
  },
};
