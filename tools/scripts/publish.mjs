import { readCachedProjectGraph, logger, readJsonFile } from '@nrwl/devkit';
import { execSync } from 'child_process';
import chalk from 'chalk';

function invariant(condition, message) {
  if (!condition) {
    logger.error(chalk.bold.red(message));
    process.exit(1);
  }
}

const { version } = readJsonFile(`package.json`);

const [, , name] = process.argv;

// A simple SemVer validation to validate the version
const validVersion = /^\d+\.\d+\.\d+(-\w+\.\d+)?/;
invariant(
  version && validVersion.test(version),
  `No version provided or version did not match Semantic Versioning, expected: #.#.#-tag.# or #.#.#, got ${version}.`
);

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

execSync(`pnpm publish --access public`, { stdio: 'inherit' });
