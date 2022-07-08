const sizeLimit = require('size-limit');
const filePlugin = require('@size-limit/file');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const path = require('path');
const bytes = require('bytes-iec');
const chalk = require('chalk');

module.exports = async function sizeLimitExecutor(
  { outputPath, limit },
  context
) {
  const files = await glob(path.join(context.cwd, outputPath, '**/*.js'));

  const [{ size }] = await sizeLimit([filePlugin], files);

  const success = size <= bytes.parse(limit);

  if (!success) {
    console.log(chalk.red('Size limit exceeded:'));
    console.log(chalk.red(`  current size: ${bytes.format(size)}`));
    console.log(chalk.red(`  limit: ${limit}`));
  }

  return { success };
};
