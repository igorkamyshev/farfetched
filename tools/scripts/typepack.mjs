import path from 'node:path';
import { parseArgs, promisify } from 'node:util';
import { unlink } from 'node:fs/promises';
import dts from 'rollup-plugin-dts';
import { rollup } from 'rollup';
import { createRequire } from 'node:module';
import rawGlob from 'glob';

const glob = promisify(rawGlob);

const require = createRequire(import.meta.url);

const { readCachedProjectGraph } = require('@nx/devkit');

const args = parseArgs({
  options: {
    package: { type: 'string' },
    typings: { type: 'string', default: 'index.cjs.d.ts' },
  },
});

const inputDir = path.join('dist', 'packages', args.values.package);

const inputFile = path.join(inputDir, args.values.typings);
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

const allInInput = await glob(path.join(inputDir, '**/*.d.ts'), {
  ignore: inputFile,
});

await Promise.all(allInInput.map(unlink));
