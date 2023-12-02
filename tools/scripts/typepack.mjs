import path from 'node:path';
import { parseArgs } from 'node:util';
import { rmdir } from 'node:fs/promises';
import dts from 'rollup-plugin-dts';
import { rollup } from 'rollup';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
  readCachedProjectGraph,
  readJsonFile,
  writeJsonFile,
} = require('@nx/devkit');

const args = parseArgs({ options: { package: { type: 'string' } } });

const TYPINGS_FILE_NAME = 'index.cjs.d.ts';

const inputDir = path.join('dist', 'packages', args.values.package);

const inputFile = path.join(inputDir, TYPINGS_FILE_NAME);
const outputFile = inputFile;

const external = Object.values(readCachedProjectGraph().nodes)
  .filter((node) => node.type === 'lib')
  .map((node) => `@farfetched/${node.name}`);

const bundle = await rollup({
  input: inputFile,
  plugins: [dts()],
  external,
});

await bundle.write({ file: outputFile, format: 'es' });
await rmdir(path.join(inputDir, 'src'), { recursive: true });

const originalPackageJson = readJsonFile(path.join(inputDir, 'package.json'));

writeJsonFile(path.join(inputDir, 'package.json'), {
  ...originalPackageJson,
  types: `./${TYPINGS_FILE_NAME}`,
  exports: mapValues(originalPackageJson.exports ?? {}, (value) =>
    typeof value === 'object'
      ? {
          ...value,
          types: `./${TYPINGS_FILE_NAME}`,
        }
      : value
  ),
});

export function mapValues(val, fn) {
  const mappedEntries = Object.entries(val).map(([key, value]) => [
    key,
    fn(value, key),
  ]);

  return Object.fromEntries(mappedEntries);
}
