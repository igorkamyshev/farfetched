import {
  readCachedProjectGraph,
  logger,
  readJsonFile,
  writeJsonFile,
} from '@nrwl/devkit';
import { spawnSync } from 'child_process';

import { renameForCanary } from './canary/canary_rename.mjs';
import { invariant } from './shared/invariant.mjs';

const [, , name, renameOption] = process.argv;
const graph = readCachedProjectGraph();

const shouldRenameForCanary = renameOption === '--rename=canary';

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
  license: 'MIT',
  repository: 'https://github.com/igorkamyshev/farfetched',
});

const { version } = originalPackageJson;

// A simple SemVer validation to validate the version
const validVersion = /^\d+\.\d+\.\d+(-\w+\.\d+)?/;
invariant(
  version && validVersion.test(version),
  `No version provided or version did not match Semantic Versioning, expected: #.#.#-tag.# or #.#.#, got ${version}.`
);

if (shouldRenameForCanary) {
  await renameForCanary();
}

const result = spawnSync('npm', ['publish', '--json', '--access', 'public']);

const errorInfo = getLastJsonObjectFromString(result.stderr.toString());

if (errorInfo) {
  logger.warn('Skip publishing\n');
  logger.warn(errorInfo.error.summary);
} else {
  logger.info(result.stdout.toString());
  logger.log('Published successfully');
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
