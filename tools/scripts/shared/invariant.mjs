import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { logger } = require('@nx/devkit');

export function invariant(condition, message) {
  if (!condition) {
    logger.error(message);
    process.exit(1);
  }
}
