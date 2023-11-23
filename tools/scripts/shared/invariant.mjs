import { logger } from '@nrwl/devkit';

export function invariant(condition, message) {
  if (!condition) {
    logger.error(message);
    process.exit(1);
  }
}
