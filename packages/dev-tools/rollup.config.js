const replace = require('@rollup/plugin-replace');

module.exports = function (rawConfig) {
  return {
    ...rawConfig,
    external: ['effector', '@farfetched/core'],
    plugins: [
      ...rawConfig.plugins,
      // effector-react has weird import of effector/effector.mjs
      // https://github.com/effector/effector/issues/879
      replace({
        values: { 'effector/effector.mjs': 'effector' },
        preventAssignment: true,
      }),
    ],
  };
};
