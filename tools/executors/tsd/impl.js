const tsd = require('tsd').default;
const path = require('path');
const chalk = require('chalk');

module.exports = async function tsdExecutor(options, context) {
  const project = context.workspace.projects[context.projectName];

  const diagnostics = await tsd({
    cwd: path.join(context.cwd, project.root),
    typingsFile: './src/index.ts',
    testFiles: '**/*.type_spec.ts',
  });

  const success = diagnostics.length === 0;

  if (!success) {
    for (const diagnostic of diagnostics) {
      console.error(
        chalk.red(
          `${diagnostic.fileName}:${diagnostic.line}:${diagnostic.column}`
        ),
        '\n',
        chalk.red(diagnostic.message),
        '\n'
      );
    }
  }

  return { success };
};
