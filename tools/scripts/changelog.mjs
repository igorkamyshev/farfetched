import glob from 'glob';
import { resolve, sep } from 'path';
import { copyFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const files = await promisify(glob)('packages/*/CHANGELOG.md', {
  absolute: true,
});

await Promise.all(
  files.map(async (source) => {
    const name = source.split(sep).at(-2);
    const target = resolve('apps/website/docs/changelog', `${name}.md`);

    await copyFile(source, target);
  })
);
