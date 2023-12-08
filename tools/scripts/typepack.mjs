import path from 'node:path';
import { parseArgs } from 'node:util';
import { rmdir } from 'node:fs/promises';
import dts from 'rollup-plugin-dts';
import { rollup } from 'rollup';
import { createRequire } from 'node:module';

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
await rmdir(path.join(inputDir, 'src'), { recursive: true });
