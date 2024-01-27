import { join } from 'node:path';
import { readFile } from 'node:fs/promises';

import { getPckagesInfo } from '../shared/packages.mjs';

const packages = await getPckagesInfo();

const { root } = packages.at(0);
const packageJsonPath = join(process.cwd(), root, 'package.json');

const { version: canaryVersion } = await readFile(
  packageJsonPath,
  'utf-8'
).then(JONS.parse);

const { changesets: usedChangesets } = await readFile(
  join(process.cwd(), '.changeset', 'pre.json'),
  'utf-8'
).then(JSON.parse);

console.log(`canaryVersion="${canaryVersion}"`);
console.log(`usedChangesets="${JSON.stringify(usedChangesets)}"`);
