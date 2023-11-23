import { logger, readJsonFile } from '@nrwl/devkit';
import { join } from 'path';

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

logger.log(`previousChangesets="${JSON.stringify(previousChangesets)}"`);
logger.log(`usedChangesets="${JSON.stringify(usedChangesets)}"`);
