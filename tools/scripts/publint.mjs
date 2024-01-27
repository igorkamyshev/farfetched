import { publint } from 'publint';
import { formatMessage } from 'publint/utils';
import fs from 'node:fs/promises';

const { messages } = await publint({
  pkgDir: '.',
  strict: true,
});

if (messages.length) {
  const pkg = await fs.readFile('package.json', 'utf8').then(JSON.parse);

  for (const message of messages) {
    console.log(formatMessage(message, pkg));
  }
  process.exit(1);
}
