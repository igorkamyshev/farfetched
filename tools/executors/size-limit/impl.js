const sizeLimit = require('size-limit');
const filePlugin = require('@size-limit/file');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const path = require('path');
const bytes = require('bytes-iec');
const { logger } = require('@nrwl/devkit');

module.exports = async function sizeLimitExecutor(
  { outputPath, limit },
  context
) {
  const files = await glob(path.join(context.cwd, outputPath, '**/*.js'));

  const [{ size }] = await sizeLimit([filePlugin], files);

  const success = size <= bytes.parse(limit);

  if (!success) {
    logger.error('Size limit exceeded:');
    logger.error(`  current size: ${bytes.format(size)}`);
    logger.error(`  limit: ${limit}`);
  }

  return { success };
};
