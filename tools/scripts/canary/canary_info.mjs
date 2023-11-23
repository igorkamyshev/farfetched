import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { createProjectGraphAsync, logger, readJsonFile } = require('@nx/devkit');

const graph = await createProjectGraphAsync();

const packages = Object.entries(graph.nodes)
  .filter(([_name, { type, data }]) => type === 'lib' && data.targets.publish)
  .map(([name, { data }]) => ({ name, root: data.root }));

const { root } = packages.at(0);
const packageJsonPath = join(process.cwd(), root, 'package.json');

const canaryVersion = readJsonFile(packageJsonPath).version;

const usedChangesets = readJsonFile(
  join(process.cwd(), '.changeset', 'pre.json')
).changesets;

logger.log(`canaryVersion="${canaryVersion}"`);
logger.log(`usedChangesets="${JSON.stringify(usedChangesets)}"`);
