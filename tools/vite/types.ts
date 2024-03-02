import dts from 'vite-plugin-dts';
import { readdir, copyFile } from 'node:fs/promises';
import * as path from 'node:path';

export default function typesPlugin() {
  return dts({
    entryRoot: 'src',
    tsConfigFilePath: 'tsconfig.json',
    skipDiagnostics: true,
    rollupTypes: true,
    async afterBuild() {
      const files = await readdir('dist');
      const dtsFiles = files.filter((file) => file.endsWith('.d.ts'));
      await Promise.all(
        dtsFiles.map((file) =>
          copyFile(
            path.join('dist', file),
            path.join('dist', file.replace('.d.ts', '.d.cts'))
          )
        )
      );
    },
  });
}
