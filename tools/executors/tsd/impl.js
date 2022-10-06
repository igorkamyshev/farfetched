const tsd = require('tsd').default;
const path = require('path');
const { logger } = require('@nrwl/devkit');

module.exports = async function tsdExecutor(options, context) {
  const project = context.workspace.projects[context.projectName];

  const diagnostics = await tsd({
    cwd: path.join(context.cwd, project.root),
    typingsFile: './index.ts',
    testFiles: '**/*.type_spec.ts',
  });

  const success = diagnostics.length === 0;

  if (!success) {
    for (const diagnostic of diagnostics) {
      logger.error(
        `${diagnostic.fileName}:${diagnostic.line}:${diagnostic.column}`,
        '\n',
        diagnostic.message,
        '\n'
      );
    }
  }

  return { success };
};
