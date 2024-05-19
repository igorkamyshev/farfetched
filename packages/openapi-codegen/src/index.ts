import OASNormalize from 'oas-normalize';
import * as prettier from 'prettier';
import Oas from 'oas';
import { generateQueries } from './lib/generator';

type GenerationOptions = {
  schemaFile: string;
  apiFile: string;
  outputFile: string;
};

export async function generateEndpoints(
  options: GenerationOptions
): Promise<string | void> {
  const oasNormalize = new OASNormalize(options.schemaFile, {
    enablePaths: true,
  });

  const oasContent = await oasNormalize.validate();

  const oas = new Oas(oasContent);

  await oas.dereference();

  const sourceCode = generateQueries(oas);

  if (!sourceCode) {
    return;
  }

  const outputFile = options.outputFile;

  return prettier.format(sourceCode, { parser: 'typescript' });
}
