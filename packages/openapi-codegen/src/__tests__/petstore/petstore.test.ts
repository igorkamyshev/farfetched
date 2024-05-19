import { it, expect } from 'vitest';

import { generateEndpoints } from '../../index';
import path, { resolve } from 'path';

it('generates working code', async () => {
  const result = await generateEndpoints({
    schemaFile: resolve(__dirname, './petstore.yaml'),
    apiFile: './test.ts',
    outputFile: './src/test.ts',
  });

  expect(result).toMatchFileSnapshot('./petstore.ts');
});
