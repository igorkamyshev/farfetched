import path, { join } from 'node:path';
import { parseArgs } from 'node:util';
import { rmdir } from 'node:fs/promises';
import dts from 'rollup-plugin-dts';
import { rollup } from 'rollup';

const args = parseArgs({ options: { package: { type: 'string' } } });

const inputDir = path.join('dist', 'packages', args.values.package);

const inputFile = path.join(inputDir, 'index.d.ts');
const outputFile = inputFile;

const bundle = await rollup({
  input: inputFile,
  plugins: [dts()],
});

await bundle.write({ file: outputFile, format: 'es' });
await rmdir(join(inputDir, 'src'), { recursive: true });
