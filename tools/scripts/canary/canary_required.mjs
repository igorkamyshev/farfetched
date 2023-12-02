import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { logger, readJsonFile } = require('@nx/devkit');

const [, , commentBody] = process.argv;

const LINE_START = 'Used changeset: ';

const previousChangesets = (
  commentBody
    .split('\n')
    .find((line) => line.includes(LINE_START))
    ?.replace(LINE_START, '') ?? '[]'
)
  .split(',')
  .map((changeset) => changeset.replaceAll('[', '').replaceAll(']', ''))
  .filter(Boolean);

const usedChangesets = readJsonFile(
  join(process.cwd(), '.changeset', 'pre.json')
).changesets;

previousChangesets.sort();
usedChangesets.sort();

const skipCanary = isArraysEquals(previousChangesets, usedChangesets)
  ? 'skip'
  : '';

logger.log(`previousChangesets="${JSON.stringify(previousChangesets)}"`);
logger.log(`usedChangesets="${JSON.stringify(usedChangesets)}"`);
logger.log(`skipCanary=${skipCanary}`);

// utils

function isArraysEquals(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((item, index) => item === b[index]);
}
