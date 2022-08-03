import {
  readCachedProjectGraph,
  logger,
  readJsonFile,
  writeJsonFile,
} from '@nrwl/devkit';
import { spawnSync } from 'child_process';
import chalk from 'chalk';

const [, , name] = process.argv;
const graph = readCachedProjectGraph();

const project = graph.nodes[name];
invariant(
  project,
  `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`
);

const outputPath = project.data?.targets?.build?.options?.outputPath;
invariant(
  outputPath,
  `Could not find "build.options.outputPath" of project "${name}". Is project.json configured  correctly?`
);

process.chdir(outputPath);

const originalPackageJson = readJsonFile(`package.json`);

writeJsonFile('package.json', {
  ...originalPackageJson,
  publishConfig: { access: 'public' },
});

const { version } = originalPackageJson;

// A simple SemVer validation to validate the version
const validVersion = /^\d+\.\d+\.\d+(-\w+\.\d+)?/;
invariant(
  version && validVersion.test(version),
  `No version provided or version did not match Semantic Versioning, expected: #.#.#-tag.# or #.#.#, got ${version}.`
);

const result = spawnSync('npm', ['publish', '--json']);

if (result.stderr.toString()) {
  const errorInfo = getLastJsonObjectFromString(result.stderr.toString());
  logger.warn('Skip publishing\n');
  logger.warn(errorInfo.error.summary);
} else {
  logger.info(result.stdout.toString());
  logger.info(chalk.green('Published successfully'));
}

// utils

function getLastJsonObjectFromString(str) {
  str = str.replace(/[^}]*$/, '');

  while (str) {
    str = str.replace(/[^{]*/, '');

    try {
      return JSON.parse(str);
    } catch (err) {
      // move past the potentially leading `{` so the regexp in the loop can try to match for the next `{`
      str = str.slice(1);
    }
  }
  return null;
}

function invariant(condition, message) {
  if (!condition) {
    logger.error(chalk.bold.red(message));
    process.exit(1);
  }
}
