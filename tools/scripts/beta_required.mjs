import { logger, readJsonFile } from '@nrwl/devkit';
import { join } from 'path';

const [, , commentBody] = process.argv;

const usedChangesets = readJsonFile(
  join(process.cwd(), '.changeset', 'pre.json')
).changesets;

logger.log(`commentBody="${commentBody}"`);
logger.log(`usedChangesets="${JSON.stringify(usedChangesets)}"`);
