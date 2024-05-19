import * as prettier from 'prettier';

export async function prettify(
  filePath: string | null,
  content: string
): Promise<string> {
  let config = null;

  if (filePath) {
    config = await prettier.resolveConfig(process.cwd(), {
      useCache: true,
      editorconfig: true,
    });
  }

  return prettier.format(content, {
    parser: 'typescript',
    ...config,
  });
}
