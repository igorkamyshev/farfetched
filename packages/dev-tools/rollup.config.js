const image = require('@rollup/plugin-image');

module.exports = (config) => ({
  ...config,
  plugins: [...config.plugins, image()],
});
