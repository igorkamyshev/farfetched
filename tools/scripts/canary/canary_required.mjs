import { join } from 'node:path';
import { readFile } from 'node:fs/promises';

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

const { changesets: usedChangesets } = await readFile(
  join(process.cwd(), '.changeset', 'pre.json'),
  'utf-8'
).then(JSON.parse);

previousChangesets.sort();
usedChangesets.sort();

const skipCanary = isArraysEquals(previousChangesets, usedChangesets)
  ? 'skip'
  : '';

console.log(`previousChangesets="${JSON.stringify(previousChangesets)}"`);
console.log(`usedChangesets="${JSON.stringify(usedChangesets)}"`);
console.log(`skipCanary=${skipCanary}`);

// utils

function isArraysEquals(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((item, index) => item === b[index]);
}
